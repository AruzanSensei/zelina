/* =====================================================
   app.js — DevHub Entry Point
   Phase 1+2+3: Full app with Search, Activity Filter,
                Auto-refresh, Micro-interactions,
                Mobile Swipe, Keyboard Nav, A11y
   ===================================================== */

import storage  from './modules/storage.js';
import settings from './modules/settings.js';
import scanner  from './modules/scanner.js';
import parser   from './modules/parser.js';
import renderer from './modules/renderer.js';
import search   from './modules/search.js';

/* ─────────────────────────────────────────────────
   Lucide icon system with per-icon stroke-width
   Depth philosophy:
     1.5 → decorative / contextual / background
     2.0 → standard navigation / structural
     2.5 → primary actions / interactive
     2.75→ critical / emphasis / warnings
───────────────────────────────────────────────── */
const STROKE_MAP = {
  // ── Contextual / decorative (thin 1.5) ────────
  'info':          1.5,
  'help-circle':   1.5,
  'calendar':      1.5,
  'clock':         1.5,
  'loader-2':      1.5,
  'circle':        1.5,
  'layers':        1.5,
  'image':         1.5,
  'video':         1.5,
  'file':          1.5,
  'file-type-2':   1.5,
  'code-2':        1.5,
  'moon':          1.5,
  'bar-chart-2':   1.5,

  // ── Navigation / structural (regular 2.0) ─────
  'folder':          2,
  'folder-open':     2,
  'folder-plus':     2,
  'file-text':       2,
  'layout-dashboard':2,
  'activity':        2,
  'settings':        2,
  'clipboard-list':  2,
  'clipboard':       2,
  'archive':         2,
  'tag':             2,
  'keyboard':        2,
  'menu':            2,
  'list':            2,
  'layout-grid':     2,
  'chevron-left':    2,
  'chevron-down':    2,
  'chevron-right':   2,
  'pencil':          2,
  'save':            2,
  'search':          2,
  'paperclip':       2,

  // ── Primary actions / interactive (bold 2.5) ──
  'plus':            2.5,
  'plus-circle':     2.5,
  'check':           2.5,
  'check-circle-2':  2.5,
  'check-square':    2.5,
  'x':               2.5,
  'x-circle':        2.5,
  'trash-2':         2.5,
  'refresh-cw':      2.5,
  'download':        2.5,

  // ── Critical / warnings (heavy 2.75) ──────────
  'alert-triangle':  2.75,
  'alert-circle':    2.75,
  'zap':             2.75,
};

function ic(name, size = 16, color = '') {
  const sw  = STROKE_MAP[name] ?? 2;
  const col = color ? `color:${color};` : '';
  // Wrapper span persists after lucide replaces <i> with <svg>
  return `<span class="ic" data-sw="${sw}" style="display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
    <i data-lucide="${name}" style="width:${size}px;height:${size}px;${col}"></i>
  </span>`;
}

function ric(el = document) {
  if (!window.lucide) return;
  const scope = el === document ? null : [...el.querySelectorAll('[data-lucide]')];
  window.lucide.createIcons({ nameAttr: 'data-lucide', nodes: scope });
  // Apply per-icon stroke-width after Lucide replaces <i> → <svg>
  const wrappers = el === document
    ? document.querySelectorAll('.ic[data-sw]')
    : el.querySelectorAll('.ic[data-sw]');
  wrappers.forEach(wrap => {
    const svg = wrap.querySelector('svg');
    if (svg) svg.setAttribute('stroke-width', wrap.dataset.sw);
  });
}

/* ═══════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════ */
const state = {
  workspaces:        [],
  projects:          [],
  projectHandles:    {},   // projectId → DirectoryHandle
  projectTasks:      {},   // projectId → { raw, tasks, stats }
  activeWorkspaceId: null,
  activeProjectId:   null,
  currentPage:       'dashboard',
  writeModeOn:       false,
  sidebarOpen:       true,
  searchOpen:        false,
  // Project detail
  activeTab:         'todo',
  todoFilter:        'all',
  todoSort:          'default',
  collapsedSections: new Set(),
  promptFiles:       [],
  assetFiles:        [],
  assetView:         'grid',
  assetTypeFilter:   'all',
  // Activity filter
  activityFilter:    { type: 'all', projectId: 'all' },
  // Auto-refresh
  lastRefreshTs:     0,
};

/* Mock data for dashboard when no real data */
const MOCK_STATS    = { total: 42, doneToday: 8, overdue: 3, inProgress: 12 };
const MOCK_PROJECTS = [
  { id: 'mock1', name: 'project-alpha', done: 8, total: 10 },
  { id: 'mock2', name: 'project-beta',  done: 0, total: 5  },
  { id: 'mock3', name: 'project-gamma', done: 7, total: 7  }
];
const MOCK_ACTIVITY = [
  { type:'task_complete',   description:'Completed <strong>Setup CI/CD</strong>',      project:'project-alpha', ts: Date.now() - 2*60000   },
  { type:'task_add',        description:'Created <strong>Fix login bug</strong>',       project:'project-beta',  ts: Date.now() - 60*60000  },
  { type:'workspace_add',   description:'Added workspace <strong>Client Work</strong>', project: null,           ts: Date.now() - 3*3600000 },
  { type:'task_complete',   description:'Completed <strong>Write unit tests</strong>',  project:'project-gamma', ts: Date.now() - 5*3600000 },
  { type:'project_refresh', description:'Refreshed <strong>project-alpha</strong>',    project:'project-alpha', ts: Date.now() - 8*3600000 }
];

/* ═══════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════ */
async function init() {
  if (!('showDirectoryPicker' in window)) {
    document.getElementById('browser-unsupported').classList.add('visible');
    document.getElementById('app').style.display = 'none';
    return;
  }

  await storage.initDefaults();
  await settings.load();

  state.workspaces = await storage.getWorkspaces();
  state.projects   = await storage.getProjects();

  bindEvents();
  bindMobileSwipe();
  bindAutoRefresh();
  renderSidebar();
  navigateTo('dashboard');

  // Rebuild search index if we have cached tasks
  rebuildSearchIndex();
}

