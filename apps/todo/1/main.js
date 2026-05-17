/* ═══════════════════════════════════════════════════════════
   TASKFLOW — main.js
   Sections:
   1. STATE
   2. RENDER
   3. DOM HELPERS
   4. EVENTS / INTERACTIONS
   5. SETTINGS
   6. DRAG & DROP (groups)
   7. STATS
   8. PRINT
   9. PERSISTENCE
   10. INIT
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   1. STATE
───────────────────────────────────────────── */
let state = {
  docTitle:       'TODO LIST',
  docSubtitle:    '',
  accentColor:    '#111111',
  headerColor:    '#F5F0EB',
  checkboxStyle:  'square',   // square | circle | none
  colLayout:      '2',        // 1 | 2
  itemFontSize:   13,
  showProgress:   true,
  pages: []
};

/* Unique ID generator */
let _uid = Date.now();
function uid() { return 'id' + (_uid++).toString(36); }

/* ─────────────────────────────────────────────
   2. RENDER
───────────────────────────────────────────── */
function renderAll() {
  const container = document.getElementById('pages-container');
  container.innerHTML = '';

  if (state.pages.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✦</div>
      <div class="empty-state-text">Belum ada halaman.<br>Klik "Halaman" untuk mulai.</div>
    </div>`;
    return;
  }

  state.pages.forEach((page, pi) => {
    container.appendChild(renderPage(page, pi));
  });

  applySettings();
  updateStats();
}

function renderPage(page, pi) {
  const card = document.createElement('div');
  card.className = 'page-card';
  card.dataset.pageId = page.id;

  card.innerHTML = `
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-num">Halaman ${pi + 1}</div>
        <input class="page-title-input" type="text"
          value="${esc(page.title)}"
          placeholder="Judul halaman..."
          data-page-id="${page.id}">
      </div>
      <div class="page-header-actions">
        <button class="icon-btn page-move-up" data-page-id="${page.id}" title="Pindah ke atas" ${pi === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-btn page-move-down" data-page-id="${page.id}" title="Pindah ke bawah" ${pi === state.pages.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icon-btn page-delete" data-page-id="${page.id}" title="Hapus halaman" style="color:var(--text-4)">✕</button>
      </div>
    </div>
    <div class="page-body">
      <div class="groups-grid ${state.colLayout === '2' ? 'cols-2' : ''}" data-page-id="${page.id}"></div>
    </div>
    <div class="page-footer">
      <button class="btn-add-group-inline" data-page-id="${page.id}">+ Tambah Group</button>
    </div>
  `;

  const grid = card.querySelector('.groups-grid');
  page.groups.forEach(group => {
    grid.appendChild(renderGroup(group, page.id));
  });

  // Wire page-level events
  card.querySelector('.page-title-input').addEventListener('input', e => {
    const p = state.pages.find(pg => pg.id === page.id);
    if (p) p.title = e.target.value;
    saveState();
    updateStats();
  });

  card.querySelector('.page-delete').addEventListener('click', () => deletePage(page.id));
  card.querySelector('.page-move-up').addEventListener('click', () => movePage(page.id, -1));
  card.querySelector('.page-move-down').addEventListener('click', () => movePage(page.id, 1));
  card.querySelector('.btn-add-group-inline').addEventListener('click', () => addGroup(page.id));

  setupGroupDragDrop(grid, page.id);

  return card;
}

function renderGroup(group, pageId) {
  const card = document.createElement('div');
  card.className = 'group-card';
  card.dataset.groupId = group.id;
  card.draggable = true;

  const doneCount = group.items.filter(i => i.done).length;
  const totalCount = group.items.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  card.innerHTML = `
    <div class="group-header">
      <span class="group-drag-handle" title="Seret untuk atur urutan">⠿</span>
      <input class="group-name-input" type="text"
        value="${esc(group.name)}"
        placeholder="Nama group..."
        data-group-id="${group.id}">
      ${state.showProgress && totalCount > 0
        ? `<span class="group-progress">${doneCount}/${totalCount}</span>`
        : ''}
      <div class="group-actions">
        <button class="group-action-btn group-move-up" data-group-id="${group.id}" data-page-id="${pageId}" title="Pindah ke atas">↑</button>
        <button class="group-action-btn group-move-down" data-group-id="${group.id}" data-page-id="${pageId}" title="Pindah ke bawah">↓</button>
        <button class="group-action-btn danger group-delete" data-group-id="${group.id}" data-page-id="${pageId}" title="Hapus group">✕</button>
      </div>
    </div>
    ${state.showProgress && totalCount > 0 ? `
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>` : ''}
    <div class="todo-list" data-group-id="${group.id}"></div>
    <button class="btn-add-item" data-group-id="${group.id}" data-page-id="${pageId}">Tambah item</button>
  `;

  const list = card.querySelector('.todo-list');
  group.items.forEach(item => {
    list.appendChild(renderItem(item, group.id, pageId));
  });

  // Group events
  card.querySelector('.group-name-input').addEventListener('input', e => {
    const g = findGroup(group.id);
    if (g) g.name = e.target.value;
    saveState(); updateStats();
  });

  card.querySelector('.group-delete').addEventListener('click', () => deleteGroup(pageId, group.id));
  card.querySelector('.group-move-up').addEventListener('click', () => moveGroup(pageId, group.id, -1));
  card.querySelector('.group-move-down').addEventListener('click', () => moveGroup(pageId, group.id, 1));

  card.querySelector('.btn-add-item').addEventListener('click', () => {
    addItem(pageId, group.id);
  });

  return card;
}

function renderItem(item, groupId, pageId) {
  const row = document.createElement('div');
  row.className = 'todo-item' + (item.done ? ' is-done' : '');
  row.dataset.itemId = item.id;

  const checkClass = item.done ? 'todo-check checked' : 'todo-check';
  const priorityClass = item.priority === 'high' ? 'p-high' : item.priority === 'mid' ? 'p-mid' : item.priority === 'low' ? 'p-low' : '';

  row.innerHTML = `
    <div class="${checkClass}" role="checkbox" aria-checked="${item.done}" tabindex="0" data-item-id="${item.id}"></div>
    <div class="todo-priority ${priorityClass}" title="Klik untuk ganti prioritas (tinggi/sedang/rendah/none)" data-item-id="${item.id}"></div>
    <textarea class="todo-text-input" rows="1" placeholder="Item baru..." data-item-id="${item.id}">${esc(item.text)}</textarea>
    ${item.tag ? `<span class="todo-tag" data-item-id="${item.id}" title="Klik untuk edit tag">${esc(item.tag)}</span>` : `<span class="todo-tag todo-tag-empty" data-item-id="${item.id}" title="Klik untuk tambah tag" style="opacity:0">+tag</span>`}
    <button class="todo-del-btn" data-item-id="${item.id}" data-group-id="${groupId}" data-page-id="${pageId}" title="Hapus">✕</button>
  `;

  // Auto-resize textarea
  const ta = row.querySelector('.todo-text-input');
  autoResize(ta);
  ta.addEventListener('input', () => {
    const it = findItem(item.id);
    if (it) it.text = ta.value;
    autoResize(ta);
    saveState(); updateStats();
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addItemAfter(pageId, groupId, item.id);
    }
    if (e.key === 'Backspace' && ta.value === '') {
      e.preventDefault();
      deleteItem(pageId, groupId, item.id);
    }
  });

  // Checkbox toggle
  const chk = row.querySelector('.todo-check');
  chk.addEventListener('click', () => toggleItem(item.id, row, chk));
  chk.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleItem(item.id, row, chk); }
  });

  // Priority cycle
  const prio = row.querySelector('.todo-priority');
  prio.addEventListener('click', () => cyclePriority(item.id, prio));

  // Tag
  const tag = row.querySelector('.todo-tag, .todo-tag-empty');
  tag.addEventListener('click', () => editTag(item.id, tag));

  // Show tag on hover
  row.addEventListener('mouseenter', () => {
    const emptyTag = row.querySelector('.todo-tag-empty');
    if (emptyTag) emptyTag.style.opacity = '.4';
  });
  row.addEventListener('mouseleave', () => {
    const emptyTag = row.querySelector('.todo-tag-empty');
    if (emptyTag) emptyTag.style.opacity = '0';
  });

  // Delete
  row.querySelector('.todo-del-btn').addEventListener('click', () => {
    deleteItem(pageId, groupId, item.id);
  });

  return row;
}

/* ─────────────────────────────────────────────
   3. DOM HELPERS
───────────────────────────────────────────── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function autoResize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

function findGroup(groupId) {
  for (const page of state.pages) {
    const g = page.groups.find(g => g.id === groupId);
    if (g) return g;
  }
  return null;
}

function findItem(itemId) {
  for (const page of state.pages) {
    for (const group of page.groups) {
      const it = group.items.find(i => i.id === itemId);
      if (it) return it;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────
   4. EVENTS / INTERACTIONS
───────────────────────────────────────────── */

/* Page operations */
function addPage(title = 'Halaman Baru') {
  state.pages.push({ id: uid(), title, groups: [] });
  saveState();
  renderAll();
  // Scroll to new page
  const cards = document.querySelectorAll('.page-card');
  if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deletePage(pageId) {
  if (state.pages.length <= 1) { toast('Minimal satu halaman harus ada'); return; }
  if (!confirm('Hapus halaman ini beserta semua isinya?')) return;
  state.pages = state.pages.filter(p => p.id !== pageId);
  saveState(); renderAll();
}

function movePage(pageId, dir) {
  const idx = state.pages.findIndex(p => p.id === pageId);
  if (idx < 0) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.pages.length) return;
  const arr = [...state.pages];
  [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
  state.pages = arr;
  saveState(); renderAll();
}

/* Group operations */
function addGroup(pageId, name = '') {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const g = { id: uid(), name, items: [] };
  page.groups.push(g);
  saveState(); renderAll();
  // Focus the new group name input
  setTimeout(() => {
    const el = document.querySelector(`[data-group-id="${g.id}"].group-name-input`);
    if (el) el.focus();
  }, 50);
}

function deleteGroup(pageId, groupId) {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const g = page.groups.find(g => g.id === groupId);
  if (g && g.items.length > 0) {
    if (!confirm(`Hapus group "${g.name || 'tanpa nama'}" dan ${g.items.length} item di dalamnya?`)) return;
  }
  page.groups = page.groups.filter(g => g.id !== groupId);
  saveState(); renderAll();
}

function moveGroup(pageId, groupId, dir) {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const idx = page.groups.findIndex(g => g.id === groupId);
  if (idx < 0) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= page.groups.length) return;
  const arr = [...page.groups];
  [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
  page.groups = arr;
  saveState(); renderAll();
}

/* Item operations */
function addItem(pageId, groupId, text = '') {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const group = page.groups.find(g => g.id === groupId);
  if (!group) return;
  const item = { id: uid(), text, done: false, priority: '', tag: '' };
  group.items.push(item);
  saveState();

  // Re-render just the group
  const groupCard = document.querySelector(`[data-group-id="${groupId}"]`).closest('.group-card');
  if (groupCard) {
    const newCard = renderGroup(group, pageId);
    groupCard.replaceWith(newCard);
    applySettings();
  }

  setTimeout(() => {
    const newItem = document.querySelector(`.todo-item[data-item-id="${item.id}"] .todo-text-input`);
    if (newItem) newItem.focus();
  }, 30);
  updateStats();
}

function addItemAfter(pageId, groupId, afterItemId) {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const group = page.groups.find(g => g.id === groupId);
  if (!group) return;
  const idx = group.items.findIndex(i => i.id === afterItemId);
  const newItem = { id: uid(), text: '', done: false, priority: '', tag: '' };
  group.items.splice(idx + 1, 0, newItem);
  saveState();

  const groupCard = document.querySelector(`[data-group-id="${groupId}"]`).closest('.group-card');
  if (groupCard) {
    const newCard = renderGroup(group, pageId);
    groupCard.replaceWith(newCard);
    applySettings();
  }

  setTimeout(() => {
    const newInputEl = document.querySelector(`.todo-item[data-item-id="${newItem.id}"] .todo-text-input`);
    if (newInputEl) newInputEl.focus();
  }, 30);
  updateStats();
}

function deleteItem(pageId, groupId, itemId) {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  const group = page.groups.find(g => g.id === groupId);
  if (!group) return;

  const idx = group.items.findIndex(i => i.id === itemId);
  const focusPrevId = idx > 0 ? group.items[idx - 1].id : null;
  group.items = group.items.filter(i => i.id !== itemId);
  saveState();

  const groupCard = document.querySelector(`[data-group-id="${groupId}"]`).closest('.group-card');
  if (groupCard) {
    const newCard = renderGroup(group, pageId);
    groupCard.replaceWith(newCard);
    applySettings();
  }

  if (focusPrevId) {
    setTimeout(() => {
      const prev = document.querySelector(`.todo-item[data-item-id="${focusPrevId}"] .todo-text-input`);
      if (prev) { prev.focus(); const len = prev.value.length; prev.setSelectionRange(len, len); }
    }, 30);
  }
  updateStats();
}

function toggleItem(itemId, row, chk) {
  const item = findItem(itemId);
  if (!item) return;
  item.done = !item.done;
  row.classList.toggle('is-done', item.done);
  chk.classList.toggle('checked', item.done);
  chk.setAttribute('aria-checked', item.done);

  // Update progress on parent group
  const groupCard = row.closest('.group-card');
  if (groupCard) updateGroupProgress(groupCard);
  saveState(); updateStats();
}

function cyclePriority(itemId, dot) {
  const item = findItem(itemId);
  if (!item) return;
  const cycle = ['', 'high', 'mid', 'low'];
  const cur = cycle.indexOf(item.priority);
  item.priority = cycle[(cur + 1) % cycle.length];
  dot.className = 'todo-priority' + (item.priority ? ' p-' + item.priority : '');
  const labels = { high: 'Prioritas tinggi', mid: 'Prioritas sedang', low: 'Prioritas rendah', '': 'Tanpa prioritas' };
  toast(labels[item.priority]);
  saveState();
}

function editTag(itemId, tagEl) {
  const item = findItem(itemId);
  if (!item) return;
  const current = item.tag || '';
  const val = prompt('Tag (kosongkan untuk hapus):', current);
  if (val === null) return;
  item.tag = val.trim().slice(0, 20);

  if (item.tag) {
    tagEl.textContent = item.tag;
    tagEl.className = 'todo-tag';
    tagEl.style.opacity = '1';
    tagEl.title = 'Klik untuk edit tag';
  } else {
    tagEl.textContent = '+tag';
    tagEl.className = 'todo-tag todo-tag-empty';
    tagEl.style.opacity = '0';
    tagEl.title = 'Klik untuk tambah tag';
  }
  saveState();
}

function updateGroupProgress(groupCard) {
  const groupId = groupCard.querySelector('[data-group-id]').dataset.groupId;
  const group = findGroup(groupId);
  if (!group) return;
  const total = group.items.length;
  const done = group.items.filter(i => i.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const progress = groupCard.querySelector('.group-progress');
  if (progress) progress.textContent = `${done}/${total}`;

  const fill = groupCard.querySelector('.progress-bar-fill');
  if (fill) fill.style.width = pct + '%';
}

/* ─────────────────────────────────────────────
   5. SETTINGS
───────────────────────────────────────────── */
function initSettings() {
  const panel = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');

  document.getElementById('btn-settings').addEventListener('click', () => {
    panel.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  });
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);

  // Doc title
  const titleEl = document.getElementById('doc-title');
  titleEl.value = state.docTitle;
  titleEl.addEventListener('input', () => { state.docTitle = titleEl.value; saveState(); });

  // Subtitle
  const subtitleEl = document.getElementById('doc-subtitle');
  subtitleEl.value = state.docSubtitle;
  subtitleEl.addEventListener('input', () => { state.docSubtitle = subtitleEl.value; saveState(); });

  // Accent color
  setupColorPair('color-accent-text', 'color-accent-picker', 'color-swatch-accent', (val) => {
    state.accentColor = val;
    document.documentElement.style.setProperty('--accent', val);
    saveState();
  }, state.accentColor);

  // Header color
  setupColorPair('color-header-text', 'color-header-picker', 'color-swatch-header', (val) => {
    state.headerColor = val;
    document.documentElement.style.setProperty('--header-bg', val);
    saveState();
  }, state.headerColor);

  // Checkbox style
  document.querySelectorAll('[name="checkbox-style"]').forEach(radio => {
    radio.checked = radio.value === state.checkboxStyle;
    radio.addEventListener('change', () => {
      state.checkboxStyle = radio.value;
      applyCheckboxStyle();
      saveState();
    });
  });

  // Column layout
  document.querySelectorAll('[name="col-layout"]').forEach(radio => {
    radio.checked = radio.value === state.colLayout;
    radio.addEventListener('change', () => {
      state.colLayout = radio.value;
      document.querySelectorAll('.groups-grid').forEach(g => {
        g.classList.toggle('cols-2', state.colLayout === '2');
      });
      saveState();
    });
  });

  // Font size
  const rangeEl = document.getElementById('font-size-range');
  const labelEl = document.getElementById('font-size-label');
  rangeEl.value = state.itemFontSize;
  labelEl.textContent = state.itemFontSize + 'px';
  rangeEl.addEventListener('input', () => {
    state.itemFontSize = parseInt(rangeEl.value);
    labelEl.textContent = state.itemFontSize + 'px';
    document.documentElement.style.setProperty('--item-font-size', state.itemFontSize + 'px');
    saveState();
  });

  // Show progress
  const progressToggle = document.getElementById('show-progress');
  progressToggle.checked = state.showProgress;
  progressToggle.addEventListener('change', () => {
    state.showProgress = progressToggle.checked;
    saveState(); renderAll();
  });
}

function setupColorPair(textId, pickerId, swatchId, onChange, initialVal) {
  const textEl = document.getElementById(textId);
  const pickerEl = document.getElementById(pickerId);
  const swatchEl = document.getElementById(swatchId);

  textEl.value = initialVal;
  pickerEl.value = initialVal;
  swatchEl.style.background = initialVal;

  pickerEl.addEventListener('input', () => {
    const val = pickerEl.value.toUpperCase();
    textEl.value = val;
    swatchEl.style.background = val;
    onChange(val);
  });
  textEl.addEventListener('input', () => {
    const val = textEl.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      pickerEl.value = val;
      swatchEl.style.background = val;
      onChange(val.toUpperCase());
    }
  });
}

function closeSettings() {
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('settings-overlay').classList.add('hidden');
}

function applySettings() {
  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-font-size', state.itemFontSize + 'px');

  applyCheckboxStyle();

  document.querySelectorAll('.groups-grid').forEach(g => {
    g.classList.toggle('cols-2', state.colLayout === '2');
  });

  // Sync all textareas heights
  document.querySelectorAll('.todo-text-input').forEach(ta => autoResize(ta));
}

function applyCheckboxStyle() {
  const style = state.checkboxStyle;
  const r = style === 'circle' ? '50%' : style === 'none' ? '0' : '3px';
  const border = style === 'none' ? '1.5px solid transparent' : '1.5px solid var(--border-2)';
  document.querySelectorAll('.todo-check').forEach(el => {
    el.style.borderRadius = r;
    el.style.border = el.classList.contains('checked') ? 'none' : border;
    if (style === 'none') {
      el.style.background = el.classList.contains('checked') ? 'none' : 'transparent';
    }
  });
  document.documentElement.style.setProperty('--checkbox-radius', r);
}

/* ─────────────────────────────────────────────
   6. DRAG & DROP (groups within a page)
───────────────────────────────────────────── */
let dragSrcGroupId = null;
let dragSrcPageId  = null;

function setupGroupDragDrop(grid, pageId) {
  grid.addEventListener('dragstart', e => {
    const groupCard = e.target.closest('.group-card');
    if (!groupCard) return;
    dragSrcGroupId = groupCard.dataset.groupId;
    dragSrcPageId  = pageId;
    groupCard.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcGroupId);
  });

  grid.addEventListener('dragend', e => {
    document.querySelectorAll('.group-card.dragging').forEach(el => el.classList.remove('dragging'));
    document.querySelectorAll('.group-card.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragSrcGroupId = null;
    dragSrcPageId  = null;
  });

  grid.addEventListener('dragover', e => {
    e.preventDefault();
    const groupCard = e.target.closest('.group-card');
    if (groupCard && groupCard.dataset.groupId !== dragSrcGroupId) {
      document.querySelectorAll('.group-card.drag-over').forEach(el => el.classList.remove('drag-over'));
      groupCard.classList.add('drag-over');
    }
  });

  grid.addEventListener('dragleave', e => {
    const groupCard = e.target.closest('.group-card');
    if (groupCard) groupCard.classList.remove('drag-over');
  });

  grid.addEventListener('drop', e => {
    e.preventDefault();
    const targetCard = e.target.closest('.group-card');
    if (!targetCard || !dragSrcGroupId) return;
    const targetGroupId = targetCard.dataset.groupId;
    if (targetGroupId === dragSrcGroupId) return;
    if (pageId !== dragSrcPageId) return; // only within same page

    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;
    const srcIdx = page.groups.findIndex(g => g.id === dragSrcGroupId);
    const tgtIdx = page.groups.findIndex(g => g.id === targetGroupId);
    if (srcIdx < 0 || tgtIdx < 0) return;

    const arr = [...page.groups];
    const [moved] = arr.splice(srcIdx, 1);
    arr.splice(tgtIdx, 0, moved);
    page.groups = arr;
    saveState();

    // Re-render just this grid
    grid.innerHTML = '';
    page.groups.forEach(g => grid.appendChild(renderGroup(g, pageId)));
    applySettings();
  });
}

/* ─────────────────────────────────────────────
   7. STATS
───────────────────────────────────────────── */
function updateStats() {
  let total = 0, done = 0;
  state.pages.forEach(p => p.groups.forEach(g => {
    total += g.items.length;
    done  += g.items.filter(i => i.done).length;
  }));
  document.getElementById('stat-total').textContent = `${total} item`;
  document.getElementById('stat-done').textContent  = `${done} selesai`;
}

/* ─────────────────────────────────────────────
   8. PRINT
───────────────────────────────────────────── */
document.getElementById('btn-print').addEventListener('click', () => {
  window.print();
});

/* ─────────────────────────────────────────────
   9. PERSISTENCE (localStorage)
───────────────────────────────────────────── */
const STORAGE_KEY = 'taskflow_state_v2';

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage full or unavailable
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      Object.assign(state, loaded);
      return true;
    }
  } catch (e) {}
  return false;
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
let toastTimer;
function toast(msg, duration = 2000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ─────────────────────────────────────────────
   10. INIT
───────────────────────────────────────────── */
function loadDefaultData() {
  state.pages = [
    {
      id: uid(),
      title: 'Web Docflow',
      groups: [
        {
          id: uid(),
          name: 'UI & TAMPILAN',
          items: [
            { id: uid(), text: 'Perbaiki Tampilan preview History', done: false, priority: 'high', tag: 'UI' },
            { id: uid(), text: 'Menambah detail kecil di mode manual, history, dan setting', done: false, priority: 'mid', tag: '' },
          ]
        },
        {
          id: uid(),
          name: 'FITUR',
          items: [
            { id: uid(), text: 'Memasukan Fitur Download PDF', done: false, priority: 'high', tag: 'feature' },
          ]
        },
      ]
    },
    {
      id: uid(),
      title: 'Web Memories',
      groups: [
        {
          id: uid(),
          name: 'UPDATE',
          items: [
            { id: uid(), text: 'Update Web Memories', done: false, priority: 'mid', tag: '' },
            { id: uid(), text: 'Menambahkan Web Memories Generator', done: false, priority: 'mid', tag: 'feature' },
            { id: uid(), text: 'Music player menjadi floating bottom + mode icon', done: false, priority: 'low', tag: 'UI' },
            { id: uid(), text: 'Tambahkan 1 atau 2 column view, dan color picker', done: false, priority: 'low', tag: 'feature' },
          ]
        },
      ]
    },
    {
      id: uid(),
      title: 'Web Zanxa Site',
      groups: [
        {
          id: uid(),
          name: 'KONTEN NYATA',
          items: [
            { id: uid(), text: 'Menambahkan Data Real (ig, wa, maps)', done: false, priority: 'high', tag: 'content' },
            { id: uid(), text: 'Menggunakan Foto Real untuk proyek dan komentar', done: false, priority: 'high', tag: 'content' },
            { id: uid(), text: 'Tambahkan Blog nyata — minimal 3, dan ada di home', done: false, priority: 'mid', tag: 'content' },
          ]
        },
        {
          id: uid(),
          name: 'TAMPILAN & LAYOUT',
          items: [
            { id: uid(), text: 'Update Tampilannya (Menambah Elemen di header, dll)', done: false, priority: 'mid', tag: 'UI' },
            { id: uid(), text: 'Perbaiki Layout nya', done: false, priority: 'mid', tag: 'UI' },
            { id: uid(), text: 'Memasukan Desain Real ke Halaman Design', done: false, priority: 'low', tag: 'UI' },
          ]
        },
        {
          id: uid(),
          name: 'HALAMAN BARU',
          items: [
            { id: uid(), text: 'Tambahkan halaman lain selain index.html', done: false, priority: 'mid', tag: 'feature' },
            { id: uid(), text: 'Buat Pricelist untuk Web dan Design', done: false, priority: 'mid', tag: 'feature' },
          ]
        },
      ]
    },
    {
      id: uid(),
      title: 'Web Undangan Digital',
      groups: [
        {
          id: uid(),
          name: 'BUILD',
          items: [
            { id: uid(), text: 'Buat Homepage nya', done: false, priority: 'high', tag: '' },
            { id: uid(), text: 'Buat Template Pertama', done: false, priority: 'high', tag: '' },
            { id: uid(), text: 'Buat Generator nya', done: false, priority: 'mid', tag: 'feature' },
            { id: uid(), text: 'Pelajari "Burst Send" (Optional)', done: false, priority: 'low', tag: 'research' },
          ]
        },
      ]
    },
  ];
}

document.addEventListener('DOMContentLoaded', () => {
  const hasState = loadState();
  if (!hasState) loadDefaultData();

  initSettings();
  renderAll();

  // Wire toolbar buttons
  document.getElementById('btn-add-page').addEventListener('click', () => addPage());
  document.getElementById('btn-add-group').addEventListener('click', () => {
    if (state.pages.length === 0) { addPage(); return; }
    // Add to last page
    addGroup(state.pages[state.pages.length - 1].id);
  });

  // Apply saved CSS vars
  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-font-size', state.itemFontSize + 'px');

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  });

  toast('✦ Data todo dimuat. Ctrl+P untuk print.');
});
