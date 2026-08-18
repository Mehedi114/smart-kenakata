// ============================================================
// 🌗 স্মার্ট কেনাকাটা — প্রিমিয়াম অটো ডার্ক মোড + রিয়েল-টাইম শুভেচ্ছা
//   • রাতে (৬টা - ভোর ৬টা) অটো ডার্ক, দিনে অটো লাইট
//   • ইউজার ম্যানুয়াল টগল করলে সেই পছন্দ আজকের জন্য মনে থাকে
//   • উপরে শুভেচ্ছা বার: শুভ সকাল/দুপুর/বিকাল/সন্ধ্যা/রাত্রি + লাইভ ঘড়ি
//   • ডার্ক মোড = আলাদা প্রিমিয়াম vibe (গভীর নেভি + সোনালি আভা)
// ============================================================
(function () {
    'use strict';

    var DARK_START = 18; // সন্ধ্যা ৬টা
    var DARK_END = 6;    // ভোর ৬টা

    // ---------- সময় অনুযায়ী শুভেচ্ছা ----------
    function greetingInfo() {
        var h = new Date().getHours();
        if (h >= 5 && h < 12)  return { text: 'শুভ সকাল',   emoji: '🌅' };
        if (h >= 12 && h < 16) return { text: 'শুভ দুপুর',  emoji: '☀️' };
        if (h >= 16 && h < 18) return { text: 'শুভ বিকাল',  emoji: '🌇' };
        if (h >= 18 && h < 20) return { text: 'শুভ সন্ধ্যা', emoji: '🌆' };
        return { text: 'শুভ রাত্রি', emoji: '🌙' };
    }

    function isNightNow() {
        var h = new Date().getHours();
        return (h >= DARK_START || h < DARK_END);
    }

    // ---------- ম্যানুয়াল override (আজকের জন্য) ----------
    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }
    function getManual() {
        try {
            var m = JSON.parse(localStorage.getItem('sk_theme_manual') || 'null');
            if (m && m.date === todayKey()) return m.mode; // 'dark' | 'light'
        } catch (e) {}
        return null;
    }
    function setManual(mode) {
        try { localStorage.setItem('sk_theme_manual', JSON.stringify({ date: todayKey(), mode: mode })); } catch (e) {}
    }

    // ---------- মোড প্রয়োগ ----------
    function applyMode(dark) {
        var b = document.body;
        if (dark) {
            b.classList.add('dark-mode');
            try { localStorage.setItem('theme', 'dark'); } catch (e) {}
        } else {
            b.classList.remove('dark-mode');
            try { localStorage.setItem('theme', 'light'); } catch (e) {}
        }
        syncBar();
    }
    function desiredMode() {
        var manual = getManual();
        if (manual) return manual === 'dark';
        return isNightNow();
    }

    // ---------- 🎨 প্রিমিয়াম ডার্ক CSS (আলাদা vibe + কালো টেক্সট ফিক্স) ----------
    function injectCSS() {
        var css = ''
        // === শুভেচ্ছা বার ===
        + '#skGreetBar{display:flex;align-items:center;justify-content:center;gap:10px;padding:7px 14px;font-size:13.5px;font-weight:700;position:relative;z-index:1001;'
        + 'background:linear-gradient(135deg,#e0f2fe,#fef9c3,#e0f2fe);color:#0c4a6e;transition:background .6s,color .6s;}'
        + '#skGreetBar .sk-greet-clock{font-variant-numeric:tabular-nums;background:rgba(255,255,255,.55);padding:2px 10px;border-radius:999px;font-size:12.5px;}'
        + '#skGreetBar .sk-greet-toggle{background:rgba(255,255,255,.65);border:none;border-radius:999px;padding:3px 12px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:700;transition:transform .2s;}'
        + '#skGreetBar .sk-greet-toggle:active{transform:scale(.92);}'
        // রাতের বার — গভীর নেভি + সোনালি
        + 'body.dark-mode #skGreetBar{background:linear-gradient(135deg,#0b1120,#1e1b4b,#0b1120);color:#fbbf24;box-shadow:0 1px 12px rgba(251,191,36,.15);}'
        + 'body.dark-mode #skGreetBar .sk-greet-clock{background:rgba(251,191,36,.12);color:#fde68a;}'
        + 'body.dark-mode #skGreetBar .sk-greet-toggle{background:rgba(251,191,36,.15);color:#fde68a;}'
        // === প্রিমিয়াম ডার্ক vibe — গভীর নেভি বেস + সোনালি অ্যাকসেন্ট ===
        + 'body.dark-mode{background:radial-gradient(1100px 500px at 80% -100px,rgba(99,102,241,.14),transparent 60%),radial-gradient(900px 420px at 5% -80px,rgba(251,191,36,.07),transparent 60%),#0b1120 !important;}'
        + 'body.dark-mode .navbar{border-bottom:1px solid rgba(251,191,36,.18) !important;}'
        + 'body.dark-mode .section-title::after{background:linear-gradient(135deg,#fbbf24,#d97706) !important;}'
        + 'body.dark-mode .product-card,body.dark-mode .category-card{box-shadow:0 4px 18px rgba(0,0,0,.45) !important;border:1px solid rgba(148,163,184,.12) !important;}'
        + 'body.dark-mode .product-card:hover{border-color:rgba(251,191,36,.35) !important;box-shadow:0 10px 30px rgba(251,191,36,.12) !important;}'
        // === 🗂️ ক্যাটাগরি লাইন — ডার্ক মোডে গোল্ডেন থিম ===
        + 'body.dark-mode .sk-cat-icon{background:linear-gradient(145deg,#1c1917,#292524) !important;'
        + 'box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 0 0 2px rgba(251,191,36,.45) !important;}'
        + 'body.dark-mode .sk-cat-name{color:#fbbf24 !important;font-weight:700 !important;}'
        + 'body.dark-mode .sk-cat-item:hover .sk-cat-icon{box-shadow:0 10px 26px rgba(251,191,36,.28),inset 0 0 0 2.5px #fbbf24 !important;transform:translateY(-3px);}'
        + 'body.dark-mode .sk-cat-item:hover .sk-cat-name{color:#fde68a !important;}'
        // ক্যাটাগরি কার্ড (গ্রিড ভার্সন) — সোনালি বর্ডার+টেক্সট
        + 'body.dark-mode .category-card{border:1px solid rgba(251,191,36,.22) !important;}'
        + 'body.dark-mode .category-card:hover{border-color:rgba(251,191,36,.55) !important;box-shadow:0 10px 28px rgba(251,191,36,.15) !important;}'
        + 'body.dark-mode .category-card h3,body.dark-mode .category-card .cat-name{color:#fbbf24 !important;}'
        // সেকশন টাইটেল/সাবটাইটেল — সোনালি ছোঁয়া
        + 'body.dark-mode .section-title{color:#fde68a !important;}'
        + 'body.dark-mode .section-subtitle{color:#a8a29e !important;}'
        + 'body.dark-mode .sk-view-all{background:transparent !important;color:#fbbf24 !important;border-color:rgba(251,191,36,.5) !important;}'
        + 'body.dark-mode .sk-view-all:hover{background:linear-gradient(135deg,#fbbf24,#d97706) !important;color:#0b1120 !important;}'
        // === 🧭 হোমের উপরের ক্যাটাগরি মেনু (হোম | ইলেকট্রনিক্স | ফ্যাশন...) — গোল্ডেন ===
        + 'body.dark-mode .nav-menu{background:#0b1120 !important;border-top-color:rgba(251,191,36,.2) !important;border-bottom-color:rgba(251,191,36,.2) !important;}'
        + 'body.dark-mode .nav-menu a{color:#fbbf24 !important;font-weight:600 !important;}'
        + 'body.dark-mode .nav-menu a:hover{color:#fde68a !important;text-shadow:0 0 12px rgba(251,191,36,.45);}'
        + 'body.dark-mode .nav-menu a.active{color:#fde68a !important;border-bottom:2px solid #fbbf24;padding-bottom:3px;}'
        // === কালো/গাঢ় inline টেক্সট ফিক্স — ডার্কে অদৃশ্য হয়ে যেত ===
        + 'body.dark-mode [style*="color:#0f172a"],body.dark-mode [style*="color:#1e293b"],body.dark-mode [style*="color:#334155"],'
        + 'body.dark-mode [style*="color: #0f172a"],body.dark-mode [style*="color: #1e293b"],body.dark-mode [style*="color: #334155"],'
        + 'body.dark-mode [style*="color:#111"],body.dark-mode [style*="color:#000"],body.dark-mode [style*="color: #111"],body.dark-mode [style*="color: #000"]'
        + '{color:#e2e8f0 !important;}'
        + 'body.dark-mode [style*="color:#64748b"],body.dark-mode [style*="color: #64748b"],body.dark-mode [style*="color:#78350f"],body.dark-mode [style*="color: #78350f"]{color:#94a3b8 !important;}'
        + 'body.dark-mode [style*="background:white"],body.dark-mode [style*="background: white"],body.dark-mode [style*="background:#fff"],body.dark-mode [style*="background: #fff"],body.dark-mode [style*="background:#f8fafc"],body.dark-mode [style*="background: #f8fafc"]{background:#1e293b !important;color:#e2e8f0 !important;}'
        + 'body.dark-mode p,body.dark-mode li,body.dark-mode label,body.dark-mode small{color:inherit;}'
        + 'body.dark-mode ::placeholder{color:#64748b !important;}'
        + 'body.dark-mode{color-scheme:dark;}'
        // === 💡 বাল্ব টগল অ্যানিমেশন ===
        + '#skBulbOverlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:flex-start;justify-content:center;pointer-events:none;opacity:0;}'
        + '#skBulbOverlay.show{opacity:1;pointer-events:auto;}'
        + '#skBulbOverlay .sk-bulb-bg{position:absolute;inset:0;transition:background .5s ease;}'
        + '#skBulbOverlay.to-dark .sk-bulb-bg{background:rgba(2,6,23,0);animation:skBgDark 1.5s ease forwards;}'
        + '#skBulbOverlay.to-light .sk-bulb-bg{background:rgba(255,251,235,0);animation:skBgLight 1.5s ease forwards;}'
        + '@keyframes skBgDark{0%{background:rgba(2,6,23,0)}45%{background:rgba(2,6,23,.35)}70%{background:rgba(2,6,23,.92)}100%{background:rgba(2,6,23,0)}}'
        + '@keyframes skBgLight{0%{background:rgba(255,251,235,0)}45%{background:rgba(255,251,235,.4)}70%{background:rgba(255,251,235,.95)}100%{background:rgba(255,251,235,0)}}'
        + '.sk-bulb-rig{position:relative;display:flex;flex-direction:column;align-items:center;transform:translateY(-140px);animation:skRigDrop .6s cubic-bezier(.34,1.56,.64,1) forwards;}'
        + '@keyframes skRigDrop{to{transform:translateY(0)}}'
        + '#skBulbOverlay.leaving .sk-bulb-rig{animation:skRigUp .45s ease-in forwards;}'
        + '@keyframes skRigUp{to{transform:translateY(-160px);opacity:0}}'
        + '.sk-bulb-wire{width:3px;height:70px;background:linear-gradient(#475569,#64748b);border-radius:2px;}'
        + '.sk-bulb{font-size:64px;line-height:1;filter:drop-shadow(0 0 26px rgba(251,191,36,.9));transform-origin:top center;animation:skBulbSway 1.6s ease-in-out infinite;transition:filter .35s;}'
        + '.sk-bulb.off{filter:grayscale(1) brightness(.45) drop-shadow(0 0 0 transparent);}'
        + '@keyframes skBulbSway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}'
        + '.sk-bulb-cord{width:2.5px;height:46px;background:#94a3b8;border-radius:2px;position:relative;}'
        + '.sk-bulb-cord::after{content:"";position:absolute;bottom:-11px;left:50%;transform:translateX(-50%);width:11px;height:11px;border-radius:50%;background:#f59e0b;box-shadow:0 2px 6px rgba(0,0,0,.4);}'
        + '#skBulbOverlay .sk-cord-pull{animation:skCordPull .55s ease .35s;}'
        + '@keyframes skCordPull{0%{transform:translateY(0)}40%{transform:translateY(16px)}70%{transform:translateY(-4px)}100%{transform:translateY(0)}}'
        + '.sk-bulb-flash{position:absolute;top:130px;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;pointer-events:none;}'
        + '#skBulbOverlay.to-light .sk-bulb-flash{animation:skFlashLight .9s ease .55s forwards;background:radial-gradient(circle,rgba(253,230,138,.95),rgba(253,230,138,0) 70%);}'
        + '#skBulbOverlay.to-dark .sk-bulb-flash{animation:skFlashDark .9s ease .55s forwards;background:radial-gradient(circle,rgba(15,23,42,.9),rgba(15,23,42,0) 70%);}'
        + '@keyframes skFlashLight{0%{width:10px;height:10px;opacity:1}100%{width:340vmax;height:340vmax;opacity:0}}'
        + '@keyframes skFlashDark{0%{width:10px;height:10px;opacity:1}100%{width:340vmax;height:340vmax;opacity:0}}'
        + '.sk-bulb-text{margin-top:14px;font-weight:800;font-size:15px;color:#fbbf24;text-shadow:0 2px 8px rgba(0,0,0,.5);opacity:0;animation:skTextIn .4s ease .75s forwards;}'
        + '@keyframes skTextIn{to{opacity:1}}'
        + '@media (prefers-reduced-motion:reduce){#skBulbOverlay{display:none !important;}}';
        var st = document.createElement('style');
        st.id = 'sk-auto-theme-css';
        st.textContent = css;
        document.head.appendChild(st);
    }

    // ---------- শুভেচ্ছা বার ----------
    function buildBar() {
        if (document.getElementById('skGreetBar')) return;
        var bar = document.createElement('div');
        bar.id = 'skGreetBar';
        bar.innerHTML = '<span id="skGreetText"></span>'
            + '<span class="sk-greet-clock" id="skGreetClock"></span>'
            + '<button type="button" class="sk-greet-toggle" id="skGreetToggle" title="ডার্ক/লাইট মোড"></button>';
        document.body.insertBefore(bar, document.body.firstChild);
        document.getElementById('skGreetToggle').addEventListener('click', function () {
            var nowDark = document.body.classList.contains('dark-mode');
            setManual(nowDark ? 'light' : 'dark');
            playBulbAnimation(!nowDark);
        });
        tick();
    }

    // ---------- 💡 বাল্ব অন/অফ অ্যানিমেশন ----------
    var bulbBusy = false;
    function playBulbAnimation(goDark) {
        if (bulbBusy) return;
        bulbBusy = true;
        var ov = document.createElement('div');
        ov.id = 'skBulbOverlay';
        ov.className = goDark ? 'to-dark' : 'to-light';
        ov.innerHTML = ''
            + '<div class="sk-bulb-bg"></div>'
            + '<div class="sk-bulb-rig">'
            + '  <div class="sk-bulb-wire"></div>'
            + '  <div class="sk-bulb ' + (goDark ? '' : 'off') + '" id="skBulbIcon">💡</div>'
            + '  <div class="sk-bulb-cord sk-cord-pull"></div>'
            + '  <div class="sk-bulb-text">' + (goDark ? '🌙 লাইট অফ...' : '☀️ লাইট অন...') + '</div>'
            + '</div>'
            + '<div class="sk-bulb-flash"></div>';
        document.body.appendChild(ov);
        requestAnimationFrame(function () { ov.classList.add('show'); });

        // দড়ি টানার পরে টুস — বাল্ব জ্বলে/নিভে
        setTimeout(function () {
            var bulb = document.getElementById('skBulbIcon');
            if (bulb) bulb.classList.toggle('off', goDark);
        }, 620);

        // আলোর ঢেউয়ের মাঝপথে থিম বদলাই — সবচেয়ে মসৃণ মুহূর্ত
        setTimeout(function () {
            applyMode(goDark);
        }, 950);

        // বাল্ব উপরে উঠে বিদায়
        setTimeout(function () { ov.classList.add('leaving'); }, 1450);
        setTimeout(function () {
            if (ov.parentNode) ov.parentNode.removeChild(ov);
            bulbBusy = false;
        }, 2000);
    }

    function bnNum(s) { return String(s).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'[+d]; }); }

    function tick() {
        var g = greetingInfo();
        var t = document.getElementById('skGreetText');
        var c = document.getElementById('skGreetClock');
        if (t) t.textContent = g.emoji + ' ' + g.text + '!';
        if (c) {
            var d = new Date();
            var h = d.getHours() % 12 || 12;
            var ampm = d.getHours() < 12 ? 'AM' : 'PM';
            c.textContent = bnNum(String(h).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0')) + ' ' + ampm;
        }
    }

    function syncBar() {
        var btn = document.getElementById('skGreetToggle');
        if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ লাইট' : '🌙 ডার্ক';
    }

    // ---------- INIT ----------
    function init() {
        injectCSS();
        applyMode(desiredMode());
        buildBar();
        syncBar();
        // লাইভ ঘড়ি — প্রতি সেকেন্ডে
        setInterval(tick, 1000);
        // অটো মোড সুইচ — প্রতি মিনিটে চেক (ম্যানুয়াল override থাকলে সম্মান করে)
        setInterval(function () {
            if (!getManual()) {
                var want = isNightNow();
                var has = document.body.classList.contains('dark-mode');
                if (want !== has) applyMode(want);
            }
        }, 60000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
