/* ====================================================
   NAVIGATION
==================================================== */
let currentPage = 'dashboard';

function goTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));

    const pg = document.getElementById('pg-' + page);
    const nb = document.querySelector('.nav-btn[data-pg="' + page + '"]');
    if (pg) pg.classList.add('active');
    if (nb) nb.classList.add('on');

    currentPage = page;

    if (page === 'dashboard') renderDash();
    if (page === 'stopwatch') { updateSwDisplay(); renderRecentLogs(); }
    if (page === 'evaluasi') renderEval();
    if (page === 'catatan') renderCatatan();
    // setting page is static, no render needed
}

/* ====================================================
   BOOT / INIT
==================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // ── Set header date ──
    const now = new Date();
    const DN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const MN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const hg = document.getElementById('hgreet');
    const hd = document.getElementById('hdate');
    if (hg) hg.textContent = 'Hari ini, ' + DN[now.getDay()];
    if (hd) hd.textContent = now.getDate() + ' ' + MN[now.getMonth()] + ' ' + now.getFullYear();

    // ── Navigation ──
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => goTo(btn.dataset.pg));
    });

    // ── Stopwatch tick → only update current visible page ──
    SW.onTick(p => {
        if (currentPage === 'dashboard') updateDashSW();
        if (currentPage === 'stopwatch') updateSwDisplay();
    });
    SW.start();

    // ── FAB ──
    document.getElementById('fab').addEventListener('click', () => {
        openForm({
            onSave: () => {
                renderDash();
                if (currentPage === 'stopwatch') renderRecentLogs();
                if (currentPage === 'evaluasi') renderEval();
                if (currentPage === 'catatan') renderCatatan();
            }
        });
    });

    // ── Relapse button ──
    document.getElementById('btn-relapse').addEventListener('click', () => {
        openForm({
            onSave: () => {
                renderRecentLogs();
                renderDash();
                showToast('📌 Relaps tercatat. Bangkit lagi! 💪');
            }
        });
    });

    // ── SW page add ──
    document.getElementById('sw-add').addEventListener('click', () => {
        openForm({
            onSave: () => { renderRecentLogs(); renderDash(); }
        });
    });

    // ── Chart mode toggles ──
    document.querySelectorAll('.tgl').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tgl').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            chartMode = btn.dataset.mode;
            renderBarChart(chartMode);
        });
    });

    // ── Calendar nav ──
    document.getElementById('cal-prev').addEventListener('click', () => {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        buildCalendar(calYear, calMonth);
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        buildCalendar(calYear, calMonth);
    });

    // ── Settings ──
    document.getElementById('do-export').addEventListener('click', () => {
        DB.exportBackup();
        showToast('📤 Data berhasil diekspor!');
    });

    const impFile = document.getElementById('imp-file');
    document.getElementById('do-import').addEventListener('click', () => impFile.click());
    impFile.addEventListener('change', async e => {
        const f = e.target.files[0];
        if (!f) return;
        try {
            await DB.importBackup(f);
            showToast('📥 Data berhasil diimpor!');
            renderDash();
        } catch {
            showToast('⚠️ Format file tidak valid!');
        }
        e.target.value = '';
    });

    // ── Initial render ──
    goTo('dashboard');
});
