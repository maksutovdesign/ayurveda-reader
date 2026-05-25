import { bot } from '../bot/index.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, status: 'Ayurveda Bot webhook is active' });
  }
  try {
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(200).json({ ok: true });
  }
}
