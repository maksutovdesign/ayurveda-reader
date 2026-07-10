const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const URLS = [
  // Сутрастхана (30 глав)
  'https://www.easyayurveda.com/2013/10/21/charaka-samhita-sutrasthana-chapter-1-quest-longevity/',
  'https://www.easyayurveda.com/2013/10/28/charaka-samhita-sutrasthana-chapter-2/',
  'https://www.easyayurveda.com/2013/11/05/charaka-samhita-sutrasthana-chapter-3-aragvadheeya-adhyaya/',
  'https://www.easyayurveda.com/2013/11/11/charak-samhita-sutrasthana-4-shad-virechana-shatashriteeya-adhyaya/',
  'https://www.easyayurveda.com/2013/12/03/ayurvedic-healthy-daily-routine-charak-samhita-sutrasthana-chapter-5/',
  'https://www.easyayurveda.com/2013/12/09/ayurvedic-seasonal-regimen-charaka-samhita-sutrasthana-6th-chapter/',
  'https://www.easyayurveda.com/2013/12/16/suppress-body-urges-charak-samhita-sutrasthana-7th-chapter/',
  'https://www.easyayurveda.com/2013/12/27/what-is-mind-sense-organs-charaka-samhita-sutrasthana-8th-chapter/',
  'https://www.easyayurveda.com/2014/01/06/4-basic-elements-of-ayurvedic-treatment-charak-samhita-sutrasthan-9/',
  'https://www.easyayurveda.com/2014/01/10/40-different-criteria-ayurvedic-prognosis-charaka-sutrasthana-10/',
  'https://www.easyayurveda.com/2014/01/19/3-basic-desires-life-charaka-sanhita-sutrasthan-12/',
  'https://www.easyayurveda.com/2014/02/02/vata-kalakaliya-adhyaya-charaka-12/',
  'https://www.easyayurveda.com/2014/02/10/snehakarma-preparation-panchakarma-charak-samhita-sutrasthan-13/',
  'https://www.easyayurveda.com/2014/02/20/sweating-treatment-swedana-types-methods-charaka-samhita-14/',
  'https://www.easyayurveda.com/2014/03/23/requirements-ayurvedic-doctor-charaka-samhita-sutrasthan-15/',
  'https://www.easyayurveda.com/2014/04/17/benefits-of-vamana-and-virechana-treatment-charaka-sutrasthana-16/',
  'https://www.easyayurveda.com/2014/05/04/diseases-head-heart-abscess-charaka-samhita-sutrasthana-17/',
  'https://www.easyayurveda.com/2014/05/06/different-types-swelling-ayurveda-diagnosis-charak-sanhita-sutrasthan18/',
  'https://www.easyayurveda.com/2014/06/04/ayurvedic-disease-classification-charaka-sutrasthana-19/',
  'https://www.easyayurveda.com/2014/06/19/qualities-diseases-treatment-of-vata-pitta-and-kapha/',
  'https://www.easyayurveda.com/2014/06/28/weight-loss-weight-gain-treatment-sleep-charaka-sutra-21/',
  'https://www.easyayurveda.com/2014/07/03/six-basic-ayurvedic-therapies-shat-upakrama/',
  'https://www.easyayurveda.com/2014/07/09/treatment-for-diseases-of-over-and-under-nourishment/',
  'https://www.easyayurveda.com/2014/07/18/blood-formation-causes-of-impurity-diseases-treatment/',
  'https://www.easyayurveda.com/2014/07/23/best-and-worst-things-for-health-and-disease-charaka-sutrasthana-25/',
  'https://www.easyayurveda.com/2014/08/04/ayurvedic-pharmacology-charaka-samhita-sutrasthana-26/',
  'https://www.easyayurveda.com/2014/08/08/classification-of-foods-and-drinks-charaka-sahmita-sutrasthana-27/',
  'https://www.easyayurveda.com/2014/08/18/process-of-digestion-how-food-causes-disease-charaka-sutrasthana-28/',
  'https://www.easyayurveda.com/2014/08/19/10-abodes-life-charaka-samhita-sutrasthana-29/',
  'https://www.easyayurveda.com/2014/08/21/essence-purpose-ayurveda-charaka-sutrasthana-30/',
  // Нидана стхана (8 глав)
  'https://www.easyayurveda.com/2016/02/02/charaka-jwara-nidana-1st-chapter-2/',
  'https://www.easyayurveda.com/2016/02/10/charaka-raktapitta-nidana-2nd-chapter/',
  'https://www.easyayurveda.com/2016/02/10/charaka-gulma-nidana-3rd-chapter/',
  'https://www.easyayurveda.com/2016/02/23/charaka-prameha-nidana-4th-chapter/',
  'https://www.easyayurveda.com/2016/02/29/charaka-kushta-nidana-5th-chapter/',
  'https://www.easyayurveda.com/2016/03/02/charaka-shosha-nidana-6th-chapter/',
  'https://www.easyayurveda.com/2016/03/03/charaka-unmada-nidana-7th-chapter/',
  'https://www.easyayurveda.com/2016/03/04/charaka-apasmara-nidana-8th-chapter/',
  // Вимана стхана (8 глав)
  'https://www.easyayurveda.com/2016/06/21/charaka-rasa-vimana-1st-chapter/',
  'https://www.easyayurveda.com/2016/06/27/charak-samhita-vimana-sthana-2-trividha-kukshiya/',
  'https://www.easyayurveda.com/2016/06/29/charaka-janapadoddhvamsaniyam-vimana-3rd-chapter/',
  'https://www.easyayurveda.com/2016/07/20/charaka-trividha-roga-visesha-vijnaniya-vimana-4/',
  'https://www.easyayurveda.com/2016/08/03/charaka-srotasam-vimana-5th-chapter/',
  'https://www.easyayurveda.com/2016/08/05/charaka-roganikam-vimana-6th-chapter/',
  'https://www.easyayurveda.com/2018/01/18/charaka-vimana-7-vyadhita-rupiya-vimana/',
  'https://www.easyayurveda.com/2017/10/21/charaka-rogabhisagjitiyam-vimana-8th-chapter/',
  // Шарира стхана (8 глав)
  'https://www.easyayurveda.com/2022/06/28/katidha-purushiyam-shareeram/',
  'https://www.easyayurveda.com/2022/07/01/athulyagotriya-shareeram/',
  'https://www.easyayurveda.com/2022/07/01/kuddikaam-garbhavakranti-shareeram/',
  'https://www.easyayurveda.com/2022/07/11/mahati-garbhavakranti-shareera/',
  'https://www.easyayurveda.com/2022/07/14/purushavichayam-shareeram/',
  'https://www.easyayurveda.com/2022/07/30/shareeravichayam-shaareeram/',
  'https://www.easyayurveda.com/2022/07/30/shareera-sankhya-shareeram/',
  'https://www.easyayurveda.com/2022/07/31/jaatisootriya-shareeram/',
  // Индрия стхана (12 глав)
  'https://www.easyayurveda.com/2022/06/18/varnaswareeya-indriyam/',
  'https://www.easyayurveda.com/2022/06/18/pushpitakam-indriyam/',
  'https://www.easyayurveda.com/2022/06/21/parimarshaniyam-indriyam/',
  'https://www.easyayurveda.com/2022/06/21/indriyaanikam-indriyam/',
  'https://www.easyayurveda.com/2022/06/21/poorvaroopiyam-indriyam/',
  'https://www.easyayurveda.com/2022/06/21/katamaanishareeriya-indriyam/',
  'https://www.easyayurveda.com/2022/06/21/pannaroopiya-indriyam/',
  'https://www.easyayurveda.com/2022/06/22/avaakshirasiya-indriyam/',
  'https://www.easyayurveda.com/2022/06/22/yasya-shyava-nimittiya-indriyam/',
  'https://www.easyayurveda.com/2022/06/22/sadhyo-maraniya-indriyam/',
  'https://www.easyayurveda.com/2022/06/22/anu-jyotiyam-indriyam/',
  'https://www.easyayurveda.com/2022/06/27/gomaya-churniya-indriyam/',
  // Чикитса стхана (30 глав; ch1 и ch2 — по 4 пады)
  'https://www.easyayurveda.com/2015/07/02/charaka-chikitsa-1-1-abhaya-amalakeeya-rasayana/',
  'https://www.easyayurveda.com/2015/07/04/charaka-chikitsasthana-1-2-prana-kameeya-rasayana/',
  'https://www.easyayurveda.com/2015/07/08/charak-chikitsasthan-1-3-karaprachiteeya-rasayan/',
  'https://www.easyayurveda.com/2015/07/11/charak-chikitsa-sthana-ayurved-samutthaneeya-rasayana/',
  'https://www.easyayurveda.com/2015/07/13/charaka-chikitsa-2-1-samyoga-sharamuliya-vajikarana-pada/',
  'https://www.easyayurveda.com/2015/07/16/charak-chikitsa-2-2-asikta-kshiriya-vajikarana-pada/',
  'https://www.easyayurveda.com/2015/07/21/charaka-chikitsa-2-3-mashaparna-bhrutiya/',
  'https://www.easyayurveda.com/2015/07/22/charaka-chikitsa-2-4-puman-jata-baladhika-vajikarana-pada/',
  'https://www.easyayurveda.com/2015/07/28/charaka-jwara-chikitsa/',
  'https://www.easyayurveda.com/2015/08/13/charaka-raktapitta-chikitsa/',
  'https://www.easyayurveda.com/2015/08/22/charaka-gulma-chikitsa/',
  'https://www.easyayurveda.com/2015/08/24/charaka-prameha-chikitsa/',
  'https://www.easyayurveda.com/2015/09/02/charaka-kushta-chikitsa/',
  'https://www.easyayurveda.com/2015/09/10/rajayakshma-charaka-chikitsa-8/',
  'https://www.easyayurveda.com/2015/09/16/charaka-chikitsa-unmada/',
  'https://www.easyayurveda.com/2015/09/19/charaka-apasmara-chikitsa-chapter/',
  'https://www.easyayurveda.com/2015/09/23/charaka-kshatasheena-chikitsa/',
  'https://www.easyayurveda.com/2015/09/26/charaka-shotha-chikitsa-12/',
  'https://www.easyayurveda.com/2015/10/02/charaka-udara-roga-chikitsa/',
  'https://www.easyayurveda.com/2015/10/06/charak-arsha-chikitsa/',
  'https://www.easyayurveda.com/2015/10/15/charaka-grahani-chikitsa/',
  'https://www.easyayurveda.com/2015/10/26/charaka-pandu-roga-chikitsa/',
  'https://www.easyayurveda.com/2015/10/30/charaka-hikka-shwasa-chikitsa/',
  'https://www.easyayurveda.com/2015/11/05/charaka-kasa-chikitsa-17th-chapter/',
  'https://www.easyayurveda.com/2015/11/16/atisara-charaka-chikitsa-sthan-19/',
  'https://www.easyayurveda.com/2015/11/20/charaka-chardi-chikitsa-20th-chapter/',
  'https://www.easyayurveda.com/2015/11/23/charaka-visarpa-chikitsa-21st-chapter/',
  'https://www.easyayurveda.com/2015/11/27/charaka-trishna-thirst-dry-mouth-22nd-chapter/',
  'https://www.easyayurveda.com/2015/12/02/charaka-visha-chikitsa-23rd-chapter/',
  'https://www.easyayurveda.com/2015/12/07/charaka-madatyaya-chikitsa-24th-chapter/',
  'https://www.easyayurveda.com/2015/12/07/charaka-vrana-chikitsa-25th-chapter/',
  'https://www.easyayurveda.com/2015/12/22/trimarmeeya-chikitsa-charaka-26/',
  'https://www.easyayurveda.com/2015/12/25/charaka-urusthambha-chikitsa-27/',
  'https://www.easyayurveda.com/2016/01/03/charaka-vatavyadhi-chikitsa-28/',
  'https://www.easyayurveda.com/2016/01/06/charaka-vatarakta-chikitsa-29/',
  'https://www.easyayurveda.com/2016/02/02/charaka-chikitsa-sthana-30th-chapter-yoni-vyapat/',
  // Калпастхана (12 глав)
  'https://www.easyayurveda.com/2022/07/31/madanakalpam/',
  'https://www.easyayurveda.com/2022/07/31/jimutaka-kalpam/',
  'https://www.easyayurveda.com/2022/07/31/iksvaku-kalpam/',
  'https://www.easyayurveda.com/2022/07/31/dhamargava-kalpa/',
  'https://www.easyayurveda.com/2022/07/31/vatsaka-kalpam/',
  'https://www.easyayurveda.com/2022/07/31/kritavedhana-kalpam/',
  'https://www.easyayurveda.com/2022/07/31/shyama-trivrit-kalpam/',
  'https://www.easyayurveda.com/2022/08/16/chaturangula-kalpam/',
  'https://www.easyayurveda.com/2022/08/16/tilvaka-kalpam/',
  'https://www.easyayurveda.com/2022/08/16/sudha-kalpam/',
  'https://www.easyayurveda.com/2022/08/16/saptala-shankhini-kalpam/',
  'https://www.easyayurveda.com/2022/08/16/danti-dravanti-kalpam/',
  // Сиддхистхана (12 глав)
  'https://www.easyayurveda.com/2023/01/10/charaka-siddhisthana-1-kalpanasiddhi/',
  'https://www.easyayurveda.com/2023/03/01/charaka-siddhisthana-2-panchakarmiya-siddhi/',
  'https://www.easyayurveda.com/2023/03/02/charaka-siddhisthana-3-basti-sutriya/',
  'https://www.easyayurveda.com/2023/03/03/charaka-siddhisthana-4-sneha-vyapat/',
  'https://www.easyayurveda.com/2023/03/04/charaka-siddhisthana-5-netrabasti-vyapat/',
  'https://www.easyayurveda.com/2023/03/07/charaka-siddhisthana-6-vamana-virechana-vyapat/',
  'https://www.easyayurveda.com/2023/03/13/charaka-siddhisthana-7-basti-vyapat/',
  'https://www.easyayurveda.com/2023/03/15/charaka-siddhisthana-8-prasrita-yogiya/',
  'https://www.easyayurveda.com/2023/03/17/charaka-siddhisthana-9-tri-marmiya/',
  'https://www.easyayurveda.com/2023/03/18/charaka-siddhisthana-10-basti-siddhi/',
  'https://www.easyayurveda.com/2023/03/20/charaka-siddhisthana-11-phala-matra-siddhi/',
  'https://www.easyayurveda.com/2023/03/21/charaka-siddhisthana-12-uttara-basti/',
];

