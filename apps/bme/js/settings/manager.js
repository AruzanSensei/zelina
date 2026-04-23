/**
 * Settings & Template Logic
 */
import { appState } from '../state.js';
import { buildInvoiceHTML } from '../pdf/generator.js';

/**
 * Custom alert to replace native window.alert().
 * Shows a styled, auto-dismissing notification in the center of the screen.
 */
const showBMEAlert = (message, duration = 2500) => {
    const alertEl = document.getElementById('custom-alert');
    const msgEl = document.getElementById('alert-message');
    if (alertEl && msgEl) {
        msgEl.innerHTML = message;
        alertEl.classList.remove('hidden');
        alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
        clearTimeout(alertEl._hideTimer);
        alertEl._hideTimer = setTimeout(() => {
            alertEl.style.animation = 'alert-out 0.3s ease-in forwards';
            setTimeout(() => alertEl.classList.add('hidden'), 300);
        }, duration);
    }
};

export function initSettings() {
    // ===================================
    // DOM Elements
    // ===================================
    const modal = document.getElementById('settings-modal');
    const btnParams = document.getElementById('btn-settings');
    const btnClose = document.querySelector('.close-modal');

    // Tabs
    const tabGeneral = document.getElementById('tab-general');
    const tabTemplates = document.getElementById('tab-templates');
    const viewGeneral = document.getElementById('settings-general');
    const viewTemplates = document.getElementById('settings-templates');

    // Template UI
    const templateList = document.getElementById('template-list');
    const btnAddTemplate = document.getElementById('btn-add-template');

    // ===================================
    // HELPER: Modal Control
    // ===================================
    const toggleModal = (show) => {
        if (show) modal.classList.add('active');
        else modal.classList.remove('active');
    };

    btnParams.addEventListener('click', () => toggleModal(true));
    btnClose.addEventListener('click', () => toggleModal(false));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    // ===================================
    // TAB LOGIC
    // ===================================
    tabGeneral.addEventListener('click', () => {
        tabGeneral.classList.add('active');
        tabTemplates.classList.remove('active');
        viewGeneral.style.display = 'block';
        viewTemplates.style.display = 'none';
        viewTemplates.classList.add('hidden');
    });

    tabTemplates.addEventListener('click', () => {
        tabTemplates.classList.add('active');
        tabGeneral.classList.remove('active');
        viewGeneral.style.display = 'none';
        viewTemplates.style.display = 'block';
        viewTemplates.classList.remove('hidden');
        renderTemplates(); // Refresh list
    });

    // ===================================
    // THEME TOGGLE
    // ===================================
    const themeToggle = document.getElementById('setting-theme-toggle');
    const syncThemeUI = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.checked = (theme === 'dark');

        // Sync secondary toggles (if any)
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    };

    if (themeToggle) {
        themeToggle.checked = (appState.state.settings.theme === 'dark');
        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            appState.updateSettings({ theme });
        });
    }

    // Sync UI when settings change (e.g. from global theme toggle)
    appState.subscribe('settings', (settings) => {
        if (settings.theme) syncThemeUI(settings.theme);

        if (settings.defaultDownloadMethod) {
            document.querySelectorAll('#download-format-selector .segmented-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === settings.defaultDownloadMethod);
            });
        }
    });

    // Init Theme on load
    syncThemeUI(appState.state.settings.theme);

    // ===================================
    // DOWNLOAD FORMAT SETTINGS (Segmented)
    // ===================================
    const formatSelector = document.getElementById('download-format-selector');
    const currentMethod = appState.state.settings.defaultDownloadMethod || 'pdf';

    if (formatSelector) {
        // Init active state from appState
        formatSelector.querySelectorAll('.segmented-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === currentMethod);

            btn.addEventListener('click', () => {
                const value = btn.dataset.value;
                appState.updateSettings({ defaultDownloadMethod: value });

                // Update UI visually
                formatSelector.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // ===================================
    // TITLE REQUIRED TOGGLE
    // ===================================
    const titleRequiredToggle = document.getElementById('setting-title-required');
    if (titleRequiredToggle) {
        titleRequiredToggle.checked = appState.state.settings.titleRequired !== false;
        titleRequiredToggle.addEventListener('change', (e) => {
            appState.updateSettings({ titleRequired: e.target.checked });
        });
    }

    // ===================================
    // DOWNLOAD & SAVE TOGGLE
    // ===================================
    const downloadSaveToggle = document.getElementById('setting-download-save');
    if (downloadSaveToggle) {
        downloadSaveToggle.checked = appState.state.settings.downloadAndSave === true;
        downloadSaveToggle.addEventListener('change', (e) => {
            appState.updateSettings({ downloadAndSave: e.target.checked });
        });
    }

    // ===================================
    // FILE NAMING FORMAT
    // ===================================
    const formatInvoice = document.getElementById('format-invoice');
    const formatSuratJalan = document.getElementById('format-surat-jalan');
    const fileNameFormat = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };

    if (formatInvoice) {
        formatInvoice.value = fileNameFormat.invoice;
        formatInvoice.addEventListener('input', (e) => {
            const current = appState.state.settings.fileNameFormat || { invoice: '', suratJalan: '' };
            appState.updateSettings({ fileNameFormat: { ...current, invoice: e.target.value } });
        });
    }

    if (formatSuratJalan) {
        formatSuratJalan.value = fileNameFormat.suratJalan;
        formatSuratJalan.addEventListener('input', (e) => {
            const current = appState.state.settings.fileNameFormat || { invoice: '', suratJalan: '' };
            appState.updateSettings({ fileNameFormat: { ...current, suratJalan: e.target.value } });
        });
    }

    // Format Help Button
    const btnFormatHelp = document.getElementById('btn-format-help');
    if (btnFormatHelp) {
        btnFormatHelp.addEventListener('click', (e) => {
            e.stopPropagation();
            const existing = document.getElementById('format-help-tooltip');
            if (existing) { existing.remove(); document.getElementById('format-help-backdrop')?.remove(); return; }

            const tooltip = document.createElement('div');
            tooltip.id = 'format-help-tooltip';
            tooltip.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: var(--bg-card); border: 1px solid var(--border-color);
                border-radius: 12px; padding: 20px; z-index: 3000;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 340px; width: 90%;
                font-size: 0.9rem; line-height: 1.6;
            `;
            tooltip.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <strong>Format Token</strong>
                    <button id="close-format-help" style="background:none; border:none; cursor:pointer; color:var(--text-muted);"><i data-lucide="x" style="width:18px;height:18px;stroke-width:2.5"></i></button>
                </div>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>{judul}</code></td><td>Judul invoice</td></tr>
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>%YYYY</code></td><td>Tahun (2026)</td></tr>
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>%MM</code></td><td>Bulan (01-12)</td></tr>
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>%DD</code></td><td>Tanggal (01-31)</td></tr>
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>%HH</code></td><td>Jam (00-23)</td></tr>
                    <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:6px 4px;"><code>%mm</code></td><td>Menit (00-59)</td></tr>
                    <tr><td style="padding:6px 4px;"><code>%ss</code></td><td>Detik (00-59)</td></tr>
                </table>
                <div style="margin-top:10px; font-size:0.8rem; color:var(--text-muted);">
                    <strong>Contoh:</strong> Invoice-{judul} %YYYY-%MM-%DD
                </div>
            `;
            document.body.appendChild(tooltip);
            if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...tooltip.querySelectorAll('[data-lucide]')] });

            const backdrop = document.createElement('div');
            backdrop.id = 'format-help-backdrop';
            backdrop.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:2999;';
            document.body.appendChild(backdrop);

            const closeHelp = () => { tooltip.remove(); backdrop.remove(); };
            backdrop.addEventListener('click', closeHelp);
            tooltip.querySelector('#close-format-help').addEventListener('click', closeHelp);
        });
    }

    // ===================================
    // RESET SETTINGS
    // ===================================
    const btnResetSettings = document.getElementById('btn-reset-settings');
    if (btnResetSettings) {
        btnResetSettings.addEventListener('click', () => {
            if (!confirm('Reset semua pengaturan ke default?')) return;
            appState.resetSettings();

            // Re-render UI from the new reset state
            const s = appState.state.settings;

            // Sync Theme
            if (themeToggle) themeToggle.checked = (s.theme === 'dark');
            syncThemeUI(s.theme);

            // Sync Download Format
            if (formatSelector) {
                formatSelector.querySelectorAll('.segmented-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.value === s.defaultDownloadMethod);
                });
            }

            // Sync Validation & File Naming
            if (titleRequiredToggle) titleRequiredToggle.checked = s.titleRequired !== false;
            if (downloadSaveToggle) downloadSaveToggle.checked = s.downloadAndSave === true;
            if (formatInvoice) formatInvoice.value = (s.fileNameFormat || {}).invoice || 'Invoice-{judul}';
            if (formatSuratJalan) formatSuratJalan.value = (s.fileNameFormat || {}).suratJalan || 'Surat Jalan-{judul}';

            showBMEAlert('Pengaturan telah direset!');
        });
    }

    const btnDeleteAll = document.getElementById('btn-delete-all-data');
    if (btnDeleteAll) {
        btnDeleteAll.addEventListener('click', () => {
            if (confirm('PERINGATAN! Semua riwayat dan pengaturan akan dihapus permanen. Lanjutkan?')) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    // ===================================
    // SYNC DATA (IMPORT / EXPORT)
    // ===================================
    const btnImport = document.getElementById('btn-import-data');
    const btnExport = document.getElementById('btn-export-data');

    // Context menu untuk Import/Export
    let syncContextMenu = document.getElementById('bme-sync-context-menu');
    if (!syncContextMenu) {
        syncContextMenu = document.createElement('div');
        syncContextMenu.id = 'bme-sync-context-menu';
        syncContextMenu.className = 'visible'; // To hide initially
        syncContextMenu.classList.remove('visible');
        document.body.appendChild(syncContextMenu);

        // Styling is reused from #bme-context-menu via ID or similar. 
        // We will just copy the CSS classes used by #bme-context-menu
    }

    const showSyncMenu = (x, y, isImport) => {
        syncContextMenu.innerHTML = isImport ? `
            <button class="ctx-item" data-action="import-json">
                <i data-lucide="file-code" style="width:14px;height:14px;stroke-width:1.5"></i> Data JSON
            </button>
        ` : `
            <button class="ctx-item" data-action="export-json">
                <i data-lucide="file-code" style="width:14px;height:14px;stroke-width:1.5"></i> Data JSON
            </button>
            <button class="ctx-item" data-action="export-csv">
                <i data-lucide="table" style="width:14px;height:14px;stroke-width:2"></i> Tabel CSV
            </button>
            <button class="ctx-item" data-action="export-pdf">
                <i data-lucide="file-type-2" style="width:14px;height:14px;stroke-width:1.5"></i> Dokumen PDF
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item orange" data-action="export-zip">
                <i data-lucide="archive" style="width:14px;height:14px;stroke-width:2"></i> Semua (ZIP)
            </button>
        `;

        syncContextMenu.id = 'bme-context-menu';
        if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...syncContextMenu.querySelectorAll('[data-lucide]')] });

        syncContextMenu.querySelectorAll('.ctx-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleSyncAction(btn.dataset.action);
                syncContextMenu.classList.remove('visible');
            });
        });

        syncContextMenu.style.left = '-9999px';
        syncContextMenu.style.top = '-9999px';
        syncContextMenu.classList.add('visible');

        const mw = syncContextMenu.offsetWidth || 180;
        const mh = syncContextMenu.offsetHeight || 150;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = x - mw / 2;
        let top = y + 10;
        if (left + mw > vw) left = vw - mw - 10;
        if (top + mh > vh) top = y - mh - 10;
        if (left < 10) left = 10;
        if (top < 10) top = 10;

        syncContextMenu.style.left = `${left}px`;
        syncContextMenu.style.top = `${top}px`;
    };

    if (btnImport) {
        btnImport.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btnImport.getBoundingClientRect();
            showSyncMenu(rect.left + rect.width / 2, rect.bottom, true);
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btnExport.getBoundingClientRect();
            showSyncMenu(rect.left + rect.width / 2, rect.bottom, false);
        });
    }

    document.addEventListener('click', (e) => {
        if (syncContextMenu && syncContextMenu.classList.contains('visible') && !syncContextMenu.contains(e.target)) {
            syncContextMenu.classList.remove('visible');
        }
    }, true);
    document.addEventListener('scroll', () => {
        if (syncContextMenu && syncContextMenu.classList.contains('visible')) syncContextMenu.classList.remove('visible');
    }, true);

    const handleSyncAction = async (action) => {
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (action === 'import-json') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (Array.isArray(data)) {
                            // Merge history: deduplicate by id OR timestamp
                            const existing = appState.state.history;
                            const existingMap = new Map();
                            existing.forEach(h => {
                                existingMap.set(h.id, h);
                                existingMap.set(h.timestamp, h); // Also map by timestamp just to be safe
                            });

                            data.forEach(item => {
                                if (!existingMap.has(item.id) && !existingMap.has(item.timestamp)) {
                                    existing.unshift(item); // Add new ones
                                    existingMap.set(item.id, item);
                                }
                            });
                            appState.save('bme_history', existing);
                            appState.notify('history', existing);
                            showBMEAlert(`Import berhasil: ${data.length} item diproses.`);
                        } else {
                            showBMEAlert('Format JSON tidak valid!');
                        }
                    } catch (err) {
                        showBMEAlert('Gagal membaca file JSON.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }
        else if (action === 'export-json') {
            const hist = appState.state.history || [];
            if (hist.length === 0) return showBMEAlert('History kosong!');
            const jsonStr = JSON.stringify(hist, null, 2);
            downloadBlob(new Blob([jsonStr], { type: 'application/json' }), `BME-Backup-${dateStr}.json`);
        }
        else if (action === 'export-csv') {
            const hist = appState.state.history || [];
            if (hist.length === 0) return showBMEAlert('History kosong!');

            let csvContent = "Judul,Tanggal,Barang,Harga,Qty,Total\n";
            hist.forEach(h => {
                const title = `"${(h.title || 'Untitled').replace(/"/g, '""')}"`;
                h.items.forEach(item => {
                    const name = `"${(item.name || '').replace(/"/g, '""')}"`;
                    csvContent += `${title},${h.date},${name},${item.price},${item.qty},${item.price * item.qty}\n`;
                });
            });
            downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `BME-Data-${dateStr}.csv`);
        }
        else if (action === 'export-pdf') {
            const hist = appState.state.history || [];
            if (hist.length === 0) return showBMEAlert('History kosong!');

            let combinedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>BME Backup Invoices - ${dateStr}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #fff; margin:0; padding:0; }
                    .invoice-chunk { page-break-after: always; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .invoice-chunk:last-child { page-break-after: auto; }
                    @media print {
                        body { background: white; }
                        .invoice-chunk { box-shadow: none; max-width: none; }
                    }
                </style>
            </head>
            <body>`;

            hist.forEach(h => {
                combinedHtml += `<div class="invoice-chunk">${buildInvoiceHTML(h.items, h.title)}</div>`;
            });

            combinedHtml += `</body></html>`;

            const blob = new Blob([combinedHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const w = window.open(url, '_blank');
            if (w) {
                w.onload = () => { w.focus(); w.print(); };
            } else {
                downloadBlob(blob, `BME-Printable-Backup-${dateStr}.html`);
            }
        }
        else if (action === 'export-zip') {
            if (typeof JSZip === 'undefined') return showBMEAlert('Library JSZip belum dimuat. Mohon cek koneksi internet!');
            const hist = appState.state.history || [];
            if (hist.length === 0) return showBMEAlert('History kosong!');

            const zip = new JSZip();

            // Backup JSON
            zip.file("backup.json", JSON.stringify(hist, null, 2));

            // Backup CSV
            let csvContent = "Judul,Tanggal,Barang,Harga,Qty,Total\n";
            hist.forEach(h => {
                const title = `"${(h.title || 'Untitled').replace(/"/g, '""')}"`;
                h.items.forEach(item => {
                    const name = `"${(item.name || '').replace(/"/g, '""')}"`;
                    csvContent += `${title},${h.date},${name},${item.price},${item.qty},${item.price * item.qty}\n`;
                });
            });
            zip.file("data.csv", csvContent);

            // Backup PDF (HTML Printable)
            let combinedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.chunk { page-break-after: always; padding: 20px; }</style></head><body>`;
            hist.forEach(h => combinedHtml += `<div class="chunk">${buildInvoiceHTML(h.items, h.title)}</div>`);
            combinedHtml += `</body></html>`;
            zip.file("print_backup.html", combinedHtml);

            // Notify user
            const btnAlert = document.getElementById('custom-alert');
            const msgAlert = document.getElementById('alert-message');
            if (btnAlert && msgAlert) {
                msgAlert.innerHTML = 'Memproses ZIP... <i data-lucide="loader-2" class="spin-icon" style="width:14px;height:14px;stroke-width:1.5"></i>';
                btnAlert.classList.remove('hidden');
                btnAlert.style.animation = 'alert-in 0.3s ease-out forwards';
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...msgAlert.querySelectorAll('[data-lucide]')] });
            }

            zip.generateAsync({ type: "blob" }).then(function (content) {
                downloadBlob(content, `BME-Archive-${dateStr}.zip`);
                if (btnAlert) btnAlert.classList.add('hidden');
            });
        }
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    // ===================================
    // TEMPLATE MANAGEMENT (FULL INVOICE)
    // ===================================

    // Helper to format currency
    const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    function renderTemplates() {
        templateList.innerHTML = '';
        const templates = appState.state.templates;

        if (templates.length === 0) {
            templateList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">Belum ada template.</p>';
            return;
        }

        templates.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'item-card template-card'; // Added class for drag logic
            div.dataset.index = i;
            div.style.padding = '12px';
            div.style.marginBottom = '8px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.transition = 'transform 0.2s, box-shadow 0.2s';
            // User-select none for touch logic
            div.style.userSelect = 'none';

            div.innerHTML = `
            <div style="pointer-events:none;">
                    <div style="font-weight:600; font-size:0.95rem;">${t.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        ${t.items.length} Barang &bull; ${formatCurrency(t.items.reduce((s, x) => s + (x.price * x.qty), 0))}
                    </div>
                </div>
                	<div class="template-actions">
            <button class="btn btn-sm btn-outline use-template" data-index="${i}" title="Pakai">
                <i data-lucide="check" style="width:14px;height:14px;stroke-width:2.5"></i>
            </button>
            <button class="btn btn-sm btn-outline delete-template" data-index="${i}" style="color:#ff4d4f; border-color:#ff4d4f; margin-left:4px;">
                <i data-lucide="trash-2" style="width:14px;height:14px;stroke-width:2.5"></i>
            </button>
        </div>
    `;
            templateList.appendChild(div);
            if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...div.querySelectorAll('[data-lucide]')] });
        });

        // Init Drag Logic after render
        initDragAndDrop();
    }

    // Actions in List
    templateList.addEventListener('click', (e) => {
        const btnUse = e.target.closest('.use-template');
        const btnDel = e.target.closest('.delete-template');

        if (btnUse) {
            const idx = btnUse.dataset.index;
            const template = appState.state.templates[idx];

            if (appState.state.invoiceItems.length > 0 && appState.state.invoiceItems[0].name) {
                if (!confirm("Ganti data saat ini dengan template?")) return;
            }

            document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: template.items } }));
            toggleModal(false);
        }

        if (btnDel) {
            if (confirm("Hapus template ini?")) {
                appState.state.templates.splice(btnDel.dataset.index, 1);
                appState.save('bme_templates', appState.state.templates);
                renderTemplates();
            }
        }
    });

    // Add Template (Custom Modal)
    btnAddTemplate.addEventListener('click', () => {
        // Show overlay input
        const overlay = document.createElement('div');
        overlay.className = 'modal active';
        overlay.style.zIndex = '300';
        overlay.innerHTML = `
        <div class="modal-content">
                <h3>Nama Template</h3>
                <input type="text" id="new-template-name" class="form-input" placeholder="Misal: Paket Rumah Tipe 36" style="margin:15px 0;" autofocus>
                <div style="display:flex; gap:10px;">
                    <button id="btn-cancel-tpl" class="btn btn-outline" style="flex:1;">Batal</button>
                    <button id="btn-save-tpl" class="btn btn-primary" style="flex:1;">Simpan</button>
                </div>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:10px; text-align:center;">
                    Menyimpan ${appState.state.invoiceItems.length} item dari Manual Mode.
                </p>
            </div>
    `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('input');
        input.focus();

        const close = () => overlay.remove();

        overlay.querySelector('#btn-cancel-tpl').addEventListener('click', close);
        overlay.querySelector('#btn-save-tpl').addEventListener('click', () => {
            const name = input.value.trim();
            if (!name) return showBMEAlert('Nama wajib diisi!');

            const newTemplate = {
                id: Date.now(),
                name: name,
                items: JSON.parse(JSON.stringify(appState.state.invoiceItems))
            };
            appState.addTemplate(newTemplate);
            renderTemplates();
            close();
        });
    });


    // ===================================
    // DRAG & DROP LOGIC (Long Press)
    // ===================================
    function initDragAndDrop() {
        let dragSrcEl = null;
        let pressTimer = null;
        let isDragging = false;
        let startY = 0;
        let clone = null;
        let finalIndex = -1;

        const cards = templateList.querySelectorAll('.template-card');

        cards.forEach(card => {

            // Touch Start -> Wait 500ms -> Start Drag
            card.addEventListener('touchstart', (e) => {
                if (e.target.closest('button')) return; // Ignore buttons

                startY = e.touches[0].clientY;
                pressTimer = setTimeout(() => {
                    isDragging = true;
                    dragSrcEl = card;
                    finalIndex = parseInt(card.dataset.index);

                    // Visual Feedback
                    // card.style.opacity = '0.5';
                    navigator.vibrate?.(50); // Haptic

                    // Create Floating Clone
                    clone = card.cloneNode(true);
                    clone.style.position = 'fixed';
                    clone.style.zIndex = '999';
                    clone.style.width = card.offsetWidth + 'px';
                    clone.style.opacity = '0.9';
                    clone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                    clone.style.background = 'var(--bg-card)';
                    clone.style.transform = `translateY(${e.touches[0].clientY - 30}px)`; // Offset slightly
                    clone.style.left = card.getBoundingClientRect().left + 'px';
                    clone.style.pointerEvents = 'none'; // Pass through to underlying elements
                    document.body.appendChild(clone);

                    card.style.opacity = '0'; // Hide original placeholder

                }, 500); // 0.5s hold
            }, { passive: false });

            // Touch Move (Prevent scroll if dragging)
            card.addEventListener('touchmove', (e) => {
                if (isDragging && clone) {
                    e.preventDefault(); // Stop scrolling
                    const touchY = e.touches[0].clientY;
                    clone.style.top = (touchY - 20) + 'px'; // Move clone

                    // Detect underlying element to swap
                    const elBelow = document.elementFromPoint(e.touches[0].clientX, touchY);
                    const targetCard = elBelow?.closest('.template-card');

                    if (targetCard && targetCard !== dragSrcEl) {
                        // Swap logic in DOM
                        // Determining insert before or after is tricky, simple swap is easier
                        // Let's just swap the Placeholder (invisible original)
                        const items = Array.from(templateList.children);
                        const srcIdx = items.indexOf(dragSrcEl);
                        const tgtIdx = items.indexOf(targetCard);

                        if (srcIdx < tgtIdx) {
                            templateList.insertBefore(dragSrcEl, targetCard.nextSibling);
                        } else {
                            templateList.insertBefore(dragSrcEl, targetCard);
                        }

                        finalIndex = tgtIdx; // Updates roughly
                        // Note: Animation logic for others would be nice but complex for Vanilla.
                        // We rely on "Jump" swap which is functional.
                    }
                } else {
                    // Start Scroll detection - if moved too much, cancel timer
                    const moveY = e.touches[0].clientY;
                    if (Math.abs(moveY - startY) > 10) {
                        clearTimeout(pressTimer);
                    }
                }
            }, { passive: false });

            const endDrag = () => {
                clearTimeout(pressTimer);
                if (isDragging) {
                    isDragging = false;
                    if (clone) clone.remove();
                    if (dragSrcEl) dragSrcEl.style.opacity = '1';

                    // Reorder State
                    const newOrder = Array.from(templateList.querySelectorAll('.template-card')).map(c =>
                        appState.state.templates[parseInt(c.dataset.index)]
                    );

                    // Actually, dataset index is stale. We need to map by ID or content.
                    // But wait, the DOM has moved. The datasets are old.
                    // We must rebuild the array based on DOM order using unique properties? 
                    // Or... simple re-render.
                    // Let's map DOM elements back to state objects.
                    // Accessing state by OLD index is risky if we swapped DOMs.
                    // A better way: Store IDs in dataset?

                    // The 'templates' array in renders is the source of truth.
                    // We need to re-sort it based on the new DOM order.
                    // But we don't have IDs on DOM elements.
                    // Let's rely on the fact that we moved the DOM nodes.
                    // We can just iterate the DOM, grab the OLD index, and build a new array.

                    const reorderedTemplates = [];
                    templateList.querySelectorAll('.template-card').forEach(el => {
                        const originalIndex = parseInt(el.dataset.index);
                        reorderedTemplates.push(appState.state.templates[originalIndex]);
                    });

                    appState.state.templates = reorderedTemplates;
                    appState.save('bme_templates', reorderedTemplates);
                    renderTemplates(); // Re-render to fix indices
                }
                dragSrcEl = null;
                clone = null;
            };

            card.addEventListener('touchend', endDrag);
            card.addEventListener('touchcancel', endDrag);
        });
    }


    // ===================================
    // TEMPLATE PICKER UI (SINGLE ITEM)
    // ===================================

    // Load Item Templates
    let itemTemplates = localStorage.getItem('bme_item_templates');
    itemTemplates = itemTemplates ? JSON.parse(itemTemplates) : [
        { name: "Battery 12V9Ah", price: 295000 },
        { name: "Battery 12V7Ah", price: 250000 },
        { name: "Battery 12V5Ah", price: 220000 }
    ];

    const saveItemTemplates = () => {
        localStorage.setItem('bme_item_templates', JSON.stringify(itemTemplates));
    };

    // Handler for "request-item-picker"
    document.addEventListener('request-item-picker', (e) => {
        const callback = e.detail.callback;

        // Dynamic Modal Creation
        const pickerOverlay = document.createElement('div');
        pickerOverlay.className = 'modal picker-modal';
        pickerOverlay.style.zIndex = '300';
        // Delay adding 'active' so CSS transition plays
        requestAnimationFrame(() => requestAnimationFrame(() => pickerOverlay.classList.add('active')));

        // Initial HTML
        let searchQuery = '';

        const renderPickerContent = (isAdding = false, editItem = null) => {
            if (editItem !== null) {
                // Edit Mode
                const item = itemTemplates[editItem];
                return `
        <div class="modal-content">
                        <div class="modal-header">
                            <h2>Edit Item</h2>
                            <button class="close-picker"><i data-lucide="x" style="width:17px;height:17px;stroke-width:2.5"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label class="field-label">Nama Barang</label>
                                <input type="text" id="edit-item-name" class="form-input" value="${item.name || ''}">
                            </div>
                            <div class="item-row">
                                <div class="item-price-wrap" style="flex: 2.2; padding-top: 4px;">
                                    <label class="field-label">Harga</label>
                                    <input type="number" id="edit-item-price" class="form-input" value="${item.price || ''}" placeholder="0">
                                </div>
                                <div class="item-tipe-wrap" style="flex: 2; padding-top: 4px;">
                                    <label class="field-label">Tipe</label>
                                    <select id="edit-item-tipe" class="form-input">
                                        <option value="" ${!item.tipe ? 'selected' : ''}></option>
                                        <option value="ICA" ${item.tipe === 'ICA' ? 'selected' : ''}>ICA</option>
                                        <option value="Protecta" ${item.tipe === 'Protecta' ? 'selected' : ''}>Protecta</option>
                                        <option value="Prolink" ${item.tipe === 'Prolink' ? 'selected' : ''}>Prolink</option>
                                        <option value="APC" ${item.tipe === 'APC' ? 'selected' : ''}>APC</option>
                                    </select>
                                </div>
                                <div class="item-qty-wrap" style="min-width: 90px; margin-top:17px; display: flex; flex-direction: column;">
                                    <div class="unit-switch picker-unit-switch" data-target="edit" style="margin: 0 0 6px auto;">
                                        <span class="unit-opt ${item.qtyUnit !== 'lot' ? 'active' : ''}" data-unit="pcs">Pcs</span>
                                        <span class="unit-opt ${item.qtyUnit === 'lot' ? 'active' : ''}" data-unit="lot">Lot</span>
                                    </div>
                                    <div class="qty-control" style="margin-left: auto;">
                                        <button class="qty-btn picker-qty-btn minus" data-target="edit-item-qty">-</button>
                                        <input type="number" id="edit-item-qty" class="qty-input item-qty" value="${item.qty || 1}" min="1">
                                        <button class="qty-btn picker-qty-btn plus" data-target="edit-item-qty">+</button>
                                    </div>
                                </div>
                            </div>
                            <div class="input-group">
                                <label class="field-label">Note (Opsional)</label>
                                <input type="text" id="edit-item-note" class="form-input" value="${item.note || ''}" placeholder="Deskripsi item">
                            </div>
                            <button id="btn-save-edit-item" data-index="${editItem}" class="btn btn-primary btn-full" style="margin-top:10px;">Simpan Perubahan</button>
                            <button id="btn-back-picker" class="btn btn-outline btn-full" style="margin-top:8px;">Batal</button>
                        </div>
                    </div >
        `;
            } else if (isAdding) {
                return `
        <div class="modal-content">
                        <div class="modal-header">
                            <h2>Tambah Item Baru</h2>
                            <button class="close-picker"><i data-lucide="x" style="width:17px;height:17px;stroke-width:2.5"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label class="field-label">Nama Barang</label>
                                <input type="text" id="new-item-name" class="form-input" placeholder="Contoh: Kabel Audio">
                            </div>
                            <div class="item-row">
                                <div class="item-price-wrap" style="flex: 2.2; padding-top: 4px;">
                                    <label class="field-label">Harga</label>
                                    <input type="number" id="new-item-price" class="form-input" placeholder="0">
                                </div>
                                <div class="item-tipe-wrap" style="flex: 2; padding-top: 4px;">
                                    <label class="field-label">Tipe</label>
                                    <select id="new-item-tipe" class="form-input">
                                        <option value="" selected></option>
                                        <option value="ICA">ICA</option>
                                        <option value="Protecta">Protecta</option>
                                        <option value="Prolink">Prolink</option>
                                        <option value="APC">APC</option>
                                    </select>
                                </div>
                                <div class="item-qty-wrap" style="min-width: 90px; margin-top:17px; display: flex; flex-direction: column;">
                                    <div class="unit-switch picker-unit-switch" data-target="new" style="margin: 0 0 6px auto;">
                                        <span class="unit-opt active" data-unit="pcs">Pcs</span>
                                        <span class="unit-opt" data-unit="lot">Lot</span>
                                    </div>
                                    <div class="qty-control" style="margin-left: auto;">
                                        <button class="qty-btn picker-qty-btn minus" data-target="new-item-qty">-</button>
                                        <input type="number" id="new-item-qty" class="qty-input item-qty" value="1" min="1">
                                        <button class="qty-btn picker-qty-btn plus" data-target="new-item-qty">+</button>
                                    </div>
                                </div>
                            </div>
                            <div class="input-group">
                                <label class="field-label">Note (Opsional)</label>
                                <input type="text" id="new-item-note" class="form-input" placeholder="Deskripsi item">
                            </div>
                            <button id="btn-save-new-item" class="btn btn-primary btn-full" style="margin-top:10px;">Simpan & Pilih</button>
                            <button id="btn-back-picker" class="btn btn-outline btn-full" style="margin-top:8px;">Kembali</button>
                        </div>
                    </div >
        `;
            } else {
                const filteredItems = itemTemplates.map((t, idx) => ({ ...t, originalIndex: idx }))
                    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

                return `
        <div class="modal-content">
                        <div class="modal-header" style="align-items: center; gap: 10px;">
                            <h2 style="flex: 1; margin: 0; font-size: 1.1rem;">Pilih Barang</h2>
                            
                            <div class="picker-search-container" style="position: relative; display: flex; align-items: center;">
                                <input type="text" id="picker-search-input" class="form-input" placeholder="Cari barang..." 
                                    style="width: 32px; height: 32px; padding: 0; border-radius: 20px; transition: all 0.3s ease; border: 1px solid var(--border-color); background: rgba(0,0,0,0.05); cursor: pointer; padding-left: 32px; font-size: 0.85rem;"
                                    value="${searchQuery}">
                                <i data-lucide="search" class="search-icon" style="position: absolute; left: 8px; width: 14px; height: 14px; color: var(--text-muted); pointer-events: none;"></i>
                            </div>

                            <button class="close-picker" style="background: rgba(0, 0, 0, 0.05); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;">
                                <i data-lucide="x" style="width: 17px; height: 17px; stroke-width: 2.5;"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="picker-list" style="max-height: 50vh; overflow-y: auto; margin-top: 5px;">
                                ${filteredItems.length > 0 ? filteredItems.map((t) => `
                                    <div class="item-swipe-container" style="position:relative; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:8px;">
                                        <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                                            <button class="swipe-btn swipe-edit" data-index="${t.originalIndex}" style="background-color:#F5A623; border:none; color:white; padding:0 20px; cursor:pointer;"><i data-lucide="pencil" style="width:15px;height:15px;stroke-width:2"></i></button>
                                            <button class="swipe-btn swipe-delete" data-index="${t.originalIndex}" style="background-color:#ff4d4f; border:none; color:white; padding:0 20px; cursor:pointer; border-radius:0 var(--radius-sm) var(--radius-sm) 0;"><i data-lucide="trash-2" style="width:15px;height:15px;stroke-width:2.5"></i></button>
                                        </div>
                                        <div class="item-card picker-item" data-index="${t.originalIndex}" style="padding:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; border:1px solid var(--border-color); box-shadow: var(--app-shadow-sm) !important; background:var(--bg-card); z-index:2; position:relative; transition:transform 0.2s;">
                                            <div style="pointer-events:none; flex:1; min-width:0;">
                                                <div style="font-weight:600; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>
                                                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px; display:flex; gap:8px; flex-wrap:wrap;">
                                                    <span>Tipe: <strong>${t.tipe || '-'}</strong></span>
                                                    <span>Qty: <strong>${t.qty || '-'}</strong></span>
                                                    <span style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Note: <strong>${t.note || '-'}</strong></span>
                                                </div>
                                            </div>
                                            <div style="font-weight:700; color:var(--primary); pointer-events:none; flex-shrink:0; margin-left:12px; font-size:0.9rem;">${formatCurrency(t.price)}</div>
                                        </div>
                                    </div>
                                `).join('') : '<p style="text-align:center; padding: 20px; color: var(--text-muted);">Barang tidak ditemukan.</p>'}
                            </div>
                            <button id="btn-to-add-view" class="btn btn-outline btn-full" style="margin-top:10px;">
                                <i data-lucide="plus" style="width:14px;height:14px;stroke-width:2.5"></i> Tambah Item Baru
                            </button>
                        </div>
                    </div >
        `;
            }
        };

        pickerOverlay.innerHTML = renderPickerContent(false);
        document.body.appendChild(pickerOverlay);

        // Swipe Logic for Picker Items
        let touchStartX = 0;
        let activePickerCard = null;

        const initPickerSwipe = () => {
            const pickerList = document.getElementById('picker-list');
            if (!pickerList) return;

            pickerList.addEventListener('touchstart', (e) => {
                const card = e.target.closest('.picker-item');
                if (!card) return;
                touchStartX = e.touches[0].clientX;
                activePickerCard = card;
            }, { passive: true });

            pickerList.addEventListener('touchmove', (e) => {
                if (!activePickerCard) return;
                const touchCurrentX = e.touches[0].clientX;
                const diff = touchCurrentX - touchStartX;
                if (diff < 0 && diff > -150) {
                    activePickerCard.style.transform = `translateX(${diff}px)`;
                }
            }, { passive: true });

            pickerList.addEventListener('touchend', (e) => {
                if (!activePickerCard) return;
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchEndX - touchStartX;
                activePickerCard.style.transform = '';

                if (diff < -80) {
                    const openCards = pickerList.querySelectorAll('.picker-item.swiped-left');
                    openCards.forEach(c => {
                        if (c !== activePickerCard) c.classList.remove('swiped-left');
                    });
                    activePickerCard.classList.add('swiped-left');
                } else if (diff > 50) {
                    activePickerCard.classList.remove('swiped-left');
                }
                activePickerCard = null;
            });
        };

        initPickerSwipe();

        // Close with animation
        const closePicker = () => {
            pickerOverlay.classList.remove('active');
            setTimeout(() => pickerOverlay.remove(), 400);
        };

        // Interaction Logic
        pickerOverlay.addEventListener('click', (evt) => {
            const target = evt.target;

            // Close
            if (target === pickerOverlay || target.closest('.close-picker')) {
                closePicker();
            }

            // Unit Toggle in Picker
            const unitOpt = target.closest('.unit-opt');
            if (unitOpt && target.closest('.picker-unit-switch')) {
                const parent = unitOpt.closest('.picker-unit-switch');
                parent.querySelectorAll('.unit-opt').forEach(opt => opt.classList.remove('active'));
                unitOpt.classList.add('active');
            }

            // Qty +/- in Picker
            const qtyBtn = target.closest('.picker-qty-btn');
            if (qtyBtn) {
                const targetInputId = qtyBtn.dataset.target;
                const input = document.getElementById(targetInputId);
                if (input) {
                    let val = parseInt(input.value) || 1;
                    if (qtyBtn.classList.contains('plus')) {
                        val++;
                    } else if (qtyBtn.classList.contains('minus') && val > 1) {
                        val--;
                    }
                    input.value = val;
                }
            }

            // Expand search bar on click if it's collapsed
            if (target.id === 'picker-search-input') {
                target.style.width = '160px';
                target.style.cursor = 'text';
            }

            // Swipe Edit Button
            const editBtn = target.closest('.swipe-edit');
            if (editBtn) {
                const idx = parseInt(editBtn.dataset.index);
                pickerOverlay.innerHTML = renderPickerContent(false, idx);
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
                return;
            }

            // Swipe Delete Button
            const deleteBtn = target.closest('.swipe-delete');
            if (deleteBtn) {
                if (confirm('Hapus item ini dari template?')) {
                    const idx = parseInt(deleteBtn.dataset.index);
                    itemTemplates.splice(idx, 1);
                    saveItemTemplates();
                    pickerOverlay.innerHTML = renderPickerContent(false);
                    if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
                    initPickerSwipe();
                }
                return;
            }

            // Select Item
            const itemEl = target.closest('.picker-item');
            if (itemEl && !target.closest('.swipe-btn')) {
                const idx = itemEl.dataset.index;
                callback(itemTemplates[idx]);
                closePicker();
            }

            // Switch to Add View
            if (target.closest('#btn-to-add-view')) {
                pickerOverlay.innerHTML = renderPickerContent(true);
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
            }

            // Back to List
            if (target.id === 'btn-back-picker') {
                pickerOverlay.innerHTML = renderPickerContent(false);
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
                initPickerSwipe();
            }

            // Save New Item
            if (target.id === 'btn-save-new-item') {
                const name = document.getElementById('new-item-name').value;
                const price = document.getElementById('new-item-price').value;
                const tipe = document.getElementById('new-item-tipe').value;
                const qty = document.getElementById('new-item-qty').value;
                const unitOpt = pickerOverlay.querySelector('.picker-unit-switch[data-target="new"] .unit-opt.active');
                const qtyUnit = unitOpt ? unitOpt.dataset.unit : 'pcs';
                const note = document.getElementById('new-item-note').value;

                if (!name) return showBMEAlert('Nama harus diisi');

                const newItem = {
                    name,
                    price: parseInt(price) || 0,
                    tipe,
                    qty: parseInt(qty) || 1,
                    qtyUnit,
                    note
                };
                itemTemplates.push(newItem);
                saveItemTemplates();

                callback(newItem);
                closePicker();
            }

            // Save Edit Item
            if (target.id === 'btn-save-edit-item') {
                const idx = parseInt(target.dataset.index);
                const name = document.getElementById('edit-item-name').value;
                const price = document.getElementById('edit-item-price').value;
                const tipe = document.getElementById('edit-item-tipe').value;
                const qty = document.getElementById('edit-item-qty').value;
                const unitOpt = pickerOverlay.querySelector('.picker-unit-switch[data-target="edit"] .unit-opt.active');
                const qtyUnit = unitOpt ? unitOpt.dataset.unit : 'pcs';
                const note = document.getElementById('edit-item-note').value;

                if (!name) return showBMEAlert('Nama harus diisi');

                itemTemplates[idx] = {
                    name,
                    price: parseInt(price) || 0,
                    tipe,
                    qty: parseInt(qty) || 1,
                    qtyUnit,
                    note
                };
                saveItemTemplates();
                pickerOverlay.innerHTML = renderPickerContent(false);
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
                initPickerSwipe();
            }
        });

        // Search Input Handlers
        pickerOverlay.addEventListener('input', (e) => {
            if (e.target.id === 'picker-search-input') {
                searchQuery = e.target.value;
                const modalBody = pickerOverlay.querySelector('.modal-body');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderPickerContent(false);
                modalBody.innerHTML = tempDiv.querySelector('.modal-body').innerHTML;

                // Re-init icons and search bar state
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...modalBody.querySelectorAll('[data-lucide]')] });
                initPickerSwipe();

                // Keep focus and expanded state
                const newSearchInput = pickerOverlay.querySelector('#picker-search-input');
                newSearchInput.focus();
                newSearchInput.style.width = '160px';
                newSearchInput.setSelectionRange(searchQuery.length, searchQuery.length);
            }
        });

        pickerOverlay.addEventListener('focusout', (e) => {
            if (e.target.id === 'picker-search-input' && !e.target.value) {
                e.target.style.width = '32px';
                e.target.style.cursor = 'pointer';
            }
        });

        // Final icon init for initial view
        if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...pickerOverlay.querySelectorAll('[data-lucide]')] });
    });

}
