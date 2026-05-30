/**
 * POST /api/sub-cancel
 * Отменяет автопродление подписки. Доступ сохраняется до конца оплаченного периода.
 */
import { verifySession, tokenFromReq } from '../lib/auth.js';
import { getEntitlements } from '../lib/entitlements.js';
import { kvSet, kvEnabled } from '../lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = verifySession(tokenFromReq(req));
  if (!session) return res.status(401).json({ error: 'Не авторизован' });
  if (!kvEnabled) return res.status(503).json({ error: 'Хранилище не настроено' });

  const ent = await getEntitlements(session.tgId);
  if (!ent.sub || !ent.sub.autoRenew) {
    return res.status(200).json({ ok: true, alreadyOff: true, sub: ent.sub || null });
  }
  ent.sub = { ...ent.sub, autoRenew: false };
  await kvSet(`ent:${session.tgId}`, ent);
  return res.status(200).json({ ok: true, sub: ent.sub });
}
