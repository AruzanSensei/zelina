/**
 * sync/conflict-dialog.js — Data Conflict Resolution Dialog
 * 
 * Renders and manages the conflict resolution UI when
 * both local and cloud data exist during login (Case C).
 * 
 * Features:
 *  - Three resolution options: Merge, Sync From Cloud, Keep Local
 *  - Data count display (local vs cloud)
 *  - Destructive action warnings
 *  - 5-second countdown lock for cloud overwrite
 *  - Second confirmation dialog for destructive actions
 */

import { loginSync } from './login-sync.js';

// ============================================================
// CONFLICT DIALOG CONTROLLER
// ============================================================

class ConflictDialogController {
    constructor() {
        this._dialogEl = null;
        this._overlayEl = null;
        this._countdownTimer = null;
        this._cloudData = null;
        this._isOpen = false;
        this._onResolved = null;
    }

    /**
     * Show the conflict resolution dialog.
     * @param {Object} options
     * @param {Object} options.localCounts - { history, templates, tabs }
     * @param {Object} options.cloudCounts - { history, templates, tabs }
     * @param {Object} options.cloudData - The cached cloud data
     * @param {Function} options.onResolved - Callback after resolution
     */
    show(options) {
        const { localCounts, cloudCounts, cloudData, onResolved } = options;
        this._cloudData = cloudData;
        this._onResolved = onResolved;

        // Remove existing dialog if any
        this.close();

        // Create overlay
        this._overlayEl = document.createElement('div');
        this._overlayEl.className = 'sync-dialog-overlay';
        this._overlayEl.id = 'sync-conflict-overlay';

        // Create dialog
        this._dialogEl = document.createElement('div');
        this._dialogEl.className = 'sync-dialog';
        this._dialogEl.id = 'sync-conflict-dialog';

        const localTotal = (localCounts.history || 0) + (localCounts.templates || 0);
        const cloudTotal = (cloudCounts.history || 0) + (cloudCounts.templates || 0);

        this._dialogEl.innerHTML = `
            <div class="sync-dialog-header">
                <div class="sync-dialog-icon">
                    <i-ui name="refresh-ccw-02" size="24"></i-ui>
                </div>
                <h3 class="sync-dialog-title">Sinkronisasi Data</h3>
                <p class="sync-dialog-subtitle">
                    Data ditemukan di perangkat ini dan di cloud. Pilih cara menyelesaikan perbedaan data.
                </p>
            </div>

            <div class="sync-dialog-stats">
                <div class="sync-stat-card">
                    <div class="sync-stat-icon local">
                        <i-ui name="hard-drive" size="18"></i-ui>
                    </div>
                    <div class="sync-stat-info">
                        <span class="sync-stat-label">Data Lokal</span>
                        <span class="sync-stat-count">${localTotal} item</span>
                        <span class="sync-stat-detail">${localCounts.history || 0} riwayat · ${localCounts.templates || 0} template</span>
                    </div>
                </div>
                <div class="sync-stat-divider">
                    <i-ui name="arrow-right" size="16"></i-ui>
                </div>
                <div class="sync-stat-card">
                    <div class="sync-stat-icon cloud">
                        <i-ui name="cloud-01" size="18"></i-ui>
                    </div>
                    <div class="sync-stat-info">
                        <span class="sync-stat-label">Data Cloud</span>
                        <span class="sync-stat-count">${cloudTotal} item</span>
                        <span class="sync-stat-detail">${cloudCounts.history || 0} riwayat · ${cloudCounts.templates || 0} template</span>
                    </div>
                </div>
            </div>

            <div class="sync-dialog-options">
                <button class="sync-option-btn recommended" id="btn-sync-merge">
                    <div class="sync-option-header">
                        <i-ui name="git-merge" size="20"></i-ui>
                        <span class="sync-option-title">Gabungkan Data</span>
                        <span class="sync-option-badge">Disarankan</span>
                    </div>
                    <p class="sync-option-desc">
                        Menggabungkan data lokal dan cloud. Duplikat akan dihapus otomatis, versi terbaru dipertahankan.
                    </p>
                </button>

                <button class="sync-option-btn" id="btn-sync-pull">
                    <div class="sync-option-header">
                        <i-ui name="cloud-download" size="20"></i-ui>
                        <span class="sync-option-title">Ambil Dari Cloud</span>
                    </div>
                    <p class="sync-option-desc">
                        Mengganti data di perangkat ini dengan data cloud. Data lokal bisnis akan dihapus, pengaturan tampilan tetap dipertahankan.
                    </p>
                </button>

                <button class="sync-option-btn destructive" id="btn-sync-keep">
                    <div class="sync-option-header">
                        <i-ui name="upload-cloud-01" size="20"></i-ui>
                        <span class="sync-option-title">Gunakan Data Lokal</span>
                    </div>
                    <p class="sync-option-desc">
                        Mengunggah data lokal ke cloud dan menimpa data cloud yang ada. Data cloud sebelumnya mungkin tidak dapat dipulihkan.
                    </p>
                    <span class="sync-option-warning">
                        <i-ui name="alert-triangle" size="14"></i-ui>
                        Tindakan ini bersifat merusak
                    </span>
                </button>
            </div>
        `;

        // Append to DOM
        document.body.appendChild(this._overlayEl);
        document.body.appendChild(this._dialogEl);

        // Animate in
        requestAnimationFrame(() => {
            this._overlayEl.classList.add('active');
            this._dialogEl.classList.add('active');
        });

        this._isOpen = true;

        // Bind events
        this._bindEvents();
    }

