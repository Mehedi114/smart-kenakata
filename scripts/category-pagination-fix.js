// Category Pagination - Simple Show/Hide - 100% Working
(function() {
  const PER_PAGE = 15;
  let currentPage = 1;
  let allCards = [];

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

  function showPage(page) {
    const totalPages = Math.ceil(allCards.length / PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    
    allCards.forEach((card, idx) => {
      card.style.display = (idx >= start && idx < end) ? '' : 'none';
    });

    const el = ensurePaginationDiv();
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    
    let html = '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin:30px 0;flex-wrap:wrap;">';
    html += '<button onclick="window._catPg(' + (currentPage-1) + ')" ' + (currentPage===1?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;font-weight:600;background:' + (currentPage===1?'#f1f5f9':'white') + ';">আগের</button>';
    for (let i=1; i<=totalPages; i++) {
      if (i===currentPage) html += '<button style="width:40px;height:40px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;">' + i + '</button>';
      else html += '<button onclick="window._catPg(' + i + ')" style="width:40px;height:40px;background:white;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;">' + i + '</button>';
    }
    html += '<button onclick="window._catPg(' + (currentPage+1) + ')" ' + (currentPage===totalPages?'disabled':'') + ' style="padding:10px 16px;border:2px solid #10b981;border-radius:10px;cursor:pointer;font-weight:600;">পরের</button>';
    html += '</div><div style="text-align:center;color:#64748b;font-size:13px;">পেজ ' + currentPage + ' / ' + totalPages + ' - মোট ' + allCards.length + ' টি পণ্য</div>';
    el.innerHTML = html;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  window._catPg = function(p) {
    const totalPages = Math.ceil(allCards.length / PER_PAGE);
    if (p < 1 || p > totalPages) return;
    showPage(p);
  };

  // Wait for products to render, then paginate
  let check = 0;
  const interval = setInterval(function() {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length > 0) {
      if (allCards.length !== cards.length) {
        allCards = Array.from(cards);
        showPage(1);
        console.log('Category pagination: ' + allCards.length + ' products found');
      }
    }
    check++;
    if (check > 30) clearInterval(interval);
  }, 1000);
})();
