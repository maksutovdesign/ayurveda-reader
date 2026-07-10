const fs = require('fs');
const dataPath = 'sushruta-data.js';
const src = fs.readFileSync(dataPath, 'utf8');
const m = src.match(/export const SUSHRUTA_DATA\s*=\s*/);
const prefix = src.slice(0, m.index + m[0].length);
const data = JSON.parse(src.slice(m.index + m[0].length).replace(/;\s*$/, ''));

const sthanaMap = {
  'sutra': 'Сутрастхана',
  'nidana': 'Нидана стхана',
  'sharira': 'Шарира стхана',
  'chikitsa': 'Чикитса стхана',
  'kalpa': 'Калпастхана',
  'uttara': 'Уттара тантра'
};

const files = process.argv.slice(2);
if (!files.length) {
  console.log('Usage: node inject-sushruta-ru.cjs <file1.json> [file2.json] ...');
  console.log('Filename format: sushruta-<sthana>-ch<N>.json');
  process.exit(1);
}

let totalInjected = 0;

for (const file of files) {
  const basename = file.split('/').pop().replace('.json', '');
  const parts = basename.match(/sushruta-(\w+)-ch(\d+)/);
  if (!parts) { console.error('Bad filename:', file); continue; }

  const sthana = sthanaMap[parts[1]];
  const chNum = parseInt(parts[2]);
  if (!sthana) { console.error('Unknown sthana slug:', parts[1]); continue; }

  const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ch = data.find(c => c.sthana === sthana && c.number === chNum);
  if (!ch) { console.error('Chapter not found:', sthana, chNum); continue; }

  let injected = 0;
  for (const tr of translations) {
    const verse = ch.content.find(v => v.type === 'verse' && String(v.number) === String(tr.number));
    if (verse) {
      verse.text = tr.text;
      if (verse.lang) delete verse.lang;
      injected++;
    } else {
      console.warn('  Verse not found:', sthana, 'ch' + chNum, 'v' + tr.number);
    }
  }
  console.log(sthana + ' ch' + chNum + ': ' + injected + '/' + translations.length + ' injected');
  totalInjected += injected;
}

fs.writeFileSync(dataPath, prefix + JSON.stringify(data, null, 2) + ';\n');
console.log('Total injected: ' + totalInjected);
