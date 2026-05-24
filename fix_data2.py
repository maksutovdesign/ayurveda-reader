#!/usr/bin/env python3
"""
fix_data2.py — second-pass data quality fixes for data.js:

1. Ch0  Аюшкамия:     verse 39→42-43, 44→45-48
2. Ch2  Ритучарья:    verse 18-19→18-22 (covers missing 20-22)
3. Ch3  Роганутпадания: extract verse 30 from verse 28-29 block
4. Ch4  Дравадравья:  extract verse 25 from verse 24 block
5. Ch5  Матрашитья:   text blocks → verse blocks; split Комментарий:
6. Ch6  Дравьяди:     split Комментарий: from specific verse blocks
7. Ch7  Викрити:      verse 2-3→3, verse 761→76
8. All chapters:       strip footer "Аштанга-хридая-самхитаШримад…" globally
"""

import json
import re

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

FOOTER_RE  = re.compile(r'\s*Аштанга-хридая-самхитаШримад.*$', re.DOTALL)
COMMENT_RE = re.compile(r'\s*Комментарий:\s*')
VERSE_NUM_RE = re.compile(r'^(\d{1,3})\.\s+(.+)', re.DOTALL)

# ── helpers ───────────────────────────────────────────────────────────────────

def strip_footer(text: str) -> str:
    m = FOOTER_RE.search(text)
    return text[:m.start()].rstrip() if m else text


def split_comment(block: dict) -> list:
    """Split a block at 'Комментарий:' into [verse_block, comment_block]."""
    text = block['text']
    parts = COMMENT_RE.split(text, maxsplit=1)
    if len(parts) == 2:
        result = []
        if parts[0].strip():
            result.append(dict(block, text=parts[0].strip()))
        if parts[1].strip():
            result.append({'type': 'comment', 'text': parts[1].strip()})
        return result
    return [block]


def try_text_to_verse(block: dict, allowed_nums: set) -> dict | None:
    """If block is 'text' starting with 'N. ', convert to verse (if N in allowed_nums)."""
    if block.get('type') != 'text':
        return None
    m = VERSE_NUM_RE.match(block['text'].strip())
    if m and m.group(1) in allowed_nums:
        return {'type': 'verse', 'number': m.group(1), 'text': m.group(2).strip()}
    return None


# ── chapter-specific fixes ────────────────────────────────────────────────────

def fix_ch0_ayushkamiya(ch: dict) -> dict:
    remap = {'39': '42-43', '44': '45-48'}
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') in remap:
            b = dict(b, number=remap[b['number']])
        new_content.append(b)
    return dict(ch, content=new_content)


