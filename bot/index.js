/**
 * Telegram-бот «Аштанга-хридая-самхита»
 *
 * Данные импортируются напрямую из файлов веб-приложения.
 * Чтобы обновить контент — просто редактируй data.js,
 * encyclopedia.js и др., затем перезапускай бот.
 */

import { Telegraf, Markup } from 'telegraf';

// ── Импорт данных из файлов веб-приложения ──────────────
// Изменяй только эти JS-файлы — бот подхватит обновления автоматически
import { BOOK_DATA }               from '../data.js';
import { ENCYCLOPEDIA }            from '../encyclopedia.js';
import { DISEASES, getDiseaseCategories } from '../diseases.js';
import { REMEDIES }                from '../remedies.js';
import { GLOSSARY }                from '../glossary.js';
import { FOOD_TABLE }              from '../foodtable.js';
import { QUIZ }                    from '../quiz.js';

// ── Конфигурация ─────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌  BOT_TOKEN не задан. Добавь его в переменные окружения (.env или Railway).');
  process.exit(1);
}

const WEB_URL = (process.env.WEB_URL || 'https://maksutovdesign.github.io/ayurveda-reader/').replace(/\/$/, '');

const bot = new Telegraf(BOT_TOKEN);

// ── Константы ─────────────────────────────────────────────
const MAX_MSG   = 3800;   // Telegram допускает 4096, оставляем запас на разметку
const MAX_ITEMS = 12;     // Максимум кнопок в списке

// ═══════════════════════════════════════════════════════════
// УТИЛИТЫ
// ═══════════════════════════════════════════════════════════

/** Экранирование HTML-символов в пользовательском контенте */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Разбивает длинный текст на страницы по границам абзацев.
 * Telegram ограничивает длину сообщения 4096 символами.
 */
function paginate(text, maxLen = MAX_MSG) {
  if (text.length <= maxLen) return [text];
  const pages = [];
  let pos = 0;
  while (pos < text.length) {
    let end = pos + maxLen;
    if (end < text.length) {
      const para = text.lastIndexOf('\n\n', end);
      const line = text.lastIndexOf('\n', end);
      if (para > pos + 400) end = para + 2;
      else if (line > pos + 200) end = line + 1;
    }
    pages.push(text.slice(pos, Math.min(end, text.length)).trim());
    pos = end;
  }
  return pages;
}

/**
 * Конвертирует markdown-подобный текст в Telegram HTML.
 * Сначала экранируем спецсимволы HTML, потом применяем форматирование.
 */
function fmtBody(body) {
  if (!body) return '';
  const raw = Array.isArray(body) ? body.join('\n\n') : String(body);

  return raw
    .split('\n')
    .map(line => {
      if (line.startsWith('### ')) return `  <b>${esc(line.slice(4).trim())}</b>`;
      if (line.startsWith('## '))  return `\n<b>${esc(line.slice(3).trim())}</b>`;
      if (line.startsWith('# '))   return `\n<b><u>${esc(line.slice(2).trim())}</u></b>`;
      if (line.startsWith('> '))   return `<i>  ${esc(line.slice(2))}</i>`;
      // Строки из таблиц (|...|) — пропускаем разметку, оставляем текст
      if (line.startsWith('|'))    return esc(line.replace(/\|/g, ' ').replace(/\s{2,}/g, '  ').trim());

      const escaped = esc(line);
      // ** → bold, * → italic (применяем ПОСЛЕ esc, т.к. * не трогается esc-ом)
      return escaped
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\*([^*\n]+?)\*/g, '<i>$1</i>');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Форматирует один блок главы книги (verse / comment / text / heading).
 */
function fmtBlock(block) {
  if (!block?.text) return '';
  const t = esc(block.text);
  switch (block.type) {
    case 'verse':
      return `<i>— Стих ${block.number || ''} —</i>\n${t}`;
    case 'comment':
      return `<i>${t}</i>`;
    case 'heading':
      return `\n<b>${t}</b>`;
    default:
      return t;
  }
}

/** Строит навигационную строку с кнопками пагинации ◀ N/Total ▶ */
function buildPageNav(page, total, prevCb, nextCb) {
  const btns = [];
  if (page > 0)          btns.push(Markup.button.callback('◀', prevCb));
  btns.push(Markup.button.callback(`${page + 1} / ${total}`, 'noop'));
  if (page < total - 1)  btns.push(Markup.button.callback('▶', nextCb));
  return btns;
}

/** Отправляет или редактирует сообщение в зависимости от типа обновления */
async function send(ctx, text, keyboard) {
  const opts = { parse_mode: 'HTML', ...Markup.inlineKeyboard(keyboard) };
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, opts);
    } else {
      await ctx.reply(text, opts);
    }
  } catch (e) {
    // Если сообщение не изменилось, Telegram бросает ошибку — игнорируем
    if (!e.message?.includes('message is not modified')) throw e;
  }
}

