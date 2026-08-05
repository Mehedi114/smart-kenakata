// ============================================================
// Smart Kenakata — MOBILE NAV DRAWER (hamburger menu)
// সব পেজে include করুন: <script src="nav-drawer.js"></script>
// - মোবাইলে ☰ বাটন তৈরি করে (navbar-এ)
// - স্লাইড-ইন drawer: হোম / উইশলিস্ট / ট্র্যাকিং / যোগাযোগ +
//   Firestore 'categories' থেকে লাইভ ক্যাটাগরি (localStorage ক্যাশ + fallback)
// - ডেস্কটপে বাটন/ড্রয়ার লুকানো থাকে
// ============================================================
(function () {
    'use strict';

    var LOGO_URL = 'https://i.ibb.co.com/mVNvrhCP/Chat-GPT-Image-Jul-16-2026-05-26-14-PM.png';
    var CATS_CACHE_KEY = 'sk_categories'; // index loadHomeCategories-এর সাথে শেয়ার করা ক্যাশ
    var CATS_CACHE_TTL = 10 * 60 * 1000;

    var DEFAULT_CATS = [
        { name: 'মহিলা ফ্যাশন', icon: '👗' }, { name: 'পুরুষ ফ্যাশন', icon: '👔' },
        { name: 'কাপল', icon: '💑' }, { name: 'গ্যাজেট', icon: '📱' },
        { name: 'বাচ্চাদের ফ্যাশন', icon: '🧒' },
        { name: 'অন্যান্য', icon: '📦' }
    ];

    // পুরনো/ইংরেজি নাম → নতুন বাংলা নাম
    var CATEGORY_ALIAS = {
        'gadget': 'গ্যাজেট', 'electronics': 'গ্যাজেট', 'ইলেকট্রনিক্স': 'গ্যাজেট',
        'ফিমেল ফ্যাশন': 'মহিলা ফ্যাশন', 'female fashion': 'মহিলা ফ্যাশন', 'women fashion': 'মহিলা ফ্যাশন',
        'male fashion': 'পুরুষ ফ্যাশন', 'men fashion': 'পুরুষ ফ্যাশন',
        'beauty': 'অন্যান্য', 'বিউটি': 'অন্যান্য', 'others': 'অন্যান্য',
        'kids': 'বাচ্চাদের ফ্যাশন', 'kids fashion': 'বাচ্চাদের ফ্যাশন', 'বাচ্চা': 'বাচ্চাদের ফ্যাশন', 'শিশু': 'বাচ্চাদের ফ্যাশন',
        'মহিলা ফ্যাশন': 'মহিলা ফ্যাশন', 'পুরুষ ফ্যাশন': 'পুরুষ ফ্যাশন', 'কাপল': 'কাপল', 'গ্যাজেট': 'গ্যাজেট', 'বাচ্চাদের ফ্যাশন': 'বাচ্চাদের ফ্যাশন', 'অন্যান্য': 'অন্যান্য'
    };
    function normalizeCatName(name) {
        var key = String(name || '').trim().toLowerCase();
        return CATEGORY_ALIAS[key] || name;
    }

    var hamburger = null;
    var drawer = null;
    var overlay = null;

    function esc(text) {
        if (text === undefined || text === null) return '';
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    var OLD_CAT_NAMES = ['ফ্যাশন', 'ইলেকট্রনিক্স', 'বিউটি', 'হোম ও লিভিং', 'খেলনা', 'বই ও শিক্ষা', 'গ্রোসারি',
        'gadget', 'ফিমেল ফ্যাশন', 'female fashion', 'male fashion', 'beauty', 'electronics', 'others', 'home', 'toys', 'books', 'grocery'];

    function cleanCats(list) {
        var seen = {}, out = [];
        (list || []).forEach(function (c) {
            var nm = normalizeCatName(c.name);
            var key = String(nm || '').trim().toLowerCase();
            if (!nm || OLD_CAT_NAMES.indexOf(key) !== -1) return;
            if (seen[nm]) return;
            seen[nm] = 1;
            out.push({ name: nm, icon: c.icon || '', image: c.image || '' });
        });
        return out;
    }

    function readCache() {
        try {
            var c = JSON.parse(localStorage.getItem(CATS_CACHE_KEY) || 'null');
            // v2 চিহ্নিত ক্যাশই শুধু মান্য — পুরনো (Gadget/ফ্যাশন মেশানো) ক্যাশ বাদ
            if (c && c.v === 2 && c.t && (Date.now() - c.t < CATS_CACHE_TTL) && c.list && c.list.length) {
                return cleanCats(c.list);
            }
        } catch (e) {}
        return null;
    }

    function writeCache(list) {
        try { localStorage.setItem(CATS_CACHE_KEY, JSON.stringify({ v: 2, t: Date.now(), list: cleanCats(list) })); } catch (e) {}
    }

    function catIconHtml(c) {
        return c.image
            ? '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy">'
            : '<span>' + (c.icon || '📦') + '</span>';
    }

    function renderCats(list) {
        if (!drawer) return;
        var wrap = document.getElementById('skDrawerCats');
        if (!wrap) return;
        var html = '';
        list.forEach(function (c) {
            html += '<a class="sk-drawer-cat" href="category.html?cat=' + encodeURIComponent(c.name) + '">'
                + '<span class="sk-drawer-cat-icon">' + catIconHtml(c) + '</span>'
                + '<span class="sk-drawer-cat-name">' + esc(c.name) + '</span>'
                + '<i class="fas fa-chevron-right sk-drawer-cat-arrow"></i></a>';
        });
        html += '<a class="sk-drawer-cat" href="category.html?cat=all">'
            + '<span class="sk-drawer-cat-icon"><span>🛍️</span></span>'
            + '<span class="sk-drawer-cat-name">সব পণ্য</span>'
            + '<i class="fas fa-chevron-right sk-drawer-cat-arrow"></i></a>';
        wrap.innerHTML = html;
    }

    function loadCats() {
        // ডিফল্ট + লাইভ merge — হার্ডকোড ক্যাটাগরি কখনো হারায় না (যেমন ফ্যাশন)
        var mergeCats = function (base, live) {
            var seen = {}, out = [];
            base.forEach(function (c) { if (!seen[c.name]) { seen[c.name] = 1; out.push(c); } });
            (live || []).forEach(function (c) { if (!seen[c.name]) { seen[c.name] = 1; out.push(c); } });
            return out;
        };
        // ১) ক্যাশ/ডিফল্ট — সাথে সাথেই render (ড্রয়ার কখনো খালি থাকে না)
        var cached = readCache();
        renderCats(mergeCats(DEFAULT_CATS, cached || []));

        // ২) Firestore থেকে লাইভ — merge করে আপডেট
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) return;
            firebase.firestore().collection('categories').get().then(function (snap) {
                var live = [];
                snap.forEach(function (doc) {
                    var d = doc.data();
                    if (d.active !== false && d.name) live.push({ name: normalizeCatName(d.name), icon: d.icon || '', image: d.image || '' });
                });
                live = cleanCats(live);
                if (!live.length) return;
                live.sort(function (a, b) { return a.name.localeCompare(b.name); });
                var merged = mergeCats(DEFAULT_CATS, live);
                renderCats(merged);
                writeCache(merged);
            }).catch(function () {});
        } catch (e) {}
    }

    function openDrawer() {
        if (!drawer || !overlay) return;
        drawer.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
    }

    function closeDrawer() {
        if (!drawer || !overlay) return;
        drawer.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
    }

    function init() {
        if (!document.body) return;

        // নেভবার খুঁজে বের করি (সব পেজে .navbar আছে; না থাকলে skip)
        var nav = document.querySelector('.navbar');
        if (!nav) return;
        var icons = nav.querySelector('.nav-icons');

        // ১) ☰ বাটন
        hamburger = document.createElement('button');
        hamburger.className = 'sk-hamburger';
        hamburger.id = 'skHamburger';
        hamburger.setAttribute('aria-label', 'মেনু খুলুন');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        hamburger.addEventListener('click', function () {
            openDrawer();
            hamburger.setAttribute('aria-expanded', 'true');
        });

        if (icons) {
            icons.insertBefore(hamburger, icons.firstChild);
        } else {
            var navContainer = nav.querySelector('.nav-container') || nav;
            navContainer.appendChild(hamburger);
        }

        // ২) Overlay
        overlay = document.createElement('div');
        overlay.className = 'sk-drawer-overlay';
        overlay.id = 'skDrawerOverlay';
        overlay.addEventListener('click', closeDrawer);
        document.body.appendChild(overlay);

        // ৩) Drawer
        drawer = document.createElement('aside');
        drawer.className = 'sk-drawer';
        drawer.id = 'skDrawer';
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML =
            '<div class="sk-drawer-head">'
            + '<a href="index.html" class="sk-drawer-brand" onclick="if(window.closeDrawer)window.closeDrawer()">'
            + '<span class="sk-drawer-logo"><img src="' + LOGO_URL + '" alt="স্মার্ট কেনাকাটা"></span>'
            + '<span class="sk-drawer-brand-text"><strong>স্মার্ট কেনাকাটা</strong><small>Trusted Online Shop</small></span>'
            + '</a>'
            + '<button class="sk-drawer-close" id="skDrawerClose" aria-label="বন্ধ করুন"><i class="fas fa-times"></i></button>'
            + '</div>'
            + '<nav class="sk-drawer-links">'
            + '<a href="index.html"><i class="fas fa-home"></i> হোম</a>'
            + '<a href="wishlist.html"><i class="fas fa-heart"></i> উইশলিস্ট</a>'
            + '<a href="tracking.html"><i class="fas fa-box"></i> অর্ডার ট্র্যাকিং</a>'
            + '<a href="pages.html?tab=contact"><i class="fas fa-headset"></i> যোগাযোগ</a>'
            + '</nav>'
            + '<div class="sk-drawer-cats-title"><span>📂 ক্যাটাগরি</span></div>'
            + '<div class="sk-drawer-cats" id="skDrawerCats">'
            + '<div class="sk-drawer-cat sk-drawer-cat-skel"><div class="sk-drawer-skel-line"></div></div>'
            + '<div class="sk-drawer-cat sk-drawer-cat-skel"><div class="sk-drawer-skel-line"></div></div>'
            + '<div class="sk-drawer-cat sk-drawer-cat-skel"><div class="sk-drawer-skel-line"></div></div>'
            + '</div>'
            + '<div class="sk-drawer-foot">'
            + '<span><i class="fas fa-phone"></i> ০১৯৩২২১১১২৩</span>'
            + '<span><i class="fas fa-truck-fast"></i> সারাদেশে ডেলিভারি</span>'
            + '</div>';
        document.body.appendChild(drawer);

        // বন্ধ করার সব রাস্তা
        var closeBtn = document.getElementById('skDrawerClose');
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        drawer.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('a')) closeDrawer();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeDrawer();
        });

        // ক্যাটাগরি লোড
        loadCats();
    }

    // window helpers (index-এর মতো closeCart প্যাটার্নে)
    window.openNavDrawer = openDrawer;
    window.closeNavDrawer = closeDrawer;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