/* ═══════════════════════════════════════════════════
   EVENT BINDING
═══════════════════════════════════════════════════ */
function bindEvents() {
  // Sidebar
  document.getElementById('hamburger-btn').addEventListener('click', toggleMobileSidebar);
  document.getElementById('sidebar-backdrop').addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebar-collapse-btn').addEventListener('click', toggleSidebar);

  // Theme
  document.getElementById('theme-toggle').addEventListener('click', () => settings.toggleTheme());

  // Write mode
  document.getElementById('write-toggle').addEventListener('click', toggleWriteMode);

  // User dropdown
  const avatarBtn = document.getElementById('user-avatar-btn');
  const userDrop  = document.getElementById('user-dropdown');
  avatarBtn.addEventListener('click', e => { e.stopPropagation(); userDrop.classList.toggle('visible'); });
  document.getElementById('user-menu-settings')?.addEventListener('click', () => { navigateTo('settings'); userDrop.classList.remove('visible'); });
  document.getElementById('user-menu-activity')?.addEventListener('click', () => { navigateTo('activity'); userDrop.classList.remove('visible'); });

  // Search
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('focus', () => {
    state.searchOpen = true;
    updateSearchDropdown(searchInput.value);
  });
  searchInput.addEventListener('input', e => {
    search.queryDebounced(e.target.value, result => renderSearchDropdown(result, e.target.value), 200);
    if (!e.target.value.trim()) document.getElementById('search-dropdown').classList.remove('visible');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeydown);

  // Block right-click context menu (except in inputs/textareas)
  document.addEventListener('contextmenu', e => {
    const tag = e.target.tagName.toLowerCase();
    const isEditable = ['input','textarea','select'].includes(tag) || e.target.isContentEditable;
    if (!isEditable) e.preventDefault();
  });

  // Outside click close
  document.addEventListener('click', e => {
    if (!e.target.closest('#user-avatar-btn'))  userDrop.classList.remove('visible');
    if (!e.target.closest('.search-wrapper'))   closeSearch();
    if (!e.target.closest('#asset-modal .asset-modal-inner')) {
      const modal = document.getElementById('asset-modal');
      if (e.target === modal) closeAssetModal();
    }
  });

  // Sidebar nav
  document.getElementById('nav-dashboard').addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('nav-settings').addEventListener('click',  () => navigateTo('settings'));
  document.getElementById('nav-activity').addEventListener('click',  () => navigateTo('activity'));

  // Add Workspace
  document.getElementById('add-workspace-btn').addEventListener('click',   addWorkspace);
  document.getElementById('add-workspace-btn-2').addEventListener('click', addWorkspace);

  // Confirm modal
  document.getElementById('confirm-cancel-btn').addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-modal')?.addEventListener('click', e => {
    if (e.target.id === 'confirm-modal') closeConfirmModal();
  });

  // Asset modal
  document.getElementById('asset-modal-close-btn')?.addEventListener('click', closeAssetModal);
}

/* ═══════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════ */
function handleKeydown(e) {
  const mod = navigator.platform.startsWith('Mac') ? e.metaKey : e.ctrlKey;

  // Global shortcuts
  if (mod && e.key === 'k') { e.preventDefault(); focusSearch(); return; }
  if (mod && e.key === 'b') { e.preventDefault(); toggleSidebar(); return; }
  if (mod && e.key === 'w') { e.preventDefault(); toggleWriteMode(); return; }
  if (mod && e.key === 'r') {
    e.preventDefault();
    if (state.activeProjectId) refreshActiveProject();
    return;
  }
  if (mod && e.key === 'n') {
    e.preventDefault();
    if (state.activeProjectId && state.writeModeOn) {
      document.getElementById('add-task-btn')?.click();
    }
    return;
  }

  // Escape
  if (e.key === 'Escape') {
    closeSearch();
    closeConfirmModal();
    closeAssetModal();
    document.getElementById('user-dropdown').classList.remove('visible');
    // Cancel add task form
    document.getElementById('add-task-cancel-btn')?.click();
    return;
  }

  // Search navigation
  if (state.searchOpen) {
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateSearchResults(1);  return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navigateSearchResults(-1); return; }
    if (e.key === 'Enter') {
      const focused = document.querySelector('.search-result-item.focused');
      if (focused) { focused.click(); return; }
    }
  }
}

/* ═══════════════════════════════════════════════════
   MOBILE SWIPE GESTURE
═══════════════════════════════════════════════════ */
function bindMobileSwipe() {
  const sidebar  = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dy > 50) return; // mostly vertical swipe — ignore

    // Swipe right from left edge → open sidebar
    if (touchStartX < 30 && dx > 60) {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('visible');
    }
    // Swipe left on open sidebar → close
    if (sidebar.classList.contains('mobile-open') && dx < -60) {
      closeMobileSidebar();
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   AUTO-REFRESH ON FOCUS
═══════════════════════════════════════════════════ */
function bindAutoRefresh() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const now    = Date.now();
    const DELAY  = 2000;
    if (now - state.lastRefreshTs < DELAY) return;

    // Only auto-refresh settings say so
    if (!settings.get('autoRefresh', true)) return;

    if (state.activeProjectId) {
      state.lastRefreshTs = now;
      setTimeout(async () => {
        await refreshProjectData(state.activeProjectId);
        rerenderTodoAfterWrite(state.activeProjectId);
        toast.info('Project synced.', 2500);
      }, 500);
    }
  });
}

async function refreshActiveProject() {
  if (!state.activeProjectId) return;
  const btn = document.querySelector('#project-refresh-btn');
  btn?.classList.add('refresh-spinning');
  await refreshProjectData(state.activeProjectId);
  const project = state.projects.find(p => p.id === state.activeProjectId);
  await storage.logActivity({ type: 'project_refresh', description: `Refreshed ${project?.name}` });
  toast.success(`${project?.name} refreshed.`);
  rerenderTodoAfterWrite(state.activeProjectId);
  setTimeout(() => btn?.classList.remove('refresh-spinning'), 600);
}

/* ═══════════════════════════════════════════════════
   WRITE MODE
═══════════════════════════════════════════════════ */
function toggleWriteMode() {
  if (!state.writeModeOn) {
    showConfirmModal(
      '⚡ Enable Write Mode?',
      'Changes you make will be <strong>saved directly to your files</strong> on disk.',
      'Enable Write Mode',
      () => {
        state.writeModeOn = true;
        applyWriteMode(true);
        closeConfirmModal();
        toast.warning('Write mode enabled — changes saved to disk.');
        if (state.activeProjectId) selectProject(state.activeProjectId);
      }
    );
  } else {
    state.writeModeOn = false;
    applyWriteMode(false);
    toast.info('Write mode disabled.');
    if (state.activeProjectId) selectProject(state.activeProjectId);
  }
}

function applyWriteMode(on) {
  const toggle = document.getElementById('write-toggle');
  const banner = document.getElementById('write-banner');
  toggle?.classList.toggle('active', on);
  banner?.classList.toggle('visible', on);
  toggle?.querySelector('.write-toggle-thumb') &&
    (toggle.querySelector('.write-toggle-thumb').textContent = on ? 'Write' : 'Read');
  toggle?.setAttribute('aria-checked', String(on));
}

/* ═══════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════ */
function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !state.sidebarOpen);
}
function toggleMobileSidebar() {
  const open = document.getElementById('sidebar').classList.contains('mobile-open');
  document.getElementById('sidebar').classList.toggle('mobile-open', !open);
  document.getElementById('sidebar-backdrop').classList.toggle('visible', !open);
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-backdrop').classList.remove('visible');
}

function renderSidebar() { renderWorkspaceList(); renderProjectList(); }

function renderWorkspaceList() {
  const list = document.getElementById('workspace-list');
  list.innerHTML = '';
  if (!state.workspaces.length) {
    list.innerHTML = '<p style="font-size:12px;color:var(--color-secondary);padding:4px 12px;">No workspaces yet</p>';
    return;
  }
  state.workspaces.forEach(ws => {
    const btn = document.createElement('button');
    btn.className = `sidebar-item${state.activeWorkspaceId === ws.id ? ' active' : ''}`;
    btn.setAttribute('aria-label', `Workspace: ${ws.name}`);
    btn.innerHTML = `<span class="item-icon">${ic('layers', 15)}</span><span class="item-label">${escHtml(ws.name)}</span>`;
    btn.addEventListener('click', () => selectWorkspace(ws.id));
    list.appendChild(btn);
    ric(btn);
  });
}

