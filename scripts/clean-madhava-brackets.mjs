/** Снимает квадратные скобки [ ] вставок переводчика в Мадхаве, сохраняя слово внутри.
 *  Структурные скобки массивов (content: [ ], внешний массив) не трогаются.
 *  node scripts/clean-madhava-brackets.mjs */
import fs from 'fs';

const file = 'madhava-data.js';
let src = fs.readFileSync(file, 'utf8');
const before = (src.match(/\[/g) || []).length;

src = src.replace(/\[(?![\s{])/g, '');   // прозаические [: не перед пробелом/{
src = src.replace(/(?<![\s}])\]/g, '');  // прозаические ]: не после пробела/}

fs.writeFileSync(file, src);
const after = (src.match(/\[/g) || []).length;
console.log(`[ было: ${before} → осталось структурных: ${after} (снято скобок-вставок: ${before - after})`);
