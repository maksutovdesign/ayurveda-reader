// ── Ayurvedic Disease Glossary ──────────────────────────────────────────────
// Structured disease entries with name, origin, dosha, description, treatment hint

export const DISEASES = [
  {
    "name": "Джвара",
    "origin": "jvara",
    "category": "Лихорадки",
    "dosha": "Все три доши",
    "desc": "Лихорадка — «царь болезней» в аюрведе; сопровождается жаром тела, ознобом, жжением, тяжестью в голове. Считается нарушением агни, когда огонь покидает желудок и распространяется по всему телу.",
    "treatment": "Лечение зависит от типа и доши: при Вата-джваре — согревающие, при Питта — охлаждающие, при Капха — очищающие средства.",
    "chapters": [
      "Нидана стхана, Гл.2",
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Jvara",
    "category_en": "Fevers",
    "dosha_en": "All three doshas",
    "desc_en": "Fever — the \"king of diseases\" in Ayurveda; accompanied by body heat, chills, burning sensation, and heaviness in the head. Considered a disturbance of agni, in which the digestive fire leaves the stomach and spreads throughout the body.",
    "treatment_en": "Treatment depends on the type and dosha involved: for Vata-jvara — warming remedies, for Pitta — cooling remedies, for Kapha — cleansing remedies."
  },
  {
    "name": "Сантата-джвара",
    "origin": "santata jvara",
    "category": "Лихорадки",
    "dosha": "Капха",
    "desc": "Непрерывная лихорадка — длится без перерыва, не снижается сутками. Связана с нарушением Капхи и Питты. Считается наиболее тяжёлым видом.",
    "treatment": "Патола, сарива, муста, патра и катукарохини; очистительная терапия после созревания дош.",
    "chapters": [
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Santata Jvara",
    "category_en": "Fevers",
    "dosha_en": "Kapha",
    "desc_en": "Continuous fever — persists without interruption, not subsiding for days at a time. Associated with a disturbance of Kapha and Pitta. Considered the most severe type.",
    "treatment_en": "Patola, sariva, musta, patra, and katukarohini; purification therapy once the doshas have matured."
  },
  {
    "name": "Сатата-джвара",
    "origin": "satata jvara",
    "category": "Лихорадки",
    "dosha": "Пита",
    "desc": "Ремиттирующая лихорадка — временно снижается, но не исчезает полностью. Возникает дважды в сутки. Связана с Питтой.",
    "treatment": "Патола, сарива, муста, патра и катукарохини.",
    "chapters": [
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Satata Jvara",
    "category_en": "Fevers",
    "dosha_en": "Pitta",
    "desc_en": "Remittent fever — temporarily subsides but does not disappear completely. Occurs twice a day. Associated with Pitta.",
    "treatment_en": "Patola, sariva, musta, patra, and katukarohini."
  },
  {
    "name": "Аньедуска-джвара",
    "origin": "anyedyuṣka jvara",
    "category": "Лихорадки",
    "dosha": "Вата-Пита",
    "desc": "Перемежающаяся ежедневная лихорадка — появляется раз в сутки, затем спадает. Связана с сочетанием Ваты и Питты.",
    "treatment": "Патола, нимба, трипхала, муста и ватсака.",
    "chapters": [
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Anyedyushka Jvara",
    "category_en": "Fevers",
    "dosha_en": "Vata-Pitta",
    "desc_en": "Intermittent daily fever — appears once a day, then subsides. Associated with a combination of Vata and Pitta.",
    "treatment_en": "Patola, nimba, triphala, musta, and vatsaka."
  },
  {
    "name": "Тритьяка-джвара",
    "origin": "tṛtīyaka jvara",
    "category": "Лихорадки",
    "dosha": "Вата-Капха",
    "desc": "Третичная лихорадка (малярийного типа) — возникает каждые два дня, на третий день. Соответствует tertian malaria. Связана с Ватой и Капхой.",
    "treatment": "Кирататикта, амрита, чандана и вишвабхешайя.",
    "chapters": [
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Tritiyaka Jvara",
    "category_en": "Fevers",
    "dosha_en": "Vata-Kapha",
    "desc_en": "Tertiary fever (malarial type) — occurs every two days, on the third day. Corresponds to tertian malaria. Associated with Vata and Kapha.",
    "treatment_en": "Kiratatikta, amrita, chandana, and vishvabheshaja."
  },
  {
    "name": "Чатуртхака-джвара",
    "origin": "caturthaka jvara",
    "category": "Лихорадки",
    "dosha": "Вата",
    "desc": "Четвертичная лихорадка — возникает каждые четыре дня. Соответствует quartan malaria. Преимущественно Вата-природа, наиболее трудно поддаётся лечению.",
    "treatment": "Дхатри, муста, амрита и мёд (кшаудра).",
    "chapters": [
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Chaturthaka Jvara",
    "category_en": "Fevers",
    "dosha_en": "Vata",
    "desc_en": "Quaternary fever — occurs every four days. Corresponds to quartan malaria. Predominantly of Vata nature, the most difficult to treat.",
    "treatment_en": "Dhatri, musta, amrita, and honey (kshaudra)."
  },
  {
    "name": "Санниапата-джвара",
    "origin": "sannipāta jvara",
    "category": "Лихорадки",
    "dosha": "Все три доши (Тридоша)",
    "desc": "Триплексная лихорадка — нарушение всех трёх дош одновременно; наиболее опасный и сложный в лечении вид лихорадки. Сопровождается многочисленными симптомами всех трёх дош.",
    "treatment": "Крайне осторожное лечение; сначала устранение доминирующей доши; применяется таилвака-гхрита и другие специальные препараты.",
    "chapters": [
      "Нидана стхана, Гл.2",
      "Чикитса стхана, Гл.1"
    ],
    "name_en": "Sannipata Jvara",
    "category_en": "Fevers",
    "dosha_en": "All three doshas (Tridosha)",
    "desc_en": "Triplex fever — simultaneous disturbance of all three doshas; the most dangerous and difficult to treat type of fever. Accompanied by numerous symptoms of all three doshas.",
    "treatment_en": "Extremely cautious treatment; first the dominant dosha is addressed; tailvaka-ghrita and other special preparations are used."
  },
  {
    "name": "Вишама-джвара",
    "origin": "viṣama jvara",
    "category": "Лихорадки",
    "dosha": "Вата",
    "desc": "Неправильная, нерегулярная лихорадка — приступы возникают без определённой закономерности. Связана с нарушением Ваты.",
    "treatment": "Согревающие и тонизирующие средства, нормализация агни.",
    "chapters": [
      "Нидана стхана, Гл.2"
    ],
    "name_en": "Vishama Jvara",
    "category_en": "Fevers",
    "dosha_en": "Vata",
    "desc_en": "Irregular, erratic fever — attacks occur without any definite pattern. Associated with a disturbance of Vata.",
    "treatment_en": "Warming and tonifying remedies, normalization of agni."
  },
  {
    "name": "Каса",
    "origin": "kāsa",
    "category": "Дыхательные болезни",
    "dosha": "Вата / Капха / Пита",
    "desc": "Кашель — один из пяти видов: Вата-каса (сухой, болезненный), Питта-каса (с жжением, кровью), Капха-каса (с обильной мокротой), Кшаяджа-каса (истощающий, при туберкулёзе), Кшатаджа-каса (при травме груди).",
    "treatment": "При Вата — тёплые масла и молоко; при Питта — охлаждающие сиропы; при Капха — острые и подсушивающие средства; шринги, пиппали, мадхука.",
    "chapters": [
      "Чикитса стхана, Гл.3"
    ],
    "name_en": "Kasa",
    "category_en": "Respiratory Diseases",
    "dosha_en": "Vata / Kapha / Pitta",
    "desc_en": "Cough — one of five types: Vata-kasa (dry, painful), Pitta-kasa (with burning, blood), Kapha-kasa (with copious phlegm), Kshayaja-kasa (wasting, in tuberculosis), Kshataja-kasa (from chest injury).",
    "treatment_en": "For Vata — warm oils and milk; for Pitta — cooling syrups; for Kapha — pungent and drying remedies; shringi, pippali, madhuka."
  },
  {
    "name": "Шваса",
    "origin": "śvāsa",
    "category": "Дыхательные болезни",
    "dosha": "Вата-Капха",
    "desc": "Нарушения дыхания и бронхиальная астма — пять видов: маха-шваса, урдхва-шваса, чхинна-шваса, тамака-шваса (астма) и кшудра-шваса. Причина: нарушение Ваты и Капхи в дыхательных каналах.",
    "treatment": "Согревающие препараты, расширение дыхательных каналов; трикату, пиппали, васака. При Тамака-шваса — специальные бронхолитические средства.",
    "chapters": [
      "Чикитса стхана, Гл.4"
    ],
    "name_en": "Shvasa",
    "category_en": "Respiratory Diseases",
    "dosha_en": "Vata-Kapha",
    "desc_en": "Breathing disorders and bronchial asthma — five types: maha-shvasa, urdhva-shvasa, chhinna-shvasa, tamaka-shvasa (asthma), and kshudra-shvasa. Cause: disturbance of Vata and Kapha in the respiratory channels.",
    "treatment_en": "Warming preparations, dilation of the respiratory channels; trikatu, pippali, vasaka. For Tamaka-shvasa — special bronchodilating remedies."
  },
  {
    "name": "Хикка",
    "origin": "hikkā",
    "category": "Дыхательные болезни",
    "dosha": "Вата-Капха",
    "desc": "Икота — пять видов по степени тяжести; вызывается восходящей Ватой (удана) в сочетании с Капхой. Лёгкие виды проходят сами, тяжёлые (маха-хикка) опасны для жизни.",
    "treatment": "Противовратные средства, успокоение Ваты, тёплые напитки.",
    "chapters": [
      "Чикитса стхана, Гл.5"
    ],
    "name_en": "Hikka",
    "category_en": "Respiratory Diseases",
    "dosha_en": "Vata-Kapha",
    "desc_en": "Hiccups — five types by severity; caused by ascending Vata (udana) combined with Kapha. Mild types resolve on their own, severe types (maha-hikka) are life-threatening.",
    "treatment_en": "Anti-hiccup remedies, pacification of Vata, warm drinks."
  },
  {
    "name": "Аджирна",
    "origin": "ajīrṇa",
    "category": "Болезни пищеварения",
    "dosha": "Вата / Пита / Капха",
    "desc": "Расстройство пищеварения, несварение — возникает при слабом агни или неправильном питании; первопричина большинства болезней. Четыре типа: Ама (непереваренная пища), Видагдха (кислое брожение), Вистабдха (вздутие), Расашеша (остатки предыдущей пищи).",
    "treatment": "Лёгкая пища, имбирь, трикату; при тяжёлом — лечебное голодание (лангхана).",
    "chapters": [
      "Сутрастхана, Гл.8"
    ],
    "name_en": "Ajirna",
    "category_en": "Digestive Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Indigestion, dyspepsia — arises from weak agni or improper diet; the root cause of most diseases. Four types: Ama (undigested food), Vidagdha (acidic fermentation), Vistabdha (bloating), Rasashesha (residue of previous food).",
    "treatment_en": "Light food, ginger, trikatu; in severe cases — therapeutic fasting (langhana)."
  },
  {
    "name": "Атисара",
    "origin": "atīsāra",
    "category": "Болезни пищеварения",
    "dosha": "Вата / Пита / Капха",
    "desc": "Диарея — шесть видов по доше и причине. При Вата — сухой стул со спазмами; при Питта — с жжением и воспалением; при Капха — слизистый; также выделяют Аматисара (с непереваренной пищей) и Шокаджа (от горя).",
    "treatment": "Ватсака, мунг дал, гранат, йогурт; при остром — отдых и щадящее питание; при хроническом — нормализация агни.",
    "chapters": [
      "Нидана стхана, Гл.8"
    ],
    "name_en": "Atisara",
    "category_en": "Digestive Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Diarrhea — six types by dosha and cause. In Vata — dry stool with cramps; in Pitta — with burning and inflammation; in Kapha — mucous; Amatisara (with undigested food) and Shokaja (from grief) are also distinguished.",
    "treatment_en": "Vatsaka, mung dal, pomegranate, yogurt; in acute cases — rest and gentle diet; in chronic cases — normalization of agni."
  },
  {
    "name": "Грахани",
    "origin": "grahaṇī",
    "category": "Болезни пищеварения",
    "dosha": "Вата / Пита / Капха",
    "desc": "Хроническое расстройство тонкого кишечника (аналог синдрома раздражённого кишечника и нарушения всасывания); возникает при длительно слабом агни; чередование запора и диареи.",
    "treatment": "Восстановление агни — трикату, чираяту, аюрведические препараты на основе граната; регуляция питания.",
    "chapters": [
      "Нидана стхана, Гл.5"
    ],
    "name_en": "Grahani",
    "category_en": "Digestive Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Chronic disorder of the small intestine (analogous to irritable bowel syndrome and malabsorption); arises from long-standing weak agni; alternating constipation and diarrhea.",
    "treatment_en": "Restoration of agni — trikatu, chirayata, Ayurvedic preparations based on pomegranate; dietary regulation."
  },
  {
    "name": "Арша",
    "origin": "arśas",
    "category": "Болезни пищеварения",
    "dosha": "Вата / Пита / Капха",
    "desc": "Геморрой («враг жизни») — наросты в области прямой кишки; шесть видов по доше. Вата-арша — сухие, болезненные; Питта — кровоточащие; Капха — слизистые, мягкие.",
    "treatment": "Диета, травяные препараты, прижигание, хирургическое вмешательство при запущенных стадиях; трипхала, харитаки.",
    "chapters": [
      "Нидана стхана, Гл.7"
    ],
    "name_en": "Arsha",
    "category_en": "Digestive Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Hemorrhoids (\"the enemy of life\") — growths in the rectal area; six types by dosha. Vata-arsha — dry, painful; Pitta — bleeding; Kapha — mucous, soft.",
    "treatment_en": "Diet, herbal preparations, cauterization, surgical intervention in advanced stages; triphala, haritaki."
  },
  {
    "name": "Прамеха",
    "origin": "prameha",
    "category": "Нарушения обмена веществ",
    "dosha": "Капха (первично) / Пита / Вата",
    "desc": "Двадцать видов нарушения обмена веществ, сопровождающихся патологическим мочеиспусканием; включают сахарный диабет (мадху-прамеха). Начинаются с Капхи, прогрессируют к Питте и Вате.",
    "treatment": "Строгая диета: горькие, острые и вяжущие вкусы; физическая активность; гудучи, нимба, амалаки; при запущенных стадиях — панчакарма.",
    "chapters": [
      "Нидана стхана, Гл.1"
    ],
    "name_en": "Prameha",
    "category_en": "Metabolic Disorders",
    "dosha_en": "Kapha (primary) / Pitta / Vata",
    "desc_en": "Twenty types of metabolic disorder accompanied by abnormal urination; includes diabetes mellitus (madhu-prameha). They begin with Kapha and progress toward Pitta and Vata.",
    "treatment_en": "Strict diet: bitter, pungent, and astringent tastes; physical activity; guduchi, nimba, amalaki; in advanced stages — panchakarma."
  },
  {
    "name": "Мутракриччха",
    "origin": "mūtrakṛccha",
    "category": "Нарушения обмена веществ",
    "dosha": "Вата-Пита",
    "desc": "Болезненное, затруднённое мочеиспускание (дизурия) — восемь видов; вызывается Ватой и Питтой в мочевых каналах; жжение, боль, малое количество мочи.",
    "treatment": "Охлаждающие, мочегонные средства; чандана, дарбха, кулатха; покой.",
    "chapters": [],
    "name_en": "Mutrakrichchha",
    "category_en": "Metabolic Disorders",
    "dosha_en": "Vata-Pitta",
    "desc_en": "Painful, difficult urination (dysuria) — eight types; caused by Vata and Pitta in the urinary channels; burning, pain, scanty urine.",
    "treatment_en": "Cooling, diuretic remedies; chandana, darbha, kulattha; rest."
  },
  {
    "name": "Мутрагхата",
    "origin": "mūtrāghāta",
    "category": "Нарушения обмена веществ",
    "dosha": "Вата",
    "desc": "Задержка мочи — обструкция мочевых путей; связана с нарушением апана-Ваты; может быть вызвана камнями, опухолями или мышечным спазмом.",
    "treatment": "Средства, снижающие Вату, паровые процедуры на область таза; басти (масляные клизмы).",
    "chapters": [],
    "name_en": "Mutraghata",
    "category_en": "Metabolic Disorders",
    "dosha_en": "Vata",
    "desc_en": "Urinary retention — obstruction of the urinary tract; associated with a disturbance of apana-Vata; may be caused by stones, tumors, or muscle spasm.",
    "treatment_en": "Vata-pacifying remedies, steam treatments over the pelvic area; basti (oil enemas)."
  },
  {
    "name": "Кушта",
    "origin": "kuṣṭha",
    "category": "Болезни кожи",
    "dosha": "Все три доши + нарушение крови",
    "desc": "Кожные заболевания — группа из 18 болезней кожи, включая псориаз, экзему, проказу и другие хронические поражения. Возникают при нарушении всех трёх дош и отравлении ракты (крови).",
    "treatment": "Кровоочистительные средства: нимба, харитаки, рактамокшана (кровопускание); строгая диета без кислого и солёного.",
    "chapters": [],
    "name_en": "Kushtha",
    "category_en": "Skin Diseases",
    "dosha_en": "All three doshas + blood disorder",
    "desc_en": "Skin diseases — a group of 18 skin diseases, including psoriasis, eczema, leprosy, and other chronic lesions. Arise from disturbance of all three doshas and poisoning of rakta (blood).",
    "treatment_en": "Blood-purifying remedies: nimba, haritaki, raktamokshana (bloodletting); a strict diet free of sour and salty foods."
  },
  {
    "name": "Ватаракта",
    "origin": "vātarakta",
    "category": "Болезни суставов",
    "dosha": "Вата + нарушение крови",
    "desc": "Подагра — нарушение Ваты в сочетании с токсичной кровью; острые боли в суставах (особенно большой палец ноги), покраснение, отёк. Результат употребления несовместимых продуктов и малоподвижного образа жизни.",
    "treatment": "Очищение крови, антивата и охлаждающие средства; гудучи, амалаки, кровопускание; диета без красного мяса и алкоголя.",
    "chapters": [
      "Чикитса стхана, Гл.22"
    ],
    "name_en": "Vatarakta",
    "category_en": "Joint Diseases",
    "dosha_en": "Vata + blood disorder",
    "desc_en": "Gout — a disturbance of Vata combined with toxic blood; acute joint pain (especially the big toe), redness, swelling. Results from consuming incompatible foods and a sedentary lifestyle.",
    "treatment_en": "Blood purification, anti-Vata and cooling remedies; guduchi, amalaki, bloodletting; a diet free of red meat and alcohol."
  },
  {
    "name": "Вишарпа",
    "origin": "viṣarpa",
    "category": "Болезни кожи",
    "dosha": "Пита + нарушение крови",
    "desc": "Рожистое воспаление — быстро распространяющееся воспаление кожи с покраснением, жаром и болью; связано с нарушением Питты и ракты (крови).",
    "treatment": "Охлаждающие средства, кровоочистительная терапия; нимба, чандана, прикладывание охлаждающих паст.",
    "chapters": [],
    "name_en": "Visarpa",
    "category_en": "Skin Diseases",
    "dosha_en": "Pitta + blood disorder",
    "desc_en": "Erysipelas — rapidly spreading skin inflammation with redness, heat, and pain; associated with a disturbance of Pitta and rakta (blood).",
    "treatment_en": "Cooling remedies, blood-purifying therapy; nimba, chandana, application of cooling pastes."
  },
  {
    "name": "Пандурога",
    "origin": "pāṇḍu roga",
    "category": "Болезни крови",
    "dosha": "Пита / Вата / Капха",
    "desc": "«Бледная болезнь» — анемия, желтуха; бледность кожи, слизистых и ногтей; слабость, одышка, головокружение. Связана с нарушением ракта-дхату и Питты.",
    "treatment": "Железосодержащие препараты (аюрведические — мандура), трипхала, помидоры, гранат; исключение кислого.",
    "chapters": [
      "Нидана стхана, Гл.6"
    ],
    "name_en": "Pandu Roga",
    "category_en": "Blood Diseases",
    "dosha_en": "Pitta / Vata / Kapha",
    "desc_en": "\"Pallor disease\" — anemia, jaundice; pallor of the skin, mucous membranes, and nails; weakness, shortness of breath, dizziness. Associated with a disturbance of rakta-dhatu and Pitta.",
    "treatment_en": "Iron-containing preparations (Ayurvedic — mandura), triphala, tomatoes, pomegranate; exclusion of sour foods."
  },
  {
    "name": "Ватавьядхи",
    "origin": "vātavyādhi",
    "category": "Нервные болезни",
    "dosha": "Вата",
    "desc": "Болезни, вызываемые Ватой — широкая группа нейромышечных расстройств: паралич, тремор, судороги, онемение, боль в суставах. Самая разнообразная группа — выделяется 80 видов Вата-болезней.",
    "treatment": "Масляные процедуры (абхьянга, широдхара), прогревание (сведана), басти; гхрита, ашваганда, бала.",
    "chapters": [
      "Чикитса стхана, Гл.21"
    ],
    "name_en": "Vatavyadhi",
    "category_en": "Neurological Diseases",
    "dosha_en": "Vata",
    "desc_en": "Vata-caused diseases — a broad group of neuromuscular disorders: paralysis, tremor, convulsions, numbness, joint pain. The most diverse group — 80 types of Vata diseases are distinguished.",
    "treatment_en": "Oil-based procedures (abhyanga, shirodhara), heat therapy (svedana), basti; ghrita, ashwagandha, bala."
  },
  {
    "name": "Апасмара",
    "origin": "apasmāra",
    "category": "Нервные болезни",
    "dosha": "Вата / Пита / Капха",
    "desc": "Эпилепсия («утрата памяти») — четыре вида по доше; внезапная потеря сознания, судороги, пена. В аюрведе рассматривается как поражение манаса (ума) и нарушение оджаса.",
    "treatment": "Специальные гхриты (брахми-гхрита), поведенческие и диетические рекомендации; бхута-видья при психогенных формах.",
    "chapters": [
      "Уттара стхана, Гл.1",
      "Уттара стхана, Гл.4"
    ],
    "name_en": "Apasmara",
    "category_en": "Neurological Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Epilepsy (\"loss of memory\") — four types by dosha; sudden loss of consciousness, convulsions, foaming. In Ayurveda regarded as an affliction of manas (the mind) and a disturbance of ojas.",
    "treatment_en": "Special ghritas (brahmi-ghrita), behavioral and dietary recommendations; bhuta-vidya for psychogenic forms."
  },
  {
    "name": "Унмада",
    "origin": "unmāda",
    "category": "Психические болезни",
    "dosha": "Вата / Пита / Капха / все три",
    "desc": "Психоз, умопомешательство — пять видов; нарушение всех трёх дош, манаса и буддхи; проявляется неадекватным поведением, бессвязной речью, галлюцинациями. Отдельно выделяется «одержимость» (Граха-нимитта).",
    "treatment": "Бхута-видья (психиатрия); специальные гхриты и масла для укрепления ума; сатвавджая-терапия (психотерапия).",
    "chapters": [
      "Уттара стхана, Гл.4"
    ],
    "name_en": "Unmada",
    "category_en": "Mental Diseases",
    "dosha_en": "Vata / Pitta / Kapha / all three",
    "desc_en": "Psychosis, insanity — five types; disturbance of all three doshas, manas, and buddhi; manifests as inappropriate behavior, incoherent speech, hallucinations. \"Possession\" (Graha-nimitta) is distinguished as a separate form.",
    "treatment_en": "Bhuta-vidya (psychiatry); special ghritas and oils to strengthen the mind; sattvavajaya therapy (psychotherapy)."
  },
  {
    "name": "Хридрога",
    "origin": "hṛdroga",
    "category": "Болезни сердца",
    "dosha": "Вата / Пита / Капха / Крими / Аама",
    "desc": "Болезни сердца — пять видов по причине: Вата-хридрога (боли, нарушения ритма), Питта-хридрога (воспаление), Капха-хридрога (застойные явления), Крими-хридрога (инфекционное поражение), Аама-хридрога (от токсинов).",
    "treatment": "Специфическое лечение по доше; арджуна-кширопа (молочный отвар коры арджуны) — ведущее средство.",
    "chapters": [],
    "name_en": "Hridroga",
    "category_en": "Heart Diseases",
    "dosha_en": "Vata / Pitta / Kapha / Krimi / Ama",
    "desc_en": "Heart diseases — five types by cause: Vata-hridroga (pain, rhythm disturbances), Pitta-hridroga (inflammation), Kapha-hridroga (congestive phenomena), Krimi-hridroga (infectious lesion), Ama-hridroga (from toxins).",
    "treatment_en": "Specific treatment by dosha; arjuna-ksheerapa (milk decoction of arjuna bark) — the leading remedy."
  },
  {
    "name": "Удара",
    "origin": "udara",
    "category": "Болезни живота",
    "dosha": "Вата / Пита / Капха",
    "desc": "Болезни живота — группа из восьми форм; основная — асцит (водянка), характеризующийся накоплением жидкости в брюшной полости. Вызывается слабым агни и нарушением всех дош.",
    "treatment": "Восстановление агни, мочегонные средства; пунарнава, тривит; в тяжёлых случаях — хирургическое вмешательство.",
    "chapters": [],
    "name_en": "Udara",
    "category_en": "Abdominal Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Abdominal diseases — a group of eight forms; the principal one is ascites (dropsy), characterized by fluid accumulation in the abdominal cavity. Caused by weak agni and disturbance of all doshas.",
    "treatment_en": "Restoration of agni, diuretic remedies; punarnava, trivrit; in severe cases — surgical intervention."
  },
  {
    "name": "Баламайя",
    "origin": "bālamaya",
    "category": "Детские болезни",
    "dosha": "Капха (первично)",
    "desc": "Детские болезни — раздел балатантры (педиатрия); включает болезни новорождённых, нарушения вскармливания, детские лихорадки, судороги и поражения «злыми духами» (граха-нимитта).",
    "treatment": "Специальные детские дозы трав; уход за кормящей матерью; особые ритуальные и диетические протоколы.",
    "chapters": [
      "Уттара стхана, Гл.2"
    ],
    "name_en": "Balamaya",
    "category_en": "Pediatric Diseases",
    "dosha_en": "Kapha (primary)",
    "desc_en": "Childhood diseases — a section of balatantra (pediatrics); includes diseases of newborns, feeding disorders, childhood fevers, convulsions, and afflictions by \"evil spirits\" (graha-nimitta).",
    "treatment_en": "Special pediatric herbal doses; care of the nursing mother; special ritual and dietary protocols."
  },
  {
    "name": "Ама-доша",
    "origin": "āma-doṣa",
    "category": "Отравления и токсикозы",
    "dosha": "Все три доши",
    "desc": "Токсикоз от накопления амы — непереваренных остатков в тканях и каналах; проявляется усталостью, тяжестью, налётом на языке, болями в суставах, снижением иммунитета.",
    "treatment": "Панча-карма: сначала снехана и сведана для мобилизации амы, затем вирекана или басти для выведения. Лёгкое питание, трифала, имбирный чай.",
    "chapters": [],
    "name_en": "Ama-dosha",
    "category_en": "Poisonings and Toxicoses",
    "dosha_en": "All three doshas",
    "desc_en": "Toxicosis from the accumulation of ama — undigested residues in the tissues and channels; manifests as fatigue, heaviness, coating on the tongue, joint pain, and reduced immunity.",
    "treatment_en": "Panchakarma: first snehana and svedana to mobilize the ama, then virechana or basti to eliminate it. Light diet, triphala, ginger tea."
  },
  {
    "name": "Срото-авародха",
    "origin": "sroto-āvarodhā",
    "category": "Нарушения каналов",
    "dosha": "Зависит от дош и канала",
    "desc": "Закупорка каналов-шрота — состояние, при котором ама и дисбалансированные доши блокируют сротас (каналы питательных веществ, отходов, доши). Предшественник большинства хронических болезней.",
    "treatment": "Снехана и сведана для раскрытия каналов; специфическое лечение по затронутому каналу; диета и травы, улучшающие проходимость.",
    "chapters": [],
    "name_en": "Sroto-avarodha",
    "category_en": "Channel (Srotas) Disorders",
    "dosha_en": "Depends on the doshas and channel involved",
    "desc_en": "Blockage of the srotas channels — a condition in which ama and unbalanced doshas block the srotas (channels for nutrients, waste, and dosha flow). A precursor to most chronic diseases.",
    "treatment_en": "Snehana and svedana to open the channels; specific treatment depending on the affected channel; diet and herbs that improve patency."
  },
  {
    "name": "Вата-вьядхи",
    "origin": "vāta-vyādhi",
    "category": "Нервные расстройства",
    "dosha": "Вата",
    "desc": "Вата-болезни — широкая группа (80 видов по Чарака-самхите); включает боли в суставах, паралич, дрожание, судороги, потерю чувствительности, бессонницу, сухость кожи и запоры.",
    "treatment": "Анувасана-басти (масляные клизмы) — главный метод; снехана; тёплые масляные массажи; насья; питательная, тёплая пища.",
    "chapters": [
      "Чикитса стхана, Гл.21"
    ],
    "name_en": "Vata-vyadhi",
    "category_en": "Nervous Disorders",
    "dosha_en": "Vata",
    "desc_en": "Vata diseases — a broad group (80 types according to the Charaka Samhita); includes joint pain, paralysis, tremor, convulsions, loss of sensation, insomnia, dry skin, and constipation.",
    "treatment_en": "Anuvasana basti (oil enemas) — the main method; snehana; warm oil massage; nasya; nourishing, warm food."
  },
  {
    "name": "Питта-вьядхи",
    "origin": "pitta-vyādhi",
    "category": "Воспалительные болезни",
    "dosha": "Питта",
    "desc": "Питта-болезни — воспалительные заболевания; включают кожные (экзема, псориаз), желудочно-кишечные (гастрит, язва, гепатит), офтальмологические (конъюнктивит) и лихорадочные состояния.",
    "treatment": "Вирекана — главный метод; рактамокшана при кожных и печёночных заболеваниях; охлаждающее питание и масла (кокос, брами).",
    "chapters": [],
    "name_en": "Pitta-vyadhi",
    "category_en": "Inflammatory Diseases",
    "dosha_en": "Pitta",
    "desc_en": "Pitta diseases — inflammatory conditions; include skin conditions (eczema, psoriasis), gastrointestinal conditions (gastritis, ulcer, hepatitis), ophthalmic conditions (conjunctivitis), and febrile states.",
    "treatment_en": "Virechana — the main method; raktamokshana for skin and liver diseases; cooling diet and oils (coconut, brahmi)."
  },
  {
    "name": "Капха-вьядхи",
    "origin": "kapha-vyādhi",
    "category": "Застойные болезни",
    "dosha": "Капха",
    "desc": "Капха-болезни — застойные и обструктивные; включают ожирение, бронхит, астму, гиперхолестеринемию, отёки, синуситы, вялость и депрессию.",
    "treatment": "Вамана — главный метод; насья при заболеваниях дыхательных путей; лёгкое, острое питание; активная физическая нагрузка; сухой массаж (удвартана).",
    "chapters": [],
    "name_en": "Kapha-vyadhi",
    "category_en": "Congestive Diseases",
    "dosha_en": "Kapha",
    "desc_en": "Kapha diseases — congestive and obstructive conditions; include obesity, bronchitis, asthma, hypercholesterolemia, edema, sinusitis, lethargy, and depression.",
    "treatment_en": "Vamana — the main method; nasya for respiratory tract diseases; light, pungent food; vigorous physical activity; dry massage (udvartana)."
  },
  {
    "name": "Кушта",
    "origin": "kuṣṭha",
    "category": "Кожные болезни",
    "dosha": "Все три доши",
    "desc": "Кожные болезни — 18 видов (7 тяжёлых и 11 лёгких по Аштанга Хридае); включают псориаз, витилиго, экзему. Вызываются загрязнением крови, дисбалансом дош и амой.",
    "treatment": "Рактамокшана при воспалении; вирекана для глубокого очищения; травы: харидра (куркума), нимб, мансиштха; наружно — нимбовое масло, паста из куркумы.",
    "chapters": [],
    "name_en": "Kushtha",
    "category_en": "Skin Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Skin diseases — 18 types (7 severe and 11 mild according to the Ashtanga Hridaya); include psoriasis, vitiligo, eczema. Caused by contamination of the blood, dosha imbalance, and ama.",
    "treatment_en": "Raktamokshana for inflammation; virechana for deep cleansing; herbs: haridra (turmeric), nimba, manjishtha; topically — neem oil, turmeric paste."
  },
  {
    "name": "Шватру",
    "origin": "śvitra",
    "category": "Кожные болезни",
    "dosha": "Капха (первично)",
    "desc": "Витилиго — потеря пигментации кожи; белые пятна различного размера. В аюрведе связано с дисбалансом Капхи и накоплением амы, влияющей на пигментные клетки.",
    "treatment": "Бакучи (Psoralea corylifolia) внутрь и наружно; вирекана; рактамокшана; избегать несовместимых продуктов (рыба с молоком).",
    "chapters": [],
    "name_en": "Svitra",
    "category_en": "Skin Diseases",
    "dosha_en": "Kapha (primary)",
    "desc_en": "Vitiligo — loss of skin pigmentation; white patches of varying size. In Ayurveda associated with Kapha imbalance and accumulation of ama affecting the pigment cells.",
    "treatment_en": "Bakuchi (Psoralea corylifolia) internally and topically; virechana; raktamokshana; avoid incompatible food combinations (fish with milk)."
  },
  {
    "name": "Кхандалака",
    "origin": "khaṇḍalaka",
    "category": "Детские болезни",
    "dosha": "Вата (первично)",
    "desc": "Детские колики — спастические боли в животе новорождённых; в аюрведе связаны с дисбалансом апана-ваты, часто из-за питания матери.",
    "treatment": "Тёплое масло (кунжутное) на живот; фенхелевая вода; коррекция диеты кормящей матери (исключить бобовые, сырые овощи); хинг (асафетида) с гхи.",
    "chapters": [
      "Уттара стхана, Гл.2"
    ],
    "name_en": "Khandalaka",
    "category_en": "Pediatric Diseases",
    "dosha_en": "Vata (primary)",
    "desc_en": "Infant colic — spasmodic abdominal pain in newborns; in Ayurveda associated with imbalance of apana-vata, often due to the mother's diet.",
    "treatment_en": "Warm oil (sesame) on the abdomen; fennel water; correction of the nursing mother's diet (exclude legumes, raw vegetables); hing (asafoetida) with ghee."
  },
  {
    "name": "Граха-нимитта",
    "origin": "graha-nimitta",
    "category": "Детские болезни",
    "dosha": "Вата",
    "desc": "Детские болезни «от злых духов» — в аюрведической педиатрии объясняют необъяснимый плач, беспокойство, судороги и задержку развития; современно интерпретируются как неврологические дисфункции.",
    "treatment": "Ритуальная защита (ракша-карма), специальные масла, суварнапрашана для укрепления нервной системы; ашвагандха для новорождённых в безопасных дозах.",
    "chapters": [
      "Уттара стхана, Гл.2",
      "Уттара стхана, Гл.4"
    ],
    "name_en": "Graha-nimitta",
    "category_en": "Pediatric Diseases",
    "dosha_en": "Vata",
    "desc_en": "Childhood diseases \"from evil spirits\" — in Ayurvedic pediatrics used to explain unexplained crying, restlessness, convulsions, and developmental delay; modern interpretations link them to neurological dysfunctions.",
    "treatment_en": "Ritual protection (raksha-karma), special oils, suvarnaprashana to strengthen the nervous system; ashwagandha for newborns in safe doses."
  },
  {
    "name": "Широрога",
    "origin": "śiroroga",
    "category": "Болезни головы",
    "dosha": "Все три доши",
    "desc": "Болезни головы — 11 видов: Вата-, Питта-, Капха-, трёхдошное, кровяное, глистное, внешнее. Включают мигрени, кластерные головные боли, синуситы, невриты. «Шираса» — глава с самыми важными мармами.",
    "treatment": "Насья — основной метод для головных болезней; широбасти (удержание масла на голове); широдхара; конкретные травы по дошам.",
    "chapters": [],
    "name_en": "Shiroroga",
    "category_en": "Head Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Head diseases — 11 types: Vata, Pitta, Kapha, tridoshic, blood-related, worm-related, and external. Include migraines, cluster headaches, sinusitis, neuritis. \"Shiras\" is the head — the region with the most important marmas.",
    "treatment_en": "Nasya — the primary method for head diseases; shirobasti (retaining oil on the head); shirodhara; specific herbs by dosha."
  },
  {
    "name": "Тимира (Катаракта)",
    "origin": "timira",
    "category": "Болезни глаз",
    "dosha": "Капха + Вата",
    "desc": "Тимира — помутнение хрусталика (катаракта) или стекловидного тела. Аюрведа выделяет 4 стадии в зависимости от степени нарушения зрения. Преобладание Капхи вызывает мутность, Вата — дистрофические изменения. Патология затрагивает Алочака Питту — аспект Питты, отвечающий за восприятие света.",
    "treatment": "Тарпана — процедура удержания тёплого гхи в специальной «ванночке» вокруг глаза. Капли: мёд с порошком очанки (Euphrasia). Промывание трипхала-водой. Льняной компресс для расслабления. Насья. Отказ от острого, жареного, кислого.",
    "chapters": [],
    "name_en": "Timira (Cataract)",
    "category_en": "Eye Diseases",
    "dosha_en": "Kapha + Vata",
    "desc_en": "Timira — clouding of the lens (cataract) or vitreous body. Ayurveda distinguishes 4 stages according to the degree of visual impairment. A predominance of Kapha causes cloudiness, Vata causes degenerative changes. The pathology affects Alochaka Pitta — the aspect of Pitta responsible for the perception of light.",
    "treatment_en": "Tarpana — a procedure of retaining warm ghee in a special \"pool\" around the eye. Drops: honey with eyebright (Euphrasia) powder. Rinsing with triphala water. Linseed compress for relaxation. Nasya. Avoidance of pungent, fried, and sour food."
  },
  {
    "name": "Адхиманта (Глаукома)",
    "origin": "adhimantha",
    "category": "Болезни глаз",
    "dosha": "Вата + Капха",
    "desc": "Адхиманта — острое воспаление глаза с болью, покраснением и нарушением зрения, близкое к острой глаукоме. Вата нарушает отток жидкости из глаза (повышение ВГД), Капха закупоривает каналы. Аюрведа рассматривает это как нарушение циркуляции прана-ваты и алочака-питты.",
    "treatment": "Диета: исключить острое, горячее, алкоголь, переутомление. Травяной настой укропа и пажитника для снижения ВГД. Гхи-капли в глаза. Широдхара с кунжутным маслом для снятия нагрузки с нервной системы. Тратака при слабом освещении. Брами и Джатаманси для нервной системы.",
    "chapters": [],
    "name_en": "Adhimantha (Glaucoma)",
    "category_en": "Eye Diseases",
    "dosha_en": "Vata + Kapha",
    "desc_en": "Adhimantha — acute inflammation of the eye with pain, redness, and impaired vision, close to acute glaucoma. Vata disrupts the outflow of fluid from the eye (raised intraocular pressure), Kapha blocks the channels. Ayurveda views this as a disturbance of the circulation of prana-vata and alochaka-pitta.",
    "treatment_en": "Diet: exclude pungent, hot food, alcohol, and overexertion. Herbal infusion of dill and fenugreek to lower intraocular pressure. Ghee drops in the eyes. Shirodhara with sesame oil to relieve strain on the nervous system. Trataka in low light. Brahmi and jatamansi for the nervous system."
  },
  {
    "name": "Мутракрикча",
    "origin": "mūtrakṛccha",
    "category": "Болезни почек",
    "dosha": "Вата + Питта",
    "desc": "Мутракрикча — болезненное мочеиспускание (странгурия, цистит, уретрит). Вата нарушает движение мочи, Питта создаёт жжение и воспаление. Аюрведа описывает 8 видов в зависимости от преобладающей доши. Весной — особое время риска из-за накопленной зимней Капхи и активизации Ваты.",
    "treatment": "Пунарнава (Boerhavia diffusa) — главная трава для почек: мочегонное, противовоспалительное. Гокшура (Tribulus terrestris) для тонуса мочевого пузыря. Чандрапрабха вати. Охлаждающие напитки: кокосовая вода, кориандровый настой. Исключить острое, горячее, кислое.",
    "chapters": [],
    "name_en": "Mutrakrichchha",
    "category_en": "Kidney Diseases",
    "dosha_en": "Vata + Pitta",
    "desc_en": "Mutrakrichchha — painful urination (strangury, cystitis, urethritis). Vata disrupts the flow of urine, Pitta creates burning and inflammation. Ayurveda describes 8 types depending on the predominant dosha. Spring is a particular period of risk due to accumulated winter Kapha and the activation of Vata.",
    "treatment_en": "Punarnava (Boerhavia diffusa) — the principal herb for the kidneys: diuretic, anti-inflammatory. Gokshura (Tribulus terrestris) for bladder tone. Chandraprabha vati. Cooling drinks: coconut water, coriander infusion. Exclude pungent, hot, and sour foods."
  },
  {
    "name": "Мутраагхата",
    "origin": "mūtrāghāta",
    "category": "Болезни почек",
    "dosha": "Вата",
    "desc": "Мутраагхата — задержка мочи (уросхизис). Вата блокирует отток мочи. Может сопровождаться болью в нижней части живота, вздутием. Одно из 12 заболеваний мочевых путей, описанных в Аштанга-хридая-самхите.",
    "treatment": "Касторовое масло внутрь для смазки и активизации Апана-ваты. Тёплые компрессы на низ живота. Басти с дашамулой. Пунарнава, гокшура. Исключить переохлаждение, задержку позывов.",
    "chapters": [],
    "name_en": "Mutraghata",
    "category_en": "Kidney Diseases",
    "dosha_en": "Vata",
    "desc_en": "Mutraghata — urinary retention (urischesis). Vata blocks the outflow of urine. May be accompanied by lower abdominal pain and bloating. One of the 12 urinary tract diseases described in the Ashtanga Hridaya Samhita.",
    "treatment_en": "Castor oil internally for lubrication and to activate apana-vata. Warm compresses on the lower abdomen. Basti with dashamula. Punarnava, gokshura. Avoid chilling and suppressing the urge to urinate."
  },
  {
    "name": "Клайбья (Импотенция)",
    "origin": "klaibya",
    "category": "Мужские болезни",
    "dosha": "Вата",
    "desc": "Клайбья — неспособность к эрекции или её поддержанию. По Аюрведе, возбуждённая Вата нарушает кровоснабжение тканей. Может быть вызвана стрессом, страхом, тревогой, высоким уровнем холестерина, нарушающего кровоток в сосудах половых органов.",
    "treatment": "Ашваганда, бала, видари по 1 ч.л. два раза в день с тёплым молоком в течение 3 месяцев. Массаж лобковой области и корня пениса маслом маханараян. Шафран в молоке для усиления либидо. Поза Петуха, Ваджрасана, Лотос. «Чай безмятежности»: джатамамси + брами + шанкапушпи при психической причине.",
    "chapters": [],
    "name_en": "Klaibya (Impotence)",
    "category_en": "Men's Diseases",
    "dosha_en": "Vata",
    "desc_en": "Klaibya — inability to achieve or maintain an erection. According to Ayurveda, aggravated Vata disrupts blood supply to the tissues. May be caused by stress, fear, anxiety, and high cholesterol impairing blood flow in the vessels of the genital organs.",
    "treatment_en": "Ashwagandha, bala, vidari — 1 teaspoon twice a day with warm milk for 3 months. Massage of the pubic area and base of the penis with mahanarayan oil. Saffron in milk to boost libido. Rooster pose, Vajrasana, Lotus pose. \"Serenity tea\": jatamansi + brahmi + shankhapushpi for psychological causes."
  },
  {
    "name": "Шукрадоша (Преждевременное семяизвержение)",
    "origin": "śukradoṣa",
    "category": "Мужские болезни",
    "dosha": "Вата",
    "desc": "Преждевременное семяизвержение обусловлено возбуждённой Ватой: её качества — быстрота и обострённая осязательная чувствительность — снижают контроль. Усугубляется страхом, тревогой, высоким холестерином, нарушающим кровоснабжение простаты.",
    "treatment": "Смесь ашваганда + бала + видари по 1/2 ст.л. два раза с козьим молоком. Массаж пениса смесью кунжутного и горчичного масел. Ашвини Мудра (втягивание ануса) 10 раз утром и вечером. Диета, уравновешивающая Вату. Позы Лука, Рыбы, Верблюда.",
    "chapters": [],
    "name_en": "Shukradosha (Premature Ejaculation)",
    "category_en": "Men's Diseases",
    "dosha_en": "Vata",
    "desc_en": "Premature ejaculation is caused by aggravated Vata: its qualities — quickness and heightened tactile sensitivity — reduce control. Aggravated by fear, anxiety, and high cholesterol impairing blood supply to the prostate.",
    "treatment_en": "A mixture of ashwagandha + bala + vidari, 1/2 tablespoon twice a day with goat's milk. Massage of the penis with a mixture of sesame and mustard oils. Ashwini mudra (anal contraction) 10 times morning and evening. A Vata-pacifying diet. Bow, Fish, and Camel poses."
  },
  {
    "name": "Простата-шотха (Простатит)",
    "origin": "prostate śotha",
    "category": "Мужские болезни",
    "dosha": "Питта + Вата",
    "desc": "Воспаление и увеличение предстательной железы. Питта создаёт жжение при мочеиспускании и воспаление, Вата — прерывистость и затруднённость мочеиспускания, частые ночные позывы, неполное опорожнение пузыря. Возрастное явление при дисбалансе Ваты.",
    "treatment": "Боэрхавия + гокшура + мумие по 1/4 ч.л. два раза в день. Чай из кумина, кориандра, фенхеля для снятия жжения. Пунарнава гуггул (1 таблетка два раза в день). Видари + ашваганда для тонуса. Массаж промежности кунжутным маслом. Ашвини Мудра, поза Лотоса.",
    "chapters": [],
    "name_en": "Prostata-shotha (Prostatitis)",
    "category_en": "Men's Diseases",
    "dosha_en": "Pitta + Vata",
    "desc_en": "Inflammation and enlargement of the prostate gland. Pitta causes burning during urination and inflammation, Vata causes intermittent and difficult urination, frequent nighttime urges, and incomplete bladder emptying. An age-related phenomenon linked to Vata imbalance.",
    "treatment_en": "Boerhavia + gokshura + shilajit, 1/4 teaspoon twice a day. Cumin, coriander, and fennel tea to relieve burning. Punarnava guggul (1 tablet twice a day). Vidari + ashwagandha for tone. Perineal massage with sesame oil. Ashwini mudra, Lotus pose."
  },
  {
    "name": "Кастарта-дардха (Дисменорея)",
    "origin": "kaṣṭārtava",
    "category": "Женские болезни",
    "dosha": "Вата / Питта / Капха",
    "desc": "Болезненные менструации. Аюрведа выделяет три типа: Вата — боли перед началом цикла, спазмы, вздутие, бессонница, скудные выделения; Питта — обильные кровотечения, жжение, болезненность груди; Капха — боли в конце цикла, задержка воды, тяжесть, сонливость.",
    "treatment": "Вата: ашваганда + видари + тагар с тёплой водой. Питта: шатавари + муста + кама дудха. Капха: боэрхавия + манжишта + трикату. При любом типе — алоэ-гель 1 ст.л. три раза в день. Гуггул-препараты по типу дисменореи. Диета, уравновешивающая возбуждённую дошу.",
    "chapters": [],
    "name_en": "Kashtartava (Dysmenorrhea)",
    "category_en": "Women's Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Painful menstruation. Ayurveda distinguishes three types: Vata — pain before the onset of the cycle, cramps, bloating, insomnia, scant flow; Pitta — heavy bleeding, burning, breast tenderness; Kapha — pain at the end of the cycle, water retention, heaviness, drowsiness.",
    "treatment_en": "Vata: ashwagandha + vidari + tagara with warm water. Pitta: shatavari + musta + kama dudha. Kapha: boerhavia + manjishtha + trikatu. For any type — 1 tablespoon of aloe gel three times a day. Guggul preparations according to the type of dysmenorrhea. A diet that pacifies the aggravated dosha."
  },
  {
    "name": "Ритударшана (Предменструальный синдром)",
    "origin": "ṛtūdarśana",
    "category": "Женские болезни",
    "dosha": "Вата / Питта / Капха",
    "desc": "Предменструальный синдром (ПМС) — комплекс симптомов в дни перед менструацией. Вата-ПМС: тревога, бессонница, вздутие, боль в пояснице. Питта-ПМС: болезненность груди, жжение при мочеиспускании, приливы, раздражительность. Капха-ПМС: задержка воды, сонливость.",
    "treatment": "Вата: чай из дашамулы два раза в день, кайшоре или йогарадж гуггул. Питта: шатавари + брами + муста. Капха: боэрхавия + катука + муста. Алоэ-гель при всех типах. Профилактика: начинать за неделю до цикла. Компресс с касторовым маслом на низ живота при спазмах.",
    "chapters": [],
    "name_en": "Ritudarshana (Premenstrual Syndrome)",
    "category_en": "Women's Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Premenstrual syndrome (PMS) — a complex of symptoms in the days before menstruation. Vata-PMS: anxiety, insomnia, bloating, lower back pain. Pitta-PMS: breast tenderness, burning on urination, hot flashes, irritability. Kapha-PMS: water retention, drowsiness.",
    "treatment_en": "Vata: dashamula tea twice a day, kaishore or yogaraj guggul. Pitta: shatavari + brahmi + musta. Kapha: boerhavia + katuka + musta. Aloe gel for all types. Prevention: start a week before the cycle. Castor oil compress on the lower abdomen for cramps."
  },
  {
    "name": "Рактапрадара (Меноррагия)",
    "origin": "raktapradara",
    "category": "Женские болезни",
    "dosha": "Питта",
    "desc": "Обильное менструальное кровотечение, обусловленное избытком Питты в крови (ракта дхату). Питта своими горячими и проникающими качествами разжижает кровь и усиливает кровоток. Сопровождается жжением, раздражительностью, жаром.",
    "treatment": "Чай из листьев малины и цветов гибискуса (по 1-2 ч.л.). Кокосовая вода с 1/2 ч.л. леденцового сахара. Гранатовый сок с кокосовой водой. Кайшоре гуггул. Диета, успокаивающая Питту. Охлаждающие масла наружно: кокосовое. Исключить острое, солёное, ферментированное.",
    "chapters": [],
    "name_en": "Raktapradara (Menorrhagia)",
    "category_en": "Women's Diseases",
    "dosha_en": "Pitta",
    "desc_en": "Heavy menstrual bleeding caused by excess Pitta in the blood (rakta dhatu). Pitta's hot and penetrating qualities thin the blood and increase blood flow. Accompanied by burning, irritability, and a feeling of heat.",
    "treatment_en": "Tea of raspberry leaves and hibiscus flowers (1-2 teaspoons). Coconut water with 1/2 teaspoon of rock sugar. Pomegranate juice with coconut water. Kaishore guggul. A Pitta-pacifying diet. Cooling oils applied topically: coconut oil. Exclude pungent, salty, and fermented foods."
  },
  {
    "name": "Климактерий (Менопауза)",
    "origin": "vṛddha avasthā",
    "category": "Женские болезни",
    "dosha": "Вата + Питта",
    "desc": "Климактерический синдром — естественное прекращение менструаций. Дефицит гормонов на фоне нарастания Ваты. Проявления: приливы жара (Питта), задержка воды, перепады настроения, вагинальная сухость, риск остеопороза (нарушение астхи-дхату).",
    "treatment": "Шатавари + дикий ямс (видари) по 1/2 ч.л. два раза в день. Алоэ-гель по 1 ст.л. три раза в день. Кальций 1200 мг + магний 600 мг + цинк 60 мг ежедневно. Кунжутное масло вагинально при сухости. Гранатовый сок при приливах. Диета, успокаивающая Вату.",
    "chapters": [],
    "name_en": "Vriddha Avastha (Menopause)",
    "category_en": "Women's Diseases",
    "dosha_en": "Vata + Pitta",
    "desc_en": "Menopausal syndrome — the natural cessation of menstruation. Hormone deficiency against a backdrop of increasing Vata. Manifestations: hot flashes (Pitta), water retention, mood swings, vaginal dryness, risk of osteoporosis (disturbance of asthi-dhatu).",
    "treatment_en": "Shatavari + wild yam (vidari), 1/2 teaspoon twice a day. Aloe gel, 1 tablespoon three times a day. Calcium 1200 mg + magnesium 600 mg + zinc 60 mg daily. Sesame oil vaginally for dryness. Pomegranate juice for hot flashes. A Vata-pacifying diet."
  },
  {
    "name": "Стана-шотха (Мастопатия)",
    "origin": "stana śotha",
    "category": "Женские болезни",
    "dosha": "Капха",
    "desc": "Фиброзно-кистозные изменения молочных желёз. Избыток Капхи создаёт застойные явления, увеличение и болезненность желёз. При отсутствии лечения создаёт риск злокачественного перерождения. Усугубляется жирной, молочной, холодной пищей.",
    "treatment": "Катука + читрак + боэрхавия по 1/2 ч.л. два раза в день. Массаж груди тёплым касторовым маслом от грудины к подмышкам. Диета против Капхи: исключить молочные, сладкое, холодное, пшеницу. Позы Кузнечика, Лука, Лодки, Стойка на Плечах.",
    "chapters": [],
    "name_en": "Stana-shotha (Mastopathy)",
    "category_en": "Women's Diseases",
    "dosha_en": "Kapha",
    "desc_en": "Fibrocystic changes of the mammary glands. Excess Kapha creates congestion, enlargement, and tenderness of the glands. If untreated it creates a risk of malignant transformation. Aggravated by fatty, dairy, and cold foods.",
    "treatment_en": "Katuka + chitrak + boerhavia, 1/2 teaspoon twice a day. Breast massage with warm castor oil from the sternum toward the armpits. An anti-Kapha diet: exclude dairy, sweets, cold food, and wheat. Locust, Bow, Boat poses, Shoulder Stand."
  },
  {
    "name": "Йони-каду (Дрожжевой вагинит)",
    "origin": "yoni kandu",
    "category": "Женские болезни",
    "dosha": "Питта + Капха",
    "desc": "Вагинальная дрожжевая инфекция (молочница). Сочетанное расстройство Питта-Капха: Питта создаёт жжение и воспаление, Капха — обильные выделения. Провоцируется сахаром, дрожжевым хлебом, антибиотиками, ферментированной пищей.",
    "treatment": "Куркума + корень солодки + шардуника внутрь два раза в день. Спринцевание отваром солодки (1 ст.л. на 0,5 л воды). При густых выделениях — спринцевание трипхалой. Диета: исключить сахар, дрожжи, ферментированное. Йогурт наружно при зуде.",
    "chapters": [],
    "name_en": "Yoni Kandu (Yeast Vaginitis)",
    "category_en": "Women's Diseases",
    "dosha_en": "Pitta + Kapha",
    "desc_en": "Vaginal yeast infection (thrush). A combined Pitta-Kapha disorder: Pitta causes burning and inflammation, Kapha causes copious discharge. Provoked by sugar, yeast bread, antibiotics, and fermented food.",
    "treatment_en": "Turmeric + licorice root + shardunika internally twice a day. Douche with a licorice decoction (1 tablespoon per 0.5 L of water). For thick discharge — douche with triphala. Diet: exclude sugar, yeast, fermented foods. Yogurt applied topically for itching."
  },
  {
    "name": "Мукха-пака (Стоматит)",
    "origin": "mukha pāka",
    "category": "Болезни горла и рта",
    "dosha": "Питта",
    "desc": "Стоматит — воспаление слизистой рта с язвочками. Избыток Питты в слюне разъедает слизистую при малейшей травме: острыми краями пищи, неправильной чисткой зубов, прикусыванием щёк. Характерна болезненность, жжение.",
    "treatment": "Местно: куркума + мёд на язвочку. Полоскание соком/гелем алоэ два раза в день. Масло чайного дерева (10 капель на 1/3 стакана воды). Кама дудха + свежие сливки на поражённое место. Внутрь: диета, успокаивающая Питту, клюквенный сок между едой. Кумин + леденцовый сахар.",
    "chapters": [],
    "name_en": "Mukha Paka (Stomatitis)",
    "category_en": "Throat and Mouth Diseases",
    "dosha_en": "Pitta",
    "desc_en": "Stomatitis — inflammation of the oral mucosa with ulcers. Excess Pitta in the saliva erodes the mucosa at the slightest injury: from sharp edges of food, improper tooth brushing, or cheek biting. Characterized by tenderness and burning.",
    "treatment_en": "Topically: turmeric + honey on the ulcer. Rinsing with aloe juice/gel twice a day. Tea tree oil (10 drops per 1/3 cup of water). Kama dudha + fresh cream on the affected area. Internally: a Pitta-pacifying diet, cranberry juice between meals. Cumin + rock sugar."
  },
  {
    "name": "Данта-шула (Зубная боль и пародонтоз)",
    "origin": "danta śūla",
    "category": "Болезни горла и рта",
    "dosha": "Вата + Питта",
    "desc": "Заболевания зубов и дёсен. Зубы — «побочный продукт» астхи-дхату (костной ткани). Кариес и пародонтоз — признаки возбуждения Ваты в костной ткани. Кровоточивость дёсен и воспаление — от Питты. Минеральная недостаточность кальция, магния, цинка — главный фактор.",
    "treatment": "Ежедневно горсть белого кунжута натощак. Масляное полоскание рта кунжутным маслом 2-3 мин с последующим массажем дёсен. Зубной порошок из маргозы (ним) + лодхра. Масло чайного дерева на обнажённые корни. При боли: гвоздичное масло или натуральная камфора на больное место. Кальций 1200 мг + магний 600 мг + цинк 60 мг.",
    "chapters": [],
    "name_en": "Danta Shula (Toothache and Periodontal Disease)",
    "category_en": "Throat and Mouth Diseases",
    "dosha_en": "Vata + Pitta",
    "desc_en": "Diseases of the teeth and gums. Teeth are a \"by-product\" of asthi-dhatu (bone tissue). Cavities and periodontal disease are signs of Vata aggravation in the bone tissue. Bleeding gums and inflammation stem from Pitta. Mineral deficiency of calcium, magnesium, and zinc is a major factor.",
    "treatment_en": "Daily, a handful of white sesame on an empty stomach. Oil pulling with sesame oil for 2-3 minutes followed by gum massage. Neem tooth powder + lodhra. Tea tree oil on exposed roots. For pain: clove oil or natural camphor on the affected area. Calcium 1200 mg + magnesium 600 mg + zinc 60 mg."
  },
  {
    "name": "Ларингит и фарингит",
    "origin": "kaṇṭha roga",
    "category": "Болезни горла и рта",
    "dosha": "Вата + Капха",
    "desc": "Воспаление горла и гортани. В Аюрведе относится к расстройствам Ваты и Капхи в канале горла. Сухой кашель, першение, охриплость указывают на избыток Ваты и сухость. Мокрый кашель, набухание миндалин — признаки избытка Капхи. Провоцируется холодом, сухим воздухом, перенапряжением голоса.",
    "treatment": "Молоко с 1/2 ч.л. куркумы и 1/4 ч.л. имбиря перед сном. При сухом кашле: банан с мёдом и чёрным перцем. Чай из талишади + солодка + мёд. При влажном кашле: чёрный перец с мёдом. Ситопалади чурна + мёд. Солодковый чай. Масло ги в нос для увлажнения слизистых.",
    "chapters": [],
    "name_en": "Laryngitis and Pharyngitis (Kantha Roga)",
    "category_en": "Throat and Mouth Diseases",
    "dosha_en": "Vata + Kapha",
    "desc_en": "Inflammation of the throat and larynx. In Ayurveda classed as a disorder of Vata and Kapha in the throat channel. Dry cough, throat tickle, and hoarseness indicate excess Vata and dryness. Wet cough and swollen tonsils are signs of excess Kapha. Provoked by cold, dry air, and voice strain.",
    "treatment_en": "Milk with 1/2 teaspoon of turmeric and 1/4 teaspoon of ginger before bed. For dry cough: banana with honey and black pepper. Tea of talisadi + licorice + honey. For wet cough: black pepper with honey. Sitopaladi churna + honey. Licorice tea. Ghee in the nose to moisten the mucous membranes."
  },
  {
    "name": "Синусит (Пинаса)",
    "origin": "pīnasa",
    "category": "Болезни горла и рта",
    "dosha": "Капха",
    "desc": "Воспаление придаточных пазух носа. Избыток Капхи (от молочных продуктов, холодных напитков, пыльцы) накапливается в синусах, нарушая дренаж. Проявляется заложенностью, давлением в лице, снижением обоняния. Осложнения: инфекция уха, сонное апноэ, неприятный запах.",
    "treatment": "Ситопалади + трикату + махасударшан внутрь три раза в день. Промывание носа солевым раствором (1/2 ч.л. соли на 1/2 стакана тёплой воды). Чесночный сок в нос при острой заложенности. «Золотая печать» + бороздоплодник + куркума + маргоза (натуральные антибиотики). Исключить молочные, холодные напитки.",
    "chapters": [],
    "name_en": "Sinusitis (Pinasa)",
    "category_en": "Throat and Mouth Diseases",
    "dosha_en": "Kapha",
    "desc_en": "Inflammation of the paranasal sinuses. Excess Kapha (from dairy products, cold drinks, pollen) accumulates in the sinuses, disrupting drainage. Manifests as congestion, facial pressure, and reduced sense of smell. Complications: ear infection, sleep apnea, unpleasant odor.",
    "treatment_en": "Sitopaladi + trikatu + mahasudarshan internally three times a day. Nasal rinse with saline solution (1/2 teaspoon of salt per 1/2 cup of warm water). Garlic juice in the nose for acute congestion. \"Golden seal\" + osha root + turmeric + neem (natural antibiotics). Exclude dairy and cold drinks."
  },
  {
    "name": "Мутратисара (Цистит)",
    "origin": "mūtrātisāra",
    "category": "Болезни мочеполовой системы",
    "dosha": "Питта",
    "desc": "Воспаление мочевого пузыря (цистит). Питта в мочевых путях создаёт жжение, резь, частые болезненные позывы. Возникает от острой пищи, алкоголя, стресса, перегрева. Женщины более склонны в силу анатомии.",
    "treatment": "Боэрхавия + гокшура + семена фенхеля по 1/2 ч.л. два раза. Чай из кумина, кориандра, фенхеля два-три раза в день. Чандрапрабха вати. Арбузный сок с 1/4 ч.л. кориандра. Охлаждающая диета, кокосовая вода. Исключить острое, кофе, алкоголь, кислое.",
    "chapters": [],
    "name_en": "Mutratisara (Cystitis)",
    "category_en": "Urogenital Diseases",
    "dosha_en": "Pitta",
    "desc_en": "Inflammation of the bladder (cystitis). Pitta in the urinary tract causes burning, sharp pain, and frequent painful urges. Arises from spicy food, alcohol, stress, and overheating. Women are more prone due to anatomy.",
    "treatment_en": "Boerhavia + gokshura + fennel seeds, 1/2 teaspoon twice a day. Cumin, coriander, and fennel tea two to three times a day. Chandraprabha vati. Watermelon juice with 1/4 teaspoon of coriander. Cooling diet, coconut water. Exclude spicy food, coffee, alcohol, and sour foods."
  },
  {
    "name": "Мутравидха (Недержание мочи)",
    "origin": "mūtravibhrama",
    "category": "Болезни мочеполовой системы",
    "dosha": "Вата",
    "desc": "Недержание мочи — потеря контроля над мочеиспусканием. Возбуждённая Вата нарушает нейромышечный контроль над сфинктером мочевого пузыря. У пожилых — общее ослабление Ваты и астхи-дхату. Провоцируется кашлем, смехом (стрессовое недержание).",
    "treatment": "Белое кунжутное семя с мелассой для успокоения Ваты. Ашваганда для укрепления нервов и мышц. Не пить жидкость за 2 часа до сна. Исключить кофеин. Упражнение Ашвини Мудра (сжимание мышц промежности) для укрепления сфинктера.",
    "chapters": [],
    "name_en": "Mutravibhrama (Urinary Incontinence)",
    "category_en": "Urogenital Diseases",
    "dosha_en": "Vata",
    "desc_en": "Urinary incontinence — loss of control over urination. Aggravated Vata disrupts the neuromuscular control of the bladder sphincter. In the elderly — a general weakening of Vata and asthi-dhatu. Provoked by coughing and laughing (stress incontinence).",
    "treatment_en": "White sesame seed with molasses to pacify Vata. Ashwagandha to strengthen the nerves and muscles. Avoid drinking fluids 2 hours before sleep. Exclude caffeine. Ashwini mudra exercise (contracting the perineal muscles) to strengthen the sphincter."
  },
  {
    "name": "Аштхила (Камни почек)",
    "origin": "aśmarī",
    "category": "Болезни мочеполовой системы",
    "dosha": "Вата / Питта / Капха",
    "desc": "Почечнокаменная болезнь. Три вида: кальциевые камни (Капха) — мягкие, малоболезненные; фосфатные (Вата) — шероховатые, раздражают мочевой пузырь; оксалатные (Питта) — острые, жгущие, кровоточащие. Острая боль при движении камня в мочеточник.",
    "treatment": "Пунарнава гуггул + гокшуради гуггул по 1 таблетке два раза. Острая боль: боэрхавия + мутрал + кориандр с пивом или ячменным отваром. Арбузный сок с кориандром. Чай из кумина + фенхель + муста. Чередование горячего и холодного компресса на область почек.",
    "chapters": [],
    "name_en": "Ashmari (Kidney Stones)",
    "category_en": "Urogenital Diseases",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Kidney stone disease. Three types: calcium stones (Kapha) — soft, mildly painful; phosphate stones (Vata) — rough, irritating to the bladder; oxalate stones (Pitta) — sharp, burning, cause bleeding. Acute pain occurs when a stone moves into the ureter.",
    "treatment_en": "Punarnava guggul + gokshuradi guggul, 1 tablet twice a day. For acute pain: boerhavia + mutral + coriander with beer or barley decoction. Watermelon juice with coriander. Tea of cumin + fennel + musta. Alternating hot and cold compresses over the kidney area."
  },
  {
    "name": "Крими-рога (Глистная инвазия)",
    "origin": "krimi roga",
    "category": "Паразитозы",
    "dosha": "Капха + Питта",
    "desc": "Кишечные паразиты (гельминтозы): аскариды, острицы, ленточные глисты. В Аюрведе относятся к крими-рога — болезням, вызванным «существами» (крими). Нарушают агни, создают аму, вызывают зуд в заднем проходе, нарушение сна, беспокойство у детей, потерю веса.",
    "treatment": "Виданга + шардуника + трикату по 1/4 ч.л. два раза в день после еды. Трипхала на ночь (1/2 ч.л. в стакане воды). Чеснок сырой натощак. При зуде в заднем проходе — масло маргозы наружно. Горькие травы: маргоза, куркума. Диета: исключить сладкое, молочное, клейкую пищу.",
    "chapters": [],
    "name_en": "Krimi Roga (Worm Infestation)",
    "category_en": "Parasitic Infections",
    "dosha_en": "Kapha + Pitta",
    "desc_en": "Intestinal parasites (helminthiasis): roundworms, pinworms, tapeworms. In Ayurveda classed as krimi-roga — diseases caused by \"creatures\" (krimi). Disrupt agni, create ama, cause anal itching, sleep disturbance, restlessness in children, and weight loss.",
    "treatment_en": "Vidanga + shardunika + trikatu, 1/4 teaspoon twice a day after meals. Triphala at night (1/2 teaspoon in a glass of water). Raw garlic on an empty stomach. For anal itching — neem oil applied topically. Bitter herbs: neem, turmeric. Diet: exclude sweets, dairy, and sticky foods."
  },
  {
    "name": "Кандарпа (Дрожжевые инфекции кишечника)",
    "origin": "kandarpā",
    "category": "Паразитозы",
    "dosha": "Питта + Капха",
    "desc": "Кандидоз кишечника и слизистых. Избыток Питты и Капхи создаёт среду для размножения Candida. Провоцируется сахаром, антибиотиками, дрожжевым хлебом, слабым агни. Проявляется молочницей, вздутием, усталостью, тягой к сладкому.",
    "treatment": "Куркума + корень солодки + шардуника два раза в день. Диета: строго исключить сахар, ферментированное, дрожжи. Трипхала для очищения кишечника. Чеснок — природный антифунгальный агент. Масло маргозы наружно. Восстановление агни: имбирь, трикату перед едой.",
    "chapters": [],
    "name_en": "Kandarpa (Intestinal Yeast Infections)",
    "category_en": "Parasitic Infections",
    "dosha_en": "Pitta + Kapha",
    "desc_en": "Intestinal and mucosal candidiasis. Excess Pitta and Kapha create an environment favorable for Candida growth. Provoked by sugar, antibiotics, yeast bread, and weak agni. Manifests as thrush, bloating, fatigue, and sugar cravings.",
    "treatment_en": "Turmeric + licorice root + shardunika twice a day. Diet: strictly exclude sugar, fermented foods, and yeast. Triphala to cleanse the intestines. Garlic — a natural antifungal agent. Neem oil applied topically. Restoration of agni: ginger, trikatu before meals."
  },
  {
    "name": "Карна-шула (Боль в ухе)",
    "origin": "karṇa śūla",
    "category": "Болезни ушей",
    "dosha": "Вата",
    "desc": "Боль в ухе от избытка Ваты, вызывающей сухость и образование корочек в слуховом канале. Вата делает барабанную перепонку менее гибкой. Отличать от инфекции наружного уха (отита) — при оттягивании мочки боль усиливается при отите.",
    "treatment": "При отите: масло чайного дерева на ватный тампон в ушную раковину. Смесь: масло чайного дерева + маргоза + кунжутное масло. Внутрь: куркума + «золотая печать» + эхинацея. Асафетида в ухо. Луковый сок с мёдом (5-10 капель). Тепло снаружи — горячий платок к уху. Чесночное масло 3 капли на ночь.",
    "chapters": [],
    "name_en": "Karna Shula (Earache)",
    "category_en": "Ear Diseases",
    "dosha_en": "Vata",
    "desc_en": "Earache from excess Vata, causing dryness and crust formation in the ear canal. Vata makes the eardrum less flexible. Distinguish from an outer-ear infection (otitis) — pain increases when the earlobe is pulled in otitis.",
    "treatment_en": "For otitis: tea tree oil on a cotton swab in the ear. A mixture of tea tree oil + neem + sesame oil. Internally: turmeric + \"golden seal\" + echinacea. Asafoetida in the ear. Onion juice with honey (5-10 drops). External warmth — a hot cloth to the ear. Garlic oil, 3 drops at bedtime."
  },
  {
    "name": "Карна-кшведа (Звон в ушах)",
    "origin": "karṇa kṣveda",
    "category": "Болезни ушей",
    "dosha": "Вата",
    "desc": "Тиннитус (звон, шум в ушах) — расстройство Ваты в нервной системе, прежде всего прана-Ваты, управляющей слухом. Снижение нервной проводимости вызывает патологические звуковые ощущения. Усиливается при переохлаждении, усталости, стрессе.",
    "treatment": "Йогарадж гуггул 200 мг два-три раза в день. Чай из ромашки + корица + окопник. Масляный массаж области сосцевидного отростка тёплым кунжутным маслом утром и вечером. Чесночное масло — 3 капли в ухо на ночь. Диета против Ваты: избегать воздушной кукурузы, бобовых, сырых овощей.",
    "chapters": [],
    "name_en": "Karna Kshveda (Tinnitus)",
    "category_en": "Ear Diseases",
    "dosha_en": "Vata",
    "desc_en": "Tinnitus (ringing, noise in the ears) — a disorder of Vata in the nervous system, primarily of prana-vata, which governs hearing. A decrease in nerve conduction causes pathological sound sensations. Worsens with chilling, fatigue, and stress.",
    "treatment_en": "Yogaraj guggul, 200 mg two to three times a day. Tea of chamomile + cinnamon + comfrey. Oil massage of the mastoid area with warm sesame oil morning and evening. Garlic oil — 3 drops in the ear at bedtime. An anti-Vata diet: avoid popcorn, legumes, raw vegetables."
  },
  {
    "name": "Карна-байрья (Нарушение слуха)",
    "origin": "karṇa bādhirya",
    "category": "Болезни ушей",
    "dosha": "Вата",
    "desc": "Снижение слуха у пожилых (нейросенсорная тугоухость). Прана-Вата ослабевает с возрастом, снижая нервную проводимость слухового нерва. Признак общего усиления Ваты в пожилом возрасте.",
    "treatment": "Йогарадж гуггул 200 мг два-три раза в день. Чесночное масло: 5-10 капель тёплого в ухо (только при отсутствии инфекции). Диета против Ваты: тёплое, влажное, питательное. Позы Льва, Верблюда, Головы Коровы. Пранаяма «Чередуя ноздри». Избегать переохлаждения и сквозняков.",
    "chapters": [],
    "name_en": "Karna Badhirya (Hearing Loss)",
    "category_en": "Ear Diseases",
    "dosha_en": "Vata",
    "desc_en": "Hearing loss in the elderly (sensorineural deafness). Prana-vata weakens with age, reducing the conduction of the auditory nerve. A sign of the general increase of Vata in old age.",
    "treatment_en": "Yogaraj guggul, 200 mg two to three times a day. Garlic oil: 5-10 warm drops in the ear (only in the absence of infection). An anti-Vata diet: warm, moist, nourishing food. Lion, Camel, and Cow Head poses. \"Alternate nostril\" pranayama. Avoid chilling and drafts."
  },
  {
    "name": "Аллергия (Сатмья-виродха)",
    "origin": "sātmya virodha",
    "category": "Иммунные нарушения",
    "dosha": "Вата / Питта / Капха",
    "desc": "Аллергические реакции — ответ дош на специфический аллерген. Вата-аллергия: вздутие, бронхоспазм, чихание, бессонница. Питта-аллергия: крапивница, кожная сыпь, зуд, экзема, дерматит. Капха-аллергия: сенная лихорадка, насморк, кашель, бронхиальная астма (весенняя).",
    "treatment": "Вата: ашваганда + бала + видари, клизма с дашамулой. Питта: шатавари + гудучи, манжишта + маргоза для очищения крови. Капха: ситопалади + солодка + абрак басма с мёдом. Трипхала на ночь при всех типах. Смазывать слизистую носа маслом ги. Уджайи пранаяма для иммунитета.",
    "chapters": [],
    "name_en": "Satmya Virodha (Allergy)",
    "category_en": "Immune Disorders",
    "dosha_en": "Vata / Pitta / Kapha",
    "desc_en": "Allergic reactions — a dosha response to a specific allergen. Vata allergy: bloating, bronchospasm, sneezing, insomnia. Pitta allergy: hives, skin rash, itching, eczema, dermatitis. Kapha allergy: hay fever, runny nose, cough, bronchial asthma (seasonal, spring).",
    "treatment_en": "Vata: ashwagandha + bala + vidari, dashamula enema. Pitta: shatavari + guduchi, manjishtha + neem to purify the blood. Kapha: sitopaladi + licorice + abhrak bhasma with honey. Triphala at night for all types. Coat the nasal mucosa with ghee. Ujjayi pranayama for immunity."
  },
  {
    "name": "Хроническая усталость (Клама)",
    "origin": "klama",
    "category": "Иммунные нарушения",
    "dosha": "Питта",
    "desc": "Синдром хронической усталости. В Аюрведе — застойная Питта в печени (вирус Эпштейна-Барр = Питта-тип). Также: слабость агни, снижение функции надпочечников, анемия. Продолжительная усталость после инфекций указывает на истощение ткани раса-дхату.",
    "treatment": "Шатавари + бала + видари + кама дудха по 1/2 ч.л. два-три раза с шатавари-гхи. Для печени: читрак + катука. Укрепление тканей: финики в гхи с имбирём и шафраном (1 финик утром). Манго + тёплое молоко с гхи для восстановления сил. Диета для Питты. Регулярные умеренные прогулки.",
    "chapters": [],
    "name_en": "Klama (Chronic Fatigue)",
    "category_en": "Immune Disorders",
    "dosha_en": "Pitta",
    "desc_en": "Chronic fatigue syndrome. In Ayurveda — stagnant Pitta in the liver (Epstein-Barr virus = Pitta type). Also: weak agni, reduced adrenal function, anemia. Prolonged fatigue after infections indicates depletion of the rasa-dhatu tissue.",
    "treatment_en": "Shatavari + bala + vidari + kama dudha, 1/2 teaspoon two to three times a day with shatavari ghee. For the liver: chitrak + katuka. Tissue strengthening: dates in ghee with ginger and saffron (1 date in the morning). Mango + warm milk with ghee to restore strength. A Pitta-pacifying diet. Regular moderate walks."
  },
  {
    "name": "Вьяситадоша (Астма бронхиальная)",
    "origin": "śvāsa roga",
    "category": "Иммунные нарушения",
    "dosha": "Капха + Вата",
    "desc": "Бронхиальная астма (шваса-рога). Накопление Капхи в желудке движется в лёгкие и бронхи, вызывая спазм и затруднение дыхания. Вата усиливает бронхоспазм. Провоцируется аллергенами, холодом, пылью, шерстью животных, молочной пищей.",
    "treatment": "При приступе: чай из солодки с 5-10 каплями маханараян или гхи. Корица + трикату с мёдом дважды в день. Горчичное масло для растирания груди. Пиппали + лавровый лист + мёд. Ситопалади + боэрхавия + щепоть абрак басма с мёдом. Позы Лука, Кобры, Стойка на Плечах. Бхастрика при Капха-типе.",
    "chapters": [],
    "name_en": "Shvasa Roga (Bronchial Asthma)",
    "category_en": "Immune Disorders",
    "dosha_en": "Kapha + Vata",
    "desc_en": "Bronchial asthma (shvasa-roga). Accumulation of Kapha in the stomach travels to the lungs and bronchi, causing spasm and difficulty breathing. Vata intensifies the bronchospasm. Provoked by allergens, cold, dust, animal hair, and dairy food.",
    "treatment_en": "During an attack: licorice tea with 5-10 drops of mahanarayan oil or ghee. Cinnamon + trikatu with honey twice a day. Mustard oil for rubbing on the chest. Pippali + bay leaf + honey. Sitopaladi + boerhavia + a pinch of abhrak bhasma with honey. Bow, Cobra, Shoulder Stand poses. Bhastrika for the Kapha type."
  },
  {
    "name": "Раджаякшма",
    "origin": "rājayakṣma",
    "category": "Дыхательные болезни",
    "dosha": "Все три доши",
    "desc": "«Царская чахотка» — туберкулёз/тяжёлое истощение. Возникает от подавления естественных позывов, истощения тканей, чрезмерного напряжения и нерегулярного питания; поражает все дхату по порядку, начиная с расы.",
    "treatment": "Питательная (бримхана) терапия: молоко, гхи, мясные отвары; расаяны для восстановления тканей; покой, отказ от подавления позывов и от чрезмерного полового истощения.",
    "chapters": [
      "Мадхава-нидана, Гл.9"
    ],
    "name_en": "Rajayakshma",
    "category_en": "Respiratory Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "\"Royal consumption\" — tuberculosis / severe wasting. Arises from suppression of natural urges, tissue depletion, excessive exertion, and irregular diet; affects all the dhatus in sequence, starting with rasa.",
    "treatment_en": "Nourishing (brimhana) therapy: milk, ghee, meat broths; rasayanas to restore the tissues; rest, abstaining from suppressing urges and from excessive sexual depletion."
  },
  {
    "name": "Мадатьяя (Панатьяя)",
    "origin": "madātyaya / pānātyaya",
    "category": "Отравления и токсикозы",
    "dosha": "Все три доши",
    "desc": "Алкогольное отравление и его осложнения. Свойства вина подобны свойствам яда; при неправильном употреблении вызывает тяжёлое расстройство — панатьяю, парамаду (чрезмерное опьянение), панаджирну (несварение от алкоголя) и панавибхраму (алкогольный бред).",
    "treatment": "Охлаждающая, увлажняющая терапия; кислые и сладкие соки, гранатовый и виноградный сок; отказ от дальнейшего приёма вина; при бреде — успокаивающие Питту и Вату средства.",
    "chapters": [
      "Мадхава-нидана, Гл.17"
    ],
    "name_en": "Madatyaya (Panatyaya)",
    "category_en": "Poisonings and Toxicoses",
    "dosha_en": "All three doshas",
    "desc_en": "Alcohol poisoning and its complications. The properties of wine resemble those of poison; when consumed improperly it causes severe disorder — panatyaya, paramada (excessive intoxication), panajirna (indigestion from alcohol), and panavibhrama (alcoholic delirium).",
    "treatment_en": "Cooling, moistening therapy; sour and sweet juices, pomegranate and grape juice; abstaining from further wine consumption; for delirium — remedies that pacify Pitta and Vata."
  },
  {
    "name": "Урустамбха",
    "origin": "ūrustambha",
    "category": "Болезни суставов",
    "dosha": "Вата + Капха",
    "desc": "Оцепенение и тяжесть бёдер: Вата вместе с Капхой и жиром, накопив непереваренную аму, устремляется в бёдра — они становятся холодными, тяжёлыми, лишёнными чувствительности. Другое название — Адхья-Вата.",
    "treatment": "Сухие, разжигающие пищеварение средства (порошок шад-дхарана, трифала с мёдом, гуггулу с мочой); лёгкая, обезжиренная диета; умащение маслом — только после устранения избытка Капхи и жира.",
    "chapters": [
      "Мадхава-нидана, Гл.22"
    ],
    "name_en": "Urustambha",
    "category_en": "Joint Diseases",
    "dosha_en": "Vata + Kapha",
    "desc_en": "Stiffness and heaviness of the thighs: Vata, together with Kapha and fat, having accumulated undigested ama, rushes into the thighs — they become cold, heavy, and devoid of sensation. Another name is Adhya-Vata.",
    "treatment_en": "Dry, digestion-kindling remedies (shad-dharana powder, triphala with honey, guggulu with cow's urine); a light, fat-free diet; oil unction only after the excess of Kapha and fat has been eliminated."
  },
  {
    "name": "Амавата",
    "origin": "āmavāta",
    "category": "Болезни суставов",
    "dosha": "Вата + Ама",
    "desc": "Ревматоидный артрит — соединение возбуждённой Ваю с амой (непереваренными веществами) у людей с несовместимым питанием и слабым пищеварительным огнём. Ама, движимая Ваю, проникает в сосуды и суставы, вызывая опухание, скованность и боль.",
    "treatment": "Сначала лангхана (голодание/лёгкая диета) для переваривания амы, затем разжигающие пищеварение средства; вата-устраняющие масла и прогревание после устранения амы; отказ от тяжёлой и несовместимой пищи.",
    "chapters": [
      "Мадхава-нидана, Гл.23"
    ],
    "name_en": "Amavata",
    "category_en": "Joint Diseases",
    "dosha_en": "Vata + Ama",
    "desc_en": "Rheumatoid arthritis — the combination of aggravated Vayu with ama (undigested substances) in people with incompatible food combinations and weak digestive fire. Ama, driven by Vayu, penetrates the vessels and joints, causing swelling, stiffness, and pain.",
    "treatment_en": "First langhana (fasting/light diet) to digest the ama, then digestion-kindling remedies; Vata-pacifying oils and heat therapy after the ama has been eliminated; avoidance of heavy and incompatible food."
  },
  {
    "name": "Шула",
    "origin": "śūla",
    "category": "Болезни живота",
    "dosha": "Преимущественно Вата",
    "desc": "Колика — острая боль в животе восьми видов (по дошам отдельно, совместно и попарно), с преобладанием Ваты во всех формах. Паринама-шула — колика при переваривании пищи, аннадрава-шула — колика от пищевой жидкости.",
    "treatment": "Разжигающие пищеварение и ветрогонные средства (хингу, аджамода, чёрная соль); тёплые компрессы на живот; избегать переедания, сухой и чрезмерно охлаждающей пищи.",
    "chapters": [
      "Мадхава-нидана, Гл.24"
    ],
    "name_en": "Shula",
    "category_en": "Abdominal Diseases",
    "dosha_en": "Predominantly Vata",
    "desc_en": "Colic — acute abdominal pain of eight types (by dosha separately, jointly, and in pairs), with Vata predominating in all forms. Parinama-shula is colic occurring during digestion, annadrava-shula is colic from liquid food.",
    "treatment_en": "Digestion-kindling and carminative remedies (hingu, ajamoda, black salt); warm compresses on the abdomen; avoiding overeating, dry food, and excessively cooling food."
  },
  {
    "name": "Удаварта",
    "origin": "udāvarta",
    "category": "Болезни живота",
    "dosha": "Вата",
    "desc": "Обратное движение Ваю вследствие подавления естественных позывов — отхождения газов, дефекации, мочеиспускания, зевоты, чихания, отрыжки и других. Сопровождается вздутием, задержкой газов и мочи, болью в животе.",
    "treatment": "Слабительные и ветрогонные клизмы (васти); отказ от подавления позывов организма; тёплое масло и разжигающие пищеварение специи.",
    "chapters": [
      "Мадхава-нидана, Гл.25"
    ],
    "name_en": "Udavarta",
    "category_en": "Abdominal Diseases",
    "dosha_en": "Vata",
    "desc_en": "Reverse movement of Vayu caused by suppression of natural urges — passing gas, defecation, urination, yawning, sneezing, belching, and others. Accompanied by bloating, retention of gas and urine, and abdominal pain.",
    "treatment_en": "Laxative and carminative enemas (vasti); avoidance of suppressing the body's natural urges; warm oil and digestion-kindling spices."
  },
  {
    "name": "Гулма",
    "origin": "gulma",
    "category": "Болезни живота",
    "dosha": "Все три доши",
    "desc": "Узловидное образование внутри брюшной полости, возникающее от испорченных дош при неправильном питании и образе жизни; локализуется в боковых областях живота, в области сердца, пупка или мочевого пузыря; подвижное или неподвижное, с нарастанием и убыванием.",
    "treatment": "Разжигающие пищеварение и рассасывающие средства (пиппали, читрака, гуггулу); при застарелой форме — очищение рвотным и слабительным; диета без тяжёлой и слизеобразующей пищи.",
    "chapters": [
      "Мадхава-нидана, Гл.26"
    ],
    "name_en": "Gulma",
    "category_en": "Abdominal Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "A nodular mass within the abdominal cavity, arising from vitiated doshas due to improper diet and lifestyle; located in the flanks of the abdomen, in the region of the heart, navel, or bladder; may be mobile or fixed, waxing and waning.",
    "treatment_en": "Digestion-kindling and resolving remedies (pippali, chitraka, guggulu); for the chronic form — purification with emetics and purgatives; a diet free of heavy and mucus-forming food."
  },
  {
    "name": "Медорога",
    "origin": "medoroga",
    "category": "Нарушения обмена веществ",
    "dosha": "Капха + Медас (жировая ткань)",
    "desc": "Ожирение — избыточное накопление жировой ткани (медас) вследствие отказа от физических упражнений, дневного сна и пищи, увеличивающей Капху. Закрытые пути питания прочих тканей делают человека неспособным к деятельности.",
    "treatment": "Истончающая (лекхана) терапия: мёд, тёплая вода, гуггулу, трифала; регулярные физические упражнения; лёгкая, сухая, несладкая пища; отказ от дневного сна.",
    "chapters": [
      "Мадхава-нидана, Гл.32"
    ],
    "name_en": "Medoroga",
    "category_en": "Metabolic Disorders",
    "dosha_en": "Kapha + Medas (adipose tissue)",
    "desc_en": "Obesity — excessive accumulation of adipose tissue (medas) resulting from abstaining from physical exercise, daytime sleep, and food that increases Kapha. Blocked channels of nourishment to the other tissues render the person incapable of activity.",
    "treatment_en": "Thinning (lekhana) therapy: honey, warm water, guggulu, triphala; regular physical exercise; light, dry, unsweetened food; avoidance of daytime sleep."
  },
  {
    "name": "Шотха",
    "origin": "śotha",
    "category": "Застойные болезни",
    "dosha": "Все три доши",
    "desc": "Отёк — испорченная Вата увлекает наружу через сосуды испорченные ракту, Питту и Капху, вызывая плотную припухлость кожи и мышц. Различают девять разновидностей по причинам и особенностям проявления.",
    "treatment": "Мочегонные и разжигающие пищеварение средства; ограничение соли и жидкости; при тяжёлых формах — кровопускание и слабительное по преобладающей доше.",
    "chapters": [
      "Мадхава-нидана, Гл.34"
    ],
    "name_en": "Shotha",
    "category_en": "Congestive Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Edema — vitiated Vata draws vitiated rakta, Pitta, and Kapha outward through the vessels, causing a dense swelling of the skin and muscles. Nine varieties are distinguished by cause and manifestation.",
    "treatment_en": "Diuretic and digestion-kindling remedies; restriction of salt and fluids; in severe forms — bloodletting and purgation according to the predominant dosha."
  },
  {
    "name": "Вриддхи",
    "origin": "vṛddhi",
    "category": "Мужские болезни",
    "dosha": "Все три доши",
    "desc": "Увеличение мошонки (грыжа/водянка яичка) — Вайю с нисходящим движением проникает в оболочки мошонки через паховую область, вызывая её увеличение. Обусловлена нарушениями дош, крови, жира, мочи или кишечника — семь разновидностей.",
    "treatment": "В зависимости от причины: ветрогонные и разжигающие средства при ватной форме; при осложнённых формах — хирургическое вмешательство; поддерживающий бандаж.",
    "chapters": [
      "Мадхава-нидана, Гл.35"
    ],
    "name_en": "Vriddhi",
    "category_en": "Men's Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Enlargement of the scrotum (hernia/hydrocele) — Vayu, moving downward, penetrates the scrotal membranes through the inguinal region, causing it to enlarge. Caused by disturbances of the doshas, blood, fat, urine, or intestines — seven varieties.",
    "treatment_en": "Depending on the cause: carminative and digestion-kindling remedies for the Vata form; for complicated forms — surgical intervention; a supportive bandage."
  },
  {
    "name": "Галаганда",
    "origin": "gaḍagaṇḍa",
    "category": "Застойные болезни",
    "dosha": "Вата + Капха + Медас",
    "desc": "Зоб — припухлость, свисающая на шее, подобно мошонке. Вата и Капха, испорченные в области шеи и гортани, вместе с жировой тканью образуют вздутие (ганда). Родственные состояния: гандамала (шейный лимфаденит), апачи (скрофулёз), грантхи и арбуда (опухоли).",
    "treatment": "Рассасывающие и разжигающие средства (куркума, гуггулу, каланчакра); избегать пищи, увеличивающей Капху; в упорных случаях — хирургическое удаление узла.",
    "chapters": [
      "Мадхава-нидана, Гл.36"
    ],
    "name_en": "Galaganda",
    "category_en": "Congestive Diseases",
    "dosha_en": "Vata + Kapha + Medas",
    "desc_en": "Goiter — a swelling hanging on the neck, resembling a scrotum. Vata and Kapha, vitiated in the neck and throat region, together with fat tissue, form the swelling (ganda). Related conditions: gandamala (cervical lymphadenitis), apachi (scrofula), granthi, and arbuda (tumors).",
    "treatment_en": "Resolving and digestion-kindling remedies (turmeric, guggulu, kalanchakra); avoiding food that increases Kapha; in persistent cases — surgical removal of the node."
  },
  {
    "name": "Шлипада",
    "origin": "ślīpada",
    "category": "Застойные болезни",
    "dosha": "Все три доши",
    "desc": "Слоновость — отёк, возникающий в паху с лихорадкой и сильной болью, постепенно опускающийся к стопам; может возникать также на руках, ушах, глазах, половом члене, губах и носу. Ватная форма — чёрного цвета, сухая, с трещинами и сильной болью.",
    "treatment": "Очищение и разжигание пищеварения по преобладающей доше; тугое бинтование поражённой конечности; растительные средства против отёка (гуггулу, трифала).",
    "chapters": [
      "Мадхава-нидана, Гл.37"
    ],
    "name_en": "Slipada",
    "category_en": "Congestive Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Elephantiasis — swelling that arises in the groin with fever and severe pain, gradually descending to the feet; can also occur on the hands, ears, eyes, penis, lips, and nose. The Vata form is black, dry, cracked, and very painful.",
    "treatment_en": "Purification and digestion-kindling according to the predominant dosha; tight bandaging of the affected limb; herbal remedies against swelling (guggulu, triphala)."
  },
  {
    "name": "Видрадхи",
    "origin": "vidradhi",
    "category": "Воспалительные болезни",
    "dosha": "Все три доши",
    "desc": "Внутренний абсцесс — доши, загрязняя кожу, кровь, мышцы, жир и кости, постепенно порождают грозный, сильно выступающий отёк с широким основанием, болезненный, округлый или продолговатый; известно шесть разновидностей.",
    "treatment": "На ранней стадии — рассасывающие средства и прогревание; при созревании — вскрытие и дренирование хирургическим путём, как указано в разделе Чикитса-стханы; заживляющие масла после вскрытия.",
    "chapters": [
      "Мадхава-нидана, Гл.38",
      "Чикитса стхана, Гл.16"
    ],
    "name_en": "Vidradhi",
    "category_en": "Inflammatory Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Internal abscess — the doshas, contaminating the skin, blood, muscle, fat, and bone, gradually give rise to a formidable, prominently raised swelling with a broad base, painful, round or oblong; six varieties are known.",
    "treatment_en": "In the early stage — resolving remedies and heat therapy; upon maturation — surgical incision and drainage, as indicated in the Chikitsa Sthana section; healing oils after incision."
  },
  {
    "name": "Упаданша",
    "origin": "upadaṃśa",
    "category": "Мужские болезни",
    "dosha": "Все три доши + кровь",
    "desc": "Венерические язвы полового члена — возникают от ударов, царапин, чрезмерного полового сношения или заражения через больное влагалище партнёрши; известно пять видов, различающихся по преобладающей доше и характеру высыпаний (колющая боль и чёрные пузырьки — от Ваты; жёлтые пузырьки с жжением — от Питты).",
    "treatment": "Промывание и обмазывание вяжущими и заживляющими средствами по преобладающей доше; воздержание от половых сношений на время лечения; общее очищение организма.",
    "chapters": [
      "Мадхава-нидана, Гл.45"
    ],
    "name_en": "Upadamsha",
    "category_en": "Men's Diseases",
    "dosha_en": "All three doshas + blood",
    "desc_en": "Venereal ulcers of the penis — arise from blows, scratches, excessive intercourse, or infection through a diseased vagina of a partner; five types are known, differing by predominant dosha and character of the eruptions (stabbing pain and black blisters — from Vata; yellow blisters with burning — from Pitta).",
    "treatment_en": "Washing and application of astringent and healing remedies according to the predominant dosha; abstinence from sexual intercourse during treatment; general purification of the body."
  },
  {
    "name": "Шитапитта (Ударда)",
    "origin": "śītapitta / udarda",
    "category": "Кожные болезни",
    "dosha": "Капха + Вата + Питта",
    "desc": "Крапивница — от соприкосновения с холодным ветром возбуждённые Капха и Вата, соединившись с Питтой, распространяются по коже, вызывая зудящие волдыри. Продромальные признаки: жажда, отвращение к пище, тошнота, покраснение глаз.",
    "treatment": "Тёплые, лёгкие, разжигающие процедуры; избегание холода и сырости; очищающие кожу растирания и обмазывания охлаждающими, но не холодными средствами.",
    "chapters": [
      "Мадхава-нидана, Гл.48"
    ],
    "name_en": "Shitapitta (Udarda)",
    "category_en": "Skin Diseases",
    "dosha_en": "Kapha + Vata + Pitta",
    "desc_en": "Urticaria (hives) — from contact with cold wind, aggravated Kapha and Vata, combining with Pitta, spread through the skin, causing itchy welts. Prodromal signs: thirst, aversion to food, nausea, redness of the eyes.",
    "treatment_en": "Warm, light, digestion-kindling procedures; avoidance of cold and dampness; cleansing rubs and applications of cooling, but not cold, remedies."
  },
  {
    "name": "Амлапитта",
    "origin": "amlapitta",
    "category": "Болезни пищеварения",
    "dosha": "Питта",
    "desc": "«Кислая Питта» — изжога, кислая и горькая отрыжка от несовместимой, испорченной, кислой и острой пищи; переваренная ненадлежащим образом Питта накапливается в желудке. Сопровождается тяжестью, жжением в области сердца и горла, отвращением к пище.",
    "treatment": "Охлаждающие, вяжущие и сладкие средства (амалаки, солодка, гхи); избегать кислой, острой, жареной пищи; лёгкое слабительное при упорном течении.",
    "chapters": [
      "Мадхава-нидана, Гл.49"
    ],
    "name_en": "Amlapitta",
    "category_en": "Digestive Diseases",
    "dosha_en": "Pitta",
    "desc_en": "\"Sour Pitta\" — heartburn, sour and bitter belching from incompatible, spoiled, sour, and pungent food; improperly digested Pitta accumulates in the stomach. Accompanied by heaviness, burning in the region of the heart and throat, and aversion to food.",
    "treatment_en": "Cooling, astringent, and sweet remedies (amalaki, licorice, ghee); avoidance of sour, pungent, and fried food; a mild laxative for persistent cases."
  },
  {
    "name": "Виспхота",
    "origin": "visphoṭa",
    "category": "Кожные болезни",
    "dosha": "Все три доши + кровь",
    "desc": "Пустулёзные высыпания — от острой, кислой, едкой пищи и чрезмерного пребывания на солнце возбуждённые доши укореняются в коже, крови, мышцах и костях, вызывая грозные высыпания, которым всегда предшествует лихорадка.",
    "treatment": "Очищение крови (кровопускание, горькие травы); охлаждающие обмазывания; жаропонижающие средства на начальной стадии.",
    "chapters": [
      "Мадхава-нидана, Гл.51"
    ],
    "name_en": "Visphota",
    "category_en": "Skin Diseases",
    "dosha_en": "All three doshas + blood",
    "desc_en": "Pustular eruptions — from pungent, sour, caustic food and excessive sun exposure, aggravated doshas take root in the skin, blood, muscles, and bones, causing formidable eruptions that are always preceded by fever.",
    "treatment_en": "Blood purification (bloodletting, bitter herbs); cooling applications; antipyretic remedies in the initial stage."
  },
  {
    "name": "Асригдара",
    "origin": "asṛgdara",
    "category": "Женские болезни",
    "dosha": "Все три доши",
    "desc": "Аномальное маточное кровотечение (прадара) — от несовместимой пищи, злоупотребления вином, выкидыша, чрезмерного полового сношения, травмы или дневного сна. При затяжном течении вызывает слабость, головокружение, обморок, бледность.",
    "treatment": "Кровоостанавливающие и вяжущие средства по преобладающей доше; покой, лёгкая укрепляющая диета; при тяжёлом истощении — восстановительная (бримхана) терапия.",
    "chapters": [
      "Мадхава-нидана, Гл.59"
    ],
    "name_en": "Asrigdara",
    "category_en": "Women's Diseases",
    "dosha_en": "All three doshas",
    "desc_en": "Abnormal uterine bleeding (pradara) — from incompatible food, alcohol abuse, miscarriage, excessive intercourse, injury, or daytime sleep. In prolonged cases causes weakness, dizziness, fainting, and pallor.",
    "treatment_en": "Hemostatic and astringent remedies according to the predominant dosha; rest, a light restorative diet; for severe depletion — restorative (brimhana) therapy."
  }
];

// Group diseases by category
export function getDiseaseCategories() {
  const cats = {};
  for (const d of DISEASES) {
    if (!cats[d.category]) cats[d.category] = [];
    cats[d.category].push(d);
  }
  return cats;
}
