import { bot } from '../bot/index.js';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, status: 'Ayurveda Bot webhook is active' });
  }

  // ── Верификация источника ──────────────────────────────────────
  // Telegram присылает X-Telegram-Bot-Api-Secret-Token если
  // webhook зарегистрирован с параметром secret_token.
  // Установи WEBHOOK_SECRET в Vercel и перерегистрируй webhook:
  //   bash bot/setup-webhook.sh
  if (WEBHOOK_SECRET) {
    const incoming = req.headers['x-telegram-bot-api-secret-token'];
    if (incoming !== WEBHOOK_SECRET) {
      console.warn('Webhook: rejected request with wrong/missing secret token');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('Webhook: WEBHOOK_SECRET not set — source verification disabled');
  }

  try {
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(200).json({ ok: true });
  }
}
