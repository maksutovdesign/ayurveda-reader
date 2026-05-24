#!/usr/bin/env python3
"""
fix_ch6_and_stubs.py — two fixes in one pass:

1.  CHARAKA Ch6 restructure
    - subtitle: "фрагменты" → "Мармы и типы психики"
    - Delete block [17]: "Великая тайна ума" (big floating text essay)
    - Delete blocks [50-82]: 8 branches, examinations, meditation sections
    - Block [11]: text → comment  (torso-marma floating text)
    - Block [49]: split into
          verse #1  (Vanaspatya 3-item list, ~135 chars)
          comment   "Четыре состояния ума" part A  (mind nature + 4 states)
          comment   "Четыре состояния ума" part B  (saints + turiyatita)
          DELETE    "Разделы аюрведы…" tail

2.  STUB CHAPTER NAMES (Ashtanga Hridayam)
    Active chapters: title = Sanskrit transliteration, subtitle = Russian (lowercase)
    Stub chapters were entered backwards: title = Russian, subtitle = Sanskrit
    → Swap title ↔ subtitle for all stubs, lowercase the new subtitle
"""

import json, re

INPUT  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
BACKUP = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup9'
PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

# ── helpers ────────────────────────────────────────────────────────────────

def load():
    with open(INPUT, 'r', encoding='utf-8') as f:
        raw = f.read()
    assert raw.startswith(PREFIX) and raw.endswith(SUFFIX)
    return raw, json.loads(raw[len(PREFIX):-len(SUFFIX)])

def save(data):
    with open(INPUT, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

# ── FIX 1: Charaka Chapter 6 ───────────────────────────────────────────────

def fix_charaka_ch6(chapters):
    # find Ch6 of Charaka
    idx = next(i for i, c in enumerate(chapters)
               if c.get('sthana') == 'Чарака-самхита' and c['number'] == 6)
    ch = chapters[idx]
    content = ch['content']

    # ── subtitle ──────────────────────────────────────────────────────────
    ch['subtitle'] = 'Мармы и типы психики'
    print(f"  subtitle → {ch['subtitle']!r}")

    # ── identify key block indices ────────────────────────────────────────
    # block [11]: floating text about torso marmans
    assert content[11]['type'] == 'text', f"block 11 type is {content[11]['type']}"
    # block [17]: "Великая тайна ума" essay
    assert 'Великая тайна ума' in content[17]['text'], "block 17 mismatch"
    # block [49]: Vanaspatya mega-block
    b49_text = content[49]['text']
    assert 'Леность, сонливость, инертность' in b49_text, "block 49 mismatch"
    # blocks [50-82] to delete
    assert len(content) == 83, f"expected 83 blocks, got {len(content)}"

    # ── block [11]: text → comment ────────────────────────────────────────
    content[11] = dict(content[11], type='comment')
    print("  block[11]: text → comment")

    # ── block [49]: split ─────────────────────────────────────────────────
    i_chetyre = b49_text.find(' Четыре состояния ума ')  # 135
    i_tolko   = b49_text.find(' Только человек, обладающий саттвическим ')  # 1851
    i_razd    = b49_text.find(' Разделы аюрведы ')  # 2554

    assert i_chetyre > 0 and i_tolko > 0 and i_razd > 0, \
        f"Split points not found: {i_chetyre}, {i_tolko}, {i_razd}"

    # Part A — Vanaspatya 3 characteristics
    vanaspatya_text = b49_text[:i_chetyre].strip()

    # Part B — "Четыре состояния ума", first half (mind + 3 aspects + 4 states listed)
    four_states_A = (
        'Четыре состояния ума\n\n' +
        b49_text[i_chetyre + len(' Четыре состояния ума '):i_tolko].strip()
    )

    # Part C — second half (saints, turiyatita)
    four_states_B = b49_text[i_tolko:i_razd].strip()

    block_vanaspatya = {'type': 'verse', 'number': '1', 'text': vanaspatya_text}
    block_4states_a  = {'type': 'comment', 'text': four_states_A}
    block_4states_b  = {'type': 'comment', 'text': four_states_B}

    print(f"  block[49] split:")
    print(f"    Vanaspatya verse: {len(vanaspatya_text)} chars")
    print(f"    4-states A:       {len(four_states_A)} chars")
    print(f"    4-states B:       {len(four_states_B)} chars")
    print(f"    Razdelу tail:     {len(b49_text) - i_razd} chars → DELETED")

    # Rebuild content:
    # keep [0..48], replace [49], delete [17] and [50..82]
    new_content = (
        content[0:11] +          # [00-10] original
        [content[11]] +          # [11] now comment
        content[12:17] +         # [12-16] marman verses
        # [17] DELETED (Великая тайна ума)
        content[18:49] +         # [18-48] 16 types
        [block_vanaspatya,       # new [49] Vanaspatya verse
         block_4states_a,        # new [50] comment A
         block_4states_b]        # new [51] comment B
        # [50-82] DELETED (branches, exams, meditation)
    )

    ch['content'] = new_content
    chapters[idx] = ch
    print(f"  Total blocks: 83 → {len(new_content)}")
    return chapters

# ── FIX 2: Stub chapter names ──────────────────────────────────────────────

def fix_stub_names(chapters):
    """
    Active:  title=Sanskrit, subtitle=Russian-lowercase
    Stub:    title=Russian,  subtitle=Sanskrit   ← WRONG, fix by swapping
    """
    count = 0
    for ch in chapters:
        if ch.get('available') is not False:
            continue   # only stubs
        old_title    = ch['title']
        old_subtitle = ch.get('subtitle', '')
        if not old_subtitle:
            print(f"  WARNING: stub #{ch['number']} {ch['sthana']!r} has no subtitle — skipped")
            continue
        # swap: new title = old Sanskrit subtitle, new subtitle = Russian lowercase
        ch['title']    = old_subtitle
        ch['subtitle'] = old_title.lower()
        count += 1
        print(f"  stub [{ch['sthana']}] #{ch['number']}: "
              f"title={ch['title']!r}  sub={ch['subtitle']!r}")
    print(f"  Total stubs fixed: {count}")
    return chapters

# ── main ───────────────────────────────────────────────────────────────────

def main():
    raw, data = load()

    # backup
    with open(BACKUP, 'w', encoding='utf-8') as f:
        f.write(raw)
    print(f"Backed up → {BACKUP}\n")

    print("=== FIX 1: Charaka Ch6 ===")
    data['chapters'] = fix_charaka_ch6(data['chapters'])

    print("\n=== FIX 2: Stub chapter names ===")
    data['chapters'] = fix_stub_names(data['chapters'])

    save(data)
    print("\nDone — written to data.js")

if __name__ == '__main__':
    main()
