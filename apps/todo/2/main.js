/* ═══════════════════════════════════════════════════════════
   TASKFLOW — main.js
   1. STATE & DEFAULTS
   2. EDITOR RENDER
   3. WALL PRINT RENDER  ← new
   4. ITEM INTERACTIONS
   5. GROUP OPERATIONS
   6. PAGE OPERATIONS
   7. SETTINGS
   8. DRAG & DROP
   9. STATS
   10. PERSISTENCE
   11. INIT
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   1. STATE
───────────────────────────────────────────── */
let state = {
  mode:          'editor',   // 'editor' | 'wall'
  accentColor:   '#111111',
  headerColor:   '#F5F0EB',
  colLayout:     '2',
  itemFontSize:  13,
  showProgress:  true,
  wallTheme:     'light',    // 'light' | 'gray' | 'dark'
  itemsPerPage:  10,         // max sub-items before breaking to new wall page
  docTitle:      'TODO LIST',
  docSubtitle:   '',
  pages: []
};

let _uid = Date.now();
const uid = () => 'id' + (_uid++).toString(36);

const esc = s => String(s || '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function findGroup(gid) {
  for (const p of state.pages) { const g = p.groups.find(g=>g.id===gid); if(g) return g; }
  return null;
}
function findItem(iid) {
  for (const p of state.pages)
    for (const g of p.groups) { const i = g.items.find(i=>i.id===iid); if(i) return i; }
  return null;
}
function autoResize(ta) { ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; }

