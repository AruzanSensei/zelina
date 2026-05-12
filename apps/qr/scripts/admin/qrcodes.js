// scripts/admin/qrcodes.js

var QR_BASE_URL = 'https://qr.zanxa.site/product.html?id=';
var allProducts = [];
var qrInstances = {}; // { nomor_seri: QRCode instance }

async function ensureDependencies() {
  return new Promise((resolve) => {
    if (window.QRCode && window.JSZip) return resolve();
    let loaded = 0;
    const check = () => { if (++loaded === 2) resolve(); };
    
    if (!window.QRCode) {
      const s1 = document.createElement('script');
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s1.onload = check;
      document.body.appendChild(s1);
    } else check();

    if (!window.JSZip) {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s2.onload = check;
      document.body.appendChild(s2);
    } else check();
  });
}

(async () => {
  await requireAuth();
  await ensureDependencies();
  renderSidebar('qrcodes');
  await loadAndRender();

  document.getElementById('qr-search').addEventListener('input', onSearch);
  document.getElementById('btn-download-all').addEventListener('click', downloadAllZip);
  document.getElementById('qr-preview-close').addEventListener('click', closePreview);
  document.getElementById('qr-preview-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('qr-preview-modal')) closePreview();
  });
})();

async function loadAndRender() {
  try {
    const res = await getProducts({ fields: 'nomor_seri,nama_produk', limit: 200 });
    allProducts = res.data || [];
    renderGrid(allProducts);
  } catch (e) {
    showToast('Gagal memuat produk: ' + e.message, 'error');
  }
}

function onSearch() {
  const q = document.getElementById('qr-search').value.trim().toLowerCase();
  const filtered = q
    ? allProducts.filter(p =>
        p.nama_produk?.toLowerCase().includes(q) ||
        p.nomor_seri?.toLowerCase().includes(q))
    : [...allProducts];
  renderGrid(filtered);
}

function renderGrid(products) {
  const grid    = document.getElementById('qr-grid');
  const emptyEl = document.getElementById('qr-empty');
  qrInstances   = {};

  if (!products.length) {
    grid.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  grid.innerHTML = products.map(p => {
    const safeId = p.nomor_seri.replace(/[^a-zA-Z0-9]/g, '-');
    return `
    <div class="qr-card fade-in">
      <div id="qr-${safeId}" data-seri="${p.nomor_seri}" class="qr-render-target" style="width:160px; height:160px; min-width:160px; min-height:160px; display:flex; align-items:center; justify-content:center; margin: 0 auto;">
        <div class="sk" style="width:160px;height:160px;border-radius:12px;"></div>
      </div>
      <div class="qr-card__id">${p.nomor_seri}</div>
      <div class="qr-card__name">${p.nama_produk}</div>
      <div class="qr-card__actions">
        <button class="btn btn-outline btn-sm" onclick="downloadSingle('${p.nomor_seri}','${p.nama_produk.replace(/'/g,"\\'")}')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke-linecap="round"/></svg>
          Download
        </button>
        <button class="btn btn-ghost btn-sm" onclick="openPreview('${p.nomor_seri}','${p.nama_produk.replace(/'/g,"\\'")}')">Preview</button>
      </div>
    </div>
  `}).join('');

  // Double rAF: first frame paints the DOM, second frame guarantees layout is ready.
  // Then stagger each QR render with a small delay so they pop in one by one.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      products.forEach((p, i) => {
        setTimeout(() => {
          const safeId = p.nomor_seri.replace(/[^a-zA-Z0-9]/g, '-');
          const el = document.getElementById(`qr-${safeId}`);
          if (!el) return; // User may have navigated away

          el.innerHTML = '';
          try {
            const qr = new QRCode(el, {
              text: QR_BASE_URL + encodeURIComponent(p.nomor_seri),
              width: 160, height: 160,
              colorDark: '#0a0a0a', colorLight: '#ffffff',
              correctLevel: 1
            });
            qrInstances[p.nomor_seri] = { el, qr, name: p.nama_produk };
          } catch (err) {
            el.innerHTML = '<div style="width:160px;height:160px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.72rem;">Error</div>';
          }
        }, i * 80); // 80ms stagger per card → "pop-in" effect
      });
    });
  });
}

function getCanvas(nomor_seri) {
  const safeId = nomor_seri.replace(/[^a-zA-Z0-9]/g, '-');
  const el = document.getElementById(`qr-${safeId}`);
  if (!el) return null;
  return el.querySelector('canvas') || el.querySelector('img');
}

function downloadSingle(nomor_seri, nama) {
  const canvas = getCanvas(nomor_seri);
  if (!canvas) { showToast('QR belum ter-generate', 'warning'); return; }
  const url = canvas.tagName === 'CANVAS'
    ? canvas.toDataURL('image/png')
    : canvas.src;
  const a = document.createElement('a');
  a.href = url;
  a.download = `QR_${nomor_seri}.png`;
  a.click();
}

async function downloadAllZip() {
  if (!allProducts.length) { showToast('Tidak ada produk', 'warning'); return; }
  const btn = document.getElementById('btn-download-all');
  btn.disabled = true;
  btn.textContent = 'Menyiapkan...';

  try {
    if (typeof JSZip === 'undefined') throw new Error('JSZip tidak tersedia');
    const zip = new JSZip();
    for (const p of allProducts) {
      const canvas = getCanvas(p.nomor_seri);
      if (!canvas) continue;
      const dataUrl = canvas.tagName === 'CANVAS' ? canvas.toDataURL('image/png') : canvas.src;
      const base64  = dataUrl.split(',')[1];
      zip.file(`QR_${p.nomor_seri}.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const date = new Date().toISOString().slice(0,10);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `QR_Codes_ETS_${date}.zip`;
    a.click();
    showToast('ZIP berhasil didownload', 'success');
  } catch (e) {
    showToast('Download ZIP gagal, mencoba satu per satu...', 'warning');
    allProducts.forEach(p => downloadSingle(p.nomor_seri, p.nama_produk));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download Semua ZIP';
  }
}

var previewNomor = null;

function openPreview(nomor_seri, nama) {
  previewNomor = nomor_seri;
  document.getElementById('qr-preview-title').textContent = nama;
  document.getElementById('qr-preview-url').textContent   = QR_BASE_URL + nomor_seri;

  const canvas  = getCanvas(nomor_seri);
  const previewDiv = document.getElementById('qr-preview-canvas');
  previewDiv.innerHTML = '';

  if (canvas) {
    const url = canvas.tagName === 'CANVAS' ? canvas.toDataURL('image/png') : canvas.src;
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'width:240px;height:240px;border:1px solid var(--border);';
    previewDiv.appendChild(img);
  }

  document.getElementById('qr-preview-download').onclick = () => downloadSingle(nomor_seri, nama);
  document.getElementById('qr-preview-modal').classList.add('active');
}

function closePreview() {
  document.getElementById('qr-preview-modal').classList.remove('active');
}
