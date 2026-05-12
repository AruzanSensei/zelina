// scripts/admin/dashboard.js
window.initDashboard = async () => {
  await requireAuth();
  renderSidebar('dashboard');

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('sk');
    el.style.cssText = '';
    el.textContent = val;
  }

  function fmt(n) { return Number(n).toLocaleString('id-ID'); }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  try {
    const res = await getAnalytics();
    const d   = res.data;

    setVal('stat-products', fmt(d.total_products));
    setVal('stat-qr',       fmt(d.total_products));
    setVal('stat-scans',    fmt(d.total_scans));
    setVal('stat-today',    fmt(d.scans_today));

    // Recent products
    const recentEl = document.getElementById('recent-list');
    if (!d.recent_products?.length) {
      recentEl.innerHTML = '<div class="empty-state"><div class="empty-state__title">Belum ada produk</div></div>';
    } else {
      recentEl.innerHTML = '<div class="recent-list">' +
        d.recent_products.map(p => `
          <div class="recent-item">
            <div class="recent-item__main">
              <div class="recent-item__name">${p.nama_produk}</div>
              <div class="recent-item__id">${p.nomor_seri}</div>
            </div>
            <div class="recent-item__date">${fmtDate(p.created_at)}</div>
          </div>
        `).join('') + '</div>';
    }

    // Top products
    const topEl = document.getElementById('top-list');
    if (!d.top_products?.length) {
      topEl.innerHTML = '<div class="empty-state"><div class="empty-state__title">Belum ada data scan</div></div>';
    } else {
      const max = d.top_products[0]?.scan_count || 1;
      topEl.innerHTML = '<div class="rank-list">' +
        d.top_products.map((p, i) => `
          <div class="rank-item">
            <div class="rank-num">${i + 1}</div>
            <div>
              <div style="font-size:.875rem;font-weight:500;">${p.nama_produk}</div>
              <div class="rank-bar-wrap"><div class="rank-bar" style="width:${Math.round((p.scan_count/max)*100)}%"></div></div>
            </div>
            <div style="font-size:.8rem;color:var(--text-sub);font-weight:600;">${fmt(p.scan_count)}×</div>
          </div>
        `).join('') + '</div>';
    }

  } catch (e) {
    showToast('Gagal memuat data dashboard: ' + e.message, 'error');
    ['stat-products','stat-qr','stat-scans','stat-today'].forEach(id => setVal(id, '—'));
  }
};

// Execute on first load
window.initDashboard();
