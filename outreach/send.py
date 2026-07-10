#!/usr/bin/env python3
"""
Рассылка партнёрских сообщений в Telegram-каналы.

Использование:
  1. Получите api_id и api_hash на https://my.telegram.org
  2. pip install telethon
  3. python send.py

При первом запуске попросит номер телефона и код из Telegram.
Сессия сохраняется в файл — повторный вход не нужен.
"""

import asyncio
import random
import sys
import os
from datetime import datetime
from pathlib import Path

try:
    from telethon import TelegramClient, errors
except ImportError:
    print("Telethon не установлен. Запустите:")
    print("  pip install telethon")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
CHANNELS_FILE = SCRIPT_DIR / "channels.txt"
MESSAGE_FILE = SCRIPT_DIR / "message.txt"
LOG_FILE = SCRIPT_DIR / "send_log.txt"
SESSION_FILE = SCRIPT_DIR / "session"

MIN_DELAY = 40
MAX_DELAY = 70


def load_channels():
    lines = CHANNELS_FILE.read_text(encoding="utf-8").splitlines()
    channels = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        username = line.replace("https://t.me/", "").lstrip("@").strip()
        if username:
            channels.append(username)
    return channels


def load_message():
    return MESSAGE_FILE.read_text(encoding="utf-8").strip()


def load_sent():
    if not LOG_FILE.exists():
        return set()
    sent = set()
    for line in LOG_FILE.read_text(encoding="utf-8").splitlines():
        if "OK" in line:
            parts = line.split("|")
            if len(parts) >= 2:
                sent.add(parts[1].strip())
    return sent


def log(status, channel, detail=""):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"{ts} | {channel} | {status} | {detail}"
    print(entry)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(entry + "\n")


async def main():
    api_id = os.environ.get("TG_API_ID") or input("API ID (из my.telegram.org): ").strip()
    api_hash = os.environ.get("TG_API_HASH") or input("API Hash: ").strip()

    channels = load_channels()
    message = load_message()
    already_sent = load_sent()

    todo = [ch for ch in channels if ch not in already_sent]

    print(f"\nВсего каналов: {len(channels)}")
    print(f"Уже отправлено: {len(already_sent)}")
    print(f"Осталось: {len(todo)}")
    print(f"Пауза между сообщениями: {MIN_DELAY}-{MAX_DELAY} сек")
    print(f"\nСообщение:\n---\n{message}\n---\n")

    if not todo:
        print("Все сообщения уже отправлены!")
        return

    confirm = input(f"Отправить {len(todo)} сообщений? (да/нет): ").strip().lower()
    if confirm not in ("да", "д", "y", "yes"):
        print("Отменено.")
        return

    client = TelegramClient(str(SESSION_FILE), int(api_id), api_hash)
    await client.start()
    me = await client.get_me()
    print(f"\nВошли как: {me.first_name} (@{me.username})\n")

    sent_count = 0
    for i, channel in enumerate(todo):
        try:
            entity = await client.get_entity(channel)
            await client.send_message(entity, message, link_preview=True)
            log("OK", channel)
            sent_count += 1
        except errors.FloodWaitError as e:
            log("FLOOD", channel, f"Ждём {e.seconds} сек")
            print(f"  ⏳ Telegram просит подождать {e.seconds} секунд...")
            await asyncio.sleep(e.seconds + 5)
            try:
                entity = await client.get_entity(channel)
                await client.send_message(entity, message, link_preview=True)
                log("OK", channel, "после ожидания")
                sent_count += 1
            except Exception as e2:
                log("FAIL", channel, str(e2))
        except errors.UserPrivacyRestrictedError:
            log("SKIP", channel, "приватность запрещает сообщения")
        except errors.ChatWriteForbiddenError:
            log("SKIP", channel, "нельзя писать в канал")
        except errors.UsernameNotOccupiedError:
            log("SKIP", channel, "username не существует")
        except errors.UsernameInvalidError:
            log("SKIP", channel, "невалидный username")
        except Exception as e:
            log("FAIL", channel, str(e))

        remaining = len(todo) - i - 1
        if remaining > 0:
            delay = random.randint(MIN_DELAY, MAX_DELAY)
            print(f"  ⏳ Пауза {delay} сек (осталось {remaining})...")
            await asyncio.sleep(delay)

    await client.disconnect()
    print(f"\nГотово! Отправлено: {sent_count}/{len(todo)}")
    print(f"Лог: {LOG_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
