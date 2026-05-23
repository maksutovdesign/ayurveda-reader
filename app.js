import { BOOK_DATA } from './data.js';
import { GLOSSARY, lookupTerm, TERM_REGEX } from './glossary.js';
import { DISEASES, getDiseaseCategories } from './diseases.js';
import { REMEDIES } from './remedies.js';
import { ENCYCLOPEDIA, ENCYCLOPEDIA_INDEX } from './encyclopedia.js';
import { QUIZ } from './quiz.js';

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
const $encyclopediaView  = document.getElementById('encyclopedia-view');
const $encyclopediaBtn   = document.getElementById('encyclopedia-btn');
const $referencesView    = document.getElementById('references-view');
const $referencesBtn     = document.getElementById('references-btn');
const $quizView          = document.getElementById('quiz-view');
const $quizBtn           = document.getElementById('quiz-btn');

const ALL_PANELS = [$welcome, $chapterView, $searchRes, $glossaryView, $diseasesView, $remediesView, $encyclopediaView, $referencesView, $quizView];

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
  $encyclopediaBtn.classList.toggle('active', id === 'encyclopedia');
  $referencesBtn.classList.toggle('active', id === 'references');
  $quizBtn.classList.toggle('active', id === 'quiz');
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

// ── Encyclopedia view ───────────────────────────────
const BOOK_LABELS = {
  basics:      'Аюрведа для начинающих',
  ayurveda1992:'Аюрведа — наука самоисцеления',
  cooking:     'Аюрведическая кулинария',
  recipes:     'Аюрведа. Здоровые рецепты',
  beauty:      'Абсолютная красота',
  fundaments:  'Фундаментальные основы Аюрведы',
  prakriti:    'Пракрити. Ваша аюрведическая конституция',
};

let encyclopediaBuilt = false;
let currentEncSection = null;

function renderArticleContent(text) {
  return text.split(/\n\n+/).map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    // Bullet list
    if (trimmed.startsWith('—') || trimmed.startsWith('–')) {
      const items = trimmed.split(/\n[—–]/).map(s => s.replace(/^[—–]\s*/, '').trim());
      return '<ul>' + items.map(i => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
    }
    // Section heading (short, no period at end, upper/mixed)
    const lines = trimmed.split('\n');
    if (lines.length === 1 && trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.endsWith(',')) {
      // All caps or starts with bold-like pattern
      if (trimmed === trimmed.toUpperCase() || /^[А-ЯЁ][А-ЯЁ\s\-]+:/.test(trimmed)) {
        return `<h4>${escapeHtml(trimmed)}</h4>`;
      }
    }
    // Sub-section with colon pattern e.g. "ВАТА-КОЖА:"
    if (/^[А-ЯЁA-Z][А-ЯЁA-Z\s\-]+:/.test(lines[0])) {
      const heading = lines[0];
      const rest = lines.slice(1).join('\n').trim();
      return `<h4>${escapeHtml(heading)}</h4>${rest ? `<p>${escapeHtml(rest).replace(/\n/g, '<br>')}</p>` : ''}`;
    }
    return `<p>${lines.map(l => escapeHtml(l)).join('<br>')}</p>`;
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
    $artBody.innerHTML      = renderArticleContent(art.content);
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
  {
    id: 'ashtanga',
    title: 'Аштанга-хридая-самхита',
    author: 'Вагбхата',
    year: 'VII век н.э.',
    description: 'Один из трёх главных классических текстов аюрведы (Брихат-трайи). Энциклопедический труд, охватывающий все разделы аюрведической медицины: физиологию, диагностику, фармакологию, хирургию, педиатрию.',
    category: 'Классический текст',
  },
  {
    id: 'basics',
    title: 'Аюрведа для начинающих',
    author: 'Васант Лад',
    year: 'Изд. на рус. яз. ~2003',
    description: 'Вводный курс по аюрведе от одного из самых известных аюрведических врачей мирового уровня. Охватывает основные концепции: пять элементов, три доши, питание, режим дня.',
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
    id: 'cooking',
    title: 'Аюрведическая кулинария',
    author: 'Васант Лад, Уша Лад',
    year: 'Рус. пер.',
    description: 'Полное руководство по аюрведической кулинарии: концепции питания, рецепты по конституции, специи, несовместимые продукты. Содержит более 300 рецептов.',
    category: 'Кулинария',
  },
  {
    id: 'recipes',
    title: 'Аюрведа. Здоровые рецепты',
    author: 'Ярема, Рода, Бранниган',
    year: 'Рус. пер.',
    description: 'Практическое руководство по аюрведическому питанию с рецептами. Особое внимание уделяется шести вкусам и их влиянию на пищеварение и эмоции.',
    category: 'Кулинария',
  },
  {
    id: 'beauty',
    title: 'Абсолютная красота',
    author: 'Пратима Райчур, Мэриан Кон',
    year: 'Рус. пер.',
    description: 'Исчерпывающее руководство по аюрведическому уходу за кожей, волосами и телом. Автор — аюрведический дерматолог с практикой в Нью-Йорке. Типы кожи по дошам, маски, масла, массаж.',
    category: 'Красота',
  },
  {
    id: 'fundaments',
    title: 'Фундаментальные основы Аюрведы',
    author: 'Матхура Мандал Дас',
    year: 'Рус. пер.',
    description: 'Академический труд, детально рассматривающий базовые аюрведические концепции на основе классических текстов (Чарака-самхиты, Сушрута-самхиты). Для углублённого изучения.',
    category: 'Теория',
  },
  {
    id: 'prakriti',
    title: 'Пракрити. Ваша аюрведическая конституция',
    author: 'Роберт Свобода',
    year: 'Рус. пер.',
    description: 'Подробное исследование концепции пракрити — индивидуальной конституции. Автор — первый западный выпускник аюрведической медицины в Индии. Философский и практический взгляд на природу человека.',
    category: 'Конституция',
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
  if (hash === '#encyclopedia' || hash.startsWith('#encyclopedia/')) {
    $encyclopediaBtn.click();
    return;
  }
  if (hash === '#references') {
    $referencesBtn.click();
    return;
  }
  if (hash === '#quiz') {
    $quizBtn.click();
    return;
  }
  // Default: show welcome
  showOnly($welcome);
}

init();
