// ============================================================
// Smart Kenakata - CORE: Settings + Tracking + Shared Helpers
// সব পেজে এই ফাইল include করা — Firebase স্ক্রিপ্টের পরে
// ============================================================
(function () {
    'use strict';

    // ===== ১) ডিফল্ট সাইট সেটিংস =====
    // Admin Panel → সেটিংস থেকে বদলালে এই মানগুলো auto-override হবে।
    const SK_DEFAULTS = {
        siteName: 'স্মার্ট কেনাকাটা',
        phone: '01932211123',
        whatsapp: '8801932211123',
        email: 'mdmahedulislammehedi@gmail.com',
        address: 'Mirpur-10, Dhaka',
        deliveryInside: 60,        // ঢাকার ভিতরে ডেলিভারি চার্জ
        deliveryOutside: 120,      // ঢাকার বাইরে ডেলিভারি চার্জ
        freeDeliveryMin: 0,        // কত টাকার অর্ডারে ফ্রি ডেলিভারি (0 = নেই)
        bkashNumber: '01932211123',
        nagadNumber: '01932211123',
        rocketNumber: '019322111230',
        stockAlert: 5              // এত বা কম স্টক থাকলে "আর মাত্র Xটি!" ব্যাজ
    };

    // ক্যাশ (১০ মিনিট — প্রতি ভিজিটে Firestore read বাঁচায়)
    function loadCachedSettings() {
        try {
            const c = JSON.parse(localStorage.getItem('sk_settings') || 'null');
            if (c && c.t && (Date.now() - c.t < 10 * 60 * 1000)) return c.v;
        } catch (e) {}
        return null;
    }

    let settings = Object.assign({}, SK_DEFAULTS, loadCachedSettings() || {});
    window.SK_SETTINGS = settings;
    // ছোট helper: SKS('deliveryInside')
    window.SKS = function (key) {
        return (settings[key] !== undefined && settings[key] !== null && settings[key] !== '')
            ? settings[key] : SK_DEFAULTS[key];
    };

    function applySettings(v) {
        settings = Object.assign({}, SK_DEFAULTS, v || {});
        window.SK_SETTINGS = settings;
        document.dispatchEvent(new CustomEvent('sk-settings', { detail: settings }));
    }

    function fetchSettings() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) return;
            firebase.firestore().collection('settings').doc('siteConfig').get()
                .then(function (doc) {
                    if (doc.exists) {
                        const v = doc.data();
                        applySettings(v);
                        try { localStorage.setItem('sk_settings', JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
                    }
                }).catch(function () {});
        } catch (e) {}
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchSettings);
    } else {
        fetchSettings();
    }
    // settings পরিবর্তন হয়ে এলে এই ইভেন্ট ফায়ার হয়: document.addEventListener('sk-settings', ...)

    // ===== ২) TRACKING — Facebook Pixel + GA4 =====
    // ⚙️ শুধু নিচের দুই লাইনে ID বসালেই পুরো সাইটে ট্র্যাকিং চালু হয়ে যাবে
    const FB_PIXEL_ID = 'YOUR_PIXEL_ID';   // ← Facebook Pixel ID (যেমন: 1234567890123456)
    const GA4_ID      = 'YOUR_GA4_ID';     // ← GA4 Measurement ID (যেমন: G-ABCDEF1234)

    // ⚠️ ID বসানো না থাকলে কনসোলে সতর্কবার্তা (কাজ শুরু করার আগে মনে করিয়ে দেয়)
    if (FB_PIXEL_ID === 'YOUR_PIXEL_ID' || GA4_ID === 'YOUR_GA4_ID') {
        console.warn('%c📊 Ads Tracking', 'font-weight:bold; color:#f59e0b;',
            'Facebook Pixel/GA4 ID এখনো বসানো হয়নি — site-core.js-এর উপরে FB_PIXEL_ID ও GA4_ID বসান।');
    }

    if (FB_PIXEL_ID && FB_PIXEL_ID !== 'YOUR_PIXEL_ID') {
        (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', FB_PIXEL_ID);
        fbq('track', 'PageView');
    }
    if (GA4_ID && GA4_ID !== 'YOUR_GA4_ID') {
        var gs = document.createElement('script');
        gs.async = true;
        gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
        document.head.appendChild(gs);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA4_ID);
    }
    // ইভেন্ট পাঠানোর একদরজা: skTrack('AddToCart', {value: 350, currency: 'BDT', content_name: 'T-Shirt'})
    window.skTrack = function (event, data) {
        data = data || {};
        try { if (typeof fbq === 'function') fbq('track', event, data); } catch (e) {}
        try {
            if (typeof gtag === 'function') {
                const map = { ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout', Purchase: 'purchase' };
                gtag('event', map[event] || event, data);
            }
        } catch (e) {}
    };

    // ===== ৩) SEARCH KEYWORDS (Firestore array-contains সার্চের জন্য) =====
    // প্রোডাক্ট সেভের সময় এটা দিয়ে keywords বানানো হয়
    window.skBuildKeywords = function (name, category) {
        const set = new Set();
        const text = ((name || '') + ' ' + (category || '')).toLowerCase();
        text.split(/[\s,;+\-_\/\\()।.,!?:'"]+/).forEach(function (w) {
            w = w.trim();
            if (w.length < 2) return;
            set.add(w);
            for (let i = 2; i <= Math.min(w.length, 10); i++) set.add(w.substring(0, i));
        });
        return Array.from(set).slice(0, 100);
    };

    // ===== ৪) SHARED HELPERS =====
    window.skEscape = function (text) {
        if (text === undefined || text === null) return '';
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    // স্টক/ফ্ল্যাশ ব্যাজ HTML (প্রোডাক্ট কার্ডে ব্যবহারের জন্য)
    window.skStockBadge = function (p) {
        const stock = (p.stock === undefined || p.stock === null) ? 999 : p.stock;
        if (stock <= 0) return '<span class="badge-out">স্টক শেষ</span>';
        if (stock <= window.SKS('stockAlert')) return '<span class="badge-low">🔥 আর মাত্র ' + stock + 'টি!</span>';
        return '';
    };
    window.skHasFlash = function (p) {
        return !!(p.flashEnd && Number(p.flashEnd) > Date.now());
    };
    window.skHasVariants = function (p) {
        return !!((p.sizes && p.sizes.length) || (p.colors && p.colors.length));
    };

    // ===== ৫) রেটিং — রিভিউ থেকে গড় স্টার (কার্ডে দেখানোর জন্য) =====
    // reviews কালেকশন থেকে productId 'in' query; ক্যাশ ৫ মিনিট
    const RATINGS_CACHE_KEY = 'sk_ratings';
    const RATINGS_TTL = 5 * 60 * 1000;

    function readRatingsCache() {
        try {
            const c = JSON.parse(localStorage.getItem(RATINGS_CACHE_KEY) || 'null');
            if (c && c.t && (Date.now() - c.t < RATINGS_TTL)) return c.map || {};
        } catch (e) {}
        return null;
    }

    window.skLoadRatings = function (ids, cb) {
        cb = cb || function () {};
        const clean = (ids || []).filter(Boolean).slice(0, 30);
        if (!clean.length) return cb({});
        const cache = readRatingsCache() || {};
        const need = clean.filter(id => !cache[id]);
        if (!need.length) return cb(cache);
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) return cb(cache);
            const db = firebase.firestore();
            const out = Object.assign({}, cache);
            let pending = 0;
            // 'in' query-তে সর্বোচ্চ ১০টা id — chunk করে query
            for (let i = 0; i < need.length; i += 10) {
                const chunk = need.slice(i, i + 10);
                pending++;
                db.collection('reviews').where('productId', 'in', chunk).get()
                    .then(snap => {
                        const counts = {}, sums = {};
                        chunk.forEach(id => { counts[id] = 0; sums[id] = 0; });
                        snap.forEach(doc => {
                            const d = doc.data();
                            if (counts[d.productId] !== undefined && Number(d.rating)) {
                                counts[d.productId]++;
                                sums[d.productId] += Number(d.rating);
                            }
                        });
                        chunk.forEach(id => {
                            if (counts[id] > 0) {
                                out[id] = { avg: Math.round(sums[id] / counts[id] * 10) / 10, count: counts[id] };
                            }
                        });
                    })
                    .catch(() => {})
                    .finally(() => {
                        pending--;
                        if (pending === 0) {
                            try { localStorage.setItem(RATINGS_CACHE_KEY, JSON.stringify({ t: Date.now(), map: out })); } catch (e) {}
                            cb(out);
                        }
                    });
            }
        } catch (e) {
            cb(cache);
        }
    };

    // কার্ডে স্টার HTML — ডেটা না থাকলে খালি (লুকানো থাকবে)
    window.skRatingStarsHtml = function (p, ratingsMap) {
        const r = (ratingsMap || {})[p.id];
        if (!r || !r.count) return '';
        const avg = r.avg;
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= Math.round(avg) ? '★' : '☆';
        }
        return '<div class="sk-rating-row"><span class="sk-rating-stars">' + stars + '</span>'
            + '<span class="sk-rating-avg">' + avg + '</span>'
            + '<span class="sk-rating-count">(' + r.count + ')</span></div>';
    };
})();
