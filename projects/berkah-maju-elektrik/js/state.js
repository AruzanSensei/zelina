/**
 * Global State Management
 * Handles persistence and shared state
 */

const STORAGE_KEYS = {
    SETTINGS: 'bme_settings',
    HISTORY: 'bme_history',
    TEMPLATES: 'bme_templates'
};

const DEFAULTS = {
    settings: {
        language: 'id',
        theme: 'light'
    },
    templates: [
        {
            id: 1,
            name: "Instalasi Listrik Rumah",
            items: [
                { name: "Kabel NYM 3x2.5", price: 150000, qty: 10, note: "Eterna" },
                { name: "MCB Schneider 16A", price: 85000, qty: 5, note: "" },
                { name: "Stop Kontak Panasonic", price: 25000, qty: 8, note: "Tempel" }
            ]
        }
    ]
};

class StateManager {
    constructor() {
        this.state = {
            currentMode: 'manual', // manual, ai, history
            invoiceItems: [],
            settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULTS.settings),
            history: this.load(STORAGE_KEYS.HISTORY, []),
            templates: this.load(STORAGE_KEYS.TEMPLATES, DEFAULTS.templates)
        };

        this.listeners = [];
    }

    load(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
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

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save(STORAGE_KEYS.SETTINGS, this.state.settings);
        this.notify('settings', this.state.settings);
    }

    addToHistory(entry) {
        // Entry: { id, filename, date, timestamp, items, total, title }
        this.state.history.unshift(entry);
        this.save(STORAGE_KEYS.HISTORY, this.state.history);
        this.notify('history', this.state.history);
    }

    updateItems(items) {
        this.state.invoiceItems = items;
        this.notify('items', this.state.invoiceItems);
    }

    addTemplate(template) {
        this.state.templates.push(template);
        this.save(STORAGE_KEYS.TEMPLATES, this.state.templates);
        this.notify('templates', this.state.templates);
    }

    // Observer pattern simple implementation
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
