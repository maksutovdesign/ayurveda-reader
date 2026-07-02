/** Точечная вычитка OCR-опечаток (проверено вручную). node scripts/fix-typos.mjs */
import fs from 'fs';

function loadWrite(file, fn) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^([\s\S]*?export const [A-Z_]+ = )([\s\S]*?)(;\s*)$/);
  const data = JSON.parse(fm[2]);
  const n = fn(data);
  fs.writeFileSync(file, fm[1] + JSON.stringify(data, null, 2) + fm[3]);
  return n;
}
const chaptersOf = (data) => Array.isArray(data) ? data : data.chapters;

// точечные замены: [файл, стхана, глава, стих, [from,to]...]
const POINT = {
  'data.js': [
    ['Сутрастхана', 1, '11', [
      ['внсра (дурной запах)', 'висра (дурной запах)'],
      ['сара (теку? честь)', 'сара (текучесть)'],
      ['драна (качества жидкости)', 'драва (качество жидкости)'],
    ]],
    ['Сутрастхана', 19, '23', [['мед-ленном', 'медленном']]],
  ],
};

let pointN = 0;
for (const [file, list] of Object.entries(POINT)) {
  loadWrite(file, (data) => {
    const chs = chaptersOf(data);
    for (const [sth, num, vn, reps] of list) {
      const c = chs.find(x => x.sthana === sth && String(x.number) === String(num));
      const v = c.content.find(b => b.type === 'verse' && String(b.number) === String(vn));
      for (const [from, to] of reps) {
        if (v.text.includes(from)) { v.text = v.text.replace(from, to); pointN++; console.log('✅ точечно', file, num + '.' + vn, ':', from, '→', to); }
        else console.log('❌ не найдено', file, num + '.' + vn, ':', from);
      }
    }
  });
}

// глобально: пробел перед пунктуацией «слово ,» → «слово,» (инициалы не задевает — там пробел ПОСЛЕ точки)
let spaceN = 0;
for (const file of ['data.js', 'sushruta-data.js', 'charaka-data.js']) {
  loadWrite(file, (data) => {
    for (const ch of chaptersOf(data)) for (const b of ch.content || []) {
      if (!b.text) continue;
      const before = b.text;
      b.text = b.text.replace(/(\S) ([,;:.])(?=\s|$)/g, '$1$2');
      if (b.text !== before) spaceN++;
    }
  });
}
console.log(`\nТочечных замен: ${pointN}, стихов с исправленным пробелом перед пунктуацией: ${spaceN}`);
