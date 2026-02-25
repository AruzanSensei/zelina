/**
 * ui.js — UI utilities: modals, toasts, shared helpers
 */

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== MODAL OVERLAY =====
let activeOverlayClose = null;

function openSheet(html, onClose) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal-sheet" id="modal-sheet">${html}</div>`;
  overlay.classList.add('show');

  // close on backdrop click
  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) {
      closeSheet();
      overlay.removeEventListener('click', handler);
    }
  });

  activeOverlayClose = onClose;
}

function closeSheet() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
  if (typeof activeOverlayClose === 'function') {
    activeOverlayClose();
    activeOverlayClose = null;
  }
}

// ===== PMO INTENSITY CLASS =====
function intensityClass(count) {
  if (count === 0) return 'pmo-0';
  if (count === 1) return 'pmo-1';
  if (count === 2) return 'pmo-2';
  return 'pmo-3';
}

// ===== RENDER LOG CARD =====
function renderLogCard(rec, { onDelete, onEdit } = {}) {
  const div = document.createElement('div');
  div.className = 'log-card';
  div.dataset.id = rec.id;

  const dateLabel = formatDateLabel(rec.date);
  const tagsHtml = [
    rec.tags.tempat ? `<span class="tag tag-tempat">📍 ${esc(rec.tags.tempat)}</span>` : '',
    rec.tags.waktu  ? `<span class="tag tag-waktu">🕐 ${esc(rec.tags.waktu)}</span>`  : '',
    rec.tags.media  ? `<span class="tag tag-media">📱 ${esc(rec.tags.media)}</span>`  : ''
  ].join('');

  div.innerHTML = `
    <div class="log-card-header">
      <div class="log-date-time">
        <div class="log-date">${dateLabel}</div>
        <div class="log-time">Pukul ${esc(rec.time)}</div>
      </div>
      <span class="log-chevron">▾</span>
    </div>
    <div class="log-card-body">
      <div class="log-card-inner">
        <div class="log-tags">${tagsHtml || '<span style="font-size:12px;color:var(--text-muted)">Tidak ada tag</span>'}</div>
        <div class="log-note-label">Catatan Evaluasi</div>
        <div class="log-note-text">${rec.catatan ? esc(rec.catatan) : '<em style="color:var(--text-muted)">Belum ada catatan</em>'}</div>
        <div class="log-actions">
          <button class="btn-sm btn-edit" data-edit="${rec.id}">✏️ Edit</button>
          <button class="btn-sm btn-delete" data-del="${rec.id}">🗑 Hapus</button>
        </div>
      </div>
    </div>
  `;

  div.querySelector('.log-card-header').addEventListener('click', () => {
    div.classList.toggle('open');
  });

  div.querySelector('[data-del]')?.addEventListener('click', e => {
    e.stopPropagation();
    if (confirm('Hapus catatan ini?')) {
      DB.deleteRecord(rec.id);
      div.remove();
      if (typeof onDelete === 'function') onDelete(rec.id);
    }
  });

  div.querySelector('[data-edit]')?.addEventListener('click', e => {
    e.stopPropagation();
    if (typeof onEdit === 'function') onEdit(rec);
  });

  return div;
}

