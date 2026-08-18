// ============================================================
// 🎡 স্মার্ট কেনাকাটা — লাকি স্পিন হুইল (v2)
// নিয়ম:
//   • প্রতিটি ইউজার প্রতিদিন ২টা স্পিন পায় (সবাই!)
//   • হুইলে অপশন: ৳২ থেকে 🚚 ফ্রি ডেলিভারি পর্যন্ত
//   • ফ্রি ডেলিভারি ওঠে ~১০০ স্পিনে ১ বার (১%)
//   • বেশিরভাগ সময় ওঠে: ৳২ / ৳৫ / ৳৭
//   • জেতা পুরস্কার = কুপন কোড (৭ দিন মেয়াদ, ১ বার ব্যবহারযোগ্য)
// নির্ভরতা: firebase (compat) আগে লোড থাকতে হবে
// ============================================================
(function () {
    'use strict';

    var MAX_SPINS_PER_DAY = 2;
    var COUPON_MIN_ORDER = 100;   // কুপন খাটবে ন্যূনতম ১০০ টাকার অর্ডারে
    var COUPON_DAYS_VALID = 7;

    // পুরস্কার — ওজনসহ (মোট ১০০) — বেশিরভাগ ২/৫/৭ টাকা, ফ্রি ডেলিভারি মাত্র ১%
    var PRIZES = [
        { key: 'p2',  amount: 2,  type: 'fixed',        weight: 35, label: '৳২ ছাড়' },
        { key: 'p5',  amount: 5,  type: 'fixed',        weight: 30, label: '৳৫ ছাড়' },
        { key: 'p7',  amount: 7,  type: 'fixed',        weight: 24, label: '৳৭ ছাড়' },
        { key: 'p10', amount: 10, type: 'fixed',        weight: 10, label: '৳১০ ছাড়' },
        { key: 'fd',  amount: 0,  type: 'freedelivery', weight: 1,  label: '🚚 ফ্রি ডেলিভারি' }
    ];
    // হুইলের ৮টা খোপ (প্রতিটার সাথে prize-key ম্যাপ করা)
    var SEGMENTS = [
        { text: '৳২',  key: 'p2'  },
        { text: '৳৫',  key: 'p5'  },
        { text: '৳৭',  key: 'p7'  },
        { text: '🚚',  key: 'fd'  },
        { text: '৳২',  key: 'p2'  },
        { text: '৳১০', key: 'p10' },
        { text: '৳৫',  key: 'p5'  },
        { text: '৳৭',  key: 'p7'  }
    ];
    var SEG_COLORS = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#3b82f6', '#7c3aed', '#fbbf24', '#0d9488'];

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function getState() {
        var s = null;
        try { s = JSON.parse(localStorage.getItem('sk_spin_state') || 'null'); } catch (e) {}
        if (!s || s.date !== todayKey()) {
            s = { date: todayKey(), spinsUsed: 0 };
        }
        return s;
    }
    function saveState(s) {
        try { localStorage.setItem('sk_spin_state', JSON.stringify(s)); } catch (e) {}
    }

    // আজ কয়টা স্পিন বাকি? — সবাই দিনে ২টা পায়
    function availableSpins() {
        var s = getState();
        return Math.max(0, MAX_SPINS_PER_DAY - s.spinsUsed);
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
    function genCode(prize) {
        var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        var rnd = '';
        for (var i = 0; i < 4; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
        return prize.type === 'freedelivery' ? ('SPINFD' + rnd) : ('SPIN' + prize.amount + rnd);
    }

    // Firestore-এ কুপন সেভ
    function createCoupon(prize) {
        var code = genCode(prize);
        var expiry = new Date(Date.now() + COUPON_DAYS_VALID * 24 * 60 * 60 * 1000);
        var expStr = expiry.getFullYear() + '-' + String(expiry.getMonth() + 1).padStart(2, '0') + '-' + String(expiry.getDate()).padStart(2, '0');
        var db = firebase.firestore();
        return db.collection('coupons').add({
            code: code,
            type: prize.type,               // 'fixed' বা 'freedelivery'
            amount: prize.amount,
            minOrder: COUPON_MIN_ORDER,
            limit: 1,
            used: 0,
            active: true,
            expiry: expStr,
            description: '🎡 স্পিন হুইল পুরস্কার — ' + prize.label,
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
            labels += '<span class="sk-spin-label" style="transform:rotate(' + (ang - 90) + 'deg) translate(78px,-9px);">' + SEGMENTS[i].text + '</span>';
        }
        var md = document.createElement('div');
        md.className = 'sk-spin-modal';
        md.id = 'skSpinModal';
        md.innerHTML = ''
            + '<button class="sk-spin-close" onclick="skSpinClose()">✕</button>'
            + '<div class="sk-spin-title">🎡 লাকি স্পিন!</div>'
            + '<div class="sk-spin-sub">ঘোরান আর জিতুন — ৳২ থেকে ফ্রি ডেলিভারি! 🚚</div>'
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
        if (el) el.textContent = 'আজ বাকি: ' + availableSpins() + ' টি স্পিন (প্রতিদিন ' + MAX_SPINS_PER_DAY + ' টি ফ্রি)';
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
            document.getElementById('skSpinLeft').textContent = '😔 আজকের স্পিন শেষ — আগামীকাল আবার ২টা ফ্রি স্পিন পাবেন!';
            return;
        }
        spinning = true;
        var btn = document.getElementById('skSpinGo');
        btn.disabled = true;
        btn.textContent = '🌀 ঘুরছে...';

        var prize = pickPrize();
        // পুরস্কারের সাথে মেলে এমন খোপ বাছি
        var idxs = [];
        for (var i = 0; i < SEGMENTS.length; i++) if (SEGMENTS[i].key === prize.key) idxs.push(i);
        var idx = idxs.length ? idxs[Math.floor(Math.random() * idxs.length)] : 0;
        var per = 360 / SEGMENTS.length;
        // পয়েন্টার উপরে (0deg) — টার্গেট খোপের মাঝ পয়েন্টারের নিচে আনতে হুইল ঘোরাই
        var target = 360 * 6 + (360 - (idx * per + per / 2));
        var wheel = document.getElementById('skSpinWheel');
        wheel.style.transform = 'rotate(' + target + 'deg)';

        // স্পিন খরচ করি
        var s = getState();
        s.spinsUsed++;
        saveState(s);

        setTimeout(function () {
            createCoupon(prize).then(function (code) {
                showResult(prize, code, null);
            }).catch(function (e) {
                console.error('Spin coupon create failed:', e);
                showResult(prize, null, e);
            });
        }, 4400);
    }

    function showResult(prize, code, err) {
        spinning = false;
        var btn = document.getElementById('skSpinGo');
        var res = document.getElementById('skSpinResult');
        if (code) {
            var isFD = prize.type === 'freedelivery';
            var big = isFD
                ? '🎊🚚 জ্যাকপট! সম্পূর্ণ ফ্রি ডেলিভারি জিতেছেন!'
                : '🎉 অভিনন্দন! আপনি জিতেছেন ' + prize.label + '!';
            res.innerHTML = '<div style="color:#4ade80;font-weight:800;font-size:17px;">' + big + '</div>'
                + '<div class="sk-spin-code" id="skSpinCode" title="কপি করতে ক্লিক করুন">' + code + '</div>'
                + '<div style="color:#94a3b8;font-size:12px;">কোডে ক্লিক করে কপি করুন — চেকআউটে ব্যবহার করুন<br>মেয়াদ ' + COUPON_DAYS_VALID + ' দিন • ন্যূনতম অর্ডার ৳' + COUPON_MIN_ORDER + '</div>';
            res.classList.add('show');
            document.getElementById('skSpinCode').addEventListener('click', function () {
                var t = this;
                var done = function () { t.textContent = '✅ কপি হয়েছে!'; setTimeout(function () { t.textContent = code; }, 1500); };
                if (navigator.clipboard) navigator.clipboard.writeText(code).then(done).catch(function () {});
                else done();
            });
            try { localStorage.setItem('sk_spin_last_win', JSON.stringify({ code: code, amount: prize.amount, type: prize.type, t: Date.now() })); } catch (e) {}
            // আরেকটা স্পিন বাকি থাকলে বাটন আবার দেখাই
            if (availableSpins() > 0) {
                btn.style.display = '';
                btn.disabled = false;
                btn.textContent = '🎯 আবার স্পিন করুন';
                // হুইল রিসেট (transition ছাড়া)
                var wheel = document.getElementById('skSpinWheel');
                setTimeout(function () {
                    wheel.style.transition = 'none';
                    wheel.style.transform = 'rotate(0deg)';
                    setTimeout(function () { wheel.style.transition = ''; }, 60);
                }, 600);
            } else {
                btn.style.display = 'none';
            }
        } else {
            // কুপন সেভ ব্যর্থ — স্পিনটা ফেরত দিই (ইউজারের ক্ষতি নয়)
            var s = getState();
            if (s.spinsUsed > 0) { s.spinsUsed--; saveState(s); }
            var isPerm = err && /permission|denied|insufficient/i.test(err.message || err.code || '');
            res.innerHTML = '<div style="color:#f87171;font-weight:700;">'
                + (isPerm
                    ? '😔 কুপন তৈরি করা যাচ্ছে না (সেটআপ সমস্যা)। দোকানে জানানো হয়েছে — একটু পরে চেষ্টা করুন।'
                    : 'নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন 🙏 (স্পিনটি ফেরত দেওয়া হয়েছে)')
                + '</div>';
            res.classList.add('show');
            btn.style.display = '';
            btn.disabled = false;
            btn.textContent = '🎯 স্পিন করুন';
        }
        updateLeftText();
    }

    // ===== ভাসমান বাটন — স্পিন বাকি থাকলেই দেখায় =====
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
        syncFab();
        // অর্ডার শেষে চেকআউট পেজ ফ্ল্যাগ সেট করে — হোমে এলে হুইল অটো খোলে
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
