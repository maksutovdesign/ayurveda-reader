#!/usr/bin/env python3
"""
fix_data5.py — split verse #5 of Випассана (Ch22) into logical blocks.

Verse #5 is a ~63KB blob containing:
  - actual verse content (болезни-враги)
  - ALL-CAPS section headers merged into the text
  - Long prose sections for each header
  - Attribution + two more section titles at the end

Output: verse #5 + alternating header/content text blocks.
"""

import json

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

# (search_phrase, header_text)  — order must match appearance in the text
SPLITS = [
    ('МЕХАНИЗМЫ РАЗВИТИЯ БОЛЕЗНЕЙ',
     'МЕХАНИЗМЫ РАЗВИТИЯ БОЛЕЗНЕЙ'),
    ('КАРМИЧЕСКИЙ МЕХАНИЗМ',
     'КАРМИЧЕСКИЙ МЕХАНИЗМ'),
    ('РОДОВОЙ МЕХАНИЗМ',
     'РОДОВОЙ МЕХАНИЗМ'),
    ('ЭКОЛОГИЧЕСКИЙ МЕХАНИЗМ',
     'ЭКОЛОГИЧЕСКИЙ МЕХАНИЗМ'),
    ('АККУМУЛЯЦИОННЫЙ ИЛИ МЕТАБОЛИЧЕСКИЙ МЕХАНИЗМ',
     'АККУМУЛЯЦИОННЫЙ ИЛИ МЕТАБОЛИЧЕСКИЙ МЕХАНИЗМ'),
    ('ОНТОГЕНЕТИЧЕСКИЙ МЕХАНИЗМ',
     'ОНТОГЕНЕТИЧЕСКИЙ МЕХАНИЗМ'),
    ('И. И. Ветров,директор',
     'И. И. Ветров,директор'),
    ('Болезни и их лечение',
     'Болезни и их лечение'),
    ('Шесть стадий болезни',
     'Шесть стадий болезни'),
]


def split_verse5(text: str) -> list:
    """Return list of (is_first, block_text) — first entry is verse #5, rest are text blocks."""
    result = []
    remaining = text
    first = True

    for search, header in SPLITS:
        idx = remaining.find(search)
        if idx < 0:
            continue

        before = remaining[:idx].strip()
        if before:
            result.append(('verse5' if first else 'text', before))
            first = False

        # For ОНТОГЕНЕТИЧЕСКИЙ, include the "(онтогенез...)" parenthetical in the header
        after = remaining[idx + len(search):]
        if search == 'ОНТОГЕНЕТИЧЕСКИЙ МЕХАНИЗМ' and after.lstrip().startswith('('):
            paren_end = after.find(')')
            if paren_end >= 0:
                header = header + after[:paren_end + 1].strip()
                after = after[paren_end + 1:]

        result.append(('header', header))
        remaining = after.strip()
        first = False

    if remaining:
        result.append(('text', remaining))

    return result


def fix_ch22(ch: dict) -> dict:
    content = ch['content']

    v5_idx = next((i for i, b in enumerate(content)
                   if b.get('type') == 'verse' and b.get('number') == '5'), None)
    if v5_idx is None:
        print('  ⚠ verse #5 not found in Ch22, skipping')
        return ch

    v5_text = content[v5_idx]['text']
    parts = split_verse5(v5_text)

    new_blocks = []
    for kind, txt in parts:
        if kind == 'verse5':
            new_blocks.append({'type': 'verse', 'number': '5', 'text': txt})
        else:
            new_blocks.append({'type': 'text', 'text': txt})

    new_content = content[:v5_idx] + new_blocks + content[v5_idx + 1:]
    return dict(ch, content=new_content)


def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup6'

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
    chapters[22] = fix_ch22(chapters[22])
    print('  ✓ Ch22 Випассана')

    data = dict(data, chapters=chapters)

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
