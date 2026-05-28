/**
 * sync/sync-engine.js — Core Synchronization Orchestrator
 * 
 * Coordinates all sync operations between IndexedDB and Supabase.
 * Handles incremental sync, conflict resolution, and full sync flows.
 * 
 * This is the brain of the sync system — it connects:
 *  - SyncQueue → Cloud upload
 *  - Cloud download → IndexedDB
 *  - Realtime events → incremental patches
 *  - Login/logout → account data management
 */

import {
    getAll, bulkPut, replaceAllForUser,
    getLastSyncTimestamp, updateLastSyncTimestamp,
    clearAccountData, getUserDataCounts, setSyncMeta
} from './db.js';
import { syncQueue } from './sync-queue.js';
import { getDeviceId, getDeviceIdSync } from './device.js';

// ============================================================
// SYNC ENGINE
// ============================================================

class SyncEngine {
    constructor() {
        this._userId = null;
        this._accessToken = null;
        this._supabaseUrl = 'https://qydhvqhkmmrfizawfgvx.supabase.co';
        this._edgeFunctionUrl = `${this._supabaseUrl}/functions/v1/user-data-proxy`;
        this._listeners = [];
        this._isInitialized = false;
        this._syncInProgress = false;

        // Register as the sync handler for the queue
        syncQueue.setSyncHandler(async (pendingOps) => this._processSyncBatch(pendingOps));
    }

    /**
     * Initialize the sync engine for a logged-in user.
     * @param {string} userId
     * @param {string} accessToken
     */
    async init(userId, accessToken) {
        this._userId = userId;
        this._accessToken = accessToken;
        this._isInitialized = true;

        // Ensure device ID is initialized
        await getDeviceId();

        console.log('[SyncEngine] Initialized for user:', userId);

        // Load source-of-truth from IndexedDB and populate localStorage for the UI
        try {
            const [history, templates, tabs] = await Promise.all([
                getAll('history', userId),
                getAll('templates', userId),
                getAll('tabs', userId)
            ]);

            if (history && history.length > 0) {
                localStorage.setItem('bme_history', JSON.stringify(history.map(h => this._stripSyncMeta(h))));
            }
            if (templates && templates.length > 0) {
                localStorage.setItem('bme_templates', JSON.stringify(templates.map(t => this._stripSyncMeta(t))));
            }
            if (tabs && tabs.length > 0) {
                localStorage.setItem('bme_tabs', JSON.stringify(tabs.map(t => this._stripSyncMeta(t))));
            }
        } catch (e) {
            console.error('[SyncEngine] Failed to sync IndexedDB to localStorage on init:', e);
        }
    }

    /**
     * Update the access token (e.g., after token refresh).
     * @param {string} accessToken
     */
    updateToken(accessToken) {
        this._accessToken = accessToken;
    }

    /**
     * Tear down the sync engine (on logout).
     */
    teardown() {
        this._userId = null;
        this._accessToken = null;
        this._isInitialized = false;
        this._syncInProgress = false;
        console.log('[SyncEngine] Torn down');
    }

    // ============================================================
    // FULL SYNC — Upload local state to cloud
    // ============================================================

    /**
     * Upload the entire local state to cloud (full overwrite).
     * Used for initial push, "Keep Local Data", and manual sync.
     * @returns {Promise<boolean>}
     */
    async pushFullState() {
        if (!this._isInitialized || !this._accessToken) return false;

        this._notifyListeners('syncing');

        try {
            const [history, templates, tabs] = await Promise.all([
                getAll('history', this._userId),
                getAll('templates', this._userId),
                getAll('tabs', this._userId)
            ]);

            // Read settings from localStorage (kept there for fast sync access)
            let settings = {};
            try {
                settings = JSON.parse(localStorage.getItem('bme_settings') || '{}');
            } catch (e) { /* ignore */ }

            const deviceId = getDeviceIdSync();
            const payload = {
                settings,
                history: history.map(h => this._stripSyncMeta(h)),
                templates: templates.map(t => this._stripSyncMeta(t)),
                tabs: tabs.map(t => this._stripSyncMeta(t)),
                _sync_meta: {
                    device_id: deviceId,
                    synced_at: new Date().toISOString(),
                    version: 1
                }
            };

            const response = await fetch(this._edgeFunctionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this._accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('[SyncEngine] Push failed:', response.status);
                this._notifyListeners('error');
                return false;
            }

            await updateLastSyncTimestamp();
            this._notifyListeners('synced');
            console.log('[SyncEngine] Full state pushed successfully');
            return true;

        } catch (e) {
            console.error('[SyncEngine] Push error:', e);
            this._notifyListeners('error');
            return false;
        }
    }