// ===== PMO FORM SHEET =====
function openPmoFormSheet({ date = DB.todayStr(), time = DB.nowTimeStr(), existingRec = null, onSave } = {}) {
  const isEdit = !!existingRec;
  const title = isEdit ? 'Edit Catatan PMO' : 'Tambah Catatan PMO';
  const rec = existingRec || {};

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${title}</div>
    <div class="sheet-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📅 Tanggal</label>
          <input class="form-input" type="date" id="pf-date" value="${date}">
        </div>
        <div class="form-group">
          <label class="form-label">🕐 Jam</label>
          <input class="form-input" type="time" id="pf-time" value="${time}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">📍 Tempat</label>
        <input class="form-input" type="text" id="pf-tempat" placeholder="Kamar Tidur, Kamar Mandi..." value="${esc(rec.tags?.tempat||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">🕐 Waktu</label>
        <input class="form-input" type="text" id="pf-waktu" placeholder="Pagi, Siang, Sore, Malam..." value="${esc(rec.tags?.waktu||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">📱 Media</label>
        <input class="form-input" type="text" id="pf-media" placeholder="YouTube, Instagram..." value="${esc(rec.tags?.media||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">📝 Catatan Evaluasi</label>
        <textarea class="form-textarea" id="pf-catatan" placeholder="Apa yang memicu? Bagaimana perasaanmu?">${esc(rec.catatan||'')}</textarea>
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn-secondary" id="pf-cancel">Batal</button>
      <button class="btn-primary" id="pf-save">${isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}</button>
    </div>
  `;

  openSheet(html, null);

  document.getElementById('pf-cancel').addEventListener('click', closeSheet);
  document.getElementById('pf-save').addEventListener('click', () => {
    const date   = document.getElementById('pf-date').value;
    const time   = document.getElementById('pf-time').value;
    const tempat = document.getElementById('pf-tempat').value.trim();
    const waktu  = document.getElementById('pf-waktu').value.trim();
    const media  = document.getElementById('pf-media').value.trim();
    const catatan = document.getElementById('pf-catatan').value.trim();

    if (!date || !time) {
      showToast('⚠️ Tanggal dan jam wajib diisi!');
      return;
    }

    let saved;
    if (isEdit) {
      saved = DB.updateRecord(rec.id, { date, time, tags: { tempat, waktu, media }, catatan });
      showToast('✅ Catatan diperbarui');
    } else {
      saved = DB.addRecord({ date, time, tags: { tempat, waktu, media }, catatan });
      showToast('✅ Catatan ditambahkan');
    }
    closeSheet();
    if (typeof onSave === 'function') onSave(saved);
  });
}

// ===== DATE CLICK SHEET =====
function openDateSheet(dateStr, { onSave } = {}) {
  const records = DB.getRecordsByDate(dateStr);
  const label = formatDateLabel(dateStr);
  const count = records.length;
  const cls = intensityClass(count);
  const colorMap = { 'pmo-0': '#3b82f6', 'pmo-1': '#ca8a04', 'pmo-2': '#ef4444', 'pmo-3': '#1e293b' };
  const dotColor = colorMap[cls];

  const logsHtml = records.length === 0
    ? `<div class="day-log-empty">Tidak ada catatan PMO pada hari ini 🎉</div>`
    : records.map(r => `<div id="log-slot-${r.id}"></div>`).join('');

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">
      📅 ${label}
      <span style="font-size:13px;font-weight:600;color:${dotColor}"> · ${count}x PMO</span>
    </div>
    <div class="date-action-bar">
      <button class="date-action-btn add" id="ds-add">+ Tambah Catatan</button>
      ${count > 0 ? '' : ''}
    </div>
    <div class="day-log-list" id="ds-logs">${logsHtml}</div>
    <div style="height:16px"></div>
  `;

  openSheet(html, null);

  // mount log cards
  records.forEach(r => {
    const slot = document.getElementById(`log-slot-${r.id}`);
    if (slot) {
      const card = renderLogCard(r, {
        onDelete: () => { if (typeof onSave === 'function') onSave(); },
        onEdit: (rec) => {
          closeSheet();
          setTimeout(() => openPmoFormSheet({ date: rec.date, time: rec.time, existingRec: rec, onSave: () => { if (typeof onSave === 'function') onSave(); } }), 100);
        }
      });
      slot.replaceWith(card);
    }
  });

  document.getElementById('ds-add').addEventListener('click', () => {
    closeSheet();
    setTimeout(() => openPmoFormSheet({ date: dateStr, time: DB.nowTimeStr(), onSave: () => { if (typeof onSave === 'function') onSave(); } }), 100);
  });
}

// ===== HELPERS =====
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

window.UI = { showToast, openSheet, closeSheet, intensityClass, renderLogCard, openPmoFormSheet, openDateSheet, formatDateLabel, esc };