function renderProjectList() {
  const list = document.getElementById('project-list');
  list.innerHTML = '';
  const projects = state.projects.filter(p =>
    !state.activeWorkspaceId || p.workspaceId === state.activeWorkspaceId
  );
  if (!projects.length) {
    list.innerHTML = '<p style="font-size:12px;color:var(--color-secondary);padding:4px 12px;">No projects found</p>';
    return;
  }
  projects.forEach(p => {
    const btn = document.createElement('button');
    btn.className = `sidebar-item${state.activeProjectId === p.id ? ' active' : ''}`;
    btn.setAttribute('aria-label', `Project: ${p.name}`);
    const badge = p.pendingCount ? `<span class="item-badge">${p.pendingCount}</span>` : '';
    btn.innerHTML = `<span class="item-icon">${ic('folder', 15)}</span><span class="item-label">${escHtml(p.name)}</span>${badge}`;
    btn.addEventListener('click', () => selectProject(p.id));
    list.appendChild(btn);
    ric(btn);
  });
}

function renderSettingsWorkspaceList() {
  const list = document.getElementById('settings-workspace-list');
  if (!list) return;
  list.innerHTML = '';
  if (!state.workspaces.length) {
    list.innerHTML = '<p style="color:var(--color-secondary);font-size:13px;">No workspaces added yet.</p>';
    return;
  }
  state.workspaces.forEach(ws => {
    const div = document.createElement('div');
    div.className = 'workspace-list-item';
    div.innerHTML = `
      <span class="workspace-list-item-icon">${ic('folder', 18, 'var(--color-accent)')}</span>
      <div class="workspace-list-item-info">
        <div class="workspace-list-item-name">${escHtml(ws.name)}</div>
        <div class="workspace-list-item-path">${escHtml(ws.path || '')}</div>
      </div>
      <button class="btn btn-sm btn-danger remove-ws-btn" data-id="${ws.id}" aria-label="Remove ${escHtml(ws.name)}">Remove</button>
    `;
    div.querySelector('.remove-ws-btn').addEventListener('click', () => {
      showConfirmModal(
        `${ic('trash-2',14)} Remove Workspace?`,
        `Remove <strong>${escHtml(ws.name)}</strong>? Local files won't be deleted.`,
        'Remove',
        async () => {
          await storage.removeWorkspace(ws.id);
          state.workspaces = state.workspaces.filter(w => w.id !== ws.id);
          state.projects   = state.projects.filter(p => p.workspaceId !== ws.id);
          renderSidebar();
          renderSettingsWorkspaceList();
          toast.success('Workspace removed.');
          closeConfirmModal();
        }, true
      );
    });
    list.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════
   SETTINGS CONTROLS
═══════════════════════════════════════════════════ */
function bindSettingsControls(ctx = document) {
  const $ = id => ctx.querySelector(`#${id}`);
  const s = $('setting-language');
  if (s) { s.value = settings.get('language','ID'); s.addEventListener('change', e => settings.set('language', e.target.value)); }
  const v = $('setting-default-view');
  if (v) { v.value = settings.get('defaultView','dashboard'); v.addEventListener('change', e => settings.set('defaultView', e.target.value)); }
  [
    ['setting-auto-refresh',   'autoRefresh',      true ],
    ['setting-show-completed', 'showCompleted',     true ],
    ['setting-confirm-write',  'confirmWrite',      true ],
    ['setting-compact-mode',   'compactMode',       false],
    ['setting-show-badges',    'showProjectBadges', true ]
  ].forEach(([id, key, def]) => {
    const el = $(id); if (!el) return;
    el.checked = settings.get(key, def);
    el.addEventListener('change', e => settings.set(key, e.target.checked));
  });
  const tt = $('setting-theme');
  if (tt) { tt.checked = settings.get('theme','light') === 'dark'; tt.addEventListener('change', e => settings.set('theme', e.target.checked ? 'dark' : 'light')); }
  const fs = $('font-size-slider');
  if (fs) {
    fs.value = settings.get('fontSize', 14);
    const fd = $('font-size-display'); if (fd) fd.textContent = `${fs.value}px`;
    fs.addEventListener('input', e => { settings.set('fontSize', +e.target.value); if (fd) fd.textContent = `${e.target.value}px`; });
  }
  const sw = $('sidebar-width-slider');
  if (sw) {
    sw.value = settings.get('sidebarWidth', 240);
    const sd = $('sidebar-width-display'); if (sd) sd.textContent = `${sw.value}px`;
    sw.addEventListener('input', e => { settings.set('sidebarWidth', +e.target.value); if (sd) sd.textContent = `${e.target.value}px`; });
  }
}

/* ═══════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════ */
function navigateTo(page) {
  state.currentPage     = page;
  state.activeProjectId = null;

  ['dashboard','settings','activity'].forEach(p =>
    document.getElementById(`nav-${p}`)?.classList.toggle('active', p === page)
  );

  const main = document.getElementById('main-content');
  main.innerHTML = '';
  switch (page) {
    case 'dashboard': renderDashboard(main);    break;
    case 'settings':  renderSettingsPage(main); break;
    case 'activity':  renderActivityPage(main); break;
    default:          renderDashboard(main);
  }

  document.getElementById('breadcrumb').innerHTML = `
    <span>DevHub</span><span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-active">${{ dashboard:'Dashboard', settings:'Settings', activity:'Activity Log' }[page] || escHtml(page)}</span>
  `;

  closeMobileSidebar();
  renderSidebar();
}

function selectWorkspace(id) {
  state.activeWorkspaceId = id;
  state.activeProjectId   = null;
  renderSidebar();
  navigateTo('dashboard');
}

/* ═══════════════════════════════════════════════════
   ADD WORKSPACE
═══════════════════════════════════════════════════ */
async function addWorkspace() {
  try {
    const rootHandle = await window.showDirectoryPicker({ mode: 'read' });
    const ws = await storage.saveWorkspace(rootHandle);
    state.workspaces.push(ws);

    toast.info(`Scanning "${ws.name}"...`);

    const found = await scanner.scanWorkspace(rootHandle);
    for (const proj of found) {
      const saved = await storage.saveProject({
        id: proj.id, name: proj.name, workspaceId: ws.id,
        hasTodo: proj.hasTodo, hasPrompts: proj.hasPrompts,
        hasAssets: proj.hasAssets, pendingCount: 0
      });
      state.projectHandles[proj.id] = proj.handle;
      state.projects.push({ ...saved });
    }

    await storage.logActivity({ type: 'workspace_add', description: `Added workspace "${ws.name}" with ${found.length} project(s)` });
    toast.success(`"${ws.name}" added — ${found.length} project(s) found.`);
    rebuildSearchIndex();
    renderSidebar();
    if (state.currentPage === 'dashboard') navigateTo('dashboard');
    if (state.currentPage === 'settings')  renderSettingsWorkspaceList();
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('addWorkspace:', err);
      toast.error('Could not access folder. Check browser permissions.');
    }
  }
}

/* ═══════════════════════════════════════════════════
   SELECT PROJECT
═══════════════════════════════════════════════════ */
async function selectProject(id) {
  state.activeProjectId   = id;
  state.activeTab         = 'todo';
  state.collapsedSections = new Set();
  state.activeWorkspaceId = state.projects.find(p => p.id === id)?.workspaceId || state.activeWorkspaceId;
  renderSidebar();

  const main    = document.getElementById('main-content');
  const project = state.projects.find(p => p.id === id);
  const wsName  = state.workspaces.find(w => w.id === project?.workspaceId)?.name || 'Workspace';

  document.getElementById('breadcrumb').innerHTML = `
    <span>DevHub</span><span class="breadcrumb-sep">›</span>
    <span>${escHtml(wsName)}</span><span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-active">${escHtml(project?.name || id)}</span>
  `;

  main.innerHTML = `
    <div class="empty-state" style="min-height:400px">
      <div class="empty-state-icon">${ic('loader-2', 48, 'var(--color-accent)')}</div>
      <h2>Loading ${escHtml(project?.name || 'project')}...</h2>
    </div>`;
  ric(main);

  await loadProjectDetail(main, project, id);
}

async function loadProjectDetail(main, project, projectId) {
  let dirHandle = state.projectHandles[projectId];
  if (dirHandle) {
    const ok = await scanner.verifyPermission(dirHandle, false).catch(() => false);
    if (!ok) dirHandle = null;
  }

  if (!state.projectTasks[projectId] && dirHandle) {
    const raw = await scanner.readTodoFile(dirHandle);
    if (raw !== null) {
      const result = parser.parse(raw, projectId);
      state.projectTasks[projectId] = { raw, ...result, stats: parser.getStats(result.tasks) };
      search.updateIndex(project, result.tasks);
    }
  }

  const cached    = state.projectTasks[projectId];
  const tasks     = cached?.tasks || [];
  const stats     = cached?.stats || parser.getStats([]);
  const rawMd     = cached?.raw   || '';
  const hasHandle = !!dirHandle;

  main.innerHTML = '';
  const { tabContent } = renderer.renderProjectPage(main, project, stats, state.activeTab);

  // Tab switching
  main.querySelectorAll('.project-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      main.querySelectorAll('.project-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const fresh = state.projectTasks[projectId];
      renderActiveTab(tabContent, project, projectId, fresh?.tasks || [], fresh?.raw || '', hasHandle);
    });
  });

  // Refresh button
  const refreshBtn = main.querySelector('#project-refresh-btn');
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.classList.add('refresh-spinning');
    await refreshProjectData(projectId);
    const fresh   = state.projectTasks[projectId];
    const newStats = fresh?.stats || parser.getStats([]);
    // Update progress bar without full re-render
    const bar   = main.querySelector('#project-progress-bar');
    const label = main.querySelector('.project-progress-label');
    if (bar)   bar.style.width   = `${newStats.pct}%`;
    if (label) label.textContent = `${newStats.done}/${newStats.total} tasks done (${newStats.pct}%)`;
    const tc = main.querySelector('#tab-todo .tab-count');
    if (tc) tc.textContent = newStats.total;
    renderActiveTab(tabContent, project, projectId, fresh?.tasks || [], fresh?.raw || '', hasHandle);
    setTimeout(() => refreshBtn.classList.remove('refresh-spinning'), 600);
    toast.success(`${project?.name} refreshed.`);
    await storage.logActivity({ type: 'project_refresh', description: `Refreshed ${project?.name}` });
  });

  // No-handle warning
  if (!hasHandle) {
    const warn = document.createElement('div');
    warn.className = 'error-banner';
    warn.style.cssText = 'margin:0 var(--space-8) var(--space-4);';
    warn.setAttribute('role', 'alert');
    warn.innerHTML = `
      ${ic('alert-triangle', 14, '#92400E')} <strong>Folder access lost.</strong> Re-add workspace to read files.
      <button class="btn btn-sm btn-secondary" style="margin-left:auto" id="reauth-btn" aria-label="Reconnect folder">Reconnect</button>
    `;
    ric(warn);
    warn.querySelector('#reauth-btn')?.addEventListener('click', async () => {
      try {
        const h = await window.showDirectoryPicker({ mode: 'read' });
        state.projectHandles[projectId] = h;
        await loadProjectDetail(main, project, projectId);
      } catch (e) {
        if (e.name !== 'AbortError') toast.error('Could not access folder.');
      }
    });
    main.insertBefore(warn, tabContent);
  }

  renderActiveTab(tabContent, project, projectId, tasks, rawMd, hasHandle);
  state.lastRefreshTs = Date.now();
}

