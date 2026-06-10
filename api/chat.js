/**
 * POST /api/chat
 * AI-чатбот по аюрведе на базе Google Gemini (бесплатный тариф).
 * Принимает вопрос + контекст (релевантные стихи найденные на клиенте).
 * Возвращает stream ответа.
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `Ты — учёный-аюрведовед, глубокий знаток классических санскритских трактатов.
Твоя задача — отвечать на вопросы по Аюрведе, опираясь ТОЛЬКО на предоставленный контекст из первоисточников.

Правила:
1. Отвечай на русском языке.
2. Давай развёрнутую интерпретацию, объясняй санскритские термины.
3. Ссылайся на конкретные стихи: «Аштанга-хридая, Сутрастхана 1.5» и т.д.
4. Если в контексте нет информации для ответа — честно скажи об этом.
5. Не выдумывай — используй только предоставленные тексты.
6. Формат: markdown, но без огромных блоков кода.
7. Будь дружелюбен и понятен для начинающих.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { question, context, history } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }

  // Собираем промпт
  const contextBlock = context
    ? `\n\nКонтекст из первоисточников:\n${context.substring(0, 12000)}`
    : '';

  const chatHistory = (history || []).slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  const contents = [
    ...chatHistory,
    {
      role: 'user',
      parts: [{ text: `${question}${contextBlock}` }],
    },
  ];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', geminiRes.status, err);
      return res.status(502).json({ error: 'AI service error', detail: geminiRes.status });
    }

    // Stream SSE ответ клиенту
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (!json || json === '[DONE]') continue;

        try {
          const parsed = JSON.parse(json);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch {}
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat API error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal error' });
    }
    res.end();
  }
}
