/**
 * DocFlow State Management
 * Handles persistence and shared state across components
 */

const STORAGE_KEYS = {
    SETTINGS: 'docflow_settings',
    HISTORY: 'docflow_history',
    CURRENT_DOC: 'docflow_current_doc'
};

const DEFAULTS = {
    settings: {
        theme: 'light',
        defaultDownloadMethod: 'png',
        downloadFormats: { png: true, jpeg: true, pdf: true }
    },
    currentDoc: {
        templateId: 'invoice',
        title: '',
        data: {},
        items: []
    }
};

class StateManager {
    constructor() {
        this.state = {
            settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULTS.settings),
            history: this.load(STORAGE_KEYS.HISTORY, []),
            currentDoc: this.load(STORAGE_KEYS.CURRENT_DOC, DEFAULTS.currentDoc)
        };
        this.listeners = [];
    }

    load(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return JSON.parse(JSON.stringify(fallback));
            const parsed = JSON.parse(data);
            if (typeof parsed === 'object' && typeof fallback === 'object' && !Array.isArray(fallback)) {
                return { ...fallback, ...parsed };
            }
            return parsed;
        } catch (e) {
            console.error('[DocFlow State] Load error:', e);
            return JSON.parse(JSON.stringify(fallback));
        }
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('[DocFlow State] Save error:', e);
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(key, value) {
        this.listeners.forEach(fn => fn(key, value));
    }

    // Settings
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
    }

    // Current Document
    updateCurrentDoc(updates) {
        this.state.currentDoc = { ...this.state.currentDoc, ...updates };
        this.save(STORAGE_KEYS.CURRENT_DOC, this.state.currentDoc);
        this.notify('currentDoc', this.state.currentDoc);
    }

    setDocItems(items) {
        this.state.currentDoc.items = items;
        this.save(STORAGE_KEYS.CURRENT_DOC, this.state.currentDoc);
        this.notify('items', items);
    }

    setDocData(data) {
        this.state.currentDoc.data = data;
        this.save(STORAGE_KEYS.CURRENT_DOC, this.state.currentDoc);
        this.notify('data', data);
    }

    // History
    addToHistory(entry) {
        this.state.history.unshift(entry);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    removeFromHistory(index) {
        this.state.history.splice(index, 1);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    clearHistory() {
        this.state.history = [];
        this.save(STORAGE_KEYS.HISTORY, []);
        this.notify('history', []);
    }

    resetCurrentDoc() {
        this.state.currentDoc = JSON.parse(JSON.stringify(DEFAULTS.currentDoc));
        this.save(STORAGE_KEYS.CURRENT_DOC, this.state.currentDoc);
        this.notify('currentDoc', this.state.currentDoc);
    }
}

export const appState = new StateManager();
