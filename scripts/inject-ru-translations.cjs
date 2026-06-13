#!/usr/bin/env node
/**
 * Inject Russian translations into data.js, replacing English verse texts.
 * Each input JSON must have sthana+chapter metadata OR the filename must encode it.
 *
 * Input files format: [{"verse":"1","text":"...","sthana":"...","chapter":N}, ...]
 * Or filename-based: translated_<sthana>_ch<N>.json with [{"verse":"1","text":"..."}]
 *
 * Mapping config passed as arguments:
 *   node inject-ru-translations.cjs "Нидана стхана:3:/tmp/translated_nidana_ch3.json" ...
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data.js');

function devanagariToArabic(s) {
  return s.replace(/[०-९]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48));
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log('Usage: node inject-ru-translations.cjs "sthana:chapter:file.json" ...');
  process.exit(1);
}

let src = fs.readFileSync(dataPath, 'utf8');
const eq = src.indexOf('= {');
const jsonStr = src.slice(eq + 2).replace(/;\s*$/, '');
const book = JSON.parse(jsonStr);

let totalReplaced = 0;

for (const arg of args) {
  const parts = arg.split(':');
  if (parts.length < 3) {
    console.log(`⚠ Invalid arg: ${arg}. Use "sthana:chapter:file"`);
    continue;
  }
  const sthana = parts[0];
  const chNum = parseInt(parts[1]);
  const filePath = parts.slice(2).join(':');

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`${sthana} гл.${chNum}: ${data.length} переводов`);

  const ch = book.chapters.find(c => c.sthana === sthana && c.number === chNum);
  if (!ch) {
    console.log(`  ⚠ Глава не найдена: ${sthana} гл.${chNum}`);
    continue;
  }

  const lookup = new Map();
  for (const v of data) {
    const num = devanagariToArabic(String(v.verse));
    lookup.set(num, v.text);
  }

  let replaced = 0;
  for (const block of ch.content) {
    if (block.type !== 'verse') continue;
    const normalizedNum = devanagariToArabic(block.number);
    const newText = lookup.get(block.number) || lookup.get(normalizedNum);
    if (newText) {
      block.text = newText;
      replaced++;
    }
  }
  console.log(`  → ${replaced} стихов заменено`);
  totalReplaced += replaced;
}

const newJson = JSON.stringify(book);
const newSrc = src.slice(0, eq + 2) + newJson + ';';
fs.writeFileSync(dataPath, newSrc);

// Validate
try {
  JSON.parse(newJson);
  console.log(`\nГотово: ${totalReplaced} стихов заменено. JSON валиден.`);
} catch (e) {
  console.log(`\n⚠ JSON НЕВАЛИДЕН: ${e.message}`);
}
