// scripts/admin/products.js — CRUD Products page logic

// Use window-level state to persist through SPA navigation re-injections
window.PAGE_SIZE = window.PAGE_SIZE || 20;
window.currentMode = 'list'; 
window.currentProduct = null;
window.isEdit = false;
window.allProducts = window.allProducts || [];
window.filteredProducts = window.filteredProducts || [];
window.currentPage = 1;
window.pendingImages = {};
window.existingUrls = {};

(async () => {
  // 1. Initial Render Sidebar & Static Listeners (Instant)
  renderSidebar('products');
  attachStaticEventListeners();

  // 2. Auth Check (Async)
  await requireAuth();

  // 3. Load Data (Async)
  await loadProducts();

  // 4. Check URL actions
  if (new URL(location.href).searchParams.get('action') === 'create') {
    switchMode('form', null, false);
  }
})();

function attachStaticEventListeners() {
  const btnAdd = document.getElementById('btn-add');
  if (btnAdd) {
    // Remove old listeners if any (though innerHTML replace usually handles this)
    btnAdd.onclick = () => switchMode('form', null, false);
  }
  
  const btnAddEmpty = document.getElementById('btn-add-empty');
  if (btnAddEmpty) btnAddEmpty.onclick = () => switchMode('form', null, false);

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.oninput = debounce(onSearch, 300);
  }

  // Form events
  const backForm = document.getElementById('btn-back-form');
  if (backForm) backForm.onclick = () => switchMode('list');
  
  const cancelForm = document.getElementById('btn-cancel-form');
  if (cancelForm) cancelForm.onclick = () => switchMode('list');

  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.onsubmit = onSubmitForm;
  }

  // Image slots
  document.querySelectorAll('.img-slot input[type=file]').forEach(input => {
    input.onchange = onFileChange;
  });

  // Detail events
  const backDetail = document.getElementById('btn-back-detail');
  if (backDetail) backDetail.onclick = () => switchMode('list');

  const editDetail = document.getElementById('btn-edit-from-detail');
  if (editDetail) editDetail.onclick = () => switchMode('form', window.currentProduct, true);

  const deleteDetail = document.getElementById('btn-delete-from-detail');
  if (deleteDetail) deleteDetail.onclick = () => confirmDelete(window.currentProduct.nomor_seri);

  // Backdrop click
  const detailOverlay = document.getElementById('mode-detail');
  if (detailOverlay) {
    detailOverlay.onclick = (e) => {
      if (e.target === detailOverlay) switchMode('list');
    };
  }
}

// ── UTILS ────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function switchMode(mode, product = null, edit = false) {
  window.currentMode = mode;
  window.currentProduct = product;
  window.isEdit = edit;

  // Handle standard sections
  document.querySelectorAll('.mode-section:not(.modal-overlay)').forEach(el => el.classList.remove('active'));

  const detailModal = document.getElementById('mode-detail');

  if (mode === 'detail') {
    if (product) renderDetail(product);
    detailModal.style.display = 'flex';
    requestAnimationFrame(() => detailModal.classList.add('active'));
  } else {
    detailModal.classList.remove('active');
    setTimeout(() => { if (currentMode !== 'detail') detailModal.style.display = 'none'; }, 200);

    const target = document.getElementById(`mode-${mode}`);
    if (target) target.classList.add('active');
  }

  if (mode === 'form') populateForm(product, edit);
}

// ── LOAD LIST ────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await getProducts({ limit: 200 });
    allProducts = res.data || [];
    filteredProducts = [...allProducts];
    renderTable();
  } catch (e) {
    showToast('Gagal memuat produk: ' + e.message, 'error');
  }
}

