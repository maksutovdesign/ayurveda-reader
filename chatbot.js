/**
 * chatbot.js — AI-помощник по Аюрведе
 * Клиентский поиск по загруженным данным + Gemini API
 */

/**
 * Поиск релевантных стихов по ключевым словам.
 * Работает на данных, уже загруженных в браузер (BOOKS).
 */
export function searchContext(query, books, maxChunks = 15) {
  const terms = query
    .toLowerCase()
    .replace(/[^\wа-яёa-z\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  if (!terms.length) return '';

  const results = [];

  for (const book of books) {
    if (!book._loaded || !book.chapters) continue;

    for (const ch of book.chapters) {
      if (!ch.content || !ch.content.length) continue;

      for (const block of ch.content) {
        if (block.type !== 'text' && block.type !== 'verse' && block.type !== 'comment') continue;

        const haystack = [
          block.text || '',
          block.translation || '',
          block.english || '',
          block.iast || '',
        ].join(' ').toLowerCase();

        let score = 0;
        for (const t of terms) {
          if (haystack.includes(t)) score++;
        }

        if (score >= Math.max(1, Math.ceil(terms.length * 0.3))) {
          const ref = `${book.title}, ${ch.sthana || ''} ${ch.number || ''}.${block.number || ''}`.trim();
          const text = block.text || block.translation || '';
          if (text.length > 10) {
            results.push({ score, ref, text: text.substring(0, 400), type: block.type });
          }
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results
    .slice(0, maxChunks)
    .map(r => `[${r.ref}] (${r.type}): ${r.text}`)
    .join('\n\n');
}

/**
 * Отправка вопроса к API и получение стримингового ответа.
 */
export async function askQuestion(question, context, history, onChunk, onDone, onError) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context, history }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
      onError(err.error || `Ошибка ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
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
        const data = line.slice(6).trim();
        if (data === '[DONE]') { onDone(); return; }

        try {
          const parsed = JSON.parse(data);
          if (parsed.text) onChunk(parsed.text);
        } catch {}
      }
    }

    onDone();
  } catch (err) {
    onError('Нет соединения с сервером');
  }
}
