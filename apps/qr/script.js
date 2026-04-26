const WORKER_URL = 'https://qr-worker.zanxa-studio.workers.dev';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function renderProduct(p) {
  const app = document.getElementById('app');
  const statusClass = p.status === 'aktif' ? 'status-aktif' : 'status-nonaktif';
  const statusLabel = p.status === 'aktif' ? 'AKTIF' : 'TIDAK AKTIF';
  const qrLink = `https://qr.zanxa.site/product/${p.id}`;

  // Breadcrumb
  const bc = document.getElementById('bc-id');
  if (bc) bc.textContent = p.id;

  // Photo gallery slots
  const photoSlots = [
    { key: 'gambar_depan', label: 'Depan' },
    { key: 'gambar_samping_kanan', label: 'Samping Kanan' },
    { key: 'gambar_samping_kiri', label: 'Samping Kiri' },
    { key: 'gambar_belakang', label: 'Belakang' },
    { key: 'gambar_dalam', label: 'Dalam' },
  ];

  const galleryHTML = photoSlots
    .filter(s => p[s.key])
    .map(s => `
      <div class="gallery-item">
        <img src="${p[s.key]}" alt="${s.label}" class="gallery-img" loading="lazy" />
        <span class="gallery-label">${s.label}</span>
      </div>
    `).join('');

  app.innerHTML = `
    <div class="product-content fade-in">

      <!-- COVER -->
      <div class="product-cover-wrap">
        <img src="${p.gambar_cover || p.gambar_depan}" alt="${p.nama_produk}" class="product-cover-img" />
        <div class="cover-overlay">
          <span class="product-id-badge">${p.id}</span>
          <span class="product-status ${statusClass}">${statusLabel}</span>
        </div>
      </div>

      <!-- TOP GRID -->
      <div class="product-top">
        <div class="product-info">
          <div class="info-header">
            <span class="product-type-tag">${p.tipe}</span>
          </div>
          <h1 class="product-name">${p.nama_produk}</h1>
          ${p.spesifikasi ? `<p class="product-spec">${p.spesifikasi}</p>` : ''}

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
              <span class="info-key">TIPE / KODE</span>
              <span class="info-val">${p.tipe}</span>
            </div>
            <div class="info-item">
              <span class="info-key">JUMLAH SOCKET</span>
              <span class="info-val mono">${p.jumlah_socket ?? '—'}</span>
            </div>
            <div class="info-item span2">
              <span class="info-key">INPUT</span>
              <span class="info-val">${p.input || '—'}</span>
            </div>
            <div class="info-item span2">
              <span class="info-key">OUTPUT</span>
              <span class="info-val">${p.output || '—'}</span>
            </div>
            <div class="info-item span2">
              <span class="info-key">FREKUENSI</span>
              <span class="info-val">${p.frekuensi || '—'}</span>
            </div>
          </div>
        </div>

        <!-- QR PANEL — QR kiri, teks kanan -->
        <div class="qr-panel">
          <button class="copy-link-btn" id="copy-link-btn" title="Salin link produk">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Salin Link
          </button>
          <div id="qr-canvas"></div>
          <div class="qr-meta">
            <div class="demo-label">QR CODE</div>
            <span class="mono qr-url">qr.zanxa.site/product/${p.id}</span>
          </div>
        </div>
      </div>

      <!-- PHOTO GALLERY -->
      ${galleryHTML ? `
      <div class="gallery-section">
        <div class="section-label">FOTO PRODUK</div>
        <div class="gallery-grid">${galleryHTML}</div>
      </div>` : ''}

    </div>

    <!-- LIGHTBOX -->
    <div class="lightbox-overlay" id="lightbox">
      <div class="lightbox-inner">
        <button class="lb-close" id="lb-close" title="Tutup">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="lightbox-img-wrap" id="lb-img-wrap">
          <img class="lightbox-img" id="lb-img" src="" alt="" />
        </div>
        <div class="lightbox-controls">
          <button class="lb-btn" id="lb-zoom-out" title="Perkecil">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M4.5 7h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <span class="lb-zoom-val" id="lb-zoom-val">100%</span>
          <button class="lb-btn" id="lb-zoom-in" title="Perbesar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="lb-btn" id="lb-zoom-reset" title="Reset zoom">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 1 0 1.5-3.9M2 4v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="lb-divider"></div>
          <button class="lb-btn" id="lb-download" title="Unduh gambar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  new QRCode(document.getElementById('qr-canvas'), {
    text: qrLink,
    width: 100,
    height: 100,
    colorDark: '#0a0a0a',
    colorLight: '#f5f0e8',
  });

  // --- Copy link button ---
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(qrLink).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Tersalin!
        `;
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Salin Link
          `;
        }, 2000);
      });
    });
  }

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbZoomVal = document.getElementById('lb-zoom-val');
  let lbScale = 1;
  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 5;

  function updateZoom() {
    lbImg.style.transform = `scale(${lbScale})`;
    lbZoomVal.textContent = Math.round(lbScale * 100) + '%';
  }

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbScale = 1;
    updateZoom();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  // Open on any clickable image
  document.querySelectorAll('.gallery-img, .product-cover-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  // Close
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Zoom buttons
  document.getElementById('lb-zoom-in').addEventListener('click', () => {
    lbScale = Math.min(ZOOM_MAX, lbScale + ZOOM_STEP);
    updateZoom();
  });
  document.getElementById('lb-zoom-out').addEventListener('click', () => {
    lbScale = Math.max(ZOOM_MIN, lbScale - ZOOM_STEP);
    updateZoom();
  });
  document.getElementById('lb-zoom-reset').addEventListener('click', () => {
    lbScale = 1;
    updateZoom();
  });

  // Scroll to zoom
  document.getElementById('lb-img-wrap').addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    lbScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, lbScale + delta));
    updateZoom();
  }, { passive: false });

  // Download
  document.getElementById('lb-download').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = lbImg.src;
    a.download = lbImg.alt || 'foto-produk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
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
  fetch(`${WORKER_URL}/products?id=${encodeURIComponent(id.toUpperCase())}`)
    .then(res => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(data => {
      removeSkeleton();
      const product = data[0];
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