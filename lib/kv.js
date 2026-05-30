/**
 * Обёртка над Vercel KV (Upstash Redis) через REST API.
 * Без внешних зависимостей — обычный fetch.
 * Если KV не настроен (нет env), все методы возвращают пустые значения,
 * чтобы статический сайт продолжал работать.
 */
const URL   = process.env.KV_REST_API_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || '';

export const kvEnabled = Boolean(URL && TOKEN);

async function cmd(args) {
  if (!kvEnabled) return null;
  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const data = await res.json();
  return data.result;
}

export async function kvGet(key) {
  const r = await cmd(['GET', key]);
  if (r == null) return null;
  try { return JSON.parse(r); } catch { return r; }
}

export async function kvSet(key, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  return cmd(['SET', key, v]);
}

export async function kvDel(key) { return cmd(['DEL', key]); }

export async function kvSAdd(key, member) { return cmd(['SADD', key, String(member)]); }
export async function kvSRem(key, member) { return cmd(['SREM', key, String(member)]); }

export async function kvSMembers(key) {
  const r = await cmd(['SMEMBERS', key]);
  return Array.isArray(r) ? r : [];
}

/** Получить несколько ключей разом */
export async function kvMGet(keys) {
  if (!keys.length) return [];
  const r = await cmd(['MGET', ...keys]);
  if (!Array.isArray(r)) return [];
  return r.map(x => { try { return JSON.parse(x); } catch { return x; } });
}
