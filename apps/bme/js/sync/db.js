/**
 * sync/db.js — Dexie.js IndexedDB Database Layer
 * 
 * Primary local persistence for the BME application.
 * Replaces localStorage for business data while keeping
 * localStorage for UI preferences (fast synchronous reads).
 * 
 * Handles:
 *  - Schema definition with versioning
 *  - One-time migration from legacy localStorage
 *  - CRUD operations for all synchronized tables
 *  - Soft-delete support via deleted_at
 */

import Dexie from 'https://esm.sh/dexie@4';

// ============================================================
// DATABASE SCHEMA
// ============================================================

const DB_NAME = 'bme_local_db';
const DB_VERSION = 1;

class BMEDatabase extends Dexie {
    constructor() {
        super(DB_NAME);

        this.version(DB_VERSION).stores({
            // History — saved invoices/transactions
            // Indexed: id (primary), user_id, updated_at compound, deleted_at
            history: 'id, user_id, updated_at, deleted_at, [user_id+updated_at]',

            // Templates — reusable invoice templates
            templates: 'id, user_id, updated_at, deleted_at, [user_id+updated_at]',

            // Tabs — workspace tab state
            tabs: 'id, user_id, updated_at, [user_id+updated_at]',

            // Sync Queue — pending operations for cloud sync
            sync_queue: '++id, table_name, operation, record_id, status, created_at',

            // Sync Metadata — key-value pairs for sync state
            sync_meta: 'key'
        });

        // Type hints for IDE
        this.history = this.table('history');
        this.templates = this.table('templates');
        this.tabs = this.table('tabs');
        this.sync_queue = this.table('sync_queue');
        this.sync_meta = this.table('sync_meta');
    }
}

// Singleton instance
const db = new BMEDatabase();

// ============================================================
// MIGRATION: localStorage → IndexedDB (one-time)
// ============================================================

const MIGRATION_FLAG = 'bme_idb_migrated';

/**
 * Migrates legacy localStorage data into IndexedDB.
 * Only runs once. Preserves localStorage copies as fallback.
 */
export async function migrateFromLocalStorage() {
    // Check if migration already done
    if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
        return { migrated: false, reason: 'already_done' };
    }

    const existingMeta = await db.sync_meta.get('migration_complete');
    if (existingMeta?.value === true) {
        localStorage.setItem(MIGRATION_FLAG, 'true');
        return { migrated: false, reason: 'already_done' };
    }

    console.log('[BME DB] Starting localStorage → IndexedDB migration...');

    const stats = { history: 0, templates: 0, tabs: 0 };

    try {
        await db.transaction('rw', [db.history, db.templates, db.tabs, db.sync_meta], async () => {
            // Migrate history
            const historyRaw = localStorage.getItem('bme_history');
            if (historyRaw) {
                try {
                    const historyItems = JSON.parse(historyRaw);
                    if (Array.isArray(historyItems) && historyItems.length > 0) {
                        const now = new Date().toISOString();
                        const records = historyItems.map((item, index) => ({
                            id: item.id || `legacy_${Date.now()}_${index}`,
                            user_id: 'guest',
                            title: item.title || '',
                            date: item.date || now,
                            items: item.items || [],
                            cardMode: item.cardMode || 'simple',
                            timestamp: item.timestamp || now,
                            created_at: item.timestamp || item.date || now,
                            updated_at: item.timestamp || item.date || now,
                            version: 1,
                            device_id: null, // Will be set when device module initializes
                            deleted_at: null
                        }));
                        await db.history.bulkPut(records);
                        stats.history = records.length;
                    }
                } catch (e) {
                    console.warn('[BME DB] History migration parse error:', e);
                }
            }

            // Migrate templates
            const templatesRaw = localStorage.getItem('bme_templates');
            if (templatesRaw) {
                try {
                    const templateItems = JSON.parse(templatesRaw);
                    if (Array.isArray(templateItems) && templateItems.length > 0) {
                        const now = new Date().toISOString();
                        const records = templateItems.map((item, index) => ({
                            id: item.id || `tmpl_${Date.now()}_${index}`,
                            user_id: 'guest',
                            name: item.name || '',
                            items: item.items || [],
                            created_at: now,
                            updated_at: now,
                            version: 1,
                            device_id: null,
                            deleted_at: null
                        }));
                        await db.templates.bulkPut(records);
                        stats.templates = records.length;
                    }
                } catch (e) {
                    console.warn('[BME DB] Templates migration parse error:', e);
                }
            }

            // Migrate tabs
            const tabsRaw = localStorage.getItem('bme_tabs');
            if (tabsRaw) {
                try {
                    const tabItems = JSON.parse(tabsRaw);
                    if (Array.isArray(tabItems) && tabItems.length > 0) {
                        const now = new Date().toISOString();
                        const records = tabItems.map(item => ({
                            id: item.id,
                            user_id: 'guest',
                            mode: item.mode,
                            title: item.title || '',
                            data: item.data || {},
                            created_at: now,
                            updated_at: now,
                            version: 1,
                            device_id: null
                        }));
                        await db.tabs.bulkPut(records);
                        stats.tabs = records.length;
                    }
                } catch (e) {
                    console.warn('[BME DB] Tabs migration parse error:', e);
                }
            }

            // Mark migration complete
            await db.sync_meta.put({ key: 'migration_complete', value: true });
        });

        localStorage.setItem(MIGRATION_FLAG, 'true');
        console.log('[BME DB] Migration complete:', stats);
        return { migrated: true, stats };

    } catch (e) {
        console.error('[BME DB] Migration failed:', e);
        return { migrated: false, reason: 'error', error: e.message };
    }
}

