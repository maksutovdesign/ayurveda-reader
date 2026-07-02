/**
 * Полный аудит структуры всех книг.
 * Запуск: node scripts/audit-structure.mjs [--book=имя]
 *
 * Проверяет:
 *  1. Структуру глав (sthana, number, content)
 *  2. Структуру стихов (number, text, sanskrit, iast, english)
 *  3. Нумерацию стихов (дубликаты, убывание, странные форматы)
 *  4. Протечки текста: маркеры соседних стихов внутри перевода ("12.", "12-14." и т.п.)
 *  5. Перепутанные поля: деванагари в text/iast/english, кириллица в iast/sanskrit
 */

const BOOKS = [
  { id: 'ashtanga',      file: '../data.js',                key: 'BOOK_DATA',          unwrap: d => d.chapters },
  { id: 'charaka',       file: '../charaka-data.js',        key: 'CHARAKA_DATA' },
  { id: 'sushruta',      file: '../sushruta-data.js',       key: 'SUSHRUTA_DATA' },
  { id: 'madhava',       file: '../madhava-data.js',        key: 'MADHAVA_DATA' },
  { id: 'sharangadhara', file: '../sharangadhara-data.js',  key: 'SHARANGADHARA_DATA' },
  { id: 'bhavaprakasha', file: '../bhavaprakasha-data.js',  key: 'BHAVAPRAKASHA_DATA' },
  { id: 'astanga',       file: '../astanga-data.js',        key: 'ASTANGA_DATA' },
];

const DEVA = /[ऀ-ॿ]/;
const CYR  = /[Ѐ-ӿ]/;

const onlyBook = (process.argv.find(a => a.startsWith('--book=')) || '').slice(7);

// Парсит номер стиха: "12", "12-14", "12a", "12a-13b" → {first, last} или null
function parseNum(numStr) {
  const s = String(numStr).trim();
  const m = s.match(/^(\d+)[abс]?(?:\s*[-–]\s*(\d+)[abс]?)?$/);
  if (!m) return null;
  return { first: parseInt(m[1]), last: parseInt(m[2] || m[1]) };
}

// Ищет маркер номера стиха внутри текста перевода (протечка соседнего стиха)
function findBleedMarker(text, lastNum, nextNum) {
  const hi = Math.max(nextNum + 2, lastNum + 3);
  for (let n = lastNum + 1; n <= hi; n++) {
    const re = new RegExp('(^|[ \\n.")\\u00bb])' + n + '(?:[ab])?(?:[-–]\\d+[ab]?)?\\.\\s+[A-ZА-ЯЁa-zа-яё]');
    const m = re.exec(text);
    if (m && m.index > 20) {
      return { pos: m.index, marker: m[0].trim().slice(0, 12) };
    }
  }
  return null;
}

let totalIssues = 0;
const summary = [];

