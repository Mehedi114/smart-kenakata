// Service Worker - Always Fresh Content
const CACHE_NAME = 'smart-kenakata-v' + new Date().getTime();

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(name => caches.delete(name)));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Always fetch fresh from network
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
