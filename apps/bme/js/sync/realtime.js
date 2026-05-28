/**
 * sync/realtime.js — Supabase Realtime Websocket Manager
 * 
 * Manages websocket connections to Supabase Realtime
 * for cross-device synchronization using Broadcast channels.
 * 
 * Uses Broadcast (not postgres_changes) because the JSONB blob
 * design doesn't emit per-row events. Instead, devices notify
 * each other via lightweight broadcast messages.
 * 
 * Channels:
 *  - bme-sync-{userId} — data change notifications
 * 
 * Security:
 *  - Authenticated via user JWT
 *  - Events scoped to user's channel
 *  - Self-triggered events filtered by device_id
 */

import { getDeviceIdSync } from './device.js';

// ============================================================
// REALTIME MANAGER
// ============================================================

class RealtimeManager {
    constructor() {
        this._supabase = null;
        this._channel = null;
        this._userId = null;
        this._listeners = [];
        this._isSubscribed = false;
        this._reconnectTimer = null;
    }

    /**
     * Initialize and subscribe to the user's sync channel.
     * @param {Object} supabaseClient - The Supabase client instance
     * @param {string} userId
     */
    async subscribe(supabaseClient, userId) {
        if (this._isSubscribed && this._userId === userId) {
            console.log('[Realtime] Already subscribed for user:', userId);
            return;
        }

        // Unsubscribe from any existing channel
        await this.unsubscribe();

        this._supabase = supabaseClient;
        this._userId = userId;

        const channelName = `bme-sync-${userId}`;
        console.log('[Realtime] Subscribing to channel:', channelName);

        this._channel = supabaseClient.channel(channelName);

        // Listen for data change broadcasts
        this._channel.on('broadcast', { event: 'data-changed' }, (payload) => {
            this._handleBroadcast('data-changed', payload);
        });

        // Listen for sync status broadcasts
        this._channel.on('broadcast', { event: 'sync-complete' }, (payload) => {
            this._handleBroadcast('sync-complete', payload);
        });

        // Listen for logout broadcasts
        this._channel.on('broadcast', { event: 'logout' }, (payload) => {
            this._handleBroadcast('logout', payload);
        });

        // Subscribe to the channel
        this._channel.subscribe((status) => {
            console.log('[Realtime] Channel status:', status);
            if (status === 'SUBSCRIBED') {
                this._isSubscribed = true;
                this._notifyListeners('connected');
            } else if (status === 'CHANNEL_ERROR') {
                this._isSubscribed = false;
                this._notifyListeners('error');
                this._scheduleReconnect();
            } else if (status === 'TIMED_OUT') {
                this._isSubscribed = false;
                this._notifyListeners('timeout');
                this._scheduleReconnect();
            } else if (status === 'CLOSED') {
                this._isSubscribed = false;
                this._notifyListeners('disconnected');
            }
        });
    }

    /**
     * Unsubscribe from the current channel.
     */
    async unsubscribe() {
        this._cancelReconnect();

        if (this._channel && this._supabase) {
            try {
                await this._supabase.removeChannel(this._channel);
            } catch (e) {
                console.warn('[Realtime] Error removing channel:', e);
            }
        }

        this._channel = null;
        this._isSubscribed = false;
        this._userId = null;
        console.log('[Realtime] Unsubscribed');
    }

    /**
     * Broadcast a data change notification to other devices.
     * @param {string} table - 'history', 'templates', 'tabs'
     * @param {string} action - 'INSERT', 'UPDATE', 'DELETE', 'FULL_SYNC'
     * @param {string} recordId - The affected record ID (optional)
     */
    async broadcastChange(table, action, recordId = null) {
        if (!this._channel || !this._isSubscribed) return;

        const deviceId = getDeviceIdSync();
        try {
            await this._channel.send({
                type: 'broadcast',
                event: 'data-changed',
                payload: {
                    table,
                    action,
                    record_id: recordId,
                    device_id: deviceId,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (e) {
            console.warn('[Realtime] Broadcast send failed:', e);
        }
    }

    /**
     * Broadcast a sync-complete notification.
     */
    async broadcastSyncComplete() {
        if (!this._channel || !this._isSubscribed) return;

        const deviceId = getDeviceIdSync();
        try {
            await this._channel.send({
                type: 'broadcast',
                event: 'sync-complete',
                payload: {
                    device_id: deviceId,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (e) {
            console.warn('[Realtime] Sync-complete broadcast failed:', e);
        }
    }

    /**
     * Broadcast a logout notification to other devices.
     */
    async broadcastLogout() {
        if (!this._channel || !this._isSubscribed) return;

        const deviceId = getDeviceIdSync();
        try {
            await this._channel.send({
                type: 'broadcast',
                event: 'logout',
                payload: {
                    device_id: deviceId,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (e) {
            console.warn('[Realtime] Logout broadcast failed:', e);
        }
    }

    // ============================================================
    // INTERNAL
    // ============================================================

    /**
     * Handle incoming broadcast messages.
     */
    _handleBroadcast(event, payload) {
        const data = payload?.payload || payload;
        const deviceId = getDeviceIdSync();

        // Ignore messages from self
        if (data?.device_id === deviceId) {
            return;
        }

        console.log(`[Realtime] Received ${event}:`, data);
        this._notifyListeners(event, data);
    }

    /**
     * Schedule a reconnect attempt.
     */
    _scheduleReconnect() {
        this._cancelReconnect();
        this._reconnectTimer = setTimeout(() => {
            if (this._supabase && this._userId) {
                console.log('[Realtime] Attempting reconnect...');
                this.subscribe(this._supabase, this._userId);
            }
        }, 5000);
    }

    _cancelReconnect() {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    /**
     * Subscribe to realtime events.
     * @param {Function} callback - (event, data) => void
     *   event: 'connected' | 'disconnected' | 'error' | 'timeout' |
     *          'data-changed' | 'sync-complete' | 'logout'
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

    // ============================================================
    // PUBLIC GETTERS
    // ============================================================

    get isSubscribed() { return this._isSubscribed; }
}

// Singleton
export const realtimeManager = new RealtimeManager();
export default realtimeManager;
