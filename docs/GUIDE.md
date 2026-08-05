# 🇧🇩 স্মার্ট কেনাকাটা — সেটআপ গাইড (বাংলা)

এই গাইডে সব "কোডের বাইরের" কাজের ধাপ দেওয়া আছে। প্রতিটা কাজ ২-৫ মিনিটের।

---

## ১) 🔥 Firebase Firestore Index তৈরি করুন (১০ মিনিট)

**কেন:** দাম দিয়ে sort, ক্যাটাগরি ফিল্টার, আর নতুন সার্চ — এগুলো দ্রুত চলার জন্য Index লাগে।
**ভালো খবর:** Index না থাকলেও সাইট কাজ করবে (auto fallback), তবে Index বানালে দ্রুততর + সস্তা হবে।

**কীভাবে বানাবেন:**

1. যান → [console.firebase.google.com](https://console.firebase.google.com) → প্রজেক্ট **smart-kenakata**
2. বাম মেনু থেকে **Firestore Database** → উপরে **Indexes** ট্যাব → **Add index / সূচী যোগ করুন**

নিচের ৪টা Index একটা একটা করে বানান:

| # | Collection | ফিল্ড ১ | ফিল্ড ২ |
|---|---|---|---|
| 1 | `products` | `category` — Ascending | `createdAt` — **Descending** |
| 2 | `products` | `category` — Ascending | `price` — Ascending |
| 3 | `products` | `category` — Ascending | `price` — **Descending** |
| 4 | `products` | `keywords` — **Array contains** | `createdAt` — **Descending** |

> ⏱️ প্রতিটা Index বানাতে ২-৫ মিনিট লাগে। Status "Enabled" হলেই ব্যবহারযোগ্য।

**শর্টকাট:** সাইটে গিয়ে কোনো ফিল্টার চালালে যদি Index না থাকে, ব্রাউজারে F12 → Console-এ Firebase নিজেই একটা লিংক দেয় — সেটা ক্লিক করলেই Index বানানো যায়।

---

## ২) 📸 Storage Rules বসান (রিভিউর ছবির জন্য — ২ মিনিট)

**কেন:** কাস্টমার রিভিউতে ছবি দিলে তা Firebase Storage-এ জমা হয়। Rules ছাড়া আপলোড কাজ করবে না।

1. Firebase Console → **Storage** → (Storage চালু না থাকলে **Get started** ক্লিক করুন)
2. **Rules** ট্যাবে যান → নিচের নিয়ম পেস্ট করে **Publish** করুন:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // রিভিউর ছবি: সবাই পড়তে পারবে, ২MB-এর ছোট ছবি সবাই আপলোড করতে পারবে
    match /review_photos/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    // প্রোডাক্ট ভিডিও/ছবি (অ্যাডমিন প্যানেল থেকে আপলোড হয়)
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 32 * 1024 * 1024;
    }
  }
}
```

---

## ৩) 🛡️ Firestore Security Rules (গুরুত্বপূর্ণ — ২০ মিনিট)

আপনার সাইট এখনো টেস্টিং মোডে। লাইভে যাওয়ার আগে Rules এভাবে সাজান (Console → Firestore → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // পণ্য, ক্যাটাগরি, ব্যানার, সেটিংস — সবাই পড়তে পারবে
    match /products/{id}     { allow read: if true; allow write: if request.auth != null; }
    match /products/{id}     { allow create, update, delete: if request.auth != null; }
    match /categories/{id}   { allow read: if true; allow write: if request.auth != null; }
    match /banners/{id}      { allow read: if true; allow write: if request.auth != null; }
    match /settings/{id}     { allow read: if true; allow write: if request.auth != null; }

    // অর্ডার: সবাই তৈরি করতে পারবে, নিজের ফোন দিয়ে পড়তে পারবে; এডিট শুধু অ্যাডমিন
    match /orders/{id} {
      allow create: if true;
      allow read: if true;   // ট্র্যাকিং পেজ কাজ করতে হলে (লাইভে ফোন-ভিত্তিক করুন)
      allow update, delete: if request.auth != null;
    }

    // রিভিউ: সবাই পড়তে/দিতে পারবে, মুছবে শুধু অ্যাডমিন
    match /reviews/{id} { allow read: if true; allow create: if true; allow update, delete: if request.auth != null; }

    // বার্তা: সবাই পাঠাতে পারবে, পড়বে/মুছবে শুধু অ্যাডমিন
    match /messages/{id} { allow create: if true; allow read, update, delete: if request.auth != null; }

    // কুপন: সবাই পড়তে পারবে (চেকআউটে চেক লাগে), used বাড়াতে পারবে
    match /coupons/{id} { allow read: if true; allow create, delete: if request.auth != null;
                          allow update: if true; }
  }
}
```

