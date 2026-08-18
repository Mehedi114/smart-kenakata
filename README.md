# 🛒 স্মার্ট কেনাকাটা — Smart Kenakata

বাংলাদেশের বিশ্বস্ত অনলাইন শপ। Firebase Firestore + GitHub Pages দিয়ে তৈরি সম্পূর্ণ serverless ই-কমার্স — হোস্টিং খরচ ০ টাকা।

🌐 **লাইভ সাইট:** https://mehedi114.github.io/smart-kenakata/

## 📁 ফোল্ডার স্ট্রাকচার

```
smart-kenakata/
├── index.html              # 🏠 হোমপেজ (ব্যানার, ফ্ল্যাশ সেল, জনপ্রিয় পণ্য)
├── category.html           # 🗂️ ক্যাটাগরি/সার্চ পেজ
├── product-details.html    # 📦 পণ্যের বিস্তারিত + রিভিউ
├── checkout.html           # 💳 কার্ট + চেকআউট (COD/bKash/Nagad/Rocket)
├── offer.html              # 🎯 ডাইনামিক অফার পেজ (অ্যাডমিন থেকে বানানো)
├── tracking.html           # 🚚 অর্ডার ট্র্যাকিং
├── wishlist.html           # ❤️ উইশলিস্ট
├── pages.html              # ℹ️ About/Contact/Policy
├── admin.html              # 🔐 অ্যাডমিন প্যানেল (পণ্য/অর্ডার/অফার/সেটিংস)
├── admin-login.html        # 🔑 অ্যাডমিন লগইন
│
├── css/
│   ├── premium.css         # মূল ডিজাইন সিস্টেম
│   └── mobile-fix.css      # মোবাইল রেসপনসিভ ফিক্স
│
├── js/
│   ├── site-core.js        # ⚙️ কোর: সেটিংস, ট্র্যাকিং, শেয়ার্ড হেল্পার
│   ├── theme.js            # 🎨 ডার্ক মোড, PWA ইনস্টল, Service Worker রেজিস্ট্রেশন
│   ├── nav-drawer.js       # 📱 মোবাইল নেভিগেশন ড্রয়ার
│   ├── chatbot.js          # 🤖 AI চ্যাটবট
│   ├── premium.js          # ✨ প্রিলোডার + UI এনহান্সমেন্ট
│   └── seo.js              # 🔍 অটো SEO ইঞ্জিন (meta/schema)
│
├── scripts/                # 🤖 অটোমেশন (GitHub Actions দিয়ে চলে)
│   ├── generate-sitemap.js # sitemap.xml অটো-আপডেট (দৈনিক)
│   ├── daily-poster.js     # AI দিয়ে দৈনিক ফেসবুক পোস্ট
│   └── compress-images.js  # Cloudinary ছবি কমপ্রেশন
│
├── .github/workflows/      # ⏰ শিডিউলড অটোমেশন
├── service-worker.js       # 📶 অফলাইন ক্যাশিং (PWA) — রুটেই থাকতে হবে (scope)
├── manifest.json           # 📱 PWA ম্যানিফেস্ট
├── robots.txt / sitemap.xml
└── docs/                   # 📚 গাইড
```

## 🏗️ টেক স্ট্যাক

| স্তর | প্রযুক্তি |
|---|---|
| ফ্রন্টএন্ড | Vanilla HTML/CSS/JS (দ্রুত, জিরো বিল্ড) |
| ডেটাবেস | Firebase Firestore (রিয়েলটাইম) |
| ছবি | Cloudinary (অটো অপটিমাইজ) |
| হোস্টিং | GitHub Pages (ফ্রি, CDN) |
| নোটিফিকেশন | Telegram Bot (নতুন অর্ডার এলার্ট) |
| অটোমেশন | GitHub Actions (sitemap, FB পোস্ট) |

## ✨ ফিচার

- 🛍️ পূর্ণাঙ্গ ই-কমার্স: কার্ট, চেকআউট, কুপন, ফ্ল্যাশ সেল, অফার পেজ মেকার
- 💳 পেমেন্ট: ক্যাশ অন ডেলিভারি + bKash/Nagad/Rocket (TrxID ভেরিফিকেশন)
- 📲 PWA: অ্যাপের মতো ইনস্টল হয়, অফলাইনেও চলে
- 📢 অর্ডার এলেই Telegram-এ ইনস্ট্যান্ট নোটিফিকেশন
- 🔍 অটো SEO: sitemap, schema.org, meta — সব অটোমেটেড
- ⚡ পারফরম্যান্স: localStorage ক্যাশিং (Firestore read খরচ বাঁচায়), lazy loading, LCP অপটিমাইজড

## ⚠️ নোট

- `service-worker.js` রুট থেকে সরানো যাবে না — PWA scope রুটে দরকার
- `google*.html` — Google Search Console ভেরিফিকেশন ফাইল
- CSS/JS লিংকে `?v=N` ভার্সন আছে — ফাইল বদলালে ভার্সন বাড়ান (ক্যাশ বাস্ট)
