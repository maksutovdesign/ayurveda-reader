/**
 * GET /api/entitlements
 * Возвращает права доступа текущего пользователя (по сессии) + каталог товаров.
 */
import { verifySession, tokenFromReq } from '../lib/auth.js';
import { getEntitlements } from '../lib/entitlements.js';
import { PRODUCTS, FREE_BOOKS, PREVIEW_CHAPTERS } from '../lib/pricing.js';
import { yooEnabled } from '../lib/yookassa.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = verifySession(tokenFromReq(req));

  let ent = { full: false, books: [] };
  if (session) {
    try { ent = await getEntitlements(session.tgId); } catch {}
  }

  return res.status(200).json({
    entitlements: ent,
    freeBooks: FREE_BOOKS,
    products: PRODUCTS,
    loggedIn: Boolean(session),
    paymentsEnabled: yooEnabled,  // paywall показывается только когда true
    previewChapters: PREVIEW_CHAPTERS,
  });
}
