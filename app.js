import { BOOK_DATA } from './data.js?v=9';
import { BOOKS } from './books.js';
import { GLOSSARY, lookupTerm, TERM_REGEX } from './glossary.js';
import { DISEASES, getDiseaseCategories } from './diseases.js?v=7';
import { REMEDIES } from './remedies.js?v=7';
import { ENCYCLOPEDIA, ENCYCLOPEDIA_INDEX } from './encyclopedia.js?v=7';
import { QUIZ } from './quiz.js';
import { FOOD_TABLE } from './foodtable.js';

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
const $donateView        = document.getElementById('donate-view');
const $donateBtn         = document.getElementById('donate-btn');

const ALL_PANELS = [$welcome, $chapterView, $searchRes, $glossaryView, $diseasesView, $remediesView, $encyclopediaView, $referencesView, $foodtableView, $quizView, $donateView];

function showOnly(panel) {
  ALL_PANELS.forEach(p => { p.hidden = true; });
  panel.hidden = false;
  document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
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

// ── Medical disclaimer dismiss + mobile collapse ────
const $disclaimerClose    = document.getElementById('disclaimer-close');
const $footerDisclaimer   = document.getElementById('footer-disclaimer');
const $siteFooter         = document.getElementById('site-footer');
const DISCLAIMER_KEY      = 'disclaimerDismissed';

if (sessionStorage.getItem(DISCLAIMER_KEY)) {
  $siteFooter.hidden = true;
}

// X button — dismiss permanently for the session
$disclaimerClose.addEventListener('click', e => {
  e.stopPropagation();
  $siteFooter.style.transition = 'opacity 0.2s ease';
  $siteFooter.style.opacity = '0';
  setTimeout(() => { $siteFooter.hidden = true; }, 200);
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
  // Highlight glossary terms
  return text.replace(TERM_REGEX, match => {
    const entry = lookupTerm(match);
    if (!entry) return match;
    return `<span class="skt" data-term="${entry.term}">${match}</span>`;
  });
}

function renderBlock(block) {
  const div = document.createElement('div');
  div.className = 'block';

  if (block.type === 'verse') {
    div.classList.add('block-verse');
    div.innerHTML = `
      <div class="verse-header">
        <span class="verse-number">Стих ${block.number}</span>
      </div>
      <div class="verse-text">${renderText(block.text)}</div>
    `;
  } else if (block.type === 'comment') {
    div.classList.add('block-comment');
    div.innerHTML = `
      <div class="comment-label">Комментарий</div>
      <div class="comment-text">${renderText(block.text)}</div>
    `;
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
      <span class="book-opt-icon">${book.icon}</span>
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
    $icon.textContent  = book.icon;
    $title.textContent = book.titleShort;
  }
  syncBtn();

  // Re-sync when book changes (called from selectBook)
  window._syncBookBtn = syncBtn;
}

function selectBook(idx) {
  currentBookIdx    = idx;
  currentChapterIdx = null;

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

  // Update page title breadcrumb
  const book = currentBook();
  document.getElementById('book-title').innerHTML =
    `<span class="book-name">${escapeHtml(book.titleShort || book.title.split('-')[0])}</span>
     <span class="book-sub">${escapeHtml(book.id === 'ashtanga' ? 'самхита' : '')}</span>`;
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
    label.innerHTML = `<span>${sthana}</span><span class="sthana-arrow">▾</span>`;
    label.addEventListener('click', () => {
      group.classList.toggle('collapsed');
    });

    const chaptersDiv = document.createElement('div');
    chaptersDiv.className = 'sthana-chapters';

    items.forEach(({ ch, idx }) => {
      const btn = document.createElement('button');
      const isUnavailable = ch.available === false;
      btn.className = 'chapter-btn' + (isUnavailable ? ' chapter-btn--stub' : '');
      btn.dataset.idx = idx;
      const numLabel = ch.number > 0 ? `<span class="ch-num">${ch.number}.</span>` : '';
      const engBadge = ch.lang === 'en' ? `<span class="ch-lang-badge">ENG</span>` : '';
      btn.innerHTML = `${numLabel}${ch.title}${engBadge}`;
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
    btn.classList.toggle('active', parseInt(btn.dataset.idx) === idx);
  });
}

// ── Load chapter ───────────────────────────────────
function loadChapter(idx) {
  currentChapterIdx = idx;
  const ch = currentBook().chapters[idx];

  showOnly($chapterView);

  $chBreadcrumb.textContent = ch.sthana;
  $chTitle.textContent = ch.number > 0
    ? `Глава ${ch.number}. ${ch.title}`
    : ch.title;
  $chSubtitle.textContent = ch.subtitle || '';
  $chSubtitle.hidden = !ch.subtitle;

  $chapterBody.innerHTML = '';
  const frag = document.createDocumentFragment();

  // English-translation notice
  if (ch.lang === 'en') {
    const notice = document.createElement('div');
    notice.className = 'chapter-lang-notice';
    notice.innerHTML = `<span class="chapter-lang-notice__icon">🌐</span> Глава не переведена на русский — показан английский перевод (easyayurveda.com)`;
    frag.appendChild(notice);
  }

  ch.content.forEach(block => frag.appendChild(renderBlock(block)));
  $chapterBody.appendChild(frag);

  setActiveBtn(idx);
  setFooterActive(null);

  // Update URL hash
  history.replaceState(null, '', `#ch${idx}`);
}

// ── Glossary → Encyclopedia lookup ─────────────────
// For each glossary term, find the best-matching encyclopedia article.
// Returns { secId, artId } or null.
const GLOSSARY_ENC_MAP = (() => {
  const map = {};
  for (const sec of ENCYCLOPEDIA) {
    for (const art of sec.articles) {
      const titleLower = art.title.toLowerCase();
      const titleWords = titleLower.split(/[\s()/,—–:-]+/).filter(w => w.length > 3);
      for (const entry of GLOSSARY) {
        const termLower = entry.term.toLowerCase();
        // Match if term appears verbatim in article title, or vice versa
        if (titleLower.includes(termLower) || termLower.includes(titleLower)) {
          if (!map[entry.term]) {
            map[entry.term] = { secId: sec.id, artId: art.id };
          }
        }
      }
    }
  }
  return map;
})();

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
        const encRef = GLOSSARY_ENC_MAP[entry.term];
        card.className = encRef ? 'glossary-card glossary-card--linked' : 'glossary-card';
        card.innerHTML = `
          <div class="glossary-card-term">${entry.term}${encRef ? ' <span class="glossary-enc-link">→ статья</span>' : ''}</div>
          <div class="glossary-card-origin">${entry.origin}</div>
          <div class="glossary-card-def">${entry.def}</div>
        `;
        if (encRef) {
          card.addEventListener('click', () => {
            buildEncyclopediaView();
            openEncArticleFn && openEncArticleFn(encRef.secId, encRef.artId);
          });
        }
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
function buildDiseasesView() {
  const body = document.getElementById('diseases-body');
  if (body.childNodes.length > 0) return; // already built

  const cats = getDiseaseCategories();
  const frag = document.createDocumentFragment();

  for (const [cat, diseases] of Object.entries(cats)) {
    const section = document.createElement('div');
    section.className = 'disease-category';

    const title = document.createElement('div');
    title.className = 'disease-category-title';
    title.textContent = cat;
    section.appendChild(title);

    for (const d of diseases) {
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

  body.appendChild(frag);

  body.addEventListener('click', e => {
    const chip = e.target.closest('.disease-chip--link');
    if (!chip) return;
    const idx = parseInt(chip.dataset.chapterIdx);
    if (!isNaN(idx)) loadAHChapter(idx);
  });
}

function setFooterActive(id) {
  $glossaryBtn.classList.toggle('active', id === 'glossary');
  $diseasesBtn.classList.toggle('active', id === 'diseases');
  $remediesBtn.classList.toggle('active', id === 'remedies');
  $encyclopediaBtn.classList.toggle('active', id === 'encyclopedia');
  $referencesBtn.classList.toggle('active', id === 'references');
  $foodtableBtn.classList.toggle('active', id === 'foodtable');
  $quizBtn.classList.toggle('active', id === 'quiz');
  $donateBtn.classList.toggle('active', id === 'donate');
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
    $secIcon.textContent  = sec.icon;
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
    $artMeta.textContent    = currentEncSection ? `${currentEncSection.icon} ${currentEncSection.title}` : '';
    const sourcesHtml = art.sources
      .map(s => `<span class="enc-source-tag">${escapeHtml(BOOK_LABELS[s] || s)}</span>`)
      .join('');
    $artSources.innerHTML = `<div class="enc-sources-label">Источники:</div>${sourcesHtml}`;
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
      <div class="enc-sec-icon">${sec.icon}</div>
      <div class="enc-sec-info">
        <div class="enc-sec-title">${escapeHtml(sec.title)}</div>
        <div class="enc-sec-count">${sec.articles.length} статей</div>
        <div class="enc-sec-desc">${escapeHtml(sec.description)}</div>
      </div>
    `;
    card.addEventListener('click', () => showArticles(sec));
    frag.appendChild(card);
  }
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
            <div class="enc-res-section">${sec.icon} ${escapeHtml(sec.title)}</div>
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
        <span class="ref-category">${escapeHtml(ref.category)}</span>
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
});

$diseasesBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('diseases');
  showOnly($diseasesView);
  buildDiseasesView();
  history.replaceState(null, '', '#diseases');
});

$remediesBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('remedies');
  showOnly($remediesView);
  buildRemediesView();
  history.replaceState(null, '', '#remedies');
});

$encyclopediaBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('encyclopedia');
  showOnly($encyclopediaView);
  buildEncyclopediaView();
  history.replaceState(null, '', '#encyclopedia');
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
      catTitle.innerHTML = `<span class="ft-cat-icon">${cat.icon}</span>${escapeHtml(cat.category)}`;
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
    btn.innerHTML = `${cat.icon} ${escapeHtml(cat.category)}`;
    btn.addEventListener('click', () => {
      activeCat = cat.category;
      document.querySelectorAll('.ft-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render($search.value);
    });
    $catFilter.appendChild(btn);
  }

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

if ($donateBtn) $donateBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('donate');
  showOnly($donateView);
  history.replaceState(null, '', '#donate');
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
document.addEventListener('click', e => {
  const ref = e.target.closest('.rem-cross-ref');
  if (!ref) return;
  e.preventDefault();
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

  const q = query.toLowerCase();
  const results = [];

  currentBook().chapters.forEach((ch, chIdx) => {
    (ch.content || []).forEach(block => {
      if (block.text && block.text.toLowerCase().includes(q)) {
        results.push({ chIdx, ch, block });
      }
    });
  });

  const countEl = document.getElementById('search-count');
  const bodyEl  = document.getElementById('search-results-body');
  countEl.textContent = results.length
    ? `${results.length} результат${results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'}`
    : '';

  bodyEl.innerHTML = '';
  if (results.length === 0) {
    bodyEl.innerHTML = `<div class="no-results">Ничего не найдено по запросу «${escapeHtml(query)}»</div>`;
    return;
  }

  const re = new RegExp(escapeRegex(query), 'gi');
  const frag = document.createDocumentFragment();

  results.slice(0, 80).forEach(({ chIdx, ch, block }) => {
    const card = document.createElement('div');
    card.className = 'search-result';

    const snippet = block.text.length > 280
      ? highlightSnippet(block.text, q, 280)
      : block.text;

    const typeLabel = block.type === 'verse'
      ? `Стих ${block.number}`
      : block.type === 'comment' ? 'Комментарий' : 'Текст';

    card.innerHTML = `
      <div class="result-meta">${ch.sthana} · Гл. ${ch.number || '—'}: ${escapeHtml(ch.title)} · ${typeLabel}</div>
      <div class="result-snippet">${snippet.replace(re, m => `<mark>${escapeHtml(m)}</mark>`)}</div>
    `;
    card.addEventListener('click', () => {
      $searchInput.value = '';
      runSearch('');
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
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Init ───────────────────────────────────────────
function init() {
  initTheme();
  buildBookSelector();
  buildNav();

  // Restore from URL hash
  const hash = location.hash;
  if (hash.startsWith('#ch')) {
    const idx = parseInt(hash.slice(3));
    if (!isNaN(idx) && idx >= 0 && idx < currentBook().chapters.length) {
      loadChapter(idx);
      return;
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
  if (hash === '#donate') {
    $donateBtn.click();
    return;
  }
  // Default: show welcome
  showOnly($welcome);
}

init();
