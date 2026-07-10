const fs = require('fs');

const DATA_FILE = 'charaka-data.js';

// Usage: node scripts/inject-charaka-comments.cjs /tmp/charaka-ru/Сутрастхана_ch01-ru.json "Сутрастхана" 1
const jsonFile = process.argv[2];
const sthana = process.argv[3];
const chapter = parseInt(process.argv[4]);

if (!jsonFile || !sthana || !chapter) {
  console.error('Usage: node scripts/inject-charaka-comments.cjs <json> <sthana> <chapter>');
  process.exit(1);
}

const comments = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
console.log(`Injecting ${comments.length} comments into ${sthana} ch${chapter}...`);

const src = fs.readFileSync(DATA_FILE, 'utf8');
const m = src.match(/export const CHARAKA_DATA\s*=\s*(\[[\s\S]*\]);?\s*$/);
if (!m) { console.error('Cannot parse CHARAKA_DATA'); process.exit(1); }
const data = eval(m[1]);

// Find chapter
const chIdx = data.findIndex(ch => ch.sthana === sthana && ch.number === chapter);
if (chIdx === -1) {
  console.error(`Chapter ${sthana} ch${chapter} not found`);
  process.exit(1);
}

const ch = data[chIdx];
const content = ch.content;

// Group comments by verseRef
const byVerse = {};
for (const c of comments) {
  const key = String(c.verseRef);
  if (!byVerse[key]) byVerse[key] = [];
  byVerse[key].push(c.text);
}

// Insert comments after corresponding verses (bottom-up to avoid index shift)
const insertions = [];
for (const [verseNum, texts] of Object.entries(byVerse)) {
  // Find the verse in content
  let verseIdx = -1;
  for (let i = content.length - 1; i >= 0; i--) {
    if (content[i].type === 'verse' && String(content[i].number) === verseNum) {
      verseIdx = i;
      break;
    }
  }

  if (verseIdx === -1) {
    // Try to find the closest verse with number <= verseNum
    const vn = parseInt(verseNum);
    let bestIdx = -1, bestNum = -1;
    for (let i = 0; i < content.length; i++) {
      if (content[i].type === 'verse') {
        const n = parseInt(content[i].number);
        if (n <= vn && n > bestNum) {
          bestNum = n;
          bestIdx = i;
        }
      }
    }
    if (bestIdx !== -1) {
      verseIdx = bestIdx;
      console.log(`  verse ${verseNum} not found, placing after verse ${bestNum}`);
    } else {
      console.log(`  verse ${verseNum}: no suitable position found, skipping`);
      continue;
    }
  }

  // Skip past any existing comments after this verse
  let insertPos = verseIdx + 1;
  while (insertPos < content.length && content[insertPos].type === 'comment') {
    insertPos++;
  }

  for (const text of texts) {
    insertions.push({ pos: insertPos, item: { type: 'comment', author: 'Dr. Hebbar', text } });
  }
}

// Sort insertions by position descending (to insert from bottom up)
insertions.sort((a, b) => b.pos - a.pos);
for (const ins of insertions) {
  content.splice(ins.pos, 0, ins.item);
}

// Rebuild file
const output = 'export const CHARAKA_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(DATA_FILE, output);

console.log(`Done: injected ${insertions.length} comments into ${sthana} ch${chapter}`);
console.log(`File size: ${(output.length / 1024 / 1024).toFixed(1)} MB`);
