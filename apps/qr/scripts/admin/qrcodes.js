// scripts/admin/qrcodes.js

window.QR_BASE_URL = 'https://qr.zanxa.site/p/';
window.allProductsQR = window.allProductsQR || [];
window.qrInstances = window.qrInstances || {};

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
  renderSidebar('qrcodes');
  attachQRListeners();
  
  await requireAuth();
  await ensureDependencies();
  await loadAndRender();
})();

function attachQRListeners() {
  const searchInput = document.getElementById('qr-search');
  if (searchInput) searchInput.oninput = onSearch;

  const btnDownload = document.getElementById('btn-download-all');
  if (btnDownload) btnDownload.onclick = downloadAllZip;

  const closeBtn = document.getElementById('qr-preview-close');
  if (closeBtn) closeBtn.onclick = closePreview;

  const modal = document.getElementById('qr-preview-modal');
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closePreview();
    };
  }
}

async function loadAndRender() {
  try {
    const res = await getProducts({ fields: 'nomor_seri,nama_produk', limit: 200 });
    window.allProductsQR = res.data || [];
    renderGrid(window.allProductsQR);
  } catch (e) {
    showToast('Gagal memuat produk: ' + e.message, 'error');
  }
}

function onSearch() {
  const q = document.getElementById('qr-search').value.trim().toLowerCase();
  const filtered = q
    ? window.allProductsQR.filter(p =>
        p.nama_produk?.toLowerCase().includes(q) ||
        p.nomor_seri?.toLowerCase().includes(q))
    : [...window.allProductsQR];
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
    <div class="qr-card fade-in" style="padding: 12px; gap: 8px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)';" onclick="openPreview('${p.nomor_seri}','${p.nama_produk.replace(/'/g,"\\'")}')">
      <div id="qr-${safeId}" data-seri="${p.nomor_seri}" class="qr-render-target" style="width:110px; height:110px; min-width:110px; min-height:110px; display:flex; align-items:center; justify-content:center; margin: 0 auto;">
        <div class="sk" style="width:110px;height:110px;border-radius:10px;"></div>
      </div>
      <div class="qr-card__id" style="font-size: .7rem;">${p.nomor_seri}</div>
      <div class="qr-card__name" style="font-size: .8rem;">${p.nama_produk}</div>
      <div class="qr-card__actions" style="margin-top: 4px; justify-content: center;">
        <button class="btn btn-outline btn-sm" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;" title="Download" onclick="event.stopPropagation(); downloadSingle('${p.nomor_seri}','${p.nama_produk.replace(/'/g,"\\'")}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download
        </button>
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

          const qr = generateQRCode(el, QR_BASE_URL + encodeURIComponent(p.nomor_seri), { width: 160, height: 160 });
          if (qr) {
            qrInstances[p.nomor_seri] = { el, qr, name: p.nama_produk };
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
