#!/usr/bin/env python3
"""
fix_data6.py — remove broken cross-references from data.js

Rules:
- Remove "(см. X главу Y)" where chapter X doesn't exist in data.
- Keep "(см. X главу Y)" where chapter X DOES exist (don't remove valid refs).
- Special case: "(см. 15 главу сутрастханы, назначить теплую воду)"
  → replace with just "назначить теплую воду" since the instruction is real.
- "(см. 21 главу чикитсастханы Аштангасанграхи)" → remove (different text entirely).
- "(см. следующую главу)" → remove.
- "см. 10 главу сутрастханы" (without parens, inline) → remove.
"""

import json
import re

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'


def chapter_exists(data, sthana_key: str, num: int) -> bool:
    """Check if a chapter with the given number exists in the given sthana."""
    STHANA_MAP = {
        'сутрастхана':       'Сутрастхана',
        'ниданастхана':      'Нидана стхана',
        'нидана':            'Нидана стхана',
        'чикитсастхана':     'Чикитса стхана',
        'чикитса':           'Чикитса стхана',
        'шарирастхана':      'Шарирастхана',
        'уттарастхана':      'Уттара стхана',
        'уттара':            'Уттара стхана',
        'калпастхана':       'Калпасиддхистхана',
    }
    sthana = STHANA_MAP.get(sthana_key.lower())
    if not sthana:
        return False
    return any(ch.get('sthana') == sthana and ch['number'] == num
               for ch in data['chapters'])


def clean_refs(text: str, data: dict) -> str:
    original = text

    # Special: keep actual instruction hidden inside a bogus ref
    # "(см. 15 главу сутрастханы, назначить теплую воду)"
    text = re.sub(
        r'\(см\.\s*15\s+главу\s+сутрастханы,?\s+(назначить теплую воду)\)',
        r'\1',
        text
    )

    # Remove Аштангасанграха refs entirely (different text)
    text = re.sub(r'\s*\(см\.\s*\d+\s+главу\s+чикитсастханы\s+Аштангасанграхи\)', '', text)

    # "(см. следующую главу)"
    text = re.sub(r'\s*\(см\.\s*следующую\s+главу\)', '', text)

    # Generic "(см. N главу STHANA)" patterns
    def maybe_remove_ref(m):
        num_str = m.group(1)
        sthana_key = m.group(2).strip().lower()
        try:
            num = int(num_str)
        except ValueError:
            return ''
        if chapter_exists(data, sthana_key, num):
            return m.group(0)   # keep — chapter exists
        return ''               # remove — chapter missing

    # "(см. N главу сутрастханы)" and "(см. главу N сутрастханы)"
    text = re.sub(
        r'\s*\(см\.\s*(?:главу\s+)?(\d+)(?:/\d+)?\s+глав[уы]\s+([а-яёА-ЯЁ]+)\)',
        maybe_remove_ref, text
    )
    text = re.sub(
        r'\s*\(см\.\s*(?:\d+[-–]\d+\s+стихи?\s+)?\d+\s+глав[ую]\s+([а-яёА-ЯЁ]+)\)',
        lambda m: m.group(0) if chapter_exists(
            data,
            re.search(r'\d+\s+глав[ую]\s+([а-яёА-ЯЁ]+)', m.group(0)).group(1),
            int(re.search(r'(\d+)\s+глав', m.group(0)).group(1))
        ) else '',
        text
    )

    # "(см. 26-28 стихи 16 главы сутрастханы)"
    text = re.sub(
        r'\s*\(см\.\s*\d+[-–]\d+\s+стихи?\s+(\d+)\s+глав[ыу]\s+([а-яёА-ЯЁ]+)\)',
        lambda m: m.group(0) if chapter_exists(data, m.group(2), int(m.group(1))) else '',
        text
    )

    # "(см. 54 стих 2 главы ниданастханы)" — keep if exists
    text = re.sub(
        r'\s*\(см\.\s*\d+\s+стих\s+(\d+)\s+глав[ыу]\s+([а-яёА-ЯЁ]+)\)',
        lambda m: m.group(0) if chapter_exists(data, m.group(2), int(m.group(1))) else '',
        text
    )

    # "см. 10 главу сутрастханы" (without parens, inline in text like "(или ... см. 10 ...)")
    text = re.sub(
        r'\s*\(или\s+[^)]*?см\.\s*\d+\s+глав[ую]\s+[а-яёА-ЯЁ]+[^)]*\)',
        lambda m: re.sub(r'\s*см\.\s*\d+\s+глав[ую]\s+[а-яёА-ЯЁ]+', '', m.group(0)),
        text
    )

    # "(см. главу 21/32)" — Чикитса #21 exists → keep as-is
    # "(см. главу 19/2)" — Чикитса #19 missing → remove
    def maybe_remove_slash_ref(m):
        ch_num = int(m.group(1))
        if chapter_exists(data, 'чикитсастхана', ch_num):
            return m.group(0)
        return ''
    text = re.sub(r'\s*\(см\.\s*главу\s+(\d+)/\d+\)', maybe_remove_slash_ref, text)

    # "(см. 4 главу сутрастханы)" exists → keep (handled already above)
    # "(см. 5 главу)" without sthana — assume чикитса → remove (ch5 missing)
    text = re.sub(r'\s*\(см\.\s*\d+\s+главу\)', '', text)

    # "см. 10" inline without parens
    text = re.sub(r'\s+\(см\.\s+10\s+главу\s+сутрастханы\s+или\s+[^)]+\)', '', text)

    # Clean up any double spaces or spaces before punctuation
    text = re.sub(r'  +', ' ', text)
    text = re.sub(r' ([,;.])', r'\1', text)
    text = text.strip()

    return text


def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup7'

    print('Reading data.js…')
    with open(input_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    assert raw.startswith(PREFIX)
    assert raw.endswith(SUFFIX)
    data = json.loads(raw[len(PREFIX):-len(SUFFIX)])

    print(f'Backing up to {backup_path}…')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(raw)

    total_changed = 0
    for ci, ch in enumerate(data['chapters']):
        for bi, b in enumerate(ch['content']):
            text = b.get('text', '')
            cleaned = clean_refs(text, data)
            if cleaned != text:
                ch['content'][bi] = dict(b, text=cleaned)
                total_changed += 1
                print(f"  Ch{ci}[{bi}] #{b.get('number','-')}: cleaned ref")

    print(f'\nTotal blocks changed: {total_changed}')

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
