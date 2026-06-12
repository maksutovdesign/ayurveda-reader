#!/usr/bin/env node
/**
 * Парсер английского перевода Сушрута-самхиты (Bhishagratna, 1907)
 * Том 1 — Сутрастхана, 46 глав
 *
 * Вход:  /tmp/sushruta_vol1.txt  (OCR с archive.org)
 * Выход: /tmp/sushruta_en_vol1.json — массив {chapter, text}
 *        text — чистый непрерывный текст главы (один string)
 */

const fs = require('fs');

const raw = fs.readFileSync('/tmp/sushruta_vol1.txt', 'utf8');
const lines = raw.split('\n');

// ── 1. Найти начало основного текста ──
let textStart = 0;
for (let i = 3840; i < lines.length; i++) {
  if (/^SUTRASTHANAM\b/.test(lines[i].trim())) {
    textStart = i;
    break;
  }
}

// ── 2. Паттерн заголовка главы ──
const chapterPattern = /^\s*C\s*H\s*A\s*P\s*[Ti]?\s*E\s*'?\s*R\s+([\s\w,.]+)\s*$/;

const romanToNum = s => {
  s = s.trim()
    .replace(/[,.;:']+$/g, '').replace(/[,.;:']+/g, '')
    .replace(/\bi\s*n\b/gi, 'III')
    .replace(/l/g, 'I').replace(/1/g, 'I')
    .replace(/n\b/g, 'II')
    .replace(/YII/g, 'VII').replace(/Vn/g, 'VII').replace(/Vni/g, 'VIII')
    .replace(/IIf/g, 'III')
    .replace(/X  V 1 1 1/g, 'XVIII')
    .replace(/XXX  I/g, 'XXXI').replace(/XXXII  I/g, 'XXXIII')
    .replace(/XL VI/g, 'XLVI')
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

// ── 3. Собираем позиции глав ──
const chapters = [];
for (let i = textStart; i < lines.length; i++) {
  const m = lines[i].match(chapterPattern);
  if (m) {
    const num = romanToNum(m[1]);
    if (num >= 1 && num <= 46) chapters.push({ num, lineStart: i });
  }
}
const seen = new Set();
const uniqueChapters = [];
for (const ch of chapters) {
  if (!seen.has(ch.num)) { seen.add(ch.num); uniqueChapters.push(ch); }
}
uniqueChapters.sort((a, b) => a.num - b.num);
console.log(`Found ${uniqueChapters.length} chapters`);

// ── 4. Агрессивная очистка OCR ──
const isJunk = line => {
  const s = line.trim();
  // Колонтитулы
  if (/^\s*Chap\s*\.\s+/i.test(s)) return true;
  if (/^\s*L"hap/i.test(s)) return true;
  if (/SUTRASTHANAM/i.test(s) && s.length < 60) return true;
  if (/THE\s+SUSHRUTA\s+SAMHITA/i.test(s)) return true;
  if (/^\s*\d+\s+THE\s+SUSHRUT/i.test(s)) return true;
  // Номера страниц
  if (/^\s*\d{1,3}\s*$/.test(s)) return true;
  // OCR-мусор (строка из нечитаемых символов)
  if (/^[\s\^.,:;*\-—_|\\\/\[\]{}()!?'"]+$/.test(s)) return true;
  // "Thus ends the Nth chapter..." — концовка
  if (/Thus\s+ends\s+the/i.test(s)) return true;
  // Строка слишком короткая и похожа на мусор
  if (s.length < 5 && !/^[A-Z]/.test(s)) return true;
  return false;
};

const cleanText = raw => {
  return raw
    // OCR: "sliould" → "should", "wliich" → "which", etc. (common OCR errors)
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
    .replace(/\bneither\b/g, 'neither')
    .replace(/\bwitli\b/g, 'with')
    // OCR: random special chars
    .replace(/\b(\w+)\^(\w+)\b/g, '$1$2')  // blissful^y → blissfully
    .replace(/\s*\^\s*/g, ' ')
    .replace(/\b(\w+)_,?\s/g, '$1, ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// ── 5. Извлечь чистый текст каждой главы ──
const result = [];

for (let idx = 0; idx < uniqueChapters.length; idx++) {
  const ch = uniqueChapters[idx];
  const nextLine = idx + 1 < uniqueChapters.length
    ? uniqueChapters[idx + 1].lineStart
    : lines.length;

  const goodLines = [];
  for (let i = ch.lineStart + 1; i < nextLine; i++) {
    if (!isJunk(lines[i]) && lines[i].trim()) {
      goodLines.push(lines[i].trim());
    }
  }

  // Склеиваем в непрерывный текст, соединяя переносы строк
  let text = '';
  for (const line of goodLines) {
    if (text && /[a-z,;:\-]$/.test(text)) {
      // Предыдущая строка кончается на букву/знак — склейка (перенос строки в OCR)
      text += ' ' + line;
    } else if (text) {
      text += '\n' + line;
    } else {
      text = line;
    }
  }

  text = cleanText(text);

  result.push({ chapter: ch.num, text });
  console.log(`  Ch ${ch.num}: ${text.length} chars`);
}

fs.writeFileSync('/tmp/sushruta_en_vol1.json', JSON.stringify(result, null, 2));
console.log(`\nSaved ${result.length} chapters`);