// ═══════════════════════════════════════════════════════════
// ГЛАВНОЕ МЕНЮ
// ═══════════════════════════════════════════════════════════

async function showMain(ctx) {
  const text = [
    '🙏 <b>Аштанга-хридая-самхита</b>',
    `<i>${esc(BOOK_DATA.author)} · пер. ${esc(BOOK_DATA.translator)}</i>`,
    '',
    'Библиотека аюрведических знаний.\nВыберите раздел:',
  ].join('\n');

  await send(ctx, text, [
    [Markup.button.callback('📚 Книга',              'bk_s'),
     Markup.button.callback('🔍 Энциклопедия',       'enc_s')],
    [Markup.button.callback('🌿 Болезни',             'dis_s'),
     Markup.button.callback('💊 Средства',            'rem_s')],
    [Markup.button.callback('📖 Глоссарий',           'gl_s'),
     Markup.button.callback('🍽 Продукты',            'ft_s')],
    [Markup.button.callback('🧪 Тест конституции',    'qz_s'),
     Markup.button.callback('🙏 Поддержать проект',   'donate_s')],
    [Markup.button.url('🌐 Открыть полную версию',    WEB_URL)],
  ]);
}

// ═══════════════════════════════════════════════════════════
// ЭНЦИКЛОПЕДИЯ
// ═══════════════════════════════════════════════════════════

async function showEncSections(ctx) {
  const rows = ENCYCLOPEDIA.map((sec, i) => {
    const label = `${sec.icon || '📄'} ${sec.title}`;
    return [Markup.button.callback(
      label.length > 45 ? label.slice(0, 42) + '…' : label,
      `enc_a:${i}`
    )];
  });
  rows.push([Markup.button.callback('← Главное меню', 'main')]);

  await send(ctx, '<b>📚 Энциклопедия аюрведы</b>\nВыберите раздел:', rows);
}

async function showEncArticles(ctx, sIdx) {
  const sec = ENCYCLOPEDIA[sIdx];
  if (!sec) return showEncSections(ctx);

  const rows = sec.articles.map((art, i) => [
    Markup.button.callback(
      art.title.length > 52 ? art.title.slice(0, 49) + '…' : art.title,
      `enc_r:${sIdx}:${i}:0`
    )
  ]);
  rows.push([
    Markup.button.callback('← Разделы', 'enc_s'),
    Markup.button.callback('⌂ Меню',    'main'),
  ]);

  const desc = sec.description ? `\n<i>${esc(sec.description)}</i>` : '';
  await send(ctx,
    `${sec.icon || '📄'} <b>${esc(sec.title)}</b>${desc}\n\n${sec.articles.length} статей:`,
    rows
  );
}

async function showEncArticle(ctx, sIdx, aIdx, page) {
  const sec = ENCYCLOPEDIA[sIdx];
  const art = sec?.articles[aIdx];
  if (!art) return showEncArticles(ctx, sIdx);

  const body   = fmtBody(art.body || art.content || art.summary || '');
  const header = `${sec.icon || '📄'} <b>${esc(art.title)}</b>\n────────────\n`;
  const pages  = paginate(body);
  page = Math.max(0, Math.min(page, pages.length - 1));

  const navRow  = pages.length > 1
    ? buildPageNav(page, pages.length, `enc_r:${sIdx}:${aIdx}:${page - 1}`, `enc_r:${sIdx}:${aIdx}:${page + 1}`)
    : null;
  const backRow = [
    Markup.button.callback('← ' + sec.title.slice(0, 20), `enc_a:${sIdx}`),
    Markup.button.callback('⌂ Меню', 'main'),
  ];

  await send(ctx, header + (pages[page] || ''), navRow ? [navRow, backRow] : [backRow]);
}

