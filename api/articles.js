/**
 * GET /api/articles?collection=encyclopedia|glossary|remedies
 * Возвращает одобренные статьи сообщества для наложения поверх статических данных.
 * Без KV — пустой список (сайт работает на статике).
 */
import { kvEnabled, kvSMembers, kvMGet } from '../lib/kv.js';

const COLLECTIONS = ['encyclopedia', 'glossary', 'remedies'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const collection = req.query?.collection;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'bad collection' });
  if (!kvEnabled) return res.status(200).json({ articles: [] });

  try {
    const ids = await kvSMembers(`articles:${collection}`);
    if (!ids.length) return res.status(200).json({ articles: [] });
    const items = await kvMGet(ids.map(id => `article:${collection}:${id}`));
    const articles = items
      .filter(Boolean)
      .sort((a, b) => (a.at || 0) - (b.at || 0))
      .map(it => ({ ...it.payload, _by: it.by, _id: it.id, _community: true }));
    return res.status(200).json({ articles });
  } catch (e) {
    return res.status(200).json({ articles: [], error: String(e.message || e) });
  }
}
