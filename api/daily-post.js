/**
 * Ежедневный пост в Telegram-канал @AyurvedaReader
 * Вызывается автоматически Vercel Cron (каждый день в 16:00 UTC = 19:00 МСК)
 *
 * Чередует 3 типа постов:
 *   день % 3 === 0 → стих из Аштанга-хридая-самхиты
 *   день % 3 === 1 → статья из Энциклопедии
 *   день % 3 === 2 → домашнее средство
 *
 * Контент не повторяется: позиция определяется номером дня.
 */

import { BOOK_DATA }  from '../data.js';
import { ENCYCLOPEDIA } from '../encyclopedia.js';
import { REMEDIES }   from '../remedies.js';

const BOT_TOKEN    = process.env.BOT_TOKEN;
const CHANNEL_ID   = process.env.CHANNEL_ID || '@AyurvedaReader';
const CRON_SECRET  = process.env.CRON_SECRET;
const BOT_USERNAME = '@AyurvedaReaderBot';

// ── Сбор данных ─────────────────────────────────────────────

function getAllVerses() {
  const out = [];
  for (const ch of BOOK_DATA.chapters) {
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
      if (art.content && art.content.length > 100) {
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

/** Обрезает текст по границе слова */
function truncate(text, max = 600) {
  const clean = text.replace(/\n{3,}/g, '\n\n').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf(' '));
  return (lastBreak > max * 0.75 ? cut.slice(0, lastBreak) : cut) + '…';
}

function pick(arr, dayNum) {
  return arr[Math.floor(dayNum / 3) % arr.length];
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
  return [
    `🔍 <b>${esc(article.title)}</b>`,
    `<i>${esc(section.title)}</i>`,
    ``,
    esc(truncate(article.content)),
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
  // Проверка секрета: Vercel cron передаёт CRON_SECRET автоматически,
  // либо можно вызвать вручную с ?key=DAILY_POST_KEY
  const auth     = req.headers['authorization'];
  const queryKey = req.query?.key;
  const cronOk   = CRON_SECRET && auth === `Bearer ${CRON_SECRET}`;
  const manualOk = queryKey && queryKey === process.env.DAILY_POST_KEY;
  if (!cronOk && !manualOk) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!BOT_TOKEN) return res.status(500).json({ error: 'Missing BOT_TOKEN' });
  if (!CHANNEL_ID) return res.status(500).json({ error: 'Missing CHANNEL_ID' });

  // Номер дня с эпохи (UTC) — определяет какой пост публиковать
  const dayNum = Math.floor(Date.now() / 86_400_000);
  const type   = dayNum % 3; // 0=стих, 1=энциклопедия, 2=средство

  let text;
  let postType;

  if (type === 0) {
    const verses = getAllVerses();
    text     = versePost(pick(verses, dayNum));
    postType = 'verse';
  } else if (type === 1) {
    const articles = getAllArticles();
    text     = encPost(pick(articles, dayNum));
    postType = 'encyclopedia';
  } else {
    text     = remedyPost(pick(REMEDIES, dayNum));
    postType = 'remedy';
  }

  // Отправка в канал
  const tgRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
    }
  );

  const tgData = await tgRes.json();

  if (!tgData.ok) {
    console.error('Telegram API error:', tgData);
    return res.status(500).json({ error: tgData.description });
  }

  console.log(`✅ Пост отправлен [${postType}] день ${dayNum}`);
  return res.status(200).json({ ok: true, type: postType, day: dayNum });
}
