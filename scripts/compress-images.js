// ============================================================
// Smart Kenakata — সব প্রোডাক্টের ছবি Cloudinary-তে নিয়ে কম্প্রেস
// imgbb (i.ibb.co) বা অন্য non-Cloudinary ছবি → Cloudinary upload
// → Firestore-এ নতুন URL বসানো হয় (সাইট দ্রুত লোড হবে)
//
// চালানোর নিয়ম:
//   ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=*** node scripts/compress-images.js
// (অথবা GitHub Actions → "Compress Product Images" → Run workflow)
// ============================================================
'use strict';

const FIREBASE_WEB_API_KEY = 'AIzaSyDfnRJ3xyh3rkFD01XS-Zsm-LM1VSPuaJY';
const PROJECT_ID = 'smart-kenakata';
const CLOUDINARY_CLOUD = 'smartkenakata';
const CLOUDINARY_PRESET = 'smart_upload';

const IMAGE_FIELDS = ['image', 'image2', 'image3', 'image4', 'image5'];
const PAGE_SIZE = 300;

const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function fsGetAllProducts() {
  const out = [];
  let pageToken = '';
  do {
    const url = `${FS}/products?pageSize=${PAGE_SIZE}${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Firestore read fail: ' + res.status + ' ' + (await res.text()).slice(0, 200));
    const data = await res.json();
    for (const doc of data.documents || []) {
      const id = doc.name.split('/').pop();
      const f = doc.fields || {};
      const rec = { id };
      for (const k of IMAGE_FIELDS) if (f[k] && f[k].stringValue) rec[k] = f[k].stringValue;
      if (f.thumbnail && f.thumbnail.stringValue) rec.thumbnail = f.thumbnail.stringValue;
      out.push(rec);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

async function uploadToCloudinary(imageUrl) {
  // imgbb/অন্য সোর্স থেকে ছবি নামিয়ে Cloudinary-তে আপলোড
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('source fetch fail ' + imgRes.status);
  const blob = await imgRes.blob();
  const fd = new FormData();
  fd.append('file', blob, 'img.jpg');
  fd.append('upload_preset', CLOUDINARY_PRESET);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: fd });
  const j = await up.json();
  if (!j.secure_url) throw new Error('cloudinary fail: ' + JSON.stringify(j).slice(0, 200));
  return j.secure_url;
}

function isCloudinary(url) {
  return /res\.cloudinary\.com/.test(url || '');
}

async function getAdminToken() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD env লাগবে (Firebase Auth admin login)');
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  const j = await res.json();
  if (!j.idToken) throw new Error('Auth fail: ' + (j.error?.message || JSON.stringify(j).slice(0, 200)));
  return j.idToken;
}

async function fsPatchDoc(token, id, fields) {
  const fieldPaths = Object.keys(fields).join(',');
  const body = { fields: {} };
  for (const [k, v] of Object.entries(fields)) body.fields[k] = { stringValue: v };
  const res = await fetch(`${FS}/products/${id}?updateMask.fieldPaths=${fieldPaths}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('patch fail ' + id + ': ' + res.status + ' ' + (await res.text()).slice(0, 200));
}

(async () => {
  try {
    console.log('📦 সব প্রোডাক্ট পড়ছি...');
    const products = await fsGetAllProducts();
    console.log(`✅ মোট প্রোডাক্ট: ${products.length}`);

    const needUpload = [];
    for (const p of products) {
      for (const k of IMAGE_FIELDS) {
        if (p[k] && !isCloudinary(p[k])) needUpload.push({ id: p.id, field: k, url: p[k] });
      }
    }
    console.log(`🖼️ Cloudinary-তে নিতে হবে: ${needUpload.length}টা ছবি`);
    if (!needUpload.length) { console.log('🎉 সব ছবি ইতিমধ্যে Cloudinary-তে আছে — কিছু করার নেই!'); return; }

    // (নিরাপত্তা) প্রথম ৩টা ছবি দেখিয়ে confirm — হ্যাঁ/না (নাহলে ctrl+c)
    console.log('নমুনা:');
    needUpload.slice(0, 3).forEach(x => console.log('  -', x.id, x.field, x.url));
    if (process.env.CONFIRM !== 'yes') {
      console.log('⚠️ চালাতে CONFIRM=yes env বসান (GitHub Actions-এ automatic)।');
      return;
    }

    const token = await getAdminToken();
    console.log('🔐 Admin auth সফল — আপলোড শুরু...');

    let done = 0, fail = 0;
    const seen = new Map(); // একই URL বারবার upload না করার জন্য
    for (let i = 0; i < needUpload.length; i++) {
      const item = needUpload[i];
      try {
        let newUrl = seen.get(item.url);
        if (!newUrl) {
          newUrl = await uploadToCloudinary(item.url);
          seen.set(item.url, newUrl);
        }
        const fields = {};
        fields[item.field] = newUrl;
        await fsPatchDoc(token, item.id, fields);
        done++;
        if (i % 10 === 0 || i === needUpload.length - 1) {
          console.log(`  প্রগ্রেস: ${done + fail}/${needUpload.length}`);
        }
      } catch (e) {
        fail++;
        console.log(`  ❌ ${item.id}.${item.field}: ${e.message}`);
      }
    }
    console.log(`\n🎉 সম্পন্ন! আপডেট: ${done}, ব্যর্থ: ${fail}`);
    console.log('এবার সাইট রিফ্রেশ করলে সব ছবি Cloudinary f_auto,q_auto কম্প্রেশনে আসবে — দ্রুত লোড হবে!');
  } catch (err) {
    console.error('❌ স্ক্রিপ্ট ব্যর্থ:', err.message);
    process.exit(1);
  }
})();
