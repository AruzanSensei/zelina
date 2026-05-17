/* ====================================================
   PAGE RENDERS
==================================================== */
const QUOTES = [
    { t: 'Setiap hari adalah kesempatan baru untuk menjadi versi lebih baik dari dirimu.', s: 'Refleksi Harian' },
    { t: 'Disiplin adalah jembatan antara tujuan dan pencapaian.', s: 'Jim Rohn' },
    { t: 'Kekuatan bukan tentang tidak pernah jatuh, tapi tentang bangkit setiap kali jatuh.', s: 'Anonim' },
    { t: 'Tubuhmu adalah rumahmu. Jaga dan hormati ia dengan baik.', s: 'Refleksi' },
    { t: 'Perubahan tidak terjadi dalam semalam, tapi setiap keputusan baik membangun pondasinya.', s: 'Anonim' },
    { t: 'Kamu tidak harus sempurna untuk melangkah maju. Cukup jujur dengan dirimu sendiri.', s: 'Refleksi' },
    { t: 'Setiap nafas adalah peluang untuk memulai lagi. Jangan menyerah.', s: 'Anonim' },
];

// Pick quote once per day (not random on each render)
function getTodayQuote() {
    const idx = new Date().getDate() % QUOTES.length;
    return QUOTES[idx];
}

/* ── DASHBOARD ── */
function updateDashSW() {
    const p = SW.getParts();
    const el = id => document.getElementById(id);
    if (el('h-d')) el('h-d').textContent = pad2(p.days);
    if (el('h-h')) el('h-h').textContent = pad2(p.hr);
    if (el('h-m')) el('h-m').textContent = pad2(p.min);
    if (el('h-s')) el('h-s').textContent = pad2(p.sec);

    const lastTs = DB.lastRelapsTs();
    const sinceEl = document.getElementById('h-since');
    if (sinceEl) {
        if (lastTs) {
            const d = new Date(lastTs);
            sinceEl.textContent =
                'Terakhir relaps: ' + fmtFull(dateToStr(d)) +
                ' · ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
        } else {
            sinceEl.textContent = 'Belum ada catatan relaps — tetap semangat! 💪';
        }
    }
}

function buildWeekStrip() {
    const strip = document.getElementById('wstrip');
    if (!strip) return;
    const today = new Date();
    const ts = dateToStr(today);
    const DN = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    strip.innerHTML = '';

    for (let i = -7; i <= 6; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const ds = dateToStr(d);
        const cnt = DB.countOn(ds);
        const cls = pmoClass(cnt);
        const isT = ds === ts;

        const cell = document.createElement('div');
        cell.className = 'dc' + (isT ? ' today' : '');
        cell.innerHTML = `
      <div class="dc-lbl">${DN[d.getDay()]}</div>
      <div class="dc-box${cls ? ' ' + cls : ''}${isT ? ' today-ring' : ''}">${d.getDate()}</div>
      <div class="dc-dot"></div>`;

        cell.addEventListener('click', () => {
            openDateSheet(ds, { onSave: renderDash });
        });
        strip.appendChild(cell);
    }

    // scroll today into view gently
    const todayEl = strip.querySelector('.today');
    if (todayEl) {
        requestAnimationFrame(() => {
            try { todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (e) { }
        });
    }
}

function renderDash() {
    updateDashSW();
    buildWeekStrip();

    const all = DB.all();
    const td = todayStr();
    const mStart = td.slice(0, 7) + '-01';
    const mCount = all.filter(r => r.date >= mStart && r.date <= td).length;

    const streaks = DB.streaks();
    const curStreak = (streaks.find(s => s.label === 'Streak saat ini') || { days: 0 }).days;

    const g = id => document.getElementById(id);
    if (g('s-streak')) g('s-streak').textContent = curStreak;
    if (g('s-month')) g('s-month').textContent = mCount;

    // quote is stable per day
    const q = getTodayQuote();
    if (g('qtxt')) g('qtxt').textContent = q.t;
    if (g('qsrc')) g('qsrc').textContent = '— ' + q.s;
}

/* ── STOPWATCH PAGE ── */
function updateSwDisplay() {
    const p = SW.getParts();
    const el = id => document.getElementById(id);
    if (el('sw-d')) el('sw-d').textContent = p.days;
    if (el('sw-h')) el('sw-h').textContent = pad2(p.hr);
    if (el('sw-m')) el('sw-m').textContent = pad2(p.min);
    if (el('sw-s')) el('sw-s').textContent = pad2(p.sec);
}

function renderRecentLogs() {
    const c = document.getElementById('recent-logs');
    if (!c) return;
    c.innerHTML = '';

    const recs = DB.all().slice().reverse().slice(0, 8);

    if (!recs.length) {
        c.innerHTML = '<div class="empty"><div class="empty-ico">🎉</div><div class="empty-txt">Belum ada catatan relaps.<br>Pertahankan streak-mu!</div></div>';
        return;
    }

    recs.forEach(r => {
        c.appendChild(buildLogCard(r, {
            onDel: () => { renderRecentLogs(); renderDash(); },
            onEdit: rec => openForm({
                date: rec.date, time: rec.time, rec,
                onSave: () => { renderRecentLogs(); renderDash(); }
            })
        }));
    });
}

/* ── EVALUASI ── */
let calYear = null, calMonth = null, chartMode = 'day';

function buildCalendar(y, m) {
    const MN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const mEl = document.getElementById('cal-month');
    if (mEl) mEl.textContent = MN[m] + ' ' + y;

    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMon = new Date(y, m + 1, 0).getDate();
    const ts = todayStr();

    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const e = document.createElement('div'); e.className = 'cal-d ce';
        grid.appendChild(e);
    }

    for (let d = 1; d <= daysInMon; d++) {
        const ds = y + '-' + pad2(m + 1) + '-' + pad2(d);
        const cnt = DB.countOn(ds);
        const cls = pmoClass(cnt);
        const isT = ds === ts;

        const cell = document.createElement('div');
        cell.className = 'cal-d' + (cls ? ' ' + cls : '') + (isT ? ' today' : '');
        cell.textContent = d;

        cell.addEventListener('click', () => {
            openDateSheet(ds, {
                onSave: () => {
                    buildCalendar(calYear, calMonth);
                    renderBarChart(chartMode);
                    renderStreaks();
                }
            });
        });
        grid.appendChild(cell);
    }
}

function renderEval() {
    const now = new Date();
    if (calYear === null) calYear = now.getFullYear();
    if (calMonth === null) calMonth = now.getMonth();
    buildCalendar(calYear, calMonth);
    renderBarChart(chartMode);
    renderStreaks();
}

/* ── CATATAN ── */
function renderCatatan() {
    renderDonut('dsvg-t', 'dleg-t', DB.tagFreq('tempat'));
    renderDonut('dsvg-w', 'dleg-w', DB.tagFreq('waktu'));
    renderDonut('dsvg-m', 'dleg-m', DB.tagFreq('media'));
}
