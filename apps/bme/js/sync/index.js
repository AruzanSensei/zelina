/**
 * sync/index.js — Sync System Entry Point
 * 
 * Initializes and wires all sync modules together.
 * This is the single import point for the rest of the app.
 * 
 * Provides:
 *  - initSyncSystem() — one-time initialization
 *  - All module singletons re-exported
 */

import { db, migrateFromLocalStorage, getAll, putRecord, bulkPut, softDelete,
         replaceAllForUser, getUserDataCounts, enqueueSyncOp, clearAccountData, resetDeadSyncOps } from './db.js';
import { getDeviceId, getDeviceIdSync, isCurrentDevice } from './device.js';
import { syncQueue } from './sync-queue.js';
import { syncEngine } from './sync-engine.js';
import { realtimeManager } from './realtime.js';
import { tabSync } from './tab-sync.js';
import { loginSync } from './login-sync.js';
import { conflictDialog } from './conflict-dialog.js';

let _initialized = false;

/**
 * Initialize the complete sync system.
 * Should be called once at app startup (DOMContentLoaded).
 * 
 * @returns {Promise<{migrated: boolean}>}
 */
export async function initSyncSystem() {
    if (_initialized) return { migrated: false };

    console.log('[Sync] Initializing sync system...');

    // 1. Initialize device ID
    await getDeviceId();

    // 2. Migrate localStorage → IndexedDB (one-time)
    const migration = await migrateFromLocalStorage();
    if (migration.migrated) {
        console.log('[Sync] localStorage migration completed:', migration.stats);
    }

    // 3. Wire Realtime events → SyncEngine
    realtimeManager.onEvent((event, data) => {
        if (event === 'data-changed') {
            // Another device changed data — pull incremental patch
            syncEngine.applyRealtimePatch(data);
            // Also notify this tab's UI
            _notifyGlobalListeners('remote-update', data);
        } else if (event === 'sync-complete') {
            // Another device completed a full sync — refresh local
            syncEngine.applyRealtimePatch({ action: 'FULL_SYNC', ...data });
            _notifyGlobalListeners('remote-sync', data);
        } else if (event === 'logout') {
            // Another device logged out — clean up locally too
            _notifyGlobalListeners('remote-logout', data);
        }
    });

    // 4. Wire Tab Sync events → local state refresh
    tabSync.on('data-updated', (data) => {
        _notifyGlobalListeners('tab-update', data);
    });

    tabSync.on('logout', () => {
        _notifyGlobalListeners('tab-logout');
    });

    tabSync.on('login', (data) => {
        _notifyGlobalListeners('tab-login', data);
    });

    tabSync.on('account-switch', (data) => {
        _notifyGlobalListeners('tab-account-switch', data);
    });

    // 5. Wire SyncQueue status → global listeners
    syncQueue.onStatusChange((status, data) => {
        _notifyGlobalListeners('queue-status', { status, ...data });
    });

    // 6. Wire SyncEngine status → global listeners
    syncEngine.onStatusChange((status, data) => {
        _notifyGlobalListeners('engine-status', { status, ...data });
    });

    // 7. Wire LoginSync events → global listeners
    loginSync.onEvent((event, data) => {
        _notifyGlobalListeners('login-sync', { event, ...data });
    });

    _initialized = true;
    console.log('[Sync] Sync system initialized');
    return { migrated: migration.migrated };
}

// ============================================================
// GLOBAL EVENT SYSTEM
// ============================================================

const _globalListeners = [];

/**
 * Subscribe to global sync events.
 * @param {Function} callback - (type, data) => void
 */
export function onSyncEvent(callback) {
    _globalListeners.push(callback);
}

export function offSyncEvent(callback) {
    const idx = _globalListeners.indexOf(callback);
    if (idx !== -1) _globalListeners.splice(idx, 1);
}

function _notifyGlobalListeners(type, data = null) {
    _globalListeners.forEach(cb => {
        try { cb(type, data); } catch (e) { /* ignore */ }
    });
}

// ============================================================
// RE-EXPORTS for convenience
// ============================================================

export {
    db,
    getAll,
    putRecord,
    bulkPut,
    softDelete,
    replaceAllForUser,
    getUserDataCounts,
    enqueueSyncOp,
    clearAccountData,
    resetDeadSyncOps,
    getDeviceId,
    getDeviceIdSync,
    isCurrentDevice,
    syncQueue,
    syncEngine,
    realtimeManager,
    tabSync,
    loginSync,
    conflictDialog
};
