const fs = require('fs');
const path = require('path');

const IN_DIR = '/tmp/charaka-en';
const OUT_DIR = '/tmp/charaka-comments';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(IN_DIR).filter(f => f.endsWith('-en.json')).sort();

let totalComments = 0;
let totalWithRefs = 0;

function parseRefs(text) {
  const allRefs = [];
  for (const m of text.matchAll(/[\[\(](\d+)\s*[-–]\s*(\d+)[\]\)]/g)) {
    for (let n = parseInt(m[1]); n <= parseInt(m[2]); n++) allRefs.push(n);
  }
  for (const m of text.matchAll(/[\[\(](\d+)[\]\)]/g)) {
    allRefs.push(parseInt(m[1]));
  }
  return [...new Set(allRefs)].sort((a, b) => a - b);
}

function isNoise(text) {
  return text.includes('Read –') || text.includes('Click to Consult') ||
    text.includes('Write your comment') || text.includes('Related Articles') ||
    text.includes('Watch the video') || text.includes('Subscribe') ||
    text.includes('YouTube') || text.includes('easyayurveda.com') ||
    text.includes('Amazon') || text.includes('Buy Now') ||
    text.includes('Table of Contents') || text.includes('My experience') ||
    /^\d+\.\s/.test(text);
}

function isSanskrit(text) {
  const devCount = (text.match(/[ऀ-ॿ]/g) || []).length;
  return devCount > text.length * 0.25;
}

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(IN_DIR, file), 'utf8'));

  // First pass: classify all paragraphs
  const items = [];
  for (const block of data.blocks) {
    if (block.type !== 'para') continue;
    if (isSanskrit(block.text)) {
      // Sanskrit verse block — extract verse ref for position tracking
      const refs = parseRefs(block.text);
      items.push({ kind: 'verse', refs, pos: block.pos });
      continue;
    }
    if (block.text.length < 50) continue;
    if (isNoise(block.text)) continue;

    const refs = parseRefs(block.text);
    let text = block.text;
    // Clean trailing refs
    text = text.replace(/\s*[\[\(]\d+\s*[-–]\s*\d+[\]\)]\s*$/g, '').trim();
    text = text.replace(/\s*[\[\(]\d+[\]\)]\s*$/g, '').trim();

    items.push({ kind: 'comment', refs, text, pos: block.pos });
  }

  // Second pass: propagate verse refs positionally
  // Walk through items; track last known verse ref
  let lastKnownRef = null;
  for (const item of items) {
    if (item.refs.length > 0) {
      lastKnownRef = Math.max(...item.refs);
    }
    if (item.kind === 'comment' && item.refs.length === 0 && lastKnownRef !== null) {
      item.refs = [lastKnownRef];
      item.inferred = true;
    }
  }

  // Extract only comments
  const comments = items
    .filter(it => it.kind === 'comment')
    .map(it => ({
      verseRef: it.refs.length > 0 ? Math.max(...it.refs) : null,
      allRefs: it.refs,
      text: it.text,
      inferred: it.inferred || false,
    }));

  if (comments.length > 0) {
    const outFile = file.replace('-en.json', '-comments.json');
    fs.writeFileSync(path.join(OUT_DIR, outFile), JSON.stringify({
      sthana: data.sthana,
      chapter: data.chapter,
      pada: data.pada,
      comments,
    }, null, 2));

    totalComments += comments.length;
    const withRefs = comments.filter(c => c.verseRef !== null).length;
    totalWithRefs += withRefs;
    console.log(`${file}: ${comments.length} comments (${withRefs} with refs)`);
  } else {
    console.log(`${file}: no comments`);
  }
}

console.log(`\nTotal: ${totalComments} comments (${totalWithRefs} with refs)`);
