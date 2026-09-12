// Таблица оптимального времени приёма продуктов
// Источник: аюрведические рекомендации (аспект переваривания в желудке и всасывания в тонком кишечнике)
// "С часов" — от какого часа можно употреблять продукт
// "До часов" — до какого часа лучше употреблять продукт

export const FOOD_TABLE = [
  {
    "category": "Молочные продукты",
    "icon": "🥛",
    "iconKey": "ft_dairy",
    "items": [
      {
        "name": "Молоко",
        "from": 6,
        "to": 21,
        "name_en": "Milk"
      },
      {
        "name": "Масло сливочное",
        "from": 7,
        "to": 19,
        "name_en": "Butter"
      },
      {
        "name": "Ряженка",
        "from": 7,
        "to": 19,
        "name_en": "Ryazhenka (Baked Fermented Milk)"
      },
      {
        "name": "Сметана",
        "from": 8,
        "to": 19,
        "name_en": "Sour Cream"
      },
      {
        "name": "Кефир",
        "from": 8,
        "to": 16,
        "name_en": "Kefir"
      },
      {
        "name": "Чистый йогурт",
        "from": 9,
        "to": 16,
        "name_en": "Plain Yogurt"
      },
      {
        "name": "Творог",
        "from": 9,
        "to": 18,
        "name_en": "Cottage Cheese"
      },
      {
        "name": "Сыр",
        "from": 10,
        "to": 19,
        "name_en": "Cheese"
      },
      {
        "name": "Простокваша",
        "from": 10,
        "to": 16,
        "name_en": "Prostokvasha (Soured Milk)"
      },
      {
        "name": "Гхи (топлёное масло)",
        "from": 6,
        "to": 21,
        "name_en": "Ghee (Clarified Butter)"
      },
      {
        "name": "Сыр панир",
        "from": 10,
        "to": 17,
        "name_en": "Paneer Cheese"
      },
      {
        "name": "Сливки",
        "from": 9,
        "to": 18,
        "name_en": "Cream"
      },
      {
        "name": "Айран",
        "from": 8,
        "to": 17,
        "name_en": "Ayran"
      },
      {
        "name": "Топлёное молоко",
        "from": 6,
        "to": 21,
        "name_en": "Baked Milk"
      },
      {
        "name": "Козье молоко",
        "from": 6,
        "to": 20,
        "name_en": "Goat Milk"
      },
      {
        "name": "Ласси",
        "from": 9,
        "to": 16,
        "name_en": "Lassi"
      }
    ],
    "category_en": "Dairy Products"
  },
  {
    "category": "Специи",
    "icon": "🌿",
    "iconKey": "ft_spice",
    "items": [
      {
        "name": "Фенхель",
        "from": 5,
        "to": 21,
        "name_en": "Fennel"
      },
      {
        "name": "Бадьян",
        "from": 5,
        "to": 17,
        "name_en": "Star Anise"
      },
      {
        "name": "Ваниль",
        "from": 5,
        "to": 17,
        "name_en": "Vanilla"
      },
      {
        "name": "Корица",
        "from": 6,
        "to": 17,
        "name_en": "Cinnamon"
      },
      {
        "name": "Кардамон зелёный",
        "from": 7,
        "to": 21,
        "name_en": "Green Cardamom"
      },
      {
        "name": "Тмин",
        "from": 10,
        "to": 18,
        "name_en": "Caraway"
      },
      {
        "name": "Имбирь",
        "from": 10,
        "to": 17,
        "name_en": "Ginger"
      },
      {
        "name": "Кумин",
        "from": 10,
        "to": 16,
        "name_en": "Cumin"
      },
      {
        "name": "Куркума",
        "from": 10,
        "to": 17,
        "name_en": "Turmeric"
      },
      {
        "name": "Лавровый лист",
        "from": 10,
        "to": 15,
        "name_en": "Bay Leaf"
      },
      {
        "name": "Мак чёрный",
        "from": 10,
        "to": 15,
        "name_en": "Black Poppy Seed"
      },
      {
        "name": "Манго (порошок)",
        "from": 10,
        "to": 17,
        "name_en": "Mango Powder"
      },
      {
        "name": "Шамбала (плоды)",
        "from": 11,
        "to": 14,
        "name_en": "Fenugreek (Seeds)"
      },
      {
        "name": "Асафетида",
        "from": 11,
        "to": 17,
        "name_en": "Asafoetida"
      },
      {
        "name": "Гвоздика",
        "from": 11,
        "to": 18,
        "name_en": "Clove"
      },
      {
        "name": "Горчица чёрная",
        "from": 11,
        "to": 14,
        "name_en": "Black Mustard"
      },
      {
        "name": "Горчица жёлтая",
        "from": 11,
        "to": 14,
        "name_en": "Yellow Mustard"
      },
      {
        "name": "Калиджи",
        "from": 11,
        "to": 18,
        "name_en": "Kalonji (Nigella Seeds)"
      },
      {
        "name": "Кориандр",
        "from": 11,
        "to": 16,
        "name_en": "Coriander"
      },
      {
        "name": "Мускатный орех",
        "from": 11,
        "to": 16,
        "name_en": "Nutmeg"
      },
      {
        "name": "Перец душистый",
        "from": 11,
        "to": 19,
        "name_en": "Allspice"
      },
      {
        "name": "Перец чёрный",
        "from": 11,
        "to": 15,
        "name_en": "Black Pepper"
      },
      {
        "name": "Перец красный (ср. жг.)",
        "from": 11,
        "to": 14,
        "name_en": "Red Pepper (Medium Heat)"
      },
      {
        "name": "Перец чили",
        "from": 11,
        "to": 16,
        "name_en": "Chili Pepper"
      },
      {
        "name": "Перец паприка",
        "from": 11,
        "to": 14,
        "name_en": "Paprika"
      },
      {
        "name": "Шафран",
        "from": 6,
        "to": 20,
        "name_en": "Saffron"
      },
      {
        "name": "Анис",
        "from": 5,
        "to": 18,
        "name_en": "Anise"
      },
      {
        "name": "Пажитник (метхи)",
        "from": 11,
        "to": 15,
        "name_en": "Fenugreek (Methi)"
      },
      {
        "name": "Сумах",
        "from": 10,
        "to": 17,
        "name_en": "Sumac"
      },
      {
        "name": "Гарам масала",
        "from": 10,
        "to": 17,
        "name_en": "Garam Masala"
      },
      {
        "name": "Чёрная соль",
        "from": 9,
        "to": 18,
        "name_en": "Black Salt"
      },
      {
        "name": "Карри лист",
        "from": 9,
        "to": 18,
        "name_en": "Curry Leaf"
      },
      {
        "name": "Розовый перец",
        "from": 10,
        "to": 17,
        "name_en": "Pink Pepper"
      },
      {
        "name": "Амчур",
        "from": 10,
        "to": 17,
        "name_en": "Amchur (Dried Mango Powder)"
      }
    ],
    "category_en": "Spices"
  },
  {
    "category": "Фрукты, сухофрукты, ягоды и мёд",
    "icon": "🍎",
    "iconKey": "ft_fruit",
    "items": [
      {
        "name": "Изюм",
        "from": 6,
        "to": 18,
        "name_en": "Raisins"
      },
      {
        "name": "Крыжовник",
        "from": 6,
        "to": 18,
        "name_en": "Gooseberry"
      },
      {
        "name": "Мёд",
        "from": 6,
        "to": 18,
        "name_en": "Honey"
      },
      {
        "name": "Финик",
        "from": 6,
        "to": 19,
        "name_en": "Date"
      },
      {
        "name": "Чернослив",
        "from": 6,
        "to": 17,
        "name_en": "Prune"
      },
      {
        "name": "Абрикос",
        "from": 7,
        "to": 16,
        "name_en": "Apricot"
      },
      {
        "name": "Банан",
        "from": 7,
        "to": 20,
        "name_en": "Banana"
      },
      {
        "name": "Виноград",
        "from": 7,
        "to": 18,
        "name_en": "Grapes"
      },
      {
        "name": "Курага",
        "from": 7,
        "to": 16,
        "name_en": "Dried Apricot"
      },
      {
        "name": "Персик",
        "from": 7,
        "to": 15,
        "name_en": "Peach"
      },
      {
        "name": "Слива",
        "from": 7,
        "to": 16,
        "name_en": "Plum"
      },
      {
        "name": "Смородина чёрная",
        "from": 7,
        "to": 20,
        "name_en": "Black Currant"
      },
      {
        "name": "Хурма",
        "from": 7,
        "to": 19,
        "name_en": "Persimmon"
      },
      {
        "name": "Яблоки",
        "from": 7,
        "to": 19,
        "name_en": "Apples"
      },
      {
        "name": "Вишня",
        "from": 8,
        "to": 16,
        "name_en": "Sour Cherry"
      },
      {
        "name": "Груша",
        "from": 8,
        "to": 19,
        "name_en": "Pear"
      },
      {
        "name": "Земляника",
        "from": 8,
        "to": 18,
        "name_en": "Wild Strawberry"
      },
      {
        "name": "Малина",
        "from": 8,
        "to": 19,
        "name_en": "Raspberry"
      },
      {
        "name": "Облепиха",
        "from": 8,
        "to": 18,
        "name_en": "Sea Buckthorn"
      },
      {
        "name": "Шиповник",
        "from": 8,
        "to": 18,
        "name_en": "Rosehip"
      },
      {
        "name": "Ананас",
        "from": 9,
        "to": 15,
        "name_en": "Pineapple"
      },
      {
        "name": "Мандарин",
        "from": 9,
        "to": 16,
        "name_en": "Tangerine"
      },
      {
        "name": "Дыня",
        "from": 9,
        "to": 16,
        "name_en": "Melon"
      },
      {
        "name": "Апельсин",
        "from": 10,
        "to": 15,
        "name_en": "Orange"
      },
      {
        "name": "Боярышник",
        "from": 10,
        "to": 21,
        "name_en": "Hawthorn"
      },
      {
        "name": "Гранат",
        "from": 10,
        "to": 18,
        "name_en": "Pomegranate"
      },
      {
        "name": "Калина",
        "from": 10,
        "to": 18,
        "name_en": "Viburnum (Guelder Rose)"
      },
      {
        "name": "Клубника",
        "from": 10,
        "to": 16,
        "name_en": "Strawberry"
      },
      {
        "name": "Арбуз",
        "from": 11,
        "to": 17,
        "name_en": "Watermelon"
      },
      {
        "name": "Грейпфрут",
        "from": 11,
        "to": 15,
        "name_en": "Grapefruit"
      },
      {
        "name": "Смородина красная",
        "from": 11,
        "to": 16,
        "name_en": "Red Currant"
      },
      {
        "name": "Лимон",
        "from": 11,
        "to": 16,
        "name_en": "Lemon"
      },
      {
        "name": "Авокадо",
        "from": 9,
        "to": 17,
        "name_en": "Avocado"
      },
      {
        "name": "Манго (свежее)",
        "from": 7,
        "to": 18,
        "name_en": "Mango (Fresh)"
      },
      {
        "name": "Киви",
        "from": 8,
        "to": 17,
        "name_en": "Kiwi"
      },
      {
        "name": "Папайя",
        "from": 7,
        "to": 17,
        "name_en": "Papaya"
      },
      {
        "name": "Кокос",
        "from": 9,
        "to": 17,
        "name_en": "Coconut"
      },
      {
        "name": "Инжир свежий",
        "from": 7,
        "to": 17,
        "name_en": "Fresh Fig"
      },
      {
        "name": "Айва",
        "from": 9,
        "to": 16,
        "name_en": "Quince"
      },
      {
        "name": "Нектарин",
        "from": 7,
        "to": 17,
        "name_en": "Nectarine"
      },
      {
        "name": "Личи",
        "from": 8,
        "to": 17,
        "name_en": "Lychee"
      },
      {
        "name": "Маракуйя",
        "from": 8,
        "to": 16,
        "name_en": "Passion Fruit"
      },
      {
        "name": "Фейхоа",
        "from": 9,
        "to": 16,
        "name_en": "Feijoa"
      },
      {
        "name": "Годжи",
        "from": 7,
        "to": 18,
        "name_en": "Goji Berry"
      },
      {
        "name": "Клюква",
        "from": 8,
        "to": 16,
        "name_en": "Cranberry"
      },
      {
        "name": "Голубика",
        "from": 7,
        "to": 17,
        "name_en": "Blueberry"
      },
      {
        "name": "Ежевика",
        "from": 7,
        "to": 17,
        "name_en": "Blackberry"
      },
      {
        "name": "Брусника",
        "from": 8,
        "to": 16,
        "name_en": "Lingonberry"
      },
      {
        "name": "Инжир сушёный",
        "from": 8,
        "to": 18,
        "name_en": "Dried Fig"
      }
    ],
    "category_en": "Fruits, Dried Fruits, Berries and Honey"
  },
  {
    "category": "Растительные масла и зелень",
    "icon": "🫙",
    "iconKey": "ft_oil",
    "items": [
      {
        "name": "Масло оливковое",
        "from": 9,
        "to": 18,
        "name_en": "Olive Oil"
      },
      {
        "name": "Масло подсолнечное",
        "from": 9,
        "to": 16,
        "name_en": "Sunflower Oil"
      },
      {
        "name": "Масло соевое",
        "from": 10,
        "to": 16,
        "name_en": "Soybean Oil"
      },
      {
        "name": "Масло горчичное",
        "from": 11,
        "to": 15,
        "name_en": "Mustard Oil"
      },
      {
        "name": "Масло кукурузное",
        "from": 11,
        "to": 15,
        "name_en": "Corn Oil"
      },
      {
        "name": "Петрушка",
        "from": 11,
        "to": 18,
        "name_en": "Parsley"
      },
      {
        "name": "Салат",
        "from": 11,
        "to": 20,
        "name_en": "Lettuce"
      },
      {
        "name": "Укроп",
        "from": 11,
        "to": 16,
        "name_en": "Dill"
      },
      {
        "name": "Масло кокосовое",
        "from": 6,
        "to": 19,
        "name_en": "Coconut Oil"
      },
      {
        "name": "Масло кунжутное",
        "from": 7,
        "to": 19,
        "name_en": "Sesame Oil"
      },
      {
        "name": "Масло льняное",
        "from": 7,
        "to": 18,
        "name_en": "Flaxseed Oil"
      },
      {
        "name": "Масло миндальное",
        "from": 7,
        "to": 18,
        "name_en": "Almond Oil"
      },
      {
        "name": "Масло гхи",
        "from": 6,
        "to": 21,
        "name_en": "Ghee Oil (Ghee)"
      },
      {
        "name": "Базилик",
        "from": 7,
        "to": 19,
        "name_en": "Basil"
      },
      {
        "name": "Кинза",
        "from": 7,
        "to": 19,
        "name_en": "Cilantro"
      },
      {
        "name": "Мята",
        "from": 6,
        "to": 20,
        "name_en": "Mint"
      },
      {
        "name": "Руккола",
        "from": 8,
        "to": 18,
        "name_en": "Arugula"
      },
      {
        "name": "Шпинат (зелень)",
        "from": 9,
        "to": 17,
        "name_en": "Spinach (Greens)"
      },
      {
        "name": "Шалфей",
        "from": 7,
        "to": 18,
        "name_en": "Sage"
      },
      {
        "name": "Розмарин",
        "from": 7,
        "to": 18,
        "name_en": "Rosemary"
      },
      {
        "name": "Тимьян",
        "from": 7,
        "to": 18,
        "name_en": "Thyme"
      },
      {
        "name": "Сельдерей (зелень)",
        "from": 8,
        "to": 18,
        "name_en": "Celery (Leaves)"
      }
    ],
    "category_en": "Vegetable Oils and Herbs"
  },
  {
    "category": "Орехи и семена",
    "icon": "🥜",
    "iconKey": "ft_nuts",
    "items": [
      {
        "name": "Орех грецкий",
        "from": 7,
        "to": 20,
        "name_en": "Walnut"
      },
      {
        "name": "Семена подсолнечника",
        "from": 9,
        "to": 17,
        "name_en": "Sunflower Seeds"
      },
      {
        "name": "Орех арахис",
        "from": 9,
        "to": 18,
        "name_en": "Peanut"
      },
      {
        "name": "Орех фундук",
        "from": 10,
        "to": 17,
        "name_en": "Hazelnut"
      },
      {
        "name": "Семена тыквы",
        "from": 11,
        "to": 16,
        "name_en": "Pumpkin Seeds"
      },
      {
        "name": "Миндаль",
        "from": 8,
        "to": 17,
        "name_en": "Almond"
      },
      {
        "name": "Кешью",
        "from": 10,
        "to": 16,
        "name_en": "Cashew"
      },
      {
        "name": "Кедровый орех",
        "from": 10,
        "to": 16,
        "name_en": "Pine Nut"
      },
      {
        "name": "Фисташки",
        "from": 10,
        "to": 16,
        "name_en": "Pistachios"
      },
      {
        "name": "Бразильский орех",
        "from": 10,
        "to": 16,
        "name_en": "Brazil Nut"
      },
      {
        "name": "Макадамия",
        "from": 10,
        "to": 16,
        "name_en": "Macadamia"
      },
      {
        "name": "Пекан",
        "from": 10,
        "to": 16,
        "name_en": "Pecan"
      },
      {
        "name": "Семена льна",
        "from": 7,
        "to": 18,
        "name_en": "Flax Seeds"
      },
      {
        "name": "Семена чиа",
        "from": 7,
        "to": 18,
        "name_en": "Chia Seeds"
      },
      {
        "name": "Семена кунжута",
        "from": 8,
        "to": 18,
        "name_en": "Sesame Seeds"
      },
      {
        "name": "Семена конопли",
        "from": 8,
        "to": 18,
        "name_en": "Hemp Seeds"
      }
    ],
    "category_en": "Nuts and Seeds"
  },
  {
    "category": "Овощи, бахчевые и зелень",
    "icon": "🥦",
    "iconKey": "ft_veggie",
    "items": [
      {
        "name": "Морковь",
        "from": 9,
        "to": 19,
        "name_en": "Carrot"
      },
      {
        "name": "Патиссон",
        "from": 9,
        "to": 20,
        "name_en": "Pattypan Squash"
      },
      {
        "name": "Кабачок",
        "from": 10,
        "to": 20,
        "name_en": "Squash (Marrow)"
      },
      {
        "name": "Огурец",
        "from": 10,
        "to": 18,
        "name_en": "Cucumber"
      },
      {
        "name": "Свекла",
        "from": 10,
        "to": 19,
        "name_en": "Beet"
      },
      {
        "name": "Тыква",
        "from": 10,
        "to": 19,
        "name_en": "Pumpkin"
      },
      {
        "name": "Редька зелёная",
        "from": 10,
        "to": 17,
        "name_en": "Green Radish"
      },
      {
        "name": "Репа",
        "from": 10,
        "to": 17,
        "name_en": "Turnip"
      },
      {
        "name": "Баклажан",
        "from": 11,
        "to": 16,
        "name_en": "Eggplant"
      },
      {
        "name": "Болгарский перец",
        "from": 11,
        "to": 17,
        "name_en": "Bell Pepper"
      },
      {
        "name": "Капуста белокочанная",
        "from": 11,
        "to": 18,
        "name_en": "White Cabbage"
      },
      {
        "name": "Капуста цветная",
        "from": 11,
        "to": 16,
        "name_en": "Cauliflower"
      },
      {
        "name": "Картофель",
        "from": 11,
        "to": 15,
        "name_en": "Potato"
      },
      {
        "name": "Помидор",
        "from": 11,
        "to": 15,
        "name_en": "Tomato"
      },
      {
        "name": "Редис",
        "from": 11,
        "to": 15,
        "name_en": "Radish"
      },
      {
        "name": "Редька чёрная",
        "from": 11,
        "to": 15,
        "name_en": "Black Radish"
      },
      {
        "name": "Брокколи",
        "from": 11,
        "to": 16,
        "name_en": "Broccoli"
      },
      {
        "name": "Спаржа",
        "from": 11,
        "to": 16,
        "name_en": "Asparagus"
      },
      {
        "name": "Сельдерей (корень)",
        "from": 11,
        "to": 15,
        "name_en": "Celery (Root)"
      },
      {
        "name": "Шпинат",
        "from": 11,
        "to": 16,
        "name_en": "Spinach"
      },
      {
        "name": "Артишок",
        "from": 11,
        "to": 15,
        "name_en": "Artichoke"
      },
      {
        "name": "Топинамбур",
        "from": 11,
        "to": 15,
        "name_en": "Jerusalem Artichoke"
      },
      {
        "name": "Батат",
        "from": 11,
        "to": 15,
        "name_en": "Sweet Potato"
      },
      {
        "name": "Чеснок",
        "from": 10,
        "to": 16,
        "name_en": "Garlic"
      },
      {
        "name": "Лук репчатый",
        "from": 11,
        "to": 16,
        "name_en": "Onion"
      },
      {
        "name": "Лук зелёный",
        "from": 9,
        "to": 17,
        "name_en": "Green Onion"
      },
      {
        "name": "Брюссельская капуста",
        "from": 11,
        "to": 15,
        "name_en": "Brussels Sprouts"
      },
      {
        "name": "Кольраби",
        "from": 11,
        "to": 15,
        "name_en": "Kohlrabi"
      },
      {
        "name": "Бамия (окра)",
        "from": 11,
        "to": 16,
        "name_en": "Okra"
      },
      {
        "name": "Зелёный горошек",
        "from": 11,
        "to": 15,
        "name_en": "Green Peas"
      },
      {
        "name": "Цукини",
        "from": 11,
        "to": 16,
        "name_en": "Zucchini"
      }
    ],
    "category_en": "Vegetables, Melons/Gourds and Greens"
  },
  {
    "category": "Крупы и бобовые",
    "icon": "🌾",
    "iconKey": "ft_grain",
    "items": [
      {
        "name": "Гречневая крупа",
        "from": 8,
        "to": 20,
        "name_en": "Buckwheat"
      },
      {
        "name": "Горох",
        "from": 11,
        "to": 14,
        "name_en": "Split Peas"
      },
      {
        "name": "Фасоль",
        "from": 11,
        "to": 14,
        "name_en": "Beans"
      },
      {
        "name": "Кукурузная крупа",
        "from": 11,
        "to": 14,
        "name_en": "Corn Grits"
      },
      {
        "name": "Овсяная крупа",
        "from": 11,
        "to": 14,
        "name_en": "Oats"
      },
      {
        "name": "Перловая крупа",
        "from": 11,
        "to": 14,
        "name_en": "Pearl Barley"
      },
      {
        "name": "Пшеничная крупа",
        "from": 11,
        "to": 14,
        "name_en": "Wheat Groats"
      },
      {
        "name": "Манная крупа",
        "from": 11,
        "to": 14,
        "name_en": "Semolina"
      },
      {
        "name": "Пшено",
        "from": 11,
        "to": 14,
        "name_en": "Millet"
      },
      {
        "name": "Рис",
        "from": 11,
        "to": 14,
        "name_en": "Rice"
      },
      {
        "name": "Соя",
        "from": 11,
        "to": 14,
        "name_en": "Soybeans"
      },
      {
        "name": "Киноа",
        "from": 10,
        "to": 15,
        "name_en": "Quinoa"
      },
      {
        "name": "Амарант",
        "from": 10,
        "to": 15,
        "name_en": "Amaranth"
      },
      {
        "name": "Булгур",
        "from": 11,
        "to": 14,
        "name_en": "Bulgur"
      },
      {
        "name": "Чечевица красная",
        "from": 11,
        "to": 15,
        "name_en": "Red Lentils"
      },
      {
        "name": "Чечевица зелёная",
        "from": 11,
        "to": 14,
        "name_en": "Green Lentils"
      },
      {
        "name": "Маш (мунг дал)",
        "from": 10,
        "to": 15,
        "name_en": "Mung Beans (Mung Dal)"
      },
      {
        "name": "Нут",
        "from": 11,
        "to": 14,
        "name_en": "Chickpeas"
      },
      {
        "name": "Полба",
        "from": 11,
        "to": 14,
        "name_en": "Spelt"
      },
      {
        "name": "Рис басмати",
        "from": 10,
        "to": 15,
        "name_en": "Basmati Rice"
      },
      {
        "name": "Рис бурый",
        "from": 11,
        "to": 14,
        "name_en": "Brown Rice"
      },
      {
        "name": "Кускус",
        "from": 11,
        "to": 14,
        "name_en": "Couscous"
      },
      {
        "name": "Тур дал",
        "from": 11,
        "to": 14,
        "name_en": "Toor Dal (Pigeon Pea)"
      }
    ],
    "category_en": "Grains and Legumes"
  },
  {
    "category": "Напитки",
    "icon": "🍵",
    "iconKey": "ft_drink",
    "items": [
      {
        "name": "Вода тёплая",
        "from": 4,
        "to": 23,
        "name_en": "Warm Water"
      },
      {
        "name": "Имбирный чай",
        "from": 6,
        "to": 18,
        "name_en": "Ginger Tea"
      },
      {
        "name": "CCF-чай",
        "from": 6,
        "to": 20,
        "name_en": "CCF Tea (Cumin-Coriander-Fennel Tea)"
      },
      {
        "name": "Зелёный чай",
        "from": 6,
        "to": 16,
        "name_en": "Green Tea"
      },
      {
        "name": "Чёрный чай",
        "from": 6,
        "to": 15,
        "name_en": "Black Tea"
      },
      {
        "name": "Травяной чай",
        "from": 6,
        "to": 21,
        "name_en": "Herbal Tea"
      },
      {
        "name": "Молоко с куркумой",
        "from": 18,
        "to": 22,
        "name_en": "Turmeric Milk (Golden Milk)"
      },
      {
        "name": "Кокосовая вода",
        "from": 8,
        "to": 17,
        "name_en": "Coconut Water"
      },
      {
        "name": "Вода с лимоном",
        "from": 5,
        "to": 11,
        "name_en": "Lemon Water"
      },
      {
        "name": "Вода с мёдом",
        "from": 6,
        "to": 11,
        "name_en": "Honey Water"
      },
      {
        "name": "Овощной сок",
        "from": 9,
        "to": 16,
        "name_en": "Vegetable Juice"
      },
      {
        "name": "Фруктовый сок",
        "from": 7,
        "to": 12,
        "name_en": "Fruit Juice"
      }
    ],
    "category_en": "Beverages"
  },
  {
    "category": "Грибы",
    "icon": "🍄",
    "iconKey": "ft_shroom",
    "items": [
      {
        "name": "Шампиньоны",
        "from": 11,
        "to": 15,
        "name_en": "Champignons (Button Mushrooms)"
      },
      {
        "name": "Вёшенки",
        "from": 11,
        "to": 15,
        "name_en": "Oyster Mushrooms"
      },
      {
        "name": "Белые грибы",
        "from": 11,
        "to": 14,
        "name_en": "Porcini Mushrooms"
      },
      {
        "name": "Лисички",
        "from": 11,
        "to": 14,
        "name_en": "Chanterelles"
      }
    ],
    "category_en": "Mushrooms"
  }
];
