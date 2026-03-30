/**
 * Settings & Template Logic
 */
import { appState } from '../state.js';

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
                    <button id="close-format-help" style="background:none; border:none; cursor:pointer; font-size:1.2rem; color:var(--text-muted);"><i class="fa-solid fa-times"></i></button>
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

            alert('Pengaturan telah direset!');
        });
    }

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
                        <i class="fa-solid fa-check"></i> 
                    </button>
                    <button class="btn btn-sm btn-outline delete-template" data-index="${i}" style="color:#ff4d4f; border-color:#ff4d4f; margin-left:4px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            templateList.appendChild(div);
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
            <div class="modal-content" style="max-width:300px;">
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
            if (!name) return alert("Nama wajib diisi!");

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
        pickerOverlay.className = 'modal active';
        pickerOverlay.style.zIndex = '300';

        // Initial HTML
        const renderPickerContent = (isAdding = false, editItem = null) => {
            if (editItem !== null) {
                // Edit Mode
                const item = itemTemplates[editItem];
                return `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Edit Item</h2>
                            <button class="close-picker"><i class="fa-solid fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label class="field-label">Nama Barang</label>
                                <input type="text" id="edit-item-name" class="form-input" value="${item.name || ''}">
                            </div>
                            <div class="input-group">
                                <label class="field-label">Harga (Rp)</label>
                                <input type="number" id="edit-item-price" class="form-input" value="${item.price || ''}">
                            </div>
                            <div class="input-group">
                                <label class="field-label">Tipe (Opsional)</label>
                                <select id="edit-item-tipe" class="form-input">
                                    <option value="" ${!item.tipe ? 'selected' : ''}>-</option>
                                    <option value="ICA" ${item.tipe === 'ICA' ? 'selected' : ''}>ICA</option>
                                    <option value="Protecta" ${item.tipe === 'Protecta' ? 'selected' : ''}>Protecta</option>
                                    <option value="Prolink" ${item.tipe === 'Prolink' ? 'selected' : ''}>Prolink</option>
                                    <option value="APC" ${item.tipe === 'APC' ? 'selected' : ''}>APC</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label class="field-label">Note (Opsional)</label>
                                <input type="text" id="edit-item-note" class="form-input" value="${item.note || ''}" placeholder="Deskripsi item">
                            </div>
                            <button id="btn-save-edit-item" data-index="${editItem}" class="btn btn-primary btn-full" style="margin-top:10px;">Simpan Perubahan</button>
                            <button id="btn-back-picker" class="btn btn-outline btn-full" style="margin-top:8px;">Batal</button>
                        </div>
                    </div>
                `;
            } else if (isAdding) {
                return `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Tambah Item Baru</h2>
                            <button class="close-picker"><i class="fa-solid fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label class="field-label">Nama Barang</label>
                                <input type="text" id="new-item-name" class="form-input" placeholder="Contoh: Kabel Audio">
                            </div>
                            <div class="input-group">
                                <label class="field-label">Harga (Rp)</label>
                                <input type="number" id="new-item-price" class="form-input" placeholder="0">
                            </div>
                            <div class="input-group">
                                <label class="field-label">Tipe (Opsional)</label>
                                <select id="new-item-tipe" class="form-input">
                                    <option value="" selected>-</option>
                                    <option value="ICA">ICA</option>
                                    <option value="Protecta">Protecta</option>
                                    <option value="Prolink">Prolink</option>
                                    <option value="APC">APC</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label class="field-label">Note (Opsional)</label>
                                <input type="text" id="new-item-note" class="form-input" placeholder="Deskripsi item">
                            </div>
                            <button id="btn-save-new-item" class="btn btn-primary btn-full" style="margin-top:10px;">Simpan & Pilih</button>
                            <button id="btn-back-picker" class="btn btn-outline btn-full" style="margin-top:8px;">Kembali</button>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Pilih Barang</h2>
                            <button class="close-picker"><i class="fa-solid fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div id="picker-list" style="max-height: 50vh; overflow-y: auto;">
                                ${itemTemplates.map((t, idx) => `
                                    <div class="item-swipe-container" style="position:relative; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:8px;">
                                        <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                                            <button class="swipe-btn swipe-edit" data-index="${idx}" style="background-color:#F5A623; border:none; color:white; padding:0 20px; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
                                            <button class="swipe-btn swipe-delete" data-index="${idx}" style="background-color:#ff4d4f; border:none; color:white; padding:0 20px; cursor:pointer; border-radius:0 var(--radius-sm) var(--radius-sm) 0;"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                        <div class="item-card picker-item" data-index="${idx}" style="padding:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; border:1px solid var(--border-color); box-shadow: var(--shadow-sm) !important; background:var(--bg-card); z-index:2; position:relative; transition:transform 0.2s;">
                                            <div style="font-weight:500; pointer-events:none;">${t.name}</div>
                                            <div style="font-weight:600; color:var(--primary); pointer-events:none;">${formatCurrency(t.price)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <button id="btn-to-add-view" class="btn btn-outline btn-full" style="margin-top:10px;">
                                <i class="fa-solid fa-plus"></i> Tambah Item Baru
                            </button>
                        </div>
                    </div>
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

        // Interaction Logic
        pickerOverlay.addEventListener('click', (evt) => {
            const target = evt.target;

            // Close
            if (target === pickerOverlay || target.closest('.close-picker')) {
                pickerOverlay.remove();
            }

            // Swipe Edit Button
            const editBtn = target.closest('.swipe-edit');
            if (editBtn) {
                const idx = parseInt(editBtn.dataset.index);
                pickerOverlay.innerHTML = renderPickerContent(false, idx);
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
                    initPickerSwipe();
                }
                return;
            }

            // Select Item
            const itemEl = target.closest('.picker-item');
            if (itemEl && !target.closest('.swipe-btn')) {
                const idx = itemEl.dataset.index;
                callback(itemTemplates[idx]);
                pickerOverlay.remove();
            }

            // Switch to Add View
            if (target.closest('#btn-to-add-view')) {
                pickerOverlay.innerHTML = renderPickerContent(true);
            }

            // Back to List
            if (target.id === 'btn-back-picker') {
                pickerOverlay.innerHTML = renderPickerContent(false);
                initPickerSwipe();
            }

            // Save New Item
            if (target.id === 'btn-save-new-item') {
                const name = document.getElementById('new-item-name').value;
                const price = document.getElementById('new-item-price').value;
                const tipe = document.getElementById('new-item-tipe').value;
                const note = document.getElementById('new-item-note').value;

                if (!name) return alert("Nama harus diisi");

                const newItem = { name, price: parseInt(price) || 0, tipe, note };
                itemTemplates.push(newItem);
                saveItemTemplates();

                callback(newItem);
                pickerOverlay.remove();
            }

            // Save Edit Item
            if (target.id === 'btn-save-edit-item') {
                const idx = parseInt(target.dataset.index);
                const name = document.getElementById('edit-item-name').value;
                const price = document.getElementById('edit-item-price').value;
                const tipe = document.getElementById('edit-item-tipe').value;
                const note = document.getElementById('edit-item-note').value;

                if (!name) return alert("Nama harus diisi");

                itemTemplates[idx] = { name, price: parseInt(price) || 0, tipe, note };
                saveItemTemplates();
                pickerOverlay.innerHTML = renderPickerContent(false);
                initPickerSwipe();
            }
        });
    });

}
