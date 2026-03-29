// const CACHE_NAME = 'zanxa-ai-v1';
// const ASSETS = [
//     './',
//     './index.html',
//     './manifest.json',
//     './styles.css',
//     './script.js',
//     './favicon.png',
//     './favicon.ico'
// ];

// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
//     );
// });

// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         caches.match(event.request).then((response) => response || fetch(event.request))
//     );
// });
