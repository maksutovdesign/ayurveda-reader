#!/usr/bin/env node
/**
 * Извлекает пропущенные главы из OCR-текста Сушрута-самхиты.
 * Главы были пропущены из-за искажённых заголовков в OCR.
 * Выход: /tmp/sushruta_en_missing.json
 */

const fs = require('fs');

const vol2 = fs.readFileSync('/tmp/sushruta_vol2.txt', 'utf8').split('\n');
const vol3 = fs.readFileSync('/tmp/sushruta_vol3.txt', 'utf8').split('\n');

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

function extractRange(lines, startLine, endLine) {
  const goodLines = [];
  for (let i = startLine; i < endLine; i++) {
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
  return cleanText(text);
}

// Known missing chapters with exact line ranges from OCR scan
// Format: { sthana, chapter, vol, startLine, endLine }
const missing = [
  // Нидана стхана (vol2) — missing 1, 2, 8
  { sthana: 'Нидана стхана', chapter: 1, lines: vol2, start: 2213, end: 2875 },    // rMAPTER I. → "Thus ends the first"
  { sthana: 'Нидана стхана', chapter: 2, lines: vol2, start: 2918, end: 3163 },    // line 2918 area → "Thus ends the second" at 3163
  { sthana: 'Нидана стхана', chapter: 8, lines: vol2, start: 4372, end: 4614 },    // CHAPTER Vm. → "Thus ends the eighth"

  // Чикитса стхана (vol2) — missing 1, 11, 12, 21, 24, 28, 33, 34, 37, 38, 39, 40
  { sthana: 'Чикитса стхана', chapter: 1, lines: vol2, start: 11852, end: 12903 },   // CHAPTER I. → "Thus ends the first"
  { sthana: 'Чикитса стхана', chapter: 11, lines: vol2, start: 17252, end: 17520 },  // CHAPTER XL (=XI) → "Thus ends the eleventh"
  { sthana: 'Чикитса стхана', chapter: 12, lines: vol2, start: 17528, end: 17791 },  // CHAPTER XIL (=XII)
  { sthana: 'Чикитса стхана', chapter: 21, lines: vol2, start: 20792, end: 20915 },  // CHAPTER XXL (=XXI)
  { sthana: 'Чикитса стхана', chapter: 24, lines: vol2, start: 21657, end: 22592 },  // CHAPTER XXTV (=XXIV)
  { sthana: 'Чикитса стхана', chapter: 28, lines: vol2, start: 23327, end: 23642 },  // CHAPTER XXYIIL (=XXVIII)
  { sthana: 'Чикитса стхана', chapter: 33, lines: vol2, start: 25054, end: 25552 },  // CHAPTER XXXIIT (=XXXIII)
  { sthana: 'Чикитса стхана', chapter: 34, lines: vol2, start: 25552, end: 26071 },  // CHAPTER XXXIY (=XXXIV)
  { sthana: 'Чикитса стхана', chapter: 37, lines: vol2, start: 26762, end: 27521 },  // CHAPTER XXXVIT (=XXXVII)
  { sthana: 'Чикитса стхана', chapter: 38, lines: vol2, start: 27525, end: 28339 },  // No header — text between ch37 end and ch39
  { sthana: 'Чикитса стхана', chapter: 39, lines: vol2, start: 28343, end: 28590 },  // CHAPTER XXXIX.
  { sthana: 'Чикитса стхана', chapter: 40, lines: vol2, start: 28590, end: 29387 },  // CHAPTER XL (=XL, last chikitsa)

  // Уттара тантра (vol3) — missing 7, 11, 13, 22, 23, 26, 34, 37, 39, 40, 48, 53, 54, 57, 64, 65, 66
  { sthana: 'Уттара тантра', chapter: 7, lines: vol3, start: 1765, end: 2040 },     // CHAPTER VIL (=VII)
  { sthana: 'Уттара тантра', chapter: 11, lines: vol3, start: 2402, end: 2554 },    // CHAPTER XL (=XI)
  { sthana: 'Уттара тантра', chapter: 13, lines: vol3, start: 2911, end: 3011 },    // CHAPTER Xltr. (=XIII)
  { sthana: 'Уттара тантра', chapter: 22, lines: vol3, start: 5474, end: 5599 },    // CHAPTER XXIL (=XXII)
  { sthana: 'Уттара тантра', chapter: 23, lines: vol3, start: 5599, end: 5703 },    // CHAPTER XXIIL (=XXIII)
  { sthana: 'Уттара тантра', chapter: 26, lines: vol3, start: 6113, end: 6380 },    // CHAPEE XXVI. (=XXVI)
  { sthana: 'Уттара тантра', chapter: 34, lines: vol3, start: 6887, end: 6926 },    // CHAPTER XXXLV. (=XXXIV)
  { sthana: 'Уттара тантра', chapter: 37, lines: vol3, start: 7015, end: 7130 },    // CHAPTER XXXVIL (=XXXVII)
  { sthana: 'Уттара тантра', chapter: 39, lines: vol3, start: 7331, end: 9123 },    // CHAPTER XXXIX (big chapter)
  { sthana: 'Уттара тантра', chapter: 40, lines: vol3, start: 9127, end: 10144 },   // CHAPTER XL
  { sthana: 'Уттара тантра', chapter: 48, lines: vol3, start: 12758, end: 13020 },  // CHAPTER XLVII'L (=XLVIII)
  { sthana: 'Уттара тантра', chapter: 53, lines: vol3, start: 14083, end: 14211 },  // CHAPTER LIII
  { sthana: 'Уттара тантра', chapter: 54, lines: vol3, start: 14211, end: 14452 },  // CHAPTER LIV
  { sthana: 'Уттара тантра', chapter: 57, lines: vol3, start: 14992, end: 15158 },  // CHAPTER LVIL (=LVII)
  { sthana: 'Уттара тантра', chapter: 64, lines: vol3, start: 16553, end: 16962 },  // CHAPTER LXIV
  { sthana: 'Уттара тантра', chapter: 65, lines: vol3, start: 16962, end: 17299 },  // CHAPTER LXV
  { sthana: 'Уттара тантра', chapter: 66, lines: vol3, start: 17299, end: 17399 }, // CHAPTER LXVI (last)
];

const results = [];
for (const m of missing) {
  const text = extractRange(m.lines, m.start + 1, m.end);
  results.push({ sthana: m.sthana, chapter: m.chapter, text });
  console.log(`  ${m.sthana} ${m.chapter}: ${text.length} chars`);
}

// Filter out empty or suspiciously large
const clean = results.filter(r => r.text.length > 50 && r.text.length < 100000);
console.log(`\nExtracted ${clean.length}/${results.length} chapters (filtered empty/huge)`);

fs.writeFileSync('/tmp/sushruta_en_missing.json', JSON.stringify(clean, null, 2));
console.log('Saved to /tmp/sushruta_en_missing.json');
