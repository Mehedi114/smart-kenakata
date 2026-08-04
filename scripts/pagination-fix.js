// Fixed Pagination - Works with let allProducts
(function() {
  const PER_PAGE = 15;
  let currentPage = 1;
  let fullList = [];
  let filteredList = null;

  function ensurePaginationDiv() {
    let el = document.getElementById('pagination');
    if (!el) {
      const grid = document.getElementById('productsGrid');
      if (!grid) return null;
      el = document.createElement('div');
      el.id = 'pagination';
      grid.parentNode.insertBefore(el, grid.nextSibling ? grid.nextSibling.nextSibling : null);
      if (!el.parentNode) grid.parentNode.appendChild(el);
    }
    return el;
  }

  function displayPage(page, sourceOverride) {
    const source = sourceOverride !== undefined ? sourceOverride : (filteredList || fullList);
    if (!source || source.length === 0) return;
    const totalPages = Math.ceil(source.length / PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (currentPage - 1) * PER_PAGE;
    const items = source.slice(start, start + PER_PAGE);
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let html = '';
    let wishlist = [];
    try { wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch(e) {}
    items.forEach(function(product) {
      const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
      const safeName = (product.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const safeImage = (product.image || '').replace(/'/g, "\\'");
      html += '<div class="product-card" onclick="viewProduct(\'' + product.id + '\')">';
      html += '<div class="product-image">';
      if (discount > 0) html += '<span class="discount-badge">-' + discount + '%</span>';
      html += '<button class="wishlist-heart" onclick="event.stopPropagation(); toggleWishlist(\'' + product.id + '\', this)" style="position:absolute; top:12px; right:12px; width:38px; height:38px; background:white; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.1); z-index:2;"><i class="' + (wishlist.includes(product.id) ? 'fas' : 'far') + ' fa-heart" style="color:' + (wishlist.includes(product.id) ? '#ec4899' : '#94a3b8') + ';"></i></button>';
      html += '<img src="' + (product.image || 'https://via.placeholder.com/300') + '" alt="' + safeName + '" loading="lazy">';
      html += '</div>';
      html += '<div class="product-info"><div class="product-category">' + (product.category || 'সাধারণ') + '</div>';
      html += '<h3 class="product-title">' + (product.name || '') + '</h3>';
      html += '<div class="product-price"><span class="current-price">৳' + product.price + '</span>';
      if (product.oldPrice) html += '<span class="old-price">৳' + product.oldPrice + '</span>';
      html += '</div><button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(\'' + product.id + '\', \'' + safeName + '\', ' + product.price + ', \'' + safeImage + '\')"><i class="fas fa-cart-plus"></i> কার্টে যোগ করুন</button></div></div>';
    });
    grid.innerHTML = html;
    renderPagination(source.length);
    try {
      localStorage.setItem('sk_all_products_v2', JSON.stringify(fullList));
      localStorage.setItem('sk_all_products_time_v2', Date.now().toString());
    } catch(e) {}
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / PER_PAGE);
    const el = ensurePaginationDiv();
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin:30px 0;flex-wrap:wrap;">';
    html += '<button onclick="window._pgChange(' + (currentPage-1) + ')" ' + (currentPage===1?'disabled':'') + ' style="padding:10px 16px;border:2px solid ' + (currentPage===1?'#e2e8f0':'#10b981') + ';background:' + (currentPage===1?'#f1f5f9':'white') + ';color:' + (currentPage===1?'#94a3b8':'#10b981') + ';border-radius:10px;cursor:' + (currentPage===1?'not-allowed':'pointer') + ';font-weight:600;">আগের</button>';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    for (let i=startPage; i<=endPage; i++) {
      if (i===currentPage) html += '<button style="width:40px;height:40px;background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;border-radius:10px;font-weight:700;">' + i + '</button>';
      else html += '<button onclick="window._pgChange(' + i + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;">' + i + '</button>';
    }
    if (totalPages > 5 && endPage < totalPages) html += '<span>...</span><button onclick="window._pgChange(' + totalPages + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;">' + totalPages + '</button>';
    html += '<button onclick="window._pgChange(' + (currentPage+1) + ')" ' + (currentPage===totalPages?'disabled':'') + ' style="padding:10px 16px;border:2px solid ' + (currentPage===totalPages?'#e2e8f0':'#10b981') + ';background:' + (currentPage===totalPages?'#f1f5f9':'white') + ';color:' + (currentPage===totalPages?'#94a3b8':'#10b981') + ';border-radius:10px;cursor:' + (currentPage===totalPages?'not-allowed':'pointer') + ';font-weight:600;">পরের</button>';
    html += '</div><div style="text-align:center;color:#64748b;font-size:13px;">পেজ ' + currentPage + ' / ' + totalPages + ' - মোট ' + totalItems + ' টি পণ্য</div>';
    el.innerHTML = html;
  }

  window._pgChange = function(p) {
    const source = filteredList || fullList;
    const totalPages = Math.ceil(source.length / PER_PAGE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    displayPage(p, source);
    const grid = document.getElementById('productsGrid');
    if (grid) grid.scrollIntoView({behavior:'smooth'});
  };

  let checkCount = 0;
  const interval = setInterval(function() {
    checkCount++;
    try {
      if (typeof allProducts !== 'undefined' && allProducts.length > 0 && fullList.length === 0) {
        fullList = allProducts.slice();
        currentPage = 1;
        displayPage(1, fullList);
      } else if (typeof allProducts !== 'undefined' && allProducts.length > 0 && fullList.length !== allProducts.length) {
        fullList = allProducts.slice();
        displayPage(currentPage, filteredList || fullList);
      }
    } catch(e) {}
    if (checkCount > 60) clearInterval(interval);
  }, 1000);
})();
