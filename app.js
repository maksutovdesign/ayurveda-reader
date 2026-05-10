import { BOOK_DATA } from './data.js';
import { GLOSSARY, lookupTerm, TERM_REGEX } from './glossary.js';

// ── State ──────────────────────────────────────────
let currentChapterIdx = null;
let searchQuery = '';
let tooltipTimeout = null;

// ── Elements ───────────────────────────────────────
const $nav         = document.getElementById('chapter-nav');
const $welcome     = document.getElementById('welcome');
const $chapterView = document.getElementById('chapter-view');
const $searchRes   = document.getElementById('search-results');
const $chapterBody = document.getElementById('chapter-body');
const $chTitle     = document.getElementById('chapter-title');
const $chSubtitle  = document.getElementById('chapter-subtitle');
const $chBreadcrumb= document.getElementById('chapter-breadcrumb');
const $searchInput = document.getElementById('search-input');
const $themeToggle = document.getElementById('theme-toggle');
const $tooltip     = document.getElementById('tooltip');

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

  $welcome.hidden = true;
  $searchRes.hidden = true;
  $chapterView.hidden = false;

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

  // Scroll to top
  document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });

  // Update URL hash
  history.replaceState(null, '', `#ch${idx}`);
}

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
    $searchRes.hidden = true;
    if (currentChapterIdx !== null) {
      $chapterView.hidden = false;
    } else {
      $welcome.hidden = false;
    }
    return;
  }

  $welcome.hidden = true;
  $chapterView.hidden = true;
  $searchRes.hidden = false;

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
  // Default: show welcome
  $welcome.hidden = false;
}

init();
