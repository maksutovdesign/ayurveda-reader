/**
 * Права доступа пользователя (entitlements), хранятся в KV по ключу ent:<tgId>.
 * Формат: { full?:boolean, passUntil?:number(сек), books?:string[], history?:[] }
 */
import { kvGet, kvSet, kvEnabled } from './kv.js';

export async function getEntitlements(tgId) {
  if (!kvEnabled || !tgId) return { full: false, books: [] };
  const ent = await kvGet(`ent:${tgId}`);
  return ent || { full: false, books: [] };
}

/**
 * Выдаёт доступ по купленному товару.
 * product: объект из PRODUCTS, payment: { id, amount } для истории.
 */
export async function grantProduct(tgId, productKey, product, payment) {
  if (!kvEnabled || !tgId || !product) return null;
  const ent = await getEntitlements(tgId);
  ent.books = Array.isArray(ent.books) ? ent.books : [];
  ent.history = Array.isArray(ent.history) ? ent.history : [];

  if (product.type === 'full') {
    ent.full = true;
  } else if (product.type === 'pass') {
    const now = Math.floor(Date.now() / 1000);
    const base = ent.passUntil && ent.passUntil > now ? ent.passUntil : now;
    ent.passUntil = base + (product.days || 30) * 86400;
  } else if (product.type === 'book' && product.bookId) {
    if (!ent.books.includes(product.bookId)) ent.books.push(product.bookId);
  }

  ent.history.push({
    productKey,
    title: product.title,
    price: product.price,
    paymentId: payment?.id || null,
    at: Math.floor(Date.now() / 1000),
  });

  await kvSet(`ent:${tgId}`, ent);
  return ent;
}
