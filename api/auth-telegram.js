/**
 * POST /api/auth-telegram
 * Принимает payload Telegram Login Widget, проверяет подпись,
 * определяет роль и возвращает stateless-токен сессии.
 *
 * POST {mode:'dev'} — тестовый вход с полным доступом (бывший /api/dev-login),
 * работает ТОЛЬКО при TEST_LOGIN=1 (объединено сюда ради лимита Hobby ≤12 функций).
 */
import { verifyTelegramLogin, roleFor, createSession } from '../lib/auth.js';
import { kvSMembers, kvEnabled } from '../lib/kv.js';

const TEST_ADMIN_ID = 'test-admin';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body || {};

  // ── Тестовый вход (бывший /api/dev-login) ──
  // БЕЗОПАСНОСТЬ: только при TEST_LOGIN=1, иначе как будто не существует (404).
  if (data.mode === 'dev') {
    if (process.env.TEST_LOGIN !== '1') return res.status(404).json({ error: 'Not found' });
    const u = { id: TEST_ADMIN_ID, first_name: 'Тест', username: 'test_full_access', role: 'admin' };
    return res.status(200).json({
      token: createSession(u),
      user: { tgId: TEST_ADMIN_ID, name: 'Тест (полный доступ)', username: 'test_full_access', role: 'admin', photo: '' },
    });
  }

  if (!process.env.BOT_TOKEN) {
    return res.status(500).json({ error: 'BOT_TOKEN not configured' });
  }

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
