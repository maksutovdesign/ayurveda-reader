import { BOOK_DATA } from './data.js';
import { GLOSSARY, lookupTerm, TERM_REGEX } from './glossary.js';
import { DISEASES, getDiseaseCategories } from './diseases.js';
import { REMEDIES } from './remedies.js';
import { LIBRARY, LIBRARY_INDEX } from './library.js';

// ── State ──────────────────────────────────────────
let currentChapterIdx = null;
let searchQuery = '';
let tooltipTimeout = null;

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
const $libraryView  = document.getElementById('library-view');
const $libraryBtn   = document.getElementById('library-btn');

const ALL_PANELS = [$welcome, $chapterView, $searchRes, $glossaryView, $diseasesView, $remediesView, $libraryView];

function showOnly(panel) {
  ALL_PANELS.forEach(p => { p.hidden = true; });
  panel.hidden = false;
  document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
}

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
  } else {
    div.classList.add('block-text');
    div.innerHTML = renderText(block.text);
  }

  return div;
}

// ── Navigation ─────────────────────────────────────
function buildNav() {
  const chapters = BOOK_DATA.chapters;
  const sthanasOrder = BOOK_DATA.sthanas;

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
      btn.className = 'chapter-btn';
      btn.dataset.idx = idx;
      const numLabel = ch.number > 0 ? `<span class="ch-num">${ch.number}.</span>` : '';
      btn.innerHTML = `${numLabel}${ch.title}`;
      btn.addEventListener('click', () => loadChapter(idx));
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
  const ch = BOOK_DATA.chapters[idx];

  showOnly($chapterView);

  $chBreadcrumb.textContent = ch.sthana;
  $chTitle.textContent = ch.number > 0
    ? `Глава ${ch.number}. ${ch.title}`
    : ch.title;
  $chSubtitle.textContent = ch.subtitle || '';
  $chSubtitle.hidden = !ch.subtitle;

  $chapterBody.innerHTML = '';
  const frag = document.createDocumentFragment();
  ch.content.forEach(block => frag.appendChild(renderBlock(block)));
  $chapterBody.appendChild(frag);

  setActiveBtn(idx);
  setFooterActive(null);

  // Update URL hash
  history.replaceState(null, '', `#ch${idx}`);
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
        card.className = 'glossary-card';
        card.innerHTML = `
          <div class="glossary-card-term">${entry.term}</div>
          <div class="glossary-card-origin">${entry.origin}</div>
          <div class="glossary-card-def">${entry.def}</div>
        `;
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

      const chips = d.chapters.map(c => `<span class="disease-chip">${c}</span>`).join('');

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
}

function setFooterActive(id) {
  $glossaryBtn.classList.toggle('active', id === 'glossary');
  $diseasesBtn.classList.toggle('active', id === 'diseases');
  $remediesBtn.classList.toggle('active', id === 'remedies');
  $libraryBtn.classList.toggle('active', id === 'library');
}

// ── Remedies view ──────────────────────────────────
let remediesBuilt = false;

function renderRemedyContent(text) {
  // Convert plain text with newlines to HTML paragraphs
  return text
    .split(/\n\n+/)
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      // Bullet points
      if (trimmed.startsWith('•')) {
        const items = trimmed.split(/\n•/).map(s => s.replace(/^•\s*/, '').trim());
        return '<ul>' + items.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
      }
      // Sub-headings (short lines with no period, all caps or title case)
      const lines = trimmed.split('\n');
      if (lines.length === 1 && trimmed.length < 80 && !trimmed.endsWith('.') &&
          (trimmed === trimmed.toUpperCase() || /^[А-ЯЁ]/.test(trimmed))) {
        return `<h4>${escapeHtml(trimmed)}</h4>`;
      }
      // Regular paragraph with line-break handling
      return `<p>${lines.map(l => escapeHtml(l)).join('<br>')}</p>`;
    })
    .join('');
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
        $dbody.innerHTML = renderRemedyContent(remedy.content);
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

