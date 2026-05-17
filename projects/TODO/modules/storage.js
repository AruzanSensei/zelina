/* =====================================================
   storage.js — IndexedDB wrapper for DevHub
   Phase 1
   ===================================================== */
const storage = (() => {
  const DB_NAME    = 'devhub-local';
  const DB_VERSION = 1;
  let db = null;

  /* ── Open / Init ─────────────────────────────────── */
  function open() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const d = e.target.result;

        if (!d.objectStoreNames.contains('workspaces')) {
          d.createObjectStore('workspaces', { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains('projects')) {
          const ps = d.createObjectStore('projects', { keyPath: 'id' });
          ps.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!d.objectStoreNames.contains('cache')) {
          d.createObjectStore('cache', { keyPath: 'projectId' });
        }
        if (!d.objectStoreNames.contains('settings')) {
          d.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!d.objectStoreNames.contains('activity')) {
          const as = d.createObjectStore('activity', { keyPath: 'id', autoIncrement: true });
          as.createIndex('timestamp', 'timestamp', { unique: false });
          as.createIndex('projectId', 'projectId', { unique: false });
        }
      };

      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  /* ── Generic helpers ─────────────────────────────── */
  async function getStore(storeName, mode = 'readonly') {
    const d = await open();
    return d.transaction(storeName, mode).objectStore(storeName);
  }

  function promisify(req) {
    return new Promise((res, rej) => {
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  async function getAll(storeName) {
    const store = await getStore(storeName);
    return promisify(store.getAll());
  }

  async function getById(storeName, id) {
    const store = await getStore(storeName);
    return promisify(store.get(id));
  }

  async function put(storeName, value) {
    const store = await getStore(storeName, 'readwrite');
    return promisify(store.put(value));
  }

  async function del(storeName, id) {
    const store = await getStore(storeName, 'readwrite');
    return promisify(store.delete(id));
  }

  /* ── Workspaces ──────────────────────────────────── */
  async function saveWorkspace(handle, name) {
    const id = 'ws_' + Date.now();
    const workspace = {
      id,
      name:    name || handle.name,
      path:    handle.name,
      handle,
      addedAt: Date.now()
    };
    await put('workspaces', workspace);
    await logActivity('workspace_add', `Added workspace "${workspace.name}"`, null);
    return workspace;
  }

  async function getWorkspaces() {
    return getAll('workspaces');
  }

  async function removeWorkspace(id) {
    const ws = await getById('workspaces', id);
    await del('workspaces', id);
    // Remove associated projects
    const projects = await getProjectsByWorkspace(id);
    for (const p of projects) {
      await del('projects', p.id);
      await del('cache', p.id);
    }
    if (ws) await logActivity('workspace_remove', `Removed workspace "${ws.name}"`, null);
  }

  /* ── Projects ────────────────────────────────────── */
  async function saveProject(project) {
    await put('projects', project);
    return project;
  }

  async function getProjects() {
    return getAll('projects');
  }

  async function getProjectsByWorkspace(workspaceId) {
    const d     = await open();
    const tx    = d.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const idx   = store.index('workspaceId');
    return promisify(idx.getAll(workspaceId));
  }

  async function getProject(id) {
    return getById('projects', id);
  }

  async function removeProject(id) {
    await del('projects', id);
    await del('cache', id);
  }

  /* ── Project Cache ───────────────────────────────── */
  async function saveProjectCache(projectId, data) {
    await put('cache', { projectId, ...data, scannedAt: Date.now() });
  }

  async function getProjectCache(projectId) {
    return getById('cache', projectId);
  }

  /* ── Settings ────────────────────────────────────── */
  async function saveSetting(key, value) {
    await put('settings', { key, value });
  }

  async function getSetting(key, defaultValue = null) {
    const item = await getById('settings', key);
    return item ? item.value : defaultValue;
  }

  async function getAllSettings() {
    const items = await getAll('settings');
    return items.reduce((acc, item) => { acc[item.key] = item.value; return acc; }, {});
  }

  /* ── Activity Log ────────────────────────────────── */
  async function logActivity(typeOrObj, description, projectId = null) {
    // Accept either logActivity({ type, description, projectId }) or logActivity(type, description, projectId)
    let type = typeOrObj;
    if (typeOrObj && typeof typeOrObj === 'object') {
      type        = typeOrObj.type;
      description = typeOrObj.description;
      projectId   = typeOrObj.projectId || null;
    }
    const store = await getStore('activity', 'readwrite');
    return promisify(store.add({
      type,
      description,
      projectId,
      timestamp: Date.now()
    }));
  }

  async function getRecentActivity(limit = 20) {
    const all = await getAll('activity');
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async function clearActivity() {
    const d  = await open();
    const tx = d.transaction('activity', 'readwrite');
    return promisify(tx.objectStore('activity').clear());
  }

  /* ── Default Settings Init ───────────────────────── */
  async function initDefaults() {
    const defaults = {
      language:          'ID',
      defaultView:       'dashboard',
      autoRefresh:       true,
      showCompleted:     true,
      confirmWrite:      true,
      theme:             'light',
      fontSize:          14,
      compactMode:       false,
      sidebarWidth:      240,
      showProjectBadges: true
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await getById('settings', key);
      if (existing === undefined) {
        await put('settings', { key, value });
      }
    }
  }

  /* ── Public API ──────────────────────────────────── */
  return {
    open,
    initDefaults,
    saveWorkspace,
    getWorkspaces,
    removeWorkspace,
    saveProject,
    getProjects,
    getProjectsByWorkspace,
    getProject,
    removeProject,
    saveProjectCache,
    getProjectCache,
    saveSetting,
    getSetting,
    getAllSettings,
    logActivity,
    getRecentActivity,
    clearActivity
  };
})();

export default storage;
