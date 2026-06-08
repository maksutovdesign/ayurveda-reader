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
  friends: ['#5ab5cf', '<circle cx="9" cy="8" r="2.5"/><path d="M4 16.5a5 5 0 0 1 10 0"/><circle cx="16" cy="9" r="2"/><path d="M13.5 16.5a4 4 0 0 1 7 0"/>'],
  heart:   ['#d06a98', '<path d="M12 18.6C12 18.6 5 14.6 5 9.7 5 7.4 6.8 5.9 8.8 5.9c1.4 0 2.6.7 3.2 1.8.6-1.1 1.8-1.8 3.2-1.8 2 0 3.8 1.5 3.8 3.8 0 4.9-7 8.9-7 8.9z"/>'],
  // ── Энциклопедия ──
  enc_foundations: ['#8a6d3b', '<path d="M6 17V7h3l3 3 3-3h3v10"/><line x1="6" y1="17" x2="18" y2="17"/>'],
  enc_prakriti:    ['#7b5ea7', '<circle cx="12" cy="12" r="4"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M4 12h3"/><path d="M17 12h3"/><path d="M6.3 6.3l2.1 2.1"/><path d="M15.6 15.6l2.1 2.1"/>'],
  enc_nutrition:   ['#5a9e3f', '<circle cx="12" cy="13" r="5.5"/><path d="M9 13c0-1.7 1.3-3 3-3s3 1.3 3 3"/><line x1="12" y1="5" x2="12" y2="7.5"/>'],
  enc_herbs:       ['#3a8a5c', '<path d="M12 19v-8"/><path d="M12 11c-2.5 0-5-2-5-5 2.5 0 5 2 5 5z"/><path d="M12 14c2-1.5 4-4 4-6.5-2.5.5-4 3-4 6.5z"/>'],
  enc_yoga:        ['#6a9e3f', '<circle cx="12" cy="6" r="2"/><path d="M12 8v4"/><path d="M8 18l4-6 4 6"/><path d="M7 12h10"/>'],
  enc_massage:     ['#cf7a3a', '<path d="M8 6c0 2.2 1.8 4 4 4s4-1.8 4-4"/><path d="M6 14c1.5-1 3.5-1.5 6-1.5s4.5.5 6 1.5"/><path d="M8 14v5"/><path d="M16 14v5"/>'],
  enc_beauty:      ['#d06a98', '<path d="M12 5c-2.8 0-5 2.2-5 5v2c0 2.8 2.2 5 5 5s5-2.2 5-5v-2c0-2.8-2.2-5-5-5z"/><path d="M9.5 12a1 1 0 1 0 0-.1"/><path d="M14.5 12a1 1 0 1 0 0-.1"/>'],
  enc_lifestyle:   ['#e0852f', '<circle cx="12" cy="12" r="5"/><path d="M12 7v5l3 3"/><path d="M12 3v2"/><path d="M12 19v2"/>'],
  enc_digestion:   ['#d8635e', '<path d="M12 4v3"/><path d="M8.5 8c0 0 .5 3 3.5 3s3.5-3 3.5-3"/><path d="M9.5 14c0 2 1.1 3.5 2.5 3.5s2.5-1.5 2.5-3.5"/><path d="M12 17.5V20"/>'],
  enc_psychology:  ['#5a7eb5', '<circle cx="12" cy="10" r="5"/><path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M12 8v4"/><path d="M10 10h4"/>'],
  enc_panchakarma: ['#2b9aa8', '<path d="M7 8c0-2.2 2.2-4 5-4s5 1.8 5 4"/><path d="M6 8h12v2c0 4-2.7 7-6 7s-6-3-6-7V8z"/><path d="M12 17v3"/>'],
  enc_diagnostics: ['#8f6cc4', '<circle cx="11" cy="11" r="4"/><line x1="14" y1="14" x2="18" y2="18"/><path d="M9 11h4"/><path d="M11 9v4"/>'],
  enc_marma:       ['#d06a6a', '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6" stroke-dasharray="3 3"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/>'],
  enc_seasonal:    ['#e0852f', '<circle cx="12" cy="12" r="4"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="M5.6 5.6l2.2 2.2"/><path d="M16.2 16.2l2.2 2.2"/><path d="M5.6 18.4l2.2-2.2"/><path d="M16.2 7.8l2.2-2.2"/>'],
  enc_quiz:        ['#cf9a36', '<path d="M9 4h6v4l-2 2h-2l-2-2V4z"/><path d="M12 10v2"/><circle cx="12" cy="14" r="1"/><path d="M8 18h8"/>'],
  enc_prana:       ['#5ab5cf', '<path d="M12 4v16"/><path d="M8 8c2 1 2 3 0 4"/><path d="M16 8c-2 1-2 3 0 4"/><path d="M8 14c2 1 2 3 0 4"/><path d="M16 14c-2 1-2 3 0 4"/>'],
  enc_rasayana:    ['#a8793d', '<path d="M8 19l4-7 4 7"/><circle cx="12" cy="8" r="3"/><path d="M12 5V3"/>'],
  enc_dinacharya:  ['#e0852f', '<circle cx="12" cy="12" r="7"/><path d="M12 7v5l3.5 2"/>'],
  enc_food_wisdom: ['#5a9e3f', '<path d="M5 12h14"/><path d="M8 8c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M8 16c0 2.2 1.8 4 4 4s4-1.8 4-4"/>'],
  enc_tantra:      ['#8a68c0', '<path d="M12 4l6 8-6 8-6-8z"/><circle cx="12" cy="12" r="2"/>'],
  enc_home_remedy: ['#5aa85d', '<path d="M8 4h8l-1 7H9L8 4z"/><path d="M7 14h10"/><path d="M9 14v5h6v-5"/>'],
  enc_cleanse:     ['#2b9aa8', '<path d="M8 7h8"/><path d="M9 7v6c0 2.2 1.3 4 3 4s3-1.8 3-4V7"/><circle cx="11" cy="12" r="1"/><circle cx="13" cy="14" r="1"/>'],
  enc_kitchen:     ['#b9803c', '<path d="M5 18h14"/><path d="M6 14h12v4H6z"/><path d="M8 10c0-1.7 1.8-3 4-3s4 1.3 4 3"/><path d="M15 8V6"/>'],
  enc_alchemy:     ['#8f6cc4', '<path d="M10 4h4"/><path d="M11 4v4l-4 8h10l-4-8V4"/><line x1="9" y1="14" x2="15" y2="14"/>'],
  enc_elements:    ['#3a8a5c', '<circle cx="12" cy="12" r="6"/><path d="M12 6v12"/><path d="M6 12h12"/><circle cx="12" cy="12" r="2"/>'],
  enc_family:      ['#6783a3', '<circle cx="9" cy="8" r="2.5"/><circle cx="16" cy="9" r="2"/><path d="M5 17a4 4 0 0 1 8 0"/><path d="M13 16.5a3 3 0 0 1 6 0"/>'],
  enc_polarity:    ['#d8635e', '<circle cx="9" cy="12" r="3"/><circle cx="15" cy="12" r="3"/><path d="M7.5 10l3 4"/><path d="M13.5 10l3 4"/>'],
  enc_philosophy:  ['#8a68c0', '<path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/><path d="M12 4c-2.2 0-4 3.6-4 8s1.8 8 4 8"/><path d="M12 4c2.2 0 4 3.6 4 8s-1.8 8-4 8"/><line x1="4" y1="12" x2="20" y2="12"/>'],
  enc_history:     ['#b9803c', '<path d="M6 4v16"/><path d="M6 4h10c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H6"/><path d="M6 12h11c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H6"/>'],
  enc_mudra:       ['#cf9a36', '<path d="M12 19v-6"/><path d="M12 13c-1-3 0-6 0-9"/><path d="M9.5 4c0 3-1 6 0 9"/><path d="M14.5 4c0 3 1 6 0 9"/><path d="M7 5c0 3-1 5.5 0 8"/>'],
  enc_sound:       ['#5ab5cf', '<path d="M8 9v6l4 3V6l-4 3z"/><path d="M15 9.5c.8.8 1.3 1.8 1.3 2.5s-.5 1.7-1.3 2.5"/><path d="M17 7.5c1.3 1.3 2 2.8 2 4.5s-.7 3.2-2 4.5"/>'],
  enc_gems:        ['#8a68c0', '<path d="M7 9l5-5 5 5-5 11z"/><path d="M7 9h10"/><path d="M9 9l3 11"/><path d="M15 9l-3 11"/>'],
  enc_pediatrics:  ['#d06a98', '<circle cx="12" cy="8" r="3"/><path d="M8 18c0-2.8 1.8-5 4-5s4 2.2 4 5"/><path d="M10 8.5c.3-.3.8-.5 1.2-.5"/><path d="M14 8.5c-.3-.3-.8-.5-1.2-.5"/>'],
  enc_pk_protocol: ['#2b9aa8', '<rect x="6" y="4" width="12" height="16" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="14" x2="13" y2="14"/>'],
  enc_aroma:       ['#d06a98', '<path d="M12 14c-2.2 0-4 1.8-4 4h8c0-2.2-1.8-4-4-4z"/><path d="M12 14V9"/><path d="M10 7c0-1.7 0.9-3 2-3s2 1.3 2 3"/>'],
  enc_eye:         ['#4f86c6', '<path d="M4 12s3.3-5 8-5 8 5 8 5-3.3 5-8 5-8-5-8-5z"/><circle cx="12" cy="12" r="2.5"/>'],
  enc_preparations:['#8f6cc4', '<path d="M9 4h6v4l-3 3-3-3V4z"/><path d="M12 11v3"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>'],
  enc_womens:      ['#d06a98', '<circle cx="12" cy="9" r="4"/><path d="M12 13v5"/><path d="M9 16h6"/>'],
  enc_pk_joshi:    ['#3a9d97', '<path d="M7 7h10v3c0 4-2.2 7-5 7s-5-3-5-7V7z"/><path d="M12 17v3"/><path d="M9 4v3"/><path d="M15 4v3"/>'],
  enc_srota:       ['#d06a6a', '<path d="M12 4v16"/><path d="M8 7c2 2 2 4 0 6s-2 4 0 6"/><path d="M16 7c-2 2-2 4 0 6s2 4 0 6"/>'],
  enc_clinical:    ['#4f86c6', '<path d="M8 4h8v3H8z"/><rect x="6" y="7" width="12" height="13" rx="1"/><path d="M10 12h4"/><path d="M12 10v4"/>'],
  enc_chakra:      ['#8a68c0', '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/>'],
  enc_aroma_form:  ['#cf7a3a', '<path d="M10 18c0-1.1.9-2 2-2s2 .9 2 2"/><path d="M12 16v-4"/><path d="M9 8c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2-1.5 3-3 4-1.5-1-3-2-3-4z"/>'],
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
