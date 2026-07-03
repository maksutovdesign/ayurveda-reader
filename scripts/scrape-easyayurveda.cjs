const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const URLS = [
  'https://www.easyayurveda.com/2023/03/22/pancha-nidana-madhava-nidana-1/',
  'https://www.easyayurveda.com/2023/03/24/jwara-nidanam/',
  'https://www.easyayurveda.com/2023/03/24/atisara-nidanam/',
  'https://www.easyayurveda.com/2023/03/25/grahani-roga-nidanam/',
  'https://www.easyayurveda.com/2023/03/27/arshas-nidanam/',
  'https://www.easyayurveda.com/2023/03/27/madhava-nidana-chapter-6/',
  'https://www.easyayurveda.com/2023/03/28/madhava-krimi-nidanam/',
  'https://www.easyayurveda.com/2023/03/28/madhava-nidana-8-panduroga-kamala-kumbhakamala-halimaka/',
  'https://www.easyayurveda.com/2023/03/29/raktapitta-nidanam-9/',
  'https://www.easyayurveda.com/2023/03/29/madhava-rajayakshma-kshatakshina-nidanam-10/',
  'https://www.easyayurveda.com/2023/03/29/kasa-nidanam/',
  'https://www.easyayurveda.com/2023/03/30/hikka-shwasa-nidanam/',
  'https://www.easyayurveda.com/2023/03/30/swara-bheda-nidanam/',
  'https://www.easyayurveda.com/2023/03/30/arochaka-nidanam/',
  'https://www.easyayurveda.com/2023/03/31/madhava-nidana-15-chardi/',
  'https://www.easyayurveda.com/2023/03/31/trishna-nidanam/',
  'https://www.easyayurveda.com/2023/03/31/murcha-bhrama-nidra-tandra-nidanam/',
  'https://www.easyayurveda.com/2023/04/01/panatyaya-paramada-panajirna-panavibhrama-nidanam/',
  'https://www.easyayurveda.com/2023/04/01/daha-nidanam/',
  'https://www.easyayurveda.com/2023/04/01/unmada-nidanam/',
  'https://www.easyayurveda.com/2023/04/02/madhava-apasmara-nidanam/',
  'https://www.easyayurveda.com/2023/04/02/vata-vyadhi-nidanam/',
  'https://www.easyayurveda.com/2023/04/02/madhava-nidana-chapter-23-vata-raktha-nidanam/',
  'https://www.easyayurveda.com/2023/04/03/urustambha-nidanam/',
  'https://www.easyayurveda.com/2023/04/03/amavata-nidanam/',
  'https://www.easyayurveda.com/2023/04/03/shoola-parinamashula-annadravashula-nidanam/',
  'https://www.easyayurveda.com/2023/04/04/udavarta-anaha-nidanam/',
  'https://www.easyayurveda.com/2023/04/04/gulma-nidanam/',
  'https://www.easyayurveda.com/2023/04/04/hridroga-nidanam/',
  'https://www.easyayurveda.com/2023/04/05/mutrakrichra-nidanam/',
  'https://www.easyayurveda.com/2023/04/05/madhava-mutraghata-nidana/',
  'https://www.easyayurveda.com/2023/04/05/madhava-ashmari-nidanam/',
  'https://www.easyayurveda.com/2023/04/06/madhava-prameha-prameha-pidaka-nidanam/',
  'https://www.easyayurveda.com/2023/04/06/madhava-meda-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/06/madhava-udara-nidanam/',
  'https://www.easyayurveda.com/2023/04/07/shotha-nidanam/',
  'https://www.easyayurveda.com/2023/04/07/madhava-vriddhi-nidanam/',
  'https://www.easyayurveda.com/2023/04/07/galaganda-gandamala-apachi-granthi-arbuda-nidanam/',
  'https://www.easyayurveda.com/2023/04/08/madhava-shlipada-nidanam/',
  'https://www.easyayurveda.com/2023/04/08/madhava-vidradhi-nidanam/',
  'https://www.easyayurveda.com/2023/04/08/madhava-vranashotha-nidanam/',
  'https://www.easyayurveda.com/2023/04/09/madhava-shareera-vrana-nidanam/',
  'https://www.easyayurveda.com/2023/04/09/madhava-sadyo-vrana-nidanam/',
  'https://www.easyayurveda.com/2023/04/09/madhava-bhagna-nidanam/',
  'https://www.easyayurveda.com/2023/04/10/madhava-nadivrana-nidanam/',
  'https://www.easyayurveda.com/2023/04/10/madhava-bhagandara-nidanam/',
  'https://www.easyayurveda.com/2023/04/10/madhava-upadamsha-nidanam/',
  'https://www.easyayurveda.com/2023/04/11/madhava-shuka-dosha-nidanam/',
  'https://www.easyayurveda.com/2023/04/14/madhava-kushta-nidanam/',
  'https://www.easyayurveda.com/2023/04/14/madhava-sitapitta-udarda-kotha-nidanam/',
  'https://www.easyayurveda.com/2023/04/14/madhava-amlapitta-nidanam/',
  'https://www.easyayurveda.com/2023/04/15/madhava-visarpa-nidanam/',
  'https://www.easyayurveda.com/2023/04/15/madhava-visphota-nidanam/',
  'https://www.easyayurveda.com/2023/04/15/madhava-masurika-nidanam/',
  'https://www.easyayurveda.com/2023/04/16/madhava-kshudra-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/16/madhava-mukha-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/16/madhava-karna-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/17/madhava-nasa-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/20/madhava-netra-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/21/madhava-shiro-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/21/madhava-asrigdara-nidanam/',
  'https://www.easyayurveda.com/2023/04/21/madhava-yonivyapat-nidanam/',
  'https://www.easyayurveda.com/2023/04/22/madhava-yoni-kanda-nidanam/',
  'https://www.easyayurveda.com/2023/04/22/madhava-mudhagarba-nidanam/',
  'https://www.easyayurveda.com/2023/04/22/madhava-sutikaroga-nidanam/',
  'https://www.easyayurveda.com/2023/04/23/madhava-stanaroga-nidanam/',
  'https://www.easyayurveda.com/2023/04/23/madhava-stanya-dushti-nidanam/',
  'https://www.easyayurveda.com/2023/04/23/madhava-bala-roga-nidanam/',
  'https://www.easyayurveda.com/2023/04/24/madhava-visha-roga-nidanam/',
];

