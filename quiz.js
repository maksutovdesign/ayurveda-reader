// Аюрведический тест определения конституции (пракрити)
// Источник: Васант Лад «Аюрведа: наука самоисцеления»
// 20 вопросов × 3 доши, шкала 0–6

export const QUIZ = {
  "title": "Тест конституции",
  "subtitle": "Определите свою пракрити",
  "description": "Отвечайте, ориентируясь на то, каким вы были большую часть жизни (не на текущее состояние). При сомнении выбирайте средний балл.",
  "scale": [
    {
      "value": 0,
      "label": "Совсем не про меня",
      "label_en": "Not at all like me"
    },
    {
      "value": 1,
      "label": "Редко",
      "label_en": "Rarely"
    },
    {
      "value": 2,
      "label": "Иногда",
      "label_en": "Sometimes"
    },
    {
      "value": 3,
      "label": "Нейтрально",
      "label_en": "Neutral"
    },
    {
      "value": 4,
      "label": "Довольно часто",
      "label_en": "Fairly often"
    },
    {
      "value": 5,
      "label": "Часто",
      "label_en": "Often"
    },
    {
      "value": 6,
      "label": "Практически всегда",
      "label_en": "Almost always"
    }
  ],
  "sections": [
    {
      "dosha": "vata",
      "label": "Вата",
      "color": "#7B8EC8",
      "emoji": "🌬️",
      "questions": [
        "По природе я очень активен, обычно делаю дела быстро",
        "Я выучиваю быстро и забываю быстро",
        "Как правило, я нахожусь в энтузиазме и оживлении",
        "У меня худощавое телосложение",
        "Я не набираю вес легко",
        "Я хожу быстро и легко",
        "Я склонен с трудом принимать решения",
        "У меня часто бывает запор",
        "У меня есть склонность к тому, что мои руки и ноги холодны",
        "Я часто тревожусь и нервничаю",
        "Холодная погода беспокоит меня в большей степени, чем большинство людей",
        "Я говорю быстро и я разговорчив",
        "По природе я эмоционален, и моё настроение часто меняется",
        "Часто мой сон бывает беспокойным и нарушенным",
        "Моя кожа сухая, особенно зимой",
        "У меня активный, неустойчивый ум, богатый воображением",
        "Энергия приходит ко мне приливами",
        "У меня есть склонность быстро тратить или расходовать всю энергию или деньги, которые у меня есть",
        "Мои привычки к еде и ко сну имеют склонность быть нерегулярными",
        "У меня переменный аппетит"
      ],
      "label_en": "Vata",
      "questions_en": [
        "By nature I am very active; I usually do things quickly",
        "I learn quickly and forget quickly",
        "I am generally enthusiastic and lively",
        "I have a thin, lean body build",
        "I do not gain weight easily",
        "I walk quickly and lightly",
        "I tend to have difficulty making decisions",
        "I frequently suffer from constipation",
        "My hands and feet tend to be cold",
        "I frequently feel anxious and nervous",
        "Cold weather bothers me more than it bothers most people",
        "I speak quickly and I am talkative",
        "By nature I am emotional, and my mood changes frequently",
        "My sleep is often restless and disturbed",
        "My skin is dry, especially in winter",
        "I have an active, unsteady mind, rich in imagination",
        "Energy comes to me in bursts",
        "I tend to quickly spend or use up all the energy or money I have",
        "My eating and sleeping habits tend to be irregular",
        "I have a variable appetite"
      ]
    },
    {
      "dosha": "pitta",
      "label": "Питта",
      "color": "#E07B54",
      "emoji": "🔥",
      "questions": [
        "Обычно я действую умело",
        "У меня склонность быть крайне точным и аккуратным",
        "Я энергичен, у меня сильная и убедительная манера поведения",
        "Я чувствую дискомфорт или легко утомляюсь в жаркую погоду",
        "Я легко потею",
        "Даже хотя я могу не всегда показывать это, я довольно легко становлюсь раздражительным и злым",
        "Если я пропускаю приём пищи или с едой случаются задержки, то от этого я испытываю дискомфорт",
        "Один или несколько следующих качеств характеризуют мои волосы: раннее поседение или облысение, редкие, тонкие, прямые волосы, белокурые, рыжие или рыжеватые волосы",
        "У меня сильный аппетит",
        "Я люблю ставить перед собой цели и затем пытаться достичь их",
        "У меня очень регулярно происходит опорожнение кишечника; для меня более типично, что опорожнение происходит свободно, чем то, что бывает запор",
        "Я очень легко становлюсь нетерпеливым",
        "Я склонен всё в деталях доводить до совершенства",
        "Меня довольно легко разозлить, но потом я быстро забываю об этом",
        "Я очень люблю холодную пищу типа мороженого и также холодные напитки",
        "Я с большей вероятностью почувствую то, что комната слишком жаркая, чем то, что комната слишком холодная",
        "Я не выношу очень горячей или очень пряной пищи",
        "Я не так терпелив к возражениям, как мне следовало бы",
        "Мне нравятся сложные задачи, бросающие мне вызов; когда я хочу чего-либо, я очень решителен в своих усилиях достичь этого",
        "Я склонен быть критичным по отношению и к другим, и к себе"
      ],
      "label_en": "Pitta",
      "questions_en": [
        "I usually act skillfully and efficiently",
        "I tend to be extremely precise and neat",
        "I am energetic, with a strong and persuasive manner",
        "I feel uncomfortable or tire easily in hot weather",
        "I sweat easily",
        "Even though I may not always show it, I become irritable and angry fairly easily",
        "If I skip a meal or a meal is delayed, I feel uncomfortable",
        "One or more of the following describe my hair: early graying or balding, thin, fine, straight hair, blond, red, or reddish hair",
        "I have a strong appetite",
        "I like to set goals for myself and then try to achieve them",
        "My bowel movements are very regular; loose stools are more typical for me than constipation",
        "I become impatient very easily",
        "I tend to bring everything to perfection in every detail",
        "I am fairly easily angered, but I quickly forget about it afterward",
        "I love cold foods such as ice cream, as well as cold drinks",
        "I am more likely to feel a room is too hot than too cold",
        "I cannot tolerate very hot or very spicy food",
        "I am not as patient with objections as I should be",
        "I enjoy challenging tasks that push me; when I want something, I am very determined in my efforts to achieve it",
        "I tend to be critical of both others and myself"
      ]
    },
    {
      "dosha": "kapha",
      "label": "Капха",
      "color": "#5B9E82",
      "emoji": "🌊",
      "questions": [
        "Я занимаюсь делами в медленной, расслабленной манере",
        "Я легко набираю вес и медленно теряю",
        "По природе я молчалив и говорю только по необходимости",
        "Я могу легко пропустить приём пищи без значительных неудобств",
        "У меня есть склонность к избытку слизи и мокроты, хронической закупорке, астме и проблемам с носовыми пазухами",
        "Мне нужно не менее восьми часов сна для того, чтобы на следующий день чувствовать себя хорошо",
        "Я сплю очень глубоко",
        "По природе я мирный; меня не легко рассердить",
        "Я не заучиваю так быстро, как некоторые, но зато имею превосходную способность хранить в памяти; у меня долгая память",
        "Я ем медленно",
        "Холод и сырость беспокоят меня",
        "Мои волосы толстые, тёмные и волнистые",
        "У меня гладкая, мягкая, слегка бледная кожа",
        "У меня большое, солидное телосложение",
        "По природе я спокойный, мирный",
        "У меня слабое пищеварение, из-за которого после еды я ощущаю тяжесть",
        "У меня очень хорошая выдержка, стойкость и физическая выносливость, а также стабильный уровень энергии",
        "Как правило, у меня медленная, размеренная походка",
        "Я обычно чувствую себя после сна вялым и, как правило, медленно расхожусь с утра",
        "Обычно я выполняю дела медленно и методично"
      ],
      "label_en": "Kapha",
      "questions_en": [
        "I go about things in a slow, relaxed manner",
        "I gain weight easily and lose it slowly",
        "By nature I am quiet and speak only when necessary",
        "I can easily skip a meal without much discomfort",
        "I tend to have excess mucus and phlegm, chronic congestion, asthma, or sinus problems",
        "I need at least eight hours of sleep to feel well the next day",
        "I sleep very deeply",
        "By nature I am peaceful; I am not easily angered",
        "I don't learn as quickly as some, but I have an excellent ability to retain what I learn; I have a long memory",
        "I eat slowly",
        "Cold and dampness bother me",
        "My hair is thick, dark, and wavy",
        "My skin is smooth, soft, and slightly pale",
        "I have a large, solid body build",
        "By nature I am calm and peaceful",
        "I have weak digestion, which makes me feel heavy after eating",
        "I have very good stamina, endurance, and physical resilience, as well as a steady energy level",
        "I generally have a slow, measured walk",
        "I usually feel sluggish after sleep and generally take a while to get going in the morning",
        "I usually do things slowly and methodically"
      ]
    }
  ],
  "results": {
    "vata": {
      "title": "Вата-пракрити",
      "subtitle": "Принцип Воздуха и Эфира",
      "emoji": "🌬️",
      "color": "#7B8EC8",
      "traits": "Вы от природы подвижны, быстры, творческий и восторженный. Вата-тип легко учится и легко забывает, очень общителен, но склонен к нерегулярности.",
      "balance": "В балансе: живость, энтузиазм, гибкость ума, творчество.",
      "imbalance": "При дисбалансе: тревога, бессонница, запоры, сухость кожи, непостоянство.",
      "recommendations": [
        "Регулярный распорядок дня — главное лекарство для Ваты",
        "Тёплое, питательное, маслянистое питание: каши, супы, гхи",
        "Абхьянга (самомассаж кунжутным маслом) каждое утро",
        "Мягкие практики: йога, тай-чи, прогулки — без резких нагрузок",
        "Избегать холода, сквозняков и нерегулярного сна",
        "Медитация и дыхание (нади шодхана) — для успокоения ума"
      ],
      "title_en": "Vata Prakriti",
      "subtitle_en": "The Principle of Air and Ether",
      "traits_en": "You are naturally mobile, quick, creative, and enthusiastic. The Vata type learns easily and forgets easily, is very sociable, but prone to irregularity.",
      "balance_en": "In balance: liveliness, enthusiasm, mental flexibility, creativity.",
      "imbalance_en": "Out of balance: anxiety, insomnia, constipation, dry skin, inconsistency.",
      "recommendations_en": [
        "A regular daily routine is Vata's main medicine",
        "Warm, nourishing, oily food: porridges, soups, ghee",
        "Abhyanga (self-massage with sesame oil) every morning",
        "Gentle practices: yoga, tai chi, walks — no intense exertion",
        "Avoid cold, drafts, and irregular sleep",
        "Meditation and breathwork (nadi shodhana) to calm the mind"
      ]
    },
    "pitta": {
      "title": "Питта-пракрити",
      "subtitle": "Принцип Огня и Воды",
      "emoji": "🔥",
      "color": "#E07B54",
      "traits": "Вы целеустремлённы, интеллектуальны, точны. Питта-тип — прирождённый лидер с сильным пищеварением и ясным умом.",
      "balance": "В балансе: решительность, интеллект, харизма, страсть к делу.",
      "imbalance": "При дисбалансе: раздражительность, воспаления, изжога, кожные проблемы, перфекционизм.",
      "recommendations": [
        "Охлаждающее питание: кокос, мята, кориандр, огурцы, молочные продукты",
        "Избегать острого, жареного, алкоголя и пропуска приёма пищи",
        "Спорт в прохладное время суток — не в полдень",
        "Широдхара (масло на лоб) и кокосовое масло для кожи",
        "Практики сострадания и принятия — работа с гневом",
        "Медитация любящей доброты (метта) — охлаждает огонь Питты"
      ],
      "title_en": "Pitta Prakriti",
      "subtitle_en": "The Principle of Fire and Water",
      "traits_en": "You are purposeful, intellectual, and precise. The Pitta type is a natural leader with strong digestion and a clear mind.",
      "balance_en": "In balance: determination, intelligence, charisma, passion for one's work.",
      "imbalance_en": "Out of balance: irritability, inflammation, heartburn, skin problems, perfectionism.",
      "recommendations_en": [
        "Cooling foods: coconut, mint, coriander, cucumbers, dairy",
        "Avoid spicy, fried food, alcohol, and skipping meals",
        "Exercise during the cooler part of the day — not at midday",
        "Shirodhara (oil on the forehead) and coconut oil for the skin",
        "Practices of compassion and acceptance — working with anger",
        "Loving-kindness (metta) meditation to cool Pitta's fire"
      ]
    },
    "kapha": {
      "title": "Капха-пракрити",
      "subtitle": "Принцип Воды и Земли",
      "emoji": "🌊",
      "color": "#5B9E82",
      "traits": "Вы стабильны, терпеливы, верны и выносливы. Капха-тип — любящий, надёжный, с хорошей памятью и крепким здоровьем.",
      "balance": "В балансе: стабильность, преданность, терпение, сострадание, физическая сила.",
      "imbalance": "При дисбалансе: лишний вес, застои, синусит, апатия, привязанность, депрессия.",
      "recommendations": [
        "Активные упражнения каждый день — Капхе нужно движение",
        "Лёгкое, тёплое, острое питание: имбирь, перец, горчица, мёд",
        "Ранний подъём — до 6 утра, до рассвета; не спать после восхода",
        "Сухой массаж (удвартана) стимулирует лимфу и обмен веществ",
        "Новые впечатления и смена обстановки выводят из застоя",
        "Трифала и мёд с тёплой водой утром для детоксикации"
      ],
      "title_en": "Kapha Prakriti",
      "subtitle_en": "The Principle of Water and Earth",
      "traits_en": "You are stable, patient, loyal, and enduring. The Kapha type is loving, dependable, with a good memory and robust health.",
      "balance_en": "In balance: stability, devotion, patience, compassion, physical strength.",
      "imbalance_en": "Out of balance: excess weight, stagnation, sinus congestion, apathy, attachment, depression.",
      "recommendations_en": [
        "Active exercise every day — Kapha needs movement",
        "Light, warm, spicy food: ginger, pepper, mustard, honey",
        "Rise early — before 6 a.m., before sunrise; don't sleep after sunrise",
        "Dry brush massage (udvartana) stimulates lymph and metabolism",
        "New impressions and a change of scenery help break stagnation",
        "Triphala and honey in warm water in the morning for detox"
      ]
    },
    "mixed": {
      "vata_pitta": {
        "title": "Вата-Питта",
        "subtitle": "Двойная конституция",
        "title_en": "Vata-Pitta",
        "subtitle_en": "Dual constitution"
      },
      "vata_kapha": {
        "title": "Вата-Капха",
        "subtitle": "Двойная конституция",
        "title_en": "Vata-Kapha",
        "subtitle_en": "Dual constitution"
      },
      "pitta_kapha": {
        "title": "Питта-Капха",
        "subtitle": "Двойная конституция",
        "title_en": "Pitta-Kapha",
        "subtitle_en": "Dual constitution"
      },
      "sama": {
        "title": "Сама-пракрити",
        "subtitle": "Равновесная конституция — редкость",
        "title_en": "Sama Prakriti",
        "subtitle_en": "A balanced constitution — a rarity"
      }
    }
  },
  "title_en": "Constitution Test",
  "subtitle_en": "Determine Your Prakriti",
  "description_en": "Answer based on how you have been for most of your life (not your current state). When in doubt, choose the middle score."
};