> ⚠️ এগুলো বেসিক ভালো রুলস। লাইভে যাওয়ার আগে অর্ডার রিডকে ফোন-ভেরিফিকেশনে সীমাবদ্ধ করা উত্তম।

---

## ৪) 📊 Facebook Pixel + GA4 চালু করুন (৫ মিনিট, যখন প্রস্তুত)

কোড **সম্পূর্ণ ready** — শুধু ID বসাতে হবে:

1. `site-core.js` ফাইল খুলুন → উপরের দিকে এই দুই লাইন খুঁজুন:
   ```js
   const FB_PIXEL_ID = 'YOUR_PIXEL_ID';   // ← এখানে আপনার Pixel ID
   const GA4_ID      = 'YOUR_GA4_ID';     // ← এখানে G-XXXXXXXXX
   ```
2. আসল ID বসিয়ে সেভ করুন — ব্যস! ✅ Auto ট্র্যাক হবে: PageView, ViewContent, AddToCart, InitiateCheckout, **Purchase (টাকার অঙ্ক সহ)**।

**ID কোথায় পাবেন:**
- **Pixel:** [business.facebook.com](https://business.facebook.com) → Events Manager → Data Sources → Pixel ID
- **GA4:** [analytics.google.com](https://analytics.google.com) → Admin → Data Streams → Measurement ID (`G-` দিয়ে শুরু)

---

## ৫) 🗂️ প্রথমবারের জন্য ক্যাটাগরি সেটআপ (৩ মিনিট)

- অ্যাডমিন প্যানেল → বাম মেনু → **🗂️ ক্যাটাগরি ম্যানেজার**
- আপনার দরকারি ক্যাটাগরিগুলো যোগ করুন (নাম + ইমোজি আইকন)
- যোগ করার **সাথে সাথেই** হোমপেজ ও ক্যাটাগরি পেজে দেখা যাবে ✨
- আগে থেকে কোনো ক্যাটাগরি না থাকলে সাইটে ডিফল্ট ৭টা দেখায় — আপনি যোগ করলে সেগুলোই দেখাবে
- কোনো ক্যাটাগরি সাময়িক লুকাতে চাইলে "🙈 লুকান" চাপুন (পণ্য মুছবে না)

---

## ৬) 📦 বাল্ক আপলোড — Excel দিয়ে ১০০+ প্রোডাক্ট (২ মিনিট)

1. অ্যাডমিন → **📦 বাল্ক আপলোড** → **টেমপ্লেট ডাউনলোড** বাটন চাপুন
2. Excel-এ রো-রো পণ্য ভরুন — **name, price** বাধ্যতামূলক; বাকিগুলো ঐচ্ছিক
3. `sizes` / `colors` কলামে কমা দিয়ে লিখুন: `M, L, XL`
4. ফাইল সিলেক্ট করুন — সব একসাথে আপলোড! ভুল থাকলে সুন্দর রিপোর্ট দেখাবে

---

## ৭) ⚙️ সাইট সেটিংস (যেকোনো সময় বদলান)

অ্যাডমিন → **⚙️ সাইট সেটিংস** থেকে বদলাতে পারবেন:
- ডেলিভারি চার্জ (ভিতরে/বাইরে) + **ফ্রি ডেলিভারি মিনিমাম** (যেমন ৫০০ টাকায় ফ্রি)
- বিকাশ/নগদ/রকেট নম্বর
- **লো স্টক অ্যালার্ট** সংখ্যা (ডিফল্ট ৫ — ৫টা বা কম থাকলে "🔥 আর মাত্র Xটি!" দেখায়)
- শপের নাম, ফোন, WhatsApp, ঠিকানা

---

## ৮) 🚀 সামনে করার (পরে ঠিক করা হবে)

- [ ] **Telegram/Groq API key সরানো** — GitHub Secrets + proxy তে (সাইট লাইভ করার আগে জরুরি)
- [ ] **Courier API** (Pathao/Steadfast) — Cloudflare Worker proxy দিয়ে
- [ ] **Push Notification** — Firebase Blaze প্ল্যানে তুলে FCM + Cloud Functions

---

## ✅ টিপস (দ্রুত সাইটের জন্য)

1. ছবি আপলোডের আগে [squoosh.app](https://squoosh.app) দিয়ে **১০০KB-এর নিচে** compress করুন — এটাই সবচেয়ে বড় speed booster!
2. পণ্যের **স্টক সংখ্যা ঠিকমতো দিন** — ০ দিলে "স্টক শেষ" দেখাবে
3. প্রথম প্রোডাক্টগুলো আপলোডের পর হোমপেজ ৫ মিনিটের মধ্যে auto refresh হয় (ক্যাশ TTL)
