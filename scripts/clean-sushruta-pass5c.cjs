const fs = require('fs');
const src = fs.readFileSync('sushruta-data.js', 'utf8');
const m = src.match(/export const SUSHRUTA_DATA\s*=\s*/);
const prefix = src.slice(0, m.index + m[0].length);
const data = JSON.parse(src.slice(m.index + m[0].length).replace(/;\s*$/, ''));

let fixes = 0;
for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    let t = v.text;
    const orig = t;

    // Remove all bullet chars (OCR artifacts)
    t = t.replace(/•/g, '');

    // Remove > when between letter and letter/space (OCR for random chars)
    t = t.replace(/([a-zA-Z])>/g, '$1');
    t = t.replace(/>([a-zA-Z])/g, '$1');
    t = t.replace(/ > /g, ' ');
    t = t.replace(/> /g, ' ');
    t = t.replace(/ >/g, ' ');

    // Remove < between letters
    t = t.replace(/([a-zA-Z])</g, '$1');
    t = t.replace(/<([a-zA-Z])/g, '$1');
    t = t.replace(/ < /g, ' ');
    t = t.replace(/< /g, ' ');
    t = t.replace(/ </g, ' ');

    // Remove remaining standalone < >
    t = t.replace(/[<>]/g, '');

    // Clean multiple spaces
    t = t.replace(/ {2,}/g, ' ');
    t = t.trim();

    if (t !== orig) { v.text = t; fixes++; }
  }
}

fs.writeFileSync('sushruta-data.js', prefix + JSON.stringify(data, null, 2) + ';\n');
console.log('Pass 5c: ' + fixes + ' verses cleaned');

// Verify
let rem = 0;
for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    if (/[<>•{}\|\\~^]/.test(v.text)) rem++;
  }
}
console.log('Junk chars remaining: ' + rem);
