/**
 * POST /api/pay-create  { productKey }
 * Создаёт платёж YooKassa для вошедшего пользователя.
 * Возвращает { confirmation_url } — фронт редиректит туда.
 */
import { verifySession, tokenFromReq } from '../lib/auth.js';
import { PRODUCTS } from '../lib/pricing.js';
import { createPayment, yooEnabled } from '../lib/yookassa.js';
import { kvSet, kvEnabled } from '../lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = verifySession(tokenFromReq(req));
  if (!session) return res.status(401).json({ error: 'Войдите через Telegram' });
  if (!yooEnabled) return res.status(503).json({ error: 'Приём платежей не настроен' });

  const { productKey } = req.body || {};
  const product = PRODUCTS[productKey];
  if (!product) return res.status(400).json({ error: 'Неизвестный товар' });

  // return_url — куда вернётся пользователь после оплаты
  const origin = (req.headers['origin'] || `https://${req.headers['host']}`).replace(/\/$/, '');
  const returnUrl = `${origin}/?paid=1#cabinet`;

  try {
    const payment = await createPayment({
      amountRub: product.price,
      description: `${product.title} · Аюрведа-ридер`,
      returnUrl,
      metadata: { tgId: session.tgId, productKey },
      savePaymentMethod: product.type === 'subscription', // для автопродления
    });
    // Сохраняем связку платёж→пользователь (на случай восстановления)
    if (kvEnabled) {
      await kvSet(`pay:${payment.id}`, { tgId: session.tgId, productKey, status: payment.status, at: Date.now() });
    }
    return res.status(200).json({ confirmation_url: payment.confirmation_url, id: payment.id });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
