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
    MANUAL_CARD_MODE: 'bme_manual_card_mode'
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
        titleRequired: true,
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
        this.state = {
            currentMode: 'manual', // manual, ai, history
            manualViewMode: 'card', // card, table
            manualCardMode: this.load(STORAGE_KEYS.MANUAL_CARD_MODE, 'simple'), // simple, advance
            invoiceItems: this.load(STORAGE_KEYS.MANUAL_ITEMS, DEFAULTS.manualItems),
            manualTitle: this.load(STORAGE_KEYS.MANUAL_TITLE, DEFAULTS.manualTitle),
            settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULTS.settings),
            history: this.load(STORAGE_KEYS.HISTORY, []),
            templates: this.load(STORAGE_KEYS.TEMPLATES, DEFAULTS.templates)
        };

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
        this.save(STORAGE_KEYS.MANUAL_ITEMS, items);
        this.notify('items', this.state.invoiceItems);
    }

    updateManualTitle(title) {
        this.state.manualTitle = title;
        this.save(STORAGE_KEYS.MANUAL_TITLE, title);
        this.notify('manualTitle', title);
    }

    updateHistoryTitle(id, newTitle) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            item.title = newTitle;
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
        // Sort descending so splice doesn't shift indices
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
