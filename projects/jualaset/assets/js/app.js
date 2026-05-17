// PRT – Property Catalog App
// ==========================================

const App = (() => {
  let allProps = [];
  let currentPage = 'home';
  let darkMode = false;
  let sortOrder = 'cheapest';
  let modalProp = null;
  let galleryIndex = 0;

  // ── Formatters ──────────────────────────────────────────
  const fmt = {
    price: (n) => {
      if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'M';
      if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + ' Jt';
      return 'Rp ' + n.toLocaleString('id-ID');
    },
    pricePerM: (p, s) => {
      const ppm = Math.round(p / s);
      return 'Rp ' + Math.round(ppm / 1000).toLocaleString('id-ID') + ' rb/m²';
    },
    size: (s) => s + ' m²',
    wa: (prop) => {
      const msg = encodeURIComponent(`Halo, saya tertarik dengan properti:\n\n*${prop.title}*\nHarga: ${fmt.price(prop.price)}\nLokasi: ${prop.location}\n\nBoleh info lebih lanjut?`);
      return `https://wa.me/${prop.whatsapp}?text=${msg}`;
    }
  };

  // ── Data Loading ─────────────────────────────────────────
  const loadData = async () => {
    const res = await fetch('assets/data/properties.json');
    allProps = await res.json();
    allProps = allProps.map(p => ({
      ...p,
      pricePerMeter: Math.round(p.price / p.landSize)
    }));
    render();
  };

  // ── Sorting ───────────────────────────────────────────────
  const sorted = (arr) => {
    const a = [...arr];
    if (sortOrder === 'cheapest') return a.sort((x, y) => x.price - y.price);
    if (sortOrder === 'newest') return a.sort((x, y) => new Date(y.dateAdded) - new Date(x.dateAdded));
    if (sortOrder === 'largest') return a.sort((x, y) => y.landSize - x.landSize);
    return a;
  };

  // ── Recommendations ───────────────────────────────────────
  const getReco = () => {
    const termurah = [...allProps].sort((a, b) => a.price - b.price).slice(0, 5);
    const terworth = [...allProps].sort((a, b) => a.pricePerMeter - b.pricePerMeter).slice(0, 5);
    const terluas = [...allProps].sort((a, b) => b.landSize - a.landSize).slice(0, 5);
    return { termurah, terworth, terluas };
  };

  // ── Card HTML ─────────────────────────────────────────────
  const recoCardHTML = (p) => `
    <div class="reco-card" onclick="App.openModal(${p.id})">
      <img class="reco-card-img" src="${p.images[0]}" alt="${p.title}" loading="lazy">
      <div class="reco-card-body">
        <div class="reco-card-price">${fmt.price(p.price)}</div>
        <div class="reco-card-meta">${p.landSize} m² · ${fmt.pricePerM(p.price, p.landSize)}</div>
        <div class="reco-card-loc">📍 ${p.location}</div>
      </div>
    </div>`;

  const propCardHTML = (p) => `
    <div class="prop-card" onclick="App.openModal(${p.id})">
      <div class="prop-card-img-wrap">
        <img class="prop-card-img" src="${p.images[0]}" alt="${p.title}" loading="lazy">
        <span class="prop-type-badge">${p.type === 'kavling' ? '🌿 Kavling' : '🏠 Rumah'}</span>
        <span class="prop-status-badge">${p.status}</span>
      </div>
      <div class="prop-card-body">
        <div class="prop-card-price">${fmt.price(p.price)}</div>
        <div class="prop-card-title">${p.title}</div>
        <div class="prop-stats">
          <div class="prop-stat">
            <span class="prop-stat-val">${p.landSize} m²</span>
            <span class="prop-stat-lbl">Luas Tanah</span>
          </div>
          <div class="prop-stat">
            <span class="prop-stat-val">${Math.round(p.pricePerMeter / 1000)}rb</span>
            <span class="prop-stat-lbl">per m²</span>
          </div>
          ${p.buildingSize ? `<div class="prop-stat">
            <span class="prop-stat-val">${p.buildingSize} m²</span>
            <span class="prop-stat-lbl">Bangunan</span>
          </div>` : `<div class="prop-stat">
            <span class="prop-stat-val">${p.type === 'kavling' ? '—' : '—'}</span>
            <span class="prop-stat-lbl">KT</span>
          </div>`}
        </div>
        <div class="prop-card-loc">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${p.location}
        </div>
      </div>
    </div>`;

  // ── Render Pages ──────────────────────────────────────────
  const renderHome = () => {
    const reco = getReco();
    const all = sorted(allProps);

    document.getElementById('reco-termurah').innerHTML = reco.termurah.map(recoCardHTML).join('');
    document.getElementById('reco-terworth').innerHTML = reco.terworth.map(recoCardHTML).join('');
    document.getElementById('reco-terluas').innerHTML = reco.terluas.map(recoCardHTML).join('');
    document.getElementById('home-grid').innerHTML = all.map(propCardHTML).join('');
    document.getElementById('topbar-count').textContent = allProps.length + ' properti';
  };

  const renderFilteredPage = (type, containerId, searchId) => {
    const query = (document.getElementById(searchId)?.value || '').toLowerCase();
    const minHarga = parseInt(document.getElementById(type + '-min-harga')?.value) * 1e6 || 0;
    const maxHarga = parseInt(document.getElementById(type + '-max-harga')?.value) * 1e6 || Infinity;
    const minLuas = parseInt(document.getElementById(type + '-min-luas')?.value) || 0;
    const maxPpm = parseInt(document.getElementById(type + '-max-ppm')?.value) * 1000 || Infinity;

    let filtered = allProps.filter(p => {
      if (p.type !== type) return false;
      if (query && !p.location.toLowerCase().includes(query) && !p.title.toLowerCase().includes(query)) return false;
      if (p.price < minHarga || p.price > maxHarga) return false;
      if (p.landSize < minLuas) return false;
      if (p.pricePerMeter > maxPpm) return false;
      return true;
    });

    filtered = sorted(filtered);

    const container = document.getElementById(containerId);
    const countEl = document.getElementById(type + '-count');

    if (countEl) countEl.textContent = filtered.length + ' properti ditemukan';

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p>Tidak ada properti yang cocok</p>
      </div>`;
    } else {
      container.innerHTML = filtered.map(propCardHTML).join('');
    }
  };

  const render = () => {
    if (currentPage === 'home') renderHome();
    if (currentPage === 'kavling') renderFilteredPage('kavling', 'kavling-grid', 'kavling-search');
    if (currentPage === 'rumah') renderFilteredPage('rumah', 'rumah-grid', 'rumah-search');
  };

  // ── Navigation ────────────────────────────────────────────
  const navigate = (page) => {
    currentPage = page;
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('page-' + page)?.classList.add('active');
    document.querySelector('[data-page="' + page + '"]')?.classList.add('active');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Modal ─────────────────────────────────────────────────
  const openModal = (id) => {
    const p = allProps.find(x => x.id === id);
    if (!p) return;
    modalProp = p;
    galleryIndex = 0;

    const overlay = document.getElementById('modal-overlay');

    // Gallery
    const track = document.getElementById('gallery-track');
    track.innerHTML = p.images.map(src => `<img class="modal-gallery-img" src="${src}" alt="">`).join('');

    const dots = document.getElementById('gallery-dots');
    dots.innerHTML = p.images.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="App.setGallery(${i})"></div>`).join('');

    document.getElementById('modal-price').textContent = fmt.price(p.price);
    document.getElementById('modal-title').textContent = p.title;

    // Stats
    document.getElementById('modal-stat-luas').textContent = fmt.size(p.landSize);
    document.getElementById('modal-stat-ppm').textContent = fmt.pricePerM(p.price, p.landSize);
    document.getElementById('modal-stat-building').textContent = p.buildingSize ? fmt.size(p.buildingSize) : '—';
    document.getElementById('modal-stat-building-lbl').textContent = p.buildingSize ? 'Luas Bangunan' : (p.bedrooms ? p.bedrooms + ' KT' : 'Tipe');

    document.getElementById('modal-location').textContent = p.locationFull;
    document.getElementById('modal-status').textContent = p.status;
    document.getElementById('modal-legality').textContent = p.legality;
    document.getElementById('modal-road').textContent = p.roadAccess;
    document.getElementById('modal-potential').textContent = p.potential;
    document.getElementById('modal-desc').textContent = p.description;

    document.getElementById('wa-btn').onclick = () => window.open(fmt.wa(p), '_blank');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  };

  const setGallery = (i) => {
    if (!modalProp) return;
    galleryIndex = Math.max(0, Math.min(i, modalProp.images.length - 1));
    document.getElementById('gallery-track').style.transform = `translateX(-${galleryIndex * 100}%)`;
    document.querySelectorAll('.gallery-dot').forEach((d, idx) => {
      d.classList.toggle('active', idx === galleryIndex);
    });
  };

  const prevGallery = () => setGallery(galleryIndex - 1);
  const nextGallery = () => setGallery(galleryIndex + 1);

  // ── Settings ──────────────────────────────────────────────
  const toggleDark = (val) => {
    darkMode = val;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('prt-dark', darkMode ? '1' : '0');
  };

  const setSort = (val) => {
    sortOrder = val;
    localStorage.setItem('prt-sort', val);
    render();
  };

  const resetAll = () => {
    ['kavling', 'rumah'].forEach(t => {
      ['min-harga', 'max-harga', 'min-luas', 'max-ppm'].forEach(k => {
        const el = document.getElementById(t + '-' + k);
        if (el) el.value = '';
      });
      const s = document.getElementById(t + '-search');
      if (s) s.value = '';
    });
    render();
  };

  // ── Filter Panels ─────────────────────────────────────────
  const toggleFilter = (type) => {
    const panel = document.getElementById(type + '-filter-panel');
    panel.classList.toggle('open');
    const chip = document.getElementById(type + '-filter-chip');
    chip.classList.toggle('active', panel.classList.contains('open'));
  };

  // ── Init ──────────────────────────────────────────────────
  const init = () => {
    // Load preferences
    const savedDark = localStorage.getItem('prt-dark');
    const savedSort = localStorage.getItem('prt-sort');
    if (savedDark === '1') {
      darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      const tog = document.getElementById('dark-toggle');
      if (tog) tog.checked = true;
    }
    if (savedSort) {
      sortOrder = savedSort;
      const sel = document.getElementById('sort-select');
      if (sel) sel.value = sortOrder;
    }

    loadData();

    // Modal close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
  };

  return { init, navigate, openModal, closeModal, setGallery, prevGallery, nextGallery, toggleDark, setSort, resetAll, toggleFilter, renderFilteredPage };
})();

document.addEventListener('DOMContentLoaded', App.init);
