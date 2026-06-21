const fs = require('fs');
const src = fs.readFileSync('sushruta-data.js', 'utf8');
const m = src.match(/export const SUSHRUTA_DATA\s*=\s*/);
const prefix = src.slice(0, m.index + m[0].length);
const data = JSON.parse(src.slice(m.index + m[0].length).replace(/;\s*$/, ''));

let fixes = 0;
let fixCounts = {};
function count(cat) { fixCounts[cat] = (fixCounts[cat] || 0) + 1; fixes++; }

for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    let t = v.text;
    const orig = t;

    // 1. Remove inline page headers: "NUMBER THE/THP/THESUSHRUTA SAMHITA. [Chap. ..."
    t = t.replace(/\d+\s*(?:TH[EPIiKk:te]*\s*)?SUS[A-Za-z'li]+\s+SAM[A-Za-z'liHdSX]+\.?\s*(?:[\[f(]\s*(?:Chap|chap|Clis)[\s\].,;IVXLC\dvi]*\.?\]?\s*)?/gi, (match) => {
      if (/which\s+(?:deals|treats)/i.test(match)) return match;
      count('page_header');
      return ' ';
    });

    // 2. Remove standalone page headers without number prefix
    t = t.replace(/(?:TH[EPIiKk:te]+\s*)SUS[A-Za-z'li]+\s+SAM[A-Za-z'liHdSX]+\.?\s*(?:[\[f(]\s*(?:Chap|chap)[\s\].,;IVXLC\dvi]*\.?\]?\s*)?/gi, (match) => {
      if (/which\s+(?:deals|treats)/i.test(match)) return match;
      count('page_header_nonum');
      return ' ';
    });

    // 3. Remove library card text
    t = t.replace(/Sushruta samhita PLEASE DO NOT REMOVE\s*CARDS OR SLIPS FROM THIS POCKET\s*UNIVERSITY OF TORONTO LIBRARY/gi, () => {
      count('library_card');
      return '';
    });

    // 4. Fix chapter closing "Samhit*" variants → "Samhita"
    t = t.replace(/Samhit[dSéi]?\s+(which\s+(?:deals|treats))/gi, (m, rest) => {
      count('Samhita_fix');
      return 'Samhita ' + rest;
    });

    // 5. f Chap. → remove (remnant of page header)
    t = t.replace(/\bf Chap\.\s*[IVXLC\d.]+/gi, () => { count('f_Chap'); return ''; });
    t = t.replace(/\btChap\.\s*[IVXLC\d.]+/gi, () => { count('tChap'); return ''; });

    // 6. ihe → the (OCR for 'the')
    t = t.replace(/\bihe\b/g, () => { count('ihe→the'); return 'the'; });

    // 7. tne → the
    t = t.replace(/\btne\b/g, () => { count('tne→the'); return 'the'; });

    // 8. b) → by in various contexts
    t = t.replace(/\bb\)'/g, () => { count("b)'→by"); return 'by'; });
    t = t.replace(/\bb\)-/g, () => { count('b)-→by'); return 'by'; });
    t = t.replace(/\bb\)"/g, () => { count('b)"→by'); return 'by"'; });
    t = t.replace(/\bb\)\s/g, () => { count('b)→by'); return 'by '; });

    // 9. l)ut → but
    t = t.replace(/\bl\)ut\b/g, () => { count('l)ut→but'); return 'but'; });

    // 10. ph3 → phy (ph3sicians → physicians)
    t = t.replace(/ph3/g, () => { count('ph3→phy'); return 'phy'; });

    // 11. th)- → they
    t = t.replace(/th\)-/g, () => { count('th)-→they'); return 'they'; });
    t = t.replace(/th\}-/g, () => { count('th}-→they'); return 'they'; });

    // 12. jositively → positively
    t = t.replace(/\bjositi/g, () => { count('jositively'); return 'positi'; });

    // 13. stU'ly → study (capital U mid-word + apos)
    t = t.replace(/stU'ly/g, () => { count("stU'ly→study"); return 'study'; });

    // 14. li\'es → lives
    t = t.replace(/li\\'es/g, () => { count("li\\\\'es→lives"); return 'lives'; });
    t = t.replace(/li\\'es/g, () => { count("lives"); return 'lives'; });

    // 15. honour- ed → honoured (word- suffix patterns in this text)
    t = t.replace(/honour-\s*ed/g, () => { count('honoured'); return 'honoured'; });
    t = t.replace(/incident-\s*ally/g, () => { count('incidentally'); return 'incidentally'; });
    t = t.replace(/strength-\s*ening/g, () => { count('strengthening'); return 'strengthening'; });
    t = t.replace(/thunder-\s*bolt/g, () => { count('thunderbolt'); return 'thunderbolt'; });
    t = t.replace(/sub-\s*ject/g, () => { count('subject'); return 'subject'; });

    // 16. ph 'sician → physician
    t = t.replace(/ph\s*'sician/g, () => { count('physician'); return 'physician'; });

    // 17. A'egetable → Vegetable (A' replacing V)
    t = t.replace(/A'egetab/g, () => { count('Vegetable'); return 'Vegetab'; });

    // 18. S5''niptoms → Symptoms
    t = t.replace(/S5''niptoms/g, () => { count('Symptoms'); return 'Symptoms'; });

    // 19. Pharmacv → Pharmacy
    t = t.replace(/Pharmacv/g, () => { count('Pharmacy'); return 'Pharmacy'; });

    // 20. AlkaHs → Alkalis
    t = t.replace(/AlkaHs/g, () => { count('Alkalis'); return 'Alkalis'; });

    // 21. Bliuta → Bhuta
    t = t.replace(/Bliuta/g, () => { count('Bhuta'); return 'Bhuta'; });

    // 22. Shah'am → Shalyam (OCR error)
    t = t.replace(/Shah'am/g, () => { count('Shalyam'); return 'Shalyam'; });

    // 23. cliassification → classification
    t = t.replace(/cliassification/g, () => { count('classification'); return 'classification'; });

    // 24. Double spaces + trim
    t = t.replace(/ {2,}/g, ' ');
    t = t.trim();

    if (t !== orig) v.text = t;
  }
}

fs.writeFileSync('sushruta-data.js', prefix + JSON.stringify(data, null, 2) + ';\n');
console.log('\n=== PASS 6 CLEANUP REPORT ===');
console.log('Total fixes:', fixes);
const sorted = Object.entries(fixCounts).sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) console.log('  ' + k + ': ' + v);

// Verify
let rem = {};
function r(k) { rem[k] = (rem[k] || 0) + 1; }
for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    if (/\bihe\b/.test(v.text)) r('ihe');
    if (/\btne\b/.test(v.text)) r('tne');
    if (/b\)/.test(v.text)) r('b)');
    if (/\d+\s+(?:THE\s+)?SUS.*SAM/i.test(v.text)) r('header');
    if (/ph3/.test(v.text)) r('ph3');
  }
}
console.log('\n=== REMAINING ===');
for (const [k, v] of Object.entries(rem)) console.log('  ' + k + ': ' + v);
