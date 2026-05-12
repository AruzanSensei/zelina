// scripts/public/product.js — Product detail page

const QR_BASE = 'https://qr.zanxa.site/p/';
const id = new URLSearchParams(location.search).get('id') || '';

if (!id) {
  showScreen('error');
} else {
  loadProduct(id);
}

function showScreen(name) {
  ['skeleton-screen','product-screen','error-screen'].forEach(s => {
    document.getElementById(s)?.classList.toggle('hidden', s !== name + '-screen');
  });
}

async function loadProduct(nomor_seri) {
  try {
    const res  = await fetch(`${APP_CONFIG.WORKER_URL}/products/${encodeURIComponent(nomor_seri)}`);
    const json = await res.json();
    if (!json.success || !json.data) { showScreen('error'); return; }

    renderProduct(json.data);
    showScreen('product');

    // Fire-and-forget scan log
    fetch(`${APP_CONFIG.WORKER_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomor_seri }),
    }).catch(() => {});

  } catch {
    showScreen('error');
  }
}

function renderProduct(p) {
  // Meta title
  document.title = `${p.nama_produk} — ETS Asset Tracking`;
  document.querySelector('meta[name=description]').content =
    `Spesifikasi teknis ${p.nama_produk} (${p.nomor_seri}) — ETS Industrial Asset Tracking`;

  // Breadcrumb & name
  document.getElementById('bc-name').textContent = p.nama_produk;
  document.getElementById('prod-name').textContent = p.nama_produk;

  // Type tag
  if (p.tipe_kode) {
    const tag = document.getElementById('prod-type');
    tag.textContent = p.tipe_kode;
    tag.style.display = '';
  }

  // Cover image
  if (p.gambar_depan) {
    document.getElementById('cover-img').src = p.gambar_depan;
    document.getElementById('cover-img').alt = p.nama_produk;
    document.getElementById('cover-wrap').style.display = '';
  }

  // Info grid
  const fields = [
    ['NOMOR SERI',    p.nomor_seri,              true],
    ['TAHUN',         p.tahun_pembuatan,         false],
    ['INPUT',         p.input,                   false],
    ['OUTPUT',        p.output,                  false],
    ['FREKUENSI',     p.frekuensi,               false],
    ['JUMLAH SOCKET', p.jumlah_socket,           false],
    ['RANGE DAYA',    p.range_daya,              false],
    ['SOFT FUSE',     p.soft_fuse_protection,    false],
    ['HARD FUSE',     p.hard_fuse_protection,    false],
    ['GROUND OUTPUT', p.ground_output,           false],
  ];

  document.getElementById('info-grid').innerHTML = fields.map(([k, v, mono]) => {
    const displayVal = (v !== null && v !== undefined && v !== '') ? v : '-';
    return `
      <div class="info-item">
        <div class="info-key">${k}</div>
        <div class="info-val${mono ? ' mono' : ''}">${displayVal}</div>
      </div>
    `;
  }).join('');

  // Tambahan
  if (p.tambahan_optional) {
    document.getElementById('tambahan-wrap').style.display = '';
    document.getElementById('tambahan-text').textContent   = p.tambahan_optional;
  }

  // QR Code
  const qrUrl = QR_BASE + encodeURIComponent(p.nomor_seri);
  document.getElementById('qr-nomor').textContent = p.nomor_seri;
  document.getElementById('qr-url').textContent   = qrUrl;
  
  const qrSize = window.innerWidth <= 768 ? 90 : 140;
  new QRCode(document.getElementById('qr-box'), {
    text: qrUrl, width: qrSize, height: qrSize,
    colorDark: '#0a0a0a', colorLight: '#ffffff',
    correctLevel: 1 // QRCode.CorrectLevel.L
  });

  // Copy link
  document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.classList.add('copied');
      btn.querySelector('span') ? null : null;
      btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.5 6l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><path d="M1 8V1h7"/></svg> Copy Link`;
      }, 2000);
    });
  });

  // Gallery
  const slots = [
    { key: 'gambar_depan',    label: 'DEPAN' },
    { key: 'gambar_kanan',    label: 'KANAN' },
    { key: 'gambar_kiri',     label: 'KIRI' },
    { key: 'gambar_belakang', label: 'BELAKANG' },
  ];
  const photos = slots.filter(s => p[s.key]);
  if (photos.length > 0) {
    document.getElementById('gallery-section').style.display = '';
    document.getElementById('gallery-grid').innerHTML = photos.map((s, i) => `
      <div class="gallery-item">
        <img class="gallery-img fade-in" src="${p[s.key]}" alt="${s.label}"
          loading="lazy" onclick="openLightbox('${p[s.key]}','${s.label}')">
        <div class="gallery-label">${s.label}</div>
      </div>
    `).join('');
  }
}

// ── LIGHTBOX ─────────────────────────────────────────────────
let lbScale = 1;

function openLightbox(src, label) {
  lbScale = 1;
  const lb  = document.getElementById('lb');
  const img = document.getElementById('lb-img');
  img.src   = src;
  img.alt   = label;
  img.style.transform = 'scale(1)';
  document.getElementById('lb-zoom-val').textContent = '100%';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lb').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb').addEventListener('click', e => {
  if (e.target === document.getElementById('lb')) closeLightbox();
});

document.getElementById('lb-zoom-in').addEventListener('click', () => {
  lbScale = Math.min(lbScale + 0.25, 3);
  applyZoom();
});
document.getElementById('lb-zoom-out').addEventListener('click', () => {
  lbScale = Math.max(lbScale - 0.25, 0.5);
  applyZoom();
});
document.getElementById('lb-reset').addEventListener('click', () => {
  lbScale = 1; applyZoom();
});

function applyZoom() {
  document.getElementById('lb-img').style.transform = `scale(${lbScale})`;
  document.getElementById('lb-zoom-val').textContent = Math.round(lbScale * 100) + '%';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