    /**
     * Bind click events to dialog buttons.
     */
    _bindEvents() {
        const btnMerge = this._dialogEl.querySelector('#btn-sync-merge');
        const btnPull = this._dialogEl.querySelector('#btn-sync-pull');
        const btnKeep = this._dialogEl.querySelector('#btn-sync-keep');

        btnMerge?.addEventListener('click', async () => {
            this._setLoading(btnMerge, 'Menggabungkan...');
            const success = await loginSync.resolveConflict('merge', this._cloudData);
            this.close();
            if (this._onResolved) this._onResolved('merge', success);
        });

        btnPull?.addEventListener('click', async () => {
            this._setLoading(btnPull, 'Mengunduh...');
            const success = await loginSync.resolveConflict('pull', this._cloudData);
            this.close();
            if (this._onResolved) this._onResolved('pull', success);
        });

        btnKeep?.addEventListener('click', () => {
            this._showDestructiveConfirmation();
        });
    }

    /**
     * Show the secondary confirmation dialog with 5-second countdown
     * for the destructive "Keep Local Data" option.
     */
    _showDestructiveConfirmation() {
        // Replace dialog content with confirmation
        this._dialogEl.innerHTML = `
            <div class="sync-dialog-header destructive">
                <div class="sync-dialog-icon warning">
                    <i-ui name="alert-triangle" size="28"></i-ui>
                </div>
                <h3 class="sync-dialog-title">Konfirmasi Penimpaan Cloud</h3>
                <p class="sync-dialog-subtitle warning-text">
                    Semua data cloud yang terkait akun ini akan diganti menggunakan data dari browser ini. 
                    Data cloud sebelumnya mungkin tidak dapat dipulihkan.
                </p>
            </div>

            <div class="sync-confirm-countdown" id="sync-countdown-area">
                <div class="countdown-circle" id="countdown-circle">
                    <span class="countdown-number" id="countdown-number">5</span>
                </div>
                <p class="countdown-label">Konfirmasi tersedia dalam <span id="countdown-text">5</span> detik...</p>
            </div>

            <div class="sync-confirm-actions">
                <button class="sync-confirm-btn cancel" id="btn-confirm-cancel">
                    <i-ui name="x" size="18"></i-ui>
                    Batalkan
                </button>
                <button class="sync-confirm-btn destructive" id="btn-confirm-overwrite" disabled>
                    <i-ui name="upload-cloud-01" size="18"></i-ui>
                    Timpa Data Cloud
                </button>
            </div>
        `;

        // Start countdown
        let seconds = 5;
        const numberEl = this._dialogEl.querySelector('#countdown-number');
        const textEl = this._dialogEl.querySelector('#countdown-text');
        const circleEl = this._dialogEl.querySelector('#countdown-circle');
        const btnOverwrite = this._dialogEl.querySelector('#btn-confirm-overwrite');
        const btnCancel = this._dialogEl.querySelector('#btn-confirm-cancel');

        this._countdownTimer = setInterval(() => {
            seconds--;
            if (numberEl) numberEl.textContent = seconds;
            if (textEl) textEl.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(this._countdownTimer);
                this._countdownTimer = null;

                // Enable the button
                if (btnOverwrite) {
                    btnOverwrite.disabled = false;
                    btnOverwrite.classList.add('enabled');
                }
                if (circleEl) circleEl.classList.add('complete');

                const countdownArea = this._dialogEl.querySelector('#sync-countdown-area');
                if (countdownArea) {
                    const label = countdownArea.querySelector('.countdown-label');
                    if (label) label.textContent = 'Konfirmasi tersedia. Lanjutkan dengan hati-hati.';
                }
            }
        }, 1000);

        // Bind events
        btnCancel?.addEventListener('click', () => {
            this.close();
        });

        btnOverwrite?.addEventListener('click', async () => {
            if (btnOverwrite.disabled) return;
            this._setLoading(btnOverwrite, 'Menimpa cloud...');
            const success = await loginSync.resolveConflict('keep', this._cloudData);
            this.close();
            if (this._onResolved) this._onResolved('keep', success);
        });
    }

    /**
     * Set a button to loading state.
     */
    _setLoading(btn, text) {
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = `
            <div class="sync-option-header">
                <span class="sync-loading-spinner"></span>
                <span class="sync-option-title">${text}</span>
            </div>
        `;
    }

    /**
     * Close and destroy the dialog.
     */
    close() {
        if (this._countdownTimer) {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }

        if (this._dialogEl) {
            this._dialogEl.classList.remove('active');
            setTimeout(() => {
                this._dialogEl?.remove();
                this._dialogEl = null;
            }, 300);
        }

        if (this._overlayEl) {
            this._overlayEl.classList.remove('active');
            setTimeout(() => {
                this._overlayEl?.remove();
                this._overlayEl = null;
            }, 300);
        }

        this._isOpen = false;
        this._cloudData = null;
    }

    get isOpen() { return this._isOpen; }
}

// Singleton
export const conflictDialog = new ConflictDialogController();
export default conflictDialog;
