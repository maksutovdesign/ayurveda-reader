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

    // 1. Remove embedded page headers: "NUMBER THE SUSI...SAMHITA... [Chap. ..."
    // Patterns: "10 THE SUSWRUTA SAMHITA. [Chap. I."
    //           "TIIK SUSIFRUTA SAMIIITA. tChap. I."
    //           "2 tliK SUSIIKUTA SAMUITA, t< ''ai'- 1-"
    //           "136 THE SUSIIRUTA SAMIIITA."
    //           "524 Tllli SUSIIRUTA SAMIIITA. [Chap. XXVIII."
    t = t.replace(/\d*\s*(?:THE|TH[EIK]+|T[HIil]+K|tliK|Tllli)\s+SUS[A-Z'i]+\s+SAM[A-Z'i]+\.?\s*(?:\[?\s*(?:Chap|Chs?|Chaii?|Clis)[\s\].IVXLC\d]*\.?\]?\s*)?/gi, () => {
      count('page_header');
      return ' ';
    });

    // 2. Remove "tChap. I." standalone remnants
    t = t.replace(/\btChap\.\s*[IVXLC\d.]+/g, () => { count('tChap'); return ''; });

    // 3. Remove standalone footnote markers like "t " at start of sentence or "t<"
    t = t.replace(/\bt< /g, () => { count('t<'); return ''; });
    t = t.replace(/\bt> /g, () => { count('t>'); return ''; });

    // 4. Clean ''ai'- 1- type garbage
    t = t.replace(/''ai'-\s*\d+-/g, () => { count('ai_garbage'); return ''; });

    // 5. > used as ) at end of words/phrases
    t = t.replace(/(\w)>\./g, (m, w) => { count('>→).'); return w + ').'; });
    t = t.replace(/(\w)>,/g, (m, w) => { count('>→),'); return w + '),'; });
    t = t.replace(/(\w)>\s/g, (m, w) => { count('>→) '); return w + ') '; });
    t = t.replace(/(\w)>$/g, (m, w) => { count('>→)end'); return w + ')'; });
    // Standalone > between spaces
    t = t.replace(/ > /g, () => { count('> standalone'); return ' '; });
    // > as y in common patterns
    t = t.replace(/primar>-/g, () => { count('>→y'); return 'primary'; });
    t = t.replace(/bod>'/g, () => { count('>→y'); return 'body'; });
    t = t.replace(/([a-z])>'([a-z])/g, (m, a, b) => { count('>→y'); return a + 'y ' + b; });

    // 6. < used as ( in text
    t = t.replace(/<"/g, () => { count('<→('); return '("'; });
    t = t.replace(/<'/g, () => { count('<→('); return "('"; });
    t = t.replace(/ <([a-z])/gi, (m, c) => { count('< letter'); return ' ' + c; });
    // <jn → on, <ind → and, <3 → e, etc. — too variable, just remove < between letters
    t = t.replace(/([a-z])<([a-z0-9])/gi, (m, a, b) => { count('a<b'); return a + b; });
    // Standalone <
    t = t.replace(/ < /g, () => { count('< standalone'); return ' '; });

    // 7. IVIcmorabIC → Memorabic (IVI→M, IC→ic at end not caught by previous pass)
    t = t.replace(/IVIcmorabIC/g, () => { count('IVIcmorabIC'); return 'Metrical'; });
    t = t.replace(/IVIemorable/g, () => { count('IVIemorable'); return 'Memorable'; });
    t = t.replace(/\bIVI/g, () => { count('IVI→M'); return 'M'; });

    // 8. Remove remaining { used as (
    t = t.replace(/\{/g, () => { count('{→('); return '('; });
    t = t.replace(/\}/g, () => { count('}→)'); return ')'; });

    // 9. Fix remaining word- word (hyphen space) missed by earlier passes
    t = t.replace(/([a-zA-Z])- ([a-zA-Z])/g, (m, a, b) => { count('hyphen_space'); return a + '-' + b; });

    // 10. Fix ,-]- type garbage
    t = t.replace(/,-\]-/g, () => { count(',-]-'); return ','; });

    // 11. Fix etc..) → etc.)
    t = t.replace(/etc\.\.\)/g, () => { count('etc..)'); return 'etc.)'; });

    // 12. Remove * used as footnote markers (standalone between spaces)
    t = t.replace(/ \* /g, () => { count('* footnote'); return ' '; });

    // 13. Remove stray : — at sentence boundaries (OCR for em-dash in references)
    // Like "Yatvaiprakshya : — The" → "Yatvaiprakshya — The"
    t = t.replace(/ : — /g, () => { count(': —'); return ' — '; });

    // 14. Clean up rc:jion → region type garbage
    t = t.replace(/rc:jion/g, () => { count('rc:jion'); return 'region'; });

    // 15. Clean li>. → ly.
    t = t.replace(/li>\./g, () => { count('li>.'); return 'ly.'; });

    // 16. Fix double/triple spaces
    t = t.replace(/ {2,}/g, ' ');
    t = t.trim();

    if (t !== orig) {
      v.text = t;
    }
  }
}

fs.writeFileSync('sushruta-data.js', prefix + JSON.stringify(data, null, 2) + ';\n');
console.log('\n=== PASS 5 CLEANUP REPORT ===');
console.log('Total fixes:', fixes);
const sorted = Object.entries(fixCounts).sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) console.log('  ' + k + ': ' + v);

// Verify remaining issues
let remaining = {};
function rem(k) { remaining[k] = (remaining[k] || 0) + 1; }
for (const ch of data) {
  for (const v of ch.content) {
    if (v.type !== 'verse' || !v.text) continue;
    if (/SUSI/i.test(v.text)) rem('SUSI header');
    if (/</.test(v.text)) rem('<');
    if (/>/.test(v.text)) rem('>');
    if (/\{/.test(v.text)) rem('{');
    if (/\}/.test(v.text)) rem('}');
    if (/IVI/.test(v.text)) rem('IVI');
    if (/\w- \w/.test(v.text)) rem('word- word');
  }
}
console.log('\n=== REMAINING ===');
const rsorted = Object.entries(remaining).sort((a, b) => b[1] - a[1]);
for (const [k, v] of rsorted) console.log('  ' + k + ': ' + v);
