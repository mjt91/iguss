// iGuss Service Worker — cache-first for offline use

const CACHE_NAME = 'iguss-v1';
const ASSETS = [
  '/iguss/index.html',
  '/iguss/style.css',
  '/iguss/app.js',
  '/iguss/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
