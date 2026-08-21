/**
 * Генератор статических HTML-страниц для SEO.
 * Читает books.js + data-файлы, создаёт /chapters/<book-id>/<N>.html
 * Запуск: node scripts/generate-static-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Импорт данных ──
const { BOOKS } = await import(ROOT + '/books.js');

const DATA_MAP = {
  ashtanga:         () => import(ROOT + '/data.js').then(m => m.BOOK_DATA.chapters),
  charaka:          () => import(ROOT + '/charaka-data.js').then(m => m.CHARAKA_DATA),
  sushruta:         () => import(ROOT + '/sushruta-data.js').then(m => m.SUSHRUTA_DATA),
  madhava:          () => import(ROOT + '/madhava-data.js').then(m => m.MADHAVA_DATA),
  sharangadhara:    () => import(ROOT + '/sharangadhara-data.js').then(m => m.SHARANGADHARA_DATA),
  bhavaprakasha:    () => import(ROOT + '/bhavaprakasha-data.js').then(m => m.BHAVAPRAKASHA_DATA),
  astanga_sangraha: () => import(ROOT + '/astanga-data.js').then(m => m.ASTANGA_DATA),
};

function slugify(str) {
  return str.toLowerCase()
    .replace(/[а-яё]/g, c => {
      const map = 'а-a б-b в-v г-g д-d е-e ё-yo ж-zh з-z и-i й-y к-k л-l м-m н-n о-o п-p р-r с-s т-t у-u ф-f х-kh ц-ts ч-ch ш-sh щ-shch ъ- ы-y ь- э-e ю-yu я-ya'.split(' ');
      const entry = map.find(e => e.startsWith(c + '-'));
      return entry ? entry.slice(2) : c;
    })
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderContent(content) {
  if (!content || !content.length) return '<p><em>Контент главы загружается в интерактивном читателе.</em></p>';

  return content.map(item => {
    switch (item.type) {
      case 'heading':
        return `<h3>${escapeHtml(item.heading)}</h3>`;

      case 'text':
        return `<p>${escapeHtml(item.text)}</p>`;

      case 'verse': {
        let html = `<div class="verse" id="v${escapeHtml(String(item.number))}">`;
        html += `<div class="verse-num">${escapeHtml(String(item.number))}</div>`;
        if (item.sanskrit) html += `<div class="verse-sa" lang="sa">${escapeHtml(item.sanskrit)}</div>`;
        // Транслитерация: кириллица (iast_ru) как в читателе, латиница IAST — запасной вариант
        const translit = item.iast_ru || item.iast;
        if (translit) html += `<div class="verse-iast">${escapeHtml(translit)}</div>`;
        if (item.text) html += `<div class="verse-ru">${escapeHtml(item.text)}</div>`;
        html += '</div>';
        return html;
      }

      case 'comment': {
        // Объединённые комментарии разделены двойным переносом → отдельные абзацы
        const paras = (item.text || '').split('\n\n')
          .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
        return `<div class="comment">${paras}</div>`;
      }

      default:
        return '';
    }
  }).join('\n');
}

function buildPage(book, chapter, chapterIndex, content, totalChapters) {
  const chTitle = chapter.title || `Глава ${chapter.number}`;
  const subtitle = chapter.subtitle ? ` — ${chapter.subtitle}` : '';
  const fullTitle = `${chTitle}${subtitle} | ${chapter.sthana} | ${book.title}`;
  const description = `${chTitle}${subtitle}. ${chapter.sthana}, ${book.title}. Санскрит, транслитерация IAST и перевод на русский.`;
  const canonicalPath = `/chapters/${book.id}/${chapter.number}-${slugify(chapter.sthana)}.html`;

  const prevCh = chapterIndex > 0 ? BOOKS.find(b => b.id === book.id).chapters[chapterIndex - 1] : null;
  const nextCh = chapterIndex < totalChapters - 1 ? BOOKS.find(b => b.id === book.id).chapters[chapterIndex + 1] : null;

  const prevLink = prevCh
    ? `<a href="/chapters/${book.id}/${prevCh.number}-${slugify(prevCh.sthana)}.html">&larr; ${prevCh.title || 'Глава ' + prevCh.number}</a>`
    : '';
  const nextLink = nextCh
    ? `<a href="/chapters/${book.id}/${nextCh.number}-${slugify(nextCh.sthana)}.html">${nextCh.title || 'Глава ' + nextCh.number} &rarr;</a>`
    : '';

  const verseCount = (content || []).filter(c => c.type === 'verse').length;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="https://ayurvedareader.ru${canonicalPath}">
<link rel="icon" href="/icon-192.png" type="image/png">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="https://ayurvedareader.ru${canonicalPath}">
<meta property="og:type" content="article">
<meta property="og:image" content="https://ayurvedareader.ru/og-image.png">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Ayurveda Reader">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Chapter",
  "name": "${escapeHtml(chTitle + subtitle)}",
  "isPartOf": {
    "@type": "Book",
    "name": "${escapeHtml(book.title)}",
    "url": "https://ayurvedareader.ru/"
  },
  "position": ${chapterIndex + 1},
  "inLanguage": ["sa", "ru"],
  "url": "https://ayurvedareader.ru${canonicalPath}"
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:760px;margin:0 auto;padding:20px 16px 60px;line-height:1.8;color:#3a3a3a;background:#faf8f4}
a{color:#4a7c59;text-decoration:none}
a:hover{text-decoration:underline}
.breadcrumb{font-size:.85em;color:#888;margin-bottom:16px}
.breadcrumb a{color:#7a5c2e}
h1{font-size:1.5em;color:#4a7c59;margin-bottom:4px;line-height:1.3}
.subtitle{color:#888;font-size:.95em;margin-bottom:20px}
.meta{font-size:.85em;color:#999;margin-bottom:24px}
h3{font-size:1.1em;color:#7a5c2e;margin:28px 0 12px;border-bottom:1px solid #e8e0d0;padding-bottom:6px}
p{margin:0 0 14px}
.verse{margin:20px 0;padding:16px;background:#f5f0e8;border-radius:8px;border-left:3px solid #c9a96e}
.verse-num{font-size:.8em;color:#999;font-weight:600;margin-bottom:6px}
.verse-sa{font-family:"Noto Sans Devanagari",sans-serif;font-size:1.05em;color:#6b4e2e;margin-bottom:6px;line-height:1.9}
.verse-iast{font-style:italic;color:#7a5c2e;margin-bottom:8px;font-size:.95em}
.verse-ru{color:#3a3a3a}
.comment{margin:10px 0;padding:12px 16px;background:#f0ece4;border-radius:6px;font-size:.9em;color:#5a5a5a}
.nav-links{display:flex;justify-content:space-between;margin-top:40px;padding-top:20px;border-top:1px solid #e8e0d0;font-size:.9em;gap:16px}
.nav-links a{flex:0 1 auto;max-width:45%}
.open-reader{display:inline-block;margin:16px 0 24px;padding:10px 20px;background:#4a7c59;color:#fff;border-radius:6px;font-size:.95em}
.open-reader:hover{background:#3d6a4b;text-decoration:none}
footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e0d0;font-size:.8em;color:#999;text-align:center}
</style>
</head>
<body>
<nav class="breadcrumb">
  <a href="/">Главная</a> &rsaquo;
  <a href="/chapters/${book.id}/">${escapeHtml(book.titleShort || book.title)}</a> &rsaquo;
  ${escapeHtml(chapter.sthana)}
</nav>

<h1>${escapeHtml(chTitle)}</h1>
${subtitle ? `<p class="subtitle">${escapeHtml(subtitle.slice(3))}</p>` : ''}
<p class="meta">${escapeHtml(book.title)} · ${escapeHtml(chapter.sthana)} · Глава ${chapter.number}${verseCount ? ' · ' + verseCount + ' стихов' : ''}</p>

<a class="open-reader" href="/#${book.id}/c${chapterIndex}">Открыть в интерактивном читателе &rarr;</a>

${renderContent(content)}

<div class="nav-links">
  <span>${prevLink}</span>
  <span>${nextLink}</span>
</div>

<footer>
  <a href="/">Классические самхиты Аюрведы</a> · <a href="https://ayurvedareader.ru/">ayurvedareader.ru</a>
</footer>
</body>
</html>`;
}

function buildIndex(book) {
  const bySthan = {};
  book.chapters.forEach(ch => {
    if (!bySthan[ch.sthana]) bySthan[ch.sthana] = [];
    bySthan[ch.sthana].push(ch);
  });

  let listHtml = '';
  for (const [sthana, chapters] of Object.entries(bySthan)) {
    listHtml += `<h2>${escapeHtml(sthana)}</h2>\n<ul>\n`;
    for (const ch of chapters) {
      const slug = `${ch.number}-${slugify(sthana)}.html`;
      const title = ch.title || `Глава ${ch.number}`;
      const sub = ch.subtitle ? ` — ${ch.subtitle}` : '';
      listHtml += `  <li><a href="/chapters/${book.id}/${slug}">${ch.number}. ${escapeHtml(title)}${escapeHtml(sub)}</a></li>\n`;
    }
    listHtml += `</ul>\n`;
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(book.title)} — Оглавление | Ayurveda Reader</title>
<meta name="description" content="${escapeHtml(book.title)}: полное оглавление. ${book.stats.chapters} глав, ${book.stats.verses} стихов. Санскрит, IAST, перевод на русский.">
<link rel="canonical" href="https://ayurvedareader.ru/chapters/${book.id}/">
<link rel="icon" href="/icon-192.png" type="image/png">
<meta property="og:title" content="${escapeHtml(book.title)} — Оглавление">
<meta property="og:url" content="https://ayurvedareader.ru/chapters/${book.id}/">
<meta property="og:type" content="book">
<meta property="og:image" content="https://ayurvedareader.ru/og-image.png">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:760px;margin:0 auto;padding:20px 16px 60px;line-height:1.7;color:#3a3a3a;background:#faf8f4}
a{color:#4a7c59;text-decoration:none}
a:hover{text-decoration:underline}
h1{font-size:1.5em;color:#4a7c59;margin-bottom:4px}
.subtitle{color:#888;font-size:.95em;margin-bottom:8px}
.meta{font-size:.85em;color:#999;margin-bottom:24px}
h2{font-size:1.1em;color:#7a5c2e;margin:24px 0 8px}
ul{padding-left:20px;margin-bottom:16px}
li{margin-bottom:4px}
.breadcrumb{font-size:.85em;color:#888;margin-bottom:16px}
.breadcrumb a{color:#7a5c2e}
footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e0d0;font-size:.8em;color:#999;text-align:center}
</style>
</head>
<body>
<nav class="breadcrumb"><a href="/">Главная</a> &rsaquo; ${escapeHtml(book.titleShort || book.title)}</nav>
<h1>${escapeHtml(book.title)}</h1>
<p class="subtitle">${escapeHtml(book.subtitle)}</p>
<p class="meta">${book.stats.chapters} глав · ${book.stats.verses} стихов</p>
${listHtml}
<footer>
  <a href="/">Классические самхиты Аюрведы</a> · <a href="https://ayurvedareader.ru/">ayurvedareader.ru</a>
</footer>
</body>
</html>`;
}

// ── Main ──
const chaptersDir = path.join(ROOT, 'chapters');
const sitemapEntries = [
  { loc: 'https://ayurvedareader.ru/', lastmod: '2026-07-11', priority: '1.0', freq: 'weekly' },
  { loc: 'https://ayurvedareader.ru/privacy.html', lastmod: '2026-06-07', priority: '0.2', freq: 'yearly' },
];

let totalPages = 0;

for (const book of BOOKS) {
  if (!book.available) continue;

  const bookDir = path.join(chaptersDir, book.id);
  fs.mkdirSync(bookDir, { recursive: true });

  // Load data
  const loader = DATA_MAP[book.id];
  let dataChapters = [];
  if (loader) {
    try { dataChapters = await loader(); } catch (e) { console.error(`  Failed to load data for ${book.id}:`, e.message); }
  }

  // Build content map: sthana:number -> content
  const contentMap = new Map();
  for (const dc of dataChapters) {
    const key = `${dc.sthana}:${dc.number}`;
    contentMap.set(key, dc.content || []);
  }

  // Generate chapter pages
  for (let i = 0; i < book.chapters.length; i++) {
    const ch = book.chapters[i];
    const content = contentMap.get(`${ch.sthana}:${ch.number}`) || [];
    const slug = `${ch.number}-${slugify(ch.sthana)}.html`;
    const html = buildPage(book, ch, i, content, book.chapters.length);
    fs.writeFileSync(path.join(bookDir, slug), html, 'utf8');

    sitemapEntries.push({
      loc: `https://ayurvedareader.ru/chapters/${book.id}/${slug}`,
      lastmod: '2026-07-11',
      priority: '0.6',
      freq: 'monthly',
    });
    totalPages++;
  }

  // Generate book index
  const indexHtml = buildIndex(book);
  fs.writeFileSync(path.join(bookDir, 'index.html'), indexHtml, 'utf8');
  sitemapEntries.push({
    loc: `https://ayurvedareader.ru/chapters/${book.id}/`,
    lastmod: '2026-07-11',
    priority: '0.8',
    freq: 'monthly',
  });
  totalPages++;

  console.log(`  ${book.titleShort}: ${book.chapters.length} глав + index`);
}

// Generate /chapters/index.html
let booksListHtml = BOOKS.filter(b => b.available).map(b =>
  `<li><a href="/chapters/${b.id}/">${escapeHtml(b.title)}</a> — ${b.stats.chapters} глав, ${b.stats.verses} стихов</li>`
).join('\n');

const mainIndex = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Классические самхиты Аюрведы — Все книги | Ayurveda Reader</title>
<meta name="description" content="7 классических самхит Аюрведы: Аштанга-хридая, Чарака, Сушрута, Бхавапракаша и другие. 718 глав, 34 617 шлока. Санскрит, IAST, перевод.">
<link rel="canonical" href="https://ayurvedareader.ru/chapters/">
<link rel="icon" href="/icon-192.png" type="image/png">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:760px;margin:0 auto;padding:20px 16px 60px;line-height:1.7;color:#3a3a3a;background:#faf8f4}
a{color:#4a7c59;text-decoration:none}
a:hover{text-decoration:underline}
h1{font-size:1.5em;color:#4a7c59;margin-bottom:16px}
ul{padding-left:20px}
li{margin-bottom:8px}
footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e0d0;font-size:.8em;color:#999;text-align:center}
</style>
</head>
<body>
<h1>Классические самхиты Аюрведы</h1>
<p>7 классических аюрведических канонов — 718 глав, 34 617 шлока на санскрите с переводом.</p>
<ul>
${booksListHtml}
</ul>
<footer>
  <a href="/">Открыть интерактивный читатель</a> · <a href="https://ayurvedareader.ru/">ayurvedareader.ru</a>
</footer>
</body>
</html>`;
fs.writeFileSync(path.join(chaptersDir, 'index.html'), mainIndex, 'utf8');
sitemapEntries.push({ loc: 'https://ayurvedareader.ru/chapters/', lastmod: '2026-07-11', priority: '0.9', freq: 'monthly' });

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

console.log(`\nГотово: ${totalPages} страниц + sitemap (${sitemapEntries.length} URL)`);
