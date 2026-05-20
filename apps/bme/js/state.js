/**
 * Global State Management
 * Handles persistence and shared state
 */

const STORAGE_KEYS = {
    SETTINGS: 'bme_settings',
    HISTORY: 'bme_history',
    TEMPLATES: 'bme_templates',
    MANUAL_ITEMS: 'bme_manual_items',
    MANUAL_TITLE: 'bme_manual_title',
    MANUAL_CARD_MODE: 'bme_manual_card_mode',
    TABS: 'bme_tabs',
    ACTIVE_TAB_ID: 'bme_active_tab_id'
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
        }
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
            currentMode: 'manual', // manual, ai, history, finance
            manualViewMode: 'card', // card, table
            manualCardMode: this.load(STORAGE_KEYS.MANUAL_CARD_MODE, 'simple'), // simple, advance
            settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULTS.settings),
            history: this.load(STORAGE_KEYS.HISTORY, []),
            templates: this.load(STORAGE_KEYS.TEMPLATES, DEFAULTS.templates),
            tabs: cachedTabs || [],
            activeTabId: cachedActiveId
        };

        // If tabs are empty, create default tab
        if (this.state.tabs.length === 0) {
            const initialTab = {
                id: 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                mode: 'manual',
                title: legacyTitle || 'Invoice #001',
                data: {
                    invoiceItems: legacyItems && legacyItems.length > 0 ? legacyItems : []
                }
            };
            this.state.tabs = [initialTab];
            this.state.activeTabId = initialTab.id;
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
        } catch (e) {
            console.error('Error saving state:', e);
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
                manual: 'Manual',
                ai: 'AI Mode',
                finance: 'Keuangan',
                history: 'Histori'
            };
            title = `${modeNames[mode] || 'Tab'} ${count}`;
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
    }

    addToHistory(entry) {
        this.state.history.unshift(entry);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    updateItems(items) {
        const tab = this.getActiveTab();
        if (tab && tab.mode === 'manual') {
            tab.data.invoiceItems = items;
            this.saveTabs();
            this.notify('items', items);
        }
    }

    updateManualTitle(title) {
        const tab = this.getActiveTab();
        if (tab && tab.mode === 'manual') {
            tab.title = title;
            this.saveTabs();
            this.notify('manualTitle', title);
            this.notify('tabs', this.state.tabs);
        }
    }

    updateManualCardMode(mode) {
        this.state.manualCardMode = mode;
        this.save(STORAGE_KEYS.MANUAL_CARD_MODE, mode);
        this.notify('manualCardMode', mode);
    }

    updateHistoryTitle(id, newTitle) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            item.title = newTitle;
            this.save(STORAGE_KEYS.HISTORY, this.state.history);
            this.notify('history', this.state.history);
        }
    }

    updateHistoryEntry(id, updates) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            Object.assign(item, updates);
            this.save(STORAGE_KEYS.HISTORY, this.state.history);
            this.notify('history', this.state.history);
        }
    }

    removeFromHistory(index) {
        this.state.history.splice(index, 1);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    addTemplate(template) {
        this.state.templates.push(template);
        this.save(STORAGE_KEYS.TEMPLATES, this.state.templates);
        this.notify('templates', this.state.templates);
    }

    removeMultipleFromHistory(indices) {
        const sorted = [...indices].sort((a, b) => b - a);
        sorted.forEach(i => this.state.history.splice(i, 1));
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    resetSettings() {
        this.state.settings = JSON.parse(JSON.stringify(DEFAULTS.settings));
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
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
