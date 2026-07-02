/**
 * Выносит «Примечание: …» / «Комментарий: …» / «Note: …» из перевода стиха
 * в отдельный блок {type:"comment", author:"прим. переводчика", text} сразу после стиха.
 * Также чинит обратные слэши между русскими словами (\ → /).
 *
 * Запуск: node scripts/extract-notes.mjs [--dry] [--file=data.js]
 */
import fs from 'fs';

const DRY = process.argv.includes('--dry');
const only = (process.argv.find(a => a.startsWith('--file=')) || '').slice(7);

const FILES = [
  { file: 'data.js',          root: d => d.chapters },
  { file: 'sushruta-data.js', root: d => d },
  { file: 'charaka-data.js',  root: d => d },
];

const AUTHOR = 'прим. переводчика';
const MARKER = /(Примечание|Комментарий|Note)\s*[:.]\s+/;

// Находит парную закрывающую скобку
function matchBracket(s, openPos) {
  const open = s[openPos], close = open === '(' ? ')' : ']';
  let d = 0;
  for (let i = openPos; i < s.length; i++) {
    if (s[i] === open) d++;
    else if (s[i] === close) { d--; if (d === 0) return i; }
  }
  return -1;
}

// Извлекает одно примечание; возвращает {cleanText, note} или null
function extractOne(text) {
  const m = MARKER.exec(text);
  if (!m || m.index < 25) return null; // маркер в самом начале — не трогаем

  let start = m.index, end = text.length, noteStart = m.index;
  // маркер в скобках: [Примечание: …] или (Примечание: …)
  const before = text.slice(0, m.index).trimEnd();
  const lastCh = before[before.length - 1];
  if ((lastCh === '(' || lastCh === '[') ) {
    const openPos = text.lastIndexOf(lastCh, m.index);
    const closePos = matchBracket(text, openPos);
    if (closePos > 0) {
      start = openPos;
      end = closePos + 1;
      const note = text.slice(m.index, closePos).replace(MARKER, '').trim();
      const clean = (text.slice(0, openPos) + ' ' + text.slice(end)).replace(/\s+/g, ' ').trim();
      return { clean, note };
    }
  }
  // обычный случай: примечание до конца текста
  const note = text.slice(noteStart).replace(MARKER, '').trim();
  const clean = text.slice(0, start).trim();
  return { clean, note };
}

let totalNotes = 0, totalSlash = 0;

for (const { file, root } of FILES) {
  if (only && file !== only) continue;
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^([\s\S]*?export const [A-Z_]+ = )([\s\S]*?)(;\s*)$/);
  const data = JSON.parse(fm[2]);
  const chapters = root(data);
  let notes = 0, slashes = 0;

  for (const ch of chapters) {
    const content = ch.content || [];
    for (let i = 0; i < content.length; i++) {
      const b = content[i];
      if (b.type !== 'verse' || !b.text) continue;

      // обратные слэши между кириллицей
      const fixed = b.text.replace(/([а-яёА-ЯЁ]) ?\\ ?([а-яёА-ЯЁ])/g, '$1/$2');
      if (fixed !== b.text) { slashes++; b.text = fixed; }

      // выносим примечания (может быть несколько)
      const extracted = [];
      let guard = 0;
      while (guard++ < 5) {
        const r = extractOne(b.text);
        if (!r || r.note.length < 15) break;
        b.text = r.clean;
        extracted.push(r.note);
      }
      if (extracted.length) {
        notes += extracted.length;
        const loc = `${ch.sthana} гл.${ch.number} стих ${b.number}`;
        extracted.forEach(n => console.log(`  ${loc}: → комментарий (${n.length} зн.): «${n.slice(0, 70)}…»`));
        if (!DRY) {
          const blocks = extracted.map(n => ({ type: 'comment', author: AUTHOR, text: n }));
          content.splice(i + 1, 0, ...blocks);
          i += blocks.length;
        }
      }
    }
  }

  console.log(`${file}: примечаний вынесено ${notes}, слэшей исправлено ${slashes}${DRY ? ' (dry-run)' : ''}`);
  totalNotes += notes; totalSlash += slashes;

  if (!DRY && (notes || slashes)) {
    fs.writeFileSync(file, fm[1] + JSON.stringify(data, null, 2) + fm[3]);
  }
}

console.log(`\nИтого: ${totalNotes} примечаний, ${totalSlash} слэшей${DRY ? ' (dry-run, файлы не изменены)' : ''}`);
