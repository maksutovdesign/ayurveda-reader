import { BOOKS, loadBookData, configureContent } from './books.js?v=231';
import { GLOSSARY, lookupTerm, TERM_REGEX } from './glossary.js';
import { DISEASES, getDiseaseCategories } from './diseases.js?v=231';
import { QUIZ } from './quiz.js';
import { FOOD_TABLE } from './foodtable.js';
import * as Cabinet from './cabinet.js?v=231';
import { icon } from './icons.js?v=231';
import { searchContext, askQuestion } from './chatbot.js';

// Чистые линейные иконки (наследуют цвет кнопки/текста)
const _actSvg = (paths) => `<svg class="act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const SHARE_SVG = _actSvg('<circle cx="7" cy="12" r="2.2"/><circle cx="16.5" cy="6.5" r="2.2"/><circle cx="16.5" cy="17.5" r="2.2"/><path d="M9 11l5.5-3.4"/><path d="M9 13l5.5 3.4"/>');
const HOME_SVG  = _actSvg('<path d="M5 11l7-6 7 6"/><path d="M7 10v8h10v-8"/><path d="M10.5 18v-4h3v4"/>');
const OM_SVG    = _actSvg('<path d="M6 11c0-1.4 1.1-2.5 2.5-2.5S11 9.6 11 11s-1.1 2.5-2.5 2.5c-.9 0-1.6-.4-2-1"/><path d="M11 11c1-1.6 3-2 4.5-1"/><path d="M13.5 13.5c1.6 0 3-1 3-2.6"/><path d="M16.5 6.5c-1 .3-1.6 1-1.6 2"/><circle cx="15.5" cy="5" r="1"/>');
const GLOBE_SVG = _actSvg('<circle cx="12" cy="12" r="7"/><path d="M5 12h14"/><path d="M12 5c2 2.3 2 11.7 0 14"/><path d="M12 5c-2 2.3-2 11.7 0 14"/>');
const PIN_SVG   = _actSvg('<path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5z"/><path d="M12 14v6"/>');
const PENCIL_SVG = _actSvg('<path d="M15.2 4.8a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8.5 19.5 4 20.5l1-4.5z"/><path d="M14 6l4 4"/>');
const SPEAKER_SVG = _actSvg('<path d="M8 9.5v5l4 3V6.5l-4 3z"/><path d="M15 9.5c.8.8 1.2 1.5 1.2 2.5s-.4 1.7-1.2 2.5"/><path d="M17 7.5c1.3 1.3 2 2.8 2 4.5s-.7 3.2-2 4.5"/>');
const LOCK_SVG  = _actSvg('<rect x="7" y="11" width="10" height="8" rx="1.5"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>');

// ── Ленивые тяжёлые данные (энциклопедия 816К + средства 743К) ──
// Грузятся при первом открытии соответствующего раздела, а не на старте.
let ENCYCLOPEDIA = [], ENCYCLOPEDIA_INDEX = null, REMEDIES = [];
let _encLoaded = false, _remLoaded = false, _encMapCache = null;
async function ensureEncyclopedia() {
  if (_encLoaded) return;
  const m = await import('./encyclopedia.js?v=231');
  ENCYCLOPEDIA = m.ENCYCLOPEDIA; ENCYCLOPEDIA_INDEX = m.ENCYCLOPEDIA_INDEX;
  _encLoaded = true; _encMapCache = null;
}
async function ensureRemedies() {
  if (_remLoaded) return;
  const m = await import('./remedies.js?v=231');
  REMEDIES = m.REMEDIES; _remLoaded = true;
}

// ── Статьи сообщества (одобренные в кабинете) — наложение поверх статики ──
const _mergedArticleIds = { glossary: new Set(), remedies: new Set(), encyclopedia: new Set() };
async function mergeArticles(collection) {
  const arts = await Cabinet.loadArticles(collection);
  if (!arts || !arts.length) return false;
  const seen = _mergedArticleIds[collection];
  let added = false;
  if (collection === 'glossary') {
    for (const a of arts) { if (seen.has(a._id)) continue; seen.add(a._id);
      GLOSSARY.push({ term: a.term, origin: a.origin || '', def: a.def, _community: true }); added = true; }
  } else if (collection === 'remedies') {
    await ensureRemedies();
    for (const a of arts) { if (seen.has(a._id)) continue; seen.add(a._id);
      REMEDIES.push({ name: a.name, content: a.content, _community: true }); added = true; }
  } else if (collection === 'encyclopedia') {
    await ensureEncyclopedia();
    let sec = ENCYCLOPEDIA.find(s => s.id === 'community');
    if (!sec) { sec = { id: 'community', title: 'Статьи сообщества', iconKey: 'friends',
      description: 'Материалы, предложенные экспертами и одобренные модерацией', articles: [] };
      ENCYCLOPEDIA.push(sec); }
    for (const a of arts) { if (seen.has(a._id)) continue; seen.add(a._id);
      sec.articles.push({ id: 'comm_' + a._id, title: a.title, summary: a.summary || '',
        content: a.body || '', body: a.body || '', sources: [], _community: true }); added = true; }
  }
  return added;
}

// ── State ──────────────────────────────────────────
let currentBookIdx     = 0;
let currentChapterIdx  = null;
let searchQuery        = '';

/** Активная книга */
function currentBook() { return BOOKS[currentBookIdx]; }
let tooltipTimeout = null;
let openEncArticleFn = null; // set by buildEncyclopediaView; used by glossary cards

// ── Elements ───────────────────────────────────────
const $nav          = document.getElementById('chapter-nav');
const $welcome      = document.getElementById('welcome');
const $chapterView  = document.getElementById('chapter-view');
const $searchRes    = document.getElementById('search-results');
const $glossaryView = document.getElementById('glossary-view');
const $diseasesView = document.getElementById('diseases-view');
const $remediesView = document.getElementById('remedies-view');
const $chapterBody  = document.getElementById('chapter-body');
const $chTitle      = document.getElementById('chapter-title');
const $chSubtitle   = document.getElementById('chapter-subtitle');
const $chBreadcrumb = document.getElementById('chapter-breadcrumb');
const $searchInput  = document.getElementById('search-input');
const $themeToggle  = document.getElementById('theme-toggle');
const $tooltip      = document.getElementById('tooltip');
const $glossaryBtn  = document.getElementById('glossary-btn');
const $diseasesBtn  = document.getElementById('diseases-btn');
const $remediesBtn  = document.getElementById('remedies-btn');
const $encyclopediaView  = document.getElementById('encyclopedia-view');
const $encyclopediaBtn   = document.getElementById('encyclopedia-btn');
const $referencesView    = document.getElementById('references-view');
const $referencesBtn     = document.getElementById('references-btn');
const $foodtableView     = document.getElementById('foodtable-view');
const $foodtableBtn      = document.getElementById('foodtable-btn');
const $quizView          = document.getElementById('quiz-view');
const $quizBtn           = document.getElementById('quiz-btn');
const $friendsView       = document.getElementById('friends-view');
const $friendsBtn        = document.getElementById('friends-btn');
const $donateView        = document.getElementById('donate-view');
const $donateBtn         = document.getElementById('donate-btn');
const $cabinetView       = document.getElementById('cabinet-view');
const $cabinetBtn        = document.getElementById('cabinet-btn');

const ALL_PANELS = [$welcome, $chapterView, $searchRes, $glossaryView, $diseasesView, $remediesView, $encyclopediaView, $referencesView, $foodtableView, $quizView, $friendsView, $donateView, $cabinetView];

function showOnly(panel) {
  ALL_PANELS.forEach(p => { p.hidden = true; });
  panel.hidden = false;
  document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
}

// ── Возврат на главную (welcome) текущей книги ──────
function goHome() {
  currentChapterIdx = null;
  showOnly($welcome);
  buildHomePage();          // обновить «продолжить чтение» / «стих дня»
  setActiveBtn(-1);
  setFooterActive(null);
  history.replaceState(null, '', location.pathname);
  savePosition();
  closeSidebar();
}

// ── Главная страница проекта (статистика + быстрый выбор книг) ──
function firstAvailableChapterIdx(book) {
  const chs = book.chapters || [];
  for (let i = 0; i < chs.length; i++) if (chs[i].available !== false) return i;
  return 0;
}

async function openBook(idx) {
  await selectBook(idx);
  if (currentBookIdx === idx) loadChapter(firstAvailableChapterIdx(currentBook()));
}

function buildHomePage() {
  const grid = document.getElementById('home-book-grid');
  if (!grid) return;
  const statsEl = document.getElementById('home-stats');
  const totalChapters = BOOKS.reduce((s, b) => s + (b.chapters ? b.chapters.length : 0), 0);
  if (statsEl) {
    // Счётчики контента (статичны — обновлять при изменении данных):
    // стихов 34 541, статей энциклопедии 208, домашних средств 113.
    statsEl.innerHTML = [
      `${BOOKS.length} книг`,
      `${totalChapters} глав`,
      '34 500+ стихов',
      '208 статей энциклопедии',
      '113 домашних средств',
      'оригинал · транслитерация · перевод',
    ].map(t => `<span class="home-stat">${t}</span>`).join('');
  }
  grid.innerHTML = BOOKS.map((b, i) => `
    <button class="home-book-card" data-idx="${i}">
      <span class="home-book-icon">${icon(b.iconKey) || icon('leaf')}</span>
      <span class="home-book-info">
        <span class="home-book-name">${escapeHtml(b.titleShort || b.title)}</span>
        <span class="home-book-sub">${escapeHtml(b.subtitle || '')}</span>
        <span class="home-book-stats">${b.stats ? `${b.stats.chapters} глав · ${escapeHtml(String(b.stats.verses))} стихов` : ''}</span>
      </span>
    </button>`).join('');
  grid.querySelectorAll('.home-book-card').forEach(card => {
    card.addEventListener('click', () => openBook(Number(card.dataset.idx)));
  });

  // ── Доп. карточки: продолжить чтение + стих дня ──
  let extra = document.getElementById('home-cards');
  if (!extra) {
    extra = document.createElement('div');
    extra.id = 'home-cards';
    const anchor = document.querySelector('.home-books-title') || grid;
    anchor.parentNode.insertBefore(extra, anchor);
  }
  extra.innerHTML = '';

  const pos = loadSavedPosition();
  if (pos && pos.chIdx != null && BOOKS[pos.bookIdx]) {
    const bk = BOOKS[pos.bookIdx];
    const ch = bk.chapters[pos.chIdx];
    if (ch && ch.available !== false) {
      const c = document.createElement('button');
      c.className = 'home-resume';
      c.innerHTML = `<span class="home-resume-icon">${_actSvg('<path d="M9 4l-5 5 5 5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>')}</span><span class="home-resume-text"><b>Продолжить чтение</b><span>${escapeHtml(bk.titleShort)} · ${ch.number > 0 ? 'гл. ' + ch.number + '. ' : ''}${escapeHtml(ch.title)}</span></span>`;
      c.onclick = async () => { if (pos.bookIdx !== currentBookIdx) await selectBook(pos.bookIdx); loadChapter(pos.chIdx); };
      extra.appendChild(c);
    }
  }

  const vod = verseOfDay();
  if (vod) {
    const ru = vod.b.text || '';      // у Аштанга-хридаи text = русский перевод
    const iast = vod.b.iast_ru || vod.b.iast || ''; // предпочитаем русскую транслитерацию
    const main = ru || iast;          // на случай книги без перевода — IAST
    const card = document.createElement('div');
    card.className = 'home-vod';
    card.innerHTML = `<div class="home-vod-label"><span class="menu-ico menu-ico--inline" data-icon="readbook"></span> Стих дня</div>
      <div class="home-vod-text">${escapeHtml(main)}</div>
      ${ru && iast ? `<div class="home-vod-iast">${escapeHtml(iast)}</div>` : ''}
      <button class="home-vod-link">${escapeHtml(BOOKS[0].titleShort)} · ${escapeHtml(vod.ch.sthana)}, стих ${vod.b.number} →</button>`;
    card.querySelector('.home-vod-link').onclick = async () => {
      _pendingVerse = vod.b.number;
      if (currentBookIdx !== 0) await selectBook(0);
      loadChapter(vod.ci);
    };
    card.querySelectorAll('.menu-ico[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
    extra.appendChild(card);
  }
}

// Детерминированный «стих дня» из Аштанга-хридаи (флагман, загружена сразу)
function verseOfDay() {
  const book = BOOKS[0];
  if (!book || !book.chapters) return null;
  const verses = [];
  book.chapters.forEach((ch, ci) => {
    if (ch.available === false) return;
    (ch.content || []).forEach(bl => {
      if (bl.type === 'verse' && bl.number != null && (bl.iast || bl.text)) verses.push({ ci, ch, b: bl });
    });
  });
  if (!verses.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return verses[day % verses.length];
}

// ── Mobile sidebar ─────────────────────────────────
const $menuBtn       = document.getElementById('menu-btn');
const $sidebarClose  = document.getElementById('sidebar-close');
const $sidebarOverlay= document.getElementById('sidebar-overlay');
const $sidebar       = document.getElementById('sidebar');

const openSidebar  = () => document.body.classList.add('sidebar-open');
const closeSidebar = () => document.body.classList.remove('sidebar-open');

$menuBtn.addEventListener('click', openSidebar);
$sidebarClose.addEventListener('click', closeSidebar);
$sidebarOverlay.addEventListener('click', closeSidebar);

// Auto-close sidebar on any nav action (mobile)
$sidebar.addEventListener('click', e => {
  if (window.innerWidth > 640) return;
  const btn = e.target.closest('.sidebar-footer-btn, #chapter-nav button');
  if (btn) closeSidebar();
});

// ── Sidebar «Разделы» toggle ────
const $footerToggle = document.querySelector('.sidebar-footer-toggle');
if ($footerToggle) {
  const $sidebarFooter = document.getElementById('sidebar-footer');
  if (window.innerWidth <= 640) {
    $sidebarFooter.classList.add('collapsed');
    $footerToggle.setAttribute('aria-expanded', 'false');
  }
  const toggle = () => {
    const collapsed = $sidebarFooter.classList.toggle('collapsed');
    $footerToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (!collapsed) $sidebarFooter.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $footerToggle.addEventListener('click', toggle);
  $footerToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}

// ── Medical disclaimer dismiss + mobile collapse ────
const $disclaimerClose    = document.getElementById('disclaimer-close');
const $footerDisclaimer   = document.getElementById('footer-disclaimer');
const $siteFooter         = document.getElementById('site-footer');
const DISCLAIMER_KEY      = 'disclaimerDismissed';

if (sessionStorage.getItem(DISCLAIMER_KEY)) {
  $footerDisclaimer.hidden = true;
}

// X button — dismiss permanently for the session
$disclaimerClose.addEventListener('click', e => {
  e.stopPropagation();
  $footerDisclaimer.style.transition = 'opacity 0.2s ease';
  $footerDisclaimer.style.opacity = '0';
  setTimeout(() => { $footerDisclaimer.hidden = true; }, 200);
  sessionStorage.setItem(DISCLAIMER_KEY, '1');
});

// Mobile: tap the bar to expand/collapse full text
$footerDisclaimer.addEventListener('click', e => {
  if (window.innerWidth > 640) return;
  if (e.target === $disclaimerClose) return;
  const expanded = $footerDisclaimer.classList.toggle('expanded');
  document.body.classList.toggle('disclaimer-expanded', expanded);
});

// ── Theme ──────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.className = saved;
}
$themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  document.body.className = next;
  localStorage.setItem('theme', next);
});

// ── Tooltip ────────────────────────────────────────
function showTooltip(entry, x, y) {
  $tooltip.innerHTML = `
    <div class="tooltip-term">${entry.term}</div>
    <div class="tooltip-def">${entry.def}</div>
    <div class="tooltip-origin">${entry.origin}</div>
  `;
  const tw = 300, th = 100;
  const left = Math.min(x + 12, window.innerWidth - tw - 16);
  const top  = y + 20 + th > window.innerHeight ? y - th - 8 : y + 20;
  $tooltip.style.left = left + 'px';
  $tooltip.style.top  = top  + 'px';
  $tooltip.classList.add('visible');
}
function hideTooltip() {
  $tooltip.classList.remove('visible');
}

document.addEventListener('mouseover', e => {
  const el = e.target.closest('.skt');
  if (!el) return;
  const entry = lookupTerm(el.dataset.term || el.textContent);
  if (entry) showTooltip(entry, e.clientX, e.clientY);
});
document.addEventListener('mousemove', e => {
  if (e.target.closest('.skt')) return;
  if ($tooltip.classList.contains('visible')) hideTooltip();
});
document.addEventListener('mouseleave', hideTooltip);

// ── Text rendering ─────────────────────────────────
function renderText(text) {
  // Экранируем HTML до вставки разметки, чтобы литеральные < > & в переводах
  // не ломали вёрстку (и не открывали XSS при компрометации данных).
  let t = escapeHtml(text).replace(/ [#*] /g, '<br>• ').replace(/\n/g, '<br>');
  return t.replace(TERM_REGEX, match => {
    const entry = lookupTerm(match);
    if (!entry) return match;
    return `<span class="skt" data-term="${escapeHtml(entry.term)}">${match}</span>`;
  });
}

// Контекст текущей главы для наложения правок и кнопок кабинета
let _renderCtx = null; // { bookId, sthana, chapter }

function ov(field, fallback) {
  if (!_renderCtx) return fallback;
  const v = Cabinet.getOverride(_renderCtx.bookId, _renderCtx.sthana, _renderCtx.chapter, _renderCtx._vnum, field);
  return v != null ? v : fallback;
}

// ── Шеринг стиха, permalink, озвучка, переход к стиху ──
function bookIdxById(id) { return BOOKS.findIndex(b => b.id === id); }

function versePermalink(num) {
  const base = location.origin + location.pathname;
  return `${base}#${currentBook().id}/c${currentChapterIdx}${num != null ? '/v' + num : ''}`;
}

