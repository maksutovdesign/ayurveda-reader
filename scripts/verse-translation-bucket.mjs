// Разбивает ещё не переведённые стихи (без text_en) на батчи ~90K символов.
// Запуск: node scripts/verse-translation-bucket.mjs <папка-для-батчей>
import fs from 'fs';
import path from 'path';
const OUT = process.argv[2];
if (!OUT) { console.error('usage: node scripts/verse-translation-bucket.mjs <dir>'); process.exit(1); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const files = [
  ['data.js', 'BOOK_DATA', 'ashtanga'], ['charaka-data.js', 'CHARAKA_DATA', 'charaka'],
  ['sushruta-data.js', 'SUSHRUTA_DATA', 'sushruta'], ['madhava-data.js', 'MADHAVA_DATA', 'madhava'],
  ['sharangadhara-data.js', 'SHARANGADHARA_DATA', 'sharangadhara'], ['bhavaprakasha-data.js', 'BHAVAPRAKASHA_DATA', 'bhavaprakasha'],
  ['astanga-data.js', 'ASTANGA_DATA', 'astanga_sangraha'], ['kashyapa-data.js', 'KASHYAPA_DATA', 'kashyapa'],
  ['rasaratna-data.js', 'RASARATNA_DATA', 'rasaratna'],
];
const items = [];
for (const [file, key, book] of files) {
  const m = await import(ROOT + file + '?t=' + Date.now());
  const d = m[key]; const chs = Array.isArray(d) ? d : d.chapters;
  chs.forEach((ch, chIndex) => (ch.content || []).forEach((b, vIndex) => {
    if (b.type === 'verse' && b.text && !b.text_en) items.push({ book, chIndex, vIndex, len: b.text.length, text: b.text, number: b.number });
  }));
}
const batches = []; let cur = [], len = 0;
for (const it of items) { if (len >= 90000) { batches.push(cur); cur = []; len = 0; } cur.push(it); len += it.len; }
if (cur.length) batches.push(cur);
fs.mkdirSync(OUT, { recursive: true });
batches.forEach((b, i) => fs.writeFileSync(`${OUT}/verse_batch${i + 1}.json`, JSON.stringify(b)));
console.log('remaining verses:', items.length, 'batches:', batches.length);
