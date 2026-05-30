/**
 * GET /api/overrides?book=<bookId>
 * Возвращает одобренные правки книги для наложения поверх статических данных.
 * Формат: { "sthana|chapter|verseNumber|field": "value", ... }
 * Если KV не настроен — пустой объект (сайт работает на статике).
 */
import { kvEnabled, kvSMembers, kvMGet } from '../lib/kv.js';

export default async function handler(req, res) {
  // Кешируем на 60с на CDN — правки появляются почти сразу, нагрузка низкая
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const book = req.query?.book;
  if (!book) return res.status(400).json({ error: 'book required' });
  if (!kvEnabled) return res.status(200).json({ overrides: {} });

  try {
    // Одобренные правки хранятся как approved proposals; собираем по proposals:all
    const ids = await kvSMembers('proposals:all');
    if (!ids.length) return res.status(200).json({ overrides: {} });
    const items = await kvMGet(ids.map(id => `proposal:${id}`));
    const values = {};   // key -> newValue
    const stamps = {};    // key -> reviewedAt (для выбора последней правки)
    for (const p of items) {
      if (!p || p.status !== 'approved' || String(p.bookId) !== String(book)) continue;
      const key = `${p.sthana}|${p.chapter}|${p.verseNumber}|${p.field}`;
      const at = p.reviewedAt || 0;
      if (stamps[key] === undefined || at > stamps[key]) {
        values[key] = p.newValue;
        stamps[key] = at;
      }
    }
    return res.status(200).json({ overrides: values });
  } catch (e) {
    return res.status(200).json({ overrides: {}, error: String(e.message || e) });
  }
}