function onSearch() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  filteredProducts = q
    ? allProducts.filter(p =>
      p.nama_produk?.toLowerCase().includes(q) ||
      p.nomor_seri?.toLowerCase().includes(q) ||
      p.tipe_kode?.toLowerCase().includes(q))
    : [...allProducts];
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('product-tbody');
  const emptyEl = document.getElementById('empty-state-list');
  const paginEl = document.getElementById('pagination');

  if (!filteredProducts.length) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('hidden');
    paginEl.innerHTML = '';
    return;
  }
  emptyEl.classList.add('hidden');

  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filteredProducts.slice(start, start + PAGE_SIZE);
  const total = Math.ceil(filteredProducts.length / PAGE_SIZE);

  tbody.innerHTML = page.map((p, i) => {
    const safeId = p.nomor_seri.replace(/[^a-zA-Z0-9]/g, '_');
    return `
    <tr style="cursor:pointer;" onclick="viewDetail('${p.nomor_seri}')">
      <td style="text-align: center; color: var(--text-muted); font-weight: 500;">${start + i + 1}</td>
      <td><span style="font-family:var(--mono);font-size:.78rem;">${p.nomor_seri}</span></td>
      <td>
        <span class="truncate" style="max-width:220px;display:block;font-weight:500;">${p.nama_produk}</span>
      </td>
      <td>${p.tipe_kode || '—'}</td>
      <td>${p.tahun_pembuatan || '—'}</td>
      <td>${fmtDate(p.created_at)}</td>
      <td onclick="event.stopPropagation()">
        <!-- Desktop: 3 buttons inline -->
        <div class="table-actions desktop-actions">
          <button class="btn btn-ghost btn-action" onclick="window.open('../public/product.html?id=${p.nomor_seri}', '_blank')" title="Lihat Halaman Publik">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Public
          </button>
          <button class="btn btn-outline btn-action" onclick="editProduct('${p.nomor_seri}')">Edit</button>
          <button class="btn btn-danger btn-action" onclick="confirmDelete('${p.nomor_seri}')">Hapus</button>
        </div>
        <!-- Mobile: single ellipsis button trigger -->
        <div class="mobile-actions">
          <button class="btn btn-ghost btn-action" onclick="toggleActionMenu(event,'${p.nomor_seri}')" style="padding:5px 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `}).join('');

  // Pagination
  paginEl.innerHTML = `
    <button class="pagination__btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">← Prev</button>
    <span class="pagination__info">Halaman ${currentPage} dari ${total}</span>
    <button class="pagination__btn" ${currentPage >= total ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">Next →</button>
  `;
}

function goPage(n) { currentPage = n; renderTable(); }

// ── ACTION DROPDOWN (Mobile) — rendered to body to escape table overflow ──
function toggleActionMenu(e, seri) {
  e.stopPropagation();
  closeAllActionMenus();

  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();

  const menu = document.createElement('div');
  menu.className = 'action-dropdown-float';
  menu.style.cssText = `position:fixed; z-index:9000; right:${window.innerWidth - rect.right}px; top:${rect.bottom + 6}px; background:var(--bg-card); border:1px solid var(--border-md); border-radius:8px; box-shadow:var(--shadow-md); min-width:150px; overflow:hidden;`;

  const escapedSeri = seri.replace(/"/g, '&quot;');
  menu.innerHTML = `
    <button onclick="closeAllActionMenus(); window.open('../public/product.html?id=${escapedSeri}', '_blank')" style="width:100%;text-align:left;padding:10px 14px;font-size:.82rem;background:none;border:none;cursor:pointer;color:var(--text-main);display:flex;align-items:center;gap:8px;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Public
    </button>
    <button onclick="closeAllActionMenus(); editProduct('${escapedSeri}')" style="width:100%;text-align:left;padding:10px 14px;font-size:.82rem;background:none;border:none;cursor:pointer;color:var(--text-main);display:flex;align-items:center;gap:8px;border-top:1px solid var(--border);">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit
    </button>
    <button onclick="closeAllActionMenus(); confirmDelete('${escapedSeri}')" style="width:100%;text-align:left;padding:10px 14px;font-size:.82rem;background:none;border:none;cursor:pointer;color:var(--red);display:flex;align-items:center;gap:8px;border-top:1px solid var(--border);">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg> Hapus
    </button>
  `;
  document.body.appendChild(menu);
}

function closeAllActionMenus() {
  document.querySelectorAll('.action-dropdown-float').forEach(m => m.remove());
}

// Close dropdown when clicking outside
document.addEventListener('click', closeAllActionMenus);

// ── VIEW / EDIT SHORTCUT ─────────────────────────────────────
function viewDetail(nomor_seri) {
  const p = allProducts.find(x => x.nomor_seri === nomor_seri);
  if (p) switchMode('detail', p);
}

function editProduct(nomor_seri) {
  const p = allProducts.find(x => x.nomor_seri === nomor_seri);
  if (p) switchMode('form', p, true);
}

// ── FORM ─────────────────────────────────────────────────────
function populateForm(product, edit) {
  // Reset pending images and existing urls
  Object.keys(pendingImages).forEach(k => delete pendingImages[k]);
  Object.keys(existingUrls).forEach(k => delete existingUrls[k]);

  // Reset all slots
  ['depan', 'kanan', 'kiri', 'belakang'].forEach(slot => {
    const prev = document.getElementById(`prev-${slot}`);
    const badge = document.getElementById(`badge-${slot}`);
    const input = document.querySelector(`.img-slot[id="slot-${slot}"] input`);
    prev.classList.remove('visible');
    prev.src = '';
    badge.style.display = 'none';
    if (input) input.value = '';
  });

  document.getElementById('form-title').textContent = edit ? `Edit Produk: ${product.nomor_seri}` : 'Tambah Produk Baru';

  const fields = {
    'f-nama': edit ? product.nama_produk : '',
    'f-tipe': edit ? product.tipe_kode : '',
    'f-seri': edit ? product.nomor_seri : '',
    'f-tahun': edit ? product.tahun_pembuatan || '' : '',
    'f-input': edit ? product.input : '',
    'f-output': edit ? product.output : '',
    'f-frekuensi': edit ? product.frekuensi : '',
    'f-socket': edit ? product.jumlah_socket || '' : '',
    'f-range': edit ? product.range_daya : '',
    'f-soft': edit ? product.soft_fuse_protection : '',
    'f-hard': edit ? product.hard_fuse_protection : '',
    'f-ground': edit ? product.ground_output : '',
    'f-tambahan': edit ? product.tambahan_optional : '',
  };

  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  // Disable nomor_seri when editing
  document.getElementById('f-seri').disabled = edit;

  // Show existing images
  if (edit) {
    ['depan', 'kanan', 'kiri', 'belakang'].forEach(slot => {
      const url = product[`gambar_${slot}`];
      if (url) {
        existingUrls[slot] = url;
        const prev = document.getElementById(`prev-${slot}`);
        prev.src = url;
        prev.classList.add('visible');
        const badge = document.getElementById(`badge-${slot}`);
        badge.textContent = 'Existing';
        badge.style.display = 'block';
      }
    });
  }
}

async function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const slot = e.target.dataset.slot;
  const prev = document.getElementById(`prev-${slot}`);
  const badge = document.getElementById(`badge-${slot}`);

  badge.textContent = 'Compressing...';
  badge.style.display = 'block';

  try {
    const blob = await compressToWebP(file);
    pendingImages[slot] = blob;

    const url = URL.createObjectURL(blob);
    prev.src = url;
    prev.classList.add('visible');

    const origKB = (file.size / 1024).toFixed(0);
    const newKB = (blob.size / 1024).toFixed(0);
    const saving = Math.round((1 - blob.size / file.size) * 100);
    badge.textContent = `${newKB}kB (-${saving}%) WebP`;
  } catch (err) {
    badge.textContent = 'Error';
    showToast('Gagal compress gambar: ' + err.message, 'error');
  }
}