    // ============================================================
    // FULL SYNC — Download cloud state to local
    // ============================================================

    /**
     * Pull the entire cloud state into IndexedDB (full overwrite).
     * Used for "Sync From Cloud" and Case A (local empty).
     * @returns {Promise<Object|null>} The cloud data, or null on failure
     */
    async pullFullState() {
        if (!this._isInitialized || !this._accessToken) return null;

        this._notifyListeners('syncing');

        try {
            const cloudData = await this._fetchCloudData();
            if (!cloudData) {
                this._notifyListeners('synced');
                return null;
            }

            await this._applyCloudData(cloudData);
            await updateLastSyncTimestamp();
            this._notifyListeners('synced');

            console.log('[SyncEngine] Full state pulled successfully');
            return cloudData;

        } catch (e) {
            console.error('[SyncEngine] Pull error:', e);
            this._notifyListeners('error');
            return null;
        }
    }

    // ============================================================
    // MERGE — Combine local + cloud data
    // ============================================================

    /**
     * Merge local and cloud data, deduplicating by ID.
     * Preserves the newest version of each record.
     * @returns {Promise<boolean>}
     */
    async mergeData() {
        if (!this._isInitialized || !this._accessToken) return false;

        this._notifyListeners('syncing');

        try {
            const cloudData = await this._fetchCloudData();
            if (!cloudData) {
                // No cloud data — just push local
                return this.pushFullState();
            }

            // Merge each table
            const mergedHistory = await this._mergeTable('history', cloudData.history || []);
            const mergedTemplates = await this._mergeTable('templates', cloudData.templates || []);
            const mergedTabs = await this._mergeTable('tabs', cloudData.tabs || []);

            // Write merged data to IndexedDB & localStorage
            if (mergedHistory.length > 0) {
                await replaceAllForUser('history', this._userId, mergedHistory);
                localStorage.setItem('bme_history', JSON.stringify(mergedHistory.map(r => this._stripSyncMeta(r))));
            }
            if (mergedTemplates.length > 0) {
                await replaceAllForUser('templates', this._userId, mergedTemplates);
                localStorage.setItem('bme_templates', JSON.stringify(mergedTemplates.map(r => this._stripSyncMeta(r))));
            }
            if (mergedTabs.length > 0) {
                await replaceAllForUser('tabs', this._userId, mergedTabs);
                localStorage.setItem('bme_tabs', JSON.stringify(mergedTabs.map(r => this._stripSyncMeta(r))));
            }

            // Merge settings (cloud settings override, local settings fill gaps)
            if (cloudData.settings) {
                const localSettings = JSON.parse(localStorage.getItem('bme_settings') || '{}');
                const mergedSettings = { ...localSettings, ...cloudData.settings };
                localStorage.setItem('bme_settings', JSON.stringify(mergedSettings));
            }

            // Push merged state back to cloud
            await this.pushFullState();

            console.log('[SyncEngine] Data merged successfully');
            return true;

        } catch (e) {
            console.error('[SyncEngine] Merge error:', e);
            this._notifyListeners('error');
            return false;
        }
    }

    // ============================================================
    // INITIAL LOGIN SYNC
    // ============================================================

