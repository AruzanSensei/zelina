/**
 * sync/login-sync.js — Login Synchronization Orchestrator
 * 
 * Handles the three login synchronization cases:
 *  Case A: Local empty, Cloud exists → Auto-pull
 *  Case B: Local exists, Cloud empty → Auto-push  
 *  Case C: Local + Cloud exist → Show conflict dialog
 * 
 * Also handles:
 *  - Session restoration on page refresh
 *  - Account switching isolation
 *  - Logout cleanup with preference preservation
 */

import { syncEngine } from './sync-engine.js';
import { realtimeManager } from './realtime.js';
import { tabSync } from './tab-sync.js';
import { clearAccountData, getUserDataCounts, clearSyncQueue, clearSyncMeta } from './db.js';
import { getDeviceId } from './device.js';

// ============================================================
// LOGIN SYNC ORCHESTRATOR
// ============================================================

class LoginSyncOrchestrator {
    constructor() {
        this._listeners = [];
        this._currentUserId = null;
    }

    /**
     * Handle a new login event.
     * Determines the sync case and acts accordingly.
     * 
     * @param {Object} session - Supabase session object
     * @param {Object} user - Validated user profile
     * @param {Object} supabaseClient - Supabase client for Realtime
     * @returns {Promise<{case: string, action: string}>}
     */
    async handleLogin(session, user, supabaseClient) {
        const userId = user.id;

        // Check if this is a different account than what was previously loaded
        if (this._currentUserId && this._currentUserId !== userId) {
            console.log('[LoginSync] Account switch detected:', this._currentUserId, '→', userId);
            await this._handleAccountSwitch(userId);
        }

        this._currentUserId = userId;

        // Initialize sync engine
        await syncEngine.init(userId, session.access_token);

        // Initialize device ID
        await getDeviceId();

        // Subscribe to Realtime
        await realtimeManager.subscribe(supabaseClient, userId);

        // Notify other tabs
        tabSync.notifyLogin(userId);

        // Determine sync case
        const result = await syncEngine.determineLoginCase();

        console.log(`[LoginSync] Case: ${result.case}`, {
            local: result.localCounts,
            cloud: result.cloudCounts
        });

        switch (result.case) {
            case 'A':
                // Local empty, cloud exists → auto-pull
                this._notifyListeners('sync-start', { case: 'A', message: 'Menyinkronkan data dari cloud...' });
                const pullSuccess = await syncEngine.handleCaseA(result.cloudData);
                if (pullSuccess) {
                    this._notifyListeners('sync-complete', { case: 'A', message: 'Data cloud berhasil dimuat.' });
                } else {
                    this._notifyListeners('sync-error', { case: 'A', message: 'Gagal memuat data cloud.' });
                }
                return { case: 'A', action: 'auto-pulled' };

            case 'B':
                // Local exists, cloud empty → auto-push
                this._notifyListeners('sync-start', { case: 'B', message: 'Mengunggah data lokal ke cloud...' });
                const pushSuccess = await syncEngine.handleCaseB();
                if (pushSuccess) {
                    this._notifyListeners('sync-complete', { case: 'B', message: 'Data lokal berhasil diunggah ke cloud.' });
                } else {
                    this._notifyListeners('sync-error', { case: 'B', message: 'Gagal mengunggah data ke cloud.' });
                }
                return { case: 'B', action: 'auto-pushed' };

            case 'C':
                // Both exist → merge automatically in the background
                this._notifyListeners('sync-start', { case: 'C', message: 'Sinkronisasi data latar belakang...' });
                const mergeSuccess = await syncEngine.mergeData();
                if (mergeSuccess) {
                    this._notifyListeners('sync-complete', { case: 'C', message: 'Data berhasil disinkronkan.' });
                    realtimeManager.broadcastSyncComplete();
                } else {
                    this._notifyListeners('sync-error', { case: 'C', message: 'Gagal menyinkronkan data.' });
                }
                return { case: 'C', action: 'auto-merged' };

            case 'EMPTY':
                // Both empty — nothing to sync
                this._notifyListeners('sync-complete', { case: 'EMPTY', message: 'Akun siap digunakan.' });
                return { case: 'EMPTY', action: 'none' };

            default:
                return { case: 'UNKNOWN', action: 'none' };
        }
    }

    /**
     * Handle session restoration on page refresh.
     * Similar to handleLogin but uses existing session.
     * 
     * @param {Object} session
     * @param {Object} user
     * @param {Object} supabaseClient
     * @returns {Promise<{case: string, action: string}>}
     */
    async handleSessionRestore(session, user, supabaseClient) {
        const userId = user.id;
        this._currentUserId = userId;

        // Initialize sync engine
        await syncEngine.init(userId, session.access_token);

        // Initialize device ID
        await getDeviceId();

        // Subscribe to Realtime
        await realtimeManager.subscribe(supabaseClient, userId);

        // On refresh, check if cloud data differs from local
        // But don't trigger full conflict dialog — just quietly check
        try {
            const result = await syncEngine.determineLoginCase();

            if (result.case === 'C') {
                // Conflict exists on refresh — silently merge automatically in the background
                console.log('[LoginSync] Conflict detected on restore — auto-merging data...');
                await syncEngine.mergeData();
                this._notifyListeners('sync-complete', { case: 'C', message: 'Data berhasil disinkronkan.' });
            } else if (result.case === 'A') {
                // Only cloud has data — pull silently
                await syncEngine.handleCaseA(result.cloudData);
                this._notifyListeners('sync-complete', { case: 'A', message: 'Data cloud dimuat.' });
            }
            // For case B and EMPTY, do nothing on refresh

            return { case: result.case, action: 'checked' };
        } catch (e) {
            console.error('[LoginSync] Session restore check failed:', e);
            return { case: 'ERROR', action: 'none' };
        }
    }