function renderActiveTab(tabContent, project, projectId, tasks, rawMd, hasHandle) {
  tabContent.innerHTML = '';
  switch (state.activeTab) {
    case 'todo':    renderTodoTabContent(tabContent, project, projectId, tasks, rawMd, hasHandle); break;
    case 'prompts': renderPromptsTabContent(tabContent, project, projectId, hasHandle);            break;
    case 'assets':  renderAssetsTabContent(tabContent, project, projectId, hasHandle);             break;
  }
}

async function refreshProjectData(projectId) {
  const dirHandle = state.projectHandles[projectId];
  if (!dirHandle) return;
  const raw = await scanner.readTodoFile(dirHandle);
  if (raw !== null) {
    const result = parser.parse(raw, projectId);
    state.projectTasks[projectId] = { raw, ...result, stats: parser.getStats(result.tasks) };
    const project = state.projects.find(p => p.id === projectId);
    if (project) search.updateIndex(project, result.tasks);
  }
}

/* ═══════════════════════════════════════════════════
   TODO TAB
═══════════════════════════════════════════════════ */
function renderTodoTabContent(container, project, projectId, tasks, rawMd, hasHandle) {
  renderer.renderTodoTab(container, tasks, {
    writeMode:         state.writeModeOn && hasHandle,
    filter:            state.todoFilter,
    sort:              state.todoSort,
    collapsedSections: state.collapsedSections
  });

  // Filter
  container.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.todoFilter = btn.dataset.filter;
      const fresh = state.projectTasks[projectId];
      renderTodoTabContent(container, project, projectId, fresh?.tasks || [], fresh?.raw || '', hasHandle);
    });
  });

  // Sort
  container.querySelector('#sort-select')?.addEventListener('change', e => {
    state.todoSort = e.target.value;
    const fresh = state.projectTasks[projectId];
    renderTodoTabContent(container, project, projectId, fresh?.tasks || [], fresh?.raw || '', hasHandle);
  });

  // Section collapse
  container.querySelectorAll('.section-collapse-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const section   = btn.dataset.section;
      const sectionId = `section-${section.replace(/\s+/g,'-').toLowerCase()}`;
      const items     = container.querySelector(`#${sectionId}`);
      const icon      = btn.querySelector('.collapse-icon');
      if (state.collapsedSections.has(section)) {
        state.collapsedSections.delete(section);
        items?.classList.remove('hidden');
        icon?.classList.remove('rotated');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        state.collapsedSections.add(section);
        items?.classList.add('hidden');
        icon?.classList.add('rotated');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Checkbox (write mode)
  if (state.writeModeOn && hasHandle) {
    container.querySelectorAll('.task-checkbox').forEach(box => {
      box.addEventListener('click', async () => {
        const lineNum = parseInt(box.closest('.task-item')?.dataset.lineNumber ?? '-1');
        if (lineNum < 0) return;
        await toggleTaskInFile(projectId, lineNum, box);
      });
      box.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); box.click(); }
      });
    });
    bindAddTaskForm(container, projectId, tasks);
  }
}