// ============================================================
// CRUD HELPERS
// ============================================================

/**
 * Get all non-deleted records for a user from a table.
 * @param {string} tableName - 'history', 'templates', or 'tabs'
 * @param {string} userId - User ID or 'guest'
 * @returns {Promise<Array>}
 */
export async function getAll(tableName, userId = 'guest') {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);

    if (tableName === 'tabs') {
        // Tabs don't have soft delete
        return table.where('user_id').equals(userId).toArray();
    }

    return table
        .where('user_id').equals(userId)
        .filter(record => !record.deleted_at)
        .toArray();
}

/**
 * Get a single record by ID.
 * @param {string} tableName
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getById(tableName, id) {
    return db[tableName]?.get(id);
}

/**
 * Put (insert or update) a record.
 * Auto-updates `updated_at` and increments `version`.
 * @param {string} tableName
 * @param {Object} record
 * @returns {Promise<string>} The record ID
 */
export async function putRecord(tableName, record) {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);

    const now = new Date().toISOString();
    const existing = record.id ? await table.get(record.id) : null;

    const updatedRecord = {
        ...record,
        updated_at: now,
        version: existing ? (existing.version || 0) + 1 : 1,
        created_at: existing?.created_at || record.created_at || now
    };

    await table.put(updatedRecord);
    return updatedRecord.id;
}

/**
 * Bulk put records (insert or update).
 * @param {string} tableName
 * @param {Array} records
 * @returns {Promise<void>}
 */
export async function bulkPut(tableName, records) {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);

    const now = new Date().toISOString();
    const updatedRecords = records.map(record => ({
        ...record,
        updated_at: record.updated_at || now,
        version: record.version || 1,
        created_at: record.created_at || now
    }));

    await table.bulkPut(updatedRecords);
}

/**
 * Soft-delete a record (set deleted_at timestamp).
 * @param {string} tableName
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function softDelete(tableName, id) {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);

    const now = new Date().toISOString();
    await table.update(id, {
        deleted_at: now,
        updated_at: now
    });
}

/**
 * Hard-delete a record permanently.
 * @param {string} tableName
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function hardDelete(tableName, id) {
    await db[tableName]?.delete(id);
}

/**
 * Clear all records for a specific user from a table.
 * @param {string} tableName
 * @param {string} userId
 * @returns {Promise<number>} Count of deleted records
 */
export async function clearUserData(tableName, userId) {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);
    return table.where('user_id').equals(userId).delete();
}

/**
 * Get records changed since a timestamp (for incremental sync).
 * @param {string} tableName
 * @param {string} userId
 * @param {string} sinceTimestamp - ISO timestamp
 * @returns {Promise<Array>}
 */
export async function getChangedSince(tableName, userId, sinceTimestamp) {
    const table = db[tableName];
    if (!table) throw new Error(`Unknown table: ${tableName}`);

    return table
        .where('[user_id+updated_at]')
        .between(
            [userId, sinceTimestamp],
            [userId, '\uffff'],
            false, // excludeLower
            true   // includeUpper
        )
        .toArray();
}

/**
 * Replace all records for a user in a table (used during cloud pull).
 * @param {string} tableName
 * @param {string} userId
 * @param {Array} records
 * @returns {Promise<void>}
 */
export async function replaceAllForUser(tableName, userId, records) {
    await db.transaction('rw', db[tableName], async () => {
        // Clear existing
        await db[tableName].where('user_id').equals(userId).delete();
        // Insert new
        if (records && records.length > 0) {
            await db[tableName].bulkPut(records);
        }
    });
}

// ============================================================
// SYNC METADATA HELPERS
// ============================================================

/**
 * Get a sync metadata value.
 * @param {string} key
 * @returns {Promise<*>}
 */
export async function getSyncMeta(key) {
    const record = await db.sync_meta.get(key);
    return record?.value;
}

/**
 * Set a sync metadata value.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void>}
 */
export async function setSyncMeta(key, value) {
    await db.sync_meta.put({ key, value });
}

/**
 * Get the last sync timestamp.
 * @returns {Promise<string|null>}
 */
export async function getLastSyncTimestamp() {
    return getSyncMeta('last_sync_at');
}

/**
 * Update the last sync timestamp to now.
 * @returns {Promise<void>}
 */
export async function updateLastSyncTimestamp() {
    await setSyncMeta('last_sync_at', new Date().toISOString());
}

