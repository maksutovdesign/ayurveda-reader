#!/usr/bin/env python3
"""
fix_data7_stubs.py — insert stub (untranslated) chapter placeholders into data.js
so the full Ashtanga Hridayam structure is visible in the sidebar.
Stubs have available=False and empty content.
Chapters within each sthana are sorted by number after insertion.
"""

import json

PREFIX = 'export const BOOK_DATA = '
SUFFIX = ';'

# Canonical missing chapters per sthana
STUBS = {
    'Сутрастхана': [
        (6,  'Виды пищи',                      'Аннасварупа виджнания'),
        (7,  'Правила питания',                 'Аннапана видхи'),
        (10, 'Вкусы',                           'Расабхедия'),
        (11, 'Виды дош',                        'Дошабхедия'),
    ],
    'Шарирастхана': [
        (1, 'Зарождение тела',                  'Шарира прасава'),
        (2, 'Эмбриология',                      'Гарбхавакранти'),
        (3, 'Анатомия',                         'Ангавибхага'),
        (4, 'Точки марм',                       'Марма вибхага'),
        (6, 'Субстанции тела',                  'Дравадравья'),
    ],
    'Нидана стхана': [
        (3, 'Диагностика кровотечений',         'Асригдара нидана'),
        (4, 'Диагностика отёков',               'Шопха нидана'),
        (5, 'Диагностика нарушений пищеварения','Грахани нидана'),
        (6, 'Диагностика малокровия',           'Панду нидана'),
        (7, 'Диагностика геморроя',             'Аршас нидана'),
        (8, 'Диагностика диареи',               'Атисара нидана'),
    ],
    'Чикитса стхана': [
        (2,  'Лечение кровотечений',            'Ракта-питта чикитса'),
        (4,  'Лечение астмы',                   'Швасa чикитса'),
        (5,  'Лечение икоты и одышки',          'Хикка чикитса'),
        (6,  'Лечение туберкулёза',             'Кшая чикитса'),
        (22, 'Лечение подагры',                 'Ватасонита чикитса'),
    ],
    'Калпасиддхистхана': [
        (1, 'Рвотная терапия',                  'Вамана калпа'),
        (2, 'Слабительная терапия',             'Виречана калпа'),
        (3, 'Клизменная терапия',               'Васти калпа'),
        (4, 'Назальная терапия',                'Насья калпа'),
        (5, 'Окуривание',                       'Дхумапана калпа'),
    ],
    'Уттара стхана': [
        (1, 'Лечение психических расстройств',  'Унмада чикитса'),
        (3, 'Лечение ран',                      'Врана пратишедха'),
    ],
}


def main():
    input_path  = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js'
    backup_path = '/Users/maksutovdesign/Desktop/Github/aurveda/data.js.backup8'

    print('Reading data.js…')
    with open(input_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    assert raw.startswith(PREFIX)
    assert raw.endswith(SUFFIX)
    data = json.loads(raw[len(PREFIX):-len(SUFFIX)])

    print(f'Backing up to {backup_path}…')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(raw)

    chapters = data['chapters']

    # Collect existing numbers per sthana
    existing = {}
    for ch in chapters:
        s = ch.get('sthana', '')
        if s not in existing:
            existing[s] = set()
        existing[s].add(ch['number'])

    # Build stub objects and add to chapters list
    added = 0
    for sthana, stub_list in STUBS.items():
        present = existing.get(sthana, set())
        for num, title, subtitle in stub_list:
            if num not in present:
                chapters.append({
                    'number':    num,
                    'title':     title,
                    'subtitle':  subtitle,
                    'sthana':    sthana,
                    'available': False,
                    'content':   []
                })
                added += 1
                print(f'  + stub: {sthana} #{num} {title}')

    # Sort chapters within each sthana group (by chapter number)
    sthana_order = data['sthanas']
    ordered = []
    by_sthana = {s: [] for s in sthana_order}
    for ch in chapters:
        s = ch.get('sthana', '')
        if s in by_sthana:
            by_sthana[s].append(ch)
        else:
            # Unknown sthana — keep at end
            ordered.append(ch)

    for s in sthana_order:
        group = sorted(by_sthana[s], key=lambda c: c['number'])
        ordered.extend(group)

    data['chapters'] = ordered

    print(f'\nAdded {added} stub chapters. Total: {len(ordered)}')

    print('Writing data.js…')
    with open(input_path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, ensure_ascii=False) + SUFFIX)

    print('Done!')


if __name__ == '__main__':
    main()