// ═══════════════════════════════════════════════════════════
// КНИГА
// ═══════════════════════════════════════════════════════════

// Кешируем список стхан (порядок первого появления)
const STHANAS = (() => {
  const seen = new Set();
  const list = [];
  for (const ch of BOOK_DATA.chapters) {
    if (!seen.has(ch.sthana)) { seen.add(ch.sthana); list.push(ch.sthana); }
  }
  return list;
})();

async function showBookSthanas(ctx) {
  const rows = STHANAS.map((s, i) => [Markup.button.callback(s, `bk_c:${i}`)]);
  rows.push([Markup.button.callback('← Главное меню', 'main')]);

  await send(ctx,
    `📚 <b>${esc(BOOK_DATA.title)}</b>\n<i>${esc(BOOK_DATA.author)}</i>\n\nВыберите часть книги:`,
    rows
  );
}

async function showBookChapters(ctx, sthanaIdx) {
  const sthana = STHANAS[sthanaIdx];
  if (!sthana) return showBookSthanas(ctx);

  const chapters = BOOK_DATA.chapters.filter(c => c.sthana === sthana);
  const rows = chapters.map(ch => {
    const chIdx = BOOK_DATA.chapters.indexOf(ch);
    const label = `Гл. ${ch.number}. ${ch.title}`;
    return [Markup.button.callback(
      label.length > 50 ? label.slice(0, 47) + '…' : label,
      `bk_r:${chIdx}:0`
    )];
  });
  rows.push([
    Markup.button.callback('← Разделы', 'bk_s'),
    Markup.button.callback('⌂ Меню',    'main'),
  ]);

  await send(ctx, `📚 <b>${esc(sthana)}</b>\n${chapters.length} глав:`, rows);
}

async function showBookChapter(ctx, chIdx, page) {
  const ch = BOOK_DATA.chapters[chIdx];
  if (!ch) return showBookSthanas(ctx);

  const body   = (ch.content || []).map(fmtBlock).filter(Boolean).join('\n\n');
  const sub    = ch.subtitle ? `\n<i>${esc(ch.subtitle)}</i>` : '';
  const header = `📖 <b>${esc(ch.sthana)} · Гл. ${ch.number}</b>\n<b>${esc(ch.title)}</b>${sub}\n────────────\n`;
  const pages  = paginate(body);
  page = Math.max(0, Math.min(page, pages.length - 1));

  const sthanaIdx = STHANAS.indexOf(ch.sthana);
  const navRow  = pages.length > 1
    ? buildPageNav(page, pages.length, `bk_r:${chIdx}:${page - 1}`, `bk_r:${chIdx}:${page + 1}`)
    : null;
  const backRow = [
    Markup.button.callback('← Главы', `bk_c:${sthanaIdx}`),
    Markup.button.callback('⌂ Меню',  'main'),
  ];

  await send(ctx, header + (pages[page] || '<i>(пусто)</i>'), navRow ? [navRow, backRow] : [backRow]);
}

// ═══════════════════════════════════════════════════════════
// БОЛЕЗНИ
// ═══════════════════════════════════════════════════════════

async function showDiseaseCategories(ctx) {
  const cats = getDiseaseCategories();
  const rows = Object.entries(cats).map(([cat, list], i) => [
    Markup.button.callback(`${cat} (${list.length})`, `dis_c:${i}`)
  ]);
  rows.push([Markup.button.callback('← Главное меню', 'main')]);

  await send(ctx,
    '🌿 <b>Болезни и их лечение</b>\nАюрведическая классификация\n\nВыберите категорию:',
    rows
  );
}

async function showDiseaseList(ctx, catIdx) {
  const cats    = getDiseaseCategories();
  const catName = Object.keys(cats)[catIdx];
  if (!catName) return showDiseaseCategories(ctx);

  const list = cats[catName];
  const rows = list.map(d => {
    const dIdx = DISEASES.indexOf(d);
    return [Markup.button.callback(`${d.name} (${d.origin})`, `dis_r:${dIdx}`)];
  });
  rows.push([
    Markup.button.callback('← Категории', 'dis_s'),
    Markup.button.callback('⌂ Меню',      'main'),
  ]);

  await send(ctx, `🌿 <b>${esc(catName)}</b> — ${list.length} болезней:`, rows);
}

