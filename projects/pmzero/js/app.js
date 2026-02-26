/**
 * app.js — Main application controller
 * Page rendering, navigation, initialization
 */

const App = (() => {
  let currentPage = 'dashboard';
  let chartMode = 'day';
  let calMonth, calYear;
  let swTickCallback = null;

  const QUOTES = [
    { text: "Setiap hari adalah kesempatan baru untuk menjadi versi lebih baik dari dirimu.", src: "Refleksi Harian" },
    { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", src: "Jim Rohn" },
    { text: "Kekuatan bukan tentang tidak pernah jatuh, tapi tentang bangkit setiap kali jatuh.", src: "Anonim" },
    { text: "Tubuhmu adalah rumahmu. Jaga dan hormati ia dengan baik.", src: "Refleksi" },
    { text: "Perubahan tidak terjadi dalam semalam. Tapi setiap keputusan baik membangun pondasinya.", src: "Anonim" },
    { text: "Kamu tidak harus sempurna untuk melangkah maju. Cukup jujur dengan dirimu sendiri.", src: "Refleksi" },
  ];

  // ===== NAVIGATION =====
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    currentPage = page;

    if (page === 'dashboard') renderDashboard();
    if (page === 'stopwatch') renderStopwatchPage();
    if (page === 'evaluasi') renderEvaluasi();
    if (page === 'catatan') renderCatatan();
    if (page === 'setting') renderSetting();
  }

  // ===== DASHBOARD =====
  function renderDashboard() {
    const el = id => document.getElementById(id);

    // update stopwatch display
    updateDashboardSW();

    // week strip
    renderWeekStrip();

    // stats
    const records = DB.getAllRecords();
    const today = DB.todayStr();
    const d = new Date(today);
    const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const monthCount = records.filter(r => r.date >= monthStart && r.date <= today).length;

    // streak
    const streaks = DB.getStreakRecords();
    const currentStreak = streaks.find(s => s.label === 'Streak saat ini') || { days: 0 };

    if (el('stat-streak')) el('stat-streak').textContent = currentStreak.days;
    if (el('stat-month')) el('stat-month').textContent = monthCount;

    // quote
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    if (el('quote-text')) el('quote-text').textContent = q.text;
    if (el('quote-src')) el('quote-src').textContent = `— ${q.src}`;
  }

  function updateDashboardSW() {
    const ms = Stopwatch.getElapsedMs();
    const { days, hr, min, sec } = Stopwatch.msToParts(ms);
    const pad = Stopwatch.pad;
    const el = id => document.getElementById(id);
    if (el('hw-days')) el('hw-days').textContent = pad(days);
    if (el('hw-hr')) el('hw-hr').textContent = pad(hr);
    if (el('hw-min')) el('hw-min').textContent = pad(min);
    if (el('hw-sec')) el('hw-sec').textContent = pad(sec);

    const last = DB.getLastRelapseTs();
    if (el('hero-sub')) {
      if (last) {
        const d = new Date(last);
        el('hero-sub').textContent = `Terakhir relaps: ${UI.formatDateLabel(DB.fmtDate(d))} · Pukul ${formatTime(d)}`;
      } else {
        el('hero-sub').textContent = 'Belum ada catatan relaps — tetap semangat! 💪';
      }
    }
  }

  function formatTime(d) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function renderWeekStrip() {
    const strip = document.getElementById('week-strip');
    if (!strip) return;

    const today = new Date();
    const todayStr = DB.fmtDate(today);
    const days = [];

    // show 14 days centered on today
    for (let i = -7; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    strip.innerHTML = '';

    days.forEach(d => {
      const ds = DB.fmtDate(d);
      const count = DB.getCountForDate(ds);
      const cls = UI.intensityClass(count);
      const isToday = ds === todayStr;

      const cell = document.createElement('div');
      cell.className = `day-cell${isToday ? ' today' : ''}`;
      cell.innerHTML = `
        <div class="day-label">${DAYS_SHORT[d.getDay()]}</div>
        <div class="day-num ${cls}${isToday ? ' today-cell' : ''}">${d.getDate()}</div>
        <div class="day-dot"></div>
      `;
      cell.addEventListener('click', () => {
        UI.openDateSheet(ds, { onSave: renderDashboard });
      });
      strip.appendChild(cell);
    });

    // scroll to today
    setTimeout(() => {
      const strip2 = document.getElementById('week-strip');
      if (strip2) {
        const todayEl = strip2.querySelector('.today .day-num');
        if (todayEl) todayEl.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  // ===== STOPWATCH PAGE =====
  function renderStopwatchPage() {
    updateSwPage();
    loadRecentLogs();
  }

  function updateSwPage() {
    const ms = Stopwatch.getElapsedMs();
    const { days, hr, min, sec } = Stopwatch.msToParts(ms);
    const pad = Stopwatch.pad;
    const el = id => document.getElementById(id);

    if (el('sw-days')) el('sw-days').textContent = days;
    if (el('sw-hr')) el('sw-hr').textContent = pad(hr);
    if (el('sw-min')) el('sw-min').textContent = pad(min);
    if (el('sw-sec')) el('sw-sec').textContent = pad(sec);
  }

  function loadRecentLogs() {
    const container = document.getElementById('recent-logs');
    if (!container) return;
    container.innerHTML = '';

    const records = DB.getAllRecords().slice().reverse().slice(0, 5);
    if (records.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-text">Belum ada catatan relaps.<br>Pertahankan streak-mu!</div></div>`;
      return;
    }
    records.forEach(r => {
      const card = UI.renderLogCard(r, {
        onDelete: () => { loadRecentLogs(); renderDashboard(); },
        onEdit: rec => {
          UI.openPmoFormSheet({
            date: rec.date, time: rec.time, existingRec: rec,
            onSave: () => { loadRecentLogs(); renderDashboard(); }
          });
        }
      });
      container.appendChild(card);
    });
  }

  // ===== EVALUASI =====
  function renderEvaluasi() {
    const now = new Date();
    if (calMonth == null) calMonth = now.getMonth();
    if (calYear == null) calYear = now.getFullYear();

    renderCalendar(calYear, calMonth);
    renderBarChart();
    Charts.renderStreakBars('streak-bars');
  }

  function renderCalendar(year, month) {
    const el = id => document.getElementById(id);
    const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (el('cal-title')) el('cal-title').textContent = `${MONTHS[month]} ${year}`;

    const grid = el('cal-grid');
    if (!grid) return;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = DB.todayStr();

    grid.innerHTML = '';
    // empty cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = DB.getCountForDate(ds);
      const cls = UI.intensityClass(count);
      const isToday = ds === todayStr;

      const cell = document.createElement('div');
      cell.className = `cal-day ${cls}${isToday ? ' cal-today' : ''}`;
      cell.textContent = d;
      cell.addEventListener('click', () => {
        UI.openDateSheet(ds, { onSave: () => { renderCalendar(calYear, calMonth); renderBarChart(); } });
      });
      grid.appendChild(cell);
    }
  }

  function renderBarChart() {
    const data = DB.getChartData(chartMode);
    Charts.renderBarChart('bar-chart', data);
  }

  // ===== CATATAN PAGE =====
  function renderCatatan() {
    Charts.renderDonutCard('donut-tempat', 'svg-tempat', 'leg-tempat', DB.getTagFrequency('tempat'));
    Charts.renderDonutCard('donut-waktu', 'svg-waktu', 'leg-waktu', DB.getTagFrequency('waktu'));
    Charts.renderDonutCard('donut-media', 'svg-media', 'leg-media', DB.getTagFrequency('media'));
  }

  // ===== SETTING =====
  function renderSetting() {
    // already static HTML, just bind events if not bound
    const exportBtn = document.getElementById('btn-export');
    const importBtn = document.getElementById('btn-import');
    const importInput = document.getElementById('import-input');

    if (exportBtn && !exportBtn.dataset.bound) {
      exportBtn.dataset.bound = '1';
      exportBtn.addEventListener('click', () => {
        DB.exportData();
        UI.showToast('📤 Data berhasil diekspor!');
      });
    }
    if (importBtn && !importBtn.dataset.bound) {
      importBtn.dataset.bound = '1';
      importBtn.addEventListener('click', () => importInput?.click());
    }
    if (importInput && !importInput.dataset.bound) {
      importInput.dataset.bound = '1';
      importInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          await DB.importData(file);
          UI.showToast('📥 Data berhasil diimpor!');
          renderDashboard();
        } catch {
          UI.showToast('⚠️ Format file tidak valid!');
        }
        e.target.value = '';
      });
    }
  }

  // ===== INIT =====
  function init() {
    // bind nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // global stopwatch tick
    Stopwatch.onTick((ms, parts) => {
      if (currentPage === 'dashboard') updateDashboardSW();
      if (currentPage === 'stopwatch') updateSwPage();
    });
    Stopwatch.start();

    // FAB add button
    const fab = document.getElementById('fab-add');
    if (fab) {
      fab.addEventListener('click', () => {
        UI.openPmoFormSheet({
          onSave: () => {
            renderDashboard();
            if (currentPage === 'stopwatch') loadRecentLogs();
          }
        });
      });
    }

    // Relapse button on stopwatch page
    document.getElementById('relapse-btn')?.addEventListener('click', () => {
      UI.openPmoFormSheet({
        onSave: (saved) => {
          Stopwatch.reset();
          loadRecentLogs();
          renderDashboard();
          UI.showToast('📌 Relaps tercatat. Bangkit lagi! 💪');
        }
      });
    });

    // Chart toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chartMode = btn.dataset.mode;
        renderBarChart();
      });
    });

    // Calendar nav
    document.getElementById('cal-prev')?.addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar(calYear, calMonth);
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar(calYear, calMonth);
    });

    // start on dashboard
    navigate('dashboard');
  }

  return { init, navigate, renderDashboard, loadRecentLogs };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
