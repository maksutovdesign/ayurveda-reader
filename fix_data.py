#!/usr/bin/env python3
"""
Fix data quality issues in data.js:
1. COLON_START:   comment text starts with ": " → strip, capitalize
2. EMPTY_COMMENT: comment text is "." or blank  → delete block
3. EMBEDDED_VERSE: "N-M. Text" or "N. Text" inside block → split into proper verse blocks
4. Випассана: verse texts "Title Body..." → separate title as heading block
"""

import json
import re

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

# ── Embedded verse regex ──────────────────────────────────────────────────────
# Range pattern (e.g. 27-28. Человек): NOT preceded by digit or dot
RANGE_PAT = r'(?<![\d.])(\d{1,3}[-–]\d{1,3})\.\s+(?=[А-ЯЁ])'
# Single number (e.g. 26. Особое): preceded by Cyrillic/paren + ". " (sentence end)
SINGLE_PAT = r'(?<=[а-яёА-ЯЁ)]\. )(\d{1,3})\.\s+(?=[А-ЯЁ])'
EMBEDDED_RE = re.compile(f'{RANGE_PAT}|{SINGLE_PAT}')


def fix_colon_start(text: str) -> str:
    text = text.strip()
    if text.startswith(': '):
        text = text[2:]
    if text:
        text = text[0].upper() + text[1:]
    return text


def is_empty_comment(text: str) -> bool:
    return text.strip() in ('.', '', '…', '...')


def split_on_embedded(text: str):
    """
    Returns list of (part_text, is_verse, verse_number) tuples.
    Iterates until no more embedded verse patterns remain.
    """
    parts = []
    remaining = text

    while True:
        m = EMBEDDED_RE.search(remaining)
        if not m:
            if remaining.strip():
                parts.append((remaining.strip(), False, None))
            break

        verse_num = m.group(1) or m.group(2)
        before = remaining[:m.start()].strip()
        after = remaining[m.end():]

        if before:
            parts.append((before, False, None))

        # Find where this verse text ends (next embedded verse or EOF)
        m2 = EMBEDDED_RE.search(after)
        if m2:
            verse_text = after[:m2.start()].strip()
            parts.append((verse_text, True, verse_num))
            remaining = after[m2.start():]
        else:
            parts.append((after.strip(), True, verse_num))
            remaining = ''
            break

    return parts


def process_chapter(chapter: dict) -> dict:
    old_content = chapter['content']
    new_content = []
    stats = {'colon': 0, 'empty': 0, 'verse_split': 0}

    for block in old_content:
        btype = block.get('type', '')
        text = block.get('text', '')

        # Fix EMPTY_COMMENT
        if btype == 'comment' and is_empty_comment(text):
            stats['empty'] += 1
            continue

        # Fix COLON_START
        if btype == 'comment' and text.lstrip().startswith(': '):
            block = dict(block)
            block['text'] = fix_colon_start(text)
            text = block['text']
            stats['colon'] += 1

        # Fix EMBEDDED_VERSE
        if EMBEDDED_RE.search(text):
            parts = split_on_embedded(text)
            if any(p[1] for p in parts):   # at least one verse extracted
                for part_text, is_verse, verse_num in parts:
                    if not part_text:
                        continue
                    if is_verse:
                        new_content.append({
                            'type': 'verse',
                            'number': verse_num,
                            'text': part_text,
                        })
                        stats['verse_split'] += 1
                    else:
                        nb = dict(block)
                        nb['text'] = part_text
                        new_content.append(nb)
                continue

        new_content.append(block)

    chapter = dict(chapter)
    chapter['content'] = new_content
    return chapter, stats


# ── Випассана special fixes ───────────────────────────────────────────────────

# Pattern: verse text starts with a hyphenated title word then body
# e.g. "Болезни-учителя Эти болезни возникают..."
POEM_TITLE_RE = re.compile(r'^([А-ЯЁ][а-яё]+-[а-яёА-ЯЁ]+)\s+([А-ЯЁ].{10,})')

