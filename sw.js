/**
 * Service Worker — кеширование для офлайн-доступа
 * Стратегия: Cache First для статики, Network First для данных
 */

const CACHE = 'ayurveda-v1';

const STATIC = [
  '/',
  '/app.js',
  '/style.css',
  '/books.js',
  '/glossary.js',
  '/diseases.js',
  '/remedies.js',
  '/encyclopedia.js',
  '/quiz.js',
  '/foodtable.js',
];

// Install: cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache First for static, Network First for data files
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and API calls
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  // Large data files: Network First (fresh content), fallback to cache
  if (url.pathname.endsWith('-data.js') || url.pathname === '/data.js') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static: Cache First
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, c));
      return r;
    }))
  );
});
