/**
 * server.js — автономный Node/Express-сервер для VPS (Beget и т.п.).
 *
 * Зачем: на Vercel API работает как serverless-функции (папка api/ + vercel.json).
 * На обычном VPS их запускает этот сервер: раздаёт статику, монтирует те же
 * обработчики api/* как маршруты и сам шлёт ежедневный пост в Telegram по cron.
 * Обработчики api/* НЕ меняются — их req/res-интерфейс совместим с Express.
 *
 * Запуск:  npm install && npm start      (PORT по умолчанию 3000)
 * Прод:    PM2 + Nginx (статика + проксирование /api на этот порт) — см. README.
 *
 * Env: те же, что на Vercel — BOT_TOKEN, CHANNEL_ID, DAILY_POST_KEY, WEBHOOK_SECRET,
 *      KV_REST_API_URL/TOKEN, YOOKASSA_*, ADMIN_TG_IDS, CONTENT_PROTECTION, CRON_SECRET.
 */
import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';

import authTelegram from './api/auth-telegram.js';
import bookData     from './api/book-data.js';
import dailyPost    from './api/daily-post.js';
import entitlements from './api/entitlements.js';
import health       from './api/health.js';
import overrides    from './api/overrides.js';
import payCreate    from './api/pay-create.js';
import payWebhook   from './api/pay-webhook.js';
import proposals    from './api/proposals.js';
import subCancel    from './api/sub-cancel.js';
// api/webhook.js НЕ подключаем: он импортирует бота (webhook-режим для Vercel).
// На VPS бот работает в режиме polling — запускайте отдельно: `npm run bot`.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Те же пути, что и на Vercel
const ROUTES = {
  '/api/auth-telegram': authTelegram,
  '/api/book-data':     bookData,
  '/api/daily-post':    dailyPost,
  '/api/entitlements':  entitlements,
  '/api/health':        health,
  '/api/overrides':     overrides,
  '/api/pay-create':    payCreate,
  '/api/pay-webhook':   payWebhook,
  '/api/proposals':     proposals,
  '/api/sub-cancel':    subCancel,
};
for (const [route, handler] of Object.entries(ROUTES)) {
  app.all(route, (req, res) => {
    Promise.resolve(handler(req, res)).catch(err => {
      console.error('API error', route, err);
      if (!res.headersSent) res.status(500).json({ error: 'server error' });
    });
  });
}

// Статика проекта (HTML, CSS, JS, data-файлы, иконки). dotfiles (.git и т.п.) игнорируются.
app.use(express.static(__dirname, { extensions: ['html'], dotfiles: 'ignore' }));
// SPA-фолбэк: всё прочее → index.html (на будущее, под реальные URL глав)
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[server] ayurveda на :${PORT}`));

// ── Ежедневный пост в Telegram (замена Vercel Cron) ──
// 09:00 и 18:00 UTC. Вызываем обработчик daily-post напрямую (как делал бы крон).
function runDailyPost(slotSchedule) {
  const req = { method: 'GET', headers: { 'x-vercel-cron-schedule': slotSchedule, 'user-agent': 'node-cron' }, query: {} };
  const res = {
    statusCode: 200, setHeader() {},
    status(c) { this.statusCode = c; return this; },
    json(o) { console.log('[cron daily-post]', this.statusCode, JSON.stringify(o).slice(0, 200)); return this; },
    end() { return this; },
  };
  Promise.resolve(dailyPost(req, res)).catch(e => console.error('[cron daily-post]', e));
}
cron.schedule('0 9 * * *',  () => runDailyPost('0 9 * * *'),  { timezone: 'UTC' });
cron.schedule('0 18 * * *', () => runDailyPost('0 18 * * *'), { timezone: 'UTC' });
console.log('[server] крон daily-post: 09:00 и 18:00 UTC');
