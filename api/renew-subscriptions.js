/**
 * Крон автопродления подписок (Vercel Cron, 1 раз в сутки).
 * Для каждого активного подписчика, у кого подошёл срок (nextCharge<=now)
 * и включено автопродление, делает автосписание по сохранённому методу.
 *
 * Авторизация: x-vercel-cron: 1  ИЛИ  ?key=DAILY_POST_KEY (для ручного теста)
 */
import { chargeSavedMethod, yooEnabled } from '../lib/yookassa.js';
import { getEntitlements } from '../lib/entitlements.js';
import { PRODUCTS } from '../lib/pricing.js';
import { kvEnabled, kvSet, kvSMembers, kvSRem } from '../lib/kv.js';

export default async function handler(req, res) {
  const isCron = req.headers['x-vercel-cron'] === '1';
  const keyOk = req.query?.key && req.query.key === process.env.DAILY_POST_KEY;
  if (!isCron && !keyOk) return res.status(401).json({ error: 'Unauthorized' });
  if (!yooEnabled || !kvEnabled) return res.status(200).json({ ok: true, skipped: true });

  const now = Math.floor(Date.now() / 1000);
  const ids = await kvSMembers('subs:active');
  const report = { checked: ids.length, renewed: 0, failed: 0, dropped: 0 };

  for (const tgId of ids) {
    try {
      const ent = await getEntitlements(tgId);
      const sub = ent.sub;
      if (!sub) { await kvSRem('subs:active', tgId); report.dropped++; continue; }

      // Автопродление отменено и срок вышел → убрать из индекса
      if (!sub.autoRenew) {
        if (sub.until <= now) { await kvSRem('subs:active', tgId); report.dropped++; }
        continue;
      }
      // Срок ещё не подошёл
      if ((sub.nextCharge || sub.until || 0) > now) continue;
      if (!sub.methodId) { await kvSRem('subs:active', tgId); report.dropped++; continue; }

      const product = PRODUCTS[sub.productKey] || { period: sub.period || 30, price: sub.price };
      const charge = await chargeSavedMethod({
        amountRub: sub.price,
        description: `Автопродление подписки · Аюрведа-ридер`,
        paymentMethodId: sub.methodId,
        metadata: { tgId, productKey: sub.productKey, renewal: '1' },
      });

      if (charge.status === 'succeeded') {
        const period = (product.period || 30) * 86400;
        const base = sub.until > now ? sub.until : now;
        ent.sub = { ...sub, until: base + period, nextCharge: base + period };
        ent.history = Array.isArray(ent.history) ? ent.history : [];
        ent.history.push({ productKey: sub.productKey, title: 'Автопродление', price: sub.price, paymentId: charge.id, at: now });
        await kvSet(`ent:${tgId}`, ent);
        report.renewed++;
      } else {
        // Не списалось — отключаем автопродление (доступ до конца оплаченного периода сохраняется)
        ent.sub = { ...sub, autoRenew: false, lastFail: now };
        await kvSet(`ent:${tgId}`, ent);
        report.failed++;
      }
    } catch (e) {
      report.failed++;
      console.error('renew error for', tgId, e.message);
    }
  }

  return res.status(200).json({ ok: true, ...report });
}
