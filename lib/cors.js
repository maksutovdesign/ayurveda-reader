// CORS for the separate reader frontend; Telegram/session checks remain in handlers.
const origins = new Set([
  'https://ayurvedareader.ru',
  'https://www.ayurvedareader.ru',
  'https://ayurveda-reader.vercel.app',
]);
export function handleCors(req, res) {
  const origin = req.headers?.origin;
  res.setHeader('Vary', 'Origin');
  if (origin && !origins.has(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return true;
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method !== 'OPTIONS') return false;
  const method = req.headers?.['access-control-request-method'];
  const headers = (req.headers?.['access-control-request-headers'] || '')
    .toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
  if (!origin || (method && !['GET', 'POST'].includes(method)) ||
      headers.some(x => !['content-type', 'authorization'].includes(x))) {
    res.status(403).end();
    return true;
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
  res.status(204).end();
  return true;
}