async function showDisease(ctx, dIdx) {
  const d = DISEASES[dIdx];
  if (!d) return showDiseaseCategories(ctx);

  const cats    = getDiseaseCategories();
  const catIdx  = Object.keys(cats).findIndex(c => cats[c].includes(d));
  const chText  = d.chapters.length ? '\n📖 ' + d.chapters.join(' · ') : '';

  const text = [
    `🌿 <b>${esc(d.name)}</b>  <i>${esc(d.origin)}</i>`,
    `Доша: ${esc(d.dosha)}`,
    '',
    esc(d.desc),
    '',
    `💊 <b>Лечение:</b> ${esc(d.treatment)}`,
    chText,
  ].join('\n');

  await send(ctx, text, [[
    Markup.button.callback('← Назад', `dis_c:${catIdx}`),
    Markup.button.callback('⌂ Меню', 'main'),
  ]]);
}

// ═══════════════════════════════════════════════════════════
// ДОМАШНИЕ СРЕДСТВА
// ═══════════════════════════════════════════════════════════

// Состояние ожидания ввода (per chat, в памяти)
const inputMode = new Map(); // chatId → 'remedy' | 'glossary' | 'search'

async function showRemediesMenu(ctx) {
  const chatId = ctx.chat?.id ?? ctx.from?.id;
  inputMode.set(chatId, 'remedy');

  const text = [
    `💊 <b>Домашние средства</b>`,
    `${REMEDIES.length} аюрведических средств`,
    '',
    'Введите название болезни или симптом:',
    '<i>Примеры: аллергия, кашель, боль в горле, бессонница</i>',
  ].join('\n');

  await send(ctx, text, [[Markup.button.callback('← Главное меню', 'main')]]);
}

async function searchRemedies(ctx, query) {
  const q = query.trim().toLowerCase();
  const results = REMEDIES.filter(r => r.name.toLowerCase().includes(q));

  if (!results.length) {
    await ctx.reply(
      `💊 По запросу «${esc(query)}» ничего не найдено.\n\nПопробуйте другой запрос.`,
      { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('← Средства', 'rem_s')]]) }
    );
    return;
  }

  if (results.length === 1) {
    return showRemedy(ctx, REMEDIES.indexOf(results[0]), 0);
  }

  const shown = results.slice(0, MAX_ITEMS);
  const rows  = shown.map(r => [Markup.button.callback(r.name, `rem_r:${REMEDIES.indexOf(r)}:0`)]);
  if (results.length > MAX_ITEMS) rows.push([Markup.button.callback(`… ещё ${results.length - MAX_ITEMS}`, 'noop')]);
  rows.push([Markup.button.callback('← Средства', 'rem_s')]);

  await ctx.reply(
    `💊 Найдено <b>${results.length}</b> по запросу «${esc(query)}»:`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) }
  );
}

async function showRemedy(ctx, rIdx, page) {
  const r = REMEDIES[rIdx];
  if (!r) return showRemediesMenu(ctx);

  const body   = fmtBody(r.content);
  const header = `💊 <b>${esc(r.name)}</b>\n────────────\n`;
  const pages  = paginate(body);
  page = Math.max(0, Math.min(page, pages.length - 1));

  const navRow  = pages.length > 1
    ? buildPageNav(page, pages.length, `rem_r:${rIdx}:${page - 1}`, `rem_r:${rIdx}:${page + 1}`)
    : null;
  const backRow = [
    Markup.button.callback('← Средства', 'rem_s'),
    Markup.button.callback('⌂ Меню',     'main'),
  ];

  await send(ctx, header + (pages[page] || ''), navRow ? [navRow, backRow] : [backRow]);
}

// ═══════════════════════════════════════════════════════════
// ГЛОССАРИЙ
// ═══════════════════════════════════════════════════════════

async function showGlossaryMenu(ctx) {
  const chatId = ctx.chat?.id ?? ctx.from?.id;
  inputMode.set(chatId, 'glossary');

  const text = [
    `📖 <b>Санскритский глоссарий</b>`,
    `${GLOSSARY.length} аюрведических терминов`,
    '',
    'Введите термин для поиска:',
    '<i>Примеры: Вата, Питта, Агни, Оджас</i>',
  ].join('\n');

  await send(ctx, text, [[Markup.button.callback('← Главное меню', 'main')]]);
}