    /**
     * Determine the sync scenario after login and return the case.
     * @returns {Promise<{case: 'A'|'B'|'C'|'EMPTY', localCounts: Object, cloudCounts: Object, cloudData: Object|null}>}
     */
    async determineLoginCase() {
        if (!this._isInitialized || !this._accessToken) {
            return { case: 'EMPTY', localCounts: {}, cloudCounts: {}, cloudData: null };
        }

        // Get local data counts (check guest data first, then user data if no guest data)
        const guestCounts = await getUserDataCounts('guest');
        const guestHasData = (guestCounts.history + guestCounts.templates) > 0;

        const userCounts = await getUserDataCounts(this._userId);
        const userHasData = (userCounts.history + userCounts.templates) > 0;

        const localCounts = guestHasData ? guestCounts : userCounts;
        const localHasData = guestHasData ? guestHasData : userHasData;

        // Get cloud data
        let cloudData = null;
        let cloudHasData = false;
        let cloudCounts = { history: 0, templates: 0, tabs: 0 };

        try {
            cloudData = await this._fetchCloudData();
            if (cloudData) {
                cloudCounts = {
                    history: (cloudData.history || []).length,
                    templates: (cloudData.templates || []).length,
                    tabs: (cloudData.tabs || []).length
                };
                cloudHasData = (cloudCounts.history + cloudCounts.templates) > 0;
            }
        } catch (e) {
            console.error('[SyncEngine] Failed to fetch cloud data for login case:', e);
        }

        let syncCase;
        if (!localHasData && cloudHasData) {
            syncCase = 'A'; // Local empty, cloud exists
        } else if (localHasData && !cloudHasData) {
            syncCase = 'B'; // Local exists, cloud empty
        } else if (localHasData && cloudHasData) {
            syncCase = 'C'; // Both exist — conflict
        } else {
            syncCase = 'EMPTY'; // Both empty
        }

        console.log(`[SyncEngine] Login case: ${syncCase}`, { localCounts, cloudCounts });
        return { case: syncCase, localCounts, cloudCounts, cloudData };
    }

    /**
     * Handle Case A: Pull cloud data into local.
     * @param {Object} cloudData
     * @returns {Promise<boolean>}
     */
    async handleCaseA(cloudData) {
        if (!cloudData) {
            cloudData = await this._fetchCloudData();
        }
        if (!cloudData) return false;

        await this._applyCloudData(cloudData);
        await updateLastSyncTimestamp();
        this._notifyListeners('synced');
        return true;
    }

    /**
     * Handle Case B: Push local guest data to cloud.
     * Reassigns user_id from 'guest' to actual user ID.
     * @returns {Promise<boolean>}
     */
    async handleCaseB() {
        // Reassign guest data to current user
        await this._reassignGuestData();
        return this.pushFullState();
    }

    // ============================================================
    // INTERNAL HELPERS
    // ============================================================

