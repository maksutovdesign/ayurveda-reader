/**
 * Фикс: в Мадхьямакханде Бхавапракаши заключительный стих-колофон каждой главы
 * («Так в «Бхавапракаше»...») получил number = номер_главы+1 вместо продолжения
 * последовательности нумерации. Из-за этого возникают "дубликат номера" и
 * "нумерация идёт назад" в аудите. Правим: number колофона = prevNum + 1.
 */
import fs from 'fs';

const path = new URL('../bhavaprakasha-data.js', import.meta.url);
const raw = fs.readFileSync(path, 'utf8');
const marker = 'export const BHAVAPRAKASHA_DATA = ';
const idx = raw.indexOf(marker);
if (idx === -1) throw new Error('marker not found');
const prefix = raw.slice(0, idx + marker.length);
let rest = raw.slice(idx + marker.length).trim();
if (rest.endsWith(';')) rest = rest.slice(0, -1);
const data = JSON.parse(rest);

let fixed = 0;
data.forEach(ch => {
  if (ch.sthana !== 'Мадхьямакханда') return;
  const verses = ch.content.filter(b => b.type === 'verse');
  if (verses.length < 2) return;
  const last = verses[verses.length - 1];
  const text = last.text || last.sanskrit || '';
  const isColophon = /^Так в «/.test(text) || /^इति /.test(text);
  if (!isColophon) return;
  const prev = verses[verses.length - 2];
  const prevNum = parseInt(String(prev.number).match(/\d+/)?.[0] || '0', 10);
  const expectedNext = String(prevNum + 1);
  if (String(last.number) !== expectedNext) {
    console.log(`гл.${ch.number}: колофон number ${last.number} -> ${expectedNext}`);
    last.number = expectedNext;
    fixed++;
  }
});

fs.writeFileSync(path, prefix + JSON.stringify(data) + ';\n');
console.log(`Исправлено колофонов: ${fixed}`);
