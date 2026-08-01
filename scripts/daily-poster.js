// Daily Poster - Smart Kenakata
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDfnRJ3xyh3rkFD01XS-Zsm-LM1VSPuaJY",
  authDomain: "smart-kenakata.firebaseapp.com",
  projectId: "smart-kenakata",
  storageBucket: "smart-kenakata.firebasestorage.app",
  messagingSenderId: "892479175235",
  appId: "1:892479175235:web:56a53187e4cd5ba662f2f6"
};

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GROQ_KEY = process.env.GROQ_API_KEY;

async function getRandomProduct() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "products"));
  const products = [];
  snap.forEach(d => products.push({ id: d.id, ...d.data() }));
  const available = products.filter(p => (p.stock || 0) > 0);
  const list = available.length > 0 ? available : products;
  return list[Math.floor(Math.random() * list.length)];
}

async function generateCaption(product) {
  const prompt = `Product: ${product.name}, Price: ৳${product.price}, Category: ${product.category}. Write short Bengali FB caption with emojis, offer, COD, link: https://mehedi114.github.io/smart-kenakata/product-details.html?id=${product.id}`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.8, max_tokens: 400 })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

async function sendToTelegram(product, caption) {
  const imageUrl = product.image || "https://i.ibb.co.com/1tqfvKxj/Chat-GPT-Image-Jul-15-2026-11-33-06-PM.png";
  const message = `🌅 সুপ্রভাত মেহেদি ভাই!\n\n📢 আজকের FB Post!\n\n📸 ${product.name}\n💰 ৳${product.price}\n\n✍️ Caption:\n${caption}\n\n⏰ এখনই পোস্ট করো!`;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, photo: imageUrl, caption: message })
  });
}

(async () => {
  const product = await getRandomProduct();
  const caption = await generateCaption(product);
  await sendToTelegram(product, caption);
})();
