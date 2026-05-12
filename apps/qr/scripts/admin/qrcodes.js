// scripts/admin/qrcodes.js

const QR_BASE_URL = 'https://qr.zanxa.site/public/product.html?id=';
let allProducts = [];
let qrInstances = {}; // { nomor_seri: QRCode instance }

(async () => {
  await requireAuth();
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

  grid.innerHTML = products.map(p => `
    <div class="qr-card fade-in">
      <div id="qr-${CSS.escape(p.nomor_seri)}" style="border-radius:6px;overflow:hidden;"></div>
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
  `).join('');

  // Generate QR codes after DOM update
  requestAnimationFrame(() => {
    products.forEach(p => {
      const el = document.getElementById(`qr-${CSS.escape(p.nomor_seri)}`);
      if (!el) return;
      el.innerHTML = '';
      try {
        const qr = new QRCode(el, {
          text: QR_BASE_URL + encodeURIComponent(p.nomor_seri),
          width: 160, height: 160,
          colorDark: '#0a0a0a', colorLight: '#ffffff',
        });
        qrInstances[p.nomor_seri] = { el, qr, name: p.nama_produk };
      } catch (err) {
        el.innerHTML = '<div style="width:160px;height:160px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.72rem;">Error</div>';
      }
    });
  });
}

function getCanvas(nomor_seri) {
  const el = document.getElementById(`qr-${CSS.escape(nomor_seri)}`);
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

let previewNomor = null;

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
    img.style.cssText = 'width:240px;height:240px;border-radius:8px;border:1px solid var(--border);';
    previewDiv.appendChild(img);
  }

  document.getElementById('qr-preview-download').onclick = () => downloadSingle(nomor_seri, nama);
  document.getElementById('qr-preview-modal').classList.add('active');
}

function closePreview() {
  document.getElementById('qr-preview-modal').classList.remove('active');
}
