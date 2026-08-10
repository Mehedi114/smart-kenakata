/* ============================================================
   🔍 Smart Kenakata — AUTO SEO ENGINE (seo.js)
   যেকোনো প্রোডাক্টের নাম থেকে automatic:
   - category detect (নাম বিশ্লেষণ করে)
   - SEO keywords (বাংলা + English)
   - meta description
   - Google structured data (JSON-LD: Product + Breadcrumb)
   ব্যবহার: <head>-এ <script src="seo.js"></script> → window.SKSEO
   ============================================================ */
(function () {
    'use strict';

    var SITE = 'স্মার্ট কেনাকাটা';
    var DOMAIN = 'https://mehedi114.github.io/smart-kenakata/';
    var DEFAULT_OG_IMAGE = 'https://i.postimg.cc/7h0NpL4w/Chat-GPT-Image-Aug-9-2026-05-28-09-PM.png';

    /* ---------- ৮টি ক্যাটাগরির keyword dictionary (বাংলা + English) ---------- */
    var CAT_KW = {
        'মহিলা ফ্যাশন': ['মহিলা ফ্যাশন', 'women fashion bd', 'ladies dress bangladesh', 'মেয়েদের পোশাক', 'womens clothing price in bd'],
        'পুরুষ ফ্যাশন': ['পুরুষ ফ্যাশন', 'men fashion bd', 'mens clothing bangladesh', 'ছেলেদের পোশাক', 'gents dress price in bd'],
        'কাপল': ['কাপল ড্রেস', 'couple dress bd', 'couple matching set bangladesh', 'কাপল সেট', 'valentine gift bd'],
        'বিউটি ও স্কিন কেয়ার': ['বিউটি প্রোডাক্ট', 'beauty products bd', 'skincare bangladesh', 'স্কিন কেয়ার', 'মেকআপ পণ্য', 'cosmetics price in bd'],
        'গ্যাজেট': ['গ্যাজেট', 'gadget bd', 'electronics bangladesh', 'মোবাইল এক্সেসরিজ', 'gadget price in bd', 'smart gadget bangladesh'],
        'হোম ও কিচেন': ['হোম অ্যান্ড কিচেন', 'kitchen items bd', 'home appliances bangladesh', 'কিচেন পণ্য', 'রান্নাঘরের জিনিস'],
        'বাচ্চাদের ফ্যাশন': ['বাচ্চাদের ফ্যাশন', 'kids fashion bd', 'baby dress bangladesh', 'বেবি আইটেম', 'children clothing bd'],
        'অন্যান্য': ['অনলাইন শপিং', 'online shopping bangladesh']
    };

    /* ---------- নাম দেখে auto-category (storefront-এর classifier-এর compact সংস্করণ) ---------- */
    var KW = {
        couple: ['couple', 'কাপল', 'matching', 'ম্যাচিং', 'জোড়া', 'জোড়', 'pair', 'পেয়ার'],
        kids: ['kids', 'কিডস', 'children', 'child', 'baby', 'বেবি', 'preschool', 'প্রিস্কুল', 'backpack', 'ব্যাকপ্যাক', 'school', 'স্কুল', 'student', 'ছোটদের', 'বাচ্চাদের', 'toys', 'খেলনা', 'টয়'],
        beauty: ['স্কিন', 'skin', 'cream', 'ক্রিম', 'সাবান', 'soap', 'শ্যাম্পু', 'shampoo', 'লিপস্টিক', 'lipstick', 'মেকআপ', 'makeup', 'ফেসওয়াশ', 'face wash', 'facial', 'সিরাম', 'serum', 'লোশন', 'lotion', 'ময়েশ্চার', 'sunscreen', 'সানস্ক্রিন', 'হেয়ার অয়েল', 'hair oil', 'মেহেদি', 'হেনা', 'কাজল', 'kajol', 'হলুদ', 'পাউডার', 'powder', 'নেইল', 'nail', 'বিউটি', 'beauty', 'হেয়ার ব্যান্ড', 'hair band', 'cosmetic', 'পারফিউম', 'perfume', 'বডি স্প্রে', 'হেয়ার মাস্ক', 'ফেস মাস্ক', 'straightener', 'স্ট্রেটেনার', 'কার্লিং', 'curling'],
        home: ['blender', 'ব্লেন্ডার', 'mixer', 'মিক্সার', 'grinder', 'গ্রাইন্ডার', 'juicer', 'জুসার', 'kettle', 'কেটলি', 'rice cooker', 'রাইস কুকার', 'air fryer', 'oven', 'ওভেন', 'toaster', 'টোস্টার', 'kitchen', 'কিচেন', 'cookware', 'কড়াই', 'হাঁড়ি', 'chopper', 'চপার', 'iron', 'ইস্ত্রি', 'বাতি', 'lamp', 'light', 'fan', 'পাখা', 'টিভি', 'tv', 'television', 'frypan', 'ফ্রাইপ্যান', 'স্টোরেজ', 'storage', 'হিটার', 'heater', 'ডেকর', 'decor', 'শোপিস'],
        female: ['three piece', 'থ্রি পিস', 'থ্রী পিস', 'saree', 'শাড়ি', 'শাড়ি', 'salwar', 'kameez', 'ladies', 'women', 'woman', 'female', 'girls', 'skirt', 'plazoo', 'প্লাজো', 'khimar', 'georgette', 'lehenga', 'dupatta', 'burqa', 'hijab', 'ব্লাউজ', 'হেয়ার'],
        male: ['shirt', 'tshirt', 't-shirt', 't shirt', 'polo', 'pant', 'trouser', 'panjabi', 'পাঞ্জাবি', 'পাঞ্জাবী', ' men', 'men ', 'for men', 'man', 'boy', 'boys', 'gents', 'tank top', 'smoking', 'tie'],
        gadget: ['ঘড়ি', 'ঘড়ি', 'watch', 'থার্মোমিটার', 'thermometer', 'হিটিং', 'প্যাড', 'earbuds', 'earphone', 'headphone', 'headset', 'চার্জার', 'charger', 'cable', 'speaker', 'স্পিকার', 'মোবাইল', 'mobile', 'phone', 'হেয়ার ড্রায়ার', 'dryer', 'trimmer', 'ট্রিমার', 'shaver', 'শেভার', 'power bank', 'powerbank', 'পাওয়ার ব্যাংক', 'smartwatch', 'স্মার্ট ওয়াচ', 'gadget', 'গ্যাজেট', 'usb', 'হোল্ডার', 'neckband', 'নেকব্যান্ড']
    };
    var CAT_ORDER = [
        ['couple', 'কাপল'], ['kids', 'বাচ্চাদের ফ্যাশন'], ['beauty', 'বিউটি ও স্কিন কেয়ার'],
        ['home', 'হোম ও কিচেন'], ['female', 'মহিলা ফ্যাশন'], ['male', 'পুরুষ ফ্যাশন'], ['gadget', 'গ্যাজেট']
    ];

    function detectCategory(name, storedCat) {
        var text = String(name || '').toLowerCase();
        if (storedCat) text += ' ' + String(storedCat).toLowerCase();
        for (var i = 0; i < CAT_ORDER.length; i++) {
            var list = KW[CAT_ORDER[i][0]];
            for (var j = 0; j < list.length; j++) {
                if (text.indexOf(list[j]) !== -1) return CAT_ORDER[i][1];
            }
        }
        return 'অন্যান্য';
    }

    function uniqJoin(arr) {
        var seen = {}, out = [];
        arr.forEach(function (k) {
            k = String(k || '').trim();
            if (!k) return;
            var key = k.toLowerCase();
            if (seen[key]) return;
            seen[key] = 1;
            out.push(k);
        });
        return out.join(', ');
    }

    /* ---------- পণ্যের কার্যকর ক্যাটাগরি (DB তে থাকলে সেটা, নাহলে auto) ---------- */
    function effectiveCategory(p) {
        var c = String((p && p.category) || '').trim();
        if (c && c !== 'অন্যান্য') return c;
        return detectCategory(p && p.name, c);
    }

    /* ---------- 🔑 Auto keywords ---------- */
    function buildKeywords(p) {
        var name = String((p && p.name) || '').trim();
        var cat = effectiveCategory(p);
        var list = [name, cat];
        if (CAT_KW[cat]) list = list.concat(CAT_KW[cat]);
        if (p && p.subCategory) list = list.concat([p.subCategory, p.subCategory + ' bd']);
        if (name) {
            list = list.concat([
                name + ' price in bangladesh',
                name + ' price in bd',
                'buy ' + name + ' online in bangladesh',
                'অরিজিনাল ' + name,
                name + ' দাম কত',
                name + ' অর্ডার',
                'সেরা ' + cat + ' কম দামে'
            ]);
        }
        list = list.concat([
            'স্মার্ট কেনাকাটা', 'smart kenakata', 'smart kenakata bd',
            'অনলাইন শপিং বাংলাদেশ', 'online shopping bangladesh',
            'ক্যাশ অন ডেলিভারি', 'cash on delivery bd',
            'home delivery bangladesh', 'সেরা অনলাইন শপ'
        ]);
        return uniqJoin(list);
    }

    /* ---------- 🏷️ Auto title ---------- */
    function buildTitle(p) {
        var name = String((p && p.name) || '').trim() || 'পণ্যের বিস্তারিত';
        var price = p && p.price ? ' মাত্র ৳' + p.price : '';
        return (name + price + ' | ' + SITE).slice(0, 70);
    }

    /* ---------- 📝 Auto description (~১৫৫ অক্ষর) ---------- */
    function buildDescription(p) {
        var name = String((p && p.name) || '').trim();
        var cat = effectiveCategory(p);
        var price = p && p.price ? ' মূল্য ৳' + p.price : '';
        var old = p && p.oldPrice ? ' (রেগুলার ৳' + p.oldPrice + ')' : '';
        var d = name + ' কিনুন ' + SITE + ' থেকে!' + price + old + ' — ১০০% অরিজিনাল ' + cat + ', ক্যাশ অন ডেলিভারি ও সারাদেশে দ্রুত হোম ডেলিভারি। এখনই অর্ডার করুন।';
        return d.slice(0, 165);
    }

    /* ---------- 📦 JSON-LD: Product + Breadcrumb ---------- */
    function buildJsonLd(p, url) {
        var cat = effectiveCategory(p);
        var img = (p && (p[p.thumbnail] || p.image)) || DEFAULT_OG_IMAGE;
        var product = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': p.name || '',
            'image': [img],
            'description': buildDescription(p),
            'category': cat,
            'brand': { '@type': 'Brand', 'name': SITE },
            'offers': {
                '@type': 'Offer',
                'url': url,
                'priceCurrency': 'BDT',
                'price': Number(p.price) || 0,
                'availability': (p.stock === false || p.stock === 0)
                    ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
                'itemCondition': 'https://schema.org/NewCondition'
            }
        };
        if (p.id) product.sku = String(p.id);
        if (p.rating && Number(p.rating) > 0) {
            product.aggregateRating = {
                '@type': 'AggregateRating',
                'ratingValue': Number(p.rating),
                'reviewCount': Number(p.ratingCount || p.reviews || 1)
            };
        }
        var breadcrumb = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'হোম', 'item': DOMAIN },
                { '@type': 'ListItem', 'position': 2, 'name': cat, 'item': DOMAIN + 'category.html?cat=' + encodeURIComponent(cat) },
                { '@type': 'ListItem', 'position': 3, 'name': p.name || '', 'item': url }
            ]
        };
        return [product, breadcrumb];
    }

    /* ---------- meta helper ---------- */
    function setMeta(attr, key, content, id) {
        var el = (id && document.getElementById(id)) || document.head.querySelector('meta[' + attr + '="' + key + '"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            if (id) el.id = id;
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
        return el;
    }
    function injectJsonLd(id, data) {
        var old = document.getElementById(id);
        if (old) old.remove();
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.id = id;
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
    }

    /* ---------- ⭐ Product page SEO — এক লাইনে সব সেট ---------- */
    function applyProductSEO(p, opts) {
        opts = opts || {};
        var url = opts.url || (DOMAIN + 'product-details.html?id=' + encodeURIComponent(p.id || ''));
        var img = (p && (p[p.thumbnail] || p.image)) || DEFAULT_OG_IMAGE;
        // Admin-এ কাস্টম SEO দিলে সেটাই; না দিলে সম্পূর্ণ automatic
        var title = (p.seoTitle || buildTitle(p)).slice(0, 70);
        var desc = (p.seoDesc || buildDescription(p)).slice(0, 165);
        var kws = p.seoKeywords || buildKeywords(p);

        document.title = title;
        setMeta('name', 'description', desc);
        setMeta('name', 'keywords', kws);
        setMeta('property', 'og:type', 'product');
        setMeta('property', 'og:site_name', SITE);
        setMeta('property', 'og:title', title, 'ogTitle');
        setMeta('property', 'og:description', desc, 'ogDesc');
        setMeta('property', 'og:image', img, 'ogImage');
        setMeta('property', 'og:url', url, 'ogUrl');
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', title, 'twTitle');
        setMeta('name', 'twitter:description', desc, 'twDesc');
        setMeta('name', 'twitter:image', img, 'twImage');
        var canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
        canonical.href = url;
        injectJsonLd('product-schema', buildJsonLd(p, url));
    }

    /* ---------- 🗂️ Category page SEO ---------- */
    var CAT_DESC = {
        'মহিলা ফ্যাশন': 'শাড়ি, থ্রি-পিস, হিজাব, টপস সহ সেরা মহিলা ফ্যাশন কালেকশন',
        'পুরুষ ফ্যাশন': 'টি-শার্ট, পোলো, শার্ট, পাঞ্জাবি সহ ট্রেন্ডি পুরুষ ফ্যাশন',
        'কাপল': 'ম্যাচিং কাপল ড্রেস ও গিফট সেট',
        'বিউটি ও স্কিন কেয়ার': 'স্কিন কেয়ার, মেকআপ, হেয়ার কেয়ার সহ ১০০% অরিজিনাল বিউটি পণ্য',
        'গ্যাজেট': 'পাওয়ার ব্যাংক, ইয়ারবাড, স্মার্ট ওয়াচ সহ সেরা গ্যাজেট',
        'হোম ও কিচেন': 'ব্লেন্ডার, কেটলি, কুকওয়্যার সহ ঘরের স্বাদ বাড়ানো কিচেন পণ্য',
        'বাচ্চাদের ফ্যাশন': 'বাচ্চাদের পোশাক, ব্যাগ, খেলনা ও স্কুল আইটেম',
        'অন্যান্য': 'যাবতীয় প্রয়োজনীয় পণ্য সেরা দামে',
        'all': 'সব ধরনের পণ্য — ফ্যাশন, গ্যাজেট, বিউটি, হোম ও কিচেন'
    };
    function applyCategorySEO(cat) {
        var label = CAT_DESC[cat] ? cat : 'all';
        var line = CAT_DESC[label] || CAT_DESC.all;
        var catKw = CAT_KW[cat] || [];
        var title = (cat === 'all' ? 'সব পণ্য' : cat) + ' — সেরা দামে | ' + SITE;
        var desc = (line + '। ক্যাশ অন ডেলিভারি, সারাদেশে দ্রুত ডেলিভারি — ' + SITE + '।').slice(0, 165);
        var kws = uniqJoin([cat, 'সেরা ' + cat, cat + ' price in bangladesh']
            .concat(catKw)
            .concat(['স্মার্ট কেনাকাটা', 'smart kenakata', 'online shopping bangladesh', 'ক্যাশ অন ডেলিভারি']));
        var url = DOMAIN + 'category.html?cat=' + encodeURIComponent(cat);

        document.title = title;
        setMeta('name', 'description', desc);
        setMeta('name', 'keywords', kws);
        setMeta('property', 'og:title', title, 'ogCatTitle');
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:url', url, 'ogCatUrl');
        injectJsonLd('cat-schema', {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': title,
            'description': desc,
            'url': url,
            'isPartOf': { '@type': 'WebSite', 'name': SITE, 'url': DOMAIN },
            'keywords': kws
        });
    }

    window.SKSEO = {
        SITE: SITE,
        DOMAIN: DOMAIN,
        detectCategory: detectCategory,
        effectiveCategory: effectiveCategory,
        buildKeywords: buildKeywords,
        buildTitle: buildTitle,
        buildDescription: buildDescription,
        buildJsonLd: buildJsonLd,
        applyProductSEO: applyProductSEO,
        applyCategorySEO: applyCategorySEO
    };
})();
