/**
 * Service Worker — кеширование для офлайн-доступа
 * Стратегия: Cache First для статики, Network First для данных
 */

const CACHE = 'ayurveda-v5';

const STATIC = [
  '/',
  '/app.js',
  '/style.css',
  '/books.js',
  '/cabinet.js',
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

  // Navigation (index.html) + data files: Network First, чтобы новые деплои
  // подхватывались сразу и не залипал старый index.html
  const isNavigation = e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html');
  if (isNavigation || url.pathname.endsWith('-data.js') || url.pathname === '/data.js') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/')))
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