for (const book of BOOKS) {
  if (onlyBook && book.id !== onlyBook) continue;
  const mod = await import(book.file);
  let chapters = mod[book.key];
  if (book.unwrap) chapters = book.unwrap(chapters);

  const issues = [];
  const stats = { chapters: chapters.length, verses: 0, withSkt: 0, withIast: 0, withEng: 0, langs: {} };

  chapters.forEach((ch, ci) => {
    const loc = `${ch.sthana || '???'} гл.${ch.number ?? '?'}`;
    if (ch.number == null) issues.push(`[глава ${ci}] нет number`);
    if (!ch.sthana) issues.push(`[глава ${ci}] нет sthana`);
    if (!Array.isArray(ch.content) || ch.content.length === 0) {
      issues.push(`${loc}: content пуст или отсутствует`);
      return;
    }
    const lang = ch.lang || 'ru';
    stats.langs[lang] = (stats.langs[lang] || 0) + 1;
    // text — перевод, только если глава ru/en; в sa-главах text = IAST
    const textIsTranslation = lang === 'ru' || lang === 'en';

    const verses = ch.content.filter(b => b.type === 'verse');
    let prev = null, prevText = null;
    const seen = new Map();

    verses.forEach((v, vi) => {
      stats.verses++;
      if (v.sanskrit) stats.withSkt++;
      if (v.iast) stats.withIast++;
      if (v.english) stats.withEng++;

      const vloc = `${loc} стих ${v.number}`;
      if (v.number == null || v.number === '') issues.push(`${loc}: стих #${vi} без номера`);
      const pn = v.number != null ? parseNum(v.number) : null;
      if (v.number != null && !pn) issues.push(`${vloc}: странный формат номера "${v.number}"`);

      if (!v.text && !v.sanskrit) issues.push(`${vloc}: нет ни text, ни sanskrit`);

      // нумерация
      if (pn) {
        const k = pn.first + '-' + pn.last;
        if (seen.has(k)) issues.push(`${vloc}: ДУБЛИКАТ номера (уже был как стих #${seen.get(k)})`);
        seen.set(k, vi);
        if (prev && pn.first < prev.first) issues.push(`${vloc}: нумерация идёт назад (после ${prev.first}-${prev.last})`);
        if (pn.last < pn.first) issues.push(`${vloc}: диапазон задом наперёд`);
        prev = pn;
      }

      // перепутанные поля
      if (v.sanskrit && !DEVA.test(v.sanskrit)) issues.push(`${vloc}: sanskrit без деванагари: "${String(v.sanskrit).slice(0, 60)}"`);
      if (v.iast && DEVA.test(v.iast)) issues.push(`${vloc}: деванагари в поле iast`);
      if (v.iast && CYR.test(v.iast)) issues.push(`${vloc}: кириллица в поле iast: "${String(v.iast).slice(0, 60)}"`);
      if (v.english && DEVA.test(v.english)) issues.push(`${vloc}: деванагари в поле english`);
      if (v.english && CYR.test(v.english)) issues.push(`${vloc}: кириллица в поле english: "${String(v.english).slice(0, 60)}"`);
      if (textIsTranslation && v.text && DEVA.test(v.text)) issues.push(`${vloc}: деванагари в переводе (text)`);

      // протечки маркеров номеров в переводах
      if (pn) {
        const next = verses[vi + 1];
        const nextPn = next && next.number != null ? parseNum(next.number) : null;
        const nextFirst = nextPn ? nextPn.first : pn.last + 1;
        for (const [field, val] of [['text', textIsTranslation ? v.text : null], ['english', v.english]]) {
          if (!val || val.length < 40) continue;
          const bleed = findBleedMarker(val, pn.last, nextFirst);
          if (bleed) {
            const preview = val.slice(bleed.pos, bleed.pos + 70).replace(/\s+/g, ' ');
            issues.push(`${vloc}: ПРОТЕЧКА в ${field} — маркер "${bleed.marker}" @${bleed.pos}: «${preview}…»`);
          }
        }
      }

      // дословный дубль перевода с предыдущим стихом
      const tr = textIsTranslation ? v.text : v.english;
      if (tr && prevText && tr.length > 60 && tr === prevText) {
        issues.push(`${vloc}: перевод идентичен предыдущему стиху`);
      }
      prevText = tr && tr.length > 60 ? tr : null;
    });
  });

  totalIssues += issues.length;
  summary.push({ id: book.id, stats, count: issues.length });

  console.log('\n' + '='.repeat(60));
  console.log(`📚 ${book.id} — глав: ${stats.chapters}, стихов: ${stats.verses}, langs: ${JSON.stringify(stats.langs)}`);
  console.log(`   sanskrit: ${stats.withSkt}, iast: ${stats.withIast}, english: ${stats.withEng}`);
  if (issues.length === 0) console.log('   ✅ проблем не найдено');
  else {
    console.log(`   ❌ проблем: ${issues.length}`);
    issues.forEach(i => console.log('   • ' + i));
  }
}

console.log('\n' + '='.repeat(60));
console.log('ИТОГО проблем: ' + totalIssues);
summary.forEach(s => console.log(`  ${s.id}: ${s.count}`));
