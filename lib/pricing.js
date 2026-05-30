/**
 * Конфигурация монетизации. Меняйте цены/доступ здесь.
 * Цены в рублях (целые числа). Используется и на бэкенде, и на фронте.
 */

// Бесплатные книги (id из books.js) — доступны всем без оплаты
export const FREE_BOOKS = ['ashtanga'];

// Сколько глав платной книги доступно бесплатно как превью
export const PREVIEW_CHAPTERS = 1;

/**
 * Товары. type:
 *   'book'  — разовая покупка одной книги (bookId)
 *   'full'  — полный доступ ко всем книгам навсегда
 *   'pass'  — доступ ко всем книгам на N дней (days)
 */
export const PRODUCTS = {
  // Полный доступ навсегда
  full: { type: 'full', title: 'Полный доступ навсегда', price: 990, desc: 'Все книги, навсегда, без ограничений' },
  // Пропуск на 30 дней
  pass30: { type: 'pass', days: 30, title: 'Доступ на 30 дней', price: 199, desc: 'Все книги на месяц' },
  // Отдельные книги
  charaka:       { type: 'book', bookId: 'charaka',          title: 'Чарака-самхита',       price: 299, desc: '120 глав, 4429 стихов + перевод' },
  sushruta:      { type: 'book', bookId: 'sushruta',         title: 'Сушрута-самхита',       price: 299, desc: '186 глав, 3841 стих (санскрит+IAST)' },
  astanga_sangraha: { type: 'book', bookId: 'astanga_sangraha', title: 'Астанга-санграха',  price: 299, desc: '150 глав, 9262 стиха' },
  madhava:       { type: 'book', bookId: 'madhava',          title: 'Мадхава-нидана',        price: 199, desc: '69 глав, 1544 стиха' },
  sharangadhara: { type: 'book', bookId: 'sharangadhara',    title: 'Шарангадхара-самхита',  price: 199, desc: '32 главы, 2414 стихов' },
  bhavaprakasha: { type: 'book', bookId: 'bhavaprakasha',    title: 'Бхавапракаша',          price: 149, desc: 'Обзор глав' },
};

/** Книга бесплатна? */
export function isFreeBook(bookId) {
  return FREE_BOOKS.includes(bookId);
}

/**
 * Есть ли у пользователя доступ к книге по его entitlements.
 * ent: { full?:bool, passUntil?:number(сек), books?:string[] }
 */
export function hasAccess(bookId, ent) {
  if (isFreeBook(bookId)) return true;
  if (!ent) return false;
  if (ent.full) return true;
  if (ent.passUntil && ent.passUntil > Math.floor(Date.now() / 1000)) return true;
  if (Array.isArray(ent.books) && ent.books.includes(bookId)) return true;
  return false;
}