// Маппинг: индекс URL → {sthana, chapter} в charaka-data.js
const MAPPING = [];
// Сутрастхана ch1-30
for (let i = 0; i < 30; i++) MAPPING.push({ sthana: 'Сутрастхана', chapter: i + 1 });
// Нидана ch1-8
for (let i = 0; i < 8; i++) MAPPING.push({ sthana: 'Нидана стхана', chapter: i + 1 });
// Вимана ch1-8
for (let i = 0; i < 8; i++) MAPPING.push({ sthana: 'Вимана стхана', chapter: i + 1 });
// Шарира ch1-8
for (let i = 0; i < 8; i++) MAPPING.push({ sthana: 'Шарира стхана', chapter: i + 1 });
// Индрия ch1-12
for (let i = 0; i < 12; i++) MAPPING.push({ sthana: 'Индрия стхана', chapter: i + 1 });
// Чикитса ch1(4 пады) + ch2(4 пады) + ch3-30
// ch1 пады 1-4 → chapter 1
// ch2 пады 1-4 → chapter 2
// ch3-30 → chapters 3-30
for (let i = 0; i < 4; i++) MAPPING.push({ sthana: 'Чикитса стхана', chapter: 1, pada: i + 1 });
for (let i = 0; i < 4; i++) MAPPING.push({ sthana: 'Чикитса стхана', chapter: 2, pada: i + 1 });
for (let i = 3; i <= 30; i++) MAPPING.push({ sthana: 'Чикитса стхана', chapter: i });
// Калпа ch1-12
for (let i = 0; i < 12; i++) MAPPING.push({ sthana: 'Калпастхана', chapter: i + 1 });
// Сиддхи ch1-12
for (let i = 0; i < 12; i++) MAPPING.push({ sthana: 'Сиддхистхана', chapter: i + 1 });

