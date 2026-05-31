const CACHE_NAME = 'codexam-lab-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/assets/favicon.svg',
    '/js/config.js',
    '/js/hints.js',
    '/js/problems.js',
    '/js/transpiler.js',
    '/js/storage.js',
    '/js/app.js',
    '/js/runner.js',
    'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.filter(Boolean))).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
