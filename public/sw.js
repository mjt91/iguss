// iGuss Service Worker — stale-while-revalidate for fresh content

const CACHE_NAME = 'iguss-v5';
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './plants-db.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  // Always go to network for live endpoints; never cache them.
  const url = new URL(e.request.url);
  if (url.pathname === '/version' || url.pathname === '/up') return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // Always fetch in background to update cache
      const fetchPromise = fetch(e.request).then(networkResponse => {
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // fallback to cache if network fails

      // Return cached version immediately (stale-while-revalidate)
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
