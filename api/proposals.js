/**
 * /api/proposals
 *   POST                — создать правку (вошедший пользователь)
 *   GET   ?status=pending — список правок (только админ)
 *   POST  ?action=review  — одобрить/отклонить (только админ)
 *
 * Одобрение пишет значение в override:<...>, которое затем отдаёт /api/overrides.
 */
import { verifySession, tokenFromReq } from '../lib/auth.js';
import {
  kvEnabled, kvGet, kvSet, kvSAdd, kvSRem, kvSMembers, kvMGet,
} from '../lib/kv.js';

function overrideKey(p) {
  return `override:${p.bookId}:${p.sthana}:${p.chapter}:${p.verseNumber}:${p.field}`;
}

const ARTICLE_COLLECTIONS = ['encyclopedia', 'glossary', 'remedies'];

// Проверка и нормализация payload новой статьи. Возвращает объект или null.
function sanitizeArticle(collection, p) {
  const s = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  if (collection === 'glossary') {
    const term = s(p.term, 120), def = s(p.def, 2000);
    return term && def ? { term, origin: s(p.origin, 120), def } : null;
  }
  if (collection === 'remedies') {
    const name = s(p.name, 160), content = s(p.content, 6000);
    return name && content ? { name, content } : null;
  }
  if (collection === 'encyclopedia') {
    const title = s(p.title, 200), body = s(p.body, 8000);
    return title && body ? { title, summary: s(p.summary, 400), body } : null;
  }
  return null;
}

export default async function handler(req, res) {
  const session = verifySession(tokenFromReq(req));
  if (!session) return res.status(401).json({ error: 'Не авторизован' });
  if (!kvEnabled) return res.status(503).json({ error: 'Хранилище не настроено (Vercel KV)' });

  const action = req.query?.action;

  // ── Одобрение/отклонение (админ) ──
  if (req.method === 'POST' && action === 'review') {
    if (session.role !== 'admin') return res.status(403).json({ error: 'Только для админа' });
    const { id, decision } = req.body || {};
    const p = await kvGet(`proposal:${id}`);
    if (!p) return res.status(404).json({ error: 'Правка не найдена' });

    p.status = decision === 'approve' ? 'approved' : 'rejected';
    p.reviewedAt = Date.now();
    p.reviewedBy = session.tgId;
    await kvSet(`proposal:${id}`, p);
    await kvSRem('proposals:pending', id);

    if (p.status === 'approved') {
      if (p.kind === 'article') {
        await kvSet(`article:${p.collection}:${p.id}`, { id: p.id, payload: p.payload, by: p.tgName, at: p.reviewedAt });
        await kvSAdd(`articles:${p.collection}`, p.id);
      } else {
        await kvSet(overrideKey(p), { value: p.newValue, by: p.tgName, at: p.reviewedAt });
      }
    }
    return res.status(200).json({ ok: true, status: p.status });
  }

  // ── Создать правку (любой вошедший) ──
  if (req.method === 'POST') {
    const b = req.body || {};

    // Заявка на новую статью (энциклопедия / глоссарий / домашние средства)
    if (b.kind === 'article') {
      if (!ARTICLE_COLLECTIONS.includes(b.collection)) {
        return res.status(400).json({ error: 'Недопустимая коллекция' });
      }
      const payload = sanitizeArticle(b.collection, b.payload || {});
      if (!payload) return res.status(400).json({ error: 'Заполните обязательные поля статьи' });
      const id = `${Date.now()}_${session.tgId}_${Math.floor(Date.now() % 100000)}`;
      const proposal = {
        id, kind: 'article', collection: b.collection, payload,
        tgId: session.tgId,
        tgName: session.name + (session.username ? ` (@${session.username})` : ''),
        role: session.role,
        comment: String(b.comment || ''),
        status: 'pending', createdAt: Date.now(),
      };
      await kvSet(`proposal:${id}`, proposal);
      await kvSAdd('proposals:pending', id);
      await kvSAdd('proposals:all', id);
      return res.status(200).json({ ok: true, id });
    }

    const required = ['bookId', 'sthana', 'chapter', 'verseNumber', 'field', 'newValue'];
    for (const k of required) {
      if (b[k] === undefined || b[k] === null || b[k] === '') {
        return res.status(400).json({ error: `Не заполнено поле: ${k}` });
      }
    }
    if (!['translation', 'text', 'iast', 'sanskrit', 'comment'].includes(b.field)) {
      return res.status(400).json({ error: 'Недопустимое поле' });
    }
    if (String(b.newValue).length > 5000) {
      return res.status(400).json({ error: 'Слишком длинный текст' });
    }

    const id = `${Date.now()}_${session.tgId}_${Math.floor((Date.now() % 100000))}`;
    const proposal = {
      id,
      tgId: session.tgId,
      tgName: session.name + (session.username ? ` (@${session.username})` : ''),
      role: session.role,
      bookId: String(b.bookId),
      sthana: String(b.sthana),
      chapter: Number(b.chapter),
      verseNumber: String(b.verseNumber),
      field: b.field,
      oldValue: String(b.oldValue || ''),
      newValue: String(b.newValue),
      comment: String(b.comment || ''),
      status: 'pending',
      createdAt: Date.now(),
    };
    await kvSet(`proposal:${id}`, proposal);
    await kvSAdd('proposals:pending', id);
    await kvSAdd('proposals:all', id);
    return res.status(200).json({ ok: true, id });
  }

  // ── Список ожидающих (админ) ──
  if (req.method === 'GET') {
    if (session.role !== 'admin') return res.status(403).json({ error: 'Только для админа' });
    const ids = await kvSMembers('proposals:pending');
    if (!ids.length) return res.status(200).json({ proposals: [] });
    const items = await kvMGet(ids.map(id => `proposal:${id}`));
    const proposals = items.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
    return res.status(200).json({ proposals });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
