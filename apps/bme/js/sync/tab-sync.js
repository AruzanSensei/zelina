/**
 * sync/tab-sync.js — BroadcastChannel Multi-Tab Synchronization
 * 
 * Keeps all open browser tabs synchronized locally.
 * Uses the BroadcastChannel API with a fallback to
 * the `storage` event for legacy browser support.
 * 
 * Message types:
 *  - data-updated: A table record was changed in another tab
 *  - logout: User logged out in another tab
 *  - login: User logged in in another tab
 *  - sync-status: Sync status changed
 *  - account-switch: A different account logged in
 */

// ============================================================
// TAB SYNC MANAGER
// ============================================================

const CHANNEL_NAME = 'bme-local-sync';
const LS_FALLBACK_KEY = 'bme_tab_sync_event';

class TabSyncManager {
    constructor() {
        this._channel = null;
        this._listeners = [];
        this._useFallback = false;

        this._init();
    }

    /**
     * Initialize the BroadcastChannel or fallback.
     */
    _init() {
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this._channel = new BroadcastChannel(CHANNEL_NAME);
                this._channel.onmessage = (event) => {
                    this._handleMessage(event.data);
                };
                console.log('[TabSync] BroadcastChannel initialized');
            } catch (e) {
                console.warn('[TabSync] BroadcastChannel failed, using fallback:', e);
                this._useFallback = true;
            }
        } else {
            console.warn('[TabSync] BroadcastChannel not supported, using localStorage fallback');
            this._useFallback = true;
        }

        if (this._useFallback) {
            window.addEventListener('storage', (event) => {
                if (event.key === LS_FALLBACK_KEY && event.newValue) {
                    try {
                        const data = JSON.parse(event.newValue);
                        this._handleMessage(data);
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            });
        }
    }

    /**
     * Send a message to all other tabs.
     * @param {string} type - Message type
     * @param {Object} data - Message payload
     */
    send(type, data = {}) {
        const message = {
            type,
            data,
            tab_id: this._getTabId(),
            timestamp: Date.now()
        };

        if (this._channel && !this._useFallback) {
            try {
                this._channel.postMessage(message);
            } catch (e) {
                console.warn('[TabSync] postMessage failed:', e);
                this._sendFallback(message);
            }
        } else {
            this._sendFallback(message);
        }
    }

    /**
     * Send a data-updated notification.
     * @param {string} table - 'history', 'templates', 'tabs', 'settings'
     * @param {string} action - 'INSERT', 'UPDATE', 'DELETE', 'FULL_SYNC'
     * @param {string} recordId - Optional record ID
     */
    notifyDataUpdate(table, action, recordId = null) {
        this.send('data-updated', { table, action, record_id: recordId });
    }

    /**
     * Notify all tabs of a logout event.
     */
    notifyLogout() {
        this.send('logout');
    }

    /**
     * Notify all tabs of a login event.
     * @param {string} userId
     */
    notifyLogin(userId) {
        this.send('login', { user_id: userId });
    }

    /**
     * Notify all tabs of a sync status change.
     * @param {string} status
     */
    notifySyncStatus(status) {
        this.send('sync-status', { status });
    }

    /**
     * Notify all tabs of an account switch.
     * @param {string} newUserId
     */
    notifyAccountSwitch(newUserId) {
        this.send('account-switch', { new_user_id: newUserId });
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    /**
     * Subscribe to messages from other tabs.
     * @param {string} type - Message type to listen for, or '*' for all
     * @param {Function} callback - (data, message) => void
     */
    on(type, callback) {
        this._listeners.push({ type, callback });
    }

    /**
     * Remove a listener.
     * @param {string} type
     * @param {Function} callback
     */
    off(type, callback) {
        this._listeners = this._listeners.filter(
            l => !(l.type === type && l.callback === callback)
        );
    }

    // ============================================================
    // INTERNAL
    // ============================================================

    _handleMessage(message) {
        if (!message || !message.type) return;

        // Ignore messages from this tab
        if (message.tab_id === this._getTabId()) return;

        console.log(`[TabSync] Received: ${message.type}`, message.data);

        this._listeners.forEach(listener => {
            if (listener.type === '*' || listener.type === message.type) {
                try {
                    listener.callback(message.data, message);
                } catch (e) {
                    console.error('[TabSync] Listener error:', e);
                }
            }
        });
    }

    _sendFallback(message) {
        try {
            localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(message));
            // Clear immediately to allow re-triggering
            setTimeout(() => localStorage.removeItem(LS_FALLBACK_KEY), 100);
        } catch (e) {
            // Ignore storage errors
        }
    }

    _getTabId() {
        if (!this._tabId) {
            this._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }
        return this._tabId;
    }

    /**
     * Cleanup on page unload.
     */
    destroy() {
        if (this._channel) {
            this._channel.close();
            this._channel = null;
        }
        this._listeners = [];
    }
}

// Singleton
export const tabSync = new TabSyncManager();
export default tabSync;
