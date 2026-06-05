/**
 * icons.js — единый набор цветных линейных SVG-иконок (24×24, скруглённая
 * цветная подложка). Один стиль для меню и книг → ровное меню.
 * Используется в index.html (меню через data-icon) и в app.js (иконки книг).
 */
const G = {
  // ── Меню ──
  terms:   ['#4f86c6', '<line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/>'],
  pulse:   ['#d8635e', '<path d="M5 13h3l2-5 3 8 2-3h4"/>'],
  mortar:  ['#5aa85d', '<path d="M5 12h14"/><path d="M6.5 12a5.5 5.5 0 0 0 11 0"/><path d="M15.2 4.6l-3.3 6.2"/>'],
  book:    ['#cf9a36', '<path d="M12 7C10.3 5.9 7.8 5.7 6 6.2V18c1.8-.5 4.3-.3 6 .9 1.7-1.2 4.2-1.4 6-.9V6.2c-1.8-.5-4.3-.3-6 .8z"/><line x1="12" y1="7" x2="12" y2="18.9"/>'],
  books:   ['#3a9d97', '<rect x="5.5" y="6" width="3.6" height="13" rx="1"/><rect x="10.6" y="6" width="3.6" height="13" rx="1"/><path d="M15.9 7.4l3 .6-2.1 12.2-3-.6z"/>'],
  clock:   ['#e0852f', '<circle cx="12" cy="12" r="7"/><path d="M12 8.2V12l2.6 1.8"/>'],
  beaker:  ['#8a68c0', '<path d="M9.5 4.5h5"/><path d="M10.3 4.5v4.7l-3.4 7.1A1.4 1.4 0 0 0 8.1 18.5h7.8a1.4 1.4 0 0 0 1.2-2.2l-3.4-7.1V4.5"/><line x1="9" y1="14" x2="15" y2="14"/>'],
  user:    ['#6783a3', '<circle cx="12" cy="9" r="3.2"/><path d="M6 18.6a6 6 0 0 1 12 0"/>'],
  heart:   ['#d06a98', '<path d="M12 18.6C12 18.6 5 14.6 5 9.7 5 7.4 6.8 5.9 8.8 5.9c1.4 0 2.6.7 3.2 1.8.6-1.1 1.8-1.8 3.2-1.8 2 0 3.8 1.5 3.8 3.8 0 4.9-7 8.9-7 8.9z"/>'],
  // ── Книги ──
  leaf:    ['#5a9e3f', '<path d="M6 18C6 11 10 6 18 6 18 13 14 18 6 18z"/><path d="M6 18C9.5 14.5 12.5 12.5 16 11"/>'],
  scroll:  ['#b9803c', '<path d="M8.5 5h8v10.5a3 3 0 0 1-3 3H8"/><path d="M8.5 5a2 2 0 1 0 0 4H10"/><path d="M13.5 18.5a3 3 0 0 1-3-3V8.8"/><line x1="11.5" y1="8" x2="14.5" y2="8"/><line x1="11.5" y1="11" x2="14.5" y2="11"/>'],
  scalpel: ['#6088a8', '<path d="M4 20l7.6-7.6"/><path d="M11.6 12.4l5.4-5.4a1.8 1.8 0 0 0-2.5-2.5l-5.4 5.4z"/>'],
  magnifier:['#2b9aa8', '<circle cx="11" cy="11" r="5.4"/><line x1="15" y1="15" x2="19.4" y2="19.4"/>'],
  flask:   ['#8f6cc4', '<path d="M9.8 4.5h4.4"/><path d="M11 4.5v3.4a6.4 6.4 0 1 0 2 0V4.5"/><path d="M8.6 14.3a6.4 6.4 0 0 0 6.8 0"/>'],
  sprout:  ['#7fa23c', '<path d="M12 19.5v-6.5"/><path d="M12 13c0-2.9 2.2-5.1 5.1-5.1 0 2.9-2.2 5.1-5.1 5.1z"/><path d="M12 14.6c0-2.6-2.1-4.6-4.6-4.6 0 2.6 2.1 4.6 4.6 4.6z"/>'],
  bookmark:['#3f9e6b', '<path d="M7 4.8h10v14.4l-5-3-5 3z"/>'],
};

/** Вернуть строку SVG для ключа (или пустую строку, если ключа нет). */
export function icon(key) {
  const g = G[key];
  if (!g) return '';
  const [c, paths] = g;
  return `<svg class="app-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">`
    + `<rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="${c}" fill-opacity="0.16"/>`
    + `<g stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
}

export const ICON_KEYS = Object.keys(G);
