#!/usr/bin/env python3
"""
fix_data3.py — third-pass data quality fixes for data.js

Ch13 Дравьякалпа:        extract verse 5-7 from verse 1-2
Ch14 Баламайя:           extract verse 34-37 from verse 32-33
Ch15 Бхута виджнания:    extract verse 13-15 from verse 9-12
Ch16 О четырёх столпах:  text→verse for 3,5,7,8,10,13,17,19,26; strip footer
Ch17 О пище и питании:   split into logical paragraphs
Ch18 О ненасилии:        split into logical paragraphs; strip footer
Ch19 Шарирастхана(5):    extract verses 6,8,12,13-14,15-19 from merged blocks
Ch20 Основные опред.:    rename mislabeled verse#1 blocks; extract verse 36
Ch21 Шарирастхана(6):    extract verse 8 from verse 4; dedup verse 24;
                          extract verse 30 from verse 25; fix typo in verse 40-44
"""

import json
import re

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

# ── helpers ───────────────────────────────────────────────────────────────────

def split_embedded(block: dict, pattern: str, new_num: str,
                   keep_orig_num: str | None = None) -> list:
    """
    Split a verse block at `pattern` (regex).
    Before match → keep as original block (optionally renaming to keep_orig_num).
    After match  → new verse block with number new_num.
    """
    text = block['text']
    m = re.search(pattern, text)
    if not m:
        return [block]
    before = text[:m.start()].strip()
    after  = text[m.end():].strip()
    result = []
    if before:
        b = dict(block, text=before)
        if keep_orig_num is not None:
            b = dict(b, number=keep_orig_num)
        result.append(b)
    if after:
        result.append({'type': 'verse', 'number': new_num, 'text': after})
    return result


def split_at_phrases(text: str, phrases: list[str]) -> list[str]:
    """Split text into segments at given phrase boundaries (phrase starts next seg)."""
    result = []
    current = text
    for phrase in phrases:
        idx = current.find(phrase)
        if idx > 0:
            before = current[:idx].strip()
            if before:
                result.append(before)
            current = current[idx:]
    if current.strip():
        result.append(current.strip())
    return result


CHARAKA_FOOTER_RE = re.compile(r'\s*Чарака\s+самхита\b.*$', re.DOTALL)

def strip_charaka_footer(text: str) -> str:
    m = CHARAKA_FOOTER_RE.search(text)
    return text[:m.start()].rstrip() if m else text


# ── Ch13 Дравьякалпа ─────────────────────────────────────────────────────────

