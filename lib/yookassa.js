/**
 * Тонкая обёртка над YooKassa REST API (v3).
 * Требует env: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY.
 * Без внешних зависимостей — fetch + crypto.
 */
import crypto from 'crypto';

const SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const SECRET  = process.env.YOOKASSA_SECRET_KEY || '';
const API = 'https://api.yookassa.ru/v3';

export const yooEnabled = Boolean(SHOP_ID && SECRET);

function authHeader() {
  return 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET}`).toString('base64');
}

/** Создать платёж. Возвращает { id, confirmation_url } */
export async function createPayment({ amountRub, description, returnUrl, metadata }) {
  if (!yooEnabled) throw new Error('YooKassa не настроена');
  const body = {
    amount: { value: Number(amountRub).toFixed(2), currency: 'RUB' },
    capture: true,
    confirmation: { type: 'redirect', return_url: returnUrl },
    description: String(description).slice(0, 128),
    metadata: metadata || {},
  };
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Idempotence-Key': crypto.randomUUID(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.description || `YooKassa ${res.status}`);
  return { id: data.id, status: data.status, confirmation_url: data.confirmation?.confirmation_url };
}

/** Получить платёж (для проверки статуса из вебхука). */
export async function getPayment(id) {
  if (!yooEnabled) throw new Error('YooKassa не настроена');
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.description || `YooKassa ${res.status}`);
  return data;
}
