const CACHE_NAME = 'bme-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/theme.css',
    './css/style.css',
    './js/app.js',
    './assets/logo-bme.png',
    './assets/icons/android-chrome-192x192.png',
    './assets/icons/android-chrome-512x512.png',
    './assets/icons/apple-touch-icon.png',
    './assets/icons/favicon-16x16.png',
    './assets/icons/favicon-32x32.png',
    './assets/icons/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
