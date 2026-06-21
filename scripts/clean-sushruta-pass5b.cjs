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

    // 1. Remaining page headers with different prefix patterns
    // "6 Till. SUSIIIiUTA SAMIIITA. [Chap."
    // "TUF. SUSIIRUTA SAMIIITA. [Chap. V,"
    // "684 'T'l ' SUSIIRUTA SAMHITA [Chiv."
    // "60 Tilli SUSIIRUTA SAMllITA. [ Chap."
    t = t.replace(/\d*\s*(?:Till\.|TUF\.|Tilli|'T'l\s*')\s*SUS[A-Z'il]+\s+SAM[A-Z'il]+\.?\s*(?:\[?\s*(?:Chap|Chiv|Chs?)[\s\].IVXLC\d]*\.?\]?\s*)?/gi, () => {
      count('page_header_v2');
      return ' ';
    });

    // 2. > as ) after apostrophe-quote patterns: 'word'> → 'word')
    t = t.replace(/'>\s/g, () => { count("'>→')"); return "') "; });
    t = t.replace(/'>\./g, () => { count("'>→')."); return "')."; });
    t = t.replace(/'>;/g, () => { count("'>→');"); return "');"; });

    // 3. > after various endings — replace with )
    t = t.replace(/ >\./g, () => { count('_>.→).'); return ').'; });
    t = t.replace(/ >,/g, () => { count('_>,→),'); return '),'; });
    t = t.replace(/ >, /g, () => { count('_>→)'); return '), '; });

    // 4. >- as y- pattern (bod>-, primar>-)
    t = t.replace(/([a-z])>-/g, (m, c) => { count('>-→y-'); return c + 'y'; });

    // 5. >T and >1 type patterns — just remove >
    t = t.replace(/>([A-Z0-9])/g, (m, c) => { count('>X'); return c; });

    // 6. Standalone > with spaces or at sentence boundaries
    t = t.replace(/ >\s/g, () => { count('> rm'); return ' '; });
    t = t.replace(/\.> /g, () => { count('.>'); return '. '; });

    // 7. .> at end patterns
    t = t.replace(/\.>$/g, () => { count('.>end'); return '.'; });
    t = t.replace(/\.\.>/g, () => { count('..>'); return '.'; });

    // 8. ch>le → chyle, quantit>' → quantity
    t = t.replace(/ch>le/g, () => { count('chyle'); return 'chyle'; });
    t = t.replace(/quantit>'/g, () => { count('quantity'); return 'quantity'; });
    t = t.replace(/t>-pe/g, () => { count('type'); return 'type'; });
    t = t.replace(/Va>-u/g, () => { count('Vayu'); return 'Vayu'; });
    t = t.replace(/disl\(>\."ations\)/g, () => { count('dislocations'); return 'dislocations'; });

    // 9. < standalone or with newline
    t = t.replace(/<\n/g, () => { count('<nl'); return ' '; });
    t = t.replace(/\n</g, () => { count('nl<'); return ' '; });

    // 10. < between word and space (often OCR for nothing or a letter)
    t = t.replace(/mil-</g, () => { count('milk'); return 'milk'; });
    t = t.replace(/stoni</g, () => { count('stomach'); return 'stomach'; });
    t = t.replace(/cli\('cstin</g, () => { count('digesting'); return 'digesting'; });
    t = t.replace(/deran< cd/g, () => { count('deranged'); return 'deranged'; });

    // 11. Remaining < > in garbled OCR references — just strip them
    // These are in heavily garbled passages that will be replaced during translation anyway
    t = t.replace(/<>/g, () => { count('<>'); return ''; });
    t = t.replace(/<?f%\d+'C/g, () => { count('garbled_ref'); return ''; });

    // 12. • used as OCR artifact (not bullet)
    t = t.replace(/ • /g, () => { count('bullet'); return ' '; });

    // 13. Fix multiple spaces
    t = t.replace(/ {2,}/g, ' ');
    t = t.trim();

    if (t !== orig) v.text = t;
  }
}

fs.writeFileSync('sushruta-data.js', prefix + JSON.stringify(data, null, 2) + ';\n');
console.log('\n=== PASS 5B CLEANUP REPORT ===');
console.log('Total fixes:', fixes);
const sorted = Object.entries(fixCounts).sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) console.log('  ' + k + ': ' + v);

// Verify
let rem = {};
function r(k) { rem[k] = (rem[k] || 0) + 1; }
for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    if (/SUSI/i.test(v.text)) r('SUSI');
    if (/>/.test(v.text)) r('>');
    if (/</.test(v.text)) r('<');
    if (/•/.test(v.text)) r('bullet');
  }
}
console.log('\n=== REMAINING ===');
for (const [k, v] of Object.entries(rem)) console.log('  ' + k + ': ' + v);
