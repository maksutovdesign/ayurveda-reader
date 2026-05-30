/**
 * POST /api/auth-telegram
 * Принимает payload Telegram Login Widget, проверяет подпись,
 * определяет роль и возвращает stateless-токен сессии.
 */
import { verifyTelegramLogin, roleFor, createSession } from '../lib/auth.js';
import { kvSMembers, kvEnabled } from '../lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.BOT_TOKEN) {
    return res.status(500).json({ error: 'BOT_TOKEN not configured' });
  }

  const data = req.body || {};
  const user = verifyTelegramLogin(data);
  if (!user) {
    return res.status(401).json({ error: 'Invalid Telegram signature' });
  }

  // Эксперты из KV (если настроен) + из env
  let expertIds = new Set();
  if (kvEnabled) {
    try { expertIds = new Set((await kvSMembers('experts')).map(String)); } catch {}
  }

  const role = roleFor(user.id, expertIds);
  const token = createSession({ ...user, role });

  return res.status(200).json({
    token,
    user: {
      tgId: String(user.id),
      name: user.first_name || '',
      username: user.username || '',
      photo: user.photo_url || '',
      role,
    },
  });
}
