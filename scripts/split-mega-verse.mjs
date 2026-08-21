/**
 * Разбивает один "мега-стих" (несколько склеенных шлок в одном тексте с
 * внутренними маркерами "68. ", "69. " и т.д., продолжающими нумерацию главы)
 * на отдельные стихи. Без --apply — только предпросмотр (ничего не пишет).
 *
 * Использование:
 *   node scripts/split-mega-verse.mjs --book=charaka --sthana="Сутрастхана" --chapter=25 --verse=67 [--apply]
 */
import fs from 'fs';

const args = Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>{
  const [k,v] = a.slice(2).split('=');
  return [k, v === undefined ? true : v];
}));

const BOOKS = {
  charaka:  { file: 'charaka-data.js',  key: 'CHARAKA_DATA' },
  sushruta: { file: 'sushruta-data.js', key: 'SUSHRUTA_DATA' },
};

const book = BOOKS[args.book];
if (!book) throw new Error('нужен --book=charaka|sushruta');

const path = book.file;
const raw = fs.readFileSync(path, 'utf8');
const marker = `export const ${book.key} = `;
const idx = raw.indexOf(marker);
if (idx === -1) throw new Error('marker не найден');
const prefix = raw.slice(0, idx + marker.length);
let rest = raw.slice(idx + marker.length).trim();
if (rest.endsWith(';')) rest = rest.slice(0, -1);
const data = JSON.parse(rest);

const ch = data.find(c => c.sthana === args.sthana && String(c.number) === String(args.chapter));
if (!ch) throw new Error('глава не найдена');

const verseIdxInContent = ch.content.findIndex(b => b.type === 'verse' && String(b.number) === String(args.verse));
if (verseIdxInContent === -1) throw new Error('стих не найден');
const v = ch.content[verseIdxInContent];

const pnMatch = String(v.number).match(/^(\d+)(?:[-–](\d+))?$/);
const lastNum = parseInt(pnMatch[2] || pnMatch[1]);

const markerRe = /(^|[ \n.")»])(\d+(?:[-–]\d+)?)\.\s+(?=[A-ZА-ЯЁ])/g;
const text = v.text;
const matches = [...text.matchAll(markerRe)];

// собираем границы разреза: маркеры с монотонно возрастающим первым числом,
// начиная строго с lastNum+1 (диапазоны вида "9-11." сохраняются целиком как номер стиха)
let minNext = lastNum + 1;
const cuts = []; // {pos, endOfMarkerPos, num}
for (const m of matches) {
  const rangeStr = m[2];
  const first = parseInt(rangeStr.match(/^\d+/)[0]);
  if (first < minNext) continue;
  cuts.push({ pos: m.index + m[1].length, num: rangeStr, fullMatchEnd: m.index + m[0].length });
  const last = parseInt((rangeStr.match(/[-–](\d+)/) || [null, rangeStr.match(/^\d+/)[0]])[1]);
  minNext = last + 1;
}

if (cuts.length === 0) {
  console.log('Маркеров-продолжений не найдено, разбивать нечего.');
  process.exit(0);
}

// первый кусок: от начала текста до первого cut.pos (это остаётся текстом исходного стиха v.number)
const pieces = [];
pieces.push({ number: v.number, text: text.slice(0, cuts[0].pos).trim() });
for (let i = 0; i < cuts.length; i++) {
  const start = cuts[i].fullMatchEnd; // после "NN. "
  const end = i + 1 < cuts.length ? cuts[i+1].pos : text.length;
  pieces.push({ number: String(cuts[i].num), text: text.slice(start, end).trim() });
}

console.log(`Стих ${args.verse} (${args.sthana} гл.${args.chapter}), исходная длина ${text.length}`);
console.log(`Найдено ${cuts.length} границ продолжения, итог: ${pieces.length} кусков`);
pieces.forEach(p => console.log(`  [${p.number}] (${p.text.length} симв.) ${JSON.stringify(p.text.slice(0,70))}`));

const totalOut = pieces.reduce((s,p)=>s+p.text.length,0);
console.log(`Суммарная длина кусков: ${totalOut} (исходная ${text.length}, разница ${text.length-totalOut} — теряется на маркерах "NN. " и пробелах, это ожидаемо)`);

if (args.apply) {
  const newVerseObjs = pieces.map(p => ({ type: 'verse', number: p.number, text: p.text, sanskrit: p.number === v.number ? (v.sanskrit||null) : null, iast: p.number === v.number ? (v.iast||null) : null }));
  ch.content.splice(verseIdxInContent, 1, ...newVerseObjs);
  fs.writeFileSync(path, prefix + JSON.stringify(data) + ';\n');
  console.log(`ПРИМЕНЕНО: стих заменён на ${newVerseObjs.length} стихов.`);
} else {
  console.log('(предпросмотр — для применения добавьте --apply)');
}