    /**
     * Handle conflict resolution choice.
     * @param {'merge' | 'pull' | 'keep'} choice
     * @param {Object} cloudData - Cached cloud data from conflict detection
     * @returns {Promise<boolean>}
     */
    async resolveConflict(choice, cloudData = null) {
        this._notifyListeners('sync-start', { message: 'Memproses pilihan sinkronisasi...' });

        try {
            switch (choice) {
                case 'merge':
                    const mergeResult = await syncEngine.mergeData();
                    if (mergeResult) {
                        this._notifyListeners('sync-complete', { message: 'Data berhasil digabungkan.' });
                        realtimeManager.broadcastSyncComplete();
                    } else {
                        this._notifyListeners('sync-error', { message: 'Gagal menggabungkan data.' });
                    }
                    return mergeResult;

                case 'pull':
                    const pullResult = await syncEngine.pullFullState();
                    if (pullResult) {
                        this._notifyListeners('sync-complete', { message: 'Data cloud berhasil dimuat.' });
                        realtimeManager.broadcastSyncComplete();
                    } else {
                        this._notifyListeners('sync-error', { message: 'Gagal memuat data cloud.' });
                    }
                    return !!pullResult;

                case 'keep':
                    const keepResult = await syncEngine.pushFullState();
                    if (keepResult) {
                        this._notifyListeners('sync-complete', { message: 'Data lokal berhasil diunggah ke cloud.' });
                        realtimeManager.broadcastSyncComplete();
                    } else {
                        this._notifyListeners('sync-error', { message: 'Gagal mengunggah data lokal.' });
                    }
                    return keepResult;

                default:
                    return false;
            }
        } catch (e) {
            console.error('[LoginSync] Conflict resolution failed:', e);
            this._notifyListeners('sync-error', { message: 'Gagal memproses sinkronisasi.' });
            return false;
        }
    }

    /**
     * Handle user logout.
     * Cleans up account-specific data while preserving UI preferences.
     */
    async handleLogout() {
        console.log('[LoginSync] Processing logout cleanup...');

        // Broadcast logout to other devices
        await realtimeManager.broadcastLogout();

        // Unsubscribe from Realtime
        await realtimeManager.unsubscribe();

        // Tear down sync engine
        syncEngine.teardown();

        // Clear account-specific IndexedDB data
        if (this._currentUserId) {
            await clearAccountData(this._currentUserId);
        }

        // Clear sync queue and metadata (except device_id)
        await clearSyncQueue();

        // Notify other tabs
        tabSync.notifyLogout();

        // Preserve UI preferences in localStorage:
        // - bme_settings (theme, language, layout prefs)
        // - bme_sidebar_collapsed
        // - bme_preview_collapsed
        // - bme_toolbar_collapsed
        // - bme_labels_hidden
        // - bme_device_id
        //
        // Remove account-specific localStorage:
        const keysToRemove = [
            'bme_history',
            'bme_templates',
            'bme_tabs',
            'bme_active_tab_id',
            'bme_is_logged_in',
            'bme_admin_profile',
            'bme_manual_items',
            'bme_manual_title'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        this._currentUserId = null;

        this._notifyListeners('logout-complete');
        console.log('[LoginSync] Logout cleanup complete');
    }

    /**
     * Handle switching from one account to another.
     * @param {string} newUserId
     */
    async _handleAccountSwitch(newUserId) {
        console.log('[LoginSync] Account switch:', this._currentUserId, '→', newUserId);

        // Unsubscribe from old user's Realtime
        await realtimeManager.unsubscribe();

        // Clear previous account's data
        if (this._currentUserId) {
            await clearAccountData(this._currentUserId);
        }

        // Clear sync queue
        await clearSyncQueue();

        // Notify other tabs
        tabSync.notifyAccountSwitch(newUserId);

        this._notifyListeners('account-switched', { from: this._currentUserId, to: newUserId });
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    /**
     * Subscribe to login sync events.
     * @param {Function} callback - (event, data) => void
     *   Events: 'sync-start' | 'sync-complete' | 'sync-error' | 
     *           'conflict' | 'conflict-detected' | 'logout-complete' | 'account-switched'
     */
    onEvent(callback) {
        this._listeners.push(callback);
    }

    offEvent(callback) {
        this._listeners = this._listeners.filter(l => l !== callback);
    }

    _notifyListeners(event, data = null) {
        this._listeners.forEach(cb => {
            try { cb(event, data); } catch (e) { /* ignore */ }
        });
    }

    get currentUserId() { return this._currentUserId; }
}

// Singleton
export const loginSync = new LoginSyncOrchestrator();
export default loginSync;
