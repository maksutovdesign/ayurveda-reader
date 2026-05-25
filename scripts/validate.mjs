/**
 * Валидация файлов данных
 * Запуск: node scripts/validate.mjs
 *
 * Проверяет, что все JS-файлы с данными:
 *  - синтаксически корректны (иначе импорт упадёт)
 *  - содержат непустые массивы
 *  - ключевые поля присутствуют
 */

import { BOOK_DATA }               from '../data.js';
import { ENCYCLOPEDIA }            from '../encyclopedia.js';
import { DISEASES, getDiseaseCategories } from '../diseases.js';
import { REMEDIES }                from '../remedies.js';
import { GLOSSARY }                from '../glossary.js';
import { FOOD_TABLE }              from '../foodtable.js';
import { QUIZ }                    from '../quiz.js';

let errors = 0;

function ok(label, value) {
  console.log(`  ✅ ${label}: ${value}`);
}
function fail(label, msg) {
  console.error(`  ❌ ${label}: ${msg}`);
  errors++;
}
function check(condition, label, passVal, failMsg) {
  if (condition) ok(label, passVal);
  else fail(label, failMsg);
}

// ── BOOK_DATA ───────────────────────────────────────────────
console.log('\n📚 BOOK_DATA (data.js)');
check(BOOK_DATA?.title, 'title', BOOK_DATA?.title, 'нет заголовка');
check(Array.isArray(BOOK_DATA?.chapters) && BOOK_DATA.chapters.length > 0,
  'chapters', BOOK_DATA?.chapters?.length, 'массив пуст');

const verses = BOOK_DATA.chapters
  .flatMap(c => (c.content || []).filter(b => b.type === 'verse' && b.text?.length > 30));
check(verses.length > 0, 'verses (для постов)', verses.length, 'стихи не найдены — канал не сможет публиковать');

const chaptersWithContent = BOOK_DATA.chapters.filter(c => c.content?.length > 0);
ok('chapters с контентом', `${chaptersWithContent.length} из ${BOOK_DATA.chapters.length}`);

// ── ENCYCLOPEDIA ────────────────────────────────────────────
console.log('\n🔍 ENCYCLOPEDIA (encyclopedia.js)');
check(Array.isArray(ENCYCLOPEDIA) && ENCYCLOPEDIA.length > 0,
  'sections', ENCYCLOPEDIA.length, 'массив пуст');

const articles = ENCYCLOPEDIA.flatMap(s => s.articles || []);
check(articles.length > 0, 'articles', articles.length, 'статьи не найдены');

// Статьи могут использовать поле content ИЛИ body
const articlesWithText = articles.filter(a => a.content || a.body);
check(articlesWithText.length > 0,
  'articles с текстом (content/body)', articlesWithText.length,
  'ни у одной статьи нет content или body');

const articlesNoText = articles.filter(a => !a.content && !a.body);
if (articlesNoText.length > 0) {
  console.log(`  ⚠️  статьи без текста: ${articlesNoText.length} (id: ${articlesNoText.slice(0,3).map(a=>a.id).join(', ')}...)`);
}

// ── DISEASES ────────────────────────────────────────────────
console.log('\n🌿 DISEASES (diseases.js)');
check(Array.isArray(DISEASES) && DISEASES.length > 0, 'diseases', DISEASES.length, 'массив пуст');
check(DISEASES.every(d => d.name), 'disease.name', 'все есть', 'есть болезни без названия');

// ── REMEDIES ────────────────────────────────────────────────
console.log('\n💊 REMEDIES (remedies.js)');
check(Array.isArray(REMEDIES) && REMEDIES.length > 0, 'remedies', REMEDIES.length, 'массив пуст');
check(REMEDIES.every(r => r.name && r.content),
  'remedy.name/content', 'все поля есть', 'есть средства без name или content');

// ── GLOSSARY ────────────────────────────────────────────────
console.log('\n📖 GLOSSARY (glossary.js)');
check(Array.isArray(GLOSSARY) && GLOSSARY.length > 0, 'terms', GLOSSARY.length, 'массив пуст');
check(GLOSSARY.every(g => g.term && g.def),
  'glossary.term/def', 'все поля есть', 'есть термины без term или def');

// ── FOOD_TABLE ──────────────────────────────────────────────
console.log('\n🍽 FOOD_TABLE (foodtable.js)');
check(Array.isArray(FOOD_TABLE) && FOOD_TABLE.length > 0,
  'categories', FOOD_TABLE.length, 'массив пуст');

// ── QUIZ ────────────────────────────────────────────────────
console.log('\n🧪 QUIZ (quiz.js)');
// QUIZ — объект (не массив), содержит sections с вопросами
check(QUIZ && typeof QUIZ === 'object', 'quiz object', 'есть', 'объект не найден');
check(QUIZ?.sections?.length > 0, 'quiz.sections', QUIZ?.sections?.length, 'разделы пусты');

// ── ИТОГ ────────────────────────────────────────────────────
console.log('');
if (errors === 0) {
  console.log('✅  Все файлы данных валидны. Деплой безопасен.\n');
  process.exit(0);
} else {
  console.error(`💥  Найдено критических ошибок: ${errors}. Исправь перед коммитом.\n`);
  process.exit(1);
}
