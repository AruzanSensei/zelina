/**
 * sync/device.js — Persistent Device Identification
 * 
 * Generates and persists a unique device ID per browser/device.
 * Used to:
 *  - Identify sync origin (avoid self-triggered realtime loops)
 *  - Track which device last modified a record
 *  - Improve conflict resolution accuracy
 * 
 * Storage priority: IndexedDB (sync_meta) → localStorage fallback
 */

import { getSyncMeta, setSyncMeta } from './db.js';

const DEVICE_ID_LS_KEY = 'bme_device_id';

let cachedDeviceId = null;

/**
 * Generate a new device ID using crypto.randomUUID() with fallback.
 * @returns {string}
 */
function generateDeviceId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 12);
}

/**
 * Get or create the persistent device ID.
 * Checks IndexedDB first, then localStorage, then generates new.
 * @returns {Promise<string>}
 */
export async function getDeviceId() {
    // Return cached if available
    if (cachedDeviceId) return cachedDeviceId;

    try {
        // Try IndexedDB first
        const idbDeviceId = await getSyncMeta('device_id');
        if (idbDeviceId) {
            cachedDeviceId = idbDeviceId;
            // Ensure localStorage is in sync
            localStorage.setItem(DEVICE_ID_LS_KEY, idbDeviceId);
            return idbDeviceId;
        }
    } catch (e) {
        console.warn('[Device] IndexedDB read failed, trying localStorage:', e);
    }

    // Try localStorage fallback
    const lsDeviceId = localStorage.getItem(DEVICE_ID_LS_KEY);
    if (lsDeviceId) {
        cachedDeviceId = lsDeviceId;
        // Persist to IndexedDB
        try {
            await setSyncMeta('device_id', lsDeviceId);
        } catch (e) {
            console.warn('[Device] Failed to persist device_id to IndexedDB:', e);
        }
        return lsDeviceId;
    }

    // Generate new device ID
    const newDeviceId = generateDeviceId();
    cachedDeviceId = newDeviceId;

    // Persist to both stores
    localStorage.setItem(DEVICE_ID_LS_KEY, newDeviceId);
    try {
        await setSyncMeta('device_id', newDeviceId);
    } catch (e) {
        console.warn('[Device] Failed to persist new device_id to IndexedDB:', e);
    }

    console.log('[Device] Generated new device ID:', newDeviceId);
    return newDeviceId;
}

/**
 * Check if a given device ID matches the current device.
 * Used to filter self-triggered Realtime events.
 * @param {string} deviceId
 * @returns {boolean}
 */
export function isCurrentDevice(deviceId) {
    return cachedDeviceId !== null && deviceId === cachedDeviceId;
}

/**
 * Get the cached device ID synchronously (may be null if not yet initialized).
 * @returns {string|null}
 */
export function getDeviceIdSync() {
    return cachedDeviceId || localStorage.getItem(DEVICE_ID_LS_KEY);
}