async function searchGlossary(ctx, query) {
  const q = query.trim().toLowerCase();
  const results = GLOSSARY.filter(e =>
    e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q)
  );

  if (!results.length) {
    await ctx.reply(
      `📖 Термин «${esc(query)}» не найден.\n\nПопробуйте по-другому.`,
      { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('← Глоссарий', 'gl_s')]]) }
    );
    return;
  }

  if (results.length === 1) return showGlossaryEntry(ctx, GLOSSARY.indexOf(results[0]));

  const shown = results.slice(0, MAX_ITEMS);
  const rows  = shown.map(e => [Markup.button.callback(e.term, `gl_r:${GLOSSARY.indexOf(e)}`)]);
  if (results.length > MAX_ITEMS) rows.push([Markup.button.callback(`… ещё ${results.length - MAX_ITEMS}`, 'noop')]);
  rows.push([Markup.button.callback('← Глоссарий', 'gl_s')]);

  await ctx.reply(
    `📖 По запросу «${esc(query)}» найдено: <b>${results.length}</b>`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) }
  );
}

async function showGlossaryEntry(ctx, gIdx) {
  const e = GLOSSARY[gIdx];
  if (!e) return showGlossaryMenu(ctx);

  const text = [
    `📖 <b>${esc(e.term)}</b>`,
    `<i>${esc(e.origin)}</i>`,
    '',
    esc(e.def),
  ].join('\n');

  await send(ctx, text, [[
    Markup.button.callback('← Глоссарий', 'gl_s'),
    Markup.button.callback('⌂ Меню',      'main'),
  ]]);
}

// ═══════════════════════════════════════════════════════════
// ТАБЛИЦА ПРОДУКТОВ
// ═══════════════════════════════════════════════════════════

async function showFoodCategories(ctx) {
  const rows = FOOD_TABLE.map((cat, i) => [
    Markup.button.callback(`${cat.icon} ${cat.category}`, `ft_c:${i}`)
  ]);
  rows.push([Markup.button.callback('← Главное меню', 'main')]);

  await send(ctx,
    '🍽 <b>Время употребления продуктов</b>\nАюрведические рекомендации\n\nВыберите категорию:',
    rows
  );
}

async function showFoodCategory(ctx, catIdx) {
  const cat = FOOD_TABLE[catIdx];
  if (!cat) return showFoodCategories(ctx);

  const lines = cat.items.map(item => {
    const from = String(item.from).padStart(2, '0') + ':00';
    const to   = String(item.to).padStart(2, '0') + ':00';
    return `• ${esc(item.name)} — <b>${from}–${to}</b>`;
  });

  const text = [
    `${cat.icon} <b>${esc(cat.category)}</b>`,
    '<i>Оптимальное время употребления:</i>',
    '',
    ...lines,
  ].join('\n');

  await send(ctx, text, [[
    Markup.button.callback('← Категории', 'ft_s'),
    Markup.button.callback('⌂ Меню',      'main'),
  ]]);
}

// ═══════════════════════════════════════════════════════════
// ТЕСТ КОНСТИТУЦИИ
// ═══════════════════════════════════════════════════════════

async function showQuizInfo(ctx) {
  const totalQ = QUIZ.sections.reduce((n, s) => n + s.questions.length, 0);
  const sections = QUIZ.sections.map(s => `${s.emoji} ${s.label}`).join('  ·  ');

  const text = [
    `🧪 <b>${esc(QUIZ.title)}</b>`,
    `<i>${esc(QUIZ.subtitle)}</i>`,
    '',
    esc(QUIZ.description),
    '',
    `<b>${totalQ} вопросов</b> по ${sections}`,
    'Шкала ответов: от 0 (совсем не про меня) до 6 (практически всегда).',
    '',
    '📱 Полный интерактивный тест с результатом и расшифровкой — на сайте:',
  ].join('\n');

  await send(ctx, text, [
    [Markup.button.url('🧪 Пройти тест конституции', `${WEB_URL}#quiz`)],
    [Markup.button.callback('← Главное меню', 'main')],
  ]);
}

