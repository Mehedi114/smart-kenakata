// Category Pagination - Fixed for 44 products
(function() {
  const PER_PAGE = 15;
  let currentPage = 1;
  let masterList = [];

  function renderPage(page) {
    if (!masterList.length) return;
    const totalPages = Math.ceil(masterList.length / PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * PER_PAGE;
    const items = masterList.slice(start, start + PER_PAGE);
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let html = '';
    items.forEach(function(p) {
      const disc = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
      const safeName = (p.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const safeImg = (p.image || '').replace(/'/g, "\\'");
      html += '<div class="product-card" onclick="viewProduct(\'' + p.id + '\')"><div class="product-image">';
      if (disc > 0) html += '<span class="discount-badge">-' + disc + '%</span>';
      html += '<img src="' + (p.image || 'https://via.placeholder.com/300') + '" alt="' + safeName + '" loading="lazy"></div>';
      html += '<div class="product-info"><div class="product-category">' + (p.category || '') + '</div>';
      html += '<h3 class="product-title">' + (p.name || '') + '</h3>';
      html += '<div class="product-price"><span class="current-price">৳' + p.price + '</span>';
      if (p.oldPrice) html += '<span class="old-price">৳' + p.oldPrice + '</span>';
      html += '</div><button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(\'' + p.id + '\', \'' + safeName + '\', ' + p.price + ', \'' + safeImg + '\')">কার্টে যোগ করুন</button></div></div>';
    });
    grid.innerHTML = html;
    // Pagination buttons
    let el = document.getElementById('pagination');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pagination';
      grid.parentNode.appendChild(el);
    }
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html2 = '<div style="display:flex;justify-content:center;gap:8px;margin:30px 0;flex-wrap:wrap;">';
    html2 += '<button onclick="window._catPg(' + (currentPage-1) + ')" ' + (currentPage===1?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">আগের</button>';
    for (let i=1; i<=totalPages; i++) {
      if (i===currentPage) html2 += '<button style="width:40px;height:40px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;">' + i + '</button>';
      else html2 += '<button onclick="window._catPg(' + i + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;">' + i + '</button>';
    }
    html2 += '<button onclick="window._catPg(' + (currentPage+1) + ')" ' + (currentPage===totalPages?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">পরের</button>';
    html2 += '</div><div style="text-align:center;color:#64748b;font-size:13px;">পেজ ' + currentPage + ' / ' + totalPages + ' - মোট ' + masterList.length + ' টি পণ্য</div>';
    el.innerHTML = html2;
  }

  window._catPg = function(p) {
    const totalPages = Math.ceil(masterList.length / PER_PAGE);
    if (p < 1 || p > totalPages) return;
    renderPage(p);
    const grid = document.getElementById('productsGrid');
    if (grid) grid.scrollIntoView({behavior:'smooth'});
  };

  // Hook into existing displayProducts
  let check = 0;
  const interval = setInterval(function() {
    check++;
    try {
      if (typeof filteredProducts !== 'undefined' && filteredProducts.length > 0) {
        if (masterList.length !== filteredProducts.length) {
          masterList = filteredProducts.slice();
          renderPage(1);
        }
      } else if (typeof allProducts !== 'undefined' && allProducts.length > 0 && masterList.length === 0) {
        masterList = allProducts.slice();
        renderPage(1);
      }
    } catch(e) {}
    if (check > 60) clearInterval(interval);
  }, 1000);
})();