// ── Library view ───────────────────────────────────
const CATEGORY_LABELS = {
  theory:       'Теория и философия',
  cooking:      'Кулинария',
  beauty:       'Красота и уход',
  constitution: 'Конституция (пракрити)',
  herbs:        'Травы и специи',
};

const CATEGORY_ICONS = {
  theory:       '📖',
  cooking:      '🍲',
  beauty:       '🌸',
  constitution: '🧬',
  herbs:        '🌿',
};

let libraryBuilt = false;
let currentLibraryBook = null;  // book object
let currentLibrarySections = []; // filtered sections

function renderSectionContent(text) {
  return text
    .split(/\n\n+/)
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('•')) {
        const items = trimmed.split(/\n•/).map(s => s.replace(/^•\s*/, '').trim());
        return '<ul>' + items.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
      }
      const lines = trimmed.split('\n');
      if (lines.length === 1 && trimmed.length < 90 && !trimmed.endsWith('.')) {
        return `<h4>${escapeHtml(trimmed)}</h4>`;
      }
      return `<p>${lines.map(l => escapeHtml(l)).join('<br>')}</p>`;
    })
    .join('');
}

function buildLibraryView() {
  if (libraryBuilt) return;
  libraryBuilt = true;

  const $grid          = document.getElementById('library-grid');
  const $filter        = document.getElementById('library-filter');
  const $books         = document.getElementById('library-books');
  const $sections      = document.getElementById('library-sections');
  const $sectionList   = document.getElementById('library-section-list');
  const $sectionFilter = document.getElementById('library-section-filter');
  const $content       = document.getElementById('library-content');
  const $bookName      = document.getElementById('library-book-name');
  const $bookAuthor    = document.getElementById('library-book-author');
  const $secTitle      = document.getElementById('library-section-title');
  const $secBody       = document.getElementById('library-section-body');
  const $backBooks     = document.getElementById('library-back-books');
  const $backSections  = document.getElementById('library-back-sections');

  // ── Back buttons ──
  $backBooks.addEventListener('click', () => {
    $sections.hidden = true;
    $content.hidden  = true;
    $books.hidden    = false;
    currentLibraryBook = null;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
    history.replaceState(null, '', '#library');
  });

  $backSections.addEventListener('click', () => {
    $content.hidden   = true;
    $sections.hidden  = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  });

  // ── Open a book ──
  function openBook(book) {
    currentLibraryBook = book;
    currentLibrarySections = book.sections;
    $bookName.textContent   = book.title;
    $bookAuthor.textContent = book.author;
    $sectionFilter.value    = '';
    $books.hidden    = true;
    $content.hidden  = true;
    $sections.hidden = false;
    renderSectionList('');
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
    history.replaceState(null, '', `#library/${book.id}`);
  }

  // ── Render sections list ──
  function renderSectionList(query) {
    $sectionList.innerHTML = '';
    const q = query.toLowerCase().trim();
    const items = q
      ? currentLibrarySections.filter(s =>
          s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
      : currentLibrarySections;

    if (items.length === 0) {
      $sectionList.innerHTML = `<div class="no-results">Ничего не найдено</div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((sec, idx) => {
      const row = document.createElement('div');
      row.className = 'lib-section-row';
      const dosha = sec.dosha ? `<span class="lib-section-dosha lib-dosha-${sec.dosha}">${sec.dosha}</span>` : '';
      row.innerHTML = `
        <span class="lib-section-num">${idx + 1}</span>
        <span class="lib-section-name">${escapeHtml(sec.title)}</span>
        ${dosha}
      `;
      row.addEventListener('click', () => openSection(sec));
      frag.appendChild(row);
    });
    $sectionList.appendChild(frag);
  }

  // ── Open section content ──
  function openSection(sec) {
    $secTitle.textContent = sec.title;
    $secBody.innerHTML    = renderSectionContent(sec.content);
    $sections.hidden = true;
    $content.hidden  = false;
    document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  }

  // ── Section filter ──
  let secFilterDebounce = null;
  $sectionFilter.addEventListener('input', () => {
    clearTimeout(secFilterDebounce);
    secFilterDebounce = setTimeout(() => renderSectionList($sectionFilter.value), 200);
  });

  // ── Build book grid ──
  function renderBookGrid(query) {
    $grid.innerHTML = '';
    const q = query.toLowerCase().trim();

    // Group available books by category
    const groups = {};
    for (const book of LIBRARY) {
      // filter by query (title, author, category label)
      if (q) {
        const haystack = (book.title + ' ' + book.author + ' ' + (CATEGORY_LABELS[book.category] || '')).toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      const cat = book.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(book);
    }

    // Fixed category order
    const catOrder = ['theory', 'constitution', 'cooking', 'beauty', 'herbs'];
    const frag = document.createDocumentFragment();

    for (const cat of catOrder) {
      if (!groups[cat] || groups[cat].length === 0) continue;

      const section = document.createElement('div');
      section.className = 'lib-category';

      const catTitle = document.createElement('div');
      catTitle.className = 'lib-category-title';
      catTitle.textContent = `${CATEGORY_ICONS[cat] || ''} ${CATEGORY_LABELS[cat] || cat}`;
      section.appendChild(catTitle);

      const row = document.createElement('div');
      row.className = 'lib-book-row';

      for (const book of groups[cat]) {
        const card = document.createElement('div');
        card.className = 'lib-book-card' + (book.available ? '' : ' lib-unavailable');

        const sectionCount = book.sections.length;
        const badge = book.available
          ? `<span class="lib-book-badge">${sectionCount} разд.</span>`
          : `<span class="lib-book-badge lib-badge-scan">${book.reason === 'scan' ? '📷 скан' : '⚠ файл'}</span>`;

        card.innerHTML = `
          <div class="lib-book-icon">${CATEGORY_ICONS[cat] || '📄'}</div>
          <div class="lib-book-info">
            <div class="lib-book-title">${escapeHtml(book.title)}</div>
            <div class="lib-book-author">${escapeHtml(book.author)}</div>
            ${badge}
          </div>
        `;

        if (book.available) {
          card.addEventListener('click', () => openBook(book));
        } else {
          card.title = book.reason === 'scan'
            ? 'Книга в формате скана — текст недоступен для чтения'
            : 'Файл повреждён — текст недоступен';
        }

        row.appendChild(card);
      }

      section.appendChild(row);
      frag.appendChild(section);
    }

    if (frag.childNodes.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-results';
      msg.textContent = `Ничего не найдено по запросу «${escapeHtml(query)}»`;
      frag.appendChild(msg);
    }

    $grid.appendChild(frag);
  }

  renderBookGrid('');

  let gridFilterDebounce = null;
  $filter.addEventListener('input', () => {
    clearTimeout(gridFilterDebounce);
    gridFilterDebounce = setTimeout(() => renderBookGrid($filter.value), 200);
  });
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

$libraryBtn.addEventListener('click', () => {
  setActiveBtn(-1);
  setFooterActive('library');
  showOnly($libraryView);
  buildLibraryView();
  history.replaceState(null, '', '#library');
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

  BOOK_DATA.chapters.forEach((ch, chIdx) => {
    ch.content.forEach(block => {
      if (block.text.toLowerCase().includes(q)) {
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
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Init ───────────────────────────────────────────
function init() {
  initTheme();
  buildNav();

  // Restore from URL hash
  const hash = location.hash;
  if (hash.startsWith('#ch')) {
    const idx = parseInt(hash.slice(3));
    if (!isNaN(idx) && idx >= 0 && idx < BOOK_DATA.chapters.length) {
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
  if (hash === '#library' || hash.startsWith('#library/')) {
    $libraryBtn.click();
    return;
  }
  // Default: show welcome
  showOnly($welcome);
}

init();
