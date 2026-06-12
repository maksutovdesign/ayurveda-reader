#!/usr/bin/env node
/**
 * Парсер английского перевода Сушрута-самхиты (Bhishagratna, 1907–1916)
 * Том 1 — Сутрастхана (уже готов в /tmp/sushruta_en_vol1.json)
 * Том 2 — Нидана, Шарира, Чикитса, Калпа
 * Том 3 — Уттара тантра
 *
 * Выход: /tmp/sushruta_en_all.json — массив {sthana, chapter, text}
 */

const fs = require('fs');

// ── Helpers ──

const romanToNum = s => {
  s = s.trim()
    .replace(/[,.;:']+$/g, '').replace(/[,.;:']+/g, '')
    .replace(/\bi\s*n\b/gi, 'III')
    .replace(/l/g, 'I').replace(/1/g, 'I')
    .replace(/n\b/g, 'II')
    .replace(/YII/g, 'VII').replace(/Vn/g, 'VII').replace(/Vni/g, 'VIII')
    .replace(/IIf/g, 'III')
    .replace(/Xn/g, 'XII').replace(/Xin/g, 'XIII').replace(/XIu/g, 'XIV')
    .replace(/XLn/g, 'XLII')
    .replace(/\s+/g, '').toUpperCase();
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], next = map[s[i + 1]];
    if (!cur) return NaN;
    if (next && cur < next) { result += next - cur; i++; }
    else result += cur;
  }
  return result;
};

