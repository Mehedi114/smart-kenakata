// Simple Poster - No Firebase Package Needed
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GROQ_KEY = process.env.GROQ_API_KEY;

async function getProducts() {
  // Public Firestore REST
  const url = `https://firestore.googleapis.com/v1/projects/smart-kenakata/databases/(default)/documents/products?pageSize=50`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.documents) throw new Error("No products: " + JSON.stringify(data));
  return data.documents.map(doc => {
    const f = doc.fields;
    return {
      id: doc.name.split('/').pop(),
      name: f.name?.stringValue || "Product",
      category: f.category?.stringValue || "General",
      price: f.price?.integerValue || f.price?.doubleValue || 0,
      oldPrice: f.oldPrice?.integerValue || 0,
      image: f.image?.stringValue || "",
      stock: f.stock?.integerValue || 10
    };
  });
}

async function genCaption(p) {
  const prompt = `Write short Bengali Facebook caption for ${p.name} price ৳${p.price} category ${p.category}. 5 lines max, emojis, COD, link https://mehedi114.github.io/smart-kenakata/product-details.html?id=${p.id}`;
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.8, max_tokens: 300 })
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content || `🔥 ${p.name} এখন ৳${p.price} এ!`;
}

async function send(p, cap) {
  const img = p.image || "https://i.ibb.co.com/1tqfvKxj/Chat-GPT-Image-Jul-15-2026-11-33-06-PM.png";
  const msg = `🌅 সুপ্রভাত!\n\n📸 ${p.name}\n💰 ৳${p.price}\n\n✍️ ${cap}\n\n⏰ এখনই পোস্ট করো!`;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, photo: img, caption: msg })
  });
  const d = await res.json();
  console.log("Telegram:", JSON.stringify(d));
  if (!d.ok) throw new Error(JSON.stringify(d));
}

(async () => {
  console.log("🚀 Starting...");
  const list = await getProducts();
  console.log(`📦 Found ${list.length} products`);
  const p = list[Math.floor(Math.random() * list.length)];
  console.log("Selected:", p.name);
  const cap = await genCaption(p);
  console.log("Caption:", cap);
  await send(p, cap);
  console.log("✅ Done!");
})();
