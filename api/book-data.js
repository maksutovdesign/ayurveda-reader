/**
 * GET /api/book-data?book=<id>
 * Жёсткая защита контента (Этап 6). Отдаёт данные платной книги ТОЛЬКО
 * при наличии прав. Без прав — превью (первые PREVIEW_CHAPTERS глав),
 * остальные главы с пустым content (на фронте → paywall).
 *
 * Активируется флагом CONTENT_PROTECTION=1. Когда выключено — фронт грузит
 * статические файлы напрямую (мягкий paywall), этот эндпоинт не используется.
 *
 * Бесплатные книги (AH) сюда не ходят — они статические.
 */
import { verifySession, tokenFromReq } from '../lib/auth.js';
import { getEntitlements } from '../lib/entitlements.js';
import { hasAccess, isFreeBook, PREVIEW_CHAPTERS } from '../lib/pricing.js';

// Серверные загрузчики статических данных (бандлятся в функцию на сборке,
// поэтому доступны даже если публичный доступ к файлам заблокирован).
const LOADERS = {
  charaka:          () => import('../charaka-data.js').then(m => m.CHARAKA_DATA),
  sushruta:         () => import('../sushruta-data.js').then(m => m.SUSHRUTA_DATA),
  madhava:          () => import('../madhava-data.js').then(m => m.MADHAVA_DATA),
  sharangadhara:    () => import('../sharangadhara-data.js').then(m => m.SHARANGADHARA_DATA),
  bhavaprakasha:    () => import('../bhavaprakasha-data.js').then(m => m.BHAVAPRAKASHA_DATA),
  astanga_sangraha: () => import('../astanga-data.js').then(m => m.ASTANGA_DATA),
};

export default async function handler(req, res) {
  const book = req.query?.book;
  const loader = LOADERS[book];
  if (!loader) return res.status(404).json({ error: 'Unknown book' });

  const dataArr = await loader();

  // Определяем доступ
  let entitled = false;
  const session = verifySession(tokenFromReq(req));
  if (session) {
    try { entitled = hasAccess(book, await getEntitlements(session.tgId)); } catch {}
  }
  if (isFreeBook(book)) entitled = true;

  if (entitled) {
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).json({ data: dataArr, entitled: true });
  }

  // Без прав: превью первых N глав каждой стханы по порядку появления.
  // Определяем «первые N» как первые N уникальных (sthana+number) в порядке массива.
  const previewKeys = new Set();
  let count = 0;
  for (const d of dataArr) {
    const key = `${d.sthana}:${d.number}`;
    if (!previewKeys.has(key)) {
      if (count < PREVIEW_CHAPTERS) { previewKeys.add(key); count++; }
    }
  }
  const preview = dataArr.map(d => {
    const key = `${d.sthana}:${d.number}`;
    if (previewKeys.has(key)) return d;               // полная глава-превью
    return { sthana: d.sthana, number: d.number, lang: d.lang, content: [], locked: true };
  });

  res.setHeader('Cache-Control', 'private, max-age=60');
  return res.status(200).json({ data: preview, entitled: false });
}
