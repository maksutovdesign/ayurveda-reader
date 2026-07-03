/** Чистка квадратных скобок в Аштанге/Сушруте/Чараке по категориям.
 *  node scripts/clean-brackets-3books.mjs */
import fs from 'fs';

const FILES = ['data.js', 'sushruta-data.js', 'charaka-data.js'];
const KEEP = new Set([  // редакторские метки-стихи — оставить как есть
  '[Продолжение текста]', '[Окончание предыдущего стиха.]', '[Продолжение предыдущего стиха.]',
]);

function transform(t) {
  if (t == null) return { t, unwrap: 0, paren: 0 };
  let unwrap = 0, paren = 0;
  // comment/verse, целиком обёрнутый в [ ] (кроме сохраняемых меток) → снять внешние
  const trimmed = t.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']') && !KEEP.has(trimmed)
      && trimmed.indexOf(']') === trimmed.length - 1) {
    unwrap++;
    return { t: trimmed.slice(1, -1).trim(), unwrap, paren };
  }
  const out = t.replace(/\[([^\]]*)\]/g, (m, inner) => {
    if (KEEP.has(m)) return m;                 // метка целиком — не трогаем
    if (inner === 'симптомам и') { unwrap++; return inner; }   // часть фразы → развернуть
    if (inner.includes('(')) { unwrap++; return inner; }       // избежать двойных скобок
    paren++; return '(' + inner + ')';         // остальное → круглые скобки
  });
  return { t: out, unwrap, paren };
}

let totalU = 0, totalP = 0;
for (const file of FILES) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^([\s\S]*?export const [A-Z_]+ = )([\s\S]*?)(;\s*)$/);
  const data = JSON.parse(fm[2]);
  const chapters = Array.isArray(data) ? data : data.chapters;
  let u = 0, p = 0;
  for (const ch of chapters) for (const b of ch.content || []) {
    for (const fld of ['text', 'english']) {
      if (!b[fld]) continue;
      const r = transform(b[fld]);
      b[fld] = r.t; u += r.unwrap; p += r.paren;
    }
  }
  fs.writeFileSync(file, fm[1] + JSON.stringify(data, null, 2) + fm[3]);
  console.log(`${file}: развёрнуто ${u}, в круглые ${p}`);
  totalU += u; totalP += p;
}
console.log(`\nИтого: развёрнуто ${totalU}, переведено в круглые ${totalP}, оставлено меток ${KEEP.size}×N`);
