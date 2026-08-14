// ============================================================
// 🎡 স্মার্ট কেনাকাটা — লাকি স্পিন হুইল
// নিয়ম:
//   • ~১০০ জন ভিজিটরে ১ জন ফ্রি স্পিন পায় (দৈবচয়ন, দিনে একবার চেক)
//   • কেনাকাটা (অর্ডার সফল) করলে ১টা স্পিন নিশ্চিত
//   • প্রতিদিন সর্বোচ্চ ২টা স্পিন
//   • পুরস্কার: বেশিরভাগ ৫-১০ টাকা, কদাচিৎ ২০/৫০ টাকা
//   • জেতা টাকা = কুপন কোড (৭ দিন মেয়াদ, ১ বার ব্যবহারযোগ্য)
// নির্ভরতা: firebase (compat) আগে লোড থাকতে হবে
// ============================================================
(function () {
    'use strict';

    var LUCKY_CHANCE = 0.01;      // ১% ভিজিটর
    var MAX_SPINS_PER_DAY = 2;
    var COUPON_MIN_ORDER = 100;   // কুপন খাটবে ন্যূনতম ১০০ টাকার অর্ডারে
    var COUPON_DAYS_VALID = 7;

    // পুরস্কার — ওজনসহ (মোট ১০০)
    var PRIZES = [
        { amount: 5,  weight: 45, label: '৳৫ ছাড়' },
        { amount: 10, weight: 40, label: '৳১০ ছাড়' },
        { amount: 20, weight: 12, label: '৳২০ ছাড়' },
        { amount: 50, weight: 3,  label: '৳৫০ ছাড়' }
    ];
    // হুইলের ৮টা খোপ (দেখানোর জন্য — জয় নির্ধারণ হয় ওজন দিয়ে)
    var SEGMENTS = ['৳৫', '৳১০', '৳৫', '৳২০', '৳১০', '৳৫', '৳৫০', '৳১০'];
    var SEG_COLORS = ['#2563eb', '#f59e0b', '#3b82f6', '#16a34a', '#fbbf24', '#1d4ed8', '#dc2626', '#f97316'];

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function getState() {
        var s = null;
        try { s = JSON.parse(localStorage.getItem('sk_spin_state') || 'null'); } catch (e) {}
        if (!s || s.date !== todayKey()) {
            s = { date: todayKey(), spinsUsed: 0, luckyChecked: false, lucky: false };
        }
        return s;
    }
    function saveState(s) {
        try { localStorage.setItem('sk_spin_state', JSON.stringify(s)); } catch (e) {}
    }
    function earnedSpins() {
        var n = 0;
        try { n = parseInt(localStorage.getItem('sk_spin_earned') || '0', 10) || 0; } catch (e) {}
        return n;
    }
    function useEarnedSpin() {
        try { localStorage.setItem('sk_spin_earned', String(Math.max(0, earnedSpins() - 1))); } catch (e) {}
    }

    // কয়টা স্পিন বাকি?
    function availableSpins() {
        var s = getState();
        if (s.spinsUsed >= MAX_SPINS_PER_DAY) return 0;
        var avail = 0;
        // ১) লাকি ভিজিটর? (দিনে একবারই লটারি হয়)
        if (!s.luckyChecked) {
            s.luckyChecked = true;
            s.lucky = Math.random() < LUCKY_CHANCE;
            saveState(s);
        }
        if (s.lucky && !s.luckyUsed) avail++;
        // ২) কেনাকাটায় অর্জিত স্পিন
        avail += earnedSpins();
        return Math.min(avail, MAX_SPINS_PER_DAY - s.spinsUsed);
    }

    // ওজন অনুযায়ী পুরস্কার বাছাই
    function pickPrize() {
        var total = 0, i;
        for (i = 0; i < PRIZES.length; i++) total += PRIZES[i].weight;
        var r = Math.random() * total;
        for (i = 0; i < PRIZES.length; i++) {
            if (r < PRIZES[i].weight) return PRIZES[i];
            r -= PRIZES[i].weight;
        }
        return PRIZES[0];
    }

    // কুপন কোড বানাই
    function genCode(amount) {
        var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        var rnd = '';
        for (var i = 0; i < 4; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
        return 'SPIN' + amount + rnd;
    }

    // Firestore-এ কুপন সেভ
    function createCoupon(amount) {
        var code = genCode(amount);
        var expiry = new Date(Date.now() + COUPON_DAYS_VALID * 24 * 60 * 60 * 1000);
        var expStr = expiry.getFullYear() + '-' + String(expiry.getMonth() + 1).padStart(2, '0') + '-' + String(expiry.getDate()).padStart(2, '0');
        var db = firebase.firestore();
        return db.collection('coupons').add({
            code: code,
            type: 'fixed',
            amount: amount,
            minOrder: COUPON_MIN_ORDER,
            limit: 1,
            used: 0,
            active: true,
            expiry: expStr,
            description: '🎡 স্পিন হুইল পুরস্কার',
            source: 'spin-wheel',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function () { return code; });
    }

    // ===== UI =====
    function buildWheelCSS() {
        var css = ''
        + '.sk-spin-overlay{position:fixed;inset:0;background:rgba(2,6,23,.65);z-index:99990;opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(3px);}'
        + '.sk-spin-overlay.show{opacity:1;pointer-events:auto;}'
        + '.sk-spin-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.92);z-index:99991;background:linear-gradient(160deg,#0f172a,#1e293b);border-radius:22px;padding:26px 22px 22px;width:min(92vw,380px);text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.22,.61,.36,1);border:1px solid rgba(245,158,11,.25);}'
        + '.sk-spin-modal.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1);}'
        + '.sk-spin-close{position:absolute;top:10px;right:12px;background:rgba(255,255,255,.12);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer;}'
        + '.sk-spin-title{color:#fff;font-size:20px;font-weight:800;margin-bottom:4px;}'
        + '.sk-spin-sub{color:#fbbf24;font-size:13px;font-weight:600;margin-bottom:16px;}'
        + '.sk-spin-stage{position:relative;width:260px;height:260px;margin:0 auto 18px;}'
        + '.sk-spin-pointer{position:absolute;top:-6px;left:50%;transform:translateX(-50%);z-index:5;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:22px solid #f59e0b;filter:drop-shadow(0 3px 4px rgba(0,0,0,.4));}'
        + '.sk-spin-wheel{width:100%;height:100%;border-radius:50%;border:8px solid #f59e0b;box-shadow:0 0 0 6px #0f172a,0 0 34px rgba(245,158,11,.35);transition:transform 4.2s cubic-bezier(.12,.64,.08,1);position:relative;overflow:hidden;}'
        + '.sk-spin-label{position:absolute;left:50%;top:50%;transform-origin:0 0;font-size:15px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.55);}'
        + '.sk-spin-hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:52px;height:52px;background:radial-gradient(circle at 30% 30%,#fbbf24,#d97706);border-radius:50%;z-index:4;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,.45);}'
        + '.sk-spin-btn{background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;border:none;font-weight:800;font-size:16px;padding:13px 34px;border-radius:999px;cursor:pointer;box-shadow:0 8px 22px rgba(245,158,11,.4);transition:transform .2s;font-family:inherit;}'
        + '.sk-spin-btn:active{transform:scale(.95);}'
        + '.sk-spin-btn:disabled{opacity:.55;cursor:not-allowed;}'
        + '.sk-spin-left{color:#94a3b8;font-size:12px;margin-top:10px;}'
        + '.sk-spin-result{display:none;margin-top:6px;}'
        + '.sk-spin-result.show{display:block;animation:skSpinPop .5s cubic-bezier(.22,.61,.36,1);}'
        + '@keyframes skSpinPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}'
        + '.sk-spin-code{background:#fff;color:#1d4ed8;font-weight:800;font-size:19px;letter-spacing:2px;padding:10px 18px;border-radius:12px;display:inline-block;margin:10px 0;cursor:pointer;border:2px dashed #2563eb;}'
        + '.sk-spin-fab{position:fixed;left:16px;bottom:90px;z-index:9800;background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;border:none;border-radius:999px;padding:11px 18px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 8px 24px rgba(245,158,11,.45);display:flex;align-items:center;gap:7px;font-family:inherit;animation:skSpinBounce 2.2s ease-in-out infinite;}'
        + '@keyframes skSpinBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}'
        + '@media (max-width:480px){.sk-spin-fab{bottom:84px;padding:10px 15px;font-size:13px;}}';
        var st = document.createElement('style');
        st.textContent = css;
        document.head.appendChild(st);
    }

    function conicGradient() {
        var per = 360 / SEGMENTS.length, parts = [], i;
        for (i = 0; i < SEGMENTS.length; i++) {
            parts.push(SEG_COLORS[i] + ' ' + (i * per) + 'deg ' + ((i + 1) * per) + 'deg');
        }
        return 'conic-gradient(' + parts.join(',') + ')';
    }

    var spinning = false;

    function buildModal() {
        var ov = document.createElement('div');
        ov.className = 'sk-spin-overlay';
        ov.id = 'skSpinOverlay';
        var per = 360 / SEGMENTS.length;
        var labels = '';
        for (var i = 0; i < SEGMENTS.length; i++) {
            var ang = (i * per) + per / 2;
            labels += '<span class="sk-spin-label" style="transform:rotate(' + (ang - 90) + 'deg) translate(78px,-9px);">' + SEGMENTS[i] + '</span>';
        }
        var md = document.createElement('div');
        md.className = 'sk-spin-modal';
        md.id = 'skSpinModal';
        md.innerHTML = ''
            + '<button class="sk-spin-close" onclick="skSpinClose()">✕</button>'
            + '<div class="sk-spin-title">🎡 লাকি স্পিন!</div>'
            + '<div class="sk-spin-sub">ঘোরান আর জিতুন — ছাড় কুপন!</div>'
            + '<div class="sk-spin-stage">'
            + '  <div class="sk-spin-pointer"></div>'
            + '  <div class="sk-spin-wheel" id="skSpinWheel" style="background:' + conicGradient() + ';">' + labels + '</div>'
            + '  <div class="sk-spin-hub">🎁</div>'
            + '</div>'
            + '<button class="sk-spin-btn" id="skSpinGo">🎯 স্পিন করুন</button>'
            + '<div class="sk-spin-left" id="skSpinLeft"></div>'
            + '<div class="sk-spin-result" id="skSpinResult"></div>';
        document.body.appendChild(ov);
        document.body.appendChild(md);
        ov.addEventListener('click', function () { if (!spinning) window.skSpinClose(); });
        document.getElementById('skSpinGo').addEventListener('click', doSpin);
    }

    function updateLeftText() {
        var el = document.getElementById('skSpinLeft');
        if (el) el.textContent = 'আজ বাকি: ' + availableSpins() + ' টি স্পিন (দৈনিক সর্বোচ্চ ' + MAX_SPINS_PER_DAY + ' টি)';
    }

    window.skSpinOpen = function () {
        if (!document.getElementById('skSpinModal')) buildModal();
        updateLeftText();
        document.getElementById('skSpinOverlay').classList.add('show');
        document.getElementById('skSpinModal').classList.add('show');
    };
    window.skSpinClose = function () {
        var ov = document.getElementById('skSpinOverlay');
        var md = document.getElementById('skSpinModal');
        if (ov) ov.classList.remove('show');
        if (md) md.classList.remove('show');
        syncFab();
    };

    function doSpin() {
        if (spinning) return;
        if (availableSpins() <= 0) {
            document.getElementById('skSpinLeft').textContent = '😔 আজকের স্পিন শেষ — কেনাকাটা করলে নতুন স্পিন পাবেন!';
            return;
        }
        spinning = true;
        var btn = document.getElementById('skSpinGo');
        btn.disabled = true;
        btn.textContent = '🌀 ঘুরছে...';

        var prize = pickPrize();
        // পুরস্কারের সাথে মেলে এমন একটা খোপ বাছি
        var want = '৳' + (prize.amount === 5 ? '৫' : prize.amount === 10 ? '১০' : prize.amount === 20 ? '২০' : '৫০');
        var idxs = [];
        for (var i = 0; i < SEGMENTS.length; i++) if (SEGMENTS[i] === want) idxs.push(i);
        var idx = idxs[Math.floor(Math.random() * idxs.length)] || 0;
        var per = 360 / SEGMENTS.length;
        // পয়েন্টার উপরে (0deg) — টার্গেট খোপের মাঝ পয়েন্টারের নিচে আনতে হুইল ঘোরাই
        var target = 360 * 6 + (360 - (idx * per + per / 2));
        var wheel = document.getElementById('skSpinWheel');
        wheel.style.transform = 'rotate(' + target + 'deg)';

        // স্পিন খরচ করি
        var s = getState();
        s.spinsUsed++;
        if (s.lucky && !s.luckyUsed) s.luckyUsed = true;
        else useEarnedSpin();
        saveState(s);

        setTimeout(function () {
            createCoupon(prize.amount).then(function (code) {
                showResult(prize, code);
            }).catch(function () {
                // Firestore ব্যর্থ হলেও ইউজারকে কোড দিই — অ্যাডমিনে ম্যানুয়াল যোগ করা যাবে
                showResult(prize, null);
            });
        }, 4400);
    }

    function showResult(prize, code) {
        spinning = false;
        var btn = document.getElementById('skSpinGo');
        var res = document.getElementById('skSpinResult');
        btn.style.display = 'none';
        if (code) {
            res.innerHTML = '<div style="color:#4ade80;font-weight:800;font-size:17px;">🎉 অভিনন্দন! আপনি জিতেছেন ' + prize.label + '!</div>'
                + '<div class="sk-spin-code" id="skSpinCode" title="কপি করতে ক্লিক করুন">' + code + '</div>'
                + '<div style="color:#94a3b8;font-size:12px;">কোডে ক্লিক করে কপি করুন — চেকআউটে ব্যবহার করুন<br>মেয়াদ ' + COUPON_DAYS_VALID + ' দিন • ন্যূনতম অর্ডার ৳' + COUPON_MIN_ORDER + '</div>';
            res.classList.add('show');
            document.getElementById('skSpinCode').addEventListener('click', function () {
                var t = this;
                var done = function () { t.textContent = '✅ কপি হয়েছে!'; setTimeout(function () { t.textContent = code; }, 1500); };
                if (navigator.clipboard) navigator.clipboard.writeText(code).then(done).catch(function () {});
                else done();
            });
            try { localStorage.setItem('sk_spin_last_win', JSON.stringify({ code: code, amount: prize.amount, t: Date.now() })); } catch (e) {}
        } else {
            res.innerHTML = '<div style="color:#f87171;font-weight:700;">নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন 🙏</div>';
            res.classList.add('show');
            btn.style.display = '';
            btn.disabled = false;
            btn.textContent = '🎯 স্পিন করুন';
        }
        updateLeftText();
    }

    // ===== ভাসমান বাটন — শুধু স্পিন available থাকলেই দেখায় =====
    function syncFab() {
        var fab = document.getElementById('skSpinFab');
        if (availableSpins() > 0) {
            if (!fab) {
                fab = document.createElement('button');
                fab.id = 'skSpinFab';
                fab.className = 'sk-spin-fab';
                fab.innerHTML = '🎡 ফ্রি স্পিন!';
                fab.addEventListener('click', window.skSpinOpen);
                document.body.appendChild(fab);
            }
        } else if (fab) {
            fab.remove();
        }
    }

    // ===== INIT =====
    function init() {
        if (typeof firebase === 'undefined') return; // firebase ছাড়া কুপন বানানো যাবে না
        buildWheelCSS();
        // 🧪 টেস্ট মোড: ?spin=test দিলে ১টা ফ্রি স্পিন + হুইল খোলে (অ্যাডমিন টেস্টের জন্য)
        try {
            if (new URLSearchParams(location.search).get('spin') === 'test') {
                var ts = getState();
                ts.lucky = true; ts.luckyChecked = true; ts.luckyUsed = false; ts.spinsUsed = 0;
                saveState(ts);
                setTimeout(window.skSpinOpen, 800);
            }
        } catch (e) {}
        syncFab();
        // অর্ডার শেষে চেকআউট পেজ sk_spin_show_after_order সেট করে — হোমে এলে অটো খোলে
        try {
            if (localStorage.getItem('sk_spin_show_after_order') === '1' && availableSpins() > 0) {
                localStorage.removeItem('sk_spin_show_after_order');
                setTimeout(window.skSpinOpen, 1200);
            }
        } catch (e) {}
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
