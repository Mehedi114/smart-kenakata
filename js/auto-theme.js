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
        + 'body.dark-mode{color-scheme:dark;}';
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
            applyMode(!nowDark);
        });
        tick();
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
