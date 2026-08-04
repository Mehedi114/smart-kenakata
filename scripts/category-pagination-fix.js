// Category Pagination - Final Fixed Version
(function() {
  const PER_PAGE = 15;
  let currentPage = 1;
  let masterList = [];

  function ensurePaginationDiv() {
    let el = document.getElementById('pagination');
    if (!el) {
      const grid = document.getElementById('productsGrid');
      if (!grid) return null;
      el = document.createElement('div');
      el.id = 'pagination';
      grid.parentNode.appendChild(el);
    }
    return el;
  }

  function displayPage(page) {
    if (!masterList.length) return;
    const totalPages = Math.ceil(masterList.length / PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (currentPage - 1) * PER_PAGE;
    const items = masterList.slice(start, start + PER_PAGE);

    // Build HTML directly
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let html = '';
    items.forEach(product => {
      const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
      const safeName = (product.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const safeImage = (product.image || '').replace(/'/g, "\\'");
      html += '<div class="product-card" onclick="viewProduct(\'' + product.id + '\')">';
      html += '<div class="product-image">';
      if (discount > 0) html += '<span class="discount-badge">-' + discount + '%</span>';
      html += '<img src="' + (product.image || 'https://via.placeholder.com/300') + '" alt="' + safeName + '" loading="lazy">';
      html += '</div><div class="product-info"><div class="product-category">' + (product.category || 'সাধারণ') + '</div>';
      html += '<h3 class="product-title">' + (product.name || '') + '</h3>';
      html += '<div class="product-price"><span class="current-price">৳' + product.price + '</span>';
      if (product.oldPrice) html += '<span class="old-price">৳' + product.oldPrice + '</span>';
      html += '</div><button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(\'' + product.id + '\', \'' + safeName + '\', ' + product.price + ', \'' + safeImage + '\')">কার্টে যোগ করুন</button></div></div>';
    });
    grid.innerHTML = html;

    // Pagination buttons
    const totalPages2 = Math.ceil(masterList.length / PER_PAGE);
    const el = ensurePaginationDiv();
    if (!el) return;
    if (totalPages2 <= 1) { el.innerHTML = ''; return; }
    let html2 = '<div style="display:flex;justify-content:center;gap:8px;margin:30px 0;flex-wrap:wrap;">';
    html2 += '<button onclick="window._catPg(' + (currentPage-1) + ')" ' + (currentPage===1?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">আগের</button>';
    for (let i=1; i<=totalPages2; i++) {
      if (i===currentPage) html2 += '<button style="width:40px;height:40px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;">' + i + '</button>';
      else html2 += '<button onclick="window._catPg(' + i + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;">' + i + '</button>';
    }
    html2 += '<button onclick="window._catPg(' + (currentPage+1) + ')" ' + (currentPage===totalPages2?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;">পরের</button>';
    html2 += '</div><div style="text-align:center;color:#64748b;font-size:13px;">পেজ ' + currentPage + ' / ' + totalPages2 + ' - মোট ' + masterList.length + ' টি পণ্য</div>';
    el.innerHTML = html2;
  }

  window._catPg = function(p) {
    const totalPages = Math.ceil(masterList.length / PER_PAGE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    displayPage(p);
    const grid = document.getElementById('productsGrid');
    if (grid) grid.scrollIntoView({behavior:'smooth'});
  };

  // Override displayProducts
  let check = 0;
  const interval = setInterval(function() {
    check++;
    if (typeof displayProducts === 'function' && !window._catOverridden) {
      const orig = displayProducts;
      window._catOverridden = true;
      window.displayProducts = function(products) {
        if (!products) return;
        masterList = products.slice();
        currentPage = 1;
        displayPage(1);
      };
      console.log('Category pagination hooked');
    }
    // Also try to get from global variables
    try {
      if (typeof allProducts !== 'undefined' && allProducts.length > 0 && masterList.length === 0) {
        // allProducts is all, filteredProducts is filtered
        const source = (typeof filteredProducts !== 'undefined' && filteredProducts.length > 0) ? filteredProducts : allProducts;
        masterList = source.slice();
        displayPage(1);
      }
      if (typeof filteredProducts !== 'undefined' && filteredProducts.length > 0 && masterList.length !== filteredProducts.length) {
        // When filter changes
        const q = document.getElementById('searchInput');
        if (q && q.value.trim() !== '') {
          masterList = filteredProducts.slice();
          currentPage = 1;
          displayPage(1);
        }
      }
    } catch(e) {}
    if (check > 60) clearInterval(interval);
  }, 1000);
})();