// ═══════════════════════════════════════════════════════════
// ПОДДЕРЖАТЬ ПРОЕКТ (донат и реквизиты)
// ═══════════════════════════════════════════════════════════

async function showDonate(ctx) {
  const text = [
    '🙏 <b>Поддержать проект</b>',
    '',
    'Этот сайт создан с любовью и посвящён изучению аюрведы.',
    'Все материалы собраны, структурированы и переведены вручную —',
    'чтобы древняя мудрость была доступна на русском языке.',
    '',
    'Если проект оказался вам полезен — любая поддержка',
    'принимается с искренней признательностью 🪷',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '🟢 <b>Сбербанк — по номеру телефона</b>',
    'Номер: <code>+79536533934</code>',
    'Получатель: Екатерина М.',
    '',
    '🟢 <b>Сбербанк — перевод на карту</b>',
    'Карта: <code>2202 2002 8273 4076</code>',
    'Получатель: Екатерина М.',
    '',
    '₿ <b>Bitcoin</b>',
    '<code>1Ad9cXdQfApRJU3H5Ecpd23397njzhHbqV</code>',
    '',
    '₮ <b>USDT TRC20 (Tron)</b>',
    '<code>TDdhyiFRV84VTPWA3yn7PUYLjNTsnaoEuw</code>',
    '',
    '🔷 <b>USDT ERC20 (Ethereum)</b>',
    '<code>0x9c637cbe764f04871385f3e703ff102242fc74fc</code>',
  ].join('\n');

  await send(ctx, text, [
    [Markup.button.callback('← Главное меню', 'main')],
  ]);
}

// ═══════════════════════════════════════════════════════════
// ГЛОБАЛЬНЫЙ ПОИСК
// ═══════════════════════════════════════════════════════════

async function doSearch(ctx, query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    await ctx.reply('Введите не менее 2 символов для поиска.');
    return;
  }

  const results = [];

  // Энциклопедия
  for (let si = 0; si < ENCYCLOPEDIA.length; si++) {
    for (let ai = 0; ai < ENCYCLOPEDIA[si].articles.length; ai++) {
      const art = ENCYCLOPEDIA[si].articles[ai];
      const bodyStr = Array.isArray(art.body || art.content)
        ? (art.body || art.content).join(' ')
        : String(art.body || art.content || '');
      if (art.title.toLowerCase().includes(q) || art.summary?.toLowerCase().includes(q) || bodyStr.toLowerCase().includes(q)) {
        results.push({ label: `📚 ${art.title}`, cb: `enc_r:${si}:${ai}:0` });
      }
    }
  }

  // Болезни
  for (let i = 0; i < DISEASES.length; i++) {
    const d = DISEASES[i];
    if (d.name.toLowerCase().includes(q) || d.origin.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)) {
      results.push({ label: `🌿 ${d.name}`, cb: `dis_r:${i}` });
    }
  }

  // Средства
  for (let i = 0; i < REMEDIES.length; i++) {
    const r = REMEDIES[i];
    if (r.name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)) {
      results.push({ label: `💊 ${r.name}`, cb: `rem_r:${i}:0` });
    }
  }

  // Глоссарий
  for (let i = 0; i < GLOSSARY.length; i++) {
    const e = GLOSSARY[i];
    if (e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q)) {
      results.push({ label: `📖 ${e.term}`, cb: `gl_r:${i}` });
    }
  }

  if (!results.length) {
    await ctx.reply(`🔍 По запросу «${esc(query)}» ничего не найдено.`, { parse_mode: 'HTML' });
    return;
  }

  const shown = results.slice(0, MAX_ITEMS);
  const rows  = shown.map(r => [Markup.button.callback(
    r.label.length > 52 ? r.label.slice(0, 49) + '…' : r.label,
    r.cb
  )]);
  if (results.length > MAX_ITEMS) {
    rows.push([Markup.button.callback(`… ещё ${results.length - MAX_ITEMS} (уточните запрос)`, 'noop')]);
  }
  rows.push([Markup.button.callback('⌂ Меню', 'main')]);

  await ctx.reply(
    `🔍 <b>«${esc(query)}»</b> — найдено ${results.length}:`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) }
  );
}

// ═══════════════════════════════════════════════════════════
// КОМАНДЫ
// ═══════════════════════════════════════════════════════════

