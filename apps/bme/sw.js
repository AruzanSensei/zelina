// const CACHE_NAME = 'bme-v2'; // naikkin versi tiap update

// const ASSETS = [
//     '/',
//     '/index.html',
//     '/manifest.json',
//     '/css/theme.css',
//     '/css/style.css',
//     '/js/app.js',
//     '/assets/icons/logo-bme.png',
//     '/assets/icons/android-chrome-192x192.png',
//     '/assets/icons/android-chrome-512x512.png',
//     '/assets/icons/apple-touch-icon.png',
//     '/assets/icons/favicon-16x16.png',
//     '/assets/icons/favicon-32x32.png',
//     '/assets/icons/favicon.ico'
// ];

// // INSTALL → cache semua asset
// self.addEventListener('install', (event) => {
//     self.skipWaiting(); // langsung aktif tanpa nunggu
//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then((cache) => cache.addAll(ASSETS))
//     );
// });

// // ACTIVATE → hapus cache lama
// self.addEventListener('activate', (event) => {
//     event.waitUntil(
//         caches.keys().then((keys) =>
//             Promise.all(
//                 keys.map((key) => {
//                     if (key !== CACHE_NAME) {
//                         return caches.delete(key);
//                     }
//                 })
//             )
//         )
//     );
//     self.clients.claim(); // ambil alih semua tab
// });

// // FETCH → strategi: network dulu, cache fallback
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         fetch(event.request)
//             .then((response) => {
//                 // optional: update cache versi baru
//                 const resClone = response.clone();
//                 caches.open(CACHE_NAME).then((cache) => {
//                     cache.put(event.request, resClone);
//                 });
//                 return response;
//             })
//             .catch(() => {
//                 return caches.match(event.request);
//             })
//     );
// });