# Headings embedded in the giant text block.
# Each entry is (pattern, display_text) — pattern can use \s+ for variable whitespace.
VIPASSANA_HEADING_PATS = [
    (r'Астрология и аюрведа',                                              'Астрология и аюрведа'),
    (r'Спасительные травы',                                                'Спасительные травы'),
    (r'Влияние камней',                                                    'Влияние камней'),
    (r'Болезни-друзья и болезни-враги',                                    'Болезни-друзья и болезни-враги'),
    (r'Аюрведический подход к механизмам развития\s+хронических заболеваний',
     'Аюрведический подход к механизмам развития хронических заболеваний'),
]


def fix_vipassana(chapter: dict) -> dict:
    new_content = []
    old_content = chapter['content']

    for bi, block in enumerate(old_content):
        btype = block.get('type', '')
        text = block.get('text', '')

        # Fix verse blocks with embedded poem title
        if btype == 'verse':
            m = POEM_TITLE_RE.match(text)
            if m:
                title = m.group(1)
                body = m.group(2).strip()
                new_content.append({'type': 'text', 'text': title})
                new_block = dict(block)
                new_block['text'] = body
                new_content.append(new_block)
                continue

        # Fix text block(s) that have embedded headings
        if btype == 'text':
            # Try to split at known heading positions
            segments = _split_vipassana_headings(text)
            if len(segments) > 1:
                new_content.extend(segments)
                continue

        new_content.append(block)

    chapter = dict(chapter)
    chapter['content'] = new_content
    return chapter


def _split_vipassana_headings(text: str):
    """Split a text block at known Випассана section heading positions."""
    # Build combined pattern with capture groups so we know which match fired
    group_labels = []
    patterns = []
    for pat, label in VIPASSANA_HEADING_PATS:
        group_labels.append(label)
        patterns.append(f'({pat})')
    heading_re = re.compile('|'.join(patterns))

    parts = heading_re.split(text)
    if len(parts) <= 1:
        return [{'type': 'text', 'text': text}]

    # heading_re.split returns: [non-match, g1, g2, ..., gN, non-match, g1, ...]
    # Each captured group is either the matched text or None
    n_groups = len(group_labels)
    result = []
    i = 0
    while i < len(parts):
        # First item is always a non-capturing segment
        seg = parts[i].strip()
        if seg:
            result.append({'type': 'text', 'text': seg})
        i += 1
        # Next n_groups items are capture groups (only one will be non-None per match)
        if i < len(parts):
            for gi in range(n_groups):
                if i + gi < len(parts) and parts[i + gi] is not None:
                    result.append({'type': 'text', 'text': group_labels[gi]})
                    break
            i += n_groups

    return result if len(result) > 1 else [{'type': 'text', 'text': text}]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup2'

    print('Reading data.js …')
    with open(input_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    assert raw.startswith(PREFIX), 'Unexpected prefix'
    assert raw.endswith(SUFFIX),   'Unexpected suffix'
    json_str = raw[len(PREFIX):-len(SUFFIX)]

    print('Parsing JSON …')
    data = json.loads(json_str)

    print(f'Backing up to {backup_path} …')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(raw)

    totals = {'colon': 0, 'empty': 0, 'verse_split': 0}
    new_chapters = []

    for ci, chapter in enumerate(data['chapters']):
        sthana = chapter.get('sthana', '')
        is_vip = sthana == 'Випассана' or 'Випасса' in chapter.get('title', '')

        chapter, stats = process_chapter(chapter)
        totals['colon']      += stats['colon']
        totals['empty']      += stats['empty']
        totals['verse_split'] += stats['verse_split']

        if any(v for v in stats.values()):
            title_short = chapter.get('title', '')[:40]
            print(f"  Ch{chapter.get('number', ci)}: {title_short} "
                  f"→ colon={stats['colon']}, empty={stats['empty']}, "
                  f"verse_split={stats['verse_split']}")

        # Apply Випассана special fixes after general processing
        if is_vip:
            print(f'  → Applying Випассана special fixes …')
            chapter = fix_vipassana(chapter)

        new_chapters.append(chapter)

    data = dict(data)
    data['chapters'] = new_chapters

    print(f'\nTotals:')
    print(f"  COLON_START:   {totals['colon']}")
    print(f"  EMPTY_COMMENT: {totals['empty']}")
    print(f"  VERSE_SPLIT:   {totals['verse_split']}")

    print('\nSerializing …')
    out = PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX

    print(f'Writing {input_path} …')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(out)

    print('Done!')


if __name__ == '__main__':
    main()
