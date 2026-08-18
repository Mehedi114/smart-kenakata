// ============================================================
// 🤩 স্মার্ট কেনাকাটা — FIRST IMPRESSION PACK (speed-safe)
//   ১) 🎉 প্রথম ভিজিটে ওয়েলকাম কার্ড (একবারই) → স্পিন হুইলে নিয়ে যায়
//   ২) 📢 চলন্ত ঘোষণা টিকার — অ্যাডমিন সেটিংস থেকে টেক্সট/% বদলানো যায়
//   ৩) 🛒 সৎ সোশ্যাল প্রুফ — শুধু আসল অর্ডার, আসল সময়; না থাকলে দেখায় না
//   ৪) ⌨️ টাইপিং ট্যাগলাইন + 🔢 কাউন্টার অ্যানিমেশন
// স্পিড: defer লোড, শুধু transform/opacity অ্যানিমেশন (GPU),
//        Firestore রিড সর্বোচ্চ ১টা (অর্ডার) — টিকার settings ক্যাশ থেকেই পায়
// ============================================================
(function () {
    'use strict';

    /* ================= CSS (একবারে inject — কোনো এক্সটার্নাল ফাইল না) ================= */
    var css = ''
    // --- টিকার ---
    + '.sk-ticker{overflow:hidden;background:linear-gradient(90deg,#1d4ed8,#2563eb,#1d4ed8);color:#fff;font-size:13.5px;font-weight:600;position:relative;z-index:999;}'
    + '.sk-ticker-track{display:inline-flex;white-space:nowrap;padding:7px 0;animation:skTickerMove 28s linear infinite;will-change:transform;}'
    + '.sk-ticker-track span{padding:0 34px;}'
    + '.sk-ticker:hover .sk-ticker-track{animation-play-state:paused;}'
    + '@keyframes skTickerMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
    + 'body.dark-mode .sk-ticker{background:linear-gradient(90deg,#0b1120,#1e1b4b,#0b1120);color:#fbbf24;border-bottom:1px solid rgba(251,191,36,.2);}'
    // --- ওয়েলকাম কার্ড ---
    + '.sk-welcome-ov{position:fixed;inset:0;background:rgba(2,6,23,.55);backdrop-filter:blur(3px);z-index:99980;opacity:0;pointer-events:none;transition:opacity .35s;}'
    + '.sk-welcome-ov.show{opacity:1;pointer-events:auto;}'
    + '.sk-welcome{position:fixed;left:50%;top:50%;z-index:99981;width:min(90vw,360px);background:#fff;border-radius:22px;padding:28px 24px 22px;text-align:center;'
    + 'transform:translate(-50%,-50%) scale(.85) translateY(24px);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.22,.61,.36,1),opacity .35s;box-shadow:0 25px 70px rgba(2,6,23,.4);}'
    + '.sk-welcome.show{transform:translate(-50%,-50%) scale(1) translateY(0);opacity:1;pointer-events:auto;}'
    + '.sk-welcome .wemoji{font-size:52px;line-height:1;animation:skWelBounce 1.8s ease-in-out infinite;display:inline-block;}'
    + '@keyframes skWelBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}'
    + '.sk-welcome h3{font-size:20px;font-weight:800;color:#0f172a;margin:10px 0 6px;}'
    + '.sk-welcome p{font-size:13.5px;color:#64748b;margin-bottom:16px;line-height:1.6;}'
    + '.sk-welcome .wbtn{display:block;width:100%;background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;border:none;font-weight:800;font-size:15px;padding:13px;border-radius:12px;cursor:pointer;font-family:inherit;box-shadow:0 8px 22px rgba(245,158,11,.35);transition:transform .2s;}'
    + '.sk-welcome .wbtn:active{transform:scale(.96);}'
    + '.sk-welcome .wskip{background:none;border:none;color:#94a3b8;font-size:12.5px;margin-top:10px;cursor:pointer;font-family:inherit;}'
    + 'body.dark-mode .sk-welcome{background:#1e293b;}body.dark-mode .sk-welcome h3{color:#f1f5f9;}'
    // --- সোশ্যাল প্রুফ টোস্ট ---
    + '.sk-proof{position:fixed;left:14px;bottom:150px;z-index:9700;display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:10px 14px;max-width:290px;'
    + 'box-shadow:0 10px 34px rgba(2,6,23,.18);border:1px solid #e2e8f0;transform:translateX(-115%);transition:transform .5s cubic-bezier(.22,.61,.36,1);will-change:transform;}'
    + '.sk-proof.show{transform:translateX(0);}'
    + '.sk-proof img{width:42px;height:42px;border-radius:9px;object-fit:cover;background:#f1f5f9;flex-shrink:0;}'
    + '.sk-proof .ptxt{font-size:12px;color:#334155;line-height:1.45;min-width:0;}'
    + '.sk-proof .ptxt b{color:#0f172a;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;}'
    + '.sk-proof .ptime{color:#16a34a;font-weight:700;font-size:11px;}'
    + '.sk-proof .pclose{background:none;border:none;color:#cbd5e1;cursor:pointer;font-size:13px;padding:2px;flex-shrink:0;}'
    + 'body.dark-mode .sk-proof{background:#1e293b;border-color:#334155;}body.dark-mode .sk-proof .ptxt{color:#cbd5e1;}body.dark-mode .sk-proof .ptxt b{color:#f1f5f9;}'
    + '@media (max-width:480px){.sk-proof{bottom:140px;max-width:250px;}}'
    // --- কাউন্টার স্ট্রিপ ---
    + '.sk-stats{display:flex;justify-content:center;gap:34px;flex-wrap:wrap;padding:26px 16px;max-width:1400px;margin:0 auto;}'
    + '.sk-stat{text-align:center;min-width:96px;}'
    + '.sk-stat b{display:block;font-size:26px;font-weight:800;color:#1d4ed8;font-variant-numeric:tabular-nums;}'
    + '.sk-stat small{font-size:12.5px;color:#64748b;font-weight:600;}'
    + 'body.dark-mode .sk-stat b{color:#fbbf24;}'
    // --- টাইপিং ট্যাগলাইন ---
    + '.sk-type-wrap{color:inherit;}'
    + '.sk-type-caret{display:inline-block;width:2px;height:1em;background:currentColor;margin-left:2px;vertical-align:-2px;animation:skCaret 0.9s step-end infinite;}'
    + '@keyframes skCaret{0%,100%{opacity:1}50%{opacity:0}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    function bn(s) { return String(s).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); }

    /* ================= ১) 📢 ঘোষণা টিকার ================= */
    // অ্যাডমিন → সেটিংস → "টিকার টেক্সট" থেকে আসে; | দিয়ে ভাগ করলে আলাদা আইটেম
    function buildTicker() {
        var txt = '';
        try { txt = (window.SKS && SKS('tickerText')) || ''; } catch (e) {}
        if (!txt) return; // অ্যাডমিন কিছু না দিলে টিকারই নেই — জিরো ওজন
        var items = String(txt).split('|').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!items.length) return;
        var old = document.getElementById('skTicker');
        if (old) old.remove();
        var bar = document.createElement('div');
        bar.className = 'sk-ticker';
        bar.id = 'skTicker';
        var spans = items.map(function (t) { return '<span>' + t.replace(/</g, '&lt;') + '</span>'; }).join('');
        // দুই কপি — seamless লুপ (50% translate = এক কপির প্রস্থ)
        bar.innerHTML = '<div class="sk-ticker-track">' + spans + spans + '</div>';
        var nav = document.querySelector('.navbar');
        if (nav && nav.parentNode) nav.parentNode.insertBefore(bar, nav.nextSibling);
        else if (document.body) document.body.insertBefore(bar, document.body.firstChild);
    }
    // settings পরে এলে টিকার আপডেট
    document.addEventListener('sk-settings', buildTicker);

    /* ================= ২) 🎉 প্রথম ভিজিটে ওয়েলকাম (একবারই) ================= */
    function maybeWelcome() {
        try { if (localStorage.getItem('sk_welcomed') === '1') return; } catch (e) {}
        // চেকআউট/অ্যাডমিনে বিরক্ত করব না
        if (/checkout|admin|tracking/.test(location.pathname)) return;
        var ov = document.createElement('div');
        ov.className = 'sk-welcome-ov';
        var card = document.createElement('div');
        card.className = 'sk-welcome';
        card.innerHTML = '<span class="wemoji">🛍️</span>'
            + '<h3>স্মার্ট কেনাকাটায় স্বাগতম!</h3>'
            + '<p>আপনার জন্য আজ <b style="color:#d97706;">২টি ফ্রি স্পিন</b> অপেক্ষা করছে —<br>ঘুরিয়ে জিতে নিন ছাড় কুপন, এমনকি ফ্রি ডেলিভারি! 🎡</p>'
            + '<button type="button" class="wbtn" id="skWelSpin">🎡 ফ্রি স্পিন ঘোরান</button>'
            + '<button type="button" class="wskip" id="skWelSkip">এখন না, পরে ঘোরাবো</button>';
        document.body.appendChild(ov);
        document.body.appendChild(card);
        var close = function (openSpin) {
            ov.classList.remove('show');
            card.classList.remove('show');
            try { localStorage.setItem('sk_welcomed', '1'); } catch (e) {}
            setTimeout(function () { ov.remove(); card.remove(); }, 400);
            if (openSpin && window.skSpinOpen) setTimeout(window.skSpinOpen, 350);
        };
        ov.addEventListener('click', function () { close(false); });
        card.querySelector('#skWelSpin').addEventListener('click', function () { close(true); });
        card.querySelector('#skWelSkip').addEventListener('click', function () { close(false); });
        // ১.৮ সেকেন্ড পরে — পেজ আগে আঁকা হোক (LCP-তে শূন্য প্রভাব)
        setTimeout(function () {
            requestAnimationFrame(function () { ov.classList.add('show'); card.classList.add('show'); });
        }, 1800);
    }

    /* ================= ৩) 🛒 সৎ সোশ্যাল প্রুফ ================= */
    // শুধু আসল অর্ডার — ৭২ ঘণ্টার ভেতরের; না থাকলে কিছুই দেখায় না (ভুয়া লুপ নেই)
    var PROOF_MAX_AGE_H = 72;
    function relTime(ms) {
        var m = Math.floor((Date.now() - ms) / 60000);
        if (m < 2) return 'এইমাত্র';
        if (m < 60) return bn(m) + ' মিনিট আগে';
        var h = Math.floor(m / 60);
        if (h < 24) return bn(h) + ' ঘণ্টা আগে';
        return bn(Math.floor(h / 24)) + ' দিন আগে';
    }
    function maskName(n) {
        n = String(n || '').trim();
        if (!n) return 'একজন ক্রেতা';
        var first = n.split(/\s+/)[0];
        if (first.length <= 2) return first + '***';
        return first.slice(0, 2) + '***' + (first.slice(-1));
    }
    function initProof() {
        var fs = null;
        try { if (window.firebase && firebase.firestore) fs = firebase.firestore(); } catch (e) {}
        if (!fs) return;
        // ১টা মাত্র রিড — সাম্প্রতিক ৫ অর্ডার
        fs.collection('orders').orderBy('createdAt', 'desc').limit(5).get().then(function (snap) {
            var fresh = [];
            snap.forEach(function (d) {
                var o = d.data();
                var t = (o.createdAt && o.createdAt.seconds) ? o.createdAt.seconds * 1000 : 0;
                if (!t || (Date.now() - t) > PROOF_MAX_AGE_H * 3600 * 1000) return;
                if (o.status === 'cancelled') return;
                var item = (o.items && o.items[0]) || {};
                fresh.push({ name: maskName(o.customerName), product: item.name || 'একটি পণ্য', image: item.image || '', time: t });
            });
            if (!fresh.length) return; // সাম্প্রতিক বিক্রি নেই — সৎ থাকি, কিছু দেখাই না
            var idx = 0;
            var showNext = function () {
                if (idx >= Math.min(fresh.length, 3)) return; // পেজভিউতে সর্বোচ্চ ৩টা
                var o = fresh[idx++];
                var el = document.createElement('div');
                el.className = 'sk-proof';
                el.innerHTML = (o.image ? '<img src="' + o.image.replace(/"/g, '') + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '')
                    + '<div class="ptxt"><b>' + o.product.replace(/</g, '&lt;') + '</b>'
                    + o.name + ' অর্ডার করেছেন <span class="ptime">✅ ' + relTime(o.time) + '</span></div>'
                    + '<button type="button" class="pclose">✕</button>';
                document.body.appendChild(el);
                requestAnimationFrame(function () { el.classList.add('show'); });
                var gone = false;
                var hide = function () {
                    if (gone) return; gone = true;
                    el.classList.remove('show');
                    setTimeout(function () { el.remove(); }, 550);
                };
                el.querySelector('.pclose').addEventListener('click', function () { hide(); idx = 99; }); // বন্ধ করলে আর না
                setTimeout(hide, 6000);
                setTimeout(showNext, 14000); // পরেরটা ১৪ সেকেন্ড পরে — বিরক্তিকর না
            };
            setTimeout(showNext, 7000); // প্রথমটা ৭ সেকেন্ড পরে — আগে পেজ উপভোগ করুক
        }).catch(function () {});
    }

    /* ================= ৪) ⌨️ টাইপিং ট্যাগলাইন ================= */
    function initTyping() {
        var target = document.querySelector('.top-bar-content span');
        if (!target) return;
        var phrases = ['সেরা পণ্য, সেরা দামে 🛍️', 'ঢাকায় ২৪ ঘণ্টায় ডেলিভারি 🚚', 'ক্যাশ অন ডেলিভারি — ঝুঁকি নেই ✅', 'প্রতিদিন ২টি ফ্রি স্পিন 🎡'];
        var wrap = document.createElement('span');
        wrap.className = 'sk-type-wrap';
        var txt = document.createElement('span');
        var caret = document.createElement('span');
        caret.className = 'sk-type-caret';
        wrap.appendChild(txt); wrap.appendChild(caret);
        target.innerHTML = '';
        target.appendChild(wrap);
        var pi = 0, ci = 0, deleting = false;
        function step() {
            var p = phrases[pi];
            if (!deleting) {
                ci++;
                txt.textContent = p.slice(0, ci);
                if (ci === p.length) { deleting = true; setTimeout(step, 2200); return; }
                setTimeout(step, 65);
            } else {
                ci--;
                txt.textContent = p.slice(0, ci);
                if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(step, 350); return; }
                setTimeout(step, 28);
            }
        }
        step();
    }

    /* ================= ৫) 🔢 কাউন্টার স্ট্রিপ ================= */
    function initCounters() {
        var features = document.querySelector('.features');
        if (!features || !features.parentNode) return;
        var strip = document.createElement('div');
        strip.className = 'sk-stats';
        var stats = [
            { n: 1000, suffix: '+', label: 'খুশি কাস্টমার' },
            { n: 500, suffix: '+', label: 'পণ্যের সম্ভার' },
            { n: 64, suffix: ' জেলায়', label: 'ডেলিভারি' },
            { n: 24, suffix: '/৭', label: 'সাপোর্ট' }
        ];
        strip.innerHTML = stats.map(function (s, i) {
            return '<div class="sk-stat"><b data-n="' + s.n + '" data-sfx="' + s.suffix + '" id="skStat' + i + '">০</b><small>' + s.label + '</small></div>';
        }).join('');
        features.parentNode.insertBefore(strip, features);
        // ভিউতে এলে গোনা শুরু (IntersectionObserver — স্ক্রলের আগে শূন্য খরচ)
        var done = false;
        var io = new IntersectionObserver(function (en) {
            if (!en[0].isIntersecting || done) return;
            done = true; io.disconnect();
            stats.forEach(function (s, i) {
                var el = document.getElementById('skStat' + i);
                var t0 = performance.now(), dur = 1400;
                function frame(t) {
                    var p = Math.min((t - t0) / dur, 1);
                    // easeOut
                    p = 1 - Math.pow(1 - p, 3);
                    el.textContent = bn(Math.round(s.n * p)) + s.suffix;
                    if (p < 1) requestAnimationFrame(frame);
                }
                requestAnimationFrame(frame);
            });
        }, { threshold: 0.4 });
        io.observe(strip);
    }

    /* ================= BOOT — সব non-blocking ================= */
    function boot() {
        buildTicker();
        initTyping();
        initCounters();
        maybeWelcome();
        // সোশ্যাল প্রুফ সবার পরে — মূল কনটেন্ট আগে
        if ('requestIdleCallback' in window) requestIdleCallback(initProof, { timeout: 5000 });
        else setTimeout(initProof, 4000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
