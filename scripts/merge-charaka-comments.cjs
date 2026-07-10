const fs = require('fs');
const path = require('path');

const IN_DIR = '/tmp/charaka-comments';
const OUT_DIR = '/tmp/charaka-merged';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(IN_DIR).filter(f => f.endsWith('-comments.json')).sort();
let totalBefore = 0, totalAfter = 0;

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(IN_DIR, file), 'utf8'));
  const comments = data.comments.filter(c => c.verseRef !== null);

  // Merge consecutive comments with same verseRef
  const merged = [];
  for (const c of comments) {
    const last = merged[merged.length - 1];
    if (last && last.verseRef === c.verseRef) {
      last.text += ' ' + c.text;
    } else {
      merged.push({ verseRef: c.verseRef, text: c.text });
    }
  }

  totalBefore += comments.length;
  totalAfter += merged.length;

  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify({
    sthana: data.sthana,
    chapter: data.chapter,
    pada: data.pada,
    comments: merged,
  }, null, 2));

  console.log(`${file}: ${comments.length} → ${merged.length} (merged ${comments.length - merged.length})`);
}

console.log(`\nTotal: ${totalBefore} → ${totalAfter} comments`);
