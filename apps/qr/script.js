const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function renderProduct(p) {
  const app = document.getElementById('app');
  const statusClass = p.status === 'aktif' ? 'status-aktif' : 'status-nonaktif';
  const statusLabel = p.status === 'aktif' ? 'AKTIF' : 'TIDAK AKTIF';

  const galeriHTML = p.galeri.map((src, i) =>
    `<img src="${src}" alt="Galeri ${i+1}" class="gallery-img" loading="lazy" />`
  ).join('');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=https://qr.zanxa.site/product/${p.id}&size=100x100&color=0a0a0a&bgcolor=f5f0e8`;

  app.innerHTML = `
    <div class="product-content fade-in">
      <div class="product-top">
        <div class="product-image-wrap">
          <img src="${p.gambar}" alt="${p.nama_produk}" class="product-hero-img" />
          <div class="product-id-badge">${p.id}</div>
        </div>

        <div class="product-info">
          <div class="info-header">
            <span class="product-type-tag">${p.tipe}</span>
            <span class="product-status ${statusClass}">${statusLabel}</span>
          </div>
          <h1 class="product-name">${p.nama_produk}</h1>
          <p class="product-spec">${p.spesifikasi}</p>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">NO. SERI</span>
              <span class="info-val mono">${p.nomor_seri}</span>
            </div>
            <div class="info-item">
              <span class="info-key">TAHUN</span>
              <span class="info-val mono">${p.tahun_pembuatan}</span>
            </div>
            <div class="info-item">
              <span class="info-key">LOKASI</span>
              <span class="info-val">${p.lokasi_produksi}</span>
            </div>
            <div class="info-item">
              <span class="info-key">TIPE</span>
              <span class="info-val">${p.tipe}</span>
            </div>
          </div>

          <div class="qr-inline">
            <img src="${qrUrl}" alt="QR ${p.id}" class="qr-img" />
            <div class="qr-meta">
              <span class="qr-label">QR CODE</span>
              <span class="mono qr-url">qr.zanxa.site/product/${p.id}</span>
            </div>
          </div>
        </div>
      </div>

      ${p.galeri.length ? `
      <div class="gallery-section">
        <div class="section-label">GALERI</div>
        <div class="gallery-grid">${galeriHTML}</div>
      </div>` : ''}
    </div>
  `;
}

function showNotFound() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="error-screen fade-in">
      <div class="error-code">404</div>
      <div class="error-title">Produk Tidak Ditemukan</div>
      <p class="error-sub">ID "<span class="mono">${id || '—'}</span>" tidak terdaftar dalam sistem.</p>
      <a href="index.html" class="error-btn">← Kembali ke Beranda</a>
    </div>
  `;
  document.title = 'Tidak Ditemukan — QR Zanxa';
}

function showError() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="error-screen fade-in">
      <div class="error-code">ERR</div>
      <div class="error-title">Gagal Mengambil Data</div>
      <p class="error-sub">Tidak dapat memuat database produk. Coba lagi nanti.</p>
      <a href="index.html" class="error-btn">← Kembali ke Beranda</a>
    </div>
  `;
}

function removeSkeleton() {
  const sk = document.getElementById('skeleton');
  if (sk) sk.remove();
}

if (!id) {
  removeSkeleton();
  showNotFound();
} else {
  document.title = `Produk ${id} — QR Zanxa`;
  fetch('data/product.json')
    .then(res => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(data => {
      removeSkeleton();
      const product = data.find(item => item.id === id.toUpperCase());
      if (product) {
        renderProduct(product);
      } else {
        showNotFound();
      }
    })
    .catch(() => {
      removeSkeleton();
      showError();
    });
}
