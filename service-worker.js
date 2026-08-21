// Smart Kenakata Service Worker — স্মার্ট ক্যাশিং
// HTML: network-first (সবসময় তাজা কন্টেন্ট), অফলাইনে ক্যাশ ফলব্যাক
// Static assets (CSS/JS/ছবি/font): cache-first (দ্রুত লোড)
const VERSION = 'v15'; // v15: offline fallback + network resilience
const STATIC_CACHE = 'sk-static-' + VERSION;
const PAGE_CACHE = 'sk-pages-' + VERSION;

const isStaticAsset = (url) =>
    /\.(css|js|png|jpe?g|webp|svg|woff2?|ttf|ico)(\?.*)?$/.test(url.pathname) ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('res.cloudinary.com') ||
    url.hostname.includes('i.ibb.co');

const isFirestore = (url) =>
    url.hostname.includes('googleapis.com') || url.hostname.includes('firebase');

self.addEventListener('install', (event) => {
    self.skipWaiting();
    // 📄 মূল পেজগুলো install-এই প্রি-ক্যাশ — প্রথমবার অনলাইনে সাইট খুললেই
    // পরেরবার অফলাইন/দুর্বল নেটেও পুরো পেজ লোড হবে
    const ROOT = new URL('./', self.location).href;
    const CORE_PAGES = ['', 'index.html', 'category.html', 'product-details.html', 'checkout.html', '404.html'];
    event.waitUntil(
        caches.open(PAGE_CACHE).then((cache) =>
            Promise.allSettled(
                CORE_PAGES.map((p) => cache.add(ROOT + p))
            )
        ).catch(() => {})
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((n) => n !== STATIC_CACHE && n !== PAGE_CACHE).map((n) => caches.delete(n))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // Firestore/API কল: সরাসরি নেটওয়ার্ক (ক্যাশ নয়)
    if (isFirestore(url)) return;

    // Static assets: cache-first
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(req).then((cached) => {
                const fetched = fetch(req).then((res) => {
                    if (res && res.ok) {
                        const clone = res.clone();
                        caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
                    }
                    return res;
                }).catch(() => cached);
                return cached || fetched;
            })
        );
        return;
    }

    // HTML pages: network-first (৬ সেকেন্ড টাইমআউট) → fallback cache → শেষে offline page
    event.respondWith(
        new Promise((resolve) => {
            let done = false;
            const finish = (res) => { if (!done) { done = true; resolve(res); } };
            const fromCache = () =>
                caches.match(req).then((cached) => {
                    if (cached) return cached;
                    const ROOT = new URL('./', self.location).href;
                    return caches.match(ROOT + 'index.html')
                        .then((home) => home || caches.match(ROOT + '404.html'));
                }).then(finish);
            // ⏱️ দুর্বল নেটে ৬ সেকেন্ডের বেশি নেটওয়ার্কে আটকে থাকবে না — ক্যাশই দেখাবে
            setTimeout(() => { if (!done) fromCache(); }, 6000);
            fetch(req).then((res) => {
                if (res && res.ok && url.origin === self.location.origin) {
                    const clone = res.clone();
                    caches.open(PAGE_CACHE).then((c) => c.put(req, clone));
                }
                finish(res);
            }).catch(fromCache);
        })
    );
});
