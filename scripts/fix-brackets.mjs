/** Точечные правки скобок (проверены вручную). node scripts/fix-brackets.mjs */
import fs from 'fs';

const FIX = {
  'data.js': [
    ['Сутрастхана', 1, '11', 'чала (подвижность свойства доши анила (вата)', 'чала (подвижность) свойства доши анила (вата)'],
    ['Сутрастхана', 2, '33', 'Не следует вторгаться (в тень', 'Не следует вторгаться в тень'],
    ['Сутрастхана', 6, '44', 'пустыня или полупустыня).', 'пустыня или полупустыня)].'],
    ['Сутрастхана', 8, '4-5', 'рвоты и поноса), одновременно', 'рвоты и поноса)), одновременно'],
  ],
  'sushruta-data.js': [
    ['Чикитса стхана', 14, '19', 'следует очистить. (Два конца', 'следует очистить. Два конца'],
  ],
  'charaka-data.js': [
    ['Чикитса стхана', 15, '35', 'на более высокий.)', 'на более высокий.'],
    ['Сутрастхана', 25, '67', '(сукханам). } Итак', '(сукханам). Итак'],
  ],
};

const ROOT = { 'data.js': d => d.chapters };

let total = 0;
for (const [file, fixes] of Object.entries(FIX)) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^([\s\S]*?export const [A-Z_]+ = )([\s\S]*?)(;\s*)$/);
  const data = JSON.parse(fm[2]);
  const chapters = (ROOT[file] || (d => d))(data);
  for (const [sth, num, vn, from, to] of fixes) {
    const ch = chapters.find(c => c.sthana === sth && String(c.number) === String(num));
    const v = ch?.content.find(b => b.type === 'verse' && String(b.number) === vn);
    if (!v) { console.log('❌ не найден', file, sth, num, vn); continue; }
    if (!v.text.includes(from)) { console.log('❌ строка не совпала', file, sth, num, vn); continue; }
    v.text = v.text.replace(from, to);
    console.log('✅', file, sth, num + '.' + vn);
    total++;
  }
  fs.writeFileSync(file, fm[1] + JSON.stringify(data, null, 2) + fm[3]);
}
console.log('\nИсправлено:', total);
