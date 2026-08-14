/* ============================================================
   ✨ Smart Kenakata — PREMIUM INTERACTION LAYER
   (preloader, scroll-reveal, back-to-top)
   - সম্পূর্ণ optional/failsafe: এই ফাইল লোড না হলেও সাইট ১০০% কাজ করবে
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    /* ---------- 1) Branded preloader ---------- */
    function initLoader() {
        var loader = document.getElementById('skLoader');
        if (!loader) return;
        var hidden = false;
        function hideLoader() {
            if (hidden) return;
            hidden = true;
            loader.classList.add('done');
            setTimeout(function () {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 650);
        }
        if (document.readyState === 'complete') hideLoader();
        else {
            window.addEventListener('load', hideLoader);
            setTimeout(hideLoader, 2600); // failsafe — কোনোভাবেই আটকে থাকবে না
        }
    }

    /* ---------- 2) Scroll reveal (DOM-এ পরে আসা কার্ডও ধরে) ---------- */
    var REVEAL_SELECTOR = '.product-card, .category-card, .feature-card, .sk-flash-card, .order-card, .contact-info, .contact-form';
    var revealObserver = null;

    function tagReveal(el) {
        if (el.nodeType !== 1 || el.classList.contains('sk-reveal') || el.classList.contains('in')) return;
        if (!el.matches(REVEAL_SELECTOR)) return;
        el.classList.add('sk-reveal');
        if (revealObserver) revealObserver.observe(el);
    }

    function scanReveal(root) {
        if (root.querySelectorAll) {
            if (root.matches && root.matches(REVEAL_SELECTOR)) tagReveal(root);
            var list = root.querySelectorAll(REVEAL_SELECTOR);
            for (var i = 0; i < list.length; i++) tagReveal(list[i]);
        }
    }

    function initReveal() {
        if (reduceMotion || !('IntersectionObserver' in window)) return; // motion-off/পুরনো ব্রাউজার: সব visible থাকবে
        document.body.classList.add('sk-motion');
        var seen = 0;
        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                // একই স্ক্রিনের কার্ডগুলোতে ছোট stagger effect
                el.style.transitionDelay = Math.min((seen++ % 6) * 55, 300) + 'ms';
                el.classList.add('in');
                revealObserver.unobserve(el);
                setTimeout(function () { el.style.transitionDelay = ''; }, 900);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

        scanReveal(document);

        // JS দিয়ে পরে render হওয়া কার্ডগুলোও পিক-আপ করি
        if ('MutationObserver' in window) {
            var mo = new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var nodes = muts[i].addedNodes;
                    for (var j = 0; j < nodes.length; j++) scanReveal(nodes[j]);
                }
            });
            mo.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () { mo.disconnect(); }, 30000); // ৩০ সেকেন্ড পর বন্ধ (পারফরম্যান্স)
        }

        // failsafe: ৬ সেকেন্ড পর যা বাকি আছে সব দেখিয়ে দেই
        setTimeout(function () {
            var rest = document.querySelectorAll('.sk-reveal:not(.in)');
            for (var i = 0; i < rest.length; i++) rest[i].classList.add('in');
        }, 6000);
    }

    /* ---------- 3) Back-to-top ---------- */
    function initBackToTop() {
        if (document.querySelector('.sk-top-btn')) return;
        var btn = document.createElement('button');
        btn.className = 'sk-top-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'উপরে যান');
        btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
        btn.addEventListener('click', function () {
            try { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
            catch (e) { window.scrollTo(0, 0); }
        });
        document.body.appendChild(btn);
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                btn.classList.toggle('show', window.pageYOffset > 520);
                ticking = false;
            });
        }, { passive: true });
    }

    /* ---------- 📢 Offer broadcast receiver (admin পাঠালে সব ইউজার পায়) ---------- */
    var LOGO = 'https://i.postimg.cc/7h0NpL4w/Chat-GPT-Image-Aug-9-2026-05-28-09-PM.png';

    // 🔗 নিজের সাইটের ফুল লিংক → রিলেটিভ (404 প্রতিরোধে — ক্লিকের সময় ঠিক করে নেয়)
    function skSelfLink(u) {
        var base = 'https://mehedi114.github.io/smart-kenakata/';
        return (u && u.indexOf(base) === 0) ? u.slice(base.length) : u;
    }

    function showBroadcastPopup(d) {
        if (document.getElementById('skBcPopup')) return;
        var pop = document.createElement('div');
        pop.id = 'skBcPopup';
        pop.setAttribute('role', 'dialog');
        var link = skSelfLink(d.link || '');
        var canAsk = ('Notification' in window && Notification.permission === 'default');
        pop.innerHTML =
            '<div class="sk-bc-icon"><img src="' + LOGO + '" alt=""></div>' +
            '<div class="sk-bc-body">' +
                '<b>' + String(d.title || '🎉 অফার!') + '</b>' +
                '<p>' + String(d.body || '') + '</p>' +
                (canAsk ? '<button type="button" class="sk-bc-perm" id="skBcPerm">🔔 ফোনে নোটিফিকেশন চালু করুন</button>' : '') +
            '</div>' +
            '<button type="button" class="sk-bc-close" id="skBcClose" aria-label="বন্ধ করুন">✕</button>';
        if (link) pop.classList.add('has-link');
        document.body.appendChild(pop);
        requestAnimationFrame(function () { pop.classList.add('show'); });
        var done = function (go) {
            pop.classList.remove('show');
            setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 450);
            if (go && link) { try { window.location.href = link; } catch (e) {} }
        };
        document.getElementById('skBcClose').addEventListener('click', function (e) { e.stopPropagation(); done(false); });
        if (link) pop.addEventListener('click', function () { done(true); });
        var permBtn = document.getElementById('skBcPerm');
        if (permBtn) permBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            try { Notification.requestPermission().then(function () { permBtn.style.display = 'none'; }); } catch (err) {}
        });
        setTimeout(function () { if (pop.parentNode) done(false); }, 12000);

        // OS-level notification (পারমিশন থাকলে — পেজ ওপেন থাকলেও টাস্কবারে যায়)
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                var n = new Notification(d.title || '🎉 অফার!', { body: d.body || '', icon: LOGO, badge: LOGO, tag: 'sk-broadcast' });
                if (link) n.onclick = function () { window.focus(); window.location.href = link; };
            } catch (e) {}
        }
    }

    function initBroadcast() {
        var fs = null;
        try { if (window.firebase && firebase.firestore) fs = firebase.firestore(); } catch (e) {}
        if (!fs) return;
        fs.collection('settings').doc('broadcast').get().then(function (doc) {
            if (!doc.exists) return;
            var d = doc.data() || {};
            var ts = (d.ts && d.ts.seconds) ? d.ts.seconds * 1000 : 0;
            if (!ts || !d.title) return;
            var seen = 0;
            try { seen = Number(localStorage.getItem('sk_bc_seen') || 0); } catch (e) {}
            if (ts <= seen) return;   // আগেই দেখা — repeat হবে না
            try { localStorage.setItem('sk_bc_seen', String(Date.now())); } catch (e) {}
            showBroadcastPopup(d);
        }).catch(function () {});
    }

    function boot() {
        initLoader();
        initReveal();
        initBackToTop();
        // broadcast একটু দেরিতে — মূল কনটেন্ট আগে দেখাক
        setTimeout(initBroadcast, 2500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
