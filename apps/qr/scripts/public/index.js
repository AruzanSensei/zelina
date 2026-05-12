// scripts/public/index.js — Public landing page logic

const CACHE_KEY = 'ets_products_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEMO_MAX  = 6;
const QR_BASE   = 'https://qr.zanxa.site/p/';

let allProducts = [];
let showingAll  = false;

// Admin link
document.getElementById('admin-link').addEventListener('click', () => {
  window.location.href = '../admin/login.html';
});

// Search
document.getElementById('btn-go').addEventListener('click', doSearch);
document.getElementById('search-id').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const val = document.getElementById('search-id').value.trim();
  const err = document.getElementById('search-error');
  err.textContent = '';
  window.location.href = 'product.html?id=' + encodeURIComponent(val);
}

// Load products
async function loadProducts() {
  // Try cache
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      allProducts = cached.data;
      renderDemo();
      renderQR();
      return;
    }
  } catch {}

  try {
    const res = await fetch(`${APP_CONFIG.WORKER_URL}/products?fields=nomor_seri,nama_produk,tipe_kode&limit=50`);
    const json = await res.json();
    allProducts = json.data || [];
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: allProducts }));
    renderDemo();
    renderQR();
  } catch (e) {
    document.getElementById('demo-grid').innerHTML =
      '<div style="color:var(--ink3);font-size:.8rem;grid-column:1/-1;">Gagal memuat data produk.</div>';
    document.getElementById('qr-cards').innerHTML = '';
  }
}

function renderDemo() {
  const grid    = document.getElementById('demo-grid');
  const moreBtn = document.getElementById('btn-see-more');

  if (!allProducts.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--ink3);font-size:.85rem;">Belum ada produk terdaftar.</div>';
    return;
  }

  const visible = showingAll ? allProducts : allProducts.slice(0, DEMO_MAX);
  grid.innerHTML = visible.map(p => `
    <a class="demo-item fade-in" href="product.html?id=${encodeURIComponent(p.nomor_seri)}">
      <div class="demo-id">${p.nomor_seri}</div>
      <div class="demo-name">${p.nama_produk}</div>
      ${p.tipe_kode ? `<div class="demo-type">${p.tipe_kode}</div>` : ''}
    </a>
  `).join('');

  if (allProducts.length > DEMO_MAX && !showingAll) {
    moreBtn.classList.remove('hidden');
    moreBtn.textContent = `Lihat ${allProducts.length - DEMO_MAX} lainnya ↓`;
    moreBtn.onclick = () => { showingAll = true; renderDemo(); moreBtn.classList.add('hidden'); };
  } else {
    moreBtn.classList.add('hidden');
  }
}

function renderQR() {
  const container = document.getElementById('qr-cards');
  const items = allProducts.slice(0, 4);
  if (!items.length) { container.innerHTML = ''; return; }

  container.innerHTML = items.map(p => `
    <div class="qr-card">
      <div id="qr-pub-${CSS.escape(p.nomor_seri)}"></div>
      <span>${p.nomor_seri}</span>
    </div>
  `).join('');

  // Stagger QR rendering
  items.forEach((p, i) => {
    setTimeout(() => {
      const el = document.getElementById(`qr-pub-${CSS.escape(p.nomor_seri)}`);
      if (!el) return;
      generateQRCode(el, QR_BASE + encodeURIComponent(p.nomor_seri), { width: 80, height: 80 });
    }, i * 120);
  });
}

loadProducts();