function bindAddTaskForm(container, projectId, tasks) {
  const addBtn = container.querySelector('#add-task-btn');
  const form   = container.querySelector('#add-task-form');
  if (!addBtn || !form) return;

  addBtn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    form.querySelector('#add-task-input')?.focus();
  });

  const sections = [...new Set(tasks.map(t => t.section).filter(Boolean))];
  const sel = form.querySelector('#add-task-section');
  sections.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel?.appendChild(opt);
  });

  const saveHandler = async () => {
    const text = form.querySelector('#add-task-input')?.value.trim();
    if (!text) return;
    await addTaskToFile(projectId, {
      text,
      section:  form.querySelector('#add-task-section')?.value || null,
      priority: form.querySelector('#add-task-priority')?.value || 'medium',
      dueDate:  form.querySelector('#add-task-due')?.value
        ? new Date(form.querySelector('#add-task-due').value) : null
    });
    form.classList.add('hidden');
    if (form.querySelector('#add-task-input')) form.querySelector('#add-task-input').value = '';
  };

  form.querySelector('#add-task-save-btn')?.addEventListener('click', saveHandler);
  form.querySelector('#add-task-cancel-btn')?.addEventListener('click', () => form.classList.add('hidden'));
  form.querySelector('#add-task-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveHandler();
    if (e.key === 'Escape') form.querySelector('#add-task-cancel-btn').click();
  });
}

async function toggleTaskInFile(projectId, lineNumber, checkboxEl) {
  const cached    = state.projectTasks[projectId];
  const dirHandle = state.projectHandles[projectId];
  if (!cached || !dirHandle) return;

  const hasWrite = await scanner.verifyPermission(dirHandle, true);
  if (!hasWrite) { toast.error('Write permission denied.'); return; }

  const task   = cached.tasks.find(t => t.lineNumber === lineNumber);
  const newRaw = parser.toggleTask(cached.raw, lineNumber);

  try {
    const todoHandle = await findTodoHandle(dirHandle);
    if (!todoHandle) throw new Error('todo.md not found');
    await scanner.writeFile(todoHandle, newRaw);

    const result = parser.parse(newRaw, projectId);
    state.projectTasks[projectId] = { raw: newRaw, ...result, stats: parser.getStats(result.tasks) };
    const project = state.projects.find(p => p.id === projectId);
    if (project) search.updateIndex(project, result.tasks);

    const nowDone = !task?.done;

    // Micro-interaction: pulse on checkbox
    if (checkboxEl) {
      checkboxEl.classList.add('just-checked');
      setTimeout(() => checkboxEl.classList.remove('just-checked'), 600);
    }

    // Float emoji feedback
    if (nowDone && checkboxEl) emitFloatBadge('✅', checkboxEl);

    await storage.logActivity({
      type:        nowDone ? 'task_complete' : 'task_edit',
      description: nowDone ? `Completed: ${task?.text}` : `Reopened: ${task?.text}`,
      projectId
    });
    toast[nowDone ? 'success' : 'info'](nowDone ? 'Task complete! ✅' : 'Task pending.');
    rerenderTodoAfterWrite(projectId);
  } catch (e) {
    console.error(e);
    toast.error(`Write failed: ${e.message}`);
  }
}

async function addTaskToFile(projectId, opts) {
  const cached    = state.projectTasks[projectId];
  const dirHandle = state.projectHandles[projectId];
  if (!dirHandle) return;

  const hasWrite = await scanner.verifyPermission(dirHandle, true);
  if (!hasWrite) { toast.error('Write permission denied.'); return; }

  const newRaw = parser.addTask(cached?.raw || '', opts);
  try {
    let todoHandle = await findTodoHandle(dirHandle);
    if (!todoHandle) {
      for await (const [name, h] of dirHandle.entries()) {
        if (h.kind === 'directory' && name.toLowerCase() === '.todo') {
          todoHandle = await h.getFileHandle('todo.md', { create: true });
          break;
        }
      }
    }
    if (!todoHandle) throw new Error('Could not create todo.md');

    await scanner.writeFile(todoHandle, newRaw);
    const result = parser.parse(newRaw, projectId);
    state.projectTasks[projectId] = { raw: newRaw, ...result, stats: parser.getStats(result.tasks) };
    const project = state.projects.find(p => p.id === projectId);
    if (project) search.updateIndex(project, result.tasks);

    await storage.logActivity({ type: 'task_add', description: `Added: ${opts.text}`, projectId });
    toast.success('Task added!');
    rerenderTodoAfterWrite(projectId);
  } catch (e) {
    console.error(e);
    toast.error(`Write failed: ${e.message}`);
  }
}

function rerenderTodoAfterWrite(projectId) {
  const main       = document.getElementById('main-content');
  const tabContent = main?.querySelector('#tab-content');
  const project    = state.projects.find(p => p.id === projectId);
  const fresh      = state.projectTasks[projectId];
  if (!tabContent || !project || !fresh) return;

  if (state.activeTab === 'todo') {
    renderTodoTabContent(tabContent, project, projectId, fresh.tasks, fresh.raw, !!state.projectHandles[projectId]);
  }

  // Update progress bar
  const bar   = main.querySelector('#project-progress-bar');
  const label = main.querySelector('.project-progress-label');
  if (bar)   bar.style.width   = `${fresh.stats.pct}%`;
  if (label) label.textContent = `${fresh.stats.done}/${fresh.stats.total} tasks done (${fresh.stats.pct}%)`;
  const tc = main.querySelector('#tab-todo .tab-count');
  if (tc) tc.textContent = fresh.stats.total;

  // Update sidebar badge
  const proj = state.projects.find(p => p.id === projectId);
  if (proj) { proj.pendingCount = fresh.stats.pending; renderProjectList(); }
}

