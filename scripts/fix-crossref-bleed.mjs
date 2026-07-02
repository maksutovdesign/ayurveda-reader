/** Чинит обрывы перекрёстных ссылок между стихами (проверено вручную).
 *  node scripts/fix-crossref-bleed.mjs */
import fs from 'fs';

function loadWrite(file, fn) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^([\s\S]*?export const [A-Z_]+ = )([\s\S]*?)(;\s*)$/);
  const data = JSON.parse(fm[2]);
  fn(data);
  fs.writeFileSync(file, fm[1] + JSON.stringify(data, null, 2) + fm[3]);
}
const verse = (chapters, sth, num, vn) => {
  const c = chapters.find(x => x.sthana === sth && String(x.number) === String(num));
  return c.content.find(b => b.type === 'verse' && String(b.number) === String(vn));
};
const insertCommentAfter = (chapters, sth, num, vn, text) => {
  const c = chapters.find(x => x.sthana === sth && String(x.number) === String(num));
  const i = c.content.findIndex(b => b.type === 'verse' && String(b.number) === String(vn));
  c.content.splice(i + 1, 0, { type: 'comment', author: 'прим. переводчика', text });
};

let log = [];

// ─── Сушрута: 4 обрыва перекрёстных ссылок ───
loadWrite('sushruta-data.js', (data) => {
  // 16.34 / 16.35 — перенос "IV)"
  let a = verse(data, 'Чикитса стхана', 16, '34'), b = verse(data, 'Чикитса стхана', 16, '35');
  if (a.text.endsWith('гл.') && b.text.startsWith('IV) ')) {
    a.text = a.text + ' IV)';
    b.text = b.text.replace(/^IV\)\s*/, '');
    log.push('СУШ Чикитса 16.34/35');
  }
  // 19.2 / 19.3 — "V Чикитсита Стхана)"
  a = verse(data, 'Чикитса стхана', 19, '2'); b = verse(data, 'Чикитса стхана', 19, '3');
  if (a.text.endsWith('гл.') && b.text.startsWith('V Чикитсита Стхана). ')) {
    a.text = a.text + ' V Чикитсита Стхана).';
    b.text = b.text.replace(/^V Чикитсита Стхана\)\.\s*/, '');
    log.push('СУШ Чикитса 19.2/3');
  }
  // 19.11 / 19.12 — "XXV)"
  a = verse(data, 'Чикитса стхана', 19, '11'); b = verse(data, 'Чикитса стхана', 19, '12');
  if (a.text.endsWith('(гл.') && b.text.startsWith('XXV). ')) {
    a.text = a.text + ' XXV).';
    b.text = b.text.replace(/^XXV\)\.\s*/, '');
    log.push('СУШ Чикитса 19.11/12');
  }
  // 19.15 / 19.16 — "XXXIX Сутра Стхана), растёртых...в тёплом виде."
  a = verse(data, 'Чикитса стхана', 19, '15'); b = verse(data, 'Чикитса стхана', 19, '16');
  if (a.text.endsWith('(гл.') && b.text.startsWith('XXXIX Сутра Стхана)')) {
    const cut = b.text.indexOf('. ') + 2; // конец первого предложения (хвост ссылки)
    const tail = b.text.slice(0, cut).trim();
    a.text = a.text + ' ' + tail;
    b.text = b.text.slice(cut).trim();
    log.push('СУШ Чикитса 19.15/16');
  }
});

// ─── Аштанга: 10.11/10.12 — примечание переводчика разрезано и вставлено в фразу ───
loadWrite('data.js', (data) => {
  const chapters = data.chapters;
  const a = verse(chapters, 'Сутрастхана', 10, '11');
  const b = verse(chapters, 'Сутрастхана', 10, '12');
  if (a.text.includes(' [Вполне возможно') && b.text.startsWith('), да и более ранние')) {
    const [head11, noteStart] = a.text.split(' [Вполне возможно');       // head11 = "...увеличивает Вата доша"
    const [noteEnd, restRaw] = b.text.split('] ');                        // noteEnd = "), да и...на Вата доша"
    // собрать примечание
    let note = ('Вполне возможно' + noteStart + noteEnd)
      .replace('говорят от уменьшающем', 'говорят об уменьшающем')
      .trim();
    if (!/[.!?]$/.test(note)) note += '.';
    // restRaw = "и кровь, вызывает плешивость...силы. Действие горького вкуса. ...нарушения."
    const rest = restRaw.replace('высыпа-ния', 'высыпания');
    const splitAt = rest.indexOf('Действие горького');
    const saltTail = rest.slice(0, splitAt).trim();                       // хвост солёного вкуса
    const bitter = rest.slice(splitAt).trim();                            // горький вкус = стих 12
    a.text = (head11.trim() + ' ' + saltTail).replace(/\s+/g, ' ').trim();
    b.text = bitter;
    insertCommentAfter(chapters, 'Сутрастхана', 10, '11', note);
    log.push('АШТ Сутра 10.11/12 (+ comment)');
  }
});

console.log('Исправлено обрывов:', log.length);
log.forEach(l => console.log('  ✅', l));
