#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'sushruta-data.js');

function findBleed(text, lastNum, nextNum) {
  const patterns = [];
  for (let n = lastNum + 1; n <= nextNum + 2; n++) {
    for (let m2 = n; m2 <= n + 10; m2++) {
      if (m2 > n) {
        for (const sep of ['-', '–']) {
          patterns.push(n + sep + m2 + '.');
          for (const l of ['a', 'b']) {
            patterns.push(n + sep + m2 + l + '.');
            patterns.push(n + l + sep + m2 + '.');
          }
        }
      }
    }
    patterns.push(n + '.');
    patterns.push(n + 'a.');
    patterns.push(n + 'b.');
  }
  for (const p of patterns) {
    const pos = text.indexOf(p);
    if (pos > 20) {
      const charBefore = text[pos - 1];
      if (charBefore === ' ' || charBefore === '\n' || charBefore === '.') {
        const afterMarker = text.slice(pos + p.length).trimStart();
        return { pos, marker: p, after: afterMarker };
      }
    }
  }
  return null;
}

let src = fs.readFileSync(dataPath, 'utf8');
const eq = src.indexOf('= [');
const prefix = src.slice(0, eq + 2);
let arr = JSON.parse(src.slice(eq + 2).replace(/;\s*$/, ''));

let totalFixes = 0;

for (const ch of arr) {
  const verses = ch.content.filter(b => b.type === 'verse' && b.english);
  for (let vi = 0; vi < verses.length; vi++) {
    const v = verses[vi];
    const text = v.english;
    if (!text || text.length < 30) continue;

    const parts = v.number.split('-');
    const lastNum = parseInt(parts[parts.length - 1]);
    const nextVerse = vi + 1 < verses.length ? verses[vi + 1] : null;
    const nextNum = nextVerse ? parseInt(nextVerse.number.split('-')[0]) : lastNum + 1;

    const bleed = findBleed(text, lastNum, nextNum);
    if (!bleed) continue;

    const cleanText = text.slice(0, bleed.pos).trim();
    const bleedText = bleed.after;

    v.english = cleanText;

    const bleedNum = parseInt(bleed.marker.replace(/[^\d].*/, ''));
    const isGapVerse = nextVerse && bleedNum < parseInt(nextVerse.number.split('-')[0]);

    if (nextVerse && !isGapVerse) {
      if (bleedText) {
        nextVerse.english = bleedText + (nextVerse.english ? ' ' + nextVerse.english : '');
      }
    } else {
      // Create new verse in content array
      const idx = ch.content.indexOf(v);
      const newVerse = { type: 'verse', number: bleed.marker.replace(/[.\s]/g, ''), sanskrit: '', text: '', english: bleedText };
      ch.content.splice(idx + 1, 0, newVerse);
      // Re-scan verses array
      const newVerses = ch.content.filter(b => b.type === 'verse' && b.english);
      verses.splice(0, verses.length, ...newVerses);
    }

    totalFixes++;
    console.log(`  ${ch.sthana} гл.${ch.number} стих ${v.number}: "${bleed.marker}" → ${bleedText.slice(0, 50)}...`);
  }
}

// Multi-pass: repeat until stable
let moreFixes = true;
let pass = 1;
while (moreFixes && pass < 50) {
  pass++;
  moreFixes = false;
  for (const ch of arr) {
    const verses = ch.content.filter(b => b.type === 'verse' && b.english);
    for (let vi = 0; vi < verses.length; vi++) {
      const v = verses[vi];
      const text = v.english;
      if (!text || text.length < 30) continue;
      const parts = v.number.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      const nextVerse = vi + 1 < verses.length ? verses[vi + 1] : null;
      const nextNum = nextVerse ? parseInt(nextVerse.number.split('-')[0]) : lastNum + 1;
      const bleed = findBleed(text, lastNum, nextNum);
      if (!bleed) continue;
      v.english = text.slice(0, bleed.pos).trim();
      const bleedText = bleed.after;
      const bleedNum = parseInt(bleed.marker.replace(/[^\d].*/, ''));
      const isGapVerse = nextVerse && bleedNum < parseInt(nextVerse.number.split('-')[0]);
      if (nextVerse && !isGapVerse) {
        if (bleedText) nextVerse.english = bleedText + (nextVerse.english ? ' ' + nextVerse.english : '');
      } else {
        const idx = ch.content.indexOf(v);
        ch.content.splice(idx + 1, 0, { type: 'verse', number: bleed.marker.replace(/[.\s]/g, ''), sanskrit: '', text: '', english: bleedText });
      }
      totalFixes++;
      moreFixes = true;
      console.log(`  [pass ${pass}] ${ch.sthana} гл.${ch.number} стих ${v.number}: "${bleed.marker}"`);
    }
  }
}

const newJson = JSON.stringify(arr);
fs.writeFileSync(dataPath, prefix + newJson + ';');
try { JSON.parse(newJson); console.log(`\nГотово: ${totalFixes} исправлений за ${pass} проходов. JSON валиден.`); }
catch(e) { console.log(`\n⚠ JSON НЕВАЛИДЕН: ${e.message}`); }
