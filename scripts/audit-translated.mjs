/**
 * Аудит трёх переведённых книг: Аштанга (data.js), Сушрута, Чарака.
 * Запуск: node scripts/audit-translated.mjs
 *
 * 1. Полнота: sanskrit / iast / iast_ru / text у каждого стиха
 * 2. Ошибки текста: OCR-артефакты, латиница внутри русского, обрывки
 * 3. Мусорные символы: управляющие, вики-маркеры, повторы знаков
 * 4. Комментарии внутри перевода: маркеры + аномальная длина
 */

const BOOKS = [
  { id: 'ashtanga', file: '../data.js',          key: 'BOOK_DATA', unwrap: d => d.chapters },
  { id: 'sushruta', file: '../sushruta-data.js', key: 'SUSHRUTA_DATA' },
  { id: 'charaka',  file: '../charaka-data.js',  key: 'CHARAKA_DATA' },
];

const DEVA = /[ऀ-ॿ]/;

// Мусорные символы / OCR-артефакты в русском переводе
const GARBAGE = [
  ['управляющие символы', /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/],
  ['вики-маркеры', /\{\{|\}\}|\[\[|\]\]|<ref|<\/ref|&nbsp;|&amp;|&lt;|&gt;/],
  ['html-теги', /<\/?[a-z][^>]{0,30}>/i],
  ['повтор знаков', /([!?.,;:—-])\1{2,}/],
  ['двойные пробелы', /  +/],
  ['слэш в тексте', /(^|[а-яё ])\/([а-яё ]|$)/i],
  ['крышки/подчёрк', /[\^_~|\\]/],
  ['одинокие скобки', null], // спец-проверка
  ['цифро-буквенный мусор', /\b\d+[a-z]{1,2}\d+\b|\b[il1]{3,}\b/],
  ['OCR-разрыв слова', /[а-яё]- [а-яё]/],
  ['деванагари в переводе', DEVA],
];

// Латиница внутри русского текста (слова 3+ букв, не термины в скобках IAST)
const LATIN_WORD = /[A-Za-z]{3,}/;

// Маркеры комментария внутри перевода
const COMMENT_MARKERS = [
  /Примечание[.:]/, /\bNote[.:]/, /Комментарий[.:]/,
  /Далхана|Дальхана/, /Чакрапани/, /Мадхукоша/, /Гаядаса/,
  /Metrical Text/i, /Бхишагратна/i,
  /прим\.\s*(пер|ред)/i,
];

function balancedParens(s) {
  let d = 0, dq = 0;
  for (const c of s) {
    if (c === '(') d++;
    else if (c === ')') { d--; if (d < 0) return false; }
    else if (c === '«') dq++;
    else if (c === '»') { dq--; if (dq < 0) return false; }
  }
  return d === 0 && dq === 0;
}

const grand = {};

for (const book of BOOKS) {
  const mod = await import(book.file);
  let chapters = mod[book.key];
  if (book.unwrap) chapters = book.unwrap(chapters);

  const issues = [];
  const cat = c => { grand[book.id + '|' + c] = (grand[book.id + '|' + c] || 0) + 1; };

  for (const ch of chapters) {
    const loc = `${ch.sthana} гл.${ch.number}`;
    const verses = (ch.content || []).filter(b => b.type === 'verse');
    for (const v of verses) {
      const vloc = `${loc} стих ${v.number}`;
      // 1. полнота
      if (!v.sanskrit) { issues.push(`${vloc}: нет sanskrit`); cat('нет sanskrit'); }
      if (!v.iast)     { issues.push(`${vloc}: нет iast`); cat('нет iast'); }
      if (!v.iast_ru)  { issues.push(`${vloc}: нет iast_ru`); cat('нет iast_ru'); }
      if (!v.text)     { issues.push(`${vloc}: нет перевода (text)`); cat('нет text'); continue; }
      const t = v.text;

      // 2-3. мусор и ошибки
      for (const [name, re] of GARBAGE) {
        if (!re) continue;
        const m = re.exec(t);
        if (m) {
          const pos = m.index;
          issues.push(`${vloc}: ${name} @${pos}: «${t.slice(Math.max(0, pos - 25), pos + 30).replace(/\s+/g, ' ')}»`);
          cat(name);
        }
      }
      if (!balancedParens(t)) { issues.push(`${vloc}: несбалансированные скобки/кавычки`); cat('несбалансированные скобки'); }

      const lm = LATIN_WORD.exec(t);
      if (lm) {
        issues.push(`${vloc}: латиница в переводе @${lm.index}: «${t.slice(Math.max(0, lm.index - 20), lm.index + 40).replace(/\s+/g, ' ')}»`);
        cat('латиница в переводе');
      }

      // строчная буква в начале перевода (обрыв — хвост чужого предложения)
      if (/^[а-яё]/.test(t)) { issues.push(`${vloc}: перевод начинается со строчной: «${t.slice(0, 60)}»`); cat('начинается со строчной'); }
      // обрыв в конце (нет завершающего знака)
      if (t.length > 40 && !/[.!?…»)"']$/.test(t.trim())) { issues.push(`${vloc}: перевод не завершён знаком препинания: «…${t.trim().slice(-60)}»`); cat('нет конечной пунктуации'); }

      // 4. комментарии внутри перевода
      for (const re of COMMENT_MARKERS) {
        const m = re.exec(t);
        if (m) {
          issues.push(`${vloc}: маркер комментария "${m[0]}" @${m.index}: «${t.slice(Math.max(0, m.index - 20), m.index + 60).replace(/\s+/g, ' ')}»`);
          cat('маркер комментария');
          break;
        }
      }
      // аномальная длина перевода против санскрита
      if (v.sanskrit && t.length / v.sanskrit.length >= 8 && t.length > 800) {
        issues.push(`${vloc}: перевод x${(t.length / v.sanskrit.length).toFixed(0)} длиннее санскрита (${t.length} зн.) — вероятно склейка стихов/комментариев`);
        cat('аномальная длина');
      }
    }
  }

  console.log(`\n${'='.repeat(70)}\n📚 ${book.id} — проблем: ${issues.length}`);
  issues.forEach(i => console.log('  • ' + i));
}

console.log('\n' + '='.repeat(70) + '\nСВОДКА:');
Object.entries(grand).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