def fix_ch13(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '1-2':
            parts = split_embedded(b, r'\s+5-7\s*\.\s+', '5-7')
            new_content.extend(parts)
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


# ── Ch14 Баламайя пратишедха ─────────────────────────────────────────────────

def fix_ch14(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '32-33':
            parts = split_embedded(b, r'\s+34-37\.\s+', '34-37')
            new_content.extend(parts)
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


# ── Ch15 Бхута виджнания ─────────────────────────────────────────────────────

def fix_ch15(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '9-12':
            parts = split_embedded(b, r'\s+13-15\.\s+', '13-15')
            new_content.extend(parts)
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


# ── Ch16 О четырёх столпах лечения ───────────────────────────────────────────

CH16_TEXT_NUMS = {'3', '5', '10', '13', '17', '19', '26'}
CH16_TEXT_RE   = re.compile(r'^(\d+)\.\s+(.+)', re.DOTALL)

def fix_ch16(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        btype = b.get('type', '')
        text  = b.get('text', '')

        # Strip Чарака footer from verse #27-28
        if b.get('number') == '27-28' and 'Чарака самхита' in text:
            b = dict(b, text=strip_charaka_footer(text))
            new_content.append(b)
            continue

        # Convert text block "7. ... 8. ..." → two separate verse blocks
        if btype == 'text' and text.startswith('7.'):
            # split at " 8. "
            m = re.search(r'\s+8\.\s+', text)
            if m:
                t7 = text[:m.start()].strip()
                t8 = text[m.end():].strip()
                # strip "7. " prefix
                t7 = re.sub(r'^7\.\s+', '', t7)
                t8 = re.sub(r'^8\.\s+', '', t8)
                if t7:
                    new_content.append({'type': 'verse', 'number': '7', 'text': t7})
                if t8:
                    new_content.append({'type': 'verse', 'number': '8', 'text': t8})
                continue

        # Convert simple text blocks "N. text" → verse block
        if btype == 'text':
            m = CH16_TEXT_RE.match(text.strip())
            if m and m.group(1) in CH16_TEXT_NUMS:
                new_content.append({'type': 'verse', 'number': m.group(1),
                                    'text': m.group(2).strip()})
                continue

        new_content.append(b)
    return dict(ch, content=new_content)


# ── Ch17 О пище и питании ────────────────────────────────────────────────────

PARA_BREAKS_CH17 = [
    'Дальше скажем о тех видах пищи',
    'Далее скажем о самых дурных среди вредных веществ.',
    'После этого скажем о вещах, важных среди лекарственных средств',
    'Козье молоко относится к тому',
    'Регулярное использование пахты',
    'Ясность разума назову среди самых полезных',
]

def fix_ch17(ch: dict) -> dict:
    if len(ch['content']) != 1:
        return ch
    raw_text = ch['content'][0]['text']

    # Separate translation credit (ends before first capital-Cyrillic sentence start)
    credit_end = raw_text.find(' Пищу ')
    if credit_end < 0:
        credit_end = raw_text.find('Пищу')
    credit = raw_text[:credit_end].strip() if credit_end > 0 else ''
    body   = raw_text[credit_end:].strip() if credit_end >= 0 else raw_text

    segs = split_at_phrases(body, PARA_BREAKS_CH17)
    new_content = []
    if credit:
        new_content.append({'type': 'text', 'text': credit})
    for seg in segs:
        new_content.append({'type': 'text', 'text': seg})
    return dict(ch, content=new_content)


# ── Ch18 О ненасилии и здоровье ──────────────────────────────────────────────

PARA_BREAKS_CH18 = [
    'Тот человек считается постигшим Аюрведу',
    'Некоторые спрашивают',
    'Потом он должен сказать о том',
    'Счастливой называют ту жизнь',
    'Цель Аюрведы',
    'Никогда Аюрведа не возникала',
    'Аюрведу должны изучать',
    'Так говорит об Аюрведе',
]

def fix_ch18(ch: dict) -> dict:
    if len(ch['content']) != 1:
        return ch
    raw_text = ch['content'][0]['text']
    # Strip "Чарака самхита" footer
    raw_text = strip_charaka_footer(raw_text)

    # Separate translation credit
    credit_match = re.match(r'^(\([^)]+\))\s+', raw_text)
    credit = credit_match.group(1).strip() if credit_match else ''
    body   = raw_text[credit_match.end():].strip() if credit_match else raw_text

    segs = split_at_phrases(body, PARA_BREAKS_CH18)
    new_content = []
    if credit:
        new_content.append({'type': 'text', 'text': credit})
    for seg in segs:
        new_content.append({'type': 'text', 'text': seg})
    return dict(ch, content=new_content)


# ── Ch19 Шарирастхана #5 (Чарака) ───────────────────────────────────────────

def fix_ch19(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') != 'verse':
            new_content.append(b)
            continue
        num  = b.get('number', '')
        text = b['text']

        if num == '5':
            # Extract verse 6: " 6 «" pattern
            m = re.search(r'\s+6\s+(?=[««\"])', text)
            if m:
                new_content.append(dict(b, text=text[:m.start()].strip()))
                new_content.append({'type': 'verse', 'number': '6',
                                    'text': text[m.end():].strip()})
            else:
                new_content.append(b)
            continue

        if num == '7':
            # Extract verse 8: ". 8 " after period
            m = re.search(r'\.\s+8\s+', text)
            if m:
                new_content.append(dict(b, text=text[:m.start()+1].strip()))
                new_content.append({'type': 'verse', 'number': '8',
                                    'text': text[m.end():].strip()})
            else:
                new_content.append(b)
            continue

        if num == '11':
            # Chain-split: extract 12, 13-14, 15-19
            blocks = [dict(b)]
            for (pat, new_n) in [
                (r'\s+12\s+', '12'),
                (r'\s+13-14\s+', '13-14'),
                (r'\s+15-19\s+', '15-19'),
            ]:
                last = blocks[-1]
                m = re.search(pat, last['text'])
                if m:
                    before = last['text'][:m.start()].strip()
                    after  = last['text'][m.end():].strip()
                    blocks[-1] = dict(last, text=before)
                    if after:
                        blocks.append({'type': 'verse', 'number': new_n, 'text': after})
            new_content.extend(blocks)
            continue

        new_content.append(b)
    return dict(ch, content=new_content)


# ── Ch20 Основные определения ────────────────────────────────────────────────

# Map (block_index, text_prefix) → correct verse number
CH20_VERSE_FIX = {
    3:  ('3. ',  '3'),
    5:  ('5. ',  '5'),
    11: ('49. ', '49'),
    14: ('54. ', '54'),
    17: ('58. ', '58'),
}

def fix_ch20(ch: dict) -> dict:
    content = list(ch['content'])

    # Fix mislabeled verse #1 blocks
    for bi, (prefix, correct_num) in CH20_VERSE_FIX.items():
        if bi < len(content):
            b = content[bi]
            if b.get('type') == 'verse' and b.get('number') == '1':
                text = b['text']
                if text.startswith(prefix):
                    text = text[len(prefix):].strip()
                content[bi] = dict(b, number=correct_num, text=text)

    # Split verse #6 to extract verse #36 (separated by dashes line)
    new_content = []
    for b in content:
        if b.get('type') == 'verse' and b.get('number') == '6':
            text = b['text']
            # Find separator (long dash run or "36.")
            m = re.search(r'\s*-{5,}\s*36\.\s+', text)
            if not m:
                m = re.search(r'\s+36\.\s+', text)
            if m:
                before = text[:m.start()].strip()
                after  = text[m.end():].strip()
                if before:
                    new_content.append(dict(b, text=before))
                if after:
                    new_content.append({'type': 'verse', 'number': '36', 'text': after})
            else:
                new_content.append(b)
            continue
        new_content.append(b)

    return dict(ch, content=new_content)


# ── Ch21 Шарирастхана #6 (Чарака) ───────────────────────────────────────────

def fix_ch21(ch: dict) -> dict:
    content = list(ch['content'])
    new_content = []
    seen_24 = False

    for bi, b in enumerate(content):
        btype = b.get('type', '')
        num   = b.get('number', '')
        text  = b.get('text', '')

        # verse #4: extract verse #8
        if btype == 'verse' and num == '4':
            m = re.search(r'\s+8\.\s+', text)
            if m:
                new_content.append(dict(b, text=text[:m.start()].strip()))
                new_content.append({'type': 'verse', 'number': '8',
                                    'text': text[m.end():].strip()})
            else:
                new_content.append(b)
            continue

        # verse #24: remove duplicate (second occurrence becomes text block)
        if btype == 'verse' and num == '24':
            if not seen_24:
                seen_24 = True
                new_content.append(b)
            else:
                # Second #24 — convert to text (it's a section transition)
                new_content.append({'type': 'text', 'text': text})
            continue

        # verse #25: extract verse #30
        if btype == 'verse' and num == '25':
            m = re.search(r'\s*\.{2,}\s*30\.\s+', text)
            if not m:
                m = re.search(r'\s+30\.\s+', text)
            if m:
                new_content.append(dict(b, text=text[:m.start()].strip()))
                new_content.append({'type': 'verse', 'number': '30',
                                    'text': text[m.end():].strip()})
            else:
                new_content.append(b)
            continue

        # verse #40-44: fix typo "еликая" → "Великая"
        if btype == 'verse' and num == '40-44':
            # Fix missing 'В' in 'Великая'
            fixed = re.sub(r'к смерти\.\s+еликая', 'к смерти. Великая', text)
            # Strip content after "Великая тайна ума" (it's extraneous attribution)
            m_gt = re.search(r'Великая тайна ума\s+', fixed)
            if m_gt:
                verse_text = fixed[:m_gt.start()].strip()
                extra      = fixed[m_gt.start():].strip()
                new_content.append(dict(b, text=verse_text))
                if extra:
                    new_content.append({'type': 'text', 'text': extra})
            else:
                new_content.append(dict(b, text=fixed))
            continue

        new_content.append(b)

    return dict(ch, content=new_content)


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup4'

    print('Reading data.js…')
    with open(input_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    assert raw.startswith(PREFIX)
    assert raw.endswith(SUFFIX)
    data = json.loads(raw[len(PREFIX):-len(SUFFIX)])

    print(f'Backing up to {backup_path}…')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(raw)

    chapters = list(data['chapters'])
    fixes = [
        (13, fix_ch13,  'Дравьякалпа'),
        (14, fix_ch14,  'Баламайя'),
        (15, fix_ch15,  'Бхута виджнания'),
        (16, fix_ch16,  'О четырёх столпах'),
        (17, fix_ch17,  'О пище и питании'),
        (18, fix_ch18,  'О ненасилии и здоровье'),
        (19, fix_ch19,  'Шарирастхана #5'),
        (20, fix_ch20,  'Основные определения'),
        (21, fix_ch21,  'Шарирастхана #6'),
    ]
    for ci, fn, name in fixes:
        chapters[ci] = fn(chapters[ci])
        print(f'  ✓ Ch{ci} {name}')

    data = dict(data, chapters=chapters)

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