const SITE_NAME = 'Классические самхиты Аюрведы';
async function shareVerse(num) {
  const url = versePermalink(num);   // строится от location.origin → сам подхватит новый домен
  const el = document.getElementById('v' + num);
  const pick = sel => (el && el.querySelector(sel) ? el.querySelector(sel).textContent.trim() : '');
  const quote = pick('.verse-translation') || pick('.verse-text') || pick('.verse-iast') || pick('.verse-devanagari');
  const ch = currentBook().chapters[currentChapterIdx];
  const loc = `${currentBook().titleShort}, ${ch ? ch.sthana : ''}, стих ${num}`;
  // Цитата + атрибуция со ссылкой-источником на наш сайт
  const text = `«${quote}»\n— ${loc}\nИсточник: ${SITE_NAME} — ${url}`;
  if (navigator.share) {
    try { await navigator.share({ title: loc, text }); return; } catch (_) { /* отменили — копируем */ }
  }
  try { await navigator.clipboard.writeText(text); flash('Стих со ссылкой скопирован'); }
  catch (_) { window.prompt('Скопируйте:', text); }
}

// Универсальный шеринг «цитата + источник + ссылка» (статьи, средства, термины)
function shareSnippet(s, max = 280) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max).replace(/\s+\S*$/, '') + '…' : s;
}
async function shareContent(quote, loc, flashMsg, hash) {
  const url = location.origin + location.pathname + (hash != null ? hash : location.hash);
  const text = `«${shareSnippet(quote)}»\n— ${loc}\nИсточник: ${SITE_NAME} — ${url}`;
  if (navigator.share) {
    try { await navigator.share({ title: loc, text }); return; } catch (_) { /* отменили — копируем */ }
  }
  try { await navigator.clipboard.writeText(text); flash(flashMsg || 'Скопировано со ссылкой'); }
  catch (_) { window.prompt('Скопируйте:', text); }
}

let _ttsBtn = null;
function speakVerse(btn, text, lang) {
  if (!('speechSynthesis' in window)) { flash('Озвучка не поддерживается браузером'); return; }
  const synth = window.speechSynthesis;
  const wasThis = btn.classList.contains('playing');
  synth.cancel();
  document.querySelectorAll('.verse-act--tts.playing').forEach(b => b.classList.remove('playing'));
  if (wasThis) return; // повторный клик — стоп
  const u = new SpeechSynthesisUtterance(text);
  if (lang) {
    u.lang = lang;
    // Явно выбрать голос под язык (надёжнее для hi-IN/ru, если движок не делает сам)
    const vs = synth.getVoices() || [];
    const base = lang.split('-')[0];
    const v = vs.find(x => x.lang === lang) || vs.find(x => x.lang && x.lang.replace('_', '-').startsWith(base));
    if (v) u.voice = v;
  }
  u.rate = 0.9;
  u.onend = u.onerror = () => btn.classList.remove('playing');
  btn.classList.add('playing');
  synth.speak(u);
}

let _pendingVerse = null;
function goToVerse(num) {
  const el = document.getElementById('v' + num);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('verse-target'); void el.offsetWidth; el.classList.add('verse-target');
  setTimeout(() => el.classList.remove('verse-target'), 2600);
}

let _flashT = null;
function flash(msg) {
  let t = document.getElementById('app-flash');
  if (!t) { t = document.createElement('div'); t.id = 'app-flash'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.className = 'show';
  clearTimeout(_flashT); _flashT = setTimeout(() => { t.className = ''; }, 2600);
}

function renderBlock(block) {
  const div = document.createElement('div');
  div.className = 'block';

  if (block.type === 'verse') {
    div.classList.add('block-verse');
    if (block.number != null) { div.id = 'v' + block.number; div.dataset.verse = String(block.number); }
    if (_renderCtx) _renderCtx._vnum = String(block.number);
    // Применяем одобренные правки поверх статики
    const sText = ov('text', block.text);
    const sIast = ov('iast_ru', block.iast_ru) || ov('iast', block.iast); // русская транслитерация, IAST как fallback
    const sSkt  = ov('sanskrit', block.sanskrit);
    const sTrans = ov('translation', null); // добавленный экспертами русский перевод
    const verseHeader = block.number != null
      ? `<div class="verse-header"><span class="verse-number">Стих ${block.number}</span></div>`
      : '';
    const devanagariHtml = sSkt
      ? `<div class="verse-devanagari" aria-label="Санскрит">${escapeHtml(sSkt)}</div>`
      : '';
    const iastHtml = sIast
      ? `<div class="verse-iast" aria-label="Транслитерация">${escapeHtml(sIast)}</div>`
      : '';
    const sEng = block.english || '';
    const transHtml = sTrans
      ? `<div class="verse-translation" aria-label="Перевод">${renderText(sTrans)}</div>`
      : '';
    const engHtml = sEng
      ? sEng.length > 500
        ? `<div class="verse-english verse-english--long" aria-label="English"><div class="verse-english__preview">${renderText(sEng.slice(0, sEng.indexOf('. ', 400) + 1) || sEng.slice(0, 500))}&hellip;</div><div class="verse-english__full" hidden>${renderText(sEng)}</div><button class="verse-english__toggle" onclick="this.previousElementSibling.hidden=!this.previousElementSibling.hidden;this.previousElementSibling.previousElementSibling.hidden=!this.previousElementSibling.previousElementSibling.hidden;this.textContent=this.previousElementSibling.hidden?'Show more ▼':'Show less ▲'">Show more ▼</button></div>`
        : `<div class="verse-english" aria-label="English">${renderText(sEng)}</div>`
      : '';
    div.innerHTML = `${verseHeader}${devanagariHtml}${iastHtml}<div class="verse-text">${renderText(sText)}</div>${transHtml}${engHtml}`;
    if (block.number != null) {
      const ruText = sTrans || ((_renderCtx && _renderCtx.lang !== 'en' && _renderCtx.lang !== 'sa') ? sText : '');
      const enText = sEng || ((_renderCtx && _renderCtx.lang === 'en') ? sText : '');
      const actions = document.createElement('div');
      actions.className = 'verse-actions';
      let btns = `<button class="verse-act verse-act--share" title="Поделиться" aria-label="Поделиться стихом">${SHARE_SVG}</button>`;
      if (sSkt) btns += `<button class="verse-act verse-act--tts" data-lang="hi-IN" data-field="skt" title="Озвучить санскрит">${OM_SVG}</button>`;
      if (ruText) btns += `<button class="verse-act verse-act--tts" data-lang="ru-RU" data-field="ru" title="Озвучить русский">РУ</button>`;
      if (enText) btns += `<button class="verse-act verse-act--tts" data-lang="en-US" data-field="en" title="Озвучить English">EN</button>`;
      actions.innerHTML = btns;
      actions.querySelector('.verse-act--share').onclick = () => shareVerse(block.number);
      actions.querySelectorAll('.verse-act--tts').forEach(btn => {
        const field = btn.dataset.field;
        const text = field === 'skt' ? sSkt : field === 'ru' ? ruText : enText;
        btn.onclick = () => speakVerse(btn, text, btn.dataset.lang);
      });
      div.appendChild(actions);
    }
    // Кнопка правки/перевода (для вошедших)
    if (_renderCtx && Cabinet.isLoggedIn() && block.number != null) {
      // Санскрит-только книга без перевода → предлагаем добавить перевод
      const needsTranslation = _renderCtx.lang === 'sa' && !sTrans;
      const btn = document.createElement('button');
      btn.className = 'verse-edit-btn' + (needsTranslation ? ' verse-edit-btn--translate' : '');
      btn.innerHTML = `${PENCIL_SVG} ${needsTranslation ? 'Добавить перевод' : 'Предложить правку'}`;
      const vnum = String(block.number);
      btn.onclick = () => Cabinet.openProposalModal({
        bookId: _renderCtx.bookId, sthana: _renderCtx.sthana,
        chapter: _renderCtx.chapter, verseNumber: vnum,
        oldValue: sTrans || '',
        sanskrit: sSkt || '', iast: sIast || sText || '',
        defaultField: needsTranslation ? 'translation' : undefined,
      });
      div.appendChild(btn);
    }
  } else if (block.type === 'comment') {
    div.classList.add('block-comment');
    const authorName = block.author || currentBook().commentator || '';
    const authorTag = authorName
      ? ` <span class="comment-author">· ${escapeHtml(authorName)}</span>`
      : '';
    div.innerHTML = `<details><summary class="comment-label">Комментарий${authorTag}</summary><div class="comment-text">${renderText(block.text)}</div><div class="verse-actions"><button class="verse-act verse-act--tts" data-lang="ru-RU" title="Озвучить комментарий">${SPEAKER_SVG}</button></div></details>`;
    const cmtTts = div.querySelector('.verse-act--tts');
    if (cmtTts) cmtTts.onclick = () => speakVerse(cmtTts, block.text, 'ru-RU');
  } else if (block.type === 'heading') {
    const lvl = block.level || 1;
    div.classList.add('block-heading', `block-heading--l${lvl}`);
    div.innerHTML = `<span class="heading-text">${escapeHtml(block.heading || block.text || '')}</span>`;
  } else {
    div.classList.add('block-text');
    div.innerHTML = renderText(block.text);
  }

  return div;
}

// Циклический переход по непереведённым стихам (sa-главы, кабинет)
let _lastJumpIdx = -1;
function jumpToNextUntranslated() {
  const verses = [...$chapterBody.querySelectorAll('.block-verse')]
    .filter(v => v.querySelector('.verse-edit-btn--translate'));
  if (!verses.length) { announce('Все стихи этой главы переведены'); return; }
  _lastJumpIdx = (_lastJumpIdx + 1) % verses.length;
  const target = verses[_lastJumpIdx];
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.remove('verse-jump-pulse');
  void target.offsetWidth; // рестарт анимации
  target.classList.add('verse-jump-pulse');
  setTimeout(() => target.classList.remove('verse-jump-pulse'), 2000);
  announce(`Стих ${_lastJumpIdx + 1} из ${verses.length} без перевода`);
}

// ── Book selector ──────────────────────────────────
function buildBookSelector() {
  const $btn      = document.getElementById('book-selector-btn');
  const $icon     = document.getElementById('book-selector-icon');
  const $title    = document.getElementById('book-selector-title');
  const $arrow    = document.getElementById('book-selector-arrow');
  const $dropdown = document.getElementById('book-selector-dropdown');

  // Populate dropdown
  $dropdown.innerHTML = '';
  const frag = document.createDocumentFragment();
  BOOKS.forEach((book, idx) => {
    const item = document.createElement('div');
    item.className = 'book-option' + (idx === currentBookIdx ? ' book-option--active' : '') + (!book.available ? ' book-option--locked' : '');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', idx === currentBookIdx ? 'true' : 'false');
    item.innerHTML = `
      <span class="book-opt-icon">${icon(book.iconKey) || book.icon}</span>
      <span class="book-opt-info">
        <span class="book-opt-title">${escapeHtml(book.titleShort)}</span>
        <span class="book-opt-sub">${escapeHtml(book.subtitle)}</span>
        <span class="book-opt-stats">${book.stats.chapters} глав · ${book.stats.sthanas} разделов</span>
      </span>
      ${!book.available ? '<span class="book-opt-lock">скоро</span>' : ''}
    `;
    item.addEventListener('click', () => {
      selectBook(idx);
      closeBookDropdown();
    });
    frag.appendChild(item);
  });
  $dropdown.appendChild(frag);

  function openBookDropdown() {
    $dropdown.hidden = false;
    $btn.setAttribute('aria-expanded', 'true');
    $arrow.textContent = '▴';
  }
  function closeBookDropdown() {
    $dropdown.hidden = true;
    $btn.setAttribute('aria-expanded', 'false');
    $arrow.textContent = '▾';
  }

  $btn.addEventListener('click', () => {
    if ($dropdown.hidden) openBookDropdown(); else closeBookDropdown();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#book-selector')) closeBookDropdown();
  }, { capture: true });

  // Sync display with current book
  function syncBtn() {
    const book = currentBook();
    const svg = icon(book.iconKey);
    if (svg) $icon.innerHTML = svg; else $icon.textContent = book.icon;
    $title.textContent = book.titleShort;
  }
  syncBtn();

  // Re-sync when book changes (called from selectBook)
  window._syncBookBtn = syncBtn;
}

async function selectBook(idx) {
  currentBookIdx    = idx;
  currentChapterIdx = null;

  // Лениво подгружаем данные книги (если ещё не загружены)
  const bk = currentBook();
  if (!bk._loaded) {
    $nav.innerHTML = '<div class="nav-loading">Загрузка книги…</div>';
    await loadBookData(bk);
    if (currentBookIdx !== idx) return; // пользователь успел переключиться
  }

  // Rebuild nav
  buildNav();

  // Update selector display
  if (window._syncBookBtn) window._syncBookBtn();

  // Re-render dropdown options to reflect new selection
  const items = document.querySelectorAll('.book-option');
  items.forEach((el, i) => {
    el.classList.toggle('book-option--active', i === idx);
    el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
  });

  // Show welcome or book info
  showOnly($welcome);
  setActiveBtn(-1);
  setFooterActive(null);

  // Update browser tab title (логотип и главная — статичные, проектные)
  const book = currentBook();
  document.title = book.titleShort + ' — Классические самхиты Аюрведы';

  // Save only the book choice — chIdx intentionally not saved here
  // (loadChapter saves the full position including chIdx)
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, bookIdx: idx, chIdx: null }));
  } catch (_) {}
}

// ── Navigation ─────────────────────────────────────
function buildNav() {
  const book        = currentBook();
  const chapters    = book.chapters;
  const sthanasOrder = book.sthanas;

  // Group chapters by sthana, preserving order
  const groups = {};
  sthanasOrder.forEach(s => { groups[s] = []; });
  chapters.forEach((ch, idx) => {
    if (!groups[ch.sthana]) groups[ch.sthana] = [];
    groups[ch.sthana].push({ ch, idx });
  });

  $nav.innerHTML = '';

  sthanasOrder.forEach(sthana => {
    const items = groups[sthana];
    if (!items || items.length === 0) return;

    const group = document.createElement('div');
    group.className = 'sthana-group';

    const label = document.createElement('div');
    label.className = 'sthana-label';
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.setAttribute('aria-expanded', 'true');
    label.innerHTML = `<span>${sthana}</span><span class="sthana-arrow">▾</span>`;
    const toggle = () => {
      const collapsed = group.classList.toggle('collapsed');
      label.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };
    label.addEventListener('click', toggle);
    label.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    const chaptersDiv = document.createElement('div');
    chaptersDiv.className = 'sthana-chapters';

    items.forEach(({ ch, idx }) => {
      const btn = document.createElement('button');
      const isUnavailable = ch.available === false;
      btn.className = 'chapter-btn' + (isUnavailable ? ' chapter-btn--stub' : '');
      btn.dataset.idx = idx;
      const numLabel = ch.number > 0 ? `<span class="ch-num">${ch.number}.</span>` : '';
      const langBadge =
        ch.lang === 'en' ? `<span class="ch-lang-badge">ENG</span>` :
        ch.hasEnglish ? `<span class="ch-lang-badge">EN</span>` :
        ch.lang === 'sa' ? `<span class="ch-lang-badge ch-lang-badge--sa">देव</span>` : '';
      btn.innerHTML = `${numLabel}${ch.title}${langBadge}`;
      if (isUnavailable) {
        btn.title = 'Глава не переведена';
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.addEventListener('click', () => loadChapter(idx));
      }
      chaptersDiv.appendChild(btn);
    });

    group.appendChild(label);
    group.appendChild(chaptersDiv);
    $nav.appendChild(group);
  });
}

