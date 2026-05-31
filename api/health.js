/**
 * GET /api/health — диагностика активации (что настроено).
 * Возвращает ТОЛЬКО булевы флаги и счётчики — никаких значений секретов.
 * Помогает после настройки env проверить, какие возможности включились.
 */
import { kvEnabled } from '../lib/kv.js';
import { yooEnabled } from '../lib/yookassa.js';
import { ADMIN_IDS, EXPERT_IDS } from '../lib/auth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const has = v => Boolean(process.env[v]);
  const listCount = v => (process.env[v] || '').split(',').map(s => s.trim()).filter(Boolean).length;

  const features = {
    botToken:          has('BOT_TOKEN'),
    sessionSecret:     has('BOT_TOKEN') || has('SESSION_SECRET'),
    kv:                kvEnabled,
    payments:          yooEnabled,
    channelId:         has('CHANNEL_ID'),
    dailyPostKey:      has('DAILY_POST_KEY'),
    webhookSecret:     has('WEBHOOK_SECRET'),
    contentProtection: process.env.CONTENT_PROTECTION === '1',
    testLogin:         process.env.TEST_LOGIN === '1',
  };

  const roles = {
    admins:         ADMIN_IDS.size,
    experts:        EXPERT_IDS.size,
    testFullAccess: listCount('TEST_FULL_TG_IDS'),
  };

  // Готовность возможностей (что реально заработает при текущих env)
  const capabilities = {
    expertCabinet:          features.botToken && features.kv,   // вход + правки/переводы + модерация
    monetization:           features.payments && features.kv,   // витрина + права после оплаты
    recurringSubscriptions: features.payments && features.kv,   // + нужен 3-й крон (Vercel Pro)
    hardContentProtection:  features.contentProtection && features.kv,
    botChannelPosts:        features.botToken && features.channelId,
    testCabinet:            features.testLogin,
  };

  const warnings = [];
  if (features.testLogin)
    warnings.push('TEST_LOGIN=1 включён — тест-вход с полным доступом активен. НЕ оставляйте на публичном проде.');
  if (features.payments && !features.kv)
    warnings.push('YooKassa настроена, но KV отсутствует — права после оплаты негде хранить.');
  if (features.contentProtection && !features.kv)
    warnings.push('CONTENT_PROTECTION=1, но KV отсутствует — жёсткая защита/доступ не заработают.');
  if (features.botToken && !features.webhookSecret)
    warnings.push('BOT_TOKEN задан, но WEBHOOK_SECRET нет — эндпоинт вебхука бота не защищён.');
  if (roles.admins === 0 && features.kv)
    warnings.push('ADMIN_TG_IDS пуст — модерировать правки будет некому.');

  return res.status(200).json({ ok: true, ts: Date.now(), features, roles, capabilities, warnings });
}