const OUT_DIR = '/tmp/madhava-en';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function extractContent(html) {
  // Simple regex-based extraction of <p> and heading content
  const blocks = [];

  // Extract headings
  const headings = html.matchAll(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gis);
  for (const m of headings) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 2) blocks.push({ type: 'heading', text, pos: m.index });
  }

  // Extract paragraphs
  const paras = html.matchAll(/<p[^>]*>(.*?)<\/p>/gis);
  for (const m of paras) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&#\d+;/g, c => {
      const code = parseInt(c.match(/\d+/)[0]);
      return String.fromCharCode(code);
    }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    if (text.length > 20) blocks.push({ type: 'para', text, pos: m.index });
  }

  // Sort by position in document
  blocks.sort((a, b) => a.pos - b.pos);

  // Extract verse references from each paragraph
  return blocks.map(b => {
    const refs = [];
    const refMatches = b.text.matchAll(/\((\d+(?:\s*[-–]\s*\d+)?)\)/g);
    for (const rm of refMatches) {
      refs.push(rm[1].replace(/\s/g, ''));
    }
    return { ...b, verseRefs: refs };
  });
}

async function main() {
  const chStart = parseInt(process.argv[2] || '0');
  const chEnd = parseInt(process.argv[3] || String(URLS.length - 1));

  for (let i = chStart; i <= chEnd && i < URLS.length; i++) {
    const url = URLS[i];
    const chNum = i + 1; // EasyAyurveda chapter number (1-indexed)
    const outFile = path.join(OUT_DIR, `ch${String(chNum).padStart(2,'0')}-en.json`);

    if (fs.existsSync(outFile)) {
      console.log(`ch${chNum}: already exists, skipping`);
      continue;
    }

    console.log(`ch${chNum}: fetching ${url}...`);
    try {
      const html = await fetch(url);
      const blocks = extractContent(html);
      const contentBlocks = blocks.filter(b =>
        !b.text.includes('Read –') &&
        !b.text.includes('Sorry, this product') &&
        !b.text.includes('Search') &&
        !b.text.includes('Cart') &&
        b.text.length > 25
      );

      fs.writeFileSync(outFile, JSON.stringify({
        easyAyurvedaChapter: chNum,
        url,
        blocks: contentBlocks.map(({ type, text, verseRefs }) => ({ type, text, verseRefs }))
      }, null, 2));

      console.log(`ch${chNum}: saved ${contentBlocks.length} blocks`);
      // Polite delay
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`ch${chNum}: ERROR - ${e.message}`);
    }
  }
  console.log('Done!');
}

main();