function setActiveBtn(idx) {
  document.querySelectorAll('.chapter-btn').forEach(btn => {
    const active = parseInt(btn.dataset.idx) === idx;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

// Индикатор офлайн-режима (PWA)
function initOfflineIndicator() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;
  const setOffline = (off) => {
    banner.hidden = !off;
    banner.classList.toggle('show', off);
  };
  // Доверяем событиям напрямую (надёжнее повторного чтения navigator.onLine)
  window.addEventListener('online',  () => setOffline(false));
  window.addEventListener('offline', () => setOffline(true));
  setOffline(!navigator.onLine); // начальное состояние
}

// Объявление для скрин-ридеров (aria-live region)
let _announceT = null;
function announce(msg) {
  const el = document.getElementById('sr-announcer');
  if (!el) return;
  clearTimeout(_announceT);
  el.textContent = '';
  // небольшая задержка, чтобы SR заметил изменение
  _announceT = setTimeout(() => { el.textContent = msg; }, 60);
}

// ── Load chapter ───────────────────────────────────
function loadChapter(idx) {
  const book = currentBook();
  // Если данные книги ещё не подгружены — сначала грузим, потом открываем главу
  if (!book._loaded) {
    showOnly($chapterView);
    $chapterBody.innerHTML = '<div class="nav-loading">Загрузка…</div>';
    loadBookData(book).then(() => {
      if (currentBook() === book) {
        if (book._loaded) loadChapter(idx);
        else $chapterBody.innerHTML = '<div class="nav-loading">Ошибка загрузки. Попробуйте обновить страницу.</div>';
      }
    });
    return;
  }
  currentChapterIdx = idx;
  const ch = currentBook().chapters[idx];

  // Контекст для правок кабинета
  _renderCtx = { bookId: currentBook().id, sthana: ch.sthana, chapter: ch.number, lang: ch.lang, _vnum: null };
  // Подгружаем одобренные правки книги; если появятся новые — перерисуем главу
  Cabinet.loadOverrides(currentBook().id).then(ovs => {
    if (ovs && Object.keys(ovs).length && currentChapterIdx === idx) {
      // перерисовать тело главы с учётом правок
      rerenderChapterBody(ch);
    }
  });

  showOnly($chapterView);

  $chBreadcrumb.textContent = ch.sthana;
  $chTitle.textContent = ch.number > 0
    ? `Глава ${ch.number}. ${ch.title}`
    : ch.title;
  $chSubtitle.textContent = ch.subtitle || '';
  $chSubtitle.hidden = !ch.subtitle;

  renderChapterBody(ch, idx);
  announce(`${currentBook().titleShort}. ${ch.number > 0 ? 'Глава ' + ch.number + '. ' : ''}${ch.title}`);

  // Проверка платного доступа (paywall появляется только если платежи включены)
  applyAccessGate(ch, idx);
  Cabinet.loadEntitlements().then(() => {
    if (currentChapterIdx === idx) applyAccessGate(ch, idx);
  });

  setActiveBtn(idx);
  setFooterActive(null);

  // Переход к конкретному стиху (по permalink)
  if (_pendingVerse != null) {
    const v = _pendingVerse; _pendingVerse = null;
    setTimeout(() => goToVerse(v), 120);
  }

  // Update URL hash (кросс-книжный permalink) and save position
  history.replaceState(null, '', `#${currentBook().id}/c${idx}`);
  savePosition();
}

// Гейтинг: если книга платная и нет доступа, а глава за пределами превью — показать paywall
function applyAccessGate(ch, idx) {
  const book = currentBook();
  const locked = !Cabinet.hasBookAccess(book.id) && idx >= Cabinet.previewChapters();
  if (locked) renderPaywall(ch, book);
}

function renderPaywall(ch, book) {
  $chapterBody.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'paywall';
  box.innerHTML = `
    <div class="paywall-icon">${LOCK_SVG}</div>
    <h3 class="paywall-title">Глава доступна по подписке</h3>
    <p class="paywall-desc">Книга «${escapeHtml(book.titleShort || book.title)}» — часть платного доступа.
    Первые главы открыты для ознакомления. Оформите доступ, чтобы читать целиком.</p>
    <div class="paywall-store"></div>
    <p class="paywall-note">Вход и оплата — в разделе «Кабинет». Аштанга-хридая-самхита доступна бесплатно.</p>
  `;
  $chapterBody.appendChild(box);
  Cabinet.renderStore(box.querySelector('.paywall-store'), book.id);
}

// Перерисовать тело главы (вызывается при появлении правок кабинета)
function rerenderChapterBody(ch) {
  if (currentChapterIdx == null) return;
  renderChapterBody(ch, currentChapterIdx);
}

// Рендер заголовочных контролов + контента + навигации главы
function renderChapterBody(ch, idx) {
  $chapterBody.innerHTML = '';
  const frag = document.createDocumentFragment();

  // Check if chapter has any Sanskrit/IAST blocks
  const hasDeva = (ch.content || []).some(b => b.sanskrit);
  const hasIast = (ch.content || []).some(b => b.iast);
  const hasEnglish = (Array.isArray(ch.english) && ch.english.length > 0)
    || (ch.content || []).some(b => b.english);
  const view    = document.getElementById('chapter-view');
  if (hasDeva) view.classList.add('show-devanagari'); else view.classList.remove('show-devanagari');
  if (hasIast) view.classList.add('show-iast'); else view.classList.remove('show-iast');
  if (!hasEnglish) view.classList.remove('show-english');  // нет англ. в этой главе → не залипаем в режиме English

  // Переход к стиху по номеру — для длинных глав (Джвара 880, Вата 365 и т.п.)
  const verseCount = (ch.content || []).filter(b => b.type === 'verse' && b.number != null).length;
  const controls = document.getElementById('chapter-controls');
  let $jump = document.getElementById('verse-jump');
  if (controls && verseCount > 0) {
    if (!$jump) {
      $jump = document.createElement('form');
      $jump.id = 'verse-jump'; $jump.className = 'verse-jump';
      $jump.innerHTML = '<input type="number" min="1" inputmode="numeric" aria-label="Перейти к стиху по номеру" placeholder="№ стиха" /><button type="submit" aria-label="Перейти к стиху">→</button>';
      controls.appendChild($jump);
      $jump.addEventListener('submit', (e) => {
        e.preventDefault();
        const n = $jump.querySelector('input').value.trim();
        if (!n) return;
        const el = document.getElementById('v' + n);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.remove('verse-jump-pulse'); void el.offsetWidth; el.classList.add('verse-jump-pulse');
          setTimeout(() => el.classList.remove('verse-jump-pulse'), 2000);
        } else flash('Стих ' + n + ' не найден');
      });
    }
    $jump.hidden = false;
    $jump.querySelector('input').setAttribute('max', String(verseCount));
  } else if ($jump) {
    $jump.hidden = true;
  }

  // ── Кнопка → следующая глава (верхняя панель) ──────────
  if (controls) {
    let $nextBtn = document.getElementById('chapter-next-btn');
    const book = currentBook();
    let nextIdx = null;
    for (let i = idx + 1; i < book.chapters.length; i++) {
      if (book.chapters[i].available !== false) { nextIdx = i; break; }
    }
    if (nextIdx !== null) {
      if (!$nextBtn) {
        $nextBtn = document.createElement('button');
        $nextBtn.id = 'chapter-next-btn';
        $nextBtn.className = 'chapter-next-btn';
        $nextBtn.title = 'Следующая глава';
        $nextBtn.textContent = '→';
        controls.appendChild($nextBtn);
      }
      $nextBtn.hidden = false;
      $nextBtn.onclick = () => loadChapter(nextIdx);
    } else if ($nextBtn) {
      $nextBtn.hidden = true;
    }
  }

  // ── Sanskrit controls: три отдельные кнопки देव / IAST / ОФ ─────────
  let $sktBar = document.getElementById('skt-bar');
  if (!$sktBar) {
    $sktBar = document.createElement('div');
    $sktBar.id = 'skt-bar';
    $sktBar.className = 'skt-bar';
    document.getElementById('chapter-header').appendChild($sktBar);
  }

  if (hasDeva || hasIast || hasEnglish) {
    $sktBar.hidden = false;
    $sktBar.innerHTML = '';

    if (hasDeva) {
      const btnDev = document.createElement('button');
      btnDev.className = 'skt-btn' + (view.classList.contains('show-devanagari') ? ' skt-btn--on' : '');
      btnDev.textContent = 'देव';
      btnDev.title = 'Деванагари (оригинальный санскрит)';
      btnDev.onclick = () => {
        view.classList.toggle('show-devanagari');
        btnDev.classList.toggle('skt-btn--on');
      };
      $sktBar.appendChild(btnDev);
    }

    if (hasIast) {
      const btnIast = document.createElement('button');
      btnIast.className = 'skt-btn' + (view.classList.contains('show-iast') ? ' skt-btn--on' : '');
      btnIast.textContent = 'Транслит';
      btnIast.title = 'Русская транслитерация санскрита';
      btnIast.onclick = () => {
        view.classList.toggle('show-iast');
        btnIast.classList.toggle('skt-btn--on');
      };
      $sktBar.appendChild(btnIast);
    }

    if (hasEnglish) {
      const btnEn = document.createElement('button');
      btnEn.className = 'skt-btn skt-btn--en' + (view.classList.contains('show-english') ? ' skt-btn--on' : '');
      btnEn.textContent = 'EN';
      btnEn.title = 'Английский перевод (Bhishagratna)';
      btnEn.onclick = () => {
        view.classList.toggle('show-english');
        btnEn.classList.toggle('skt-btn--on');
      };
      $sktBar.appendChild(btnEn);
    }
  } else {
    $sktBar.hidden = true;
  }

  // Language notice
  if (ch.lang === 'en') {
    const notice = document.createElement('div');
    notice.className = 'chapter-lang-notice';
    notice.innerHTML = `<span class="chapter-lang-notice__icon">${GLOBE_SVG}</span> Глава не переведена на русский — показан английский перевод (easyayurveda.com)`;
    frag.appendChild(notice);
  } else if (ch.lang === 'sa') {
    const notice = document.createElement('div');
    notice.className = 'chapter-lang-notice chapter-lang-notice--sa';
    // Прогресс перевода главы (учитываем одобренные правки кабинета)
    const verseBlocks = (ch.content || []).filter(b => b.type === 'verse' && b.number != null);
    const total = verseBlocks.length;
    let done = 0;
    for (const b of verseBlocks) {
      const t = Cabinet.getOverride(_renderCtx.bookId, ch.sthana, ch.number, String(b.number), 'translation');
      if (t != null && String(t).trim()) done++;
    }
    const pct = total ? Math.round(done / total * 100) : 0;
    const loggedIn = Cabinet.isLoggedIn();
    const tail = done >= total ? ' ✓ глава переведена'
      : loggedIn ? ` · <button class="sa-jump-btn" id="sa-jump">→ к непереведённому стиху</button>`
      : ` · <span class="sa-help">войдите в кабинет, чтобы помочь с переводом</span>`;
    const progressHtml = total ? `
      <div class="sa-progress">
        <div class="sa-progress-bar"><span style="width:${pct}%"></span></div>
        <div class="sa-progress-text">Переведено ${done} из ${total}${tail}</div>
      </div>` : '';
    notice.innerHTML = `<div class="sa-notice-line"><span class="chapter-lang-notice__icon">${OM_SVG}</span> Перевод недоступен — показан оригинал на санскрите (деванагари) и транслитерация IAST. Источник: SARIT corpus</div>${progressHtml}`;
    frag.appendChild(notice);
  }

  ch.content.forEach(block => frag.appendChild(renderBlock(block)));

  // Английский перевод (Бхишагратна) — отдельная панель (только если есть chapter-level массив)
  if (Array.isArray(ch.english) && ch.english.length > 0) {
    const pane = document.createElement('div');
    pane.className = 'english-pane';
    const src = ch.englishOcr
      ? 'Перевод: Kaviraj Kunjalal Bhishagratna (1907–1916), public domain. Распознано из скана (archive.org) — возможны ошибки OCR.'
      : 'Перевод: Kaviraj Kunjalal Bhishagratna (1907–1916), public domain · en.wikisource.org';
    pane.innerHTML = ch.english.map(p => `<p>${escapeHtml(p)}</p>`).join('')
      + `<p class="english-source">${escapeHtml(src)}</p>`;
    frag.appendChild(pane);
  }

  $chapterBody.appendChild(frag); // ← контент главы в DOM

  // Переход к следующему непереведённому стиху (краудсорс-перевод)
  _lastJumpIdx = -1;
  const jumpBtn = document.getElementById('sa-jump');
  if (jumpBtn) jumpBtn.onclick = jumpToNextUntranslated;

  // ── Навигация глав (←/→) ──────────────────────────
  const navFrag = document.createDocumentFragment();
  const navBar = document.createElement('div');
  navBar.className = 'chapter-nav-bar';

  const book = currentBook();
  // Предыдущая доступная глава
  let prevIdx = null;
  for (let i = idx - 1; i >= 0; i--) {
    if (book.chapters[i].available !== false) { prevIdx = i; break; }
  }
  // Следующая доступная глава
  let nextIdx = null;
  for (let i = idx + 1; i < book.chapters.length; i++) {
    if (book.chapters[i].available !== false) { nextIdx = i; break; }
  }

  if (prevIdx !== null) {
    const btn = document.createElement('button');
    btn.className = 'ch-nav-btn ch-nav-btn--prev';
    const prev = book.chapters[prevIdx];
    btn.innerHTML = `← ${prev.number > 0 ? prev.number + '. ' : ''}${escapeHtml(prev.title)}`;
    btn.addEventListener('click', () => loadChapter(prevIdx));
    navBar.appendChild(btn);
  } else {
    navBar.appendChild(document.createElement('span')); // placeholder
  }

  if (nextIdx !== null) {
    const btn = document.createElement('button');
    btn.className = 'ch-nav-btn ch-nav-btn--next';
    const next = book.chapters[nextIdx];
    btn.innerHTML = `${next.number > 0 ? next.number + '. ' : ''}${escapeHtml(next.title)} →`;
    btn.addEventListener('click', () => loadChapter(nextIdx));
    navBar.appendChild(btn);
  }

  navFrag.appendChild(navBar);
  $chapterBody.appendChild(navFrag);
}

// ── Glossary → Encyclopedia lookup ─────────────────
// For each glossary term, find the best-matching encyclopedia article.
// Лениво: пока энциклопедия не загружена — пустая карта (ссылок нет).
function glossaryEncMap() {
  if (_encMapCache) return _encMapCache;
  const map = {};
  for (const sec of ENCYCLOPEDIA) {
    for (const art of sec.articles) {
      const titleLower = art.title.toLowerCase();
      for (const entry of GLOSSARY) {
        const termLower = entry.term.toLowerCase();
        if (titleLower.includes(termLower) || termLower.includes(titleLower)) {
          if (!map[entry.term]) map[entry.term] = { secId: sec.id, artId: art.id };
        }
      }
    }
  }
  if (_encLoaded) _encMapCache = map; // кешируем только когда данные реально загружены
  return map;
}

// ── Glossary view ──────────────────────────────────
function buildGlossaryView() {
  const body = document.getElementById('glossary-body');
  const countEl = document.getElementById('glossary-count');
  const filterEl = document.getElementById('glossary-filter');

  countEl.textContent = `${GLOSSARY.length} терминов`;

  // Group by category (first word of def context)
  const categories = {
    'Три доши и их субтипы': [],
    'Семь тканей (дхату)': [],
    'Тонкие эссенции': [],
    'Шесть вкусов': [],
    'Качества (гуны)': [],
    'Пять элементов': [],
    'Органы чувств': [],
    'Панча-карма и терапия': [],
    'Диагностика': [],
    'Растения и препараты': [],
    'Философия и психология': [],
    'Здоровье и болезнь': [],
    'Распорядок жизни': [],
    'Каналы': [],
    'Классические авторы': [],
    'Болезни': [],
    'Разное': [],
  };

  const catMap = {
    'Вата':'Три доши и их субтипы','Пита':'Три доши и их субтипы','Питта':'Три доши и их субтипы',
    'Капха':'Три доши и их субтипы','Доша':'Три доши и их субтипы','Доши':'Три доши и их субтипы',
    'Тридоша':'Три доши и их субтипы','Апана':'Три доши и их субтипы','Самана':'Три доши и их субтипы',
    'Удана':'Три доши и их субтипы','Вьяна':'Три доши и их субтипы',
    'Пачака':'Три доши и их субтипы','Ранджака':'Три доши и их субтипы','Садхака':'Три доши и их субтипы',
    'Алочака':'Три доши и их субтипы','Бхраджака':'Три доши и их субтипы',
    'Кледака':'Три доши и их субтипы','Авалабхака':'Три доши и их субтипы','Бодхака':'Три доши и их субтипы',
    'Тарпака':'Три доши и их субтипы','Шлешака':'Три доши и их субтипы',
    'Дхату':'Семь тканей (дхату)','Раса':'Семь тканей (дхату)','Ракта':'Семь тканей (дхату)',
    'Мамса':'Семь тканей (дхату)','Меда':'Семь тканей (дхату)','Астхи':'Семь тканей (дхату)',
    'Маджа':'Семь тканей (дхату)','Шукра':'Семь тканей (дхату)',
    'Оджас':'Тонкие эссенции','Тежас':'Тонкие эссенции','Прана':'Тонкие эссенции','Агни':'Тонкие эссенции','Аама':'Тонкие эссенции',
    'Мадхура':'Шесть вкусов','Амла':'Шесть вкусов','Лавана':'Шесть вкусов',
    'Тикта':'Шесть вкусов','Кату':'Шесть вкусов','Кашая':'Шесть вкусов',
    'Гуна':'Качества (гуны)','Гуны':'Качества (гуны)','Лагху':'Качества (гуны)',
    'Гуру':'Качества (гуны)','Снигдха':'Качества (гуны)','Рукша':'Качества (гуны)',
    'Ушна':'Качества (гуны)','Шита':'Качества (гуны)','Сукшма':'Качества (гуны)','Стхула':'Качества (гуны)',
    'Притхви':'Пять элементов','Джала':'Пять элементов','Ваю':'Пять элементов',
    'Акаша':'Пять элементов','Панча':'Пять элементов','Сапта':'Пять элементов',
    'Гандха':'Органы чувств','Рупа':'Органы чувств','Шабда':'Органы чувств','Спарша':'Органы чувств',
    'Панчакарма':'Панча-карма и терапия','Шодхана':'Панча-карма и терапия','Шамана':'Панча-карма и терапия',
    'Снехана':'Панча-карма и терапия','Сведана':'Панча-карма и терапия','Вамана':'Панча-карма и терапия',
    'Вирекана':'Панча-карма и терапия','Насья':'Панча-карма и терапия','Басти':'Панча-карма и терапия',
    'Рактамокшана':'Панча-карма и терапия','Лангхана':'Панча-карма и терапия','Брумхана':'Панча-карма и терапия',
    'Расаяна':'Панча-карма и терапия','Ваджикарана':'Панча-карма и терапия','Снеха':'Панча-карма и терапия',
    'Парикша':'Диагностика','Дарша':'Диагностика','Нидана':'Диагностика','Чикитса':'Диагностика',
    'Гхи':'Растения и препараты','Гхрита':'Растения и препараты','Трипхала':'Растения и препараты',
    'Харитаки':'Растения и препараты','Амалаки':'Растения и препараты','Бибхитака':'Растения и препараты',
    'Гудучи':'Растения и препараты','Шатавари':'Растения и препараты','Брахми':'Растения и препараты',
    'Арджуна':'Растения и препараты','Нимба':'Растения и препараты','Пиппали':'Растения и препараты',
    'Муста':'Растения и препараты','Амрита':'Растения и препараты','Чандана':'Растения и препараты',
    'Патола':'Растения и препараты','Сарива':'Растения и препараты','Ватсака':'Растения и препараты',
    'Патхья':'Растения и препараты','Трикату':'Растения и препараты','Маданапхала':'Растения и препараты',
    'Шринги':'Растения и препараты','Мадхука':'Растения и препараты','Дхатри':'Растения и препараты',
    'Кирататикта':'Растения и препараты','Катукарохини':'Растения и препараты',
    'Калинга':'Растения и препараты','Кшаудра':'Растения и препараты','Таила':'Растения и препараты',
    'Дхарма':'Философия и психология','Карма':'Философия и психология','Мокша':'Философия и психология',
    'Рага':'Философия и психология','Двеша':'Философия и психология','Моха':'Философия и психология',
    'Саттва':'Философия и психология','Раджас':'Философия и психология','Тамас':'Философия и психология',
    'Буддхи':'Философия и психология','Манас':'Философия и психология','Ахамкара':'Философия и психология',
    'Пуруша':'Философия и психология','Джива':'Философия и психология','Атман':'Философия и психология',
    'Санкхья':'Философия и психология','Йога':'Философия и психология','Крия':'Философия и психология',
    'Свастха':'Здоровье и болезнь','Арогья':'Здоровье и болезнь','Паква':'Здоровье и болезнь',
    'Апаква':'Здоровье и болезнь','Пурва':'Здоровье и болезнь','Сиддхи':'Здоровье и болезнь',
    'Пракрити':'Здоровье и болезнь','Викрити':'Здоровье и болезнь',
    'Джвара':'Болезни','Каса':'Болезни','Аджирна':'Болезни','Атисара':'Болезни',
    'Грахани':'Болезни','Прамеха':'Болезни','Пандурога':'Болезни','Удара':'Болезни',
    'Аршас':'Болезни','Шваса':'Болезни','Апасмара':'Болезни','Унмада':'Болезни','Хридрога':'Болезни',
    'Диначарья':'Распорядок жизни','Ритучарья':'Распорядок жизни','Пранаяма':'Распорядок жизни',
    'Нади':'Каналы','Сира':'Каналы','Дамани':'Каналы','Малы':'Каналы',
    'Вайдья':'Классические авторы','Вагбхата':'Классические авторы','Чарака':'Классические авторы',
    'Сушрута':'Классические авторы','Атрея':'Классические авторы','Брахма':'Классические авторы',
    'Аштанга':'Разное','Самхита':'Разное','Хридая':'Разное','Шлока':'Разное',
  };

  function renderAll(filter) {
    body.innerHTML = '';
    const q = filter.toLowerCase().trim();
    const filtered = q
      ? GLOSSARY.filter(e => e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q) || e.origin.toLowerCase().includes(q))
      : GLOSSARY;

    // Group
    const grouped = {};
    for (const entry of filtered) {
      const cat = catMap[entry.term] || 'Разное';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(entry);
    }

    const catOrder = Object.keys(categories);
    const frag = document.createDocumentFragment();

    for (const cat of catOrder) {
      if (!grouped[cat] || grouped[cat].length === 0) continue;
      const label = document.createElement('div');
      label.className = 'glossary-category-title';
      label.textContent = cat;
      frag.appendChild(label);

      for (const entry of grouped[cat]) {
        const card = document.createElement('div');
        const encRef = glossaryEncMap()[entry.term];
        card.className = encRef ? 'glossary-card glossary-card--linked' : 'glossary-card';
        card.innerHTML = `
          <div class="glossary-card-term">${entry.term}${encRef ? ' <span class="glossary-enc-link">→ статья</span>' : ''}</div>
          <div class="glossary-card-origin">${entry.origin}</div>
          <div class="glossary-card-def">${entry.def}</div>
          <button class="card-share" title="Поделиться термином" aria-label="Поделиться термином">${SHARE_SVG}</button>
        `;
        if (encRef) {
          card.addEventListener('click', async () => {
            await ensureEncyclopedia();
            buildEncyclopediaView();
            openEncArticleFn && openEncArticleFn(encRef.secId, encRef.artId);
          });
        }
        card.querySelector('.card-share').addEventListener('click', (e) => {
          e.stopPropagation();
          shareContent(`${entry.term} — ${entry.def}`, `Глоссарий терминов: ${entry.term}`, 'Термин скопирован со ссылкой', '#glossary');
        });
        frag.appendChild(card);
      }
    }

    if (frag.childNodes.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-results';
      msg.textContent = `Термин «${filter}» не найден`;
      frag.appendChild(msg);
    }
    body.appendChild(frag);
    countEl.textContent = `${filtered.length} из ${GLOSSARY.length} терминов`;
  }

  renderAll('');

  filterEl.addEventListener('input', () => renderAll(filterEl.value));
}

