const CACHE_NAME = 'lion-cub-3d-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './core.js',
  './environment.js',
  './models.js',
  './animals.js',
  './controls.js',
  './ui.js',
  './game.js',
  './AI_NOTES.md',
  './manifest.json',
  'https://unpkg.com/three@0.160.0/build/three.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached)
    )
  );
});
