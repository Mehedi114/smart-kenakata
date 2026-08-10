// Auto Sitemap Generator for Smart Kenakata
// Run: node scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const BASE_URL = 'https://mehedi114.github.io/smart-kenakata';
const SITE_DIR = path.join(__dirname, '..');

async function getProducts() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/smart-kenakata/databases/(default)/documents/products?pageSize=200`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        name: f.name?.stringValue || "Product",
        image: f.image?.stringValue || "",
        updated: f.createdAt?.timestampValue || new Date().toISOString()
      };
    });
  } catch (e) {
    console.error('Fetch error:', e);
    return [];
  }
}

function generateSitemap(products) {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${BASE_URL}/index.html</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${BASE_URL}/category.html?cat=all</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>${BASE_URL}/pages.html?tab=about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
    <url><loc>${BASE_URL}/pages.html?tab=contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
`;
  products.forEach(p => {
    const lastmod = p.updated ? new Date(p.updated).toISOString().split('T')[0] : today;
    const loc = `${BASE_URL}/product-details.html?id=${encodeURIComponent(p.id)}`;
    const escXml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const imgTag = p.image ? `\n        <image:image><image:loc>${escXml(p.image)}</image:loc><image:title>${escXml(p.name + ' - স্মার্ট কেনাকাটা')}</image:title></image:image>` : '';
    xml += `    <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority>${imgTag}</url>\n`;
  });
  xml += `</urlset>`;
  return xml;
}

(async () => {
  console.log('Fetching products...');
  const products = await getProducts();
  console.log(`Found ${products.length} products`);
  const sitemap = generateSitemap(products);
  fs.writeFileSync(path.join(SITE_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log('✅ sitemap.xml generated');
  const productsOnly = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products.map(p => `    <url><loc>${BASE_URL}/product-details.html?id=${p.id}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(SITE_DIR, 'sitemap-products.xml'), productsOnly, 'utf8');
  console.log('✅ sitemap-products.xml generated');
})();
