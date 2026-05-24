#!/usr/bin/env python3
"""
fix_data4.py — fourth-pass fixes for data.js

Ch10 Джвара чикитса:
  1. Merge stray verses #1-5 (herbs per fever type) into verse #48-50
  2. Split verse #72-74: extract verse #78-80 at '7 8-80.' marker
Ch11 Ватавьядхи чикитса:
  3. Remove '(см. 17 главу сутрастханы)' cross-ref from verse #1-3
"""

import json
import re

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'


def fix_ch10(ch: dict) -> dict:
    content = ch['content']
    new_content = []
    i = 0
    while i < len(content):
        b = content[i]

        # --- Merge verses #1-5 into preceding verse #48-50 ---
        if b.get('type') == 'verse' and b.get('number') == '48-50':
            # Collect the verse block and any immediately following #1..#5 blocks
            merged_text = b['text'].rstrip(':').rstrip()
            j = i + 1
            extras = []
            while j < len(content) and content[j].get('number') in {'1', '2', '3', '4', '5'}:
                num = content[j]['number']
                txt = content[j]['text'].strip()
                extras.append(f'{num}. {txt}')
                j += 1
            if extras:
                merged_text = merged_text + ':\n' + '\n'.join(extras)
            new_content.append(dict(b, text=merged_text))
            i = j
            continue

        # --- Split verse #72-74: extract #78-80 ---
        if b.get('type') == 'verse' and b.get('number') == '72-74':
            text = b['text']
            # Pattern: " 7 8-80." with possible spaces around digits
            m = re.search(r'\s+7\s*8-80\s*\.\s*', text)
            if m:
                before = text[:m.start()].strip()
                after  = text[m.end():].strip()
                if before:
                    new_content.append(dict(b, text=before))
                if after:
                    new_content.append({'type': 'verse', 'number': '78-80', 'text': after})
            else:
                new_content.append(b)
            i += 1
            continue

        new_content.append(b)
        i += 1

    return dict(ch, content=new_content)


def fix_ch11(ch: dict) -> dict:
    new_content = []
    for b in ch['content']:
        if b.get('type') == 'verse' and b.get('number') == '1-3':
            text = b['text']
            # Remove the cross-reference parenthetical
            text = re.sub(r'\s*\(см\. 17 главу сутрастханы\)', '', text)
            new_content.append(dict(b, text=text.strip()))
        else:
            new_content.append(b)
    return dict(ch, content=new_content)


def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup5'

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
    chapters[10] = fix_ch10(chapters[10]);  print('✓ Ch10 Джвара чикитса')
    chapters[11] = fix_ch11(chapters[11]);  print('✓ Ch11 Ватавьядхи чикитса')

    data = dict(data, chapters=chapters)

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