async function onSubmitForm(e) {
  e.preventDefault();

  const nomor_seri = document.getElementById('f-seri').value.trim();
  const nama_produk = document.getElementById('f-nama').value.trim();

  if (!nomor_seri) { showToast('Nomor seri wajib diisi', 'error'); return; }
  if (!nama_produk) { showToast('Nama produk wajib diisi', 'error'); return; }

  const btn = document.getElementById('btn-save');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    // Upload new images
    const imageUrls = {};
    for (const slot of ['depan', 'kanan', 'kiri', 'belakang']) {
      if (pendingImages[slot]) {
        const file = new File([pendingImages[slot]], `${slot}.webp`, { type: 'image/webp' });
        imageUrls[`gambar_${slot}`] = await uploadImage(file, nomor_seri, slot);
      } else if (existingUrls[slot]) {
        imageUrls[`gambar_${slot}`] = existingUrls[slot];
      } else {
        imageUrls[`gambar_${slot}`] = null;
      }
    }

    const payload = {
      nomor_seri,
      nama_produk,
      tipe_kode: document.getElementById('f-tipe').value.trim() || null,
      tahun_pembuatan: parseInt(document.getElementById('f-tahun').value) || null,
      input: document.getElementById('f-input').value.trim() || null,
      output: document.getElementById('f-output').value.trim() || null,
      frekuensi: document.getElementById('f-frekuensi').value.trim() || null,
      jumlah_socket: parseInt(document.getElementById('f-socket').value) || null,
      range_daya: document.getElementById('f-range').value.trim() || null,
      soft_fuse_protection: document.getElementById('f-soft').value.trim() || null,
      hard_fuse_protection: document.getElementById('f-hard').value.trim() || null,
      ground_output: document.getElementById('f-ground').value.trim() || null,
      tambahan_optional: document.getElementById('f-tambahan').value.trim() || null,
      ...imageUrls,
    };

    if (isEdit) {
      await updateProduct(nomor_seri, payload);
      showToast('Produk berhasil diperbarui', 'success');
    } else {
      await createProduct(payload);
      showToast('Produk berhasil ditambahkan', 'success');
    }

    await loadProducts();
    switchMode('list');
  } catch (err) {
    showToast('Gagal: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Produk';
  }
}

