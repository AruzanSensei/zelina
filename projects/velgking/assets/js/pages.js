// ─── NAVIGASI HALAMAN ───
function showPage(name, link) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${name}`).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (link) link.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('open');
}

// ─── HALAMAN DETAIL PRODUK ───
function openDetail(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    const el = document.getElementById('detailContent');
    el.innerHTML = `
    <div>
      <div class="gallery-main">${p.icon}</div>
      <div class="gallery-thumbs">
        <div class="gallery-thumb active">${p.icon}</div>
        <div class="gallery-thumb">⚙️</div>
        <div class="gallery-thumb">🔩</div>
      </div>
    </div>
    <div class="detail-right">
      <div class="detail-brand">${p.brand}</div>
      <h1 class="detail-name">${p.name}</h1>
      <div class="detail-stars">★★★★★ <span style="color:var(--muted);font-size:0.85rem">(124 ulasan)</span></div>
      <div class="stock-badge"><i class="fas fa-circle" style="font-size:0.5rem"></i> ${p.stock ? 'Stok Tersedia' : 'Indent / Pre-order'}</div>
      <div class="detail-price">${p.price}<span style="font-size:0.85rem;color:var(--muted);font-family:var(--font-body);font-weight:400"> / pcs</span></div>
      <table class="spec-table">
        <tr><td>Brand</td><td>${p.brand}</td></tr>
        <tr><td>Model</td><td>${p.name}</td></tr>
        <tr><td>Ukuran Ring</td><td>${p.size}</td></tr>
        <tr><td>PCD</td><td>${p.pcd}</td></tr>
        <tr><td>Warna</td><td>${p.color}</td></tr>
        <tr><td>Material</td><td>Aluminium Alloy</td></tr>
        <tr><td>Garansi</td><td>2 Tahun (Resmi)</td></tr>
      </table>
      <div class="detail-actions">
        <button class="btn btn-wa" onclick="openWA()"><i class="fab fa-whatsapp"></i> Konsultasi WA</button>
        <button class="btn btn-red" onclick="openWA()"><i class="fas fa-shopping-cart"></i> Beli Sekarang</button>
      </div>
      <p style="font-size:0.82rem;color:var(--muted)"><i class="fas fa-shield-alt" style="color:var(--red)"></i> Produk original, bergaransi, dengan sertifikat keaslian</p>
    </div>`;

    // Produk terkait
    document.getElementById('relatedGrid').innerHTML =
        PRODUCTS.filter(x => x.id !== id && x.brand === p.brand).slice(0, 3).map(x => renderProductCard(x)).join('') ||
        PRODUCTS.filter(x => x.id !== id).slice(0, 3).map(x => renderProductCard(x)).join('');

    showPage('detail');
}