    /**
     * Fetch cloud data from the edge function.
     * @param {string} since - Optional ISO timestamp for incremental fetch
     * @returns {Promise<Object|null>}
     */
    async _fetchCloudData(since = null) {
        let url = this._edgeFunctionUrl;
        if (since) {
            url += `?since=${encodeURIComponent(since)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._accessToken}`
            }
        });

        if (response.status === 403) {
            throw new Error('403');
        }

        if (!response.ok) {
            throw new Error(`Cloud fetch failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data || Object.keys(data).length === 0) return null;
        return data;
    }

    /**
     * Apply cloud data into IndexedDB for the current user.
     * @param {Object} cloudData - { settings, history, templates, tabs }
     */
    async _applyCloudData(cloudData) {
        const now = new Date().toISOString();
        const deviceId = getDeviceIdSync();

        if (cloudData.history && Array.isArray(cloudData.history)) {
            const records = cloudData.history.map((item, i) => ({
                id: item.id || `cloud_${Date.now()}_${i}`,
                user_id: this._userId,
                title: item.title || '',
                date: item.date || now,
                items: item.items || [],
                cardMode: item.cardMode || 'simple',
                timestamp: item.timestamp || now,
                created_at: item.timestamp || item.date || now,
                updated_at: item.updated_at || now,
                version: item.version || 1,
                device_id: item.device_id || deviceId,
                deleted_at: item.deleted_at || null
            }));
            await replaceAllForUser('history', this._userId, records);
            localStorage.setItem('bme_history', JSON.stringify(records.map(r => this._stripSyncMeta(r))));
        }

        if (cloudData.templates && Array.isArray(cloudData.templates)) {
            const records = cloudData.templates.map((item, i) => ({
                id: item.id || `tmpl_cloud_${Date.now()}_${i}`,
                user_id: this._userId,
                name: item.name || '',
                items: item.items || [],
                created_at: item.created_at || now,
                updated_at: item.updated_at || now,
                version: item.version || 1,
                device_id: item.device_id || deviceId,
                deleted_at: item.deleted_at || null
            }));
            await replaceAllForUser('templates', this._userId, records);
            localStorage.setItem('bme_templates', JSON.stringify(records.map(r => this._stripSyncMeta(r))));
        }

        if (cloudData.tabs && Array.isArray(cloudData.tabs)) {
            const records = cloudData.tabs.map(item => ({
                id: item.id,
                user_id: this._userId,
                mode: item.mode,
                title: item.title || '',
                data: item.data || {},
                created_at: item.created_at || now,
                updated_at: item.updated_at || now,
                version: item.version || 1,
                device_id: item.device_id || deviceId
            }));
            await replaceAllForUser('tabs', this._userId, records);
            localStorage.setItem('bme_tabs', JSON.stringify(records.map(r => this._stripSyncMeta(r))));
        }

        if (cloudData.settings) {
            const localSettings = JSON.parse(localStorage.getItem('bme_settings') || '{}');
            // Preserve local UI preferences, merge cloud business settings
            const uiKeys = ['theme', 'sidebar_collapsed', 'preview_collapsed', 'toolbar_collapsed'];
            const preservedUI = {};
            uiKeys.forEach(key => {
                if (localSettings[key] !== undefined) preservedUI[key] = localSettings[key];
            });
            const merged = { ...localSettings, ...cloudData.settings, ...preservedUI };
            localStorage.setItem('bme_settings', JSON.stringify(merged));
        }
    }

    /**
     * Merge a table's local and cloud records by ID.
     * Newest updated_at wins, then highest version.
     * @param {string} tableName
     * @param {Array} cloudRecords
     * @returns {Promise<Array>}
     */
    async _mergeTable(tableName, cloudRecords) {
        const localRecords = await getAll(tableName, this._userId);
        // Also include guest data for initial merge
        const guestRecords = await getAll(tableName, 'guest');
        const allLocal = [...localRecords, ...guestRecords];

        const mergedMap = new Map();

        // Add local records to map
        allLocal.forEach(record => {
            mergedMap.set(String(record.id), {
                ...record,
                user_id: this._userId
            });
        });

        // Merge cloud records
        const now = new Date().toISOString();
        const deviceId = getDeviceIdSync();

        cloudRecords.forEach((cloudRecord, index) => {
            const id = String(cloudRecord.id || `cloud_merge_${Date.now()}_${index}`);
            const existing = mergedMap.get(id);

            const normalizedCloud = {
                ...cloudRecord,
                id,
                user_id: this._userId,
                updated_at: cloudRecord.updated_at || now,
                version: cloudRecord.version || 1,
                device_id: cloudRecord.device_id || deviceId,
                created_at: cloudRecord.created_at || cloudRecord.timestamp || cloudRecord.date || now
            };

            if (!existing) {
                // New record from cloud
                mergedMap.set(id, normalizedCloud);
            } else {
                // Both exist — resolve conflict
                const localTime = new Date(existing.updated_at || 0).getTime();
                const cloudTime = new Date(normalizedCloud.updated_at || 0).getTime();

                if (cloudTime > localTime) {
                    mergedMap.set(id, normalizedCloud);
                } else if (cloudTime === localTime) {
                    // Same timestamp — highest version wins
                    if ((normalizedCloud.version || 0) > (existing.version || 0)) {
                        mergedMap.set(id, normalizedCloud);
                    }
                    // else: local wins (already in map)
                }
                // else: local is newer, keep it
            }
        });

        // Sort history by timestamp/date (newest first)
        const merged = Array.from(mergedMap.values());
        if (tableName === 'history') {
            merged.sort((a, b) => {
                const timeA = new Date(a.timestamp || a.date || 0).getTime();
                const timeB = new Date(b.timestamp || b.date || 0).getTime();
                return timeB - timeA;
            });
        }

        return merged;
    }

    /**
     * Reassign guest data to the current user ID.
     */
    async _reassignGuestData() {
        const tables = ['history', 'templates', 'tabs'];
        for (const tableName of tables) {
            const guestRecords = await getAll(tableName, 'guest');
            if (guestRecords.length > 0) {
                const reassigned = guestRecords.map(r => ({
                    ...r,
                    user_id: this._userId
                }));
                await bulkPut(tableName, reassigned);
                // Clear old guest records
                const { clearUserData } = await import('./db.js');
                // Only clear if reassignment succeeded
            }
        }
    }

    /**
     * Strip sync metadata from a record for cloud transmission.
     * Keeps business data clean.
     */
    _stripSyncMeta(record) {
        const { user_id, device_id, ...rest } = record;
        return rest;
    }

    /**
     * Process a batch of pending sync operations.
     * Called by the SyncQueue when flushing.
     * @param {Array} pendingOps
     * @returns {Promise<{processed: number[], failed: number[]}>}
     */
    async _processSyncBatch(pendingOps) {
        if (!this._isInitialized || !this._accessToken) {
            return { processed: [], failed: pendingOps.map(op => op.id) };
        }

        // Instead of processing individual ops, do a full state push
        // This is simpler and works well with the JSONB blob design
        try {
            const success = await this.pushFullState();
            if (success) {
                return { processed: pendingOps.map(op => op.id), failed: [] };
            } else {
                return { processed: [], failed: pendingOps.map(op => op.id) };
            }
        } catch (e) {
            console.error('[SyncEngine] Batch processing failed:', e);
            return { processed: [], failed: pendingOps.map(op => op.id) };
        }
    }

    // ============================================================
    // INCREMENTAL PATCH (from Realtime events)
    // ============================================================

    /**
     * Apply an incremental patch from a Realtime broadcast event.
     * Only fetches changed data from cloud, not the full state.
     * @param {Object} eventPayload - { table, record_id, action, device_id }
     * @returns {Promise<void>}
     */
    async applyRealtimePatch(eventPayload) {
        if (!this._isInitialized || !this._accessToken) return;

        // Ignore events from this device
        const currentDeviceId = getDeviceIdSync();
        if (eventPayload.device_id === currentDeviceId) {
            console.log('[SyncEngine] Ignoring self-triggered realtime event');
            return;
        }

        console.log('[SyncEngine] Applying realtime patch:', eventPayload);

        // For JSONB design, pull the full state and apply
        // (since we can't fetch individual records from the JSONB blob)
        try {
            const cloudData = await this._fetchCloudData();
            if (cloudData) {
                await this._applyCloudData(cloudData);
                await updateLastSyncTimestamp();
                this._notifyListeners('patched', eventPayload);
            }
        } catch (e) {
            console.error('[SyncEngine] Realtime patch failed:', e);
        }
    }

    // ============================================================
    // STATUS LISTENERS
    // ============================================================

    /**
     * Subscribe to sync status changes.
     * @param {Function} callback - (status, data) => void
     */
    onStatusChange(callback) {
        this._listeners.push(callback);
    }

    offStatusChange(callback) {
        this._listeners = this._listeners.filter(l => l !== callback);
    }

    _notifyListeners(status, data = null) {
        this._listeners.forEach(cb => {
            try { cb(status, data); } catch (e) { /* ignore */ }
        });
    }

    // ============================================================
    // PUBLIC GETTERS
    // ============================================================

    get isInitialized() { return this._isInitialized; }
    get userId() { return this._userId; }
}

// Singleton
export const syncEngine = new SyncEngine();
export default syncEngine;