// ── Chapter lookup for disease cross-links ─────────
// Disease cross-refs always point to Аштанга-хридая (book 0)
function findChapterByRef(ref) {
  const m = ref.match(/^(.+),\s*Гл\.(\d+)$/);
  if (!m) return -1;
  const sthana = m[1].trim();
  const num = parseInt(m[2]);
  return BOOKS[0].chapters.findIndex(ch => ch.sthana === sthana && ch.number === num);
}

function loadAHChapter(idx) {
  // Navigate to AH (book 0) and open chapter
  if (currentBookIdx !== 0) selectBook(0);
  loadChapter(idx);
}

// ── Diseases view ──────────────────────────────────
let diseasesBuilt = false;
function buildDiseasesView() {
  const body     = document.getElementById('diseases-body');
  const filterEl = document.getElementById('diseases-filter');
  const countEl  = document.getElementById('diseases-count');
  const cats     = getDiseaseCategories();

  function render(filter) {
    const q = (filter || '').toLowerCase().trim();
    body.innerHTML = '';
    const frag = document.createDocumentFragment();
    let shown = 0;

    for (const [cat, diseases] of Object.entries(cats)) {
      const matched = q
        ? diseases.filter(d =>
            (d.name||'').toLowerCase().includes(q) ||
            (d.origin||'').toLowerCase().includes(q) ||
            (d.dosha||'').toLowerCase().includes(q) ||
            (d.desc||'').toLowerCase().includes(q) ||
            (d.treatment||'').toLowerCase().includes(q) ||
            cat.toLowerCase().includes(q))
        : diseases;
      if (!matched.length) continue;

      const section = document.createElement('div');
      section.className = 'disease-category';
      const title = document.createElement('div');
      title.className = 'disease-category-title';
      title.textContent = cat;
      section.appendChild(title);

      for (const d of matched) {
        shown++;
        const card = document.createElement('div');
        card.className = 'disease-card';
        const chips = d.chapters.map(c => {
          const idx = findChapterByRef(c);
          return idx >= 0
            ? `<span class="disease-chip disease-chip--link" data-chapter-idx="${idx}">${c}</span>`
            : `<span class="disease-chip">${c}</span>`;
        }).join('');
        card.innerHTML = `
          <div class="disease-card-header">
            <span class="disease-card-name">${d.name}</span>
            <span class="disease-card-origin">${d.origin}</span>
            <span class="disease-card-dosha">${d.dosha}</span>
          </div>
          <div class="disease-card-desc">${d.desc}</div>
          <div class="disease-card-treatment">${d.treatment}</div>
          <div class="disease-card-chapters">${chips}</div>
        `;
        section.appendChild(card);
      }
      frag.appendChild(section);
    }

    if (shown === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-results';
      msg.textContent = `По запросу «${filter}» ничего не найдено`;
      frag.appendChild(msg);
    }
    body.appendChild(frag);
    if (countEl) countEl.textContent = q ? `${shown} из ${DISEASES.length}` : `${DISEASES.length} болезней`;
  }

  if (!diseasesBuilt) {
    body.addEventListener('click', e => {
      const chip = e.target.closest('.disease-chip--link');
      if (!chip) return;
      const idx = parseInt(chip.dataset.chapterIdx);
      if (!isNaN(idx)) loadAHChapter(idx);
    });
    if (filterEl) {
      filterEl.addEventListener('input', () => render(filterEl.value));
      filterEl.addEventListener('keydown', e => {
        if (e.key === 'Escape') { filterEl.value = ''; render(''); }
      });
    }
    diseasesBuilt = true;
  }
  render(filterEl ? filterEl.value : '');
}

function setFooterActive(id) {
  $glossaryBtn.classList.toggle('active', id === 'glossary');
  $diseasesBtn.classList.toggle('active', id === 'diseases');
  $remediesBtn.classList.toggle('active', id === 'remedies');
  $encyclopediaBtn.classList.toggle('active', id === 'encyclopedia');
  $referencesBtn.classList.toggle('active', id === 'references');
  $foodtableBtn.classList.toggle('active', id === 'foodtable');
  $quizBtn.classList.toggle('active', id === 'quiz');
  if ($friendsBtn) $friendsBtn.classList.toggle('active', id === 'friends');
  $donateBtn.classList.toggle('active', id === 'donate');
  if ($cabinetBtn) $cabinetBtn.classList.toggle('active', id === 'cabinet');
}

// ── Remedies view ──────────────────────────────────
let remediesBuilt = false;

// ── Remedies text renderer ──────────────────────────────────────────────────
// Pattern for ingredient lines: "herb name — quantity unit"
const REM_ING_PAT = /^[а-яёА-ЯЁ][а-яёА-ЯЁ\s(),\/]+—\s*[\d\/]/;

function isRemHeading(line) {
  return line.length < 72 &&
    /^[А-ЯЁ]/.test(line) &&
    !/[.!?,;:]$/.test(line) &&
    !line.includes('!') &&
    !line.includes(',') &&
    // adjective all cases + gerunds + infinitives (soft-wrapped mid-sentence text)
    !/(?:ой|ей|ий|ый|ого|его|ому|ему|ою|ею|ые|ие|ых|их|ым|им|уя|юя|ая|яя|ть|ться)$/i.test(line) &&
    !/—\s*\d/.test(line);
}

function renderRemInline(raw) {
  let s = escapeHtml(raw);
  // Make cross-remedy references clickable: (см. «Name») or (Дополнит. рекомендации... «Name».)
  s = s.replace(/\([^()]*«([^»]+)»[^()]*\)/g, (match, name) =>
    `<a class="rem-cross-ref" data-remedy="${name}" href="#">${match}</a>`
  );
  // Make "См. также «Name»." references at start of articles clickable
  s = s.replace(/([Сс]м\.\s+также\s+«([^»]+)»)/g, (match, full, name) =>
    `<a class="rem-cross-ref" data-remedy="${name}" href="#">${full}</a>`
  );
  return s;
}

