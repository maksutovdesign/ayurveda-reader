const fs = require('fs');
const src = fs.readFileSync('sushruta-data.js', 'utf8');
const m = src.match(/export const SUSHRUTA_DATA\s*=\s*/);
const data = JSON.parse(src.slice(m.index + m[0].length).replace(/;\s*$/, ''));

const sthanaSlug = {
  'Сутрастхана': 'sutra',
  'Нидана стхана': 'nidana',
  'Шарира стхана': 'sharira',
  'Чикитса стхана': 'chikitsa',
  'Калпастхана': 'kalpa',
  'Уттара тантра': 'uttara'
};

const sthana = process.argv[2];
const chStart = parseInt(process.argv[3]);
const chEnd = parseInt(process.argv[4] || process.argv[3]);

if (!sthana || !chStart) {
  console.log('Usage: node extract-sushruta.cjs <sthana> <chStart> [chEnd]');
  console.log('Sthanas:', Object.keys(sthanaSlug).join(', '));
  process.exit(1);
}

const slug = sthanaSlug[sthana];
if (!slug) { console.error('Unknown sthana:', sthana); process.exit(1); }

for (let chNum = chStart; chNum <= chEnd; chNum++) {
  const ch = data.find(c => c.sthana === sthana && c.number === chNum);
  if (!ch) { console.log('Chapter not found:', sthana, chNum); continue; }

  const verses = ch.content.filter(v => v.type === 'verse' && v.text);
  const out = verses.map(v => ({ number: String(v.number), text: v.text }));

  const outPath = `/tmp/sushruta-${slug}-ch${chNum}.json`;
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`${outPath}: ${out.length} verses`);
}
