const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'madhava-data.js');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/inject-madhava-ru.cjs <ch01-ru.json> [ch02-ru.json] ...');
  console.error('JSON format: [{"number":"1","sanskrit_key":"first 30 chars","text_ru":"..."},...]');
  process.exit(1);
}

let src = fs.readFileSync(dataFile, 'utf8');

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  let translations;
  try {
    translations = JSON.parse(raw);
  } catch (e) {
    console.error(`ERROR parsing ${file}: ${e.message}`);
    continue;
  }

  if (!Array.isArray(translations) || !translations.length) {
    console.error(`ERROR: ${file} is not a valid array`);
    continue;
  }

  let injected = 0;
  for (const t of translations) {
    if (!t.text_ru) continue;

    const ru = t.text_ru
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .trim();

    if (t.sanskrit_key) {
      // Match by sanskrit_key (first ~30 chars of sanskrit field)
      const safeKey = t.sanskrit_key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(sanskrit:\\s*"${safeKey}[^"]*"\\s*,\\s*(?:iast:\\s*"[^"]*"\\s*,\\s*)?text:\\s*)"([^"]*)"`,
      );

      const newSrc = src.replace(pattern, (match, prefix, oldText) => {
        injected++;
        return `${prefix}"${ru}"`;
      });
      if (newSrc !== src) {
        src = newSrc;
      }
    }
  }

  console.log(`${path.basename(file)}: injected ${injected}/${translations.length} verses`);
}

// Remove lang: "sa" from chapters that now have translations
const dataMatch = src.match(/export const MADHAVA_DATA = (\[[\s\S]*\])/);
if (dataMatch) {
  const data = eval(dataMatch[1]);
  data.forEach((ch, i) => {
    const verses = ch.content.filter(c => c.type === 'verse');
    const cyrillic = verses.filter(v => /[а-яА-ЯёЁ]/.test(v.text));
    if (verses.length > 0 && cyrillic.length === verses.length) {
      const langPattern = new RegExp(
        `(number:\\s*${ch.number}\\s*,\\s*)lang:\\s*"sa"\\s*,`,
        'g'
      );
      const before = src;
      src = src.replace(langPattern, '$1');
      if (src !== before) {
        console.log(`  ch${ch.number}: removed lang:"sa" (all ${verses.length} verses translated)`);
      }
    }
  });
}

fs.writeFileSync(dataFile, src);
console.log('Done! madhava-data.js updated.');