async function findTodoHandle(dirHandle) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'directory' && name.toLowerCase() === '.todo') {
      for await (const [fn, fh] of handle.entries()) {
        if (fn.toLowerCase() === 'todo.md') return fh;
      }
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════
   PROMPTS TAB
═══════════════════════════════════════════════════ */
async function renderPromptsTabContent(container, project, projectId, hasHandle) {
  const dirHandle = state.projectHandles[projectId];
  if (!hasHandle || !dirHandle) {
    container.innerHTML = `<div class="empty-state" style="min-height:300px"><div class="empty-state-icon">${ic('file-text',48,'var(--color-secondary)')}</div><h2>Folder access required</h2></div>`;
    ric(container);
    return;
  }

  const promptFiles = await scanner.listPromptFiles(dirHandle);
  state.promptFiles = promptFiles;
  renderer.renderPromptsTab(container, promptFiles, null, state.writeModeOn);
  if (!promptFiles.length) return;

  const promptBody  = container.querySelector('#prompt-body');
  const promptTitle = container.querySelector('#prompt-title');
  const copyBtn     = container.querySelector('#copy-prompt-btn');
  const editBtn     = container.querySelector('#edit-prompt-btn');
  const editor      = container.querySelector('#prompt-editor');
  const editorActs  = container.querySelector('#prompt-editor-actions');
  const saveBtn     = container.querySelector('#save-prompt-btn');
  const cancelBtn   = container.querySelector('#cancel-edit-btn');

  let currentIdx     = 0;
  let currentContent = '';
  let currentHandle  = null;

  async function loadPromptFile(idx) {
    currentIdx     = idx;
    const file     = promptFiles[idx];
    if (!file) return;
    if (promptTitle) promptTitle.textContent = file.name;
    container.querySelectorAll('.prompt-file-item').forEach((el, i) => el.classList.toggle('active', i === idx));
    if (promptBody) promptBody.innerHTML = '<div class="loading-placeholder">Loading...</div>';
    currentContent = await scanner.readFileText(file.handle) || '';
    currentHandle  = file.handle;
    if (promptBody) {
      promptBody.innerHTML    = parser.markdownToHtml(currentContent);
      promptBody.style.display = '';
    }
    editor?.classList.add('hidden');
    editorActs?.classList.add('hidden');
  }

  container.querySelectorAll('.prompt-file-item').forEach((btn, idx) =>
    btn.addEventListener('click', () => loadPromptFile(idx))
  );

  // Copy with feedback
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      // Micro-interaction: "Copied!" feedback
      const orig = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      copyBtn.classList.add('copy-done');
      setTimeout(() => { copyBtn.textContent = orig; copyBtn.classList.remove('copy-done'); }, 2000);
      await storage.logActivity({ type: 'prompt_copy', description: `Copied: ${promptFiles[currentIdx]?.name}`, projectId });
    } catch { toast.error('Clipboard access denied.'); }
  });

  if (state.writeModeOn) {
    editBtn?.addEventListener('click', () => {
      if (promptBody) promptBody.style.display = 'none';
      if (editor) { editor.value = currentContent; editor.classList.remove('hidden'); editor.focus(); }
      editorActs?.classList.remove('hidden');
    });
    saveBtn?.addEventListener('click', async () => {
      if (!currentHandle) return;
      try {
        const ok = await scanner.verifyPermission(currentHandle, true);
        if (!ok) { toast.error('Write permission denied.'); return; }
        await scanner.writeFile(currentHandle, editor.value);
        currentContent = editor.value;
        if (promptBody) { promptBody.innerHTML = parser.markdownToHtml(currentContent); promptBody.style.display = ''; }
        editor?.classList.add('hidden');
        editorActs?.classList.add('hidden');
        toast.success('Prompt saved!');
      } catch (e) { toast.error(`Save failed: ${e.message}`); }
    });
    cancelBtn?.addEventListener('click', () => {
      if (promptBody) promptBody.style.display = '';
      editor?.classList.add('hidden');
      editorActs?.classList.add('hidden');
    });
  }

  await loadPromptFile(0);
}

/* ═══════════════════════════════════════════════════
   ASSETS TAB (with IntersectionObserver lazy-load)
═══════════════════════════════════════════════════ */
async function renderAssetsTabContent(container, project, projectId, hasHandle) {
  const dirHandle = state.projectHandles[projectId];
  if (!hasHandle || !dirHandle) {
    container.innerHTML = `<div class="empty-state" style="min-height:300px"><div class="empty-state-icon">${ic('folder-open',48,'var(--color-secondary)')}</div><h2>Folder access required</h2></div>`;
    ric(container);
    return;
  }

  const assets = await scanner.listAssetFiles(dirHandle);
  state.assetFiles = assets;
  renderer.renderAssetsTab(container, assets, state.assetView, state.assetTypeFilter);

  // Filters
  container.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => { state.assetTypeFilter = btn.dataset.type; renderAssetsTabContent(container, project, projectId, hasHandle); });
  });
  container.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => { state.assetView = btn.dataset.view; renderAssetsTabContent(container, project, projectId, hasHandle); });
  });

  const filtered = state.assetTypeFilter === 'all' ? assets : assets.filter(a => a.type === state.assetTypeFilter);

  // IntersectionObserver for lazy-load thumbnails
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card  = entry.target;
      const idx   = parseInt(card.dataset.idx ?? '-1');
      const asset = filtered[idx];
      if (!asset || !['image','video'].includes(asset.type)) return;

      const thumb = card.querySelector(`#thumb-${idx}`);
      if (!thumb || thumb.dataset.loaded) return;
      thumb.dataset.loaded = '1';
      thumb.classList.add('loading');

      scanner.getAssetObjectUrl(asset.handle).then(url => {
        thumb.classList.remove('loading');
        if (!url) return;
        if (asset.type === 'image') {
          const img = document.createElement('img');
          img.src    = url;
          img.alt    = asset.name;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          img.onerror = () => { img.remove(); };
          thumb.appendChild(img);
        }
      });

      observer.unobserve(card);
    });
  }, { rootMargin: '100px' });

  container.querySelectorAll('.asset-card').forEach((card, i) => {
    const asset = filtered[i];
    if (!asset) return;

    observer.observe(card);

    card.addEventListener('click', async () => {
      const objectUrl = await scanner.getAssetObjectUrl(asset.handle);
      renderer.renderAssetModal(asset, objectUrl);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

/* ═══════════════════════════════════════════════════
   ASSET MODAL (with focus trap)
═══════════════════════════════════════════════════ */
function closeAssetModal() {
  const modal = document.getElementById('asset-modal');
  if (!modal) return;
  modal.classList.remove('visible');
  const body = modal.querySelector('#asset-modal-body');
  if (body) {
    const media = body.querySelector('img, video, iframe');
    if (media?.src?.startsWith('blob:')) URL.revokeObjectURL(media.src);
    body.innerHTML = '';
  }
}

/* ═══════════════════════════════════════════════════
   SEARCH (Phase 3 — full index)
═══════════════════════════════════════════════════ */
function focusSearch() {
  const input = document.getElementById('search-input');
  input?.focus(); input?.select();
}

function closeSearch() {
  state.searchOpen = false;
  document.getElementById('search-dropdown').classList.remove('visible');
  document.getElementById('search-input').value = '';
}

function updateSearchDropdown(query) {
  if (!query.trim()) {
    document.getElementById('search-dropdown').classList.remove('visible');
    return;
  }
  const result = search.query(query, { limit: 5 });
  renderSearchDropdown(result, query);
}

function renderSearchDropdown(result, query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!result || (!result.tasks.length && !result.projects.length && !result.tags.length && !query)) {
    dropdown.classList.remove('visible');
    return;
  }

  let html = '';

  // Tasks
  if (result.tasks.length) {
    html += `<div class="search-section-header">Tasks</div>`;
    html += result.tasks.map(t => `
      <div class="search-result-item" data-project-id="${t.projectId}" data-line="${t.lineNumber}" role="option" tabindex="-1">
        <span>${t.done ? '✅' : '☐'}</span>
        <span class="search-result-text">${t.highlight || escHtml(t.text)}</span>
        <span class="result-meta">${escHtml(t.projectName)}</span>
      </div>`).join('');
  }

  // Projects
  if (result.projects.length) {
    html += `<div class="search-section-header">Projects</div>`;
    html += result.projects.map(p => `
      <div class="search-result-item" data-project-id="${p.id}" role="option" tabindex="-1">
        <span>${ic('folder',14)}</span>
        <span>${escHtml(p.name).replace(new RegExp(`(${escHtml(query)})`, 'gi'), '<strong>$1</strong>')}</span>
      </div>`).join('');
  }

  // Tags
  if (result.tags.length) {
    html += `<div class="search-section-header">Tags</div>`;
    html += result.tags.map(t => `
      <div class="search-result-item" data-tag="${escHtml(t.tag)}" role="option" tabindex="-1">
        <span>${ic('tag',14)}</span>
        <span class="tag-chip">#${escHtml(t.tag)}</span>
        <span class="result-meta">${t.count} task${t.count !== 1 ? 's' : ''}</span>
      </div>`).join('');
  }

  if (!html) html = `<div class="search-empty">No results for "<strong>${escHtml(query)}</strong>"</div>`;

  dropdown.innerHTML = html;
  dropdown.classList.add('visible');
  ric(dropdown);

  dropdown.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.projectId) {
        selectProject(item.dataset.projectId);
        // If task result, scroll to task after render
        if (item.dataset.line !== undefined) {
          const lineNum = parseInt(item.dataset.line);
          setTimeout(() => scrollToTask(lineNum), 400);
        }
      } else if (item.dataset.tag) {
        state.todoFilter = 'all';
        // Search by tag — filter tasks with this tag
        const input = document.getElementById('search-input');
        if (input) input.value = `#${item.dataset.tag}`;
      }
      closeSearch();
    });
  });
}

