/**
 * POST /api/pay-webhook
 * Вебхук YooKassa. На событие payment.succeeded:
 *   1) перепроверяет статус платежа через API (защита от подделки),
 *   2) выдаёт права доступа пользователю.
 * YooKassa не использует подпись — поэтому статус ВСЕГДА перепроверяется запросом.
 */
import { getPayment, yooEnabled } from '../lib/yookassa.js';
import { PRODUCTS } from '../lib/pricing.js';
import { grantProduct } from '../lib/entitlements.js';
import { kvGet, kvSet, kvSAdd, kvEnabled } from '../lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // YooKassa ждёт 200 даже при логических ошибках — иначе будет ретраить.
  if (!yooEnabled || !kvEnabled) return res.status(200).json({ ok: true, skipped: true });

  try {
    const event = req.body?.event;
    const obj = req.body?.object;
    if (event !== 'payment.succeeded' || !obj?.id) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    // Перепроверяем платёж напрямую у YooKassa
    const payment = await getPayment(obj.id);
    if (payment.status !== 'succeeded' || payment.paid !== true) {
      return res.status(200).json({ ok: true, notPaid: true });
    }

    // Идемпотентность: не выдаём дважды
    const rec = await kvGet(`pay:${payment.id}`);
    if (rec && rec.granted) return res.status(200).json({ ok: true, already: true });

    const tgId = payment.metadata?.tgId || rec?.tgId;
    const productKey = payment.metadata?.productKey || rec?.productKey;
    const product = PRODUCTS[productKey];
    if (!tgId || !product) return res.status(200).json({ ok: true, noMeta: true });

    // Для подписки сохраняем id метода оплаты (для будущих автосписаний)
    const methodId = payment.payment_method?.saved ? payment.payment_method.id : undefined;
    await grantProduct(tgId, productKey, product, { id: payment.id, amount: payment.amount, methodId });
    await kvSet(`pay:${payment.id}`, { ...(rec || {}), tgId, productKey, status: 'succeeded', granted: true, at: Date.now() });
    // Подписки — в индекс для крона автопродления
    if (product.type === 'subscription' && methodId) {
      await kvSAdd('subs:active', tgId);
    }

    return res.status(200).json({ ok: true, granted: true });
  } catch (e) {
    // Возвращаем 200, чтобы YooKassa не зациклила ретраи; ошибку логируем
    console.error('pay-webhook error:', e);
    return res.status(200).json({ ok: true, error: String(e.message || e) });
  }
}
