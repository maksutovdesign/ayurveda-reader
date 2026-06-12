#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const enData = JSON.parse(fs.readFileSync('/tmp/sushruta_en_vol1.json', 'utf8'));
const enMap = new Map(enData.map(c => [c.chapter, c.text]));

const dataPath = path.join(__dirname, '..', 'sushruta-data.js');
let src = fs.readFileSync(dataPath, 'utf8');

src = src.replace(/^\/\*\*.*?\*\/\n/, '/** SUSHRUTA_DATA — санскрит+IAST (SARIT) + англ. Бхишагратны по стихам (Сутрастхана 1–46, OCR archive.org) */\n');

function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 0);
}

function distribute(sentences, n) {
  if (n <= 0) return [];
  if (n === 1) return [sentences.join(' ')];
  if (sentences.length <= n) {
    const r = [];
    for (let i = 0; i < n; i++) r.push(sentences[i] || '');
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
      result.push(current.join(' '));
      current = [];
      bucket++;
    }
  }
  if (current.length) result.push(current.join(' '));
  while (result.length < n) result.push('');
  return result;
}

let totalVerses = 0;

// Обрабатываем каждую главу с конца, чтобы не сбивать индексы
const chapterPositions = [];
for (let chNum = 1; chNum <= 46; chNum++) {
  const chMarker = `"sthana":"Сутрастхана","number":${chNum},`;
  const chPos = src.indexOf(chMarker);
  if (chPos === -1) { console.log(`  Ch ${chNum}: NOT FOUND`); continue; }
  chapterPositions.push({ chNum, chPos });
}

// Обрабатываем с конца
for (let ci = chapterPositions.length - 1; ci >= 0; ci--) {
  const { chNum, chPos } = chapterPositions[ci];
  const enText = enMap.get(chNum);

  // Определяем границы главы
  let nextChPos;
  if (ci + 1 < chapterPositions.length) {
    nextChPos = chapterPositions[ci + 1].chPos;
  } else {
    // Последняя глава Сутрастханы — конец = начало следующей стханы
    const nextSthana = src.indexOf('{"sthana":', chPos + 10);
    nextChPos = nextSthana === -1 ? src.length : nextSthana;
  }
  let chunk = src.slice(chPos, nextChPos);

  // --- 1. Удаляем chapter-level english и englishOcr ---
  // Ищем ,"englishOcr":true и удаляем
  chunk = chunk.replace(/,"englishOcr":true/g, '');

  // Ищем ,"english":["..."] — массив строк на уровне главы
  // Отличие от verse-level: массив [] vs строка ""
  const arrMarker = ',"english":["';
  let arrIdx = chunk.indexOf(arrMarker);
  while (arrIdx !== -1) {
    // Найти конец массива — считаем [] с учётом строк
    let depth = 0, end = -1, inStr = false, esc = false;
    for (let j = arrIdx + 12; j < chunk.length; j++) {
      const c = chunk[j];
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
    chunk = chunk.slice(0, arrIdx) + chunk.slice(end);
    arrIdx = chunk.indexOf(arrMarker);
  }

  // --- 2. Вставляем per-verse english ---
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

        // Найти { перед "type":"verse"
        let objStart = vp.index;
        while (objStart > 0 && chunk[objStart] !== '{') objStart--;
        // Найти закрывающую }
        let depth = 0, vEnd = -1;
        for (let j = objStart; j < chunk.length; j++) {
          if (chunk[j] === '{') depth++;
          if (chunk[j] === '}') { depth--; if (depth === 0) { vEnd = j; break; } }
        }
        if (vEnd === -1) continue;

        // Удаляем существующий english если есть
        const verseStr = chunk.slice(objStart, vEnd);
        const existingEn = verseStr.match(/,"english":"(?:[^"\\]|\\.)*"/);
        if (existingEn) {
          chunk = chunk.slice(0, objStart + existingEn.index)
            + chunk.slice(objStart + existingEn.index + existingEn[0].length);
          vEnd -= existingEn[0].length;
        }

        const escaped = JSON.stringify(enPortion);
        chunk = chunk.slice(0, vEnd) + `,"english":${escaped}` + chunk.slice(vEnd);
        totalVerses++;
      }
      console.log(`  Ch ${chNum}: ${versePositions.length} verses`);
    } else {
      console.log(`  Ch ${chNum}: no verses`);
    }
  }

  src = src.slice(0, chPos) + chunk + src.slice(nextChPos);
}

// Финальная очистка: удалить все оставшиеся ,"english":[...] массивы глобально
let cleanPos = 0;
let cleanCount = 0;
while (true) {
  const idx = src.indexOf(',"english":["', cleanPos);
  if (idx === -1) break;
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
  cleanCount++;
}
if (cleanCount) console.log(`Cleaned ${cleanCount} remaining english arrays`);

fs.writeFileSync(dataPath, src);
console.log(`\nDone: ${totalVerses} verses with english (${(src.length / 1024 / 1024).toFixed(1)} MB)`);