/* ─────────────────────────────────────────────
   2. EDITOR RENDER
───────────────────────────────────────────── */
function renderEditor() {
  const container = document.getElementById('pages-container');
  container.innerHTML = '';

  if (!state.pages.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">✦</div>
      <div class="empty-state-text">Belum ada halaman.<br>Klik "+ Halaman" untuk mulai.</div>
    </div>`;
    return;
  }

  state.pages.forEach((page, pi) => container.appendChild(renderPageCard(page, pi)));
  applyEditorSettings();
  updateStats();
}

function renderPageCard(page, pi) {
  const card = document.createElement('div');
  card.className = 'page-card';
  card.dataset.pageId = page.id;

  card.innerHTML = `
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-num">Halaman ${pi + 1}</div>
        <input class="page-title-input" type="text"
          value="${esc(page.title)}" placeholder="Judul halaman..."
          data-page-id="${page.id}">
      </div>
      <div class="page-header-actions">
        <button class="icon-btn page-move-up" data-pid="${page.id}" title="Naik" ${pi===0?'disabled':''}>↑</button>
        <button class="icon-btn page-move-down" data-pid="${page.id}" title="Turun" ${pi===state.pages.length-1?'disabled':''}>↓</button>
        <button class="icon-btn page-delete danger-hover" data-pid="${page.id}" title="Hapus">✕</button>
      </div>
    </div>
    <div class="page-body">
      <div class="groups-grid ${state.colLayout==='2'?'cols-2':''}" data-page-id="${page.id}"></div>
    </div>
    <div class="page-footer">
      <button class="btn-add-group-inline" data-pid="${page.id}">+ Tambah Group</button>
    </div>`;

  const grid = card.querySelector('.groups-grid');
  page.groups.forEach(g => grid.appendChild(renderGroupCard(g, page.id)));

  card.querySelector('.page-title-input').addEventListener('input', e => {
    const p = state.pages.find(p=>p.id===page.id);
    if (p) { p.title = e.target.value; saveState(); updateStats(); }
  });
  card.querySelector('.page-delete').addEventListener('click', () => deletePage(page.id));
  card.querySelector('.page-move-up').addEventListener('click', () => movePage(page.id, -1));
  card.querySelector('.page-move-down').addEventListener('click', () => movePage(page.id, 1));
  card.querySelector('.btn-add-group-inline').addEventListener('click', () => addGroup(page.id));
  setupGroupDragDrop(grid, page.id);
  return card;
}

function renderGroupCard(group, pageId) {
  const card = document.createElement('div');
  card.className = 'group-card';
  card.dataset.groupId = group.id;
  card.draggable = true;

  const done = group.items.filter(i=>i.done).length;
  const total = group.items.length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;

  card.innerHTML = `
    <div class="group-header">
      <span class="group-drag-handle" title="Seret untuk atur urutan">⠿</span>
      <input class="group-name-input" type="text"
        value="${esc(group.name)}" placeholder="Nama group..."
        data-group-id="${group.id}">
      ${state.showProgress && total > 0 ? `<span class="group-progress">${done}/${total}</span>` : ''}
      <div class="group-actions">
        <button class="group-action-btn group-move-up" data-gid="${group.id}" data-pid="${pageId}" title="Naik">↑</button>
        <button class="group-action-btn group-move-down" data-gid="${group.id}" data-pid="${pageId}" title="Turun">↓</button>
        <button class="group-action-btn danger group-delete" data-gid="${group.id}" data-pid="${pageId}" title="Hapus">✕</button>
      </div>
    </div>
    ${state.showProgress && total > 0
      ? `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>` : ''}
    <div class="todo-list" data-group-id="${group.id}"></div>
    <button class="btn-add-item" data-gid="${group.id}" data-pid="${pageId}">Tambah item</button>`;

  const list = card.querySelector('.todo-list');
  group.items.forEach(item => list.appendChild(renderItemRow(item, group.id, pageId)));

  card.querySelector('.group-name-input').addEventListener('input', e => {
    const g = findGroup(group.id);
    if (g) { g.name = e.target.value; saveState(); updateStats(); }
  });
  card.querySelector('.group-delete').addEventListener('click', () => deleteGroup(pageId, group.id));
  card.querySelector('.group-move-up').addEventListener('click', () => moveGroup(pageId, group.id, -1));
  card.querySelector('.group-move-down').addEventListener('click', () => moveGroup(pageId, group.id, 1));
  card.querySelector('.btn-add-item').addEventListener('click', () => addItem(pageId, group.id));
  return card;
}

function renderItemRow(item, groupId, pageId) {
  const row = document.createElement('div');
  row.className = 'todo-item' + (item.done ? ' is-done' : '');
  row.dataset.itemId = item.id;

  const pc = item.priority ? ' p-'+item.priority : '';
  row.innerHTML = `
    <div class="${item.done?'todo-check checked':'todo-check'}" role="checkbox"
      aria-checked="${item.done}" tabindex="0" data-iid="${item.id}"></div>
    <div class="todo-priority${pc}" title="Prioritas" data-iid="${item.id}"></div>
    <textarea class="todo-text-input" rows="1"
      placeholder="Item baru..." data-iid="${item.id}">${esc(item.text)}</textarea>
    <button class="todo-del-btn" data-iid="${item.id}" data-gid="${groupId}" data-pid="${pageId}" title="Hapus">✕</button>`;

  const ta = row.querySelector('.todo-text-input');
  autoResize(ta);
  ta.addEventListener('input', () => {
    const it = findItem(item.id); if (it) { it.text = ta.value; }
    autoResize(ta); saveState(); updateStats();
  });
  ta.addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); addItemAfter(pageId, groupId, item.id); }
    if (e.key==='Backspace' && ta.value==='') { e.preventDefault(); deleteItem(pageId, groupId, item.id); }
  });

  const chk = row.querySelector('.todo-check');
  chk.addEventListener('click', () => toggleItem(item.id, row, chk));
  chk.addEventListener('keydown', e => { if(e.key===' '||e.key==='Enter'){e.preventDefault();toggleItem(item.id,row,chk);} });

  row.querySelector('.todo-priority').addEventListener('click', () => cyclePriority(item.id, row.querySelector('.todo-priority')));
  row.querySelector('.todo-del-btn').addEventListener('click', () => deleteItem(pageId, groupId, item.id));
  return row;
}

/* ─────────────────────────────────────────────
   3. WALL PRINT RENDER
───────────────────────────────────────────── */

/**
 * Build wall pages from state.
 *
 * Logic:
 * - Each "main item" = a group in editor (group.name is the big heading)
 * - Each "sub item"  = an item inside that group
 * - We pack groups into wall pages, tracking how many sub-items are on the current page.
 * - If adding a group would overflow (> itemsPerPage sub-items on one wall page),
 *   we start a new wall page.
 * - If a single group has MORE sub-items than itemsPerPage, we split it across
 *   multiple wall pages (continuation).
 */
function renderWall() {
  const container = document.getElementById('wall-pages');
  container.innerHTML = '';

  // Collect all groups across all editor pages, in order
  const allGroups = [];
  state.pages.forEach(p => {
    p.groups.forEach(g => {
      if (g.items.length > 0 || g.name.trim()) {
        allGroups.push({ ...g, editorPage: p.title });
      }
    });
  });

  if (!allGroups.length) {
    container.innerHTML = `<div class="empty-state" style="color:var(--wc-text,#666)">
      <div class="empty-state-icon">✦</div>
      <div class="empty-state-text">Tidak ada data. Tambahkan item di mode Editor.</div>
    </div>`;
    return;
  }

  const maxItems = state.itemsPerPage;

  // Group chunks to fit within pages
  // Each chunk = { groups: [{group, fromIdx, toIdx}], isFirst, isContinuation }
  const wallPages = [];   // each = array of {group, from, to, isContinuation}
  let currentPage = [];
  let currentCount = 0;

  allGroups.forEach(group => {
    const items = group.items;
    let from = 0;

    while (from < items.length || (from === 0 && items.length === 0)) {
      const isContinuation = from > 0;
      const remaining = maxItems - currentCount;

      if (remaining <= 0) {
        // Start new wall page
        wallPages.push(currentPage);
        currentPage = [];
        currentCount = 0;
        continue;
      }

      const canFit = from === 0 && items.length === 0 ? 1 : Math.min(remaining, items.length - from);
      const to = from + canFit;

      currentPage.push({ group, from, to, isContinuation });
      currentCount += canFit;

      from = to;

      // If items.length === 0 we put a placeholder, exit loop
      if (items.length === 0) break;

      // If we consumed all items of this group, move on
      if (from >= items.length) break;

      // If still more items, flush page and continue
      if (from < items.length) {
        wallPages.push(currentPage);
        currentPage = [];
        currentCount = 0;
      }
    }
  });

  if (currentPage.length > 0) wallPages.push(currentPage);

  const totalPages = wallPages.length;
  wallPages.forEach((chunks, pi) => {
    container.appendChild(buildWallPage(chunks, pi + 1, totalPages));
  });
}

function buildWallPage(chunks, pageNum, totalPages) {
  const page = document.createElement('div');
  page.className = 'wall-page';

  // Header
  const header = document.createElement('div');
  header.className = 'wall-page-header';
  header.innerHTML = `
    <div class="wall-page-title">${esc(state.docTitle || 'TODO')}</div>
    <div class="wall-page-meta">
      ${state.docSubtitle ? `<div class="wall-page-meta-label">${esc(state.docSubtitle)}</div>` : ''}
      <div class="wall-page-num">${String(pageNum).padStart(2,'0')}<span style="font-size:.5em;opacity:.5"> / ${String(totalPages).padStart(2,'0')}</span></div>
    </div>`;
  page.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'wall-page-body';

  let mainNum = chunks[0] ? getGlobalGroupIndex(chunks[0].group.id) + 1 : 1;

  chunks.forEach(chunk => {
    const { group, from, to, isContinuation } = chunk;
    const gIdx = getGlobalGroupIndex(group.id);

    const mainItem = document.createElement('div');
    mainItem.className = 'wall-main-item';

    // Main title row
    const titleRow = document.createElement('div');
    titleRow.className = 'wall-main-title';
    titleRow.innerHTML = `
      <span class="wall-main-num">${String(gIdx + 1).padStart(2,'0')}</span>
      <span class="wall-main-label">${esc(group.name || 'Untitled')}</span>
      ${isContinuation ? `<span style="font-family:var(--font-mono);font-size:10px;opacity:.35;margin-left:auto">lanjutan</span>` : ''}`;
    mainItem.appendChild(titleRow);

    // Sub items
    const subList = document.createElement('div');
    subList.className = 'wall-sub-list';

    const sliceItems = group.items.slice(from, to);
    sliceItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'wall-sub-item';
      row.innerHTML = `
        <div class="wall-check${item.done?' is-done':''}"></div>
        <div class="wall-sub-text${item.done?' is-done':''}">${esc(item.text)}</div>`;
      subList.appendChild(row);
    });

    if (group.items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'wall-sub-item';
      empty.style.opacity = '.3';
      empty.innerHTML = `<div class="wall-check"></div><div class="wall-sub-text" style="font-style:italic">Belum ada item</div>`;
      subList.appendChild(empty);
    }

    mainItem.appendChild(subList);
    body.appendChild(mainItem);
  });

  page.appendChild(body);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'wall-page-footer';
  page.appendChild(footer);

  return page;
}

function getGlobalGroupIndex(groupId) {
  let idx = 0;
  for (const p of state.pages) {
    for (const g of p.groups) {
      if (g.id === groupId) return idx;
      idx++;
    }
  }
  return 0;
}

/* Apply wall theme */
function applyWallTheme(theme) {
  const view = document.getElementById('wall-view');
  view.classList.remove('wall-light', 'wall-gray', 'wall-dark');
  view.classList.add('wall-' + theme);
}

/* ─────────────────────────────────────────────
   4. ITEM INTERACTIONS
───────────────────────────────────────────── */
function toggleItem(itemId, row, chk) {
  const item = findItem(itemId);
  if (!item) return;
  item.done = !item.done;
  row.classList.toggle('is-done', item.done);
  chk.classList.toggle('checked', item.done);
  chk.setAttribute('aria-checked', item.done);
  updateGroupProgress(row.closest('.group-card'));
  saveState(); updateStats();
}

function cyclePriority(itemId, dot) {
  const item = findItem(itemId);
  if (!item) return;
  const cycle = ['','high','mid','low'];
  item.priority = cycle[(cycle.indexOf(item.priority)+1) % cycle.length];
  dot.className = 'todo-priority' + (item.priority ? ' p-'+item.priority : '');
  const labels = {high:'🔴 Tinggi', mid:'🟡 Sedang', low:'🟢 Rendah', '':'— Biasa'};
  toast(labels[item.priority]);
  saveState();
}

function updateGroupProgress(groupCard) {
  if (!groupCard) return;
  const gid = groupCard.dataset.groupId;
  const g = findGroup(gid);
  if (!g) return;
  const total = g.items.length;
  const done  = g.items.filter(i=>i.done).length;
  const pct   = total > 0 ? Math.round(done/total*100) : 0;
  const prog = groupCard.querySelector('.group-progress');
  if (prog) prog.textContent = `${done}/${total}`;
  const fill = groupCard.querySelector('.progress-bar-fill');
  if (fill) fill.style.width = pct+'%';
}

/* ─────────────────────────────────────────────
   5. ITEM CRUD
───────────────────────────────────────────── */
function addItem(pageId, groupId, text='') {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const group = page.groups.find(g=>g.id===groupId);
  if (!group) return;
  const item = {id:uid(), text, done:false, priority:'', tag:''};
  group.items.push(item);
  saveState();
  refreshGroup(groupId, pageId);
  setTimeout(()=>{ const el = document.querySelector(`.todo-item[data-item-id="${item.id}"] .todo-text-input`); if(el) el.focus(); }, 30);
  updateStats();
}

function addItemAfter(pageId, groupId, afterId) {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const group = page.groups.find(g=>g.id===groupId);
  if (!group) return;
  const idx = group.items.findIndex(i=>i.id===afterId);
  const item = {id:uid(), text:'', done:false, priority:'', tag:''};
  group.items.splice(idx+1, 0, item);
  saveState();
  refreshGroup(groupId, pageId);
  setTimeout(()=>{ const el = document.querySelector(`.todo-item[data-item-id="${item.id}"] .todo-text-input`); if(el) el.focus(); }, 30);
  updateStats();
}

function deleteItem(pageId, groupId, itemId) {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const group = page.groups.find(g=>g.id===groupId);
  if (!group) return;
  const idx = group.items.findIndex(i=>i.id===itemId);
  const prevId = idx > 0 ? group.items[idx-1].id : null;
  group.items = group.items.filter(i=>i.id!==itemId);
  saveState();
  refreshGroup(groupId, pageId);
  if (prevId) setTimeout(()=>{ const el = document.querySelector(`.todo-item[data-item-id="${prevId}"] .todo-text-input`); if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);} }, 30);
  updateStats();
}

function refreshGroup(groupId, pageId) {
  const group = findGroup(groupId);
  if (!group) return;
  const existing = document.querySelector(`.group-card[data-group-id="${groupId}"]`);
  if (existing) {
    const newCard = renderGroupCard(group, pageId);
    existing.replaceWith(newCard);
    applyEditorSettings();
  }
}

/* ─────────────────────────────────────────────
   6. GROUP OPERATIONS
───────────────────────────────────────────── */
function addGroup(pageId, name='') {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const g = {id:uid(), name, items:[]};
  page.groups.push(g);
  saveState(); renderEditor();
  setTimeout(()=>{ const el = document.querySelector(`[data-group-id="${g.id}"].group-name-input`); if(el) el.focus(); }, 50);
}

function deleteGroup(pageId, groupId) {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const g = page.groups.find(g=>g.id===groupId);
  if (g && g.items.length > 0 && !confirm(`Hapus group "${g.name||'tanpa nama'}" dan ${g.items.length} item?`)) return;
  page.groups = page.groups.filter(g=>g.id!==groupId);
  saveState(); renderEditor();
}

function moveGroup(pageId, groupId, dir) {
  const page = state.pages.find(p=>p.id===pageId);
  if (!page) return;
  const idx = page.groups.findIndex(g=>g.id===groupId);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= page.groups.length) return;
  [page.groups[idx], page.groups[newIdx]] = [page.groups[newIdx], page.groups[idx]];
  saveState(); renderEditor();
}

/* ─────────────────────────────────────────────
   7. PAGE OPERATIONS
───────────────────────────────────────────── */
function addPage(title='Halaman Baru') {
  state.pages.push({id:uid(), title, groups:[]});
  saveState(); renderEditor();
  setTimeout(()=>{ const cards = document.querySelectorAll('.page-card'); if(cards.length) cards[cards.length-1].scrollIntoView({behavior:'smooth',block:'start'}); }, 50);
}

function deletePage(pageId) {
  if (state.pages.length <= 1) { toast('Minimal satu halaman harus ada'); return; }
  if (!confirm('Hapus halaman ini?')) return;
  state.pages = state.pages.filter(p=>p.id!==pageId);
  saveState(); renderEditor();
}

function movePage(pageId, dir) {
  const idx = state.pages.findIndex(p=>p.id===pageId);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.pages.length) return;
  [state.pages[idx], state.pages[newIdx]] = [state.pages[newIdx], state.pages[idx]];
  saveState(); renderEditor();
}

/* ─────────────────────────────────────────────
   8. SETTINGS
───────────────────────────────────────────── */
function initSettings() {
  const panel   = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');

  document.getElementById('btn-settings').addEventListener('click', () => {
    panel.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  });
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);

  bindTextInput('doc-title', v => { state.docTitle = v; if(state.mode==='wall') renderWall(); });
  bindTextInput('doc-subtitle', v => { state.docSubtitle = v; if(state.mode==='wall') renderWall(); });

  // Colors
  setupColorPair('color-accent-text','color-accent-picker','csw-accent', v => {
    state.accentColor = v;
    document.documentElement.style.setProperty('--accent', v);
    saveState();
  }, state.accentColor);

  setupColorPair('color-header-text','color-header-picker','csw-header', v => {
    state.headerColor = v;
    document.documentElement.style.setProperty('--header-bg', v);
    saveState();
  }, state.headerColor);

  // Col layout
  document.querySelectorAll('[name="col-layout"]').forEach(r => {
    r.checked = r.value === state.colLayout;
    r.addEventListener('change', () => {
      state.colLayout = r.value;
      document.querySelectorAll('.groups-grid').forEach(g => g.classList.toggle('cols-2', state.colLayout==='2'));
      saveState();
    });
  });

  // Font size
  bindRange('font-size-range','font-size-label', v => {
    state.itemFontSize = v;
    document.documentElement.style.setProperty('--item-fs', v+'px');
    saveState();
  }, state.itemFontSize, v=>v+'px');

  // Progress
  const progEl = document.getElementById('show-progress');
  progEl.checked = state.showProgress;
  progEl.addEventListener('change', () => { state.showProgress = progEl.checked; saveState(); renderEditor(); });

  // Wall theme
  document.querySelectorAll('[name="wall-theme"]').forEach(r => {
    r.checked = r.value === state.wallTheme;
    r.addEventListener('change', () => {
      state.wallTheme = r.value;
      applyWallTheme(r.value);
      saveState();
    });
  });

  // Items per page
  bindRange('items-per-page','ipp-label', v => {
    state.itemsPerPage = v;
    if (state.mode==='wall') renderWall();
    saveState();
  }, state.itemsPerPage, v=>String(v));
}

function bindTextInput(id, cb) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => { cb(el.value); saveState(); });
}

function bindRange(rangeId, labelId, cb, initial, fmt) {
  const range = document.getElementById(rangeId);
  const label = document.getElementById(labelId);
  if (!range || !label) return;
  range.value = initial;
  label.textContent = fmt(initial);
  range.addEventListener('input', () => {
    const v = parseInt(range.value);
    label.textContent = fmt(v);
    cb(v);
  });
}

function setupColorPair(textId, pickerId, swatchId, onChange, initial) {
  const textEl   = document.getElementById(textId);
  const pickerEl = document.getElementById(pickerId);
  const swatchEl = document.getElementById(swatchId);
  if (!textEl || !pickerEl || !swatchEl) return;
  textEl.value = initial; pickerEl.value = initial; swatchEl.style.background = initial;
  pickerEl.addEventListener('input', () => {
    const v = pickerEl.value.toUpperCase();
    textEl.value = v; swatchEl.style.background = v; onChange(v);
  });
  textEl.addEventListener('input', () => {
    const v = textEl.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      pickerEl.value = v; swatchEl.style.background = v; onChange(v.toUpperCase());
    }
  });
}

function closeSettings() {
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('settings-overlay').classList.add('hidden');
}

function applyEditorSettings() {
  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-fs', state.itemFontSize+'px');
  document.querySelectorAll('.groups-grid').forEach(g => g.classList.toggle('cols-2', state.colLayout==='2'));
  document.querySelectorAll('.todo-text-input').forEach(ta => autoResize(ta));
}

/* ─────────────────────────────────────────────
   9. DRAG & DROP (groups)
───────────────────────────────────────────── */
let dragSrc = null;

function setupGroupDragDrop(grid, pageId) {
  grid.addEventListener('dragstart', e => {
    const card = e.target.closest('.group-card');
    if (!card) return;
    dragSrc = { groupId: card.dataset.groupId, pageId };
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  grid.addEventListener('dragend', () => {
    document.querySelectorAll('.group-card.dragging,.group-card.drag-over').forEach(el => {
      el.classList.remove('dragging','drag-over');
    });
    dragSrc = null;
  });
  grid.addEventListener('dragover', e => {
    e.preventDefault();
    const card = e.target.closest('.group-card');
    if (card && dragSrc && card.dataset.groupId !== dragSrc.groupId) {
      document.querySelectorAll('.group-card.drag-over').forEach(el => el.classList.remove('drag-over'));
      card.classList.add('drag-over');
    }
  });
  grid.addEventListener('dragleave', e => {
    const card = e.target.closest('.group-card');
    if (card) card.classList.remove('drag-over');
  });
  grid.addEventListener('drop', e => {
    e.preventDefault();
    const targetCard = e.target.closest('.group-card');
    if (!targetCard || !dragSrc || dragSrc.pageId !== pageId) return;
    const tgtId = targetCard.dataset.groupId;
    if (tgtId === dragSrc.groupId) return;
    const page = state.pages.find(p=>p.id===pageId);
    if (!page) return;
    const si = page.groups.findIndex(g=>g.id===dragSrc.groupId);
    const ti = page.groups.findIndex(g=>g.id===tgtId);
    if (si<0||ti<0) return;
    const arr = [...page.groups];
    const [m] = arr.splice(si,1);
    arr.splice(ti,0,m);
    page.groups = arr;
    saveState();
    grid.innerHTML = '';
    page.groups.forEach(g => grid.appendChild(renderGroupCard(g, pageId)));
    applyEditorSettings();
  });
}

/* ─────────────────────────────────────────────
   10. STATS
───────────────────────────────────────────── */
function updateStats() {
  let total=0, done=0;
  state.pages.forEach(p=>p.groups.forEach(g=>{ total+=g.items.length; done+=g.items.filter(i=>i.done).length; }));
  document.getElementById('stat-total').textContent = `${total} item`;
  document.getElementById('stat-done').textContent  = `${done} selesai`;
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
let _tt;
function toast(msg, ms=2200) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('show'),ms);
}

/* ─────────────────────────────────────────────
   11. PERSISTENCE
───────────────────────────────────────────── */
const STORAGE_KEY = 'taskflow_v3';
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { Object.assign(state, JSON.parse(raw)); return true; }
  } catch(e) {}
  return false;
}

/* ─────────────────────────────────────────────
   DEFAULT DATA — from PDF
───────────────────────────────────────────── */
function loadDefaultData() {
  state.pages = [
    {
      id: uid(), title: 'Web Docflow',
      groups: [
        { id: uid(), name: 'Selesaikan Web Docflow', items: [
            { id: uid(), text: 'Perbaiki Tampilan preview History', done: false, priority: 'high', tag: '' },
            { id: uid(), text: 'Menambah detail kecil di mode manual, history, dan setting', done: false, priority: 'mid', tag: '' },
            { id: uid(), text: 'Memasukan Fitur Download PDF', done: false, priority: 'high', tag: 'feature' },
          ]
        },
      ]
    },
    {
      id: uid(), title: 'Web Memories',
      groups: [
        { id: uid(), name: 'Update Web Memories', items: [
            { id: uid(), text: 'Menambahkan Web Memories Generator', done: false, priority: 'mid', tag: '' },
            { id: uid(), text: 'Music player menjadi floating bottom + mode icon', done: false, priority: 'low', tag: 'UI' },
            { id: uid(), text: 'Tambahkan 1 atau 2 column view, dan color picker', done: false, priority: 'low', tag: 'feature' },
          ]
        },
      ]
    },
    {
      id: uid(), title: 'Web Zanxa Site',
      groups: [
        { id: uid(), name: 'Update Web Zanxa Site', items: [
            { id: uid(), text: 'Menambahkan Data Real (ig, wa, maps)', done: false, priority: 'high', tag: 'content' },
            { id: uid(), text: 'Update Tampilannya (Menambah Elemen di header, dll)', done: false, priority: 'mid', tag: 'UI' },
            { id: uid(), text: 'Menggunakan Foto Real untuk proyek dan komentar', done: false, priority: 'high', tag: 'content' },
            { id: uid(), text: 'Perbaiki Layout nya', done: false, priority: 'mid', tag: 'UI' },
            { id: uid(), text: 'Tambahkan halaman lain selain index.html', done: false, priority: 'mid', tag: 'feature' },
            { id: uid(), text: 'Memasukan Desain Real ke Halaman Design', done: false, priority: 'low', tag: 'UI' },
            { id: uid(), text: 'Buat Pricelist untuk Web dan Design', done: false, priority: 'mid', tag: 'feature' },
            { id: uid(), text: 'Tambahkan Blog nyata — minimal 3, dan ada di home', done: false, priority: 'mid', tag: 'content' },
          ]
        },
      ]
    },
    {
      id: uid(), title: 'Web Undangan Digital',
      groups: [
        { id: uid(), name: 'Buat Web Undangan Digital', items: [
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

/* ─────────────────────────────────────────────
   MODE SWITCH
───────────────────────────────────────────── */
function switchMode(mode) {
  state.mode = mode;
  document.body.className = 'mode-' + mode;

  const editorView = document.getElementById('editor-view');
  const wallView   = document.getElementById('wall-view');

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'editor') {
    editorView.classList.remove('hidden');
    wallView.classList.add('hidden');
    // Show editor settings, hide wall settings
    document.getElementById('editor-settings').style.display = '';
    document.getElementById('wall-settings').style.display = 'none';
    renderEditor();
  } else {
    editorView.classList.add('hidden');
    wallView.classList.remove('hidden');
    document.getElementById('editor-settings').style.display = 'none';
    document.getElementById('wall-settings').style.display = '';
    applyWallTheme(state.wallTheme);
    renderWall();
  }
  saveState();
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hasState = loadState();
  if (!hasState) loadDefaultData();

  initSettings();

  // Restore doc title / subtitle inputs
  const dtEl = document.getElementById('doc-title');
  const dsEl = document.getElementById('doc-subtitle');
  if (dtEl) dtEl.value = state.docTitle || 'TODO LIST';
  if (dsEl) dsEl.value = state.docSubtitle || '';

  // Mode switch buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Toolbar buttons
  document.getElementById('btn-add-page').addEventListener('click', () => addPage());
  document.getElementById('btn-add-group').addEventListener('click', () => {
    if (!state.pages.length) { addPage(); return; }
    addGroup(state.pages[state.pages.length-1].id);
  });

  // Print
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  // Keyboard
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey||e.metaKey) && e.key==='p') { e.preventDefault(); window.print(); }
  });

  // Apply saved CSS vars
  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--header-bg', state.headerColor);
  document.documentElement.style.setProperty('--item-fs', state.itemFontSize+'px');

  // Initial render
  switchMode(state.mode || 'editor');

  // Sync wall settings radio
  document.querySelectorAll('[name="wall-theme"]').forEach(r => { r.checked = r.value===state.wallTheme; });
  document.getElementById('items-per-page').value = state.itemsPerPage;
  document.getElementById('ipp-label').textContent = state.itemsPerPage;
  document.getElementById('font-size-range').value = state.itemFontSize;
  document.getElementById('font-size-label').textContent = state.itemFontSize+'px';

  toast('✦ Taskflow siap. Klik "Wall Print" untuk preview tempel.');
});
