/* ====================================================
   CHARTS — Bar Chart, Streak Bars, Donut Charts
==================================================== */

function renderBarChart(mode) {
    const data = DB.chartData(mode);
    const c = document.getElementById('bar-chart');
    if (!c) return;

    if (!data.length) {
        c.innerHTML = '<div style="color:var(--textm);font-size:12px;width:100%;text-align:center;padding:20px 0">Belum ada data</div>';
        return;
    }
    const max = Math.max(...data.map(d => d.count), 1);
    c.innerHTML = '';
    data.forEach(item => {
        const h = Math.max(4, Math.round(item.count / max * 100));
        const col = document.createElement('div');
        col.className = 'bar-col';
        col.innerHTML = `
      <div class="bar-fill" style="height:${h}px" title="${item.count}x PMO"></div>
      <div class="bar-lbl">${esc(item.lbl)}</div>`;
        c.appendChild(col);
    });
}

function renderStreaks() {
    const c = document.getElementById('streak-bars');
    if (!c) return;
    const list = DB.streaks();
    const valid = list.filter(x => x.days > 0);
    if (!valid.length) {
        c.innerHTML = '<div style="color:var(--textm);font-size:12px;font-style:italic;padding:4px 0">Belum ada data streak</div>';
        return;
    }
    const max = Math.max(...valid.map(x => x.days), 1);
    const rl = ['🥇', '🥈', '🥉', '4', '5', '6', '7'];
    const rc = ['g', 's', 'b', '', '', '', ''];
    c.innerHTML = '';
    valid.forEach((x, i) => {
        const pct = Math.max(14, Math.round(x.days / max * 100));
        const row = document.createElement('div');
        row.className = 'srec';
        row.innerHTML = `
      <div class="srank ${rc[i] || ''}">${rl[i] || (i + 1)}</div>
      <div class="strack">
        <div class="sfill" style="width:${pct}%">
          <span>${x.days} hari — ${esc(x.label)}</span>
        </div>
      </div>`;
        c.appendChild(row);
    });
}

const DCOLS = ['#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', '#0ea5e9', '#38bdf8', '#0284c7', '#7dd3fc', '#bfdbfe', '#c7d2fe'];

function renderDonut(svgId, legId, data) {
    const svg = document.getElementById(svgId);
    const leg = document.getElementById(legId);
    if (!svg || !leg) return;

    const total = data.reduce((s, d) => s + d.count, 0);

    if (!total) {
        svg.innerHTML = `
      <circle cx="44" cy="44" r="30" fill="none" stroke="#dbeafe" stroke-width="14"/>
      <text x="44" y="50" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="DM Sans,sans-serif">0</text>`;
        leg.innerHTML = '<div style="color:var(--textm);font-size:11px;font-style:italic">Belum ada data</div>';
        return;
    }

    const cx = 44, cy = 44, r = 30, sw = 14;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    let paths = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#dbeafe" stroke-width="${sw}"/>`;

    data.forEach((item, i) => {
        const dash = item.count / total * circ;
        const gap = circ - dash;
        const color = DCOLS[i % DCOLS.length];
        paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${dash} ${gap}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
        offset += dash;
    });

    paths += `
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="800" fill="#1e40af" font-family="Sora,sans-serif">${total}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="DM Sans,sans-serif">total</text>`;
    svg.innerHTML = paths;

    leg.innerHTML = '';
    data.forEach((item, i) => {
        const color = DCOLS[i % DCOLS.length];
        const row = document.createElement('div');
        row.className = 'dl-row';
        row.innerHTML = `
      <div class="dl-dot" style="background:${color}"></div>
      <div class="dl-name">${esc(item.name)}</div>
      <div class="dl-cnt">${item.count}x</div>`;
        leg.appendChild(row);
    });
}