def fix_ch2_ritucharia(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '18-19':
            b = dict(b, number='18-22')
        new_content.append(b)
    return dict(ch, content=new_content)


def fix_ch3_roganutpadania(ch: dict) -> dict:
    """Extract verse 30 that is embedded inside verse 28-29 text."""
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '28-29':
            m = re.search(r'\s+30\.(?=[А-ЯЁ])', b['text'])
            if m:
                new_content.append(dict(b, text=b['text'][:m.start()].strip()))
                new_content.append({'type': 'verse', 'number': '30',
                                    'text': b['text'][m.end():].strip()})
                continue
        new_content.append(b)
    return dict(ch, content=new_content)


def fix_ch4_dravadravya(ch: dict) -> dict:
    """Extract verse 25 that is embedded inside verse 24 text."""
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '24':
            m = re.search(r'\s+25\s*\.\s+(?=[А-ЯЁ])', b['text'])
            if m:
                new_content.append(dict(b, text=b['text'][:m.start()].strip()))
                new_content.append({'type': 'verse', 'number': '25',
                                    'text': b['text'][m.end():].strip()})
                continue
        new_content.append(b)
    return dict(ch, content=new_content)


CH8_VERSE_NUMS = {'3','6','12','17','19','21','23','25','27','29','39','44','46','51','53','55'}

def fix_ch8_matrashitya(ch: dict) -> dict:
    """
    1. Convert text blocks starting with 'N. ' (N in CH8_VERSE_NUMS) to verse blocks.
    2. Split any verse block containing 'Комментарий:' into verse + comment.
    """
    new_content = []
    for b in ch['content']:
        converted = try_text_to_verse(b, CH8_VERSE_NUMS)
        if converted is not None:
            b = converted
        if b.get('type') == 'verse' and 'Комментарий:' in b.get('text', ''):
            new_content.extend(split_comment(b))
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


CH9_VERSE_NUMS = {'2', '3', '4', '10', '11', '17-18', '20', '25'}

def fix_ch9_dravyadi(ch: dict) -> dict:
    """Split 'Комментарий:' from specific verse blocks in Дравьяди."""
    new_content = []
    for b in ch['content']:
        if (b.get('type') == 'verse' and b.get('number') in CH9_VERSE_NUMS
                and 'Комментарий:' in b.get('text', '')):
            new_content.extend(split_comment(b))
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


def fix_ch7_vikriti(ch: dict) -> dict:
    remap = {'2-3': '3', '761': '76'}
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') in remap:
            b = dict(b, number=remap[b['number']])
        new_content.append(b)
    return dict(ch, content=new_content)


def strip_all_footers(chapters: list) -> list:
    """Remove footer boilerplate from any block text across all chapters."""
    result = []
    for ch in chapters:
        new_content = []
        for b in ch['content']:
            text = b.get('text', '')
            if 'Аштанга-хридая-самхитаШримад' in text:
                b = dict(b, text=strip_footer(text))
            new_content.append(b)
        result.append(dict(ch, content=new_content))
    return result


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup3'

    print('Reading data.js…')
    with open(input_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    assert raw.startswith(PREFIX), 'Unexpected file prefix'
    assert raw.endswith(SUFFIX),   'Unexpected file suffix'
    data = json.loads(raw[len(PREFIX):-len(SUFFIX)])

    print(f'Backing up to {backup_path}…')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(raw)

    chapters = data['chapters']

    # Map chapter keys by title keyword
    idx = {}
    for ci, ch in enumerate(chapters):
        t = ch.get('title', '')
        if 'Аюшкамия' in t:          idx['ayush']    = ci
        if 'Ритучарья' in t:          idx['ritu']     = ci
        if 'Роганутпадания' in t:     idx['rogan']    = ci
        if 'Дравадравья' in t and 'Викрити' not in t:
                                       idx['drava']    = ci
        if 'Матрашитья' in t:         idx['matra']    = ci
        if 'Дравьяди' in t:           idx['dravyadi'] = ci
        if 'Викрити' in t:            idx['vikriti']  = ci

    print(f'Chapter indices: {idx}')

    chs = list(chapters)

    if 'ayush'    in idx: chs[idx['ayush']]    = fix_ch0_ayushkamiya(chs[idx['ayush']]);    print('✓ Ch Аюшкамия')
    if 'ritu'     in idx: chs[idx['ritu']]     = fix_ch2_ritucharia(chs[idx['ritu']]);      print('✓ Ch Ритучарья')
    if 'rogan'    in idx: chs[idx['rogan']]    = fix_ch3_roganutpadania(chs[idx['rogan']]); print('✓ Ch Роганутпадания')
    if 'drava'    in idx: chs[idx['drava']]    = fix_ch4_dravadravya(chs[idx['drava']]);    print('✓ Ch Дравадравья')
    if 'matra'    in idx: chs[idx['matra']]    = fix_ch8_matrashitya(chs[idx['matra']]);    print('✓ Ch Матрашитья')
    if 'dravyadi' in idx: chs[idx['dravyadi']] = fix_ch9_dravyadi(chs[idx['dravyadi']]);   print('✓ Ch Дравьяди')
    if 'vikriti'  in idx: chs[idx['vikriti']]  = fix_ch7_vikriti(chs[idx['vikriti']]);      print('✓ Ch Викрити')

    print('Stripping footers from all chapters…')
    chs = strip_all_footers(chs)

    data = dict(data, chapters=chs)

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