bot.start(ctx => showMain(ctx));
bot.command('menu',   ctx => showMain(ctx));
bot.command('help', ctx => ctx.reply([
  '<b>Команды:</b>',
  '/start — главное меню',
  '/search <i>запрос</i> — поиск по всей базе',
  '',
  'Или просто напишите текст — бот найдёт ответ.',
  '',
  `🌐 <a href="${WEB_URL}">Полная версия на сайте</a>`,
].join('\n'), { parse_mode: 'HTML', disable_web_page_preview: true }));

bot.command('search', ctx => {
  const q = ctx.message.text.replace(/^\/search\s*/i, '').trim();
  return q ? doSearch(ctx, q) : ctx.reply('Введите запрос: /search <i>текст</i>', { parse_mode: 'HTML' });
});

// ═══════════════════════════════════════════════════════════
// МАРШРУТИЗАЦИЯ CALLBACK-ЗАПРОСОВ
// ═══════════════════════════════════════════════════════════

bot.on('callback_query', async ctx => {
  await ctx.answerCbQuery().catch(() => {});
  const d = ctx.callbackQuery.data;

  // Простые маршруты
  if (d === 'main')  return showMain(ctx);
  if (d === 'noop')  return;
  if (d === 'enc_s') return showEncSections(ctx);
  if (d === 'bk_s')  return showBookSthanas(ctx);
  if (d === 'dis_s') return showDiseaseCategories(ctx);
  if (d === 'rem_s') return showRemediesMenu(ctx);
  if (d === 'gl_s')  return showGlossaryMenu(ctx);
  if (d === 'ft_s')      return showFoodCategories(ctx);
  if (d === 'qz_s')      return showQuizInfo(ctx);
  if (d === 'donate_s')  return showDonate(ctx);

  // Параметризованные маршруты
  let m;

  if ((m = d.match(/^enc_a:(\d+)$/)))            return showEncArticles(ctx, +m[1]);
  if ((m = d.match(/^enc_r:(\d+):(\d+):(\d+)$/)))return showEncArticle(ctx, +m[1], +m[2], +m[3]);

  if ((m = d.match(/^bk_c:(\d+)$/)))             return showBookChapters(ctx, +m[1]);
  if ((m = d.match(/^bk_r:(\d+):(\d+)$/)))       return showBookChapter(ctx, +m[1], +m[2]);

  if ((m = d.match(/^dis_c:(\d+)$/)))            return showDiseaseList(ctx, +m[1]);
  if ((m = d.match(/^dis_r:(\d+)$/)))            return showDisease(ctx, +m[1]);

  if ((m = d.match(/^rem_r:(\d+):(\d+)$/)))      return showRemedy(ctx, +m[1], +m[2]);
  if ((m = d.match(/^gl_r:(\d+)$/)))             return showGlossaryEntry(ctx, +m[1]);
  if ((m = d.match(/^ft_c:(\d+)$/)))             return showFoodCategory(ctx, +m[1]);

  console.warn('Неизвестный callback:', d);
});

// ═══════════════════════════════════════════════════════════
// ТЕКСТОВЫЕ СООБЩЕНИЯ (поиск + контекстный ввод)
// ═══════════════════════════════════════════════════════════

bot.on('text', async ctx => {
  const text   = ctx.message.text;
  if (text.startsWith('/')) return;

  const chatId = ctx.chat?.id ?? ctx.from?.id;
  const mode   = inputMode.get(chatId);
  inputMode.delete(chatId);

  if (mode === 'remedy')   return searchRemedies(ctx, text);
  if (mode === 'glossary') return searchGlossary(ctx, text);

  // По умолчанию — глобальный поиск
  return doSearch(ctx, text);
});

// ═══════════════════════════════════════════════════════════
// ОБРАБОТКА ОШИБОК И ЗАПУСК
// ═══════════════════════════════════════════════════════════

bot.catch((err, ctx) => {
  console.error(`Ошибка (${ctx.updateType}):`, err.message || err);
  ctx.reply('Произошла ошибка. Попробуйте ещё раз или /start').catch(() => {});
});

console.log('🤖 Бот запускается...');
await bot.launch();
console.log('✅  Бот запущен. Ctrl+C для остановки.');

process.once('SIGINT',  () => { bot.stop('SIGINT');  console.log('Остановлен.'); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); console.log('Остановлен.'); });
