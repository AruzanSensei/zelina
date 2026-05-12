// scripts/admin/products.js — CRUD Products page logic

var PAGE_SIZE = 20;
var currentMode = 'list';   // 'list' | 'form' | 'detail'
var currentProduct = null;  // product being edited/viewed
var isEdit = false;
var allProducts = [];
var filteredProducts = [];
var currentPage = 1;
var pendingImages = {};   // { slot: File }
var existingUrls  = {};   // { slot: url } from existing product

(async () => {
  await requireAuth();
  renderSidebar('products');
  await loadProducts();

  // Check ?action=create in URL
  if (new URL(location.href).searchParams.get('action') === 'create') {
    switchMode('form', null, false);
  }

  // Events: list
  document.getElementById('btn-add').addEventListener('click', () => switchMode('form', null, false));
  document.getElementById('btn-add-empty')?.addEventListener('click', () => switchMode('form', null, false));
  document.getElementById('search-input').addEventListener('input', debounce(onSearch, 300));

  // Events: form
  document.getElementById('btn-back-form').addEventListener('click', () => switchMode('list'));
  document.getElementById('btn-cancel-form').addEventListener('click', () => switchMode('list'));
  document.getElementById('product-form').addEventListener('submit', onSubmitForm);

  // Image slots
  document.querySelectorAll('.img-slot input[type=file]').forEach(input => {
    input.addEventListener('change', onFileChange);
  });

  // Events: detail
  document.getElementById('btn-back-detail').addEventListener('click', () => switchMode('list'));
  document.getElementById('btn-edit-from-detail').addEventListener('click', () => switchMode('form', currentProduct, true));
  document.getElementById('btn-delete-from-detail').addEventListener('click', () => confirmDelete(currentProduct.nomor_seri));
})();

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
  currentMode    = mode;
  currentProduct = product;
  isEdit         = edit;

  document.querySelectorAll('.mode-section').forEach(el => el.classList.remove('active'));
  document.getElementById(`mode-${mode}`).classList.add('active');
  document.getElementById('topbar-title').textContent =
    mode === 'list' ? 'Products' : mode === 'form' ? (edit ? 'Edit Produk' : 'Tambah Produk') : 'Detail Produk';

  if (mode === 'form') populateForm(product, edit);
  if (mode === 'detail' && product) renderDetail(product);
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
  const tbody   = document.getElementById('product-tbody');
  const emptyEl = document.getElementById('empty-state-list');
  const paginEl = document.getElementById('pagination');

  if (!filteredProducts.length) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('hidden');
    paginEl.innerHTML = '';
    return;
  }
  emptyEl.classList.add('hidden');

  const start  = (currentPage - 1) * PAGE_SIZE;
  const page   = filteredProducts.slice(start, start + PAGE_SIZE);
  const total  = Math.ceil(filteredProducts.length / PAGE_SIZE);

  tbody.innerHTML = page.map((p, i) => `
    <tr>
      <td style="text-align: center; color: var(--text-muted); font-weight: 500;">${start + i + 1}</td>
      <td><span style="font-family:var(--mono);font-size:.78rem;">${p.nomor_seri}</span></td>
      <td>
        <span class="truncate" style="max-width:220px;display:block;cursor:pointer;font-weight:500;"
          onclick="viewDetail('${p.nomor_seri}')">${p.nama_produk}</span>
      </td>
      <td>${p.tipe_kode || '—'}</td>
      <td>${p.tahun_pembuatan || '—'}</td>
      <td>${fmtDate(p.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-action" onclick="viewDetail('${p.nomor_seri}')">Detail</button>
          <button class="btn btn-outline btn-action" onclick="editProduct('${p.nomor_seri}')">Edit</button>
          <button class="btn btn-danger btn-action" onclick="confirmDelete('${p.nomor_seri}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Pagination
  paginEl.innerHTML = `
    <button class="pagination__btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">← Prev</button>
    <span class="pagination__info">Halaman ${currentPage} dari ${total}</span>
    <button class="pagination__btn" ${currentPage >= total ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">Next →</button>
  `;
}

function goPage(n) { currentPage = n; renderTable(); }

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
  ['depan','kanan','kiri','belakang'].forEach(slot => {
    const prev  = document.getElementById(`prev-${slot}`);
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
    'f-tipe': edit ? product.tipe_kode   : '',
    'f-seri': edit ? product.nomor_seri  : '',
    'f-tahun': edit ? product.tahun_pembuatan || '' : '',
    'f-input': edit ? product.input      : '',
    'f-output': edit ? product.output    : '',
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
    ['depan','kanan','kiri','belakang'].forEach(slot => {
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
  const slot  = e.target.dataset.slot;
  const prev  = document.getElementById(`prev-${slot}`);
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
    const newKB  = (blob.size / 1024).toFixed(0);
    const saving = Math.round((1 - blob.size / file.size) * 100);
    badge.textContent = `${newKB}kB (-${saving}%) WebP`;
  } catch (err) {
    badge.textContent = 'Error';
    showToast('Gagal compress gambar: ' + err.message, 'error');
  }
}

async function onSubmitForm(e) {
  e.preventDefault();

  const nomor_seri  = document.getElementById('f-seri').value.trim();
  const nama_produk = document.getElementById('f-nama').value.trim();

  if (!nomor_seri)  { showToast('Nomor seri wajib diisi', 'error'); return; }
  if (!nama_produk) { showToast('Nama produk wajib diisi', 'error'); return; }

  const btn = document.getElementById('btn-save');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    // Upload new images
    const imageUrls = {};
    for (const slot of ['depan','kanan','kiri','belakang']) {
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
      tipe_kode:            document.getElementById('f-tipe').value.trim()      || null,
      tahun_pembuatan:      parseInt(document.getElementById('f-tahun').value)  || null,
      input:                document.getElementById('f-input').value.trim()     || null,
      output:               document.getElementById('f-output').value.trim()    || null,
      frekuensi:            document.getElementById('f-frekuensi').value.trim() || null,
      jumlah_socket:        parseInt(document.getElementById('f-socket').value) || null,
      range_daya:           document.getElementById('f-range').value.trim()     || null,
      soft_fuse_protection: document.getElementById('f-soft').value.trim()      || null,
      hard_fuse_protection: document.getElementById('f-hard').value.trim()      || null,
      ground_output:        document.getElementById('f-ground').value.trim()    || null,
      tambahan_optional:    document.getElementById('f-tambahan').value.trim()  || null,
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
    title:       'Hapus Produk?',
    message:     `Produk <strong>${nomor_seri}</strong> akan dihapus permanen beserta semua gambarnya.`,
    confirmText: 'Ya, Hapus',
    onConfirm:   async () => {
      try {
        await deleteProductImages(nomor_seri).catch(() => {});
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

// ── DETAIL ───────────────────────────────────────────────────
function renderDetail(p) {
  document.getElementById('detail-name').textContent = p.nama_produk;
  document.getElementById('detail-seri').textContent = p.nomor_seri;

  const fields = [
    ['Tipe / Kode',   p.tipe_kode],
    ['Tahun',         p.tahun_pembuatan],
    ['Input',         p.input],
    ['Output',        p.output],
    ['Frekuensi',     p.frekuensi],
    ['Jumlah Socket', p.jumlah_socket],
    ['Range Daya',    p.range_daya],
    ['Soft Fuse',     p.soft_fuse_protection],
    ['Hard Fuse',     p.hard_fuse_protection],
    ['Ground Output', p.ground_output],
    ['Dibuat',        fmtDate(p.created_at)],
  ];

  document.getElementById('detail-info-grid').innerHTML = fields.map(([k, v]) => `
    <div class="detail-info-item">
      <div class="detail-info-key">${k}</div>
      <div class="detail-info-val">${v || '—'}</div>
    </div>
  `).join('');

  const tambahanWrap = document.getElementById('detail-tambahan-wrap');
  if (p.tambahan_optional) {
    tambahanWrap.style.display = '';
    document.getElementById('detail-tambahan').textContent = p.tambahan_optional;
  } else {
    tambahanWrap.style.display = 'none';
  }

  const slots = ['depan','kanan','kiri','belakang'];
  document.getElementById('detail-photos').innerHTML = slots.map(slot => {
    const url = p[`gambar_${slot}`];
    return `
      <div class="detail-photo-wrap">
        ${url
          ? `<img class="detail-photo" src="${url}" alt="${slot}" loading="lazy">`
          : `<div class="detail-photo" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.75rem;">No photo</div>`
        }
        <div class="detail-photo-label">${slot.toUpperCase()}</div>
      </div>`;
  }).join('');
}
