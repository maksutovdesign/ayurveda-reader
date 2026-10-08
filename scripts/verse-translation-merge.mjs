// Вливает verse_batch<N>_done.json (text_en) в *-data.js. Запуск: node scripts/verse-translation-merge.mjs <папка> <N>
import fs from 'fs';
import path from 'path';
const [DIR, N] = process.argv.slice(2);
if (!DIR || !N) { console.error('usage: node scripts/verse-translation-merge.mjs <dir> <N>'); process.exit(1); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const BOOKS = {
  ashtanga: ['data.js', 'BOOK_DATA', true], charaka: ['charaka-data.js', 'CHARAKA_DATA'], sushruta: ['sushruta-data.js', 'SUSHRUTA_DATA'],
  madhava: ['madhava-data.js', 'MADHAVA_DATA'], sharangadhara: ['sharangadhara-data.js', 'SHARANGADHARA_DATA'],
  bhavaprakasha: ['bhavaprakasha-data.js', 'BHAVAPRAKASHA_DATA'], astanga_sangraha: ['astanga-data.js', 'ASTANGA_DATA'],
  kashyapa: ['kashyapa-data.js', 'KASHYAPA_DATA'], rasaratna: ['rasaratna-data.js', 'RASARATNA_DATA'],
};
const input = JSON.parse(fs.readFileSync(`${DIR}/verse_batch${N}.json`, 'utf8'));
const done = JSON.parse(fs.readFileSync(`${DIR}/verse_batch${N}_done.json`, 'utf8'));
if (done.length !== input.length) { console.error('COUNT MISMATCH', input.length, done.length); process.exit(1); }
const by = {};
input.forEach((it, i) => {
  const d = done[i];
  if (d.chIndex !== it.chIndex || d.vIndex !== it.vIndex) { console.error('ORDER MISMATCH at', i); process.exit(1); }
  if (!d.text_en || !d.text_en.trim()) { console.error('EMPTY text_en at', i); process.exit(1); }
  (by[it.book] ||= []).push(d);
});
for (const [book, entries] of Object.entries(by)) {
  const [file, key, wrapped] = BOOKS[book];
  const full = fs.readFileSync(ROOT + file, 'utf8');
  const m = full.match(new RegExp('export const ' + key + '\\s*=\\s*'));
  const header = full.slice(0, m.index + m[0].length), body = full.slice(m.index + m[0].length);
  const stripped = body.replace(/\s+$/, '');
  if (!stripped.endsWith(';')) { console.error('no trailing ; in', file); process.exit(1); }
  const data = JSON.parse(stripped.slice(0, -1)); const footer = body.slice(stripped.length);
  const chs = wrapped ? data.chapters : data;
  for (const e of entries) {
    const b = (chs[e.chIndex]?.content || [])[e.vIndex];
    if (!b || b.type !== 'verse') { console.error('bad target', book, e.chIndex, e.vIndex); process.exit(1); }
    b.text_en = e.text_en;
  }
  fs.writeFileSync(ROOT + file, header + JSON.stringify(data, null, 2) + ';' + footer);
  console.log('merged', entries.length, 'into', file);
}
