/**
 * Global State Management
 * Handles persistence, shared state, and sync system integration.
 * 
 * Persistence priority:
 *  - Settings/UI prefs → localStorage (fast synchronous reads)
 *  - Business data → IndexedDB via sync system (persistent, indexed)
 *  - Cloud sync → via sync queue (background, offline-resilient)
 */

// Sync system imports (lazy-loaded to avoid circular deps)
let _syncModule = null;
async function getSyncModule() {
    if (!_syncModule) {
        _syncModule = await import('./sync/index.js');
    }
    return _syncModule;
}

const STORAGE_KEYS = {
    SETTINGS: 'bme_settings',
    HISTORY: 'bme_history',
    TEMPLATES: 'bme_templates',
    MANUAL_ITEMS: 'bme_manual_items',
    MANUAL_TITLE: 'bme_manual_title',
    MANUAL_CARD_MODE: 'bme_manual_card_mode',
    TABS: 'bme_tabs',
    ACTIVE_TAB_ID: 'bme_active_tab_id',
    IS_LOGGED_IN: 'bme_is_logged_in',
    ADMIN_PROFILE: 'bme_admin_profile'
};

const DEFAULTS = {
    settings: {
        language: 'id',
        theme: 'light',
        onboarded: false,
        downloadFormats: {
            png: true,
            jpeg: true,
            pdf: true
        },
        defaultDownloadMethod: 'pdf',
        downloadAndSave: false,
        titleRequired: true,
        pdfPageMode: 'single',
        monthlyTarget: 3800000,
        fileNameFormat: {
            invoice: 'Invoice-{judul}',
            suratJalan: 'Surat Jalan-{judul}'
        },
        aiDefaultPrompt: 'Ekstrak data faktur/invoice dari teks mentah berikut. Format harus terstruktur dengan membagi data menjadi satu atau beberapa judul invoice. Untuk setiap judul, kelompokkan item ke dalam list. Setiap item harus memiliki field: name (nama barang/jasa, default "..." jika kosong), tipe (pilih salah satu dari: "-", "ICA", "Protecta", "Prolink", "APC"), qtyUnit (unit kuantitas: "pcs" atau "lot", default "pcs"), qty (kuantitas integer, default 1), price (harga integer satuan, default 0), dan note (catatan tambahan, default "..." jika kosong).',
        aiModel: 'gemini-3.5-flash',
        lastLocalUpdate: null
    },
    manualItems: [],
    manualTitle: '',
    templates: [
        {
            id: 1,
            name: "Instalasi Listrik Rumah",
            items: [
                { name: "Kabel NYM 3x2.5", price: 150000, qty: 10, note: "Eterna", tipe: "Prolink" },
                { name: "MCB Schneider 16A", price: 85000, qty: 5, note: "", tipe: "Prolink" },
                { name: "Stop Kontak Panasonic", price: 25000, qty: 8, note: "Tempel", tipe: "Prolink" }
            ]
        }
    ]
};

class StateManager {
    constructor() {
        // Load legacy data
        const legacyItems = this.load(STORAGE_KEYS.MANUAL_ITEMS, DEFAULTS.manualItems);
        const legacyTitle = this.load(STORAGE_KEYS.MANUAL_TITLE, DEFAULTS.manualTitle);

        // Load Tabs
        const cachedTabs = this.load(STORAGE_KEYS.TABS, null);
        const cachedActiveId = this.load(STORAGE_KEYS.ACTIVE_TAB_ID, null);

        this.state = {
            currentMode: 'dashboard', // dashboard, manual, ai, history, finance
            manualViewMode: 'card', // card, table
            manualCardMode: this.load(STORAGE_KEYS.MANUAL_CARD_MODE, 'simple'), // simple, advance
            settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULTS.settings),
            history: this.load(STORAGE_KEYS.HISTORY, []),
            templates: this.load(STORAGE_KEYS.TEMPLATES, DEFAULTS.templates),
            tabs: cachedTabs || [],
            activeTabId: cachedActiveId,
            isLoggedIn: this.load(STORAGE_KEYS.IS_LOGGED_IN, false),
            adminProfile: this.load(STORAGE_KEYS.ADMIN_PROFILE, null),
            syncStatus: 'idle' // idle, syncing, synced, error
        };

