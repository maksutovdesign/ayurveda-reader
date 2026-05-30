/**
 * Авторизация через Telegram Login Widget + stateless-сессии.
 * Проверка подписи и подпись сессий — по BOT_TOKEN (HMAC-SHA256).
 * Никаких внешних зависимостей: только встроенный crypto.
 */
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

/** Список Telegram-id с заданной ролью из env (через запятую) */
function idsFromEnv(name) {
  return new Set(
    (process.env[name] || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  );
}

export const ADMIN_IDS  = idsFromEnv('ADMIN_TG_IDS');
export const EXPERT_IDS = idsFromEnv('EXPERT_TG_IDS');

/**
 * Проверяет payload Telegram Login Widget.
 * @returns {object|null} данные пользователя без hash, либо null если подпись неверна
 */
export function verifyTelegramLogin(data) {
  if (!BOT_TOKEN || !data || !data.hash) return null;

  // auth_date не старше 24 часов
  const authDate = Number(data.auth_date || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;

  const { hash, ...fields } = data;
  const checkString = Object.keys(fields)
    .sort()
    .map(k => `${k}=${fields[k]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  // Сравнение в постоянное время
  if (computed.length !== String(hash).length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(String(hash)))) return null;

  return fields;
}

/** Определяет роль по Telegram-id (+ опциональный набор экспертов из KV) */
export function roleFor(tgId, extraExpertIds = new Set()) {
  const id = String(tgId);
  if (ADMIN_IDS.has(id)) return 'admin';
  if (EXPERT_IDS.has(id) || extraExpertIds.has(id)) return 'expert';
  return 'user';
}

const b64url = buf => Buffer.from(buf).toString('base64url');

/** Создаёт stateless-токен сессии: payload.signature (HMAC по BOT_TOKEN) */
export function createSession(user, ttlSec = 30 * 24 * 3600) {
  const payload = {
    tgId: String(user.id ?? user.tgId),
    name: user.first_name || user.name || '',
    username: user.username || '',
    role: user.role || 'user',
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', BOT_TOKEN).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Проверяет токен сессии. @returns {object|null} payload или null */
export function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', BOT_TOKEN).update(body).digest('base64url');
  if (expected.length !== sig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString()); }
  catch { return null; }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/** Достаёт токен из заголовка Authorization: Bearer <token> */
export function tokenFromReq(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  const m = /^Bearer\s+(.+)$/.exec(auth);
  return m ? m[1] : null;
}