const OUT_DIR = '/tmp/charaka-en';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function extractContent(html) {
  const blocks = [];

  const headings = html.matchAll(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gis);
  for (const m of headings) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 2) blocks.push({ type: 'heading', text, pos: m.index });
  }

  const paras = html.matchAll(/<p[^>]*>(.*?)<\/p>/gis);
  for (const m of paras) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&#\d+;/g, c => {
      const code = parseInt(c.match(/\d+/)[0]);
      return String.fromCharCode(code);
    }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    if (text.length > 20) blocks.push({ type: 'para', text, pos: m.index });
  }

  blocks.sort((a, b) => a.pos - b.pos);

  return blocks.map(b => {
    const refs = [];
    const refMatches = b.text.matchAll(/\[?(\d+(?:\s*[-–]\s*\d+)?)\]?\s*$/g);
    for (const rm of refMatches) {
      refs.push(rm[1].replace(/\s/g, ''));
    }
    const refMatches2 = b.text.matchAll(/\((\d+(?:\s*[-–]\s*\d+)?)\)/g);
    for (const rm of refMatches2) {
      refs.push(rm[1].replace(/\s/g, ''));
    }
    return { ...b, verseRefs: refs };
  });
}

async function main() {
  const startIdx = parseInt(process.argv[2] || '0');
  const endIdx = parseInt(process.argv[3] || String(URLS.length - 1));

  for (let i = startIdx; i <= endIdx && i < URLS.length; i++) {
    const url = URLS[i];
    const map = MAPPING[i];
    const padaSuffix = map.pada ? `-p${map.pada}` : '';
    const outFile = path.join(OUT_DIR, `${map.sthana}_ch${String(map.chapter).padStart(2,'0')}${padaSuffix}-en.json`);

    if (fs.existsSync(outFile)) {
      console.log(`[${i}] ${map.sthana} ch${map.chapter}${padaSuffix}: already exists, skipping`);
      continue;
    }

    console.log(`[${i}] ${map.sthana} ch${map.chapter}${padaSuffix}: fetching...`);
    try {
      const html = await fetchUrl(url);
      const blocks = extractContent(html);
      const contentBlocks = blocks.filter(b =>
        !b.text.includes('Read –') &&
        !b.text.includes('Sorry, this product') &&
        !b.text.includes('Search') &&
        !b.text.includes('Cart') &&
        !b.text.includes('Click to Consult') &&
        !b.text.includes('Write your comment') &&
        b.text.length > 25
      );

      fs.writeFileSync(outFile, JSON.stringify({
        urlIndex: i,
        sthana: map.sthana,
        chapter: map.chapter,
        pada: map.pada || null,
        url,
        blocks: contentBlocks.map(({ type, text, verseRefs }) => ({ type, text, verseRefs }))
      }, null, 2));

      console.log(`  saved ${contentBlocks.length} blocks`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }
  console.log('Done!');
}

main();
