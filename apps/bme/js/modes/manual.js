/**
 * Manual Mode Logic with Micro UX & Swipe Actions
 */
import { appState } from '../state.js';

// Helper to format currency string (e.g. "10000" -> "10.000")
const formatNumberStr = (str) => {
    if (!str) return '';
    const num = parseInt(str.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
};

// Helper for raw number
const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

export function initManualMode() {
    const container = document.getElementById('manual-items-container');
    const addBtn = document.getElementById('btn-add-item');
    const titleInput = document.getElementById('manual-title');

    // View Toggles
    const btnCardView = document.getElementById('view-card-btn');
    const btnTableView = document.getElementById('view-table-btn');

    // Mode Toggles
    const btnModeSimple = document.getElementById('mode-simple-btn');
    const btnModeAdvance = document.getElementById('mode-advance-btn');

    let items = appState.state.invoiceItems || [];
    let isMultiSelectMode = false;
    let selectedIndices = new Set();
    let longPressTimer = null;
    let contextActiveItem = null;
    if (titleInput) {
        titleInput.value = appState.state.manualTitle || '';
        // Show orange outline if empty on load
        if (!titleInput.value.trim()) titleInput.classList.add('required-empty-orange');
        else titleInput.classList.remove('required-empty-orange');

        titleInput.addEventListener('input', (e) => {
            appState.updateManualTitle(e.target.value);
            // Toggle orange outline based on content
            if (!e.target.value.trim()) e.target.classList.add('required-empty-orange');
            else e.target.classList.remove('required-empty-orange');
            render();
            updateEmptyFieldsInfo();
        });
    }

    const updateEmptyFieldsInfo = () => {
        const indicator = document.getElementById('required-fields-indicator');
        const badge = indicator?.querySelector('.indicator-badge');

        let emptyCount = 0;

        // Count title if empty
        if (!titleInput?.value.trim()) emptyCount++;

        // Count empty items
        items.forEach(item => {
            if (appState.state.manualCardMode === 'advance') {
                if (!item.invKeterangan?.trim()) emptyCount++;
                if (!item.name?.trim()) emptyCount++;
                if (!item.price || item.price <= 0) emptyCount++;
                if (!item.sjKeterangan?.trim()) emptyCount++;
            } else {
                if (!item.name?.trim()) emptyCount++;
                if (!item.price || item.price <= 0) emptyCount++;
                if (!item.tipe?.trim()) emptyCount++;
                if (!item.note?.trim()) emptyCount++;
            }
        });

        if (emptyCount > 0) {
            indicator?.classList.remove('hidden');
            if (badge) badge.textContent = emptyCount;
        } else {
            indicator?.classList.add('hidden');
        }
    };

    const indicatorEl = document.getElementById('required-fields-indicator');
    if (indicatorEl) {
        indicatorEl.style.cursor = 'pointer';
        indicatorEl.style.pointerEvents = 'auto'; // ensure it can be clicked
        indicatorEl.addEventListener('click', () => {
            const firstEmpty = document.querySelector('.required-empty-orange, .required-empty-red');
            if (firstEmpty) {
                firstEmpty.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (firstEmpty.tagName === 'INPUT' || firstEmpty.tagName === 'TEXTAREA') {
                    setTimeout(() => firstEmpty.focus(), 400);
                } else if (firstEmpty.classList.contains('select-selected')) {
                    setTimeout(() => firstEmpty.click(), 400);
                }
            }
        });
    }

    // ============================================
    // MICRO UX HANDLERS
    // ============================================

    // Auto-resize textarea
    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    // Copy Text
    const copyText = (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 1500);

            const alertEl = document.getElementById('custom-alert');
            const messageEl = document.getElementById('alert-message');
            if (alertEl && messageEl) {
                messageEl.innerHTML = 'Teks disalin <i-ui name="check" size="14" style="color:#27AE60;margin-left:5px"></i-ui>';
                alertEl.classList.remove('hidden');
                alertEl.style.animation = 'alert-in 0.3s ease-out forwards';

                setTimeout(() => {
                    alertEl.classList.add('hidden');
                }, 1500);
            }
        });
    };

    // ============================================
    // RENDER LOGIC
    // ============================================

    const renderAdvancedCardView = () => {
        container.innerHTML = '';
        container.classList.remove('table-view-container');

        items.forEach((item, index) => {
            const div = document.createElement('div');
            const isSelected = selectedIndices.has(index);
            div.className = `item-card ${isSelected ? 'is-selected' : ''} ${item.isNew ? 'new-item' : ''}`;
            div.dataset.index = index;
            div.innerHTML = `
                <button class="remove-item-btn" data-index="${index}"><i-ui name="trash-01" size="14"></i-ui></button>
                    
                <div class="input-group item-field-wrap" style="margin-bottom: 8px;">
                    <label class="field-label"><strong>Invoice</strong> - Keterangan</label>
                    <textarea class="form-input item-inv-keterangan ${!item.invKeterangan ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Keterangan untuk Invoice" rows="1" style="resize:none; overflow:hidden; font-family:inherit; white-space:pre-wrap;">${item.invKeterangan || ''}</textarea>
                </div>

                <div class="item-row adv" style="margin-bottom: 6px;">
                    <div class="item-field-wrap" style="flex: 1;">
                        <label class="field-label"><strong>SurJal</strong> - Nama Barang</label>
                        <div class="input-with-icon">
                            <textarea class="form-input item-name ${!item.name ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Nama Barang" rows="1" style="resize:none; overflow:hidden; padding-right:30px; font-family:inherit; white-space:pre-wrap;">${item.name || ''}</textarea>
                            <button class="input-icon-btn template-picker-btn" data-index="${index}"><i-ui name="list" size="18"></i-ui></button>
                        </div>
                    </div>
                    <div style="width: 100px; display: flex; flex-direction: column;">
                        <div class="unit-switch adv" data-index="${index}" style="margin: 0 0 5px auto; margin-top: -4px;">
                            <span class="unit-opt ${(item.qtyUnit || 'pcs') === 'pcs' ? 'active' : ''}" data-unit="pcs">Pcs</span>
                            <span class="unit-opt ${item.qtyUnit === 'lot' ? 'active' : ''}" data-unit="lot">Lot</span>
                        </div>
                        <div class="qty-control" style="margin-left: auto;">
                            <button class="qty-btn minus" data-index="${index}">-</button>
                            <input type="number" class="qty-input item-qty" value="${item.qty}" data-index="${index}" min="1">
                            <button class="qty-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>

                <div class="input-group item-field-wrap" style="margin-bottom: 8px;">
                    <label class="field-label"><strong>SurJal</strong> - Keterangan</label>
                    <textarea class="form-input item-sj-keterangan ${!item.sjKeterangan ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Keterangan untuk Surat Jalan" rows="1" style="resize:none; overflow:hidden; font-family:inherit; white-space:pre-wrap; margin-bottom: 6px;">${item.sjKeterangan || ''}</textarea>
                </div>

                <div class="item-row" style="align-items: flex-end; margin-bottom: 0; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="font-size: 1rem; color: var(--bg-card); background-color: var(--muted); padding: 4px 10px; border-radius: 4px; font-weight: 600; margin-bottom: -15px;">
                            ${index + 1}
                        </div>
                        <div style="flex: 1; max-width: 160px;">
                            <!--<label class="field-label" style="margin-bottom: 4px;">Harga</label>-->
                            <input type="text" class="form-input item-price-format ${!item.price || item.price <= 0 ? 'required-empty-orange' : ''}" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="Harga" inputmode="numeric">
                        </div>
                    </div>
                    <div style="font-weight: 600; color: var(--primary); padding-bottom: 4px;">
                        ${formatCurrency(item.price * item.qty)}
                    </div>
                </div>
            `;
            container.appendChild(div);
            div.querySelectorAll('textarea').forEach(ta => autoResize(ta));
        });
    };

    const renderCardView = () => {
        if (appState.state.manualCardMode === 'advance') {
            renderAdvancedCardView();
            return;
        }
        container.innerHTML = '';
        container.classList.remove('table-view-container');

        items.forEach((item, index) => {
            const div = document.createElement('div');
            const isSelected = selectedIndices.has(index);
            div.className = `item-card ${isSelected ? 'is-selected' : ''} ${item.isNew ? 'new-item' : ''}`;
            div.dataset.index = index;
            div.innerHTML = `
                <button class="remove-item-btn" data-index="${index}"><i-ui name="trash-01" size="14"></i-ui></button>
                    
                    <div class="input-group item-field-wrap" style="margin-bottom: 4px;">
                        <label class="field-label">Barang</label>
                        <div class="input-with-icon">
                            <textarea class="form-input item-name ${!item.name ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Nama Barang" rows="1" style="resize:none; overflow:hidden; padding-right:30px; font-family:inherit; white-space:pre-wrap;">${item.name || ''}</textarea>
                            <button class="input-icon-btn template-picker-btn" data-index="${index}"><i-ui name="list" size="18"></i-ui></button>
                        </div>
                    </div>
                    
                    <div class="item-row">
                        <div class="item-price-wrap" style="flex: 2.2; padding-top: 4px;">
                            <label class="field-label"><i-ui name="bank-note-01" size="12" style="vertical-align:middle;margin-top:-2px"></i-ui> Harga</label>
                            <input type="text" class="form-input item-price-format ${!item.price || item.price <= 0 ? 'required-empty-orange' : ''}" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric">
                        </div>
                        <div class="item-tipe-wrap" style="flex: 2; padding-top: 4px;">
                            <label class="field-label"><i-ui name="tag-01" size="12" style="vertical-align:middle;margin-top:-2px"></i-ui> Tipe</label>
                            <div class="custom-select item-tipe" data-index="${index}" data-value="${item.tipe || ''}">
                                <div class="select-selected form-input ${!item.tipe ? 'required-empty-orange' : ''}" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                                    <span class="selected-text" style="opacity: ${!item.tipe ? '0.5' : '1'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.tipe || 'Tipe'}</span>
                                    <i-ui name="chevron-down" size="14" style="opacity:0.5;flex-shrink:0"></i-ui>
                                </div>
                                <div class="select-items select-hide">
                                    <div data-value="-" class="${item.tipe === '-' ? 'same-as-selected' : ''}">-</div>
                                    <div data-value="ICA" class="${item.tipe === 'ICA' ? 'same-as-selected' : ''}">ICA</div>
                                    <div data-value="Protecta" class="${item.tipe === 'Protecta' ? 'same-as-selected' : ''}">Protecta</div>
                                    <div data-value="Prolink" class="${item.tipe === 'Prolink' ? 'same-as-selected' : ''}">Prolink</div>
                                    <div data-value="APC" class="${item.tipe === 'APC' ? 'same-as-selected' : ''}">APC</div>
                                </div>
                            </div>
                        </div>
                        <div class="item-qty-wrap" style="min-width: 90px; margin-top:17px; display: flex; flex-direction: column;">
                            <div class="unit-switch" data-index="${index}" style="margin: 0 0 6px auto;">
                                <span class="unit-opt ${(item.qtyUnit || 'pcs') === 'pcs' ? 'active' : ''}" data-unit="pcs">Pcs</span>
                                <span class="unit-opt ${item.qtyUnit === 'lot' ? 'active' : ''}" data-unit="lot">Lot</span>
                            </div>
                            <div class="qty-control" style="margin-left: auto;">
                                <button class="qty-btn minus" data-index="${index}">-</button>
                                <input type="number" class="qty-input item-qty" value="${item.qty}" data-index="${index}" min="1">
                                <button class="qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="input-group" style="margin-bottom: 0;">
                        <div class="input-wrapper">
                            <textarea class="form-textarea item-note ${!item.note ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Deskripsi Item (wajib)" rows="1" style="padding-right: 30px; resize:none; overflow:hidden; min-height:36px; line-height:1.4;">${item.note || ''}</textarea>
                            <button class="copy-icon-btn" data-index="${index}" title="Copy Note"><i-ui name="copy-01" size="13"></i-ui></button>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <div style="font-size: 0.85rem; color: var(--bg-card); background-color: var(--muted); margin: 0 2px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                            ${index + 1}
                        </div>
                        <div style="font-weight: 600; color: var(--primary);">
                            ${formatCurrency(item.price * item.qty)}
                        </div>
                    </div>
            `;
            container.appendChild(div);

            // Init resize for this item's textareas
            const textareas = div.querySelectorAll('textarea');
            textareas.forEach(ta => autoResize(ta));
        });
    };

    const renderTableView = () => {
        container.innerHTML = '';
        container.classList.add('table-view-container');

        const table = document.createElement('table');
        table.className = 'item-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Barang</th>
                    <th>Harga</th>
                    <th>Tipe</th>
                    <th>Pcs</th>
                    <th>Note</th>
                    <th style="width:40px;"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, index) => `
                <tr>
                    <td>
                        <div class="input-with-icon">
                            <span class="input-sizer" data-value="${item.name || 'Nama Barang'}">
                                <input type="text" class="item-name ${!item.name ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Nama Barang" value="${item.name || ''}" oninput="this.parentNode.dataset.value = this.value || 'Nama Barang'">
                            </span>
                            <button class="input-icon-btn template-picker-btn" data-index="${index}"><i-ui name="list" size="12"></i-ui></button>
                        </div>
                    </td>
                    <td>
                        <span class="input-sizer" data-value="${formatNumberStr(String(item.price)) || '0'}">
                            <input type="text" class="item-price-format ${!item.price || item.price <= 0 ? 'required-empty-orange' : ''}" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric" oninput="this.parentNode.dataset.value = this.value || '0'">
                        </span>
                    </td>
                    <td>
                        <div class="custom-select item-tipe table-select" data-index="${index}" data-value="${item.tipe || ''}">
                            <div class="select-selected ${!item.tipe ? 'required-empty-orange' : ''}" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; width:100%; padding: 4px;">
                                <span class="selected-text" style="opacity: ${!item.tipe ? '0.5' : '1'}">${item.tipe || 'Tipe'}</span>
                                <i-ui name="chevron-down" size="12" style="opacity:0.5"></i-ui>
                            </div>
                            <div class="select-items select-hide">
                                <div data-value="-" class="${item.tipe === '-' ? 'same-as-selected' : ''}">-</div>
                                <div data-value="ICA" class="${item.tipe === 'ICA' ? 'same-as-selected' : ''}">ICA</div>
                                <div data-value="Protecta" class="${item.tipe === 'Protecta' ? 'same-as-selected' : ''}">Protecta</div>
                                <div data-value="Prolink" class="${item.tipe === 'Prolink' ? 'same-as-selected' : ''}">Prolink</div>
                                <div data-value="APC" class="${item.tipe === 'APC' ? 'same-as-selected' : ''}">APC</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="input-sizer" data-value="${item.qty || '1'}">
                            <input type="text" class="item-qty table-qty-input" value="${item.qty}" data-index="${index}" inputmode="numeric" oninput="this.parentNode.dataset.value = this.value || '1'">
                        </span>
                    </td>
                    <td><textarea class="item-note table-note ${!item.note ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Deskripsi (wajib)" rows="1">${item.note || ''}</textarea></td>
                    <td>
                        <button class="remove-item-btn" data-index="${index}"><i-ui name="trash-01" size="14"></i-ui></button>
                    </td>
                </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
        container.querySelectorAll('textarea').forEach(ta => autoResize(ta));
    };

    const render = () => {
        if (appState.state.manualViewMode === 'table') {
            renderTableView();
            btnCardView.classList.remove('active');
            btnTableView.classList.add('active');
        } else {
            renderCardView();
            btnCardView.classList.add('active');
            btnTableView.classList.remove('active');
        }

        // Mode Toggles Sync
        if (appState.state.manualCardMode === 'advance') {
            btnModeAdvance?.classList.add('active');
            btnModeSimple?.classList.remove('active');
        } else {
            btnModeAdvance?.classList.remove('active');
            btnModeSimple?.classList.add('active');
        }

        // Calculate Total
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        document.getElementById('grand-total').textContent = formatCurrency(total);

        // Update State
        appState.updateItems(items);
        updateEmptyFieldsInfo();

        // Apply multi-select class to container
        if (isMultiSelectMode) {
            container.classList.add('is-multi-select');
        } else {
            container.classList.remove('is-multi-select');
        }

        // Clear isNew flags after first render
        items.forEach(item => { if (item.isNew) delete item.isNew; });
    };

    // ============================================
    // CONTEXT MENU & MULTI-SELECT LOGIC
    // ============================================

    const showManualContextMenu = (x, y, index) => {
        let menu = document.getElementById('bme-context-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'bme-context-menu';
            document.body.appendChild(menu);
        }

        menu.innerHTML = `
            <button class="ctx-item" data-action="duplicate">
                <i-ui name="copy-01" size="14"></i-ui> Duplikat
            </button>
            <button class="ctx-item" data-action="multiselect">
                <i-ui name="check-done-01" size="14"></i-ui> Pilih beberapa...
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item danger" data-action="delete">
                <i-ui name="trash-01" size="14"></i-ui> Hapus
            </button>
        `;


        menu.querySelectorAll('.ctx-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleManualContextAction(btn.dataset.action, index);
                menu.classList.remove('visible');
            });
        });

        // Position & Show
        menu.classList.add('visible');
        const mw = menu.offsetWidth || 210;
        const mh = menu.offsetHeight || 160;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = x;
        let top = y;
        if (left + mw > vw) left = vw - mw - 10;
        if (top + mh > vh) top = vh - mh - 10;

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.transformOrigin = x > vw / 2 ? 'top right' : 'top left';
    };

    const removeItemWithAnimation = (idx) => {
        const cards = container.querySelectorAll('.item-card');
        const card = Array.from(cards).find(c => parseInt(c.dataset.index) === idx);

        if (card) {
            card.classList.add('removing');
            setTimeout(() => {
                items.splice(idx, 1);
                appState.updateItems(items);
                render();
            }, 400);
        } else {
            items.splice(idx, 1);
            appState.updateItems(items);
            render();
        }
    };

    const handleManualContextAction = (action, index) => {
        switch (action) {
            case 'duplicate': {
                const itemToClone = items[index];
                const cloned = JSON.parse(JSON.stringify(itemToClone));
                cloned.isNew = true;
                items.splice(index + 1, 0, cloned);
                appState.updateItems(items);
                render();
                break;
            }
            case 'multiselect':
                isMultiSelectMode = true;
                selectedIndices.add(index);
                render();
                break;
            case 'delete':
                window.showBMEAlert('Hapus item ini?', 'error', {
                    confirm: true,
                    onConfirm: () => {
                        removeItemWithAnimation(index);
                    }
                });
                break;
        }
    };

    const closeContextMenu = () => {
        const menu = document.getElementById('bme-context-menu');
        if (menu) menu.classList.remove('visible');
    };

    const setupContextMenuListeners = () => {
        // Desktop Context Menu
        container.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('.item-card');
            if (card && !isMultiSelectMode) {
                e.preventDefault();
                const index = parseInt(card.dataset.index);
                showManualContextMenu(e.pageX, e.pageY, index);
            }
        });

        // Mobile Long Press
        container.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.item-card');
            if (card && !isMultiSelectMode) {
                longPressTimer = setTimeout(() => {
                    const touch = e.touches[0];
                    const index = parseInt(card.dataset.index);
                    showManualContextMenu(touch.pageX, touch.pageY, index);
                }, 600);
            }
        }, { passive: true });

        container.addEventListener('touchend', () => clearTimeout(longPressTimer));
        container.addEventListener('touchmove', () => clearTimeout(longPressTimer));

        // Click to select in multi-select mode
        container.addEventListener('click', (e) => {
            if (!isMultiSelectMode) return;
            // Prevent interference with inputs/buttons
            if (e.target.closest('.form-input') || e.target.closest('button')) return;

            const card = e.target.closest('.item-card');
            if (card) {
                const index = parseInt(card.dataset.index);
                if (selectedIndices.has(index)) {
                    selectedIndices.delete(index);
                } else {
                    selectedIndices.add(index);
                }
                // If nothing selected, exit multi-select mode
                if (selectedIndices.size === 0) isMultiSelectMode = false;
                render();
            }
        });

        // Global click to close menu or exit multi-select
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#bme-context-menu')) closeContextMenu();

            // Handle custom select portal option click
            const portalOption = e.target.closest('.select-items-portal div');
            if (portalOption) {
                const portal = portalOption.closest('.select-items-portal');
                const index = parseInt(portal.dataset.sourceIndex);
                items[index].tipe = portalOption.dataset.value;
                portal.remove();
                render();
                return;
            }

            // Exit custom selects portal
            if (!e.target.closest('.select-selected') && !e.target.closest('.select-items-portal')) {
                document.querySelectorAll('.select-items-portal').forEach(el => el.remove());
            }

            // Exit multi-select if clicking away from any card or inputs
            if (isMultiSelectMode && !e.target.closest('.item-card') && !e.target.closest('#bme-context-menu') && !e.target.closest('.sticky-action-bar')) {
                isMultiSelectMode = false;
                selectedIndices.clear();
                render();
            }
        });
    };

    setupContextMenuListeners();

    // Close custom select portal on scroll
    document.addEventListener('scroll', (e) => {
        if (e.target.closest && e.target.closest('.select-items-portal')) return;
        document.querySelectorAll('.select-items-portal').forEach(el => el.remove());
    }, true);

    // ============================================
    // EVENTS
    // ============================================

    // View Switching
    btnCardView.addEventListener('click', () => { appState.state.manualViewMode = 'card'; render(); });
    btnTableView.addEventListener('click', () => { appState.state.manualViewMode = 'table'; render(); });

    // Mode Switching
    btnModeSimple?.addEventListener('click', () => {
        console.log('[BME] Switching to Simple Mode');
        appState.updateManualCardMode('simple');
        render();
    });
    btnModeAdvance?.addEventListener('click', () => {
        console.log('[BME] Switching to Advance Mode');
        appState.updateManualCardMode('advance');
        render();
    });

    // Add Item
    const addItem = () => {
        items.push({
            name: '',
            price: 0,
            qty: 1,
            note: '',
            tipe: '',
            qtyUnit: 'pcs',
            invKeterangan: '',
            sjKeterangan: '',
            isNew: true
        });
        render();
    };
    addBtn.addEventListener('click', addItem);

    // Global template picker (from orange button next to addBtn in HTML)
    document.addEventListener('add-item-from-template', (e) => {
        const t = e.detail.item;
        items.push({
            name: t.name || '',
            price: t.price || 0,
            qty: t.qty || 1,
            note: t.note || '',
            tipe: t.tipe || '',
            qtyUnit: 'pcs',
            invKeterangan: '',
            sjKeterangan: '',
            isNew: true
        });
        appState.updateItems(items);
        render();
        updateEmptyFieldsInfo();
    });

    // Container Interactions
    container.addEventListener('click', (e) => {
        const target = e.target;

        // Custom Select Handler
        const selectSelected = target.closest('.select-selected');
        if (selectSelected) {
            const wrapper = selectSelected.closest('.custom-select');
            const itemsListTemplate = wrapper.querySelector('.select-items');

            const existingPortal = document.querySelector('.select-items-portal');
            if (existingPortal) existingPortal.remove();

            if (existingPortal && existingPortal.dataset.sourceIndex === wrapper.dataset.index) {
                return; // just toggling it closed
            }

            const portal = itemsListTemplate.cloneNode(true);
            portal.classList.remove('select-hide');
            portal.classList.add('select-items-portal');
            portal.dataset.sourceIndex = wrapper.dataset.index;

            const rect = wrapper.getBoundingClientRect();
            portal.style.position = 'fixed';
            portal.style.top = rect.bottom + 'px';
            portal.style.left = rect.left + 'px';
            portal.style.width = rect.width + 'px';
            portal.style.zIndex = '999999';
            portal.style.marginTop = '4px';

            document.body.appendChild(portal);
            return;
        }

        // Remove Item
        const removeBtn = target.closest('.remove-item-btn') || target.closest('.swipe-delete');
        if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.index);
            removeItemWithAnimation(idx);
            return;
        }

        // Edit via Swipe (Just focus name for now)
        const editBtn = target.closest('.swipe-edit');
        if (editBtn) {
            const idx = parseInt(editBtn.dataset.index);
            // Logic to just focus the field or open modal if needed? 
            // Requirement says: "Edit (orange)". Usually implies specific action, but here fields are inline.
            // Maybe it just closes swipe and focuses name?
            const card = container.children[idx].querySelector('.item-card');
            if (card) {
                card.classList.remove('swiped-left');
                const nameInput = card.querySelector('.item-name');
                if (nameInput) nameInput.focus();
            }
            return;
        }

        // Copy Note
        const copyBtn = target.closest('.copy-icon-btn');
        if (copyBtn) {
            const idx = parseInt(copyBtn.dataset.index);
            copyText(items[idx].note || '', copyBtn);
            return;
        }

        // Template Picker
        const pickerBtn = target.closest('.template-picker-btn');
        if (pickerBtn) {
            const idx = parseInt(pickerBtn.dataset.index);
            const event = new CustomEvent('request-item-picker', {
                detail: {
                    callback: (templateItem) => {
                        items[idx].name = templateItem.name || '';
                        items[idx].price = templateItem.price || 0;
                        if (templateItem.tipe) items[idx].tipe = templateItem.tipe;
                        if (templateItem.note) items[idx].note = templateItem.note;
                        render();
                    }
                }
            });
            document.dispatchEvent(event);
            return;
        }

        // Qty Buttons (Logic moved to dedicated mousedown/touchstart handlers below)
        // Unit Switch (Pcs / Lot)
        const unitOpt = target.closest('.unit-opt');
        if (unitOpt) {
            const switchEl = unitOpt.closest('.unit-switch');
            const index = parseInt(switchEl.dataset.index);
            const unit = unitOpt.dataset.unit;
            items[index].qtyUnit = unit;
            render();
        }
    });

    // --- Fast Qty Increment Logic ---
    let qtyInterval = null;
    let qtyTimeout = null;
    let isQtyUpdating = false;

    const startQtyChange = (btn, isPlus) => {
        if (isQtyUpdating) return;
        isQtyUpdating = true;
        const index = parseInt(btn.dataset.index);

        const change = () => {
            if (isPlus) items[index].qty++;
            else if (items[index].qty > 1) items[index].qty--;

            // Only update DOM locally to prevent destroying elements while user is holding
            const qs = document.querySelector(`.qty-input[data-index="${index}"]`);
            if (qs) qs.value = items[index].qty;

            // Update Grand Total
            const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            document.getElementById('grand-total').textContent = formatCurrency(total);
        };

        change(); // initial tap

        qtyTimeout = setTimeout(() => {
            qtyInterval = setInterval(change, 80);
        }, 400);
    };

    const stopQtyChange = () => {
        if (qtyTimeout) clearTimeout(qtyTimeout);
        if (qtyInterval) clearInterval(qtyInterval);
        qtyTimeout = null;
        qtyInterval = null;
        if (isQtyUpdating) {
            isQtyUpdating = false;
            render(); // sync all subtotal arrays
        }
    };

    ['mousedown', 'touchstart'].forEach(evt => {
        container.addEventListener(evt, (e) => {
            const btn = e.target.closest('.qty-btn');
            if (btn) {
                // Ignore right clicks
                if (evt === 'mousedown' && e.button !== 0) return;
                e.preventDefault();
                const isPlus = btn.classList.contains('plus');
                startQtyChange(btn, isPlus);
            }
        }, { passive: false });
    });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
        document.body.addEventListener(evt, () => {
            if (isQtyUpdating) stopQtyChange();
        });
    });
    // --------------------------------

    // Input Handling
    container.addEventListener('input', (e) => {
        const target = e.target;
        if (target.dataset.index !== undefined) {
            const index = parseInt(target.dataset.index);
            const val = target.value;
            // Real-time validation sync: remove orange outline if filled
            const isFilled = target.classList.contains('item-price-format')
                ? (items[index].price > 0)
                : (val.trim() !== '');

            if (isFilled) {
                target.classList.remove('required-empty-orange');
            } else {
                target.classList.add('required-empty-orange');
            }

            if (target.classList.contains('item-name')) {
                items[index].name = val;
                if (target.tagName.toLowerCase() === 'textarea') autoResize(target);
            }

            if (target.classList.contains('item-tipe')) items[index].tipe = val;

            // Currency Auto-Format logic
            if (target.classList.contains('item-price-format')) {
                // Strip non digits
                const raw = val.replace(/\D/g, '');
                const num = parseInt(raw) || 0;
                items[index].price = num;

                // Only format if not empty to allow deleting everything
                if (raw === '') target.value = '';
                else target.value = formatNumberStr(raw);

                // Sync with sizer
                if (target.parentNode.classList.contains('input-sizer')) {
                    target.parentNode.dataset.value = target.value || '0';
                }
            }

            if (target.classList.contains('item-qty')) {
                const num = parseInt(val) || 1;
                items[index].qty = num;

                // Sync with sizer
                if (target.parentNode.classList.contains('input-sizer')) {
                    target.parentNode.dataset.value = target.value || '1';
                }
            }

            if (target.classList.contains('item-note')) {
                items[index].note = val;
                // Toggle orange outline based on content
                if (!val.trim()) target.classList.add('required-empty-orange');
                else target.classList.remove('required-empty-orange');
                autoResize(target);
            }

            if (target.classList.contains('item-inv-keterangan')) {
                items[index].invKeterangan = val;
                autoResize(target);
            }

            if (target.classList.contains('item-sj-keterangan')) {
                items[index].sjKeterangan = val;
                autoResize(target);
            }

            // Subtotal Update (Micro Optimization to avoid full rerender on keystroke)
            // But we must support global totals too. 
            // Let's just update the specific text elements if possible, or simple re-render triggered lazily?
            // "Real-time HTML Preview WAJIB ... Setiap perubahan data 1 huruf ... HARUS langsung mengubah preview"
            // So we MUST update state immediately.

            const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            document.getElementById('grand-total').textContent = formatCurrency(total);

            if (appState.state.manualViewMode === 'card') {
                const card = target.closest('.item-card');
                if (card) {
                    const subtotalDisplay = card.querySelector('div[style*="text-align: right"]');
                    if (subtotalDisplay) subtotalDisplay.textContent = formatCurrency(items[index].price * items[index].qty);
                }
            }

            appState.updateItems(items);
            updateEmptyFieldsInfo();
        }
    });


    // External Event Listeners
    document.addEventListener('template-selected', (e) => {
        const applyTemplate = () => {
            items = JSON.parse(JSON.stringify(e.detail.items));
            render();
        };

        // Warning if data exists? "Peringatan Penggantian Data"
        if (items.length > 0 && (items[0].name !== '' || items.length > 1)) {
            window.showBMEAlert("Data saat ini akan digantikan. Lanjutkan?", "warning", {
                confirm: true,
                onConfirm: applyTemplate
            });
        } else {
            applyTemplate();
        }
    });

    document.addEventListener('ai-generated', (e) => {
        const applyAI = () => {
            titleInput.value = e.detail.title;
            items = JSON.parse(JSON.stringify(e.detail.items));
            render();
        };

        if (items.length > 0 && (items[0].name !== '' || items.length > 1)) {
            window.showBMEAlert("Data saat ini akan digantikan dengan hasil AI. Lanjutkan?", "warning", {
                confirm: true,
                onConfirm: applyAI
            });
        } else {
            applyAI();
        }
    });

    // Initial
    if (items.length === 0) {
        addItem();
    } else {
        render();
        updateEmptyFieldsInfo();
    }
}
