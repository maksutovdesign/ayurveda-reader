/**
 * Ежедневный пост в Telegram-канал @AyurvedaReader
 *
 * Vercel Cron вызывает эндпоинт 3 раза в сутки:
 *   09:00 UTC (12:00 МСК) — стих / энциклопедия / средство
 *   14:00 UTC (17:00 МСК) — чередование
 *   18:00 UTC (21:00 МСК) — чередование
 *
 * Контент чередуется по типу: стих → энциклопедия → средство.
 * Позиция внутри типа определяется 8-часовым слотом эпохи,
 * поэтому повторов нет.
 *
 * Авторизация:
 *   – Vercel Cron автоматически добавляет заголовок x-vercel-cron: 1
 *   – Ручной вызов: ?key=DAILY_POST_KEY   (для тестов)
 */

import { BOOK_DATA }  from '../data.js';
import { ENCYCLOPEDIA } from '../encyclopedia.js';
import { REMEDIES }   from '../remedies.js';

const BOT_TOKEN    = process.env.BOT_TOKEN;
const CHANNEL_ID   = process.env.CHANNEL_ID || '@AyurvedaReader';
const BOT_USERNAME = '@AyurvedaReaderBot';

// ── Сбор данных ─────────────────────────────────────────────

function getAllVerses() {
  const out = [];
  for (const ch of BOOK_DATA.chapters) {
    if (!ch.content || !Array.isArray(ch.content)) continue;
    for (const block of ch.content) {
      if (block.type === 'verse' && block.text && block.text.trim().length > 60) {
        out.push({ verse: block, chapter: ch });
      }
    }
  }
  return out;
}

function getAllArticles() {
  const out = [];
  for (const sec of ENCYCLOPEDIA) {
    for (const art of sec.articles) {
      const text = String(art.content || art.body || '');
      if (text.length > 100) {
        out.push({ article: art, section: sec });
      }
    }
  }
  return out;
}

// ── Утилиты ─────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function truncate(text, max = 600) {
  const clean = String(text).replace(/\n{3,}/g, '\n\n').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf(' '));
  return (lastBreak > max * 0.75 ? cut.slice(0, lastBreak) : cut) + '…';
}

function pick(arr, slotNum) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(slotNum / 3) % arr.length];
}

// ── Форматирование постов ────────────────────────────────────

function versePost({ verse, chapter }) {
  const loc = chapter.subtitle
    ? `${esc(chapter.sthana)}, гл. ${chapter.number}: ${esc(chapter.subtitle)}`
    : `${esc(chapter.sthana)}, гл. ${chapter.number}`;

  return [
    `📖 <b>Слово мудрецов</b>`,
    ``,
    `«${esc(verse.text.trim())}»`,
    ``,
    `<i>Аштанга-хридая-самхита · ${loc}</i>`,
    ``,
    `🌿 Читать полную книгу: ${BOT_USERNAME}`,
  ].join('\n');
}

function encPost({ article, section }) {
  const text = String(article.content || article.body || '');
  return [
    `🔍 <b>${esc(article.title)}</b>`,
    `<i>${esc(section.title)}</i>`,
    ``,
    esc(truncate(text)),
    ``,
    `📚 Полная энциклопедия аюрведы: ${BOT_USERNAME}`,
  ].join('\n');
}

function remedyPost(remedy) {
  return [
    `🌿 <b>Домашние средства: ${esc(remedy.name)}</b>`,
    ``,
    esc(truncate(remedy.content)),
    ``,
    `💊 Все аюрведические средства: ${BOT_USERNAME}`,
  ].join('\n');
}

// ── Основной обработчик ──────────────────────────────────────

export default async function handler(req, res) {
  // ── Авторизация ──
  // 1. Vercel Cron отправляет x-vercel-cron: 1 автоматически
  // 2. Ручной вызов: ?key=DAILY_POST_KEY
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const queryKey     = req.query?.key;
  const manualOk     = queryKey && queryKey === process.env.DAILY_POST_KEY;

  if (!isVercelCron && !manualOk) {
    return res.status(401).json({
      error: 'Unauthorized',
      hint:  'Set DAILY_POST_KEY env var and call with ?key=YOUR_KEY for manual testing',
    });
  }

  if (!BOT_TOKEN) return res.status(500).json({ error: 'Missing BOT_TOKEN env var' });

  // ── Выбор контента ──
  // 8-часовой слот с эпохи: тип поста меняется каждый слот
  const slotNum  = Math.floor(Date.now() / (8 * 60 * 60 * 1000));
  const type     = slotNum % 3; // 0=стих, 1=энциклопедия, 2=средство

  let text;
  let postType;

  try {
    if (type === 0) {
      const verses = getAllVerses();
      const item   = pick(verses, slotNum);
      if (!item) throw new Error('No verses found');
      text     = versePost(item);
      postType = 'verse';
    } else if (type === 1) {
      const articles = getAllArticles();
      const item     = pick(articles, slotNum);
      if (!item) throw new Error('No articles found');
      text     = encPost(item);
      postType = 'encyclopedia';
    } else {
      const item = pick(REMEDIES, slotNum);
      if (!item) throw new Error('No remedies found');
      text     = remedyPost(item);
      postType = 'remedy';
    }
  } catch (err) {
    console.error('Content error:', err);
    return res.status(500).json({ error: err.message });
  }

  // ── Отправка в канал ──
  const tgRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chat_id:              CHANNEL_ID,
        text,
        parse_mode:           'HTML',
        link_preview_options: { is_disabled: true },
      }),
    }
  );

  const tgData = await tgRes.json();

  if (!tgData.ok) {
    console.error('Telegram API error:', tgData);
    return res.status(500).json({
      error:   tgData.description,
      channel: CHANNEL_ID,
    });
  }

  console.log(`✅ Пост отправлен [${postType}] слот ${slotNum}`);
  return res.status(200).json({ ok: true, type: postType, slot: slotNum });
}
