// Smart Kenakata - No Price, Attractive CTA
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GROQ_KEY = process.env.GROQ_API_KEY;

async function getProducts() {
  const url = `https://firestore.googleapis.com/v1/projects/smart-kenakata/databases/(default)/documents/products?pageSize=80`;
  const res = await fetch(url);
  const data = await res.json();
  return data.documents.map(doc => {
    const f = doc.fields;
    return {
      id: doc.name.split('/').pop(),
      name: f.name?.stringValue || "Product",
      category: f.category?.stringValue || "General",
      image: f.image?.stringValue || "",
      description: f.description?.stringValue || ""
    };
  }).filter(p => p.image);
}

async function genCaption(p) {
  const prompt = `You are top FB sales writer for Smart Kenakata. Product: ${p.name} Category: ${p.category}. Write HIGH attractive Bengali caption, 5-6 lines, emojis, NO price, must have CTA like inbox or website visit, link https://mehedi114.github.io/smart-kenakata/product-details.html?id=${p.id}, hashtags #SmartKenakata`;
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.95, max_tokens: 400 })
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content || `😍 ${p.name} - দেখলেই পছন্দ হবে!\n✨ Premium Quality\n📩 ইনবক্স করুন\n🌐 https://mehedi114.github.io/smart-kenakata/product-details.html?id=${p.id}\n\n#SmartKenakata`;
}

async function send(p, cap) {
  const msg = `🌟 আজকের স্পেশাল!\n\n📸 ${p.name}\n\n✍️ Caption:\n━━━━━━━━━━━━━━━\n${cap}\n━━━━━━━━━━━━━━━\n\n🔗 Link: https://mehedi114.github.io/smart-kenakata/product-details.html?id=${p.id}`;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, photo: p.image, caption: msg })
  });
  const d = await res.json();
  console.log(JSON.stringify(d));
  if (!d.ok) throw new Error(JSON.stringify(d));
}

(async () => {
  const list = await getProducts();
  const p = list[Math.floor(Math.random() * list.length)];
  const cap = await genCaption(p);
  await send(p, cap);
})();
