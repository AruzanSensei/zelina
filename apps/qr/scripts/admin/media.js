// scripts/admin/media.js

var SLOTS = ['depan','kanan','kiri','belakang'];
var allProducts = [];

(async () => {
  await requireAuth();
  renderSidebar('media');
  await loadProducts();
  document.getElementById('media-search').addEventListener('input', onSearch);
})();

async function loadProducts() {
  try {
    const res = await getProducts({
      fields: 'nomor_seri,nama_produk,gambar_depan,gambar_kanan,gambar_kiri,gambar_belakang',
      limit: 200
    });
    allProducts = res.data || [];
    renderGrid(allProducts);
  } catch (e) {
    showToast('Gagal memuat produk: ' + e.message, 'error');
  }
}

function onSearch() {
  const q = document.getElementById('media-search').value.trim().toLowerCase();
  const filtered = q
    ? allProducts.filter(p =>
        p.nama_produk?.toLowerCase().includes(q) ||
        p.nomor_seri?.toLowerCase().includes(q))
    : [...allProducts];
  renderGrid(filtered);
}

function renderGrid(products) {
  const grid = document.getElementById('media-grid');
  const empty = document.getElementById('media-empty');

  if (!products.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = products.map(p => `
    <div class="media-card">
      <div class="media-card__header">${p.nama_produk}</div>
      <div class="media-card__sub" style="font-size:.72rem;color:var(--text-muted);margin-bottom:12px;font-family:var(--mono);">${p.nomor_seri}</div>
      <div class="media-slots">
        ${SLOTS.map(slot => {
          const url = p[`gambar_${slot}`];
          return `
            <div>
              <div class="media-img-slot" id="mslot-${p.nomor_seri}-${slot}">
                ${url
                  ? `<img src="${url}" alt="${slot}" loading="lazy">`
                  : `<div class="empty-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="16" height="16" rx="2"/><circle cx="7" cy="7" r="1.5"/><path d="M18 13l-4-4-4 4-2-2-4 4"/></svg><span>UPLOAD</span></div>`
                }
                <input type="file" accept="image/*"
                  data-nomor="${p.nomor_seri}"
                  data-slot="${slot}"
                  onchange="onUpload(event)">
                ${url ? `<button class="del-btn" onclick="onDelete(event,'${p.nomor_seri}','${slot}')">×</button>` : ''}
              </div>
              <div class="media-slot-label" style="font-size:.6rem;color:var(--text-muted);text-align:center;margin-top:4px;">${slot.toUpperCase()}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

async function onUpload(e) {
  const file  = e.target.files[0];
  if (!file) return;
  const nomor_seri = e.target.dataset.nomor;
  const slot       = e.target.dataset.slot;
  const slotEl     = document.getElementById(`mslot-${nomor_seri}-${slot}`);

  try {
    // Show compressing state
    const existing = slotEl.querySelector('img');
    if (!existing) {
      slotEl.querySelector('.empty-icon')?.remove();
    }
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--text-sub);background:var(--gray-100);z-index:1;';
    placeholder.textContent = 'Compressing...';
    slotEl.appendChild(placeholder);

    const newUrl = await uploadImage(file, nomor_seri, slot);
    await updateProduct(nomor_seri, { [`gambar_${slot}`]: newUrl });

    // Update local data
    const prod = allProducts.find(p => p.nomor_seri === nomor_seri);
    if (prod) prod[`gambar_${slot}`] = newUrl;

    // Update slot UI
    placeholder.remove();
    let img = slotEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = slot;
      img.loading = 'lazy';
      slotEl.prepend(img);
    }
    img.src = newUrl + '?t=' + Date.now();

    // Add delete button if not present
    if (!slotEl.querySelector('.del-btn')) {
      const btn = document.createElement('button');
      btn.className = 'del-btn';
      btn.textContent = '×';
      btn.onclick = (ev) => onDelete(ev, nomor_seri, slot);
      slotEl.appendChild(btn);
    }

    showToast(`Foto ${slot} berhasil diupload`, 'success');
  } catch (err) {
    showToast(`Upload gagal: ${err.message}`, 'error');
  }
}

async function onDelete(e, nomor_seri, slot) {
  e.stopPropagation();
  showConfirmModal({
    title:       `Hapus foto ${slot}?`,
    message:     `Foto <strong>${slot.toUpperCase()}</strong> produk ${nomor_seri} akan dihapus.`,
    confirmText: 'Hapus',
    onConfirm:   async () => {
      try {
        await updateProduct(nomor_seri, { [`gambar_${slot}`]: null });

        const prod = allProducts.find(p => p.nomor_seri === nomor_seri);
        if (prod) prod[`gambar_${slot}`] = null;

        const slotEl = document.getElementById(`mslot-${nomor_seri}-${slot}`);
        slotEl.innerHTML = `
          <div class="empty-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="16" height="16" rx="2"/><circle cx="7" cy="7" r="1.5"/><path d="M18 13l-4-4-4 4-2-2-4 4"/></svg><span>UPLOAD</span></div>
          <input type="file" accept="image/*" data-nomor="${nomor_seri}" data-slot="${slot}" onchange="onUpload(event)">
        `;
        showToast(`Foto ${slot} dihapus`, 'success');
      } catch (err) {
        showToast('Gagal hapus: ' + err.message, 'error');
      }
    },
  });
}
