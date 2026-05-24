#!/usr/bin/env python3
"""
fix_remedies.py — remove OCR duplicate title fragments from remedies.js content fields.

The file was OCR-scanned from a book where chapter titles sometimes spanned two lines.
This caused two systematic artifacts in every entry:

  1. LEADING fragment: the content field starts with the entry's name (or the
     second half of it, if the name was split across two OCR lines) followed by \n.

  2. TRAILING fragment: the content field ends with the first line of the NEXT
     entry's name (the fragment that OCR put at the end of the current page/entry).

Rules applied:
  - Leading match: try full name, then each suffix (drop first 1, 2, … words).
    Single-word suffix matches are skipped (too risky for false positives) unless
    the full name itself is a single word.
  - Trailing match: try each prefix of the next entry's name (first 1, 2, … words)
    against the last non-empty line of content.
    Single-word prefix matches are skipped unless next name is single-word.

Usage:
  python fix_remedies.py            → dry-run: show detected changes only
  python fix_remedies.py --apply    → apply changes and write file
"""

import re
import sys

INPUT  = '/Users/maksutovdesign/Desktop/Github/aurveda/remedies.js'
BACKUP = '/Users/maksutovdesign/Desktop/Github/aurveda/remedies.js.backup1'


def find_entries(text):
    """Parse every {name, content_start, content_end} from the JS file."""
    entries = []
    name_re = re.compile(r'^\s*name:\s*"([^"]+)"', re.MULTILINE)
    pos = 0
    while True:
        m = name_re.search(text, pos)
        if not m:
            break
        name = m.group(1)

        # Find the opening backtick of the content field
        bt_open = text.find('content: `', m.end())
        if bt_open < 0:
            break
        cs = bt_open + len('content: `')

        # Find the matching closing backtick
        ce = text.find('`', cs)
        if ce < 0:
            break

        entries.append({'name': name, 'cs': cs, 'ce': ce})
        pos = ce + 1

    return entries


def _norm(s):
    """Normalise ё→е for comparison (common OCR/typing variant)."""
    return s.replace('ё', 'е').replace('Ё', 'Е')


def strip_leading_name(name, content):
    """
    Remove the entry name (or a multi-word suffix of it) from the start of content.

    Handles:
    - ё/е variants in both name and content
    - Trailing page-number digits or punctuation on the first line
      (e.g. "Дерматофитоз26", "Ожирение (тучность)")

    Returns (new_content, stripped_first_line | None).
    """
    newline_pos = content.find('\n')
    if newline_pos < 0:
        return content, None   # single-line content, skip
    first_line = content[:newline_pos]
    rest       = content[newline_pos + 1:]

    name_norm  = _norm(name)
    first_norm = _norm(first_line)

    words = name_norm.split(' ')
    n = len(words)

    for start_idx in range(n):
        fragment   = ' '.join(words[start_idx:])
        word_count = n - start_idx
        # Skip single-word suffix matches (only if it's NOT the full name)
        if word_count == 1 and start_idx > 0:
            continue
        if not first_norm.startswith(fragment):
            continue
        # Make sure the char right after the fragment is NOT a plain letter
        # (avoids false positives like "ОжирениеМетод" matching "Ожирение")
        tail = first_norm[len(fragment):]
        if tail and tail[0].isalpha():
            continue
        return rest, first_line   # strip the entire first line
    return content, None


def strip_trailing_next_name(next_name, content):
    """
    Remove any prefix of next_name from the end of content.
    Returns (new_content, stripped_fragment | None).
    """
    if not next_name:
        return content, None

    words = next_name.split(' ')
    n = len(words)

    # Get the last non-empty line
    content_stripped = content.rstrip('\n ')
    if not content_stripped:
        return content, None
    lines = content_stripped.split('\n')
    last_line = lines[-1]

    for end_idx in range(n, 0, -1):
        fragment = ' '.join(words[:end_idx])
        # Skip single-word prefix of multi-word name (too risky)
        if end_idx == 1 and n > 1:
            continue
        if last_line == fragment:
            new_content = '\n'.join(lines[:-1]).rstrip('\n')
            return new_content, fragment

    return content, None


def main():
    dry_run = '--apply' not in sys.argv

    print(f'Reading {INPUT}…')
    with open(INPUT, 'r', encoding='utf-8') as f:
        text = f.read()

    entries = find_entries(text)
    print(f'Parsed {len(entries)} entries.\n')

    changes = []
    no_lead_fix = []  # entries where no leading fragment was found

    for i, entry in enumerate(entries):
        name   = entry['name']
        cs, ce = entry['cs'], entry['ce']
        next_name = entries[i + 1]['name'] if i + 1 < len(entries) else None
        content = text[cs:ce]

        fixed, lead  = strip_leading_name(name, content)
        fixed, trail = strip_trailing_next_name(next_name, fixed)

        if lead is None:
            no_lead_fix.append(name)

        if fixed != content:
            changes.append({
                'start': cs, 'end': ce,
                'new'  : fixed,
                'name' : name,
                'lead' : lead,
                'trail': trail,
            })

    print(f'=== ENTRIES WITH NO LEADING FRAGMENT DETECTED ({len(no_lead_fix)}) ===')
    for n in no_lead_fix:
        print(f'  "{n}"')

    print(f'\n=== CHANGES TO APPLY ({len(changes)}) ===')
    for ch in changes:
        print(f'\n  [{ch["name"]}]')
        if ch['lead']:
            print(f'    STRIP LEAD : {repr(ch["lead"])}')
        if ch['trail']:
            print(f'    STRIP TRAIL: {repr(ch["trail"])}')

    if dry_run:
        print('\nDry-run — pass --apply to write changes.')
        return

    # Apply changes in reverse order to preserve byte positions
    result = text
    for ch in reversed(changes):
        result = result[:ch['start']] + ch['new'] + result[ch['end']:]

    with open(BACKUP, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'\nBacked up to {BACKUP}')

    with open(INPUT, 'w', encoding='utf-8') as f:
        f.write(result)
    print(f'Written {INPUT}')
    print('Done!')


if __name__ == '__main__':
    main()