function scrollToTask(lineNumber) {
  const el = document.querySelector(`[data-line-number="${lineNumber}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('animate-pulse-green');
    setTimeout(() => el.classList.remove('animate-pulse-green'), 1200);
  }
}

function navigateSearchResults(dir) {
  const items   = [...document.querySelectorAll('.search-result-item')];
  if (!items.length) return;
  const current = document.querySelector('.search-result-item.focused');
  const idx     = current ? items.indexOf(current) : -1;
  current?.classList.remove('focused');
  const next = items[(idx + dir + items.length) % items.length];
  next.classList.add('focused');
  next.scrollIntoView({ block: 'nearest' });
}

function rebuildSearchIndex() {
  search.buildIndex(state.projects, state.projectTasks);
}

/* ═══════════════════════════════════════════════════
   DASHBOARD RENDER
═══════════════════════════════════════════════════ */
function renderDashboard(container) {
  if (!state.workspaces.length) {
    container.innerHTML = `
      <div class="empty-state page-content" style="height:100%">
        <div class="empty-state-icon">${ic('folder-plus', 52, 'var(--color-accent)')}</div>
        <h2>No workspace added yet</h2>
        <p>Add a local folder to start managing your projects and todos.</p>
        <button class="btn btn-primary" id="empty-add-workspace-btn" aria-label="Add workspace folder">
          ${ic('plus', 14)} Add Workspace Folder
        </button>
      </div>`;
    ric(container);
    container.querySelector('#empty-add-workspace-btn').addEventListener('click', addWorkspace);
    return;
  }

  const wsProjects = state.projects.filter(p =>
    !state.activeWorkspaceId || p.workspaceId === state.activeWorkspaceId
  );
  const wsName = state.activeWorkspaceId
    ? state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name
    : state.workspaces[0]?.name;

  const hasRealData  = wsProjects.length > 0;
  const displayProjs = hasRealData ? wsProjects : MOCK_PROJECTS;
  const totalTasks   = displayProjs.reduce((s, p) => s + (p.total || 0), 0);
  const doneTasks    = displayProjs.reduce((s, p) => s + (p.done  || 0), 0);
  const stats = hasRealData
    ? { total: totalTasks, doneToday: doneTasks, overdue: 0, inProgress: totalTasks - doneTasks }
    : MOCK_STATS;

  container.innerHTML = `
    <div class="dashboard-page page-content">
      <div class="dashboard-welcome">
        <h1>Welcome back!</h1>
        <p>Overview of <strong>${escHtml(wsName || 'your workspace')}</strong> — ${wsProjects.length} project(s)</p>
      </div>

      <div class="dashboard-section">
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-card-icon">${ic('clipboard-list',22,'var(--color-info)')}</div><div class="stat-card-value">${stats.total}</div><div class="stat-card-label">Total Tasks</div></div>
          <div class="stat-card"><div class="stat-card-icon">${ic('check-circle-2',22,'var(--color-accent)')}</div><div class="stat-card-value">${stats.doneToday}</div><div class="stat-card-label">Done</div></div>
          <div class="stat-card"><div class="stat-card-icon">${ic('clock',22,'var(--color-warning)')}</div><div class="stat-card-value">${stats.inProgress}</div><div class="stat-card-label">Pending</div></div>
          <div class="stat-card"><div class="stat-card-icon">${ic('alert-circle',22,'var(--color-danger)')}</div><div class="stat-card-value">${stats.overdue}</div><div class="stat-card-label">Overdue</div></div>
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <span class="section-title">Projects</span>
        </div>
        <div class="projects-grid" id="dash-projects-grid">
          ${displayProjs.map(p => renderProjectCard(p)).join('')}
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <span class="section-title">Recent Activity</span>
          <button class="section-action" id="view-all-activity-btn">View All →</button>
        </div>
        <div class="activity-list">
          ${MOCK_ACTIVITY.map(a => `
            <div class="activity-item">
              <span class="activity-icon">${getActivityIcon(a.type)}</span>
              <div class="activity-body">
                <div class="activity-desc">${a.description}${a.project ? ` <span style="color:var(--color-secondary)">· ${escHtml(a.project)}</span>` : ''}</div>
              </div>
              <span class="activity-time">${timeAgo(a.ts)}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  ric(container);
  container.querySelector('#view-all-activity-btn')?.addEventListener('click', () => navigateTo('activity'));

  container.querySelectorAll('.project-card').forEach((card, i) => {
    const proj = displayProjs[i];
    if (proj && !proj.id.startsWith('mock')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => selectProject(proj.id));
    }
  });
}

function renderProjectCard(p) {
  const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  return `
    <div class="project-card" role="button" tabindex="0" aria-label="Open project ${escHtml(p.name)}">
      <div class="project-card-header">
        <span class="project-card-icon">${ic('folder', 20, 'var(--color-accent)')}</span>
        <span class="badge ${pct===100?'badge-done':pct>0?'badge-progress':'badge-pending'}">${pct===100?'Done':pct>0?`${pct}%`:'Start'}</span>
      </div>
      <div class="project-card-name">${escHtml(p.name)}</div>
      <div class="project-progress-bar-wrap"><div class="project-progress-bar" style="width:${pct}%"></div></div>
      <div class="project-progress-label">${p.done||0}/${p.total||0} tasks done</div>
    </div>`;
}

/* ═══════════════════════════════════════════════════
   SETTINGS PAGE
═══════════════════════════════════════════════════ */
function renderSettingsPage(container) {
  const tmpl  = document.getElementById('settings-page-template');
  const clone = tmpl.content.cloneNode(true);
  container.appendChild(clone);
  bindSettingsControls(container);
  renderSettingsWorkspaceList();
  container.querySelector('#settings-add-workspace-btn')?.addEventListener('click', addWorkspace);
  container.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      container.querySelector(`#settings-panel-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}

/* ═══════════════════════════════════════════════════
   ACTIVITY LOG (Phase 3: with type + project filter)
═══════════════════════════════════════════════════ */
async function renderActivityPage(container) {
  const allActivities = await storage.getRecentActivity(200);

  // Apply filters
  let activities = allActivities;
  if (state.activityFilter.type !== 'all') {
    const typeMap = {
      tasks:     ['task_complete','task_add','task_edit'],
      workspace: ['workspace_add','workspace_remove'],
      projects:  ['project_refresh','prompt_copy']
    };
    activities = activities.filter(a => typeMap[state.activityFilter.type]?.includes(a.type));
  }
  if (state.activityFilter.projectId !== 'all') {
    activities = activities.filter(a => a.projectId === state.activityFilter.projectId);
  }

  const grouped  = groupByDate(activities);
  const typeOpts = ['all','tasks','workspace','projects'];
  const projectOpts = [{ id:'all', name:'All Projects' }, ...state.projects.map(p => ({ id: p.id, name: p.name }))];

  container.innerHTML = `
    <div class="dashboard-page page-content">
      <h1 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-4);">Activity Log</h1>
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-6);flex-wrap:wrap;align-items:center;">
        <select class="settings-select" id="activity-type-filter" aria-label="Filter by type">
          ${typeOpts.map(t => `<option value="${t}" ${state.activityFilter.type===t?'selected':''}>
            ${t==='all'?'All Types':t.charAt(0).toUpperCase()+t.slice(1)}
          </option>`).join('')}
        </select>
        <select class="settings-select" id="activity-project-filter" aria-label="Filter by project">
          ${projectOpts.map(p => `<option value="${p.id}" ${state.activityFilter.projectId===p.id?'selected':''}>${escHtml(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-secondary btn-sm" id="clear-log-btn" aria-label="Clear activity log">${ic('trash-2', 13)} Clear Log</button>
        <span style="margin-left:auto;font-size:var(--text-sm);color:var(--color-secondary);">${activities.length} event${activities.length!==1?'s':''}</span>
      </div>

      ${grouped.length === 0
        ? `<div class="empty-state">
            <div class="empty-state-icon">${ic('clipboard-list',48,'var(--color-secondary)')}</div>
            <h2>No activity</h2>
            <p>No matching events${state.activityFilter.type!=='all'||state.activityFilter.projectId!=='all'?' for these filters':' yet'}.</p>
           </div>`
        : grouped.map(group => `
          <div style="margin-bottom:var(--space-6)">
            <div class="section-title" style="margin-bottom:var(--space-3)">${escHtml(group.label)}</div>
            <div class="activity-list">
              ${group.items.map(a => {
                const time = a.timestamp ? new Date(a.timestamp).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) : '';
                return `
                  <div class="activity-item">
                    <span class="activity-icon">${getActivityIcon(a.type)}</span>
                    <div class="activity-body"><div class="activity-desc">${escHtml(a.description)}</div></div>
                    <span class="activity-time" title="${time}">${timeAgo(a.timestamp)}</span>
                  </div>`;
              }).join('')}
            </div>
          </div>`).join('')
      }
    </div>`;
  ric(container);

  // Filter events
  container.querySelector('#activity-type-filter')?.addEventListener('change', e => {
    state.activityFilter.type = e.target.value;
    renderActivityPage(container);
  });
  container.querySelector('#activity-project-filter')?.addEventListener('change', e => {
    state.activityFilter.projectId = e.target.value;
    renderActivityPage(container);
  });

  container.querySelector('#clear-log-btn')?.addEventListener('click', () => {
    showConfirmModal(
      `${ic('trash-2',14)} Clear Activity Log?`,
      'This will permanently remove all activity history.',
      'Clear Log',
      async () => {
        await storage.clearActivity();
        state.activityFilter = { type: 'all', projectId: 'all' };
        toast.info('Activity log cleared.');
        closeConfirmModal();
        renderActivityPage(container);
      }, true
    );
  });
}

/* ═══════════════════════════════════════════════════
   MICRO-INTERACTION HELPERS
═══════════════════════════════════════════════════ */
function emitFloatBadge(emoji, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className = 'task-done-float';
  el.textContent = emoji;
  el.style.cssText = `left:${rect.left + rect.width/2}px;top:${rect.top}px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ═══════════════════════════════════════════════════
   CONFIRM MODAL (with focus trap)
═══════════════════════════════════════════════════ */
let _confirmCallback = null;

function showConfirmModal(title, body, actionLabel, onConfirm, isDanger = false) {
  _confirmCallback = onConfirm;
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-body').innerHTML    = body;
  const actionBtn = document.getElementById('confirm-action-btn');
  actionBtn.textContent = actionLabel;
  actionBtn.className   = `btn ${isDanger ? 'btn-danger' : 'btn-primary'}`;
  actionBtn.onclick     = () => { if (_confirmCallback) _confirmCallback(); };
  document.getElementById('confirm-modal').classList.add('visible');
  // Focus trap
  setTimeout(() => actionBtn.focus(), 50);
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('visible');
  _confirmCallback = null;
}

/* ═══════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════ */
const toast = (() => {
  const MAX = 4;
  const ICONS = {
    success: `<i data-lucide="check-circle-2" style="width:16px;height:16px;"></i>`,
    error:   `<i data-lucide="x-circle"       style="width:16px;height:16px;"></i>`,
    warning: `<i data-lucide="alert-triangle" style="width:16px;height:16px;"></i>`,
    info:    `<i data-lucide="info"           style="width:16px;height:16px;"></i>`
  };
  function show({ message, type = 'info', duration }) {
    const autoTime = duration ?? (type === 'error' ? 6000 : 4000);
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <div class="toast-body"><div class="toast-message">${escHtml(message)}</div></div>
      <button class="toast-close" aria-label="Dismiss"><i data-lucide="x" style="width:14px;height:14px;"></i></button>`;
    if (window.lucide) window.lucide.createIcons({ nameAttr:'data-lucide', nodes:[...el.querySelectorAll('[data-lucide]')] });
    const c = document.getElementById('toast-container');
    const existing = c.querySelectorAll('.toast');
    if (existing.length >= MAX) existing[0].remove();
    c.appendChild(el);
    el.querySelector('.toast-close').addEventListener('click', () => dismiss(el));
    setTimeout(() => dismiss(el), autoTime);
  }
  function dismiss(el) {
    if (!el.parentNode) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 200);
  }
  return {
    show,
    success: (m, d) => show({ message: m, type: 'success', duration: d }),
    error:   (m, d) => show({ message: m, type: 'error',   duration: d }),
    warning: (m, d) => show({ message: m, type: 'warning', duration: d }),
    info:    (m, d) => show({ message: m, type: 'info',    duration: d })
  };
})();

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function escHtml(str = '') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getActivityIcon(type) {
  const map = {
    task_complete:   ic('check-circle-2', 16, 'var(--color-accent)'),
    task_add:        ic('plus-circle',    16, 'var(--color-info)'),
    task_edit:       ic('pencil',         16, 'var(--color-warning)'),
    workspace_add:   ic('folder-plus',   16, 'var(--color-accent)'),
    workspace_remove:ic('trash-2',       16, 'var(--color-danger)'),
    project_refresh: ic('refresh-cw',    16, 'var(--color-secondary)'),
    prompt_copy:     ic('clipboard',     16, 'var(--color-info)')
  };
  return map[type] || ic('circle', 16, 'var(--color-secondary)');
}

function timeAgo(ts) {
  const diff = Date.now() - (ts || 0);
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);
  if (min < 1)   return 'Just now';
  if (min < 60)  return `${min}m ago`;
  if (hr  < 24)  return `${hr}h ago`;
  if (day === 1) return 'Yesterday';
  return `${day}d ago`;
}

function groupByDate(items) {
  const groups    = {};
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  items.forEach(item => {
    const d = item.timestamp;
    const label = d >= today ? 'Today' : d >= yesterday ? 'Yesterday'
      : new Date(d).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

/* ═══════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', init);
window._toast = toast;
