/**
 * Finance Mode — Keuangan
 * Displays income statistics by Month/Year/All with target line
 */
import { appState } from '../state.js';

// Helper to format currency string (e.g. "10000" -> "10.000")
const formatNumberStr = (str) => {
    if (!str) return '';
    const num = parseInt(String(str).replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
};

export function initFinanceMode() {
    // === DOM refs ===
    const targetInput     = document.getElementById('finance-target-input');
    const modeSwitcher    = document.getElementById('finance-mode-switcher');
    const summaryLabel    = document.getElementById('finance-summary-label');
    const amountValue     = document.getElementById('finance-amount-value');
    const summarySub      = document.getElementById('finance-summary-sub');
    const monthlyChart    = document.getElementById('finance-monthly-chart');
    const yearlyChart     = document.getElementById('finance-yearly-chart');
    const chartYearLabel  = document.getElementById('finance-chart-year');
    const yearPrevBtn     = document.getElementById('finance-year-prev');
    const yearNextBtn     = document.getElementById('finance-year-next');
    const historyList     = document.getElementById('finance-history-list');
    const historySortSel  = document.getElementById('finance-history-sort');
    const monthlyCard     = document.getElementById('finance-monthly-card');

    if (!targetInput) return; // Guard — not initialized yet

    // === State ===
    let viewMode = 'bulan';          // bulan | tahun | semua
    let selectedYear = new Date().getFullYear();

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    // === Helpers ===
    const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n));

    const getTarget = () => parseFloat(appState.state.settings.monthlyTarget) || 0;

    const getEntryTotal = (entry) => {
        if (entry._totalPrice) return entry._totalPrice;
        return (entry.items || []).reduce((s, i) => s + (i.price * i.qty), 0);
    };

    const parseTs = (entry) => entry.timestamp || 0;

    // === Target Input Formatting ===
    const setupTargetInput = () => {
        const saved = appState.state.settings.monthlyTarget || 3800000;
        targetInput.value = formatNumberStr(String(saved));
        targetInput.type = 'text';
        targetInput.inputMode = 'numeric';

        targetInput.addEventListener('input', () => {
            const raw = targetInput.value.replace(/\D/g, '');
            targetInput.value = formatNumberStr(raw);
        });

        targetInput.addEventListener('change', () => {
            const raw = parseInt(targetInput.value.replace(/\D/g, '')) || 0;
            appState.updateSettings({ monthlyTarget: raw });
            render(appState.state.history);
        });
    };

    // Group history by year & month
    const groupHistory = (history) => {
        const byYearMonth = {}; // { 2026: { 0: total, 1: total ... }, ... }
        const byYear = {};      // { 2026: total, ... }
        history.forEach(entry => {
            const d = new Date(parseTs(entry));
            const y = d.getFullYear();
            const m = d.getMonth();
            const total = getEntryTotal(entry);
            if (!byYearMonth[y]) byYearMonth[y] = {};
            byYearMonth[y][m] = (byYearMonth[y][m] || 0) + total;
            byYear[y] = (byYear[y] || 0) + total;
        });
        return { byYearMonth, byYear };
    };

    // Filter history by mode
    const filterHistory = (history) => {
        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth();

        if (viewMode === 'bulan') {
            return history.filter(e => {
                const d = new Date(parseTs(e));
                return d.getFullYear() === curY && d.getMonth() === curM;
            });
        }
        if (viewMode === 'tahun') {
            return history.filter(e => {
                return new Date(parseTs(e)).getFullYear() === curY;
            });
        }
        return history; // semua
    };

    // === Data Age Helper (same as history mode) ===
    const getDataAge = (timestamp) => {
        if (!timestamp) return { label: '', cls: '' };
        const now = new Date();
        const itemDate = new Date(timestamp);
        const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        const diffDays = Math.floor((nowDay - itemDay) / 86400000);

        if (diffDays === 0) return { label: 'Hari ini', cls: 'age-today' };
        if (diffDays === 1) return { label: 'Kemarin', cls: 'age-yesterday' };
        if (diffDays <= 7) return { label: `${diffDays} hari lalu`, cls: 'age-week' };
        if (diffDays <= 30) return { label: `${Math.floor(diffDays / 7)} minggu lalu`, cls: 'age-week' };

        const diffMonths = (now.getFullYear() - itemDate.getFullYear()) * 12 + (now.getMonth() - itemDate.getMonth());
        if (diffMonths === 1) return { label: 'Bulan lalu', cls: 'age-month' };
        if (diffMonths < 12) return { label: `${diffMonths} bulan lalu`, cls: 'age-month' };

        const diffYears = Math.floor(diffMonths / 12);
        if (diffYears === 1) return { label: '1 tahun lalu', cls: 'age-year' };
        return { label: `${diffYears} tahun lalu`, cls: 'age-year' };
    };

    // === Render Summary Card ===
    const renderSummary = (history) => {
        const filtered = filterHistory(history);
        const total = filtered.reduce((s, e) => s + getEntryTotal(e), 0);

        const labels = {
            bulan: 'Pemasukan bulan ini',
            tahun: 'Pemasukan tahun ini',
            semua: 'Total pemasukan'
        };
        summaryLabel.textContent = labels[viewMode];
        amountValue.textContent = fmt(total);

        const now = new Date();
        if (viewMode === 'bulan') {
            summarySub.textContent = `Tanggal 1 – ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
        } else if (viewMode === 'tahun') {
            summarySub.textContent = `Januari – Desember ${now.getFullYear()}`;
        } else {
            summarySub.textContent = `Semua data yang ada`;
        }
    };

    // === Render Bar Chart ===
    const renderBars = (container, rows, maxVal, target) => {
        container.innerHTML = '';

        if (rows.length === 0) {
            container.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">Tidak ada data</div>';
            return;
        }

        // Compute reference max (at least the target)
        const refMax = Math.max(maxVal, target, 1);
        const targetPct = target > 0 ? Math.min((target / refMax) * 100, 100) : 0;

        // Render target line as an absolute overlay on the chart container
        if (target > 0) {
            container.style.position = 'relative';
        }

        rows.forEach(row => {
            const pct = Math.min((row.value / refMax) * 100, 100);
            const meetsTarget = target > 0 ? row.value >= target : true;
            const barColor = meetsTarget ? 'var(--finance-green)' : 'var(--finance-yellow)';

            const rowEl = document.createElement('div');
            rowEl.className = 'finance-bar-row';
            if (row.active) rowEl.classList.add('finance-bar-row--active');

            const valueHTML = row.value > 0
                ? `<span class="finance-bar-value" style="color:${barColor};">${fmt(row.value)}</span>`
                : '<span class="finance-bar-value" style="opacity:0.3;">-</span>';

            rowEl.innerHTML = `
                <span class="finance-bar-label">${row.label}</span>
                <div class="finance-bar-track">
                    <div class="finance-bar-fill" style="width:${pct}%; background:${barColor};"></div>
                </div>
                ${valueHTML}
            `;
            container.appendChild(rowEl);
        });

        // Add a single vertical target line that spans the entire chart
        if (target > 0) {
            const targetLine = document.createElement('div');
            targetLine.className = 'finance-chart-target-line';
            // Calculate left position: label width + gap + percentage of track
            // We use CSS calc to align with the track
            targetLine.style.left = `calc(var(--bar-label-w) + var(--bar-gap) + (100% - var(--bar-label-w) - var(--bar-gap) - var(--bar-value-w) - var(--bar-gap)) * ${targetPct / 100})`;
            container.appendChild(targetLine);
        }
    };

    // === Monthly Chart ===
    const renderMonthlyChart = (history) => {
        const now = new Date();
        const { byYearMonth } = groupHistory(history);
        const yearData = byYearMonth[selectedYear] || {};

        const rows = MONTH_NAMES.map((name, m) => ({
            label: name,
            value: yearData[m] || 0,
            active: selectedYear === now.getFullYear() && m === now.getMonth()
        }));

        const maxVal = Math.max(...rows.map(r => r.value), 0);
        chartYearLabel.textContent = String(selectedYear);
        renderBars(monthlyChart, rows, maxVal, getTarget());
    };

    // === Yearly Chart ===
    const renderYearlyChart = (history) => {
        const now = new Date();
        const { byYear } = groupHistory(history);

        if (Object.keys(byYear).length === 0) {
            yearlyChart.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">Tidak ada data</div>';
            return;
        }

        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);
        const maxVal = Math.max(...years.map(y => byYear[y]), 0);
        const yearlyTarget = getTarget() * 12;

        const rows = years.map(y => ({
            label: String(y),
            value: byYear[y] || 0,
            active: y === now.getFullYear()
        }));

        renderBars(yearlyChart, rows, maxVal, yearlyTarget);
    };

    // === Mini History (same design as history-item) ===
    const renderHistoryList = (history) => {
        historyList.innerHTML = '';
        const filtered = filterHistory(history);
        const sortOrder = historySortSel.value;
        const sorted = [...filtered].sort((a, b) =>
            sortOrder === 'terbaru' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
        );

        if (sorted.length === 0) {
            historyList.innerHTML = '<div style="padding:14px 20px; color:var(--text-muted); font-size:0.85rem;">Tidak ada data</div>';
            return;
        }

        const shownAgeLabels = new Set();

        sorted.forEach(entry => {
            const total = getEntryTotal(entry);
            const numStr = fmt(total);
            const totalHTML = `<sup style="font-size:0.6em; font-weight:500; vertical-align:super; letter-spacing:0; opacity:0.75;">Rp</sup>${numStr}`;

            const age = getDataAge(entry.timestamp);
            const badgeLabel = (age.label && !shownAgeLabels.has(age.label)) ? age.label : '';
            if (age.label) shownAgeLabels.add(age.label);

            const el = document.createElement('div');
            el.className = 'history-item';
            el.style.cssText = 'cursor:default;';

            el.innerHTML = `
                <div style="display:flex; align-items:flex-start; gap:8px;">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:3px;">
                            <h4 style="margin:0; font-size:0.95rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;">${entry.title || 'Tanpa Judul'}</h4>
                            <span class="age-badge ${age.cls}" style="flex-shrink:0;">${badgeLabel}</span>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <span style="font-size:0.78rem; color:var(--muted);">${entry.date || ''} | ${(entry.items||[]).length} Item</span>
                            <span style="font-weight:700; color:var(--primary); font-size:0.92rem; white-space:nowrap; flex-shrink:0; line-height:1;">${totalHTML}</span>
                        </div>
                    </div>
                </div>
            `;
            historyList.appendChild(el);
        });
    };

    // === Master Render ===
    const render = (history) => {
        renderSummary(history);
        renderMonthlyChart(history);
        renderYearlyChart(history);
        renderHistoryList(history);
    };

    // === Mode switcher ===
    modeSwitcher.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modeSwitcher.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            viewMode = btn.dataset.mode;
            render(appState.state.history);
        });
    });

    // === Year nav ===
    yearPrevBtn.addEventListener('click', () => {
        selectedYear--;
        render(appState.state.history);
    });
    yearNextBtn.addEventListener('click', () => {
        selectedYear++;
        render(appState.state.history);
    });

    // === History sort ===
    historySortSel.addEventListener('change', () => renderHistoryList(appState.state.history));

    // === Subscribe to history changes ===
    appState.subscribe('history', (data) => render(data));
    appState.subscribe('settings', () => render(appState.state.history));

    // === First render ===
    setupTargetInput();
    render(appState.state.history);
}
