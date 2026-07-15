// Service Worker for Smart Kenakata PWA
const CACHE_NAME = 'smart-kenakata-v1';
const urlsToCache = [
  './',
  './index.html',
  './category.html',
  './product-details.html',
  './checkout.html',
  './pages.html',
  './wishlist.html',
  './chatbot.js',
  './theme.js'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase and external APIs
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('groq.com') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch new
      return response || fetch(event.request).then(fetchResponse => {
        // Cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback
      return caches.match('./index.html');
    })
  );
});
