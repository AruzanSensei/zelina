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
    // GENERAL SETTINGS
    // ===================================
    document.querySelectorAll('.setting-item .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.parentElement;
            parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (e.target.dataset.theme) {
                const theme = e.target.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                appState.updateSettings({ theme });
            }
        });
    });

    // Init Theme
    const currentTheme = appState.state.settings.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector(`[data-theme="${currentTheme}"]`).classList.add('active');

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
        { name: "Kabel NYM 1.5mm", price: 5000 },
        { name: "Lampu LED 10W", price: 35000 },
        { name: "Saklar Single", price: 15000 }
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
        const renderPickerContent = (isAdding = false) => {
            if (isAdding) {
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
                                    <div class="item-card picker-item" data-index="${idx}" style="padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; border:1px solid var(--border-color);">
                                        <div style="font-weight:500;">${t.name}</div>
                                        <div style="font-weight:600; color:var(--primary);">${formatCurrency(t.price)}</div>
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

        // Interaction Logic
        pickerOverlay.addEventListener('click', (evt) => {
            const target = evt.target;

            // Close
            if (target === pickerOverlay || target.closest('.close-picker')) {
                pickerOverlay.remove();
            }

            // Select Item
            const itemEl = target.closest('.picker-item');
            if (itemEl) {
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
            }

            // Save New Item
            if (target.id === 'btn-save-new-item') {
                const name = document.getElementById('new-item-name').value;
                const price = document.getElementById('new-item-price').value;

                if (!name) return alert("Nama harus diisi");

                const newItem = { name, price: parseInt(price) || 0 };
                itemTemplates.push(newItem);
                saveItemTemplates();

                callback(newItem);
                pickerOverlay.remove();
            }
        });
    });

}