// ── DELETE ───────────────────────────────────────────────────
function confirmDelete(nomor_seri) {
  showConfirmModal({
    title: 'Hapus Produk?',
    message: `Produk <strong>${nomor_seri}</strong> akan dihapus permanen beserta semua gambarnya.`,
    confirmText: 'Ya, Hapus',
    onConfirm: async () => {
      try {
        await deleteProductImages(nomor_seri).catch(() => { });
        await deleteProduct(nomor_seri);
        showToast('Produk dihapus', 'success');
        allProducts = allProducts.filter(p => p.nomor_seri !== nomor_seri);
        filteredProducts = filteredProducts.filter(p => p.nomor_seri !== nomor_seri);
        renderTable();
        if (currentMode !== 'list') switchMode('list');
      } catch (err) {
        showToast('Gagal hapus: ' + err.message, 'error');
      }
    },
  });
}

// ── DETAIL (Public Design Parity) ───────────────────────────
function renderDetail(p) {
  // 1. Cover Image
  const coverWrap = document.getElementById('detail-cover-wrap');
  const coverImg = document.getElementById('detail-cover-img');
  if (p.gambar_depan) {
    coverWrap.style.display = 'block';
    coverImg.src = p.gambar_depan;
  } else {
    coverWrap.style.display = 'none';
  }

  // 2. Basic Info
  const prodType = document.getElementById('detail-prod-type');
  if (p.tipe_kode) {
    prodType.style.display = 'block';
    prodType.textContent = p.tipe_kode;
  } else {
    prodType.style.display = 'none';
  }
  document.getElementById('detail-prod-name').textContent = p.nama_produk;

  // 3. Info Grid (Public Style)
  const fields = [
    { k: 'NOMOR SERI', v: p.nomor_seri, mono: true },
    { k: 'TIPE / KODE', v: p.tipe_kode },
    { k: 'TAHUN PEMBUATAN', v: p.tahun_pembuatan },
    { k: 'INPUT', v: p.input },
    { k: 'OUTPUT', v: p.output },
    { k: 'FREKUENSI', v: p.frekuensi },
    { k: 'JUMLAH SOCKET', v: p.jumlah_socket },
    { k: 'RANGE DAYA', v: p.range_daya },
    { k: 'SOFT FUSE', v: p.soft_fuse_protection },
    { k: 'HARD FUSE', v: p.hard_fuse_protection },
    { k: 'GROUND OUTPUT', v: p.ground_output },
  ];

  document.getElementById('detail-info-grid').innerHTML = fields.map(f => `
    <div class="info-item">
      <div class="info-key">${f.k}</div>
      <div class="info-val ${f.mono ? 'mono' : ''}">${f.v || '—'}</div>
    </div>
  `).join('');

  // 4. Tambahan
  const tambahanWrap = document.getElementById('detail-tambahan-wrap');
  if (p.tambahan_optional) {
    tambahanWrap.style.display = 'block';
    document.getElementById('detail-tambahan').textContent = p.tambahan_optional;
  } else {
    tambahanWrap.style.display = 'none';
  }

  // 5. QR Code
  const qrBox = document.getElementById('detail-qr-box');
  qrBox.innerHTML = '';
  const publicUrl = `https://qr.zanxa.site/p/${p.nomor_seri}`;
  generateQRCode(qrBox, publicUrl, { width: 90, height: 90 });
  document.getElementById('detail-qr-nomor').textContent = p.nomor_seri;
  document.getElementById('detail-qr-url').textContent = publicUrl;

  // 6. Gallery
  const slots = [
    { id: 'depan', label: 'Tampak Depan' },
    { id: 'kanan', label: 'Sisi Kanan' },
    { id: 'kiri', label: 'Sisi Kiri' },
    { id: 'belakang', label: 'Tampak Belakang' }
  ];
  const hasPhotos = slots.some(s => p[`gambar_${s.id}`]);
  const gallerySection = document.getElementById('detail-gallery-section');

  if (hasPhotos) {
    gallerySection.style.display = 'block';
    document.getElementById('detail-gallery-grid').innerHTML = slots.map(s => {
      const url = p[`gambar_${s.id}`];
      if (!url) return '';
      return `
        <div class="gallery-item" onclick="window.open('${url}', '_blank')">
          <img class="gallery-img" src="${url}" alt="${s.label}" loading="lazy">
          <div class="gallery-label">${s.label}</div>
        </div>`;
    }).join('');
  } else {
    gallerySection.style.display = 'none';
  }
}
