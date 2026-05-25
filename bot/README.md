# Telegram-бот «Аштанга-хридая-самхита»

Бот для Telegram с полной базой аюрведических знаний.

## Архитектура (один источник данных)

Бот на **Node.js + Telegraf** и импортирует данные **напрямую** из файлов веб-приложения:

```
data.js          ←── оба: веб-сайт + бот
encyclopedia.js  ←── оба: веб-сайт + бот
diseases.js      ←── оба: веб-сайт + бот
remedies.js      ←── оба: веб-сайт + бот
glossary.js      ←── оба: веб-сайт + бот
foodtable.js     ←── оба: веб-сайт + бот
quiz.js          ←── оба: веб-сайт + бот
```

**Как добавить новый контент:**
1. Отредактируй нужный `.js`-файл в корне проекта
2. Сделай `git push` — сайт обновится автоматически
3. Перезапусти бот (Railway делает это автоматически при push)

## Быстрый старт (локально)

```bash
# 1. Перейди в папку бота
cd bot

# 2. Установи зависимости
npm install

# 3. Создай файл с токеном
cp .env.example .env
# отредактируй .env, вставь BOT_TOKEN

# 4. Запусти
npm start
# или с авто-перезапуском при изменениях:
npm run dev
```

## Деплой на Vercel (бесплатно, без карты) ✅

### Первый деплой

1. Зайди на [vercel.com](https://vercel.com) → создай аккаунт через GitHub (без карты)
2. **Add New Project** → выбери репозиторий `ayurveda-reader`
3. Root Directory — оставь пустым (корень репозитория)
4. **Environment Variables** → добавь `BOT_TOKEN` = токен от @BotFather
5. Нажми **Deploy** и дождись завершения (~1 мин)
6. Скопируй URL деплоя (например `https://ayurveda-reader.vercel.app`)
7. Установи webhook — вставь в браузер (замени TOKEN и URL):
   ```
   https://api.telegram.org/botТВОЙ_ТОКЕН/setWebhook?url=https://ayurveda-reader.vercel.app/api/webhook
   ```
   Должно ответить: `{"ok":true,"result":true}`

### Обновление бота

Просто сделай `git push` — Vercel задеплоит автоматически.

---

## Деплой на Koyeb (бесплатно, без карты)

### Первый деплой

1. Зайди на [koyeb.com](https://koyeb.com) → создай аккаунт (без карты)
2. **Create Service** → **GitHub**
3. Выбери репозиторий `ayurveda-reader`, ветка `main`
4. Настройки сервиса:
   - **Service type**: Web service
   - **Build command**: `npm --prefix bot install`
   - **Run command**: `node bot/index.js`
   - **Port**: `3000`
5. Переменные окружения → добавь `BOT_TOKEN` = токен от @BotFather
6. **Deploy**

### Обновление бота

Просто сделай `git push` — Koyeb задеплоит автоматически.

---

## Деплой на Fly.io (бесплатно, нужна карта для верификации)

### Первый деплой

```bash
# 1. Установи flyctl
brew install flyctl          # macOS
# или: curl -L https://fly.io/install.sh | sh

# 2. Войди в аккаунт
fly auth login

# 3. Перейди в папку бота
cd bot

# 4. Инициализируй приложение (fly.toml уже есть — выбери "не перезаписывать")
fly launch --name ayurveda-bot --region ams --no-deploy

# 5. Добавь токен бота как секрет
fly secrets set BOT_TOKEN=твой_токен_здесь

# 6. Задеплой
fly deploy
```

### Обновление бота

```bash
# После git push просто:
fly deploy
```

### Полезные команды

```bash
fly logs          # посмотреть логи
fly status        # статус приложения
fly secrets list  # список секретов (значения скрыты)
```

## Получение токена (@BotFather)

1. Напиши [@BotFather](https://t.me/BotFather) в Telegram
2. `/newbot` → дай имя → дай username (например `ayurveda_sanhita_bot`)
3. Скопируй токен в переменную окружения `BOT_TOKEN`

## Команды бота

| Команда | Действие |
|---|---|
| `/start` | Главное меню |
| `/menu` | Главное меню |
| `/search запрос` | Поиск по всей базе |
| `/help` | Справка |
| просто текст | Глобальный поиск |

## Обновление контента

Никаких изменений в коде бота не требуется. Только правь данные:

| Что добавить | Файл |
|---|---|
| Новую главу книги | `../data.js` |
| Статью в энциклопедию | `../encyclopedia.js` |
| Болезнь | `../diseases.js` |
| Домашнее средство | `../remedies.js` |
| Термин глоссария | `../glossary.js` |
| Продукт в таблицу | `../foodtable.js` |