const isJunk = line => {
  const s = line.trim();
  if (/^\s*Chap\s*[.,]\s*/i.test(s) && s.length < 80) return true;
  if (/^\s*L"hap/i.test(s)) return true;
  if (/STHANAM|STHAN\b|TANTARAM/i.test(s) && s.length < 80) return true;
  if (/THE\s+SUSHRUTA\s+SAMHITA/i.test(s)) return true;
  if (/^\s*\d{1,3}\s*$/.test(s)) return true;
  if (/^[\s\^.,:;*\-—_|\\\/\[\]{}()!?'"]+$/.test(s)) return true;
  if (/Thus\s+ends\s+the/i.test(s)) return true;
  if (s.length < 5 && !/^[A-Z]/.test(s)) return true;
  return false;
};

const cleanText = raw => {
  return raw
    .replace(/\bsliould\b/g, 'should')
    .replace(/\bwliich\b/g, 'which')
    .replace(/\btlie\b/g, 'the')
    .replace(/\bliave\b/g, 'have')
    .replace(/\blias\b/g, 'has')
    .replace(/\bliis\b/g, 'his')
    .replace(/\bwlien\b/g, 'when')
    .replace(/\bwliile\b/g, 'while')
    .replace(/\bwliole\b/g, 'whole')
    .replace(/\btliem\b/g, 'them')
    .replace(/\btliere\b/g, 'there')
    .replace(/\btlieir\b/g, 'their')
    .replace(/\btliese\b/g, 'these')
    .replace(/\btliey\b/g, 'they')
    .replace(/\btliis\b/g, 'this')
    .replace(/\btlius\b/g, 'thus')
    .replace(/\bwliicli\b/g, 'which')
    .replace(/\btliat\b/g, 'that')
    .replace(/\bfurtlier\b/g, 'further')
    .replace(/\botlier\b/g, 'other')
    .replace(/\beitlier\b/g, 'either')
    .replace(/\bwitli\b/g, 'with')
    .replace(/\b(\w+)\^(\w+)\b/g, '$1$2')
    .replace(/\s*\^\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

function extractChapters(lines, startLine, endLine, maxChapters) {
  // Паттерн заголовка: CHAPTER I., CHAPTER II., CHAPTPR I., etc.
  const chapterPattern = /^\s*CHAPT[A-Z]*R?\s+([\w,.IVXLC\s]+)/i;

  const chapters = [];
  for (let i = startLine; i < endLine; i++) {
    const m = lines[i].match(chapterPattern);
    if (m) {
      const num = romanToNum(m[1]);
      if (num >= 1 && num <= maxChapters) {
        chapters.push({ num, lineStart: i });
      }
    }
  }

  // Дедупликация — берём первое вхождение каждого номера
  const seen = new Set();
  const unique = [];
  for (const ch of chapters) {
    if (!seen.has(ch.num)) { seen.add(ch.num); unique.push(ch); }
  }
  unique.sort((a, b) => a.num - b.num);
  return unique;
}

function extractText(lines, chapters, endLine) {
  const result = [];
  for (let idx = 0; idx < chapters.length; idx++) {
    const ch = chapters[idx];
    const nextLine = idx + 1 < chapters.length ? chapters[idx + 1].lineStart : endLine;

    const goodLines = [];
    for (let i = ch.lineStart + 1; i < nextLine; i++) {
      if (!isJunk(lines[i]) && lines[i].trim()) {
        goodLines.push(lines[i].trim());
      }
    }

    let text = '';
    for (const line of goodLines) {
      if (text && /[a-z,;:\-]$/.test(text)) {
        text += ' ' + line;
      } else if (text) {
        text += '\n' + line;
      } else {
        text = line;
      }
    }

    text = cleanText(text);
    result.push({ chapter: ch.num, text });
  }
  return result;
}

// ── Том 2 ──

const vol2 = fs.readFileSync('/tmp/sushruta_vol2.txt', 'utf8').split('\n');
console.log('Vol 2:', vol2.length, 'lines');

// Находим границы стхан по маркерам
function findSthanaStart(lines, pattern, afterLine = 0) {
  for (let i = afterLine; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i;
  }
  return -1;
}

const nidanaStart = findSthanaStart(vol2, /^NIDANA\s+STHANAM/, 2000);
const shariraStart = findSthanaStart(vol2, /^S.ARIRA\s+STHANAM/, nidanaStart + 100);
const chikitsaStart = findSthanaStart(vol2, /CHIKITSA\s+STHANAM/, shariraStart + 100);
const kalpaStart = findSthanaStart(vol2, /^KALPA.STHANAM/, chikitsaStart + 100);

console.log('Nidana:', nidanaStart, 'Sharira:', shariraStart, 'Chikitsa:', chikitsaStart, 'Kalpa:', kalpaStart);

const nidanaCh = extractChapters(vol2, nidanaStart, shariraStart, 16);
const shaririaCh = extractChapters(vol2, shariraStart, chikitsaStart > 0 ? chikitsaStart : vol2.length, 10);
const chikitsaCh = extractChapters(vol2, chikitsaStart > 0 ? chikitsaStart : shariraStart + 100, kalpaStart > 0 ? kalpaStart : vol2.length, 40);
const kalpaCh = extractChapters(vol2, kalpaStart > 0 ? kalpaStart : vol2.length - 1, vol2.length, 8);

console.log(`Nidana: ${nidanaCh.length}/16, Sharira: ${shaririaCh.length}/10, Chikitsa: ${chikitsaCh.length}/40, Kalpa: ${kalpaCh.length}/8`);

const nidanaTexts = extractText(vol2, nidanaCh, shariraStart);
const shariraTexts = extractText(vol2, shaririaCh, chikitsaStart > 0 ? chikitsaStart : vol2.length);
const chikitsaTexts = extractText(vol2, chikitsaCh, kalpaStart > 0 ? kalpaStart : vol2.length);
const kalpaTexts = extractText(vol2, kalpaCh, vol2.length);

// ── Том 3 — Уттара тантра ──

const vol3 = fs.readFileSync('/tmp/sushruta_vol3.txt', 'utf8').split('\n');
console.log('\nVol 3:', vol3.length, 'lines');

const uttaraStart = findSthanaStart(vol3, /^UTTARA.TANTARAM/, 800);
console.log('Uttara start:', uttaraStart);

const uttaraCh = extractChapters(vol3, uttaraStart > 0 ? uttaraStart : 0, vol3.length, 66);
console.log(`Uttara: ${uttaraCh.length}/66`);

const uttaraTexts = extractText(vol3, uttaraCh, vol3.length);

// ── Объединяем ──

const allResults = [];

for (const t of nidanaTexts) {
  allResults.push({ sthana: 'Нидана стхана', chapter: t.chapter, text: t.text });
  console.log(`  Nidana ${t.chapter}: ${t.text.length} chars`);
}
for (const t of shariraTexts) {
  allResults.push({ sthana: 'Шарира стхана', chapter: t.chapter, text: t.text });
  console.log(`  Sharira ${t.chapter}: ${t.text.length} chars`);
}
for (const t of chikitsaTexts) {
  allResults.push({ sthana: 'Чикитса стхана', chapter: t.chapter, text: t.text });
  console.log(`  Chikitsa ${t.chapter}: ${t.text.length} chars`);
}
for (const t of kalpaTexts) {
  allResults.push({ sthana: 'Калпастхана', chapter: t.chapter, text: t.text });
  console.log(`  Kalpa ${t.chapter}: ${t.text.length} chars`);
}
for (const t of uttaraTexts) {
  allResults.push({ sthana: 'Уттара тантра', chapter: t.chapter, text: t.text });
  console.log(`  Uttara ${t.chapter}: ${t.text.length} chars`);
}

fs.writeFileSync('/tmp/sushruta_en_all.json', JSON.stringify(allResults, null, 2));
console.log(`\nSaved ${allResults.length} chapters to /tmp/sushruta_en_all.json`);
