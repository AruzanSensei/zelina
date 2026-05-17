/* =====================================================
   renderer.js — UI Component Renderer
   Phase 2+3: Project Detail, Todo Tab, Prompt Tab,
              Assets Tab — Lucide icons throughout
   ===================================================== */

import parser  from './parser.js';
import scanner from './scanner.js';

const renderer = (() => {

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

  /* ── Lucide icon helper ──────────────────────────── */
  function ic(name, size = 16, color = '') {
    const sw  = STROKE_MAP[name] ?? 2;
    const col = color ? `color:${color};` : '';
    return `<span class="ic" data-sw="${sw}" style="display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
      <i data-lucide="${name}" style="width:${size}px;height:${size}px;${col}"></i>
    </span>`;
  }

  /* ── Call after any innerHTML update ────────────── */
  function renderIcons(root = document) {
    if (!window.lucide) return;
    const scope = root === document ? null : [...root.querySelectorAll('[data-lucide]')];
    window.lucide.createIcons({ nameAttr: 'data-lucide', nodes: scope });
    // Apply per-icon stroke-width after Lucide replaces <i> → <svg>
    const wrappers = root === document
      ? document.querySelectorAll('.ic[data-sw]')
      : root.querySelectorAll('.ic[data-sw]');
    wrappers.forEach(wrap => {
      const svg = wrap.querySelector('svg');
      if (svg) svg.setAttribute('stroke-width', wrap.dataset.sw);
    });
  }

  /* ── Project Detail Page ─────────────────────────── */
  function renderProjectPage(container, project, stats, activeTab = 'todo') {
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'project-detail-header';
    header.innerHTML = `
      <div class="project-detail-top">
        <div class="project-detail-title-row">
          <span class="project-detail-icon">${ic('folder-open', 28, 'var(--color-accent)')}</span>
          <div>
            <h1 class="project-detail-name">${esc(project.name)}</h1>
            <div class="project-detail-path">${esc(project.name)}</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm refresh-btn" id="project-refresh-btn" aria-label="Re-scan project" title="Re-scan project">
          ${ic('refresh-cw', 14)}
          Refresh
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="project-progress-section">
        <div class="project-progress-wrap">
          <div class="project-progress-bar-outer">
            <div class="project-progress-bar-inner" style="width:${stats.pct}%" id="project-progress-bar"></div>
          </div>
          <span class="project-progress-label">${stats.done}/${stats.total} tasks done (${stats.pct}%)</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="project-tabs" role="tablist">
        <button class="project-tab${activeTab==='todo'?' active':''}" data-tab="todo" role="tab" aria-selected="${activeTab==='todo'}" id="tab-todo">
          ${ic('check-square', 14)} Todo <span class="tab-count">${stats.total}</span>
        </button>
        <button class="project-tab${activeTab==='prompts'?' active':''}" data-tab="prompts" role="tab" aria-selected="${activeTab==='prompts'}" id="tab-prompts">
          ${ic('file-text', 14)} Prompts
        </button>
        <button class="project-tab${activeTab==='assets'?' active':''}" data-tab="assets" role="tab" aria-selected="${activeTab==='assets'}" id="tab-assets">
          ${ic('paperclip', 14)} Assets
        </button>
      </div>
    `;

    container.appendChild(header);
    renderIcons(header);

    // Tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.id = 'tab-content';
    container.appendChild(tabContent);

    return { tabContent };
  }

  /* ── Todo Tab ────────────────────────────────────── */
  function renderTodoTab(container, tasks, options = {}) {
    const { writeMode = false, filter = 'all', sort = 'default', collapsedSections = new Set() } = options;

    container.innerHTML = '';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'todo-toolbar';
    toolbar.innerHTML = `
      ${writeMode ? `
        <button class="btn btn-primary btn-sm" id="add-task-btn" aria-label="Add new task">
          ${ic('plus', 12)} Add Task
        </button>
      ` : ''}
      <div class="todo-filters" role="group" aria-label="Filter tasks">
        ${['all','pending','done','overdue','high'].map(f => `
          <button class="filter-btn${filter===f?' active':''}" data-filter="${f}" aria-pressed="${filter===f}">
            ${f === 'high' ? `${ic('zap', 11)} High` : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        `).join('')}
      </div>
      <div class="todo-sort">
        <select class="settings-select" id="sort-select" aria-label="Sort tasks">
          <option value="default"  ${sort==='default'?'selected':''}>Default</option>
          <option value="duedate"  ${sort==='duedate'?'selected':''}>Due Date</option>
          <option value="priority" ${sort==='priority'?'selected':''}>Priority</option>
          <option value="alpha"    ${sort==='alpha'?'selected':''}>Alphabetical</option>
        </select>
      </div>
    `;

    container.appendChild(toolbar);
    renderIcons(toolbar);

    // Add task inline form (hidden initially)
    if (writeMode) {
      const addForm = document.createElement('div');
      addForm.className = 'add-task-form hidden';
      addForm.id = 'add-task-form';
      addForm.innerHTML = `
        <div class="add-task-form-inner">
          <input type="text" id="add-task-input" placeholder="Task description..." class="add-task-input" aria-label="New task text" />
          <select id="add-task-section" class="settings-select" aria-label="Section">
            <option value="">No section</option>
          </select>
          <select id="add-task-priority" class="settings-select" aria-label="Priority">
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
          <input type="date" id="add-task-due" class="settings-select" aria-label="Due date" />
          <button class="btn btn-primary btn-sm" id="add-task-save-btn">Save</button>
          <button class="btn btn-ghost btn-sm"   id="add-task-cancel-btn">Cancel</button>
        </div>
      `;
      container.appendChild(addForm);
    }

    // Filter tasks
    let filtered = applyFilter(tasks, filter);
    filtered     = applySort(filtered, sort);

    // Empty state
    if (filtered.length === 0 && tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.style.minHeight = '300px';
      empty.innerHTML = `
        <div class="empty-state-icon">${ic('check-circle-2', 48, 'var(--color-accent)')}</div>
        <h2>No tasks yet</h2>
        <p>${writeMode ? 'Click "Add Task" to create your first task.' : 'No todo.md found in this project\'s .todo folder.'}</p>
      `;
      container.appendChild(empty);
      renderIcons(empty);
      return;
    }

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-filter-state';
      empty.innerHTML = `<p style="text-align:center;color:var(--color-secondary);padding:32px;">No tasks match this filter.</p>`;
      container.appendChild(empty);
      return;
    }

    // Group tasks by section
    const grouped = parser.groupBySection(filtered);

    Object.entries(grouped).forEach(([section, sectionTasks]) => {
      const sectionId  = `section-${section.replace(/\s+/g,'-').toLowerCase()}`;
      const isCollapsed = collapsedSections.has(section);

      const sectionEl = document.createElement('div');
      sectionEl.className = 'task-section';
      sectionEl.dataset.section = section;

      // Section header
      const secHeader = document.createElement('div');
      secHeader.className = 'task-section-header';
      secHeader.innerHTML = `
        <button class="section-collapse-btn" data-section="${esc(section)}" aria-label="Toggle section ${esc(section)}" aria-expanded="${!isCollapsed}">
          <i data-lucide="chevron-down" class="collapse-icon ${isCollapsed?'rotated':''}" style="width:12px;height:12px;"></i>
        </button>
        <span class="task-section-name">${esc(section)}</span>
        <span class="task-section-count">${sectionTasks.length}</span>
      `;
      sectionEl.appendChild(secHeader);
      renderIcons(secHeader);

      // Task items
      const itemsContainer = document.createElement('div');
      itemsContainer.className = `task-items${isCollapsed?' hidden':''}`;
      itemsContainer.id = sectionId;

      sectionTasks.forEach(task => {
        itemsContainer.appendChild(renderTaskItem(task, writeMode));
      });

      sectionEl.appendChild(itemsContainer);
      container.appendChild(sectionEl);
    });
  }

  /* ── Single Task Item ────────────────────────────── */
  function renderTaskItem(task, writeMode) {
    const el = document.createElement('div');
    el.className = `task-item${task.done?' done':''}${task.isOverdue?' overdue':''}${task.priority==='high'?' high-priority':''}${task.priority==='low'?' low-priority':''}`;
    el.dataset.taskId    = task.id;
    el.dataset.lineNumber = task.lineNumber;

    const dueDateHtml = task.dueDate
      ? `<span class="task-due${task.isOverdue?' task-due-overdue':''}" title="${task.dueDate.toDateString()}">
          ${task.isOverdue ? ic('alert-circle',11,'var(--color-danger)') : ic('calendar',11,'var(--color-secondary)')}
          ${formatDueDate(task.dueDate)}
         </span>`
      : '';

    const tagsHtml = task.tags.length
      ? task.tags.map(t => `<span class="tag-chip">#${esc(t)}</span>`).join('')
      : '';

    const priorityIcon = task.priority === 'high'
      ? `<span class="priority-icon high" title="High priority">${ic('zap', 12, 'var(--color-danger)')}</span>`
      : '';

    el.innerHTML = `
      <div class="task-checkbox${task.done?' checked':''}"
           role="checkbox"
           aria-checked="${task.done}"
           aria-label="Mark task as ${task.done?'pending':'done'}"
           tabindex="${writeMode?'0':'-1'}"
           style="${writeMode?'cursor:pointer;':'pointer-events:none;'}">
        ${task.done ? ic('check', 10, 'white') : ''}
      </div>
      <div class="task-body">
        <span class="task-text">${esc(task.text)}</span>
        <div class="task-meta">
          ${tagsHtml}
          ${dueDateHtml}
          ${priorityIcon}
        </div>
      </div>
    `;

    renderIcons(el);
    return el;
  }

  /* ── Prompts Tab ─────────────────────────────────── */
  function renderPromptsTab(container, promptFiles, activeFile = null, writeMode = false) {
    container.innerHTML = '';

    if (promptFiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="min-height:300px;">
          <div class="empty-state-icon">${ic('file-text', 48, 'var(--color-secondary)')}</div>
          <h2>No prompt files found</h2>
          <p>Create a <code>.todo/prompts/</code> folder in your project and add <code>.md</code> files.</p>
        </div>
      `;
      renderIcons(container);
      return;
    }

    const layout = document.createElement('div');
    layout.className = 'prompts-layout';

    // File list sidebar
    const fileList = document.createElement('div');
    fileList.className = 'prompt-file-list';
    fileList.innerHTML = promptFiles.map((f, i) => `
      <button class="prompt-file-item${(!activeFile && i===0) || activeFile?.name===f.name?' active':''}"
              data-idx="${i}"
              aria-label="Open ${esc(f.name)}">
        ${ic('file-text', 13)}
        <span>${esc(f.name)}</span>
      </button>
    `).join('');

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'prompt-content-area';
    contentArea.innerHTML = `
      <div class="prompt-content-header">
        <span class="prompt-content-title" id="prompt-title">${esc(promptFiles[0]?.name || '')}</span>
        <div class="prompt-content-actions">
          <button class="btn btn-secondary btn-sm" id="copy-prompt-btn" aria-label="Copy prompt to clipboard">
            ${ic('clipboard', 13)} Copy
          </button>
          ${writeMode ? `<button class="btn btn-ghost btn-sm" id="edit-prompt-btn" aria-label="Edit prompt">${ic('pencil', 13)} Edit</button>` : ''}
        </div>
      </div>
      <div class="prompt-content-body" id="prompt-body">
        <div class="loading-placeholder">Loading...</div>
      </div>
      ${writeMode ? `
        <textarea class="prompt-editor hidden" id="prompt-editor" aria-label="Edit prompt markdown"></textarea>
        <div class="prompt-editor-actions hidden" id="prompt-editor-actions">
          <button class="btn btn-primary btn-sm" id="save-prompt-btn">${ic('save', 13)} Save</button>
          <button class="btn btn-ghost btn-sm"   id="cancel-edit-btn">Cancel</button>
        </div>
      ` : ''}
    `;

    layout.appendChild(fileList);
    layout.appendChild(contentArea);
    container.appendChild(layout);
    renderIcons(layout);
  }

  /* ── Assets Tab ──────────────────────────────────── */
  function renderAssetsTab(container, assets, viewMode = 'grid', typeFilter = 'all') {
    container.innerHTML = '';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'assets-toolbar';
    toolbar.innerHTML = `
      <div class="assets-filters">
        ${['all','image','pdf','video','archive','text','other'].map(t => `
          <button class="filter-btn${typeFilter===t?' active':''}" data-type="${t}" aria-pressed="${typeFilter===t}">
            ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        `).join('')}
      </div>
      <div class="view-toggle">
        <button class="view-btn${viewMode==='grid'?' active':''}" data-view="grid" aria-label="Grid view">
          ${ic('layout-grid', 14)}
        </button>
        <button class="view-btn${viewMode==='list'?' active':''}" data-view="list" aria-label="List view">
          ${ic('list', 14)}
        </button>
      </div>
    `;
    container.appendChild(toolbar);
    renderIcons(toolbar);

    // Filter assets
    const filtered = typeFilter === 'all'
      ? assets
      : assets.filter(a => a.type === typeFilter);

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.style.minHeight = '300px';
      empty.innerHTML = `
        <div class="empty-state-icon">${ic('folder-open', 48, 'var(--color-secondary)')}</div>
        <h2>No assets found</h2>
        <p>Add files to <code>.todo/assets/</code> in your project folder.</p>
      `;
      container.appendChild(empty);
      renderIcons(empty);
      return;
    }

    // Grid/List
    const grid = document.createElement('div');
    grid.className = `assets-${viewMode}`;
    grid.id = 'assets-container';

    filtered.forEach((asset, idx) => {
      const card = document.createElement('div');
      card.className = `asset-card asset-${viewMode}-item`;
      card.dataset.idx = idx;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Open ${esc(asset.name)}`);

      const iconHtml = getAssetIcon(asset.type, asset.ext);
      const sizeHtml = scanner.formatSize(asset.size);

      if (viewMode === 'grid') {
        card.innerHTML = `
          <div class="asset-thumb" id="thumb-${idx}">
            ${iconHtml}
          </div>
          <div class="asset-info">
            <div class="asset-name" title="${esc(asset.name)}">${esc(asset.name)}</div>
            <div class="asset-size">${sizeHtml}</div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="asset-list-icon">${iconHtml}</div>
          <div class="asset-list-name" title="${esc(asset.name)}">${esc(asset.name)}</div>
          <span class="badge badge-info">${esc(asset.ext)}</span>
          <div class="asset-list-size">${sizeHtml}</div>
        `;
      }

      renderIcons(card);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  /* ── Asset Preview Modal ─────────────────────────── */
  function renderAssetModal(asset, objectUrl) {
    const modal = document.getElementById('asset-modal');
    if (!modal) return;

    const body  = modal.querySelector('#asset-modal-body');
    const title = modal.querySelector('#asset-modal-title');

    title.textContent = asset.name;

    let content = '';
    if (asset.type === 'image' && objectUrl) {
      content = `<img src="${objectUrl}" alt="${esc(asset.name)}" class="asset-preview-img" />`;
    } else if (asset.type === 'video' && objectUrl) {
      content = `<video src="${objectUrl}" controls class="asset-preview-video"></video>`;
    } else if (asset.type === 'pdf' && objectUrl) {
      content = `<iframe src="${objectUrl}" class="asset-preview-pdf" title="${esc(asset.name)}"></iframe>`;
    } else {
      content = `
        <div class="asset-preview-other">
          <div style="font-size:64px;margin-bottom:16px;">${getAssetIcon(asset.type, asset.ext, 64)}</div>
          <div style="font-size:14px;color:var(--color-secondary);">${esc(asset.name)}</div>
          <div style="font-size:12px;color:var(--color-secondary);">${scanner.formatSize(asset.size)}</div>
          ${objectUrl ? `<a href="${objectUrl}" download="${esc(asset.name)}" class="btn btn-primary" style="margin-top:16px;">${ic('download', 14)} Download</a>` : ''}
        </div>
      `;
    }

    body.innerHTML = content;
    renderIcons(body);
    modal.classList.add('visible');
  }

  /* ── Asset Icon via Lucide ───────────────────────── */
  function getAssetIcon(type, ext, size = 32) {
    const map = {
      image:   ['image',        'var(--color-info)'],
      video:   ['video',        'var(--color-danger)'],
      pdf:     ['file-type-2',  '#DC2626'],
      archive: ['archive',      'var(--color-warning)'],
      text:    ['file-text',    'var(--color-accent)'],
      other:   ['file',         'var(--color-secondary)']
    };
    const [name, color] = map[type] || map.other;
    return ic(name, size, color);
  }

  /* ── Filter / Sort helpers ───────────────────────── */
  function applyFilter(tasks, filter) {
    switch (filter) {
      case 'pending':  return tasks.filter(t => !t.done);
      case 'done':     return tasks.filter(t => t.done);
      case 'overdue':  return tasks.filter(t => t.isOverdue);
      case 'high':     return tasks.filter(t => t.priority === 'high' && !t.done);
      default:         return tasks;
    }
  }

  function applySort(tasks, sort) {
    const copy = [...tasks];
    switch (sort) {
      case 'duedate':
        return copy.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      case 'priority': {
        const p = { high: 0, medium: 1, low: 2 };
        return copy.sort((a, b) => p[a.priority] - p[b.priority]);
      }
      case 'alpha':    return copy.sort((a, b) => a.text.localeCompare(b.text));
      default:         return copy;
    }
  }

  function formatDueDate(date) {
    if (!date) return '';
    const d    = date instanceof Date ? date : new Date(date);
    const diff = Math.ceil((d - new Date()) / 86400000);
    if (diff === 0)  return 'Today';
    if (diff === 1)  return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function esc(str = '') {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Public API ──────────────────────────────────── */
  return {
    renderProjectPage,
    renderTodoTab,
    renderPromptsTab,
    renderAssetsTab,
    renderAssetModal,
    renderTaskItem,
    renderIcons,
    ic,
    esc
  };
})();

export default renderer;
