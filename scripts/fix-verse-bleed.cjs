#!/usr/bin/env node
/**
 * Исправляет «протечки» текста между стихами в data.js.
 * Стратегия: один проход = одно исправление. Повторяем до стабилизации.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data.js');

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

let totalFixes = 0;
let pass = 0;

while (true) {
  pass++;
  let src = fs.readFileSync(dataPath, 'utf8');
  let fixed = false;

  const chRe = /"number":(\d+),"title":"([^"]+)","subtitle":"([^"]+)","sthana":"([^"]+)"/g;
  const chapters = [];
  let m;
  while ((m = chRe.exec(src)) !== null) {
    chapters.push({ num: parseInt(m[1]), title: m[2], sthana: m[4], pos: m.index });
  }

  for (let ci = 0; ci < chapters.length && !fixed; ci++) {
    const ch = chapters[ci];
    const nextChPos = ci + 1 < chapters.length ? chapters[ci + 1].pos : src.length;
    const chunk = src.slice(ch.pos, nextChPos);

    const verseRe = /"type":"verse","number":"(\d+(?:-\d+)?)"/g;
    const verses = [];
    let vm;
    while ((vm = verseRe.exec(chunk)) !== null) {
      let vStart = vm.index;
      while (vStart > 0 && chunk[vStart] !== '{') vStart--;
      let depth = 0, vEnd = -1;
      for (let j = vStart; j < chunk.length; j++) {
        if (chunk[j] === '{') depth++;
        if (chunk[j] === '}') { depth--; if (depth === 0) { vEnd = j + 1; break; } }
      }
      verses.push({ number: vm[1], start: vStart, end: vEnd });
    }

    for (let vi = 0; vi < verses.length && !fixed; vi++) {
      const v = verses[vi];
      let obj;
      try { obj = JSON.parse(chunk.slice(v.start, v.end)); } catch(e) { continue; }
      const text = obj.text || '';
      if (!text || text.length < 30) continue;

      const parts = v.number.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      const nextVerse = vi + 1 < verses.length ? verses[vi + 1] : null;
      const nextNum = nextVerse ? parseInt(nextVerse.number.split('-')[0]) : lastNum + 1;

      const bleed = findBleed(text, lastNum, nextNum);
      if (!bleed) continue;

      const cleanText = text.slice(0, bleed.pos).trim();
      const bleedText = bleed.after;

      // Fix current verse
      obj.text = cleanText;
      const newCurrent = JSON.stringify(obj);

      const bleedNum = parseInt(bleed.marker.replace(/[^\d].*/,''));
      const isGapVerse = nextVerse && bleedNum < parseInt(nextVerse.number.split('-')[0]);

      if (nextVerse && !isGapVerse) {
        let nextObj;
        try { nextObj = JSON.parse(chunk.slice(nextVerse.start, nextVerse.end)); } catch(e) { continue; }
        if (bleedText) {
          nextObj.text = bleedText + (nextObj.text ? ' ' + nextObj.text : '');
        }
        const newNext = JSON.stringify(nextObj);

        const newChunk = chunk.slice(0, v.start) + newCurrent +
          chunk.slice(v.end, nextVerse.start) + newNext +
          chunk.slice(nextVerse.end);
        src = src.slice(0, ch.pos) + newChunk + src.slice(nextChPos);
      } else {
        // Create new verse object
        const newVerseNum = bleed.marker.replace(/[.\s]/g, '');
        const newVerseObj = { type: 'verse', number: newVerseNum, text: bleedText };
        const newChunk = chunk.slice(0, v.start) + newCurrent + ',' + JSON.stringify(newVerseObj) + chunk.slice(v.end);
        src = src.slice(0, ch.pos) + newChunk + src.slice(nextChPos);
      }

      fs.writeFileSync(dataPath, src);
      totalFixes++;
      fixed = true;
      const preview = bleedText.slice(0, 50);
      console.log(`  ${ch.sthana} гл.${ch.num} стих ${v.number}: "${bleed.marker}" → ${preview}...`);
    }
  }

  if (!fixed) break;
  if (pass > 100) { console.log('Too many passes, stopping'); break; }
}

console.log(`\nГотово: ${totalFixes} исправлений за ${pass} проходов`);