function parseRemLines(lines) {
  const out = [];
  let textBuf = [];
  let ingBuf  = [];
  let bulletLines = [];

  const flushText = () => {
    if (!textBuf.length) return;
    const joined = textBuf.join(' ').replace(/\s{2,}/g, ' ').trim();
    textBuf = [];
    if (!joined) return;
    if (/^(?:ВНИМАНИЕ|ПРИМЕЧАНИЕ)/.test(joined)) {
      const label = joined.match(/^([А-ЯЁ]+[!:]?)/)[1];
      const cls = label.startsWith('ПРИМЕЧАНИЕ') ? 'rem-note' : 'rem-warning';
      out.push(`<div class="${cls}"><strong>${escapeHtml(label)}</strong>${renderRemInline(joined.slice(label.length).replace(/^\s*/, ' '))}</div>`);
      return;
    }
    // Detect labeled subparagraph: "SubTitle. rest of text…"
    const lblM = joined.match(/^([А-ЯЁ][а-яёА-ЯЁ\s\-]{1,35})\.\s+(.+)$/s);
    if (lblM) {
      out.push(`<p><strong class="rem-sublabel">${escapeHtml(lblM[1])}.</strong> ${renderRemInline(lblM[2])}</p>`);
    } else {
      out.push(`<p>${renderRemInline(joined)}</p>`);
    }
  };

  const flushIng = () => {
    if (!ingBuf.length) return;
    if (ingBuf.length < 2) { textBuf.push(...ingBuf); ingBuf = []; return; }
    out.push('<ul class="rem-ingredients">' +
      ingBuf.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>');
    ingBuf = [];
  };

  const flushBullets = () => {
    if (!bulletLines.length) return;
    const items = [];
    let cur = '';
    for (const l of bulletLines) {
      if (l.startsWith('•')) { if (cur) items.push(cur.trim()); cur = l.replace(/^•\s*/, ''); }
      else cur += ' ' + l;
    }
    if (cur) items.push(cur.trim());
    out.push('<ul>' + items.map(i => `<li>${renderRemInline(i)}</li>`).join('') + '</ul>');
    bulletLines = [];
  };

  for (const line of lines) {
    if (line.startsWith('•')) {
      flushText(); flushIng();
      bulletLines.push(line);
    } else if (REM_ING_PAT.test(line) && line.length < 65) {
      flushText(); flushBullets();
      ingBuf.push(line);
    } else {
      if (bulletLines.length > 0 && /^[а-яё]/.test(line)) {
        bulletLines[bulletLines.length - 1] += ' ' + line;
      } else {
        flushIng(); flushBullets();
        textBuf.push(line);
      }
    }
  }
  flushText(); flushIng(); flushBullets();
  return out;
}

function renderRemedyContent(text, remedyName) {
  const result = [];
  const blocks = text.split(/\n\n+/);

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    let lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const first = lines[0];

    // Skip/strip redundant title line (remedy name repeated as first line)
    const isName = remedyName && (first === remedyName || first.replace(/ё/g,'е') === remedyName.replace(/ё/g,'е'));
    if (isName) {
      lines = lines.slice(1);    // remove duplicate title regardless of block length
      if (!lines.length) continue;
    }

    const head = lines[0];

    // Standalone heading block
    if (lines.length === 1 && isRemHeading(head)) {
      result.push(`<h4>${escapeHtml(head)}</h4>`);
      continue;
    }

    // Multi-line block: heading only when isRemHeading passes AND the continuation
    // line does not start with a lowercase letter (which signals mid-sentence wrap)
    const nextStartsLower = /^[а-яё(«]/.test(lines[1] || '');
    if (lines.length > 1 && isRemHeading(head) && !nextStartsLower) {
      result.push(`<h4>${escapeHtml(head)}</h4>`);
      result.push(...parseRemLines(lines.slice(1)));
      continue;
    }

    result.push(...parseRemLines(lines));
  }
  return result.join('');
}

function buildRemediesView() {
  const $list   = document.getElementById('remedies-list');
  const $detail = document.getElementById('remedies-detail');
  const $filter = document.getElementById('remedies-filter');
  const $back   = document.getElementById('remedies-back');
  const $dtitle = document.getElementById('remedies-detail-title');
  const $dbody  = document.getElementById('remedies-detail-body');

  if (remediesBuilt) return;
  remediesBuilt = true;

  function renderList(query) {
    $list.innerHTML = '';
    const q = query.toLowerCase().trim();
    const items = q
      ? REMEDIES.filter(r => r.name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q))
      : REMEDIES;

    if (items.length === 0) {
      $list.innerHTML = `<div class="no-results">Ничего не найдено по запросу «${escapeHtml(query)}»</div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach(remedy => {
      const card = document.createElement('div');
      card.className = 'remedy-card';
      const preview = remedy.content.replace(/\n+/g, ' ').slice(0, 180).trim();
      card.innerHTML = `
        <div class="remedy-card-name">${escapeHtml(remedy.name)}</div>
        <div class="remedy-card-preview">${escapeHtml(preview)}…</div>
      `;
      card.addEventListener('click', () => {
        $dtitle.textContent = remedy.name;
        $dbody.innerHTML = renderRemedyContent(remedy.content, remedy.name);
        let sb = $detail.querySelector('.card-share');
        if (!sb) { sb = document.createElement('button'); sb.className = 'card-share card-share--inline'; sb.innerHTML = SHARE_SVG + ' Поделиться'; }
        $dbody.after(sb); // в конец статьи, после текста
        sb.onclick = () => shareContent(remedy.content, `Домашнее средство: ${remedy.name}`, 'Средство скопировано со ссылкой', '#remedies');
        $list.hidden = true;
        $filter.parentElement.hidden = true;
        $detail.hidden = false;
        document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
      });
      frag.appendChild(card);
    });
    $list.appendChild(frag);
  }

  renderList('');

  let filterDebounce = null;
  $filter.addEventListener('input', () => {
    clearTimeout(filterDebounce);
    filterDebounce = setTimeout(() => renderList($filter.value), 200);
  });

  $back.addEventListener('click', () => {
    $detail.hidden = true;
    $list.hidden = false;
    $filter.parentElement.hidden = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  });
}

// ── Encyclopedia view ───────────────────────────────
const BOOK_LABELS = {
  ashtanga:            'Аштанга-хридая-самхита (Вагбхата)',
  basics:              'Аюрведа для начинающих (Васант Лад)',
  ayurveda1992:        'Аюрведа — наука самоисцеления (Васант Лад)',
  ayurtest:            'Аюрведа и здоровье (Шарад Джоши)',
  fundaments:          'Фундаментальные основы Аюрведы (Матхура Мандал Дас)',
  neapolitansky:       'Аюрведа на каждый день (Неаполитанский)',
  neapolitansky_2:     'Аюрведа на каждый день — тантра (Неаполитанский)',
  prakriti:            'Пракрити. Ваша конституция (Свобода)',
  svoboda_ayurveda:    'Аюрведа: жизнь, здоровье и долголетие (Свобода)',
  cooking:             'Аюрведическая кулинария (Васант Лад)',
  recipes:             'Аюрведа. Здоровые рецепты',
  morningstar_cooking: 'Аюрведическая кулинария для Запада (Морнингстар)',
  morningstar_polarity:'Аюрведа и полярная терапия (Морнингстар)',
  beauty:              'Абсолютная красота (Пратима Райчур)',
  miller:              'Аюрведа для всей семьи (Лайт Миллер)',
  miller_aroma:        'Ароматерапия с позиций аюрведы (Лайт и Брайен Миллер)',
  kavi_raj:            'Аюрведа для детей (Кави Радж)',
  panchakarma:         'Домашние средства Аюрведы (Васант Лад)',
  antonova:            'Очищение организма (Антонова Л.В.)',
  bhagwan_dash:        'Алхимия металлов в аюрведе (Бхагван Даш)',
  vinod_1:             'Аюрведа. Наука о жизни (Винод Верма)',
  vinod_2:             'Аюрведа: наука о жизни — расш. изд. (Винод Верма)',
  frawley_lad_herbs:   'Йога растений (Фроли, Васант Лад)',
  maharishi_book:      'Аюрведа Махариши',
  joshi_panchakarma:   'Аюрведа и Панчакарма (Сунил Джоши)',
};

let encyclopediaBuilt = false;
let currentEncSection = null;

function renderArticleContent(text) {
  // Strip leading ## duplicate title (already shown in article header)
  const stripped = text.replace(/^\s*##\s+[^\n]+\n*/, '');

  // Inline: **bold** and *italic*
  function ri(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  }

  return stripped.split(/\n\n+/).map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    const lines = trimmed.split('\n');
    const first = lines[0];

    // ── Markdown headings (## or ###, may have body on following lines)
    if (first.startsWith('## ')) {
      const heading = first.slice(3).trim();
      const rest = lines.slice(1).join('\n').trim();
      return `<h2>${ri(heading)}</h2>${rest ? `<p>${lines.slice(1).map(l => ri(l)).join('<br>')}</p>` : ''}`;
    }
    if (first.startsWith('### ')) {
      const heading = first.slice(4).trim();
      const rest = lines.slice(1).join('\n').trim();
      return `<h3>${ri(heading)}</h3>${rest ? `<p>${lines.slice(1).map(l => ri(l)).join('<br>')}</p>` : ''}`;
    }

    // ── Markdown table (| col | col |)
    if (first.startsWith('|')) {
      const rows = trimmed.split('\n').filter(r => !/^\|[-:\s|]+\|$/.test(r.trim()));
      const parseRow = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      if (rows.length >= 2) {
        const [header, ...body] = rows;
        const ths = parseRow(header).map(c => `<th>${ri(c)}</th>`).join('');
        const trs = body.map(r => '<tr>' + parseRow(r).map(c => `<td>${ri(c)}</td>`).join('') + '</tr>').join('');
        return `<table class="enc-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
      }
    }

    // ── Blockquote (> text)
    if (first.startsWith('> ') || first.startsWith('>*') || first.startsWith('> *')) {
      const bq = trimmed.replace(/^>\s*/, '').replace(/\n>\s*/g, ' ');
      return `<blockquote class="enc-quote">${ri(bq)}</blockquote>`;
    }

    // ── Bullet list (— – or - )
    if (/^[—–]/.test(trimmed) || /^- /.test(trimmed)) {
      const items = trimmed.split(/\n(?=[—–-])/).map(s => s.replace(/^[—–]\s*|^-\s*/, '').trim()).filter(Boolean);
      return '<ul>' + items.map(i => `<li>${ri(i)}</li>`).join('') + '</ul>';
    }

    // ── Single-line headings
    if (lines.length === 1 && trimmed.length > 5 && trimmed.length < 80
        && !/[.!?;]$/.test(trimmed) && !trimmed.endsWith(',')) {
      // All CAPS or CAPS-with-colon (e.g. "ТЕЛО:", "КАК ЕСТЬ:")
      if (trimmed === trimmed.toUpperCase() || /^[А-ЯЁ][А-ЯЁ\s\-]+:/.test(trimmed)) {
        return `<h4>${ri(trimmed)}</h4>`;
      }
      // Short mixed-case heading (e.g. "Три тонких сущности", "Прана и здоровье")
      if (trimmed.length < 65 && /^[А-ЯЁA-Z]/.test(trimmed)) {
        return `<h4 class="enc-h4-sub">${ri(trimmed)}</h4>`;
      }
    }

    // ── Sub-section: CAPS heading + body on following lines
    if (/^[А-ЯЁA-Z][А-ЯЁA-Z\s\-]+:/.test(first)) {
      const rest = lines.slice(1).join('\n').trim();
      let restHtml = '';
      if (rest) {
        if (/^[—–-]/.test(rest)) {
          const items = rest.split(/\n(?=[—–-])/).map(s => s.replace(/^[—–]\s*|^-\s*/, '').trim()).filter(Boolean);
          restHtml = '<ul>' + items.map(i => `<li>${ri(i)}</li>`).join('') + '</ul>';
        } else {
          restHtml = `<p>${lines.slice(1).map(l => ri(l)).join('<br>')}</p>`;
        }
      }
      return `<h4>${ri(first)}</h4>${restHtml}`;
    }

    return `<p>${lines.map(l => ri(l)).join('<br>')}</p>`;
  }).join('');
}

function buildEncyclopediaView() {
  if (encyclopediaBuilt) return;
  encyclopediaBuilt = true;

  const $sectView   = document.getElementById('enc-sections-view');
  const $artView    = document.getElementById('enc-articles-view');
  const $artContent = document.getElementById('enc-article-view');
  const $grid       = document.getElementById('enc-section-grid');
  const $search     = document.getElementById('enc-search');
  const $searchRes  = document.getElementById('enc-search-results');
  const $backSec    = document.getElementById('enc-back-sections');
  const $backArt    = document.getElementById('enc-back-articles');
  const $secIcon    = document.getElementById('enc-section-icon');
  const $secTitle   = document.getElementById('enc-section-title');
  const $secDesc    = document.getElementById('enc-section-desc');
  const $artList    = document.getElementById('enc-article-list');
  const $artTitle   = document.getElementById('enc-article-title');
  const $artSummary = document.getElementById('enc-article-summary');
  const $artBody    = document.getElementById('enc-article-body');
  const $artMeta    = document.getElementById('enc-article-meta');
  const $artSources = document.getElementById('enc-article-sources');

  function showSections() {
    $sectView.hidden  = false;
    $artView.hidden   = true;
    $artContent.hidden = true;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
    history.replaceState(null, '', '#encyclopedia');
  }

  function showArticles(sec) {
    currentEncSection = sec;
    $secIcon.innerHTML    = icon(sec.icon);
    $secTitle.textContent = sec.title;
    $secDesc.textContent  = sec.description;
    $artList.innerHTML = '';
    const frag = document.createDocumentFragment();
    sec.articles.forEach(art => {
      const card = document.createElement('div');
      card.className = 'enc-article-card';
      card.innerHTML = `
        <div class="enc-art-title">${escapeHtml(art.title)}</div>
        <div class="enc-art-summary">${escapeHtml(art.summary)}</div>
      `;
      card.addEventListener('click', () => showArticle(art));
      frag.appendChild(card);
    });
    $artList.appendChild(frag);
    $sectView.hidden   = true;
    $artView.hidden    = false;
    $artContent.hidden = true;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
    history.replaceState(null, '', `#encyclopedia/${sec.id}`);
  }

  function showArticle(art) {
    $artTitle.textContent   = art.title;
    $artSummary.textContent = art.summary;
    $artBody.innerHTML      = renderArticleContent(art.body || art.content || '');
    $artMeta.innerHTML      = currentEncSection ? `${icon(currentEncSection.icon)} ${escapeHtml(currentEncSection.title)}` : '';
    const sourcesHtml = art.sources
      .map(s => `<span class="enc-source-tag">${escapeHtml(BOOK_LABELS[s] || s)}</span>`)
      .join('');
    $artSources.innerHTML = `<div class="enc-sources-label">Источники:</div>${sourcesHtml}`;
    let sb = $artContent.querySelector('.card-share');
    if (!sb) { sb = document.createElement('button'); sb.className = 'card-share card-share--inline'; sb.innerHTML = SHARE_SVG + ' Поделиться'; $artSources.after(sb); }
    sb.onclick = () => shareContent(art.summary || art.body || art.content || art.title, `Энциклопедия: ${art.title}`, 'Статья скопирована со ссылкой');
    $sectView.hidden   = true;
    $artView.hidden    = true;
    $artContent.hidden = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  }

  $backSec.addEventListener('click', showSections);
  $backArt.addEventListener('click', () => {
    $artContent.hidden = true;
    $artView.hidden    = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  });

  // Expose article-opening function for cross-view navigation (e.g. glossary cards)
  openEncArticleFn = (secId, artId) => {
    const sec = ENCYCLOPEDIA.find(s => s.id === secId);
    if (!sec) return;
    const art = sec.articles.find(a => a.id === artId);
    if (!art) return;
    setActiveBtn(-1);
    setFooterActive('encyclopedia');
    showOnly($encyclopediaView);
    currentEncSection = sec;
    showArticle(art);
  };

  // ── Build section grid ──
  const frag = document.createDocumentFragment();
  for (const sec of ENCYCLOPEDIA) {
    const card = document.createElement('div');
    card.className = 'enc-section-card';
    card.innerHTML = `
      <div class="enc-sec-icon">${icon(sec.icon)}</div>
      <div class="enc-sec-info">
        <div class="enc-sec-title">${escapeHtml(sec.title)}</div>
        <div class="enc-sec-count">${sec.articles.length} статей</div>
        <div class="enc-sec-desc">${escapeHtml(sec.description)}</div>
      </div>
    `;
    card.addEventListener('click', () => showArticles(sec));
    frag.appendChild(card);
  }
  $grid.innerHTML = '';        // убрать плашку «Загрузка энциклопедии…»
  $grid.appendChild(frag);

  // ── Full-text search ──
  let searchDebounce = null;
  $search.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const q = $search.value.trim().toLowerCase();
      if (!q) {
        $searchRes.hidden = true;
        $grid.hidden = false;
        return;
      }
      $grid.hidden = false;
      const results = [];
      for (const sec of ENCYCLOPEDIA) {
        for (const art of sec.articles) {
          if (art.title.toLowerCase().includes(q) ||
              art.summary.toLowerCase().includes(q) ||
              art.content.toLowerCase().includes(q)) {
            results.push({ sec, art });
          }
        }
      }
      $searchRes.innerHTML = '';
      if (results.length === 0) {
        $searchRes.innerHTML = `<div class="no-results">Ничего не найдено по запросу «${escapeHtml($search.value)}»</div>`;
      } else {
        const f = document.createDocumentFragment();
        results.forEach(({ sec, art }) => {
          const card = document.createElement('div');
          card.className = 'enc-search-result';
          card.innerHTML = `
            <div class="enc-res-section">${icon(sec.icon)} ${escapeHtml(sec.title)}</div>
            <div class="enc-res-title">${escapeHtml(art.title)}</div>
            <div class="enc-res-summary">${escapeHtml(art.summary)}</div>
          `;
          card.addEventListener('click', () => {
            currentEncSection = sec;
            showArticle(art);
            $search.value = '';
            $searchRes.hidden = true;
            $grid.hidden = false;
          });
          f.appendChild(card);
        });
        $searchRes.appendChild(f);
      }
      $searchRes.hidden = false;
    }, 250);
  });
}