        // Ensure a dashboard tab always exists at index 0
        const dashboardTabIdx = this.state.tabs.findIndex(t => t.mode === 'dashboard');
        if (dashboardTabIdx === -1) {
            const dashboardTab = {
                id: 'tab_dashboard',
                mode: 'dashboard',
                title: 'Beranda',
                data: {}
            };
            this.state.tabs.unshift(dashboardTab);
            this.saveTabs();
        } else if (dashboardTabIdx > 0) {
            // Keep dashboard at index 0
            const [dbTab] = this.state.tabs.splice(dashboardTabIdx, 1);
            this.state.tabs.unshift(dbTab);
            this.saveTabs();
        }

        // If tabs only contain dashboard, create initial manual tab too
        if (this.state.tabs.length === 1) {
            const initialTab = {
                id: 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                mode: 'manual',
                title: legacyTitle || 'Invoice #001',
                data: {
                    invoiceItems: legacyItems && legacyItems.length > 0 ? legacyItems : []
                }
            };
            this.state.tabs.push(initialTab);
            this.saveTabs();
        }

        // If activeTabId is not set, or points to something missing, default to dashboard
        if (!this.state.activeTabId || !this.state.tabs.some(t => t.id === this.state.activeTabId)) {
            this.state.activeTabId = 'tab_dashboard';
            this.saveTabs();
        }

        // Apply fallback currentMode from active tab
        const activeTab = this.getActiveTab();
        if (activeTab) {
            this.state.currentMode = activeTab.mode;
        }

