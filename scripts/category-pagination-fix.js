// Category Page Pagination - 15 per page
(function() {
  const PER_PAGE = 15;
  let currentPage = 1;
  let fullList = [];
  
  function displayPage(page, source) {
    if (!source || !source.length) return;
    const totalPages = Math.ceil(source.length / PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (currentPage - 1) * PER_PAGE;
    const items = source.slice(start, start + PER_PAGE);
    
    // Use existing displayProducts if available, or build own
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    // If original displayProducts exists, use it for page items
    if (typeof window.displayProductsOriginal === 'function') {
      window.displayProductsOriginal(items);
    } else if (typeof displayProducts === 'function' && displayProducts.toString().includes('productsGrid')) {
      // Try to render manually if original not saved
      let html = '';
      items.forEach(product => {
        const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
        const safeName = (product.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeImage = (product.image || '').replace(/'/g, "\\'");
        html += '<div class="product-card" onclick="viewProduct(\'' + product.id + '\')">';
        html += '<div class="product-image">';
        if (discount > 0) html += '<span class="discount-badge">-' + discount + '%</span>';
        html += '<img src="' + (product.image || 'https://via.placeholder.com/300') + '" alt="' + safeName + '" loading="lazy">';
        html += '</div><div class="product-info"><div class="product-category">' + (product.category || '') + '</div>';
        html += '<h3 class="product-title">' + (product.name || '') + '</h3>';
        html += '<div class="product-price"><span class="current-price">৳' + product.price + '</span></div>';
        html += '<button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(\'' + product.id + '\', \'' + safeName + '\', ' + product.price + ', \'' + safeImage + '\')">কার্টে যোগ করুন</button></div></div>';
      });
      grid.innerHTML = html;
    }
    renderPagination(source.length);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / PER_PAGE);
    let el = document.getElementById('pagination');
    if (!el) {
      const grid = document.getElementById('productsGrid');
      if (!grid) return;
      el = document.createElement('div');
      el.id = 'pagination';
      grid.parentNode.insertBefore(el, grid.nextSibling);
    }
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '<div style="display:flex;justify-content:center;gap:8px;margin:30px 0;flex-wrap:wrap;">';
    html += '<button onclick="window._catPg(' + (currentPage-1) + ')" ' + (currentPage===1?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">আগের</button>';
    for (let i=1; i<=totalPages; i++) {
      if (i===currentPage) html += '<button style="width:40px;height:40px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;">' + i + '</button>';
      else html += '<button onclick="window._catPg(' + i + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;">' + i + '</button>';
    }
    html += '<button onclick="window._catPg(' + (currentPage+1) + ')" ' + (currentPage===totalPages?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">পরের</button>';
    html += '</div><div style="text-align:center;color:#64748b;font-size:13px;">পেজ ' + currentPage + ' / ' + totalPages + ' - মোট ' + totalItems + ' টি পণ্য</div>';
    el.innerHTML = html;
  }

  window._catPg = function(p) {
    const source = window.filteredProducts || window.allProducts || fullList;
    const totalPages = Math.ceil(source.length / PER_PAGE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    displayPage(p, source);
    const grid = document.getElementById('productsGrid');
    if (grid) grid.scrollIntoView({behavior:'smooth'});
  };

  // Wait for products to load
  let check = 0;
  const interval = setInterval(function() {
    check++;
    try {
      if (typeof allProducts !== 'undefined' && allProducts.length > 0 && fullList.length === 0) {
        fullList = allProducts.slice();
        currentPage = 1;
        displayPage(1, fullList);
      }
      if (typeof filteredProducts !== 'undefined' && filteredProducts.length > 0) {
        fullList = filteredProducts.slice();
        currentPage = 1;
        displayPage(1, fullList);
      }
    } catch(e) {}
    if (check > 60) clearInterval(interval);
  }, 1000);
})();