// ── References view ─────────────────────────────────
const REFERENCES = [
  // ── Первоисточники сайта ──────────────────────────────────────────────────
  {
    id: 'src_ashtanga_ru',
    title: 'Аштанга-хридая-самхита — русский перевод',
    author: 'Пер. Ю.В. Сорокиной · Комм. И.И. Ветрова',
    year: 'Источник русского текста и комментариев на сайте',
    description: 'Русский перевод Аштанга-хридая-самхиты — основной текст сайта. 56 глав, 6 стхан. Комментарии И.И. Ветрова к каждому стиху.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_ashtanga_skt',
    title: 'Аштанга-хридая — санскрит и IAST',
    author: 'Wisdom Library · wisdomlib.org',
    year: 'Источник деванагари и транслитерации IAST',
    description: 'Санскритский текст (деванагари) и транслитерация IAST для Аштанга-хридая-самхиты. Открытый академический ресурс.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_ashtanga_en',
    title: 'Аштанга-хридая — английский перевод',
    author: 'Prof. K.R. Srikantha Murthy · Wisdom Library',
    year: 'Источник английских переводов (главы с пометкой ENG)',
    description: 'Английский перевод Аштанга-хридая-самхиты К.Р. Шрикантха Мурти. Используется для глав, переведённых на английский.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_charaka_ru',
    title: 'Чарака-самхита — русский перевод',
    author: 'Чарака · Дридхабала · пер. на рус.',
    year: 'Источник русского текста',
    description: 'Русский перевод Чарака-самхиты — 120 глав, 8 стхан. Фундаментальный трактат по внутренней медицине (Каятантра).',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_charaka_en',
    title: 'Чарака-самхита — английский перевод',
    author: 'carakasamhitaonline.com',
    year: 'Источник английских переводов стихов',
    description: 'Английский перевод Чарака-самхиты с комментариями. Открытый ресурс, используемый для глав с пометкой ENG.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_charaka_skt',
    title: 'Чарака-самхита — санскрит и IAST',
    author: 'Wisdom Library · carakasamhitaonline.com',
    year: 'Источник деванагари и IAST',
    description: 'Санскритский оригинал (деванагари) и транслитерация IAST для Чарака-самхиты.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_sushruta_ru',
    title: 'Сушрута-самхита — русский перевод',
    author: 'Сушрута · пер. на рус.',
    year: 'Источник русского текста',
    description: 'Русский перевод Сушрута-самхиты — классический трактат по хирургии (Шалья-тантра). 186 глав, 6 стхан.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_sushruta_skt',
    title: 'Сушрута-самхита — санскрит и IAST',
    author: 'Wisdom Library · wisdomlib.org',
    year: 'Источник деванагари и транслитерации IAST',
    description: 'Санскритский текст (деванагари) и IAST для Сушрута-самхиты из открытых академических источников.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_sushruta_en',
    title: 'Сушрута-самхита — английский перевод (Bhishagratna)',
    author: 'Kaviraj Kunjalal Bhishagratna',
    year: '1907–1916 · public domain',
    description: 'Английский перевод Сушрута-самхиты в трёх томах: Vol. I — Сутрастхана (1907), Vol. II — Нидана, Шарира, Чикитса, Калпа (1911), Vol. III — Уттара Тантра (1916). Распознано из сканов archive.org (OCR) — возможны незначительные ошибки.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_madhava',
    title: 'Мадхава-нидана — текст и перевод',
    author: 'Мадхавакара · пер. на рус.',
    year: 'Источник текста',
    description: 'Русский перевод и санскрит Мадхава-ниданы — основной текст по диагностике заболеваний в аюрведе.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_sharangadhara',
    title: 'Шарангадхара-самхита — текст и перевод',
    author: 'Шарангадхара · пер. на рус.',
    year: 'Источник текста',
    description: 'Русский перевод и санскрит Шарангадхара-самхиты — трактат по фармакологии и приготовлению лекарств.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_bhavaprakasha',
    title: 'Бхавапракаша — текст и перевод',
    author: 'Бхавамишра · пер. на рус.',
    year: 'Источник текста',
    description: 'Русский перевод и санскрит Бхавапракаши — энциклопедический труд по аюрведе, включающий обширную Материя Медика.',
    category: '📌 Источник сайта',
  },
  {
    id: 'src_astanga_sangraha',
    title: 'Аштанга-санграха — текст и перевод',
    author: 'Вагбхата (старший) · пер. на рус.',
    year: 'Источник текста',
    description: 'Русский перевод и санскрит Аштанга-санграхи — более подробная версия Аштанга-хридаи, также созданная Вагбхатой.',
    category: '📌 Источник сайта',
  },

  // ── Классические тексты ───────────────────────────────────────────────────
  {
    id: 'ashtanga',
    title: 'Аштанга-хридая-самхита',
    author: 'Вагбхата',
    year: 'VII век н.э. · пер. Ю.В. Сорокиной, комм. И.И. Ветрова',
    description: 'Один из трёх главных классических текстов аюрведы (Брихат-трайи). Энциклопедический труд, охватывающий все разделы: физиологию, диагностику, фармакологию, хирургию, педиатрию, психиатрию. Основной текст этого читалища.',
    category: 'Классический текст',
  },

  // ── Введение и базовая теория ─────────────────────────────────────────────
  {
    id: 'basics',
    title: 'Аюрведа для начинающих',
    author: 'Васант Лад',
    year: '~2003, рус. пер.',
    description: 'Вводный курс по аюрведе от одного из самых известных аюрведических врачей мирового уровня. Охватывает основные концепции: пять элементов, три доши, питание, режим дня, домашние практики.',
    category: 'Введение',
  },
  {
    id: 'ayurveda1992',
    title: 'Аюрведа — наука самоисцеления',
    author: 'Васант Лад',
    year: '1984 (ориг.), рус. пер.',
    description: 'Классическое введение в аюрведу, ставшее стандартным учебником на Западе. Детально рассматривает диагностику пульса, языка, питание по конституции, панча-карму и домашние средства.',
    category: 'Учебник',
  },
  {
    id: 'fundaments',
    title: 'Фундаментальные основы Аюрведы',
    author: 'Матхура Мандал Дас',
    year: 'Рус. пер.',
    description: 'Академический труд, детально рассматривающий базовые концепции на основе классических текстов (Чарака-самхиты, Сушрута-самхиты). Включает разбор шадпадартхи (шести онтологических категорий) и концепций дхату, малы, сроты.',
    category: 'Теория',
  },
  {
    id: 'neapolitansky',
    title: 'Аюрведа на каждый день',
    author: 'Неаполитанский С.М.',
    year: 'Рус. изд.',
    description: 'Практическое руководство по применению аюрведических принципов в современной жизни. Рассматривает диначарью, ритусандхи (сезонные переходы), панча-бхуту и прикладные аспекты доша-балансирования.',
    category: 'Практика',
  },
  {
    id: 'ayurtest',
    title: 'Джоши — Аюрведа и здоровье',
    author: 'Шарад Джоши',
    year: 'Рус. пер.',
    description: 'Руководство по аюрведической диагностике и терапии от практикующего врача. Особое внимание уделяется нади-парикша (диагностике пульса), методам определения викрити и подбору лечебных протоколов.',
    category: 'Диагностика',
  },

  // ── Конституция и праkriti ────────────────────────────────────────────────
  {
    id: 'prakriti',
    title: 'Пракрити. Ваша аюрведическая конституция',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Подробное исследование концепции пракрити — индивидуальной конституции. Автор — первый западный выпускник аюрведической медицины в Индии. Философский и практический взгляд на природу человека через призму трёх дош.',
    category: 'Конституция',
  },
  {
    id: 'svoboda_ayurveda',
    title: 'Аюрведа: жизнь, здоровье и долголетие',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Всестороннее введение в аюрведу от Свободы: история, философия, пракрити, шесть вкусов, питание, Оджас, Теджас и Прана, практики расаяны. Один из наиболее полных обзоров западного автора.',
    category: 'Введение',
  },

  // ── Питание ───────────────────────────────────────────────────────────────
  {
    id: 'cooking',
    title: 'Аюрведическая кулинария',
    author: 'Васант Лад, Уша Лад',
    year: 'Рус. пер.',
    description: 'Полное руководство по аюрведической кулинарии: концепции питания, рецепты по конституции, специи, несовместимые продукты. Содержит более 300 рецептов для всех трёх дош и сезонов.',
    category: 'Кулинария',
  },
  {
    id: 'recipes',
    title: 'Аюрведа. Здоровые рецепты',
    author: 'Ярема, Рода, Бранниган',
    year: 'Рус. пер.',
    description: 'Практическое руководство по аюрведическому питанию с рецептами. Особое внимание уделяется шести вкусам и их влиянию на пищеварение и эмоции. Разработано совместно с аюрведическими врачами.',
    category: 'Кулинария',
  },
  {
    id: 'morningstar_cooking',
    title: 'Аюрведическая кулинария для западных стран',
    author: 'Амадея Морнингстар',
    year: 'Рус. пер.',
    description: 'Адаптированная аюрведическая кулинария для западного читателя: рецепты с доступными ингредиентами, учёт сезонов, кислотно-щелочной баланс, сочетаемость продуктов по аюрведе.',
    category: 'Кулинария',
  },

  // ── Красота и тело ────────────────────────────────────────────────────────
  {
    id: 'beauty',
    title: 'Абсолютная красота',
    author: 'Пратима Райчур, Мэриан Кон',
    year: 'Рус. пер.',
    description: 'Исчерпывающее руководство по аюрведическому уходу за кожей, волосами и телом. Автор — аюрведический дерматолог с практикой в Нью-Йорке. Типы кожи по дошам, маски, масла, массаж, ароматерапия.',
    category: 'Красота',
  },

  // ── Семейная аюрведа ──────────────────────────────────────────────────────
  {
    id: 'miller',
    title: 'Аюрведа для всей семьи',
    author: 'Лайт Миллер',
    year: '1999 (ориг.), рус. пер. 2005',
    description: 'Справочное руководство по аюрведическим методам лечения для всей семьи. Охватывает ароматерапию, беременность, детские болезни, зрелость и старение, менопаузу, причины болезней. Основано на 30-летнем клиническом опыте автора.',
    category: 'Семейная медицина',
  },
  {
    id: 'miller_aroma',
    title: 'Ароматерапия с позиций аюрведы',
    author: 'Лайт Миллер, Брайен Миллер',
    year: 'Рус. пер.',
    description: 'Справочное руководство по аюрведической ароматерапии. Охватывает историю эфирных масел, их химический состав, способы производства и хранения, взаимодействие с организмом через лимбическую систему, классификацию масел по воздействию на доши (вата/питта/капха), аюрведическое смешивание, а также словарь из 60+ эфирных масел с подробным описанием каждого. Содержит анкету для определения конституции.',
    category: 'Ароматерапия',
  },
  {
    id: 'kavi_raj',
    title: 'Аюрведа для детей',
    author: 'Кави Радж',
    year: 'Рус. пер.',
    description: 'Специализированное руководство по аюрведической педиатрии (балатантре): конституция ребёнка, питание в разные периоды детства, детские болезни и их аюрведическое лечение, психология развития.',
    category: 'Педиатрия',
  },

  // ── Панчакарма и очищение ─────────────────────────────────────────────────
  {
    id: 'panchakarma',
    title: 'Домашние средства Аюрведы',
    author: 'Васант Лад',
    year: 'Рус. пер.',
    description: '111 заболеваний и их аюрведическое домашнее лечение. Подробные рецепты трав, специй, масел и диет для самостоятельного применения. Сопровождается руководством по приготовлению аюрведических средств.',
    category: 'Практика',
  },
  {
    id: 'antonova',
    title: 'Очищение организма',
    author: 'Антонова Л.В.',
    year: 'Рус. изд.',
    description: 'Руководство по очищению организма методами аюрведы и натуропатии. Охватывает панчакарму, диеты для детоксикации, травяные очищения, роль кишечника и лимфатической системы.',
    category: 'Очищение',
  },
  {
    id: 'morningstar_polarity',
    title: 'Аюрведа и полярная терапия',
    author: 'Амадея Морнингстар',
    year: '2001 (ориг.), рус. пер. 2007',
    description: 'Практическое руководство по сочетанию аюрведы и полярной терапии Рэндолфа Стоуна. Охватывает движение, дыхание, кислотно-щелочной баланс, очищение, оджас и принципы работы с энергетическими полями тела.',
    category: 'Целительство',
  },

  // ── Расашастра и алхимия ──────────────────────────────────────────────────
  {
    id: 'bhagwan_dash',
    title: 'Алхимия и применение лекарств на основе металлов в аюрведе',
    author: 'Бхагван Даш',
    year: 'Рус. пер.',
    description: 'Академическое исследование расашастры — аюрведической алхимии. Методы очищения и приготовления минерально-металлических препаратов (расаяна, басма, пиштхи). Классические формулы и их клиническое применение.',
    category: 'Расашастра',
  },

  // ── Энциклопедические труды ───────────────────────────────────────────────
  {
    id: 'vinod_1',
    title: 'Аюрведа. Наука о жизни',
    author: 'Винод Верма',
    year: 'Рус. пер.',
    description: 'Всестороннее изложение аюрведической медицины: философия Санкхьи, панча-бхута, тридоша, сапта-дхату, диагностика, терапия, марма-терапия, аюрведическая психология. Написано практикующим врачом.',
    category: 'Энциклопедия',
  },
  {
    id: 'vinod_2',
    title: 'Аюрведа: наука о жизни (расширенное изд.)',
    author: 'Винод Верма',
    year: 'Рус. пер.',
    description: 'Расширенное издание, включающее дополнительные разделы по аюрведической косметологии, женскому здоровью, герантологии и психосоматике. Опирается на классические тексты и современные исследования.',
    category: 'Энциклопедия',
  },
  {
    id: 'neapolitansky_2',
    title: 'Аюрведа на каждый день (тантра и практики)',
    author: 'Неаполитанский С.М.',
    year: 'Рус. изд.',
    description: 'Расширенное руководство по практическому применению аюрведы, включающее тантрические аспекты, мантра-терапию, пранаяму, сезонные ритуалы и духовные практики в контексте аюрведы.',
    category: 'Практика',
  },
  // ── Звук и мудры ──
  {
    id: 'frawley_lad_herbs',
    title: 'Йога растений. Руководство Аюрведы по траволечению',
    author: 'Давид Фроли, Васант Лад',
    year: '1986 (ориг.), рус. пер.',
    description: 'Классическое руководство по аюрведической фитотерапии: энергетика трав, шесть вкусов, классификация по терапевтическому действию (карма), применение западных трав в системе Аюрведы. Включает раздел о мантрах, янтрах и медитации в контексте фитотерапии.',
    category: 'Травы и растения',
  },
  {
    id: 'maharishi_book',
    title: 'Аюрведа Махариши: Пропуск в бессмертие',
    author: 'Международный центр Аюрведы Махариши',
    year: '1990-е, рус. пер.',
    description: '20 подходов Аюрведы Махариши, включая трансцендентальную медитацию, Гандхарва-Веду, Джотиш, Стхапатья-Веду. Особый акцент на роли сознания в исцелении, связи микрокосма и макрокосма, обращении вспять старения.',
    category: 'Практика',
  },
  {
    id: 'mudras_gonikman',
    title: 'Йога пальцев: мудры здоровья, долголетия и красоты',
    author: 'Гоникман Э., Лама Марамба Сингх',
    year: 'Рус. изд.',
    description: 'Практическое руководство по лечебным мудрам (жестам рук) в традиции восточной медицины. 25 основных мудр с показаниями и техникой выполнения, принципы соответствия пяти элементов и пяти пальцев.',
    category: 'Практика',
  },
  {
    id: 'joshi_panchakarma',
    title: 'Аюрведа и Панчакарма. Методы исцеления и омоложения',
    author: 'Сунил В. Джоши',
    year: 'Рус. пер.',
    description: 'Детальное руководство по клинической панчакарме от специалиста с 15-летним стажем. Охватывает шесть стадий болезни, пурвакарму (снехана, сведана), протоколы пяти основных карм (вамана, виречана, насья, басти, рактамокшана), схемы курсов и восстановительные диеты.',
    category: 'Панчакарма',
  },

  // ── Диагностика ───────────────────────────────────────────────────────────
  {
    id: 'lad_pulse',
    title: 'Диагностика по пульсу',
    author: 'Васант Лад',
    year: '2004, рус. пер.',
    description: 'Исчерпывающее руководство по нади-парикша — аюрведической диагностике по пульсу. Двадцать восемь видов пульса, пульс дош, дхату, органов; тонкий пульс (сукшма нади) и его связь с каузальным телом. Практические упражнения для развития чувствительности пальцев.',
    category: 'Диагностика',
  },

  // ── Основы (академические) ────────────────────────────────────────────────
  {
    id: 'vetrov',
    title: 'Основы аюрведической медицины',
    author: 'Ветров И.И.',
    year: 'МИА, 2008',
    description: 'Академический учебник по аюрведе на русском языке: система сроты, семь дхату и их метаболизм, три малы, ама и апа-дхату, клинические протоколы. Один из немногих фундаментальных русскоязычных трудов. Источник раздела «Система срот» энциклопедии.',
    category: 'Теория',
  },
  {
    id: 'spravochnik',
    title: 'Справочник по заболеваниям и рекомендации аюрведы',
    author: 'Составитель не указан',
    year: 'Рус. изд.',
    description: 'Практический алфавитный справочник заболеваний с аюрведической классификацией по дошам, этиологией и рекомендациями по лечению. Источник разделов «Глоссарий болезней» сайта — около 60 нозологий.',
    category: 'Справочник',
  },

  // ── Фроули: расширенные труды ────────────────────────────────────────────
  {
    id: 'frawley_healing',
    title: 'Аюрведическая терапия',
    author: 'Давид Фроули',
    year: '1989 (ориг.), рус. пер.',
    description: 'Клинический справочник по аюрведической терапии: доша-специфические протоколы для артрита, кожных болезней, нервных расстройств, мигрени, заболеваний сердца. Подробная фитотерапия, диеты, панчакарма-компоненты для каждого состояния.',
    category: 'Клиническая аюрведа',
  },
  {
    id: 'frawley_yoga_type',
    title: 'Йога от А до Я. Практика асан с позиций аюрведы',
    author: 'Давид Фроули',
    year: 'Рус. пер.',
    description: 'Интеграция аюрведы и хатха-йоги: асаны для каждого типа конституции, противопоказания, последовательности занятий по временам года и состоянию дош. Пранаяма, медитация и дхарана через призму тридоши.',
    category: 'Йога и аюрведа',
  },
  {
    id: 'frawley_jyotish',
    title: 'Аюрведа, йога и астрология',
    author: 'Давид Фроули',
    year: '2008, рус. пер.',
    description: 'Сборник бесед о связи трёх сестринских ведических дисциплин: аюрведы, йоги и джйотиша (астрологии). Три пути к самопознанию как единая система. Введение в ведическую нумерологию и аюрведическую астрологию.',
    category: 'Ведические науки',
  },
  {
    id: 'frawley_tantra',
    title: 'Тантрическая йога и мудрость богинь',
    author: 'Давид Фроули',
    year: 'Рус. пер.',
    description: 'Путеводитель по тантрической традиции шакта-дарши: десять Махавидья, шакти-пуджа, мантры, янтры, нада-йога. Параллели с аюрведической концепцией прана, теджас и оджас в тантрическом контексте.',
    category: 'Тантра',
  },

  // ── Чакры и тонкое тело ───────────────────────────────────────────────────
  {
    id: 'johari_chakras',
    title: 'Чакры: энергетические центры трансформации',
    author: 'Хариш Джохари',
    year: 'Рус. пер.',
    description: 'Детальное описание семи чакр в традиции тантра-йоги: лепестки-лотосы, биджа-мантры, дэваты, мандалы. Связь чакр с аюрведическими дошами, дхату, марма-точками. Источник нового раздела «Система чакр» энциклопедии.',
    category: 'Тонкое тело',
  },

  // ── Травы и растения ──────────────────────────────────────────────────────
  {
    id: 'frolov_herbs',
    title: 'Травы для йогов. Очистительные процедуры хатха-йоги',
    author: 'Артём Фролов',
    year: 'Ориенталия, 2013',
    description: 'Практическое руководство по шести очищениям (шаткрия) с поддерживающей фитотерапией. Отличительная черта — акцент на растениях средней полосы России как доступной альтернативе аюрведическим травам. Источник раздела «Травы и очищение в хатха-йоге».',
    category: 'Травы и растения',
  },

  // ── Женское здоровье ──────────────────────────────────────────────────────
  {
    id: 'women_yoga',
    title: 'Аюрведа и йога для женщин',
    author: 'Составитель не указан',
    year: 'Рус. изд.',
    description: 'Практическое руководство по женскому здоровью через аюрведические практики: цикл, беременность, послеродовой уход, менопауза, женские расаяны (Шатавари, Алоэ, Ашока). Источник раздела «Женское здоровье» энциклопедии.',
    category: 'Женское здоровье',
  },
  {
    id: 'silcox',
    title: 'Здоровая, счастливая, сексуальная: мудрость аюрведы для современных женщин',
    author: 'Кейт Силкокс',
    year: 'Рус. пер.',
    description: 'Современное руководство по женскому аюрведическому здоровью: гормональный баланс, сексуальность, репродуктивная система, ментальное здоровье. Приведены практики для трёх дош на каждой фазе цикла.',
    category: 'Женское здоровье',
  },

  // ── Йога-терапия ─────────────────────────────────────────────────────────
  {
    id: 'sivananda',
    title: 'Йога-терапия: новый взгляд на традиционную йога-терапию',
    author: 'Свами Шивананда',
    year: 'Рус. пер.',
    description: 'Классическое руководство по йога-терапии от одного из главных популяризаторов йоги на Западе: асаны при конкретных заболеваниях, пранаяма, медитация, шаткрия. Параллели с аюрведической этиологией болезней.',
    category: 'Йога-терапия',
  },
  {
    id: 'tanaka_yoga',
    title: 'Йога и аюрведа в 10 простых уроках',
    author: 'Танака',
    year: 'Рус. пер.',
    description: 'Вводный курс по интеграции йоги и аюрведы для широкой аудитории: 10 структурированных уроков, практические задания, советы по питанию, диначарья и доша-тест в каждом уроке.',
    category: 'Йога и аюрведа',
  },

  // ── Кулинария ────────────────────────────────────────────────────────────
  {
    id: 'pumpkin',
    title: 'Аюрведическая кулинария: блюда из тыквы',
    author: 'Сост. по материалам kunpendelek.ru',
    year: 'Интернет-источник',
    description: 'Специализированный сборник рецептов блюд из тыквы в аюрведической традиции: обоснование целебных свойств тыквы, рецепты для Ваты, Питты и Капхи, сезонное применение.',
    category: 'Кулинария',
  },
  {
    id: 'ayurveda_family',
    title: 'Аюрведа для всей семьи',
    author: 'Составитель не указан',
    year: 'Рус. изд.',
    description: 'Практическое руководство по аюрведе для применения в семейном быту: первая помощь, сезонные чистки, детское и женское здоровье, пожилые, питание, домашняя аптека специй.',
    category: 'Семейная медицина',
  },

  // ── Благовония и ароматерапия ────────────────────────────────────────────
  {
    id: 'eastern_incense',
    title: 'Мир восточных благовоний',
    author: 'Составитель не указан',
    year: 'Рус. изд.',
    description: 'Обширная энциклопедия ароматических веществ Востока: смолы, благовония, масла, мирра, ладан, сандал, агарвуд. История, ритуальное применение, терапевтический эффект, аюрведическая классификация ароматов.',
    category: 'Ароматерапия',
  },

  // ── Тантра ────────────────────────────────────────────────────────────────
  {
    id: 'nava_yogini',
    title: 'Нава Йогини Тантра',
    author: 'Традиционный текст (пер. на рус.)',
    year: 'Рус. пер.',
    description: 'Тантрический текст традиции Шива-Шакти о девяти йогини. Разделы о теле, пране, мантрах и ритуалах. Параллели с аюрведической концепцией прана-вайу и нади-системой.',
    category: 'Тантра',
  },
  {
    id: 'aghora_1',
    title: 'Агхора. По левую руку Бога',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Первая из трёх книг о жизни и учении агхорского мастера Вималананда. Тантра, Аюрведа, расашастра, астрология в практике живого учителя. Уникальный взгляд на связь алхимии металлов и целительства тела.',
    category: 'Тантра',
  },
  {
    id: 'aghora_2',
    title: 'Агхора II. Кундалини',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Продолжение бесед с Вималанандой: практика пробуждения кундалини, шактипат, ритуальные практики левой руки. Аюрведическая концепция ваю (ветра) и её связь с движением кундалини.',
    category: 'Тантра',
  },
  {
    id: 'aghora_3',
    title: 'Агхора III. Закон кармы',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Третья часть: карма, самскары, патологии поведения и их аюрведическая интерпретация. Расшифровка «наследственных болезней» через концепцию кармы и дхармы.',
    category: 'Тантра',
  },
];