// ============================================================
// SYNC QUEUE HELPERS
// ============================================================

/**
 * Enqueue a sync operation.
 * @param {string} tableName - 'history', 'templates', 'tabs'
 * @param {string} operation - 'INSERT', 'UPDATE', 'DELETE'
 * @param {string} recordId - The record ID
 * @param {Object} payload - The data payload
 * @returns {Promise<number>} Queue entry ID
 */
export async function enqueueSyncOp(tableName, operation, recordId, payload = null) {
    // Deduplicate: if there's already a pending op for this record, replace it
    const existing = await db.sync_queue
        .where('record_id').equals(recordId)
        .and(item => item.table_name === tableName && item.status === 'pending')
        .first();

    if (existing) {
        // Update existing queue entry (latest write wins)
        await db.sync_queue.update(existing.id, {
            operation,
            payload,
            created_at: new Date().toISOString()
        });
        return existing.id;
    }

    return db.sync_queue.add({
        table_name: tableName,
        operation,
        record_id: recordId,
        payload,
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString()
    });
}

/**
 * Get all pending sync operations, ordered by creation time.
 * @returns {Promise<Array>}
 */
export async function getPendingSyncOps() {
    return db.sync_queue
        .where('status').equals('pending')
        .sortBy('created_at');
}

/**
 * Mark a sync operation as completed.
 * @param {number} queueId
 * @returns {Promise<void>}
 */
export async function markSyncComplete(queueId) {
    await db.sync_queue.delete(queueId);
}

/**
 * Mark a sync operation as failed and increment retry count.
 * @param {number} queueId
 * @returns {Promise<void>}
 */
export async function markSyncFailed(queueId) {
    const entry = await db.sync_queue.get(queueId);
    if (!entry) return;

    if (entry.retry_count >= 5) {
        // Max retries exceeded, mark as dead
        await db.sync_queue.update(queueId, { status: 'dead' });
    } else {
        await db.sync_queue.update(queueId, {
            status: 'pending',
            retry_count: entry.retry_count + 1
        });
    }
}

/**
 * Clear all sync queue entries.
 * @returns {Promise<void>}
 */
export async function clearSyncQueue() {
    await db.sync_queue.clear();
}

/**
 * Reset all dead sync queue operations back to pending status.
 * Used to recover from historical failures (e.g., old Edge Function errors).
 * @returns {Promise<number>} Count of recovered operations
 */
export async function resetDeadSyncOps() {
    return db.transaction('rw', db.sync_queue, async () => {
        const deadOps = await db.sync_queue.where('status').equals('dead').toArray();
        if (deadOps.length > 0) {
            console.log(`[BME DB] Resetting ${deadOps.length} dead sync operations to pending...`);
            for (const op of deadOps) {
                await db.sync_queue.update(op.id, { status: 'pending', retry_count: 0 });
            }
        }
        return deadOps.length;
    });
}

/**
 * Clear all sync metadata.
 * @returns {Promise<void>}
 */
export async function clearSyncMeta() {
    await db.sync_meta.clear();
}

/**
 * Get the count of pending sync operations.
 * @returns {Promise<number>}
 */
export async function getPendingSyncCount() {
    return db.sync_queue.where('status').equals('pending').count();
}

// ============================================================
// ACCOUNT ISOLATION
// ============================================================

/**
 * Clear ALL account-specific business data from IndexedDB.
 * Preserves sync_meta device_id entry.
 * Used during logout and account switch.
 * @param {string} userId - The user to clear, or null to clear all
 * @returns {Promise<void>}
 */
export async function clearAccountData(userId = null) {
    await db.transaction('rw', [db.history, db.templates, db.tabs, db.sync_queue, db.sync_meta], async () => {
        if (userId) {
            await db.history.where('user_id').equals(userId).delete();
            await db.templates.where('user_id').equals(userId).delete();
            await db.tabs.where('user_id').equals(userId).delete();
        } else {
            await db.history.clear();
            await db.templates.clear();
            await db.tabs.clear();
        }
        await db.sync_queue.clear();

        // Preserve device_id but clear other sync meta
        const deviceId = await getSyncMeta('device_id');
        await db.sync_meta.clear();
        if (deviceId) {
            await setSyncMeta('device_id', deviceId);
        }
    });
}

/**
 * Get record counts for a user (used in conflict dialog).
 * @param {string} userId
 * @returns {Promise<{history: number, templates: number, tabs: number}>}
 */
export async function getUserDataCounts(userId = 'guest') {
    const [historyCount, templatesCount, tabsCount] = await Promise.all([
        db.history.where('user_id').equals(userId).filter(r => !r.deleted_at).count(),
        db.templates.where('user_id').equals(userId).filter(r => !r.deleted_at).count(),
        db.tabs.where('user_id').equals(userId).count()
    ]);
    return { history: historyCount, templates: templatesCount, tabs: tabsCount };
}

// ============================================================
// EXPORT DATABASE INSTANCE
// ============================================================

export { db };
export default db;
