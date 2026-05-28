#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Настройка Telegram webhook для бота Аштанга-хридая-самхита
# Запускать: bash bot/setup-webhook.sh
# ─────────────────────────────────────────────────────────────────
set -e

# Читаем токен из .env или окружения
if [ -f "bot/.env" ]; then
  export $(grep -v '^#' bot/.env | xargs)
fi

if [ -z "$BOT_TOKEN" ]; then
  echo "❌  BOT_TOKEN не задан."
  echo "    Создай файл bot/.env со строкой: BOT_TOKEN=твой_токен"
  echo "    Или запусти: BOT_TOKEN=твой_токен bash bot/setup-webhook.sh"
  exit 1
fi

# URL Vercel-деплоя — измени если отличается
VERCEL_URL="${VERCEL_URL:-https://ayurveda-reader.vercel.app}"
WEBHOOK_URL="${VERCEL_URL}/api/webhook"

echo "🔍  Проверка бота..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")
BOT_NAME=$(echo "$BOT_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['username'])" 2>/dev/null)
if [ -z "$BOT_NAME" ]; then
  echo "❌  Неверный BOT_TOKEN или нет интернета."
  echo "    Ответ Telegram: $BOT_INFO"
  exit 1
fi
echo "✅  Бот: @${BOT_NAME}"

echo ""
echo "🔍  Текущий webhook..."
CURRENT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
echo "$CURRENT" | python3 -c "
import sys,json
d=json.load(sys.stdin)['result']
print('  URL:', d.get('url','(не задан)'))
print('  Ошибки:', d.get('last_error_message','нет'))
print('  Ожидающих обновлений:', d.get('pending_update_count',0))
" 2>/dev/null || echo "$CURRENT"

echo ""
echo "📡  Устанавливаю webhook: ${WEBHOOK_URL}"

# Передаём secret_token если задана переменная WEBHOOK_SECRET.
# Telegram будет присылать X-Telegram-Bot-Api-Secret-Token в каждый POST,
# что позволяет webhook.js отклонять поддельные запросы.
if [ -n "$WEBHOOK_SECRET" ]; then
  echo "🔐  Используется WEBHOOK_SECRET (верификация источника включена)"
  RESULT=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    --data-urlencode "url=${WEBHOOK_URL}" \
    -d "drop_pending_updates=true" \
    --data-urlencode "secret_token=${WEBHOOK_SECRET}")
else
  echo "⚠️   WEBHOOK_SECRET не задан — верификация источника ОТКЛЮЧЕНА"
  echo "    Задай WEBHOOK_SECRET в Vercel и в bot/.env, затем перезапусти скрипт"
  RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}&drop_pending_updates=true")
fi

OK=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)

if [ "$OK" = "True" ]; then
  echo "✅  Webhook успешно установлен!"
  echo ""
  echo "🧪  Проверь бота: напиши /start в Telegram"
else
  echo "❌  Ошибка: $RESULT"
fi
