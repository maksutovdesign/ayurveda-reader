#!/usr/bin/env node
/**
 * Распределяет английский перевод Бхишагратны по стихам в sushruta-data.js.
 * Источники:
 *   /tmp/sushruta_en_vol1.json — Сутрастхана (46 глав)
 *   /tmp/sushruta_en_all_clean.json — остальные стханы
 * Работает через текстовый поиск/замену — НЕ парсит весь JSON.
 */

const fs = require('fs');
const path = require('path');

// Загружаем все переводы
const vol1 = JSON.parse(fs.readFileSync('/tmp/sushruta_en_vol1.json', 'utf8'));
const rest = JSON.parse(fs.readFileSync('/tmp/sushruta_en_all_clean.json', 'utf8'));

// Объединяем: vol1 → sthana=Сутрастхана
const allChapters = [
  ...vol1.map(c => ({ sthana: 'Сутрастхана', chapter: c.chapter, text: c.text })),
  ...rest
];

// Ключ для поиска: sthana + chapter
const enMap = new Map(allChapters.map(c => [`${c.sthana}:${c.chapter}`, c.text]));

const dataPath = path.join(__dirname, '..', 'sushruta-data.js');
let src = fs.readFileSync(dataPath, 'utf8');

src = src.replace(/^\/\*\*.*?\*\/\n/, '/** SUSHRUTA_DATA — санскрит+IAST (SARIT) + англ. Бхишагратны по стихам (OCR archive.org) */\n');

function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 0);
}

const MAX_EN_CHARS = 600;

function truncateToSentence(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastDot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.)'));
  if (lastDot > maxLen * 0.3) return cut.slice(0, lastDot + 1) + ' …';
  return cut.trim() + ' …';
}

function distribute(sentences, n) {
  if (n <= 0) return [];
  if (n === 1) return [truncateToSentence(sentences.join(' '), MAX_EN_CHARS)];
  if (sentences.length <= n) {
    const r = [];
    for (let i = 0; i < n; i++) r.push(truncateToSentence(sentences[i] || '', MAX_EN_CHARS));
    return r;
  }
  const totalLen = sentences.reduce((s, p) => s + p.length, 0);
  const targetLen = totalLen / n;
  const result = [];
  let current = [], currentLen = 0, bucket = 0;
  for (const sent of sentences) {
    current.push(sent);
    currentLen += sent.length;
    if (currentLen >= targetLen * (bucket + 1) && bucket < n - 1) {
      result.push(truncateToSentence(current.join(' '), MAX_EN_CHARS));
      current = [];
      bucket++;
    }
  }
  if (current.length) result.push(truncateToSentence(current.join(' '), MAX_EN_CHARS));
  while (result.length < n) result.push('');
  return result;
}

// Глобальная очистка: удаляем ВСЕ существующие ,"english":"..." поля (строковый парсер)
{
  const marker = ',"english":"';
  let pos = 0;
  let stripped = 0;
  while (true) {
    const idx = src.indexOf(marker, pos);
    if (idx === -1) break;
    let j = idx + marker.length, esc = false;
    while (j < src.length) {
      if (esc) { esc = false; j++; continue; }
      if (src[j] === '\\') { esc = true; j++; continue; }
      if (src[j] === '"') { j++; break; }
      j++;
    }
    src = src.slice(0, idx) + src.slice(j);
    stripped++;
    pos = idx;
  }
  if (stripped) console.log(`Pre-cleaned ${stripped} existing english fields`);
}

// Также удаляем chapter-level english массивы и englishOcr глобально
src = src.replace(/,"englishOcr":true/g, '');
{
  const arrMarker = ',"english":["';
  let idx = src.indexOf(arrMarker);
  let arrCleaned = 0;
  while (idx !== -1) {
    let depth = 0, end = -1, inStr = false, esc = false;
    for (let j = idx + 12; j < src.length; j++) {
      const c = src[j];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '[') depth++;
      if (c === ']') {
        if (depth === 0) { end = j + 1; break; }
        depth--;
      }
    }
    if (end === -1) break;
    src = src.slice(0, idx) + src.slice(end);
    arrCleaned++;
    idx = src.indexOf(arrMarker, idx);
  }
  if (arrCleaned) console.log(`Pre-cleaned ${arrCleaned} english arrays`);
}

// Собираем все позиции глав
const chapterRegex = /"sthana":"([^"]+)","number":(\d+),/g;
const chapterPositions = [];
let m;
while ((m = chapterRegex.exec(src)) !== null) {
  chapterPositions.push({ sthana: m[1], number: parseInt(m[2]), pos: m.index });
}

let totalVerses = 0;
let totalChapters = 0;

// Обрабатываем с конца
for (let ci = chapterPositions.length - 1; ci >= 0; ci--) {
  const { sthana, number, pos } = chapterPositions[ci];
  const key = `${sthana}:${number}`;
  const enText = enMap.get(key);

  // Границы главы
  const nextPos = ci + 1 < chapterPositions.length ? chapterPositions[ci + 1].pos : src.length;
  let chunk = src.slice(pos, nextPos);

  // Вставляем per-verse english (очистка уже выполнена глобально)
  if (enText) {
    const verseRegex = /"type":"verse","number":"(\d+)"/g;
    const versePositions = [];
    let vm;
    while ((vm = verseRegex.exec(chunk)) !== null) {
      versePositions.push({ index: vm.index, num: vm[1] });
    }

    if (versePositions.length) {
      const sentences = splitSentences(enText);
      const portions = distribute(sentences, versePositions.length);

      for (let i = versePositions.length - 1; i >= 0; i--) {
        const vp = versePositions[i];
        const enPortion = portions[i] || '';
        if (!enPortion) continue;

        let objStart = vp.index;
        while (objStart > 0 && chunk[objStart] !== '{') objStart--;
        let depth = 0, vEnd = -1;
        for (let j = objStart; j < chunk.length; j++) {
          if (chunk[j] === '{') depth++;
          if (chunk[j] === '}') { depth--; if (depth === 0) { vEnd = j; break; } }
        }
        if (vEnd === -1) continue;


        const escaped = JSON.stringify(enPortion);
        chunk = chunk.slice(0, vEnd) + `,"english":${escaped}` + chunk.slice(vEnd);
        totalVerses++;
      }
      totalChapters++;
      console.log(`  ${sthana} ${number}: ${versePositions.length} verses`);
    }
  }

  src = src.slice(0, pos) + chunk + src.slice(nextPos);
}

// Финальная очистка уже выполнена глобально в начале

fs.writeFileSync(dataPath, src);
console.log(`\nDone: ${totalChapters} chapters, ${totalVerses} verses with english (${(src.length / 1024 / 1024).toFixed(1)} MB)`);
