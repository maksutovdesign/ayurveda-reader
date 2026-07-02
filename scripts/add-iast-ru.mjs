import fs from 'fs';
import { iastToCyrillic } from './iast-to-cyrillic.mjs';

const files = ['data.js', 'charaka-data.js', 'sushruta-data.js'];

// Матчим "iast": "..."  но НЕ если сразу за ним уже идёт "iast_ru" (идемпотентность).
const re = /("iast"\s*:\s*"((?:[^"\\]|\\.)*)")(?!\s*,\s*"iast_ru")/g;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let count = 0;
  const out = src.replace(re, (full, iastProp, rawVal) => {
    let val;
    try { val = JSON.parse('"' + rawVal + '"'); } catch { val = rawVal; }
    const cyr = iastToCyrillic(val);
    count++;
    return `${iastProp}, "iast_ru": ${JSON.stringify(cyr)}`;
  });
  fs.writeFileSync(f, out);
  console.log(`${f}: добавлено iast_ru в ${count} стихов`);
}