let referencesBuilt = false;

function buildReferencesView() {
  if (referencesBuilt) return;
  referencesBuilt = true;
  const $list = document.getElementById('ref-list');
  const frag = document.createDocumentFragment();
  for (const ref of REFERENCES) {
    const card = document.createElement('div');
    card.className = 'ref-card';
    card.innerHTML = `
      <div class="ref-card-top">
        <div class="ref-title">${escapeHtml(ref.title)}</div>
        <span class="ref-category">${ref.category.startsWith('📌') ? PIN_SVG + ' ' + escapeHtml(ref.category.replace('📌', '').trim()) : escapeHtml(ref.category)}</span>
      </div>
      <div class="ref-author">${escapeHtml(ref.author)}</div>
      <div class="ref-year">${escapeHtml(ref.year)}</div>
      <div class="ref-desc">${escapeHtml(ref.description)}</div>
    `;
    frag.appendChild(card);
  }
  $list.appendChild(frag);
}

// ── Glossary & Diseases buttons ────────────────────
$glossaryBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('glossary');
  showOnly($glossaryView);
  buildGlossaryView();
  history.replaceState(null, '', '#glossary');
  // Фоном подгружаем энциклопедию, чтобы появились ссылки «→ статья»
  if (!_encLoaded) ensureEncyclopedia().then(() => {
    if (!$glossaryView.hidden) buildGlossaryView();
  });
  // Статьи сообщества (одобренные термины)
  mergeArticles('glossary').then(added => { if (added && !$glossaryView.hidden) buildGlossaryView(); });
});

$diseasesBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('diseases');
  showOnly($diseasesView);
  buildDiseasesView();
  history.replaceState(null, '', '#diseases');
});

$remediesBtn.addEventListener('click', async () => {
  setActiveBtn(-1);
  setFooterActive('remedies');
  showOnly($remediesView);
  history.replaceState(null, '', '#remedies');
  if (!_remLoaded) {
    const list = document.getElementById('remedies-list');
    if (list) list.innerHTML = '<div class="nav-loading">Загрузка домашних средств…</div>';
    await ensureRemedies();
  }
  await mergeArticles('remedies');
  buildRemediesView();
});

$encyclopediaBtn.addEventListener('click', async () => {
  setActiveBtn(-1);
  setFooterActive('encyclopedia');
  showOnly($encyclopediaView);
  history.replaceState(null, '', '#encyclopedia');
  if (!_encLoaded) {
    const grid = document.getElementById('enc-section-grid');
    if (grid) grid.innerHTML = '<div class="nav-loading">Загрузка энциклопедии…</div>';
    await ensureEncyclopedia();
  }
  await mergeArticles('encyclopedia');
  buildEncyclopediaView();
});

$referencesBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('references');
  showOnly($referencesView);
  buildReferencesView();
  history.replaceState(null, '', '#references');
});

// ── Food Table view ─────────────────────────────────
let foodtableBuilt = false;

function buildFoodTableView() {
  if (foodtableBuilt) return;
  foodtableBuilt = true;

  const $body      = document.getElementById('ft-body');
  const $search    = document.getElementById('ft-search');
  const $catFilter = document.getElementById('ft-cat-filter');

  // Timeline constants: hours 5 to 22 = 17 hours span
  const T_START = 5;
  const T_END   = 22;
  const T_SPAN  = T_END - T_START;

  function pct(h) {
    return Math.max(0, Math.min(100, ((h - T_START) / T_SPAN) * 100));
  }

  function makeBar(from, to) {
    const left  = pct(from);
    const width = Math.max(2, pct(to) - pct(from));
    return `<div class="ft-bar-track">
      <div class="ft-bar-fill" style="left:${left}%;width:${width}%"></div>
      <div class="ft-bar-labels">
        ${[6,9,12,15,18,21].map(h => `<span style="left:${pct(h)}%" class="ft-bar-tick"></span>`).join('')}
      </div>
    </div>`;
  }

  function timeStr(h) {
    return h < 10 ? `0${h}:00` : `${h}:00`;
  }

  let activeCat = null;

  function render(query) {
    $body.innerHTML = '';
    const q = query.toLowerCase().trim();
    const frag = document.createDocumentFragment();

    for (const cat of FOOD_TABLE) {
      if (activeCat && cat.category !== activeCat) continue;
      const items = q
        ? cat.items.filter(it => it.name.toLowerCase().includes(q))
        : cat.items;
      if (items.length === 0) continue;

      const sec = document.createElement('div');
      sec.className = 'ft-section';

      const catTitle = document.createElement('div');
      catTitle.className = 'ft-cat-title';
      catTitle.innerHTML = `<span class="menu-ico ft-cat-icon" data-icon="${cat.iconKey || ''}"></span>${escapeHtml(cat.category)}`;
      sec.appendChild(catTitle);

      const table = document.createElement('div');
      table.className = 'ft-table';

      const thead = document.createElement('div');
      thead.className = 'ft-row ft-thead';
      thead.innerHTML = `
        <div class="ft-cell ft-name">Продукт</div>
        <div class="ft-cell ft-from">С</div>
        <div class="ft-cell ft-to">До</div>
        <div class="ft-cell ft-bar">
          <div class="ft-bar-header">
            ${[6,9,12,15,18,21].map(h => `<span>${h}:00</span>`).join('')}
          </div>
        </div>
      `;
      table.appendChild(thead);

      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'ft-row';
        row.innerHTML = `
          <div class="ft-cell ft-name">${escapeHtml(item.name)}</div>
          <div class="ft-cell ft-from ft-time">${timeStr(item.from)}</div>
          <div class="ft-cell ft-to ft-time">${timeStr(item.to)}</div>
          <div class="ft-cell ft-bar">${makeBar(item.from, item.to)}</div>
        `;
        table.appendChild(row);
      }

      sec.appendChild(table);
      frag.appendChild(sec);
    }

    if (frag.childNodes.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-results';
      msg.textContent = q ? `Продукт «${query}» не найден` : 'Нет данных';
      frag.appendChild(msg);
    }

    $body.appendChild(frag);
    // Инициализируем SVG-иконки для динамически созданных элементов
    $body.querySelectorAll('.menu-ico[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  }

  // Category filter buttons
  const allBtn = document.createElement('button');
  allBtn.className = 'ft-cat-btn active';
  allBtn.textContent = 'Все';
  allBtn.addEventListener('click', () => {
    activeCat = null;
    document.querySelectorAll('.ft-cat-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    render($search.value);
  });
  $catFilter.appendChild(allBtn);

  for (const cat of FOOD_TABLE) {
    const btn = document.createElement('button');
    btn.className = 'ft-cat-btn';
    btn.innerHTML = `<span class="menu-ico ft-filter-icon" data-icon="${cat.iconKey || ''}">${cat.icon}</span> ${escapeHtml(cat.category)}`;
    btn.addEventListener('click', () => {
      activeCat = cat.category;
      document.querySelectorAll('.ft-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render($search.value);
    });
    $catFilter.appendChild(btn);
  }
  // Инициализируем SVG-иконки в фильтрах
  $catFilter.querySelectorAll('.menu-ico[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  render('');

  let ftDebounce = null;
  $search.addEventListener('input', () => {
    clearTimeout(ftDebounce);
    ftDebounce = setTimeout(() => render($search.value), 200);
  });
}

$foodtableBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('foodtable');
  showOnly($foodtableView);
  buildFoodTableView();
  history.replaceState(null, '', '#foodtable');
});

// ── Quiz ───────────────────────────────────────────
let quizScores = { vata: 0, pitta: 0, kapha: 0 };

function buildQuizView() {
  const $intro = document.getElementById('quiz-intro');
  const $form  = document.getElementById('quiz-form');
  const $result = document.getElementById('quiz-result');

  // Reset to intro
  $intro.hidden = false;
  $form.hidden = true;
  $result.hidden = true;
  quizScores = { vata: 0, pitta: 0, kapha: 0 };
}

function renderQuizForm() {
  const $intro = document.getElementById('quiz-intro');
  const $form  = document.getElementById('quiz-form');
  $intro.hidden = true;
  $form.hidden = false;

  const $sections = document.getElementById('quiz-sections');
  $sections.innerHTML = '';

  QUIZ.sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'quiz-section';
    secEl.dataset.dosha = sec.dosha;

    const header = document.createElement('div');
    header.className = 'quiz-section-header';
    header.style.setProperty('--dosha-color', sec.color);
    header.innerHTML = `<span class="quiz-sec-emoji">${sec.emoji}</span>
      <span class="quiz-sec-label">${sec.label}</span>
      <span class="quiz-sec-count">${sec.questions.length} вопросов</span>`;
    secEl.appendChild(header);

    sec.questions.forEach((q, i) => {
      const row = document.createElement('div');
      row.className = 'quiz-q-row';

      const label = document.createElement('div');
      label.className = 'quiz-q-text';
      label.textContent = `${i + 1}. ${q}`;

      const slider = document.createElement('div');
      slider.className = 'quiz-slider-wrap';
      slider.innerHTML = `
        <span class="quiz-slider-lo">0</span>
        <input type="range" min="0" max="6" value="0"
          class="quiz-slider"
          data-dosha="${sec.dosha}"
          aria-label="${q}">
        <span class="quiz-slider-hi">6</span>
        <span class="quiz-slider-val">0</span>
      `;

      const input = slider.querySelector('input');
      const val   = slider.querySelector('.quiz-slider-val');
      input.addEventListener('input', () => {
        val.textContent = input.value;
        updateProgress();
      });

      row.appendChild(label);
      row.appendChild(slider);
      secEl.appendChild(row);
    });

    $sections.appendChild(secEl);
  });

  updateProgress();
}

function updateProgress() {
  const all = document.querySelectorAll('.quiz-slider');
  const touched = [...all].filter(s => parseInt(s.value) > 0).length;
  const pct = Math.round((touched / all.length) * 100);
  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('quiz-progress-label').textContent = `${touched} / ${all.length} вопросов`;
}

function calcQuizResult() {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  document.querySelectorAll('.quiz-slider').forEach(input => {
    const d = input.dataset.dosha;
    scores[d] += parseInt(input.value);
  });
  quizScores = scores;

  const $form   = document.getElementById('quiz-form');
  const $result = document.getElementById('quiz-result');
  $form.hidden   = true;
  $result.hidden = false;

  renderQuizResult(scores);
}

