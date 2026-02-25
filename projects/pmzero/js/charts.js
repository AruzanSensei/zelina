/**
 * charts.js — Chart rendering utilities
 * Bar charts, donut charts, streak bars
 */

// ===== BAR CHART =====
function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:20px;width:100%">Belum ada data</div>`;
    return;
  }

  const max = Math.max(...data.map(d => d.count), 1);
  const maxHeight = 90; // px

  container.innerHTML = '';
  data.forEach(item => {
    const pct = item.count / max;
    const h = Math.max(4, Math.round(pct * maxHeight));
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar-fill" style="height:${h}px" title="${item.count}x PMO"></div>
      <div class="bar-lbl">${UI.esc(item.label)}</div>
    `;
    container.appendChild(col);
  });
}

// ===== STREAK HORIZONTAL BARS =====
function renderStreakBars(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const streaks = DB.getStreakRecords();
  if (streaks.length === 0 || (streaks.length === 1 && streaks[0].days === 0)) {
    container.innerHTML = `<div style="color:var(--text-muted);font-size:13px;font-style:italic">Belum ada data streak</div>`;
    return;
  }

  const maxDays = Math.max(...streaks.map(s => s.days), 1);
  const rankLabels = ['🥇','🥈','🥉','4','5','6','7'];
  const rankClasses = ['gold','silver','bronze','','','',''];

  container.innerHTML = '';
  streaks.forEach((s, i) => {
    const pct = Math.max(10, Math.round((s.days / maxDays) * 100));
    const bar = document.createElement('div');
    bar.className = 'streak-record';
    bar.innerHTML = `
      <div class="streak-rank ${rankClasses[i]}">${rankLabels[i]}</div>
      <div class="streak-bar-wrap">
        <div class="streak-bar-fill" style="width:${pct}%">
          <span class="streak-bar-text">${s.days} hari — ${UI.esc(s.label)}</span>
        </div>
      </div>
    `;
    container.appendChild(bar);
  });
}

// ===== DONUT CHART =====
const DONUT_COLORS = [
  '#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#bfdbfe',
  '#0ea5e9','#38bdf8','#7dd3fc','#0284c7','#e0f2fe'
];

function renderDonutChart(svgId, data) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    svg.innerHTML = `<circle cx="45" cy="45" r="30" fill="none" stroke="#dbeafe" stroke-width="14"/>
      <text x="45" y="50" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="DM Sans">0</text>`;
    return;
  }

  const cx = 45, cy = 45, r = 30, strokeW = 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  let paths = '';

  // background ring
  paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#dbeafe" stroke-width="${strokeW}"/>`;

  data.forEach((item, i) => {
    const pct = item.count / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const color = DONUT_COLORS[i % DONUT_COLORS.length];
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${color}" stroke-width="${strokeW}"
      stroke-dasharray="${dash} ${gap}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"
    />`;
    offset += dash;
  });

  // center text
  paths += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="14" font-weight="800" fill="#1e40af" font-family="Sora">${total}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="DM Sans">total</text>`;

  svg.innerHTML = paths;
}

function renderDonutCard(cardId, svgId, legendId, data) {
  renderDonutChart(svgId, data);

  const legend = document.getElementById(legendId);
  if (!legend) return;

  if (data.length === 0) {
    legend.innerHTML = `<div style="color:var(--text-muted);font-size:12px;font-style:italic">Belum ada data</div>`;
    return;
  }

  legend.innerHTML = '';
  data.forEach((item, i) => {
    const color = DONUT_COLORS[i % DONUT_COLORS.length];
    const row = document.createElement('div');
    row.className = 'donut-legend-item';
    row.innerHTML = `
      <div class="legend-dot" style="background:${color}"></div>
      <div class="legend-name">${UI.esc(item.name)}</div>
      <div class="legend-count">${item.count}x</div>
    `;
    legend.appendChild(row);
  });
}

window.Charts = { renderBarChart, renderStreakBars, renderDonutChart, renderDonutCard };