        // Define reactive properties on this.state for backward compatibility
        Object.defineProperty(this.state, 'invoiceItems', {
            get: () => {
                const tab = this.getActiveTab();
                if (tab && tab.mode === 'manual') {
                    return tab.data.invoiceItems || [];
                }
                return DEFAULTS.manualItems;
            },
            set: (val) => {
                const tab = this.getActiveTab();
                if (tab && tab.mode === 'manual') {
                    tab.data.invoiceItems = val;
                    this.saveTabs();
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(this.state, 'manualTitle', {
            get: () => {
                const tab = this.getActiveTab();
                if (tab && tab.mode === 'manual') {
                    return tab.title || '';
                }
                return DEFAULTS.manualTitle;
            },
            set: (val) => {
                const tab = this.getActiveTab();
                if (tab && tab.mode === 'manual') {
                    tab.title = val;
                    this.saveTabs();
                }
            },
            enumerable: true,
            configurable: true
        });

        this.listeners = [];
    }

    load(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return fallback;

            const parsed = JSON.parse(data);

            // Safely merge old cache with new defaults to prevent missing properties (backward compatibility)
            if (key === STORAGE_KEYS.SETTINGS && typeof parsed === 'object') {
                return {
                    ...fallback,
                    ...parsed,
                    downloadFormats: { ...fallback.downloadFormats, ...(parsed.downloadFormats || {}) },
                    fileNameFormat: { ...fallback.fileNameFormat, ...(parsed.fileNameFormat || {}) }
                };
            }

            return parsed;
        } catch (e) {
            console.error('Error loading state:', e);
            return fallback;
        }
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            // Mirror to IndexedDB asynchronously
            this._mirrorToIndexedDB(key, data);
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    async _mirrorToIndexedDB(key, data) {
        try {
            if (key === STORAGE_KEYS.HISTORY) {
                const userId = this.state.isLoggedIn && this.state.adminProfile ? this.state.adminProfile.id : 'guest';
                const sync = await getSyncModule();
                const records = data.map((item, i) => ({
                    id: item.id || `local_${Date.now()}_${i}`,
                    user_id: userId,
                    title: item.title || '',
                    date: item.date || new Date().toISOString(),
                    items: item.items || [],
                    cardMode: item.cardMode || 'simple',
                    timestamp: item.timestamp || new Date().toISOString(),
                    created_at: item.timestamp || item.date || new Date().toISOString(),
                    updated_at: item.updated_at || new Date().toISOString(),
                    version: item.version || 1,
                    deleted_at: item.deleted_at || null
                }));
                await sync.replaceAllForUser('history', userId, records);
            } else if (key === STORAGE_KEYS.TEMPLATES) {
                const userId = this.state.isLoggedIn && this.state.adminProfile ? this.state.adminProfile.id : 'guest';
                const sync = await getSyncModule();
                const records = data.map((item, i) => ({
                    id: item.id || `tmpl_${Date.now()}_${i}`,
                    user_id: userId,
                    name: item.name || '',
                    items: item.items || [],
                    created_at: item.created_at || new Date().toISOString(),
                    updated_at: item.updated_at || new Date().toISOString(),
                    version: item.version || 1,
                    deleted_at: item.deleted_at || null
                }));
                await sync.replaceAllForUser('templates', userId, records);
            } else if (key === STORAGE_KEYS.TABS) {
                const userId = this.state.isLoggedIn && this.state.adminProfile ? this.state.adminProfile.id : 'guest';
                const sync = await getSyncModule();
                const records = data.map(item => ({
                    id: item.id,
                    user_id: userId,
                    mode: item.mode,
                    title: item.title || '',
                    data: item.data || {},
                    created_at: item.created_at || new Date().toISOString(),
                    updated_at: item.updated_at || new Date().toISOString(),
                    version: item.version || 1
                }));
                await sync.replaceAllForUser('tabs', userId, records);
            }
        } catch (e) {
            console.error('[StateManager] Mirroring to IndexedDB failed:', e);
        }
    }

    // ============================================
    // TAB MANAGEMENT METHODS
    // ============================================
    getActiveTab() {
        return this.state.tabs.find(t => t.id === this.state.activeTabId);
    }

    saveTabs() {
        this.save(STORAGE_KEYS.TABS, this.state.tabs);
        this.save(STORAGE_KEYS.ACTIVE_TAB_ID, this.state.activeTabId);
    }

    createNewTab(mode, title = null, data = null) {
        const id = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        if (!title) {
            const count = this.state.tabs.filter(t => t.mode === mode).length + 1;
            const modeNames = {
                dashboard: 'Beranda',
                manual: 'Manual',
                ai: 'AI Mode',
                finance: 'Keuangan',
                history: 'Histori'
            };
            title = mode === 'dashboard' ? 'Beranda' : `${modeNames[mode] || 'Tab'} ${count}`;
        }
        if (!data) {
            data = mode === 'manual' ? { invoiceItems: [] } : {};
        }
        const newTab = { id, mode, title, data };
        this.state.tabs.push(newTab);
        this.state.activeTabId = id;
        this.state.currentMode = mode;
        this.saveTabs();

        this.notify('tabs', this.state.tabs);
        this.switchTab(id);
        return newTab;
    }

    switchTab(tabId) {
        const tab = this.state.tabs.find(t => t.id === tabId);
        if (tab) {
            this.state.activeTabId = tabId;
            this.state.currentMode = tab.mode;
            this.saveTabs();

            this.notify('activeTabId', tabId);
            this.notify('currentMode', tab.mode);
            this.notify('tabs', this.state.tabs); // notify tab-bar update

            // Dispatch global event for features to react
            document.dispatchEvent(new CustomEvent('tab-switched', {
                detail: { tabId, mode: tab.mode, title: tab.title }
            }));
        }
    }

    closeTab(tabId) {
        const index = this.state.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        if (this.state.tabs.length === 1) {
            if (window.showBMEAlert) {
                window.showBMEAlert("Gagal menutup tab. Harus ada minimal satu tab aktif.", "error");
            } else {
                alert("Gagal menutup tab. Harus ada minimal satu tab aktif.");
            }
            return;
        }

        this.state.tabs.splice(index, 1);

        if (this.state.activeTabId === tabId) {
            const nextActiveIndex = Math.min(index, this.state.tabs.length - 1);
            this.state.activeTabId = this.state.tabs[nextActiveIndex].id;
            this.state.currentMode = this.state.tabs[nextActiveIndex].mode;
        }

        this.saveTabs();
        this.notify('tabs', this.state.tabs);
        this.switchTab(this.state.activeTabId);
    }

    updateActiveTabTitle(title) {
        const activeTab = this.getActiveTab();
        if (activeTab) {
            activeTab.title = title;
            this.saveTabs();
            this.notify('tabs', this.state.tabs);
        }
    }

    updateActiveTabData(data) {
        const activeTab = this.getActiveTab();
        if (activeTab) {
            activeTab.data = { ...activeTab.data, ...data };
            this.saveTabs();
        }
    }

    // ============================================
    // COMPATIBLE SAVE OPERATIONS
    // ============================================
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
        this.updateLocalTimestamp();
    }

    addToHistory(entry) {
        this.state.history.unshift(entry);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);

        if (this.state.isLoggedIn) {
            // Optimasi: Atomic prepend ke cloud
            this.prependHistoryItemCloud(entry);
        } else {
            this.updateLocalTimestamp();
        }
    }

    updateItems(items) {
        const tab = this.getActiveTab();
        if (tab && tab.mode === 'manual') {
            tab.data.invoiceItems = items;
            this.saveTabs();
            this.notify('items', items);
            this.updateLocalTimestamp();
        }
    }

    updateManualTitle(title) {
        const tab = this.getActiveTab();
        if (tab && tab.mode === 'manual') {
            tab.title = title;
            this.saveTabs();
            this.notify('manualTitle', title);
            this.notify('tabs', this.state.tabs);
            this.updateLocalTimestamp();
        }
    }

    updateManualCardMode(mode) {
        this.state.manualCardMode = mode;
        this.save(STORAGE_KEYS.MANUAL_CARD_MODE, mode);
        this.notify('manualCardMode', mode);
        this.updateLocalTimestamp();
    }

    updateHistoryTitle(id, newTitle) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            item.title = newTitle;
            this.save(STORAGE_KEYS.HISTORY, this.state.history);
            this.notify('history', this.state.history);
            this.updateLocalTimestamp();
        }
    }

    updateHistoryEntry(id, updates) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            Object.assign(item, updates);
            this.save(STORAGE_KEYS.HISTORY, this.state.history);
            this.notify('history', this.state.history);
            this.updateLocalTimestamp();
        }
    }

    removeFromHistory(index) {
        this.state.history.splice(index, 1);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
        this.updateLocalTimestamp();
    }

    addTemplate(template) {
        this.state.templates.push(template);
        this.save(STORAGE_KEYS.TEMPLATES, this.state.templates);
        this.notify('templates', this.state.templates);
        this.updateLocalTimestamp();
    }

    removeMultipleFromHistory(indices) {
        const sorted = [...indices].sort((a, b) => b - a);
        sorted.forEach(i => this.state.history.splice(i, 1));
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
        this.updateLocalTimestamp();
    }

    resetSettings() {
        this.state.settings = JSON.parse(JSON.stringify(DEFAULTS.settings));
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
        this.updateLocalTimestamp();
    }

    // ============================================
    // CLOUD SYNC & AUTH OPERATIONS
    // ============================================
    updateLocalTimestamp() {
        this.state.settings.lastLocalUpdate = new Date().toISOString();
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
        this._enqueueSync();
    }

    /**
     * Enqueue a sync operation via the sync queue.
     * Replaces direct Supabase calls with queued background sync.
     */
    async _enqueueSync() {
        if (!this.state.isLoggedIn) return;

        this.state.syncStatus = 'syncing';
        this.notify('syncStatus', 'syncing');

        try {
            const sync = await getSyncModule();
            await sync.syncQueue.enqueue('state', 'UPDATE', 'full_state', {
                timestamp: new Date().toISOString()
            });

            // Also notify other tabs
            sync.tabSync.notifyDataUpdate('state', 'UPDATE');
        } catch (e) {
            console.error('[StateManager] Enqueue sync failed:', e);
            // Fallback to legacy direct sync
            this.triggerCloudSync();
        }
    }

    async triggerCloudSync() {
        if (!this.state.isLoggedIn) return;

        this.state.syncStatus = 'syncing';
        this.notify('syncStatus', 'syncing');

        try {
            // Try sync engine first
            const sync = await getSyncModule();
            if (sync.syncEngine.isInitialized) {
                const success = await sync.syncEngine.pushFullState();
                if (success) {
                    this.state.syncStatus = 'synced';
                    this.notify('syncStatus', 'synced');
                    sync.realtimeManager.broadcastSyncComplete();
                    sync.tabSync.notifySyncStatus('synced');
                } else {
                    this.state.syncStatus = 'error';
                    this.notify('syncStatus', 'error');
                }
                return;
            }
        } catch (e) {
            console.warn('[StateManager] Sync engine not available, using legacy sync:', e);
        }

        // Legacy fallback: direct Supabase call
        try {
            const session = window.supabaseSession;
            if (!session) {
                this.state.syncStatus = 'error';
                this.notify('syncStatus', 'error');
                return;
            }

            const dataToSync = {
                settings: {
                    ...this.state.settings,
                    lastLocalUpdate: this.state.settings.lastLocalUpdate
                },
                history: this.state.history,
                templates: this.state.templates,
                tabs: this.state.tabs
            };

            const { saveUserData } = await import('./supabase.js');
            const success = await saveUserData(session.access_token, dataToSync);

            if (success) {
                this.state.syncStatus = 'synced';
                this.notify('syncStatus', 'synced');
            } else {
                this.state.syncStatus = 'error';
                this.notify('syncStatus', 'error');
            }
        } catch (e) {
            console.error('[StateManager] Cloud sync failed:', e);
            this.state.syncStatus = 'error';
            this.notify('syncStatus', 'error');
        }
    }

    setLoginSession(session, profile) {
        window.supabaseSession = session;
        this.state.isLoggedIn = true;
        this.state.adminProfile = profile;
        this.save(STORAGE_KEYS.IS_LOGGED_IN, true);
        this.save(STORAGE_KEYS.ADMIN_PROFILE, profile);
        this.notify('isLoggedIn', true);
        this.notify('adminProfile', profile);
    }

    async prependHistoryItemCloud(entry) {
        try {
            const session = window.supabaseSession;
            if (!session) return;

            this.state.syncStatus = 'syncing';
            this.notify('syncStatus', 'syncing');

            const response = await fetch(`${this.state.settings.supabaseUrl || 'https://qydhvqhkmmrfizawfgvx.supabase.co'}/functions/v1/user-data-proxy`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_history_item: entry })
            });

            if (!response.ok) {
                console.error('[StateManager] Cloud atomic prepend failed, falling back to full sync:', response.status);
                this.updateLocalTimestamp();
            } else {
                console.log('[StateManager] Cloud atomic prepend history success!');
                this.state.syncStatus = 'synced';
                this.notify('syncStatus', 'synced');

                // Notify other devices/tabs
                try {
                    const sync = await getSyncModule();
                    sync.realtimeManager.broadcastChange('history', 'INSERT', entry.id);
                    sync.tabSync.notifyDataUpdate('history', 'INSERT', entry.id);
                } catch (e) { /* ignore */ }
            }
        } catch (e) {
            console.error('[StateManager] Cloud atomic prepend failed, falling back to full sync:', e);
            this.updateLocalTimestamp();
        }
    }

    /**
     * Handle logout cleanup.
     * PRESERVES: theme, UI preferences, sidebar state, layout, animations
     * REMOVES: history, templates, tabs, sync queue, auth session, sync metadata
     */
    async handleLogoutCleanup() {
        this.state.isLoggedIn = false;
        this.state.adminProfile = null;
        this.state.syncStatus = 'idle';
        window.supabaseSession = null;

        this.save(STORAGE_KEYS.IS_LOGGED_IN, false);
        this.save(STORAGE_KEYS.ADMIN_PROFILE, null);

        // Remove account-specific localStorage keys
        // but PRESERVE UI preferences
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
        localStorage.removeItem(STORAGE_KEYS.TABS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB_ID);
        localStorage.removeItem(STORAGE_KEYS.MANUAL_ITEMS);
        localStorage.removeItem(STORAGE_KEYS.MANUAL_TITLE);
        // KEEP: bme_settings (contains theme, language, etc.)
        // KEEP: bme_sidebar_collapsed, bme_preview_collapsed, bme_toolbar_collapsed
        // KEEP: bme_labels_hidden, bme_device_id, bme_manual_card_mode

        // Clean up sync system
        try {
            const sync = await getSyncModule();
            await sync.loginSync.handleLogout();
        } catch (e) {
            console.warn('[StateManager] Sync logout cleanup failed:', e);
        }

        this.notify('isLoggedIn', false);
        this.notify('adminProfile', null);
        this.notify('syncStatus', 'idle');

        // Dispatch global event
        document.dispatchEvent(new CustomEvent('admin-logout'));
    }

    subscribe(key, callback) {
        this.listeners.push({ key, callback });
    }

    notify(key, data) {
        this.listeners.forEach(l => {
            if (l.key === key) l.callback(data);
        });
    }
}

export const appState = new StateManager();
