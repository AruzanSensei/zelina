// scripts/admin/analytics.js

(async () => {
  await requireAuth();
  renderSidebar('analytics');

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('sk');
    el.style.cssText = '';
    el.textContent = val;
  }

  function fmt(n) { return Number(n).toLocaleString('id-ID'); }

  try {
    const res = await getAnalytics();
    const d = res.data;

    setVal('stat-total', fmt(d.total_scans));
    setVal('stat-today', fmt(d.scans_today));
    setVal('stat-products', fmt(d.total_products));

    // Top products table 
    const wrap = document.getElementById('top-table-wrap');
    if (!wrap) return; // Prevent SPA race condition if user navigated away

    if (!d.top_products?.length) {
      wrap.innerHTML = `
        <div class="empty-state" style="padding:30px 0;">
          <div class="empty-state__title">Belum ada data scan</div>
          <div class="empty-state__sub">Scan akan tercatat saat pengguna membuka halaman produk via QR.</div>
        </div>`;
    } else {
      const total = d.total_scans || 1;
      wrap.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:40px;">Rank</th>
                <th>No. Seri</th>
                <th>Nama Produk</th>
                <th>Jumlah Scan</th>
                <th>% dari Total</th>
              </tr>
            </thead>
            <tbody>
              ${d.top_products.map((p, i) => `
                <tr>
                  <td style="font-weight:700;color:var(--text-muted);">${i + 1}</td>
                  <td><span style="font-family:var(--mono);font-size:.78rem;">${p.nomor_seri}</span></td>
                  <td>${p.nama_produk}</td>
                  <td><strong>${fmt(p.scan_count)}</strong>×</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div style="flex:1;background:var(--gray-100);border-radius:99px;height:6px;">
                        <div style="width:${Math.round((p.scan_count / total) * 100)}%;background:var(--green);border-radius:99px;height:6px;"></div>
                      </div>
                      <span style="font-size:.78rem;color:var(--text-sub);min-width:36px;">${Math.round((p.scan_count / total) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    }
  } catch (e) {
    if (document.getElementById('stat-total')) {
      showToast('Gagal memuat analytics: ' + e.message, 'error');
      ['stat-total', 'stat-today', 'stat-products'].forEach(id => setVal(id, '—'));
    }
  }
})();