function renderQuizResult(scores) {
  const total = scores.vata + scores.pitta + scores.kapha || 1;
  const pcts  = {
    vata:  Math.round((scores.vata  / total) * 100),
    pitta: Math.round((scores.pitta / total) * 100),
    kapha: Math.round((scores.kapha / total) * 100),
  };

  // Determine dominant dosha(s)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];
  const isDualDosha = second[1] >= top[1] * 0.8;
  const dominantDosha = top[0];

  // Chart
  const $chart = document.getElementById('quiz-scores-chart');
  $chart.innerHTML = QUIZ.sections.map(sec => `
    <div class="quiz-bar-wrap">
      <div class="quiz-bar-label">${sec.emoji} ${sec.label}</div>
      <div class="quiz-bar-track">
        <div class="quiz-bar-fill" style="width:${pcts[sec.dosha]}%; background:${sec.color}"></div>
      </div>
      <div class="quiz-bar-pct">${pcts[sec.dosha]}%</div>
      <div class="quiz-bar-pts">${scores[sec.dosha]} очков</div>
    </div>
  `).join('');

  // Result card
  const res = QUIZ.results[dominantDosha];
  const $card = document.getElementById('quiz-result-card');
  $card.innerHTML = `
    <div class="quiz-result-emoji" style="color:${res.color}">${res.emoji}</div>
    <h2 class="quiz-result-title">${res.title}</h2>
    <p class="quiz-result-subtitle">${res.subtitle}</p>
    <p class="quiz-result-traits">${res.traits}</p>
    <div class="quiz-balance-block">
      <div class="quiz-balance-item quiz-balance-pos">✓ ${res.balance}</div>
      <div class="quiz-balance-item quiz-balance-neg">⚠ ${res.imbalance}</div>
    </div>
  `;

  // Recommendations
  const $recs = document.getElementById('quiz-recommendations');
  $recs.innerHTML = `
    <h3>Рекомендации для ${res.title.split('-')[0]}</h3>
    <ul class="quiz-rec-list">
      ${res.recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
    <p class="quiz-enc-hint">Подробнее — в разделе <a href="#encyclopedia/prakruti">Энциклопедия → Пракрити</a></p>
  `;
}

document.getElementById('quiz-start-btn').addEventListener('click', () => {
  renderQuizForm();
});

document.getElementById('quiz-submit-btn').addEventListener('click', () => {
  calcQuizResult();
  document.getElementById('content').scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('quiz-restart-btn').addEventListener('click', () => {
  buildQuizView();
});

$quizBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('quiz');
  showOnly($quizView);
  buildQuizView();
  history.replaceState(null, '', '#quiz');
});

if ($friendsBtn) $friendsBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('friends');
  showOnly($friendsView);
  history.replaceState(null, '', '#friends');
});

if ($donateBtn) $donateBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('donate');
  showOnly($donateView);
  history.replaceState(null, '', '#donate');
});

if ($cabinetBtn) $cabinetBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('cabinet');
  showOnly($cabinetView);
  Cabinet.renderCabinet();
  history.replaceState(null, '', '#cabinet');
  closeSidebar();
});

// Copy-to-clipboard for donate requisites
document.addEventListener('click', e => {
  const btn = e.target.closest('.donate-copy');
  if (!btn) return;
  const text = btn.dataset.copy;
  navigator.clipboard.writeText(text).then(() => {
    const icon = btn.querySelector('.donate-copy-icon');
    const orig = icon.textContent;
    icon.textContent = '✓';
    btn.classList.add('donate-copied');
    setTimeout(() => { icon.textContent = orig; btn.classList.remove('donate-copied'); }, 1800);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
});

// ── Cross-remedy navigation ─────────────────────────
document.addEventListener('click', async e => {
  const ref = e.target.closest('.rem-cross-ref');
  if (!ref) return;
  e.preventDefault();
  await ensureRemedies();
  const name = ref.dataset.remedy;
  const remedy = REMEDIES.find(r =>
    r.name === name || r.name.replace(/ё/g, 'е') === name.replace(/ё/g, 'е')
  );
  if (!remedy) return;
  // Switch to remedies panel and open the remedy
  $remediesBtn.click();
  setTimeout(() => {
    const $dtitle = document.getElementById('remedies-detail-title');
    const $dbody  = document.getElementById('remedies-detail-body');
    const $list   = document.getElementById('remedies-list');
    const $filter = document.getElementById('remedies-filter');
    const $detail = document.getElementById('remedies-detail');
    $dtitle.textContent = remedy.name;
    $dbody.innerHTML = renderRemedyContent(remedy.content, remedy.name);
    $list.hidden = true;
    $filter.parentElement.hidden = true;
    $detail.hidden = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  }, 0);
});

// ── Search ─────────────────────────────────────────
let searchDebounce = null;

$searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    runSearch($searchInput.value.trim());
  }, 250);
});

let _allBooksLoaded = false;
function runSearch(query) {
  searchQuery = query;
  if (!query) {
    if (currentChapterIdx !== null) {
      showOnly($chapterView);
    } else {
      showOnly($welcome);
    }
    setFooterActive(null);
    return;
  }

  showOnly($searchRes);
  setFooterActive(null);

  // Поиск идёт по всем книгам — догружаем недостающие данные один раз
  if (!_allBooksLoaded) {
    const pending = BOOKS.filter(b => !b._loaded);
    if (pending.length) {
      const bodyEl = document.getElementById('search-results-body');
      const countEl = document.getElementById('search-count');
      if (countEl) countEl.textContent = '';
      if (bodyEl) bodyEl.innerHTML = '<div class="nav-loading">Подготовка поиска по всем книгам…</div>';
      Promise.all(pending.map(loadBookData)).then(() => {
        _allBooksLoaded = true;
        if (searchQuery === query) runSearch(query); // повторяем после загрузки
      });
      return;
    }
    _allBooksLoaded = true;
  }

  const q = query.toLowerCase();
  const results = [];

  // Ищем по всем книгам (не только по текущей)
  BOOKS.forEach((book, bookIdx) => {
    book.chapters.forEach((ch, chIdx) => {
      (ch.content || []).forEach(block => {
        if (block.text && block.text.toLowerCase().includes(q)) {
          results.push({ bookIdx, chIdx, ch, block, book });
        }
      });
    });
  });

  const countEl = document.getElementById('search-count');
  const bodyEl  = document.getElementById('search-results-body');
  countEl.textContent = results.length
    ? `${results.length} результат${results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'}`
    : '';
  announce(results.length ? `Найдено ${results.length} результатов по запросу ${query}` : `По запросу ${query} ничего не найдено`);

  bodyEl.innerHTML = '';
  if (results.length === 0) {
    bodyEl.innerHTML = `<div class="no-results">Ничего не найдено по запросу «${escapeHtml(query)}»</div>`;
    return;
  }

  const re = new RegExp(escapeRegex(query), 'gi');
  const frag = document.createDocumentFragment();

  results.slice(0, 80).forEach(({ bookIdx, chIdx, ch, block, book }) => {
    const card = document.createElement('div');
    card.className = 'search-result';

    // Обе ветки возвращают уже экранированный HTML (highlightSnippet экранирует сам).
    const snippet = block.text.length > 280
      ? highlightSnippet(block.text, q, 280)
      : escapeHtml(block.text);

    const typeLabel = block.type === 'verse'
      ? (block.number != null ? `Стих ${block.number}` : 'Стих')
      : block.type === 'comment' ? 'Комментарий' : 'Текст';

    // Показываем иконку книги если поиск нашёл в другой книге
    const bookLabel = bookIdx !== currentBookIdx
      ? `<span class="result-book">${icon(book.iconKey) || escapeHtml(book.icon)} ${escapeHtml(book.titleShort)}</span> · `
      : '';

    card.innerHTML = `
      <div class="result-meta">${bookLabel}${escapeHtml(ch.sthana)} · Гл. ${ch.number || '—'}: ${escapeHtml(ch.title)} · ${typeLabel}</div>
      <div class="result-snippet">${snippet.replace(re, m => `<mark>${m}</mark>`)}</div>
    `;
    card.addEventListener('click', () => {
      $searchInput.value = '';
      runSearch('');
      if (bookIdx !== currentBookIdx) selectBook(bookIdx);
      loadChapter(chIdx);
    });
    frag.appendChild(card);
  });

  bodyEl.appendChild(frag);
}

function highlightSnippet(text, query, maxLen) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text.slice(0, maxLen)) + '…';
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + query.length + 160);
  const snippet = (start > 0 ? '…' : '') + escapeHtml(text.slice(start, end)) + (end < text.length ? '…' : '');
  return snippet;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Font size control ───────────────────────────────
const FONT_SIZES = ['small', 'normal', 'large', 'xlarge'];
const FONT_LABELS = { small: 'А−', normal: 'А', large: 'А+', xlarge: 'А++' };

function initFontSize() {
  const saved = localStorage.getItem('ayurveda_font') || 'normal';
  setFontSize(saved, false);
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.body.dataset.fontSize || 'normal';
      const next = FONT_SIZES[(FONT_SIZES.indexOf(cur) + 1) % FONT_SIZES.length];
      setFontSize(next, true);
    });
  });
}

function setFontSize(size, save) {
  document.body.dataset.fontSize = size;
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.textContent = FONT_LABELS[size] || 'А';
  });
  if (save) {
    try { localStorage.setItem('ayurveda_font', size); } catch (_) {}
  }
}

// ── Reading position persistence ───────────────────
const LS_KEY = 'ayurveda_pos';

function savePosition() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      bookIdx: currentBookIdx,
      chIdx:   currentChapterIdx,
    }));
  } catch (_) {}
}

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const pos = JSON.parse(raw);
    if (typeof pos.bookIdx === 'number' && pos.bookIdx >= 0 && pos.bookIdx < BOOKS.length) {
      return pos;
    }
  } catch (_) {}
  return null;
}

// ── Init ───────────────────────────────────────────
// Кнопка «↑ наверх» (для длинных глав). Скроллер — #content или окно.
function initBackToTop() {
  const content = document.getElementById('content');
  if (!content) return;
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.title = 'Наверх'; btn.setAttribute('aria-label', 'Наверх');
  btn.textContent = '↑';
  document.body.appendChild(btn);
  const y = () => content.scrollTop || window.scrollY || document.documentElement.scrollTop || 0;
  const onScroll = () => btn.classList.toggle('show', y() > 600);
  content.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    content.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function init() {
  initTheme();
  initFontSize();
  initOfflineIndicator();
  initBackToTop();
  // Иконки меню (единый SVG-набор)
  document.querySelectorAll('.menu-ico[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  buildBookSelector();
  buildNav();
  buildHomePage();
  // Прогрев тяжёлых разделов — по первому интересу (наведение/фокус кнопки),
  // а не сразу: не качаем ~1.5 МБ тем, кто просто читает. К клику уже загружено.
  [['encyclopedia-btn', ensureEncyclopedia], ['remedies-btn', ensureRemedies]].forEach(([id, fn]) => {
    const b = document.getElementById(id);
    if (!b) return;
    const warm = () => fn();
    b.addEventListener('pointerenter', warm, { once: true });
    b.addEventListener('focus', warm, { once: true });
  });
  // Права доступа + настройка защиты контента (Этап 6)
  Cabinet.loadEntitlements().then(() => {
    configureContent({
      protection: Cabinet.contentProtectionEnabled(),
      tokenProvider: Cabinet.getToken,
    });
  });

  // Клик по заголовку книги в сайдбаре → на главную (welcome)
  const $bookTitle = document.getElementById('book-title');
  if ($bookTitle) {
    $bookTitle.style.cursor = 'pointer';
    $bookTitle.title = 'На главную';
    $bookTitle.addEventListener('click', goHome);
  }
  // Кнопка «домой» в шапке главы
  const $homeBtn = document.getElementById('chapter-home-btn');
  if ($homeBtn) $homeBtn.addEventListener('click', goHome);

  // Restore from URL hash
  const hash = location.hash;
  // Кросс-книжный permalink: #<bookId>/c<idx>[/v<num>]
  const pm = hash.match(/^#([a-z_]+)\/c(\d+)(?:\/v(\d+))?$/);
  if (pm) {
    const bi = bookIdxById(pm[1]);
    const chIdx = parseInt(pm[2]);
    if (bi >= 0) {
      _pendingVerse = pm[3] ? parseInt(pm[3]) : null;
      const go = () => { if (chIdx >= 0 && chIdx < currentBook().chapters.length) loadChapter(chIdx); };
      if (bi !== currentBookIdx) { selectBook(bi).then(go); } else { go(); }
      return;
    }
  }
  if (hash.startsWith('#ch')) {
    const idx = parseInt(hash.slice(3));
    if (!isNaN(idx) && idx >= 0 && idx < currentBook().chapters.length) {
      loadChapter(idx);
      return;
    }
  }

  // Restore last position from localStorage (if no URL hash)
  if (!hash || hash === '#') {
    const pos = loadSavedPosition();
    if (pos) {
      if (pos.bookIdx !== 0) selectBook(pos.bookIdx);
      if (pos.chIdx != null) {
        const book = currentBook();
        if (pos.chIdx >= 0 && pos.chIdx < book.chapters.length && book.chapters[pos.chIdx].available !== false) {
          loadChapter(pos.chIdx);
          return;
        }
      }
    }
  }
  if (hash === '#glossary') {
    $glossaryBtn.click();
    return;
  }
  if (hash === '#diseases') {
    $diseasesBtn.click();
    return;
  }
  if (hash === '#remedies') {
    $remediesBtn.click();
    return;
  }
  if (hash === '#encyclopedia' || hash.startsWith('#encyclopedia/')) {
    $encyclopediaBtn.click();
    return;
  }
  if (hash === '#references') {
    $referencesBtn.click();
    return;
  }
  if (hash === '#foodtable') {
    $foodtableBtn.click();
    return;
  }
  if (hash === '#quiz') {
    $quizBtn.click();
    return;
  }
  if (hash === '#friends') {
    if ($friendsBtn) $friendsBtn.click();
    return;
  }
  if (hash === '#donate') {
    $donateBtn.click();
    return;
  }
  if (hash === '#cabinet' && $cabinetBtn) {
    $cabinetBtn.click();
    return;
  }
  // Default: show welcome
  showOnly($welcome);
}

init();

// ── AI Chat ─────────────────────────────────────────
(() => {
  const $toggle = document.getElementById('chat-toggle');
  const $panel  = document.getElementById('chat-panel');
  const $close  = document.getElementById('chat-close');
  const $msgs   = document.getElementById('chat-messages');
  const $input  = document.getElementById('chat-input');
  const $send   = document.getElementById('chat-send');
  if (!$toggle || !$panel) return;

  const history = [];
  let busy = false;

  const $menuBtn = document.getElementById('menu-btn');
  const $footer  = document.getElementById('site-footer');
  function open()  { $panel.hidden = false; if ($menuBtn) $menuBtn.style.display = 'none'; if ($footer) $footer.style.zIndex = '10000'; $input.focus(); }
  function close() { $panel.hidden = true; if ($menuBtn) $menuBtn.style.display = ''; if ($footer) $footer.style.zIndex = ''; }

  $toggle.addEventListener('click', () => $panel.hidden ? open() : close());
  $close.addEventListener('click', close);

  function addMsg(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    div.textContent = text;
    $msgs.appendChild(div);
    $msgs.scrollTop = $msgs.scrollHeight;
    return div;
  }

  async function send() {
    const q = $input.value.trim();
    if (!q || busy) return;
    busy = true;
    $send.disabled = true;
    $input.value = '';

    addMsg(q, 'user');
    history.push({ role: 'user', text: q });

    // Поиск контекста по загруженным книгам
    const context = searchContext(q, BOOKS);

    // Индикатор набора
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.textContent = 'Думаю';
    $msgs.appendChild(typing);
    $msgs.scrollTop = $msgs.scrollHeight;

    // Создаём блок ответа
    let answer = '';
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg chat-msg--bot';

    askQuestion(
      q, context, history,
      (chunk) => {
        // onChunk — стриминг
        if (typing.parentNode) typing.remove();
        answer += chunk;
        botDiv.textContent = answer;
        if (!botDiv.parentNode) $msgs.appendChild(botDiv);
        $msgs.scrollTop = $msgs.scrollHeight;
      },
      () => {
        // onDone
        if (typing.parentNode) typing.remove();
        if (!botDiv.parentNode && answer) $msgs.appendChild(botDiv);
        if (answer) history.push({ role: 'bot', text: answer });
        busy = false;
        $send.disabled = false;
      },
      (err) => {
        // onError
        if (typing.parentNode) typing.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'chat-msg chat-msg--error';
        errDiv.textContent = err;
        $msgs.appendChild(errDiv);
        busy = false;
        $send.disabled = false;
      },
    );
  }

  $send.addEventListener('click', send);
  $input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
})();

// ── Service Worker (PWA) ────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
