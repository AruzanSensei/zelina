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

    let items = appState.state.invoiceItems || [];
    if (titleInput) {
        titleInput.value = appState.state.manualTitle || '';
        // Show red outline if empty on load
        if (!titleInput.value.trim()) titleInput.classList.add('required-empty-red');
        else titleInput.classList.remove('required-empty-red');

        titleInput.addEventListener('input', (e) => {
            appState.updateManualTitle(e.target.value);
            // Toggle red outline based on content
            if (!e.target.value.trim()) e.target.classList.add('required-empty-red');
            else e.target.classList.remove('required-empty-red');
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
            if (!item.name?.trim()) emptyCount++;
            if (!item.price || item.price <= 0) emptyCount++;
            if (!item.tipe?.trim()) emptyCount++;
            if (!item.note?.trim()) emptyCount++;
        });

        if (emptyCount > 0) {
            indicator?.classList.remove('hidden');
            if (badge) badge.textContent = emptyCount;
        } else {
            indicator?.classList.add('hidden');
        }
    };

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
                messageEl.innerHTML = 'Teks disalin <i class="fa-solid fa-check" style="color: #27AE60; margin-left: 5px;"></i>';
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

    const renderCardView = () => {
        container.innerHTML = '';
        container.classList.remove('table-view-container');

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    
                    <div class="input-group" style="margin-bottom: 6px;">
                        <label class="field-label">Barang</label>
                        <div class="input-with-icon">
                            <textarea class="form-input item-name ${!item.name ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Nama Barang" rows="1" style="resize:none; overflow:hidden; padding-right:30px; font-family:inherit; white-space:pre-wrap;">${item.name || ''}</textarea>
                            <button class="input-icon-btn template-picker-btn" data-index="${index}"><i class="fa-solid fa-list-ul"></i></button>
                        </div>
                    </div>
                    
                    <div class="item-row">
                        <div style="flex: 2.7;">
                            <label class="field-label">Harga</label>
                            <input type="text" class="form-input item-price-format ${!item.price || item.price <= 0 ? 'required-empty-orange' : ''}" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric">
                        </div>
                        <div style="flex: 2.2;">
                            <label class="field-label">Tipe</label>
                            <select class="form-input item-tipe ${!item.tipe ? 'required-empty-orange' : ''}" data-index="${index}">
                                <option value="" ${!item.tipe ? 'selected' : ''}>Tipe</option>
                                <option value="ICA" ${item.tipe === 'ICA' ? 'selected' : ''}>ICA</option>
                                <option value="Protecta" ${item.tipe === 'Protecta' ? 'selected' : ''}>Protecta</option>
                                <option value="Prolink" ${item.tipe === 'Prolink' ? 'selected' : ''}>Prolink</option>
                                <option value="APC" ${item.tipe === 'APC' ? 'selected' : ''}>APC</option>
                            </select>
                        </div>
                        <div style="flex: 0.7;">
                            <label class="field-label">Pcs</label>
                            <div class="qty-control">
                                <button class="qty-btn minus" data-index="${index}">-</button>
                                <input type="number" class="qty-input item-qty" value="${item.qty}" data-index="${index}" min="1">
                                <button class="qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="input-group" style="margin-bottom: 0;">
                        <div class="input-wrapper">
                            <textarea class="form-textarea item-note ${!item.note ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Deskripsi Item (wajib)" rows="1" style="padding-right: 30px; overflow:hidden;">${item.note || ''}</textarea>
                            <button class="copy-icon-btn" data-index="${index}" title="Copy Note"><i class="fa-regular fa-copy"></i></button>
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
                            <textarea class="item-name ${!item.name ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Nama Barang" rows="1" style="width:100%; border:none; background:transparent; font-size:0.9rem; resize:none; overflow:hidden; font-family:inherit; padding:4px; padding-right:24px; word-break:break-word; white-space:pre-wrap;">${item.name || ''}</textarea>
                            <button class="input-icon-btn template-picker-btn" data-index="${index}" style="right:0; padding:2px;"><i class="fa-solid fa-list-ul" style="font-size:0.8rem;"></i></button>
                        </div>
                    </td>
                    <td><input type="text" class="item-price-format ${!item.price || item.price <= 0 ? 'required-empty-orange' : ''}" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric"></td>
                    <td>
                        <select class="item-tipe ${!item.tipe ? 'required-empty-orange' : ''}" data-index="${index}" style="width:100%; padding:4px; border:none; background:transparent;">
                            <option value="" ${!item.tipe ? 'selected' : ''}>Pilih Tipe</option>
                            <option value="ICA" ${item.tipe === 'ICA' ? 'selected' : ''}>ICA</option>
                            <option value="Protecta" ${item.tipe === 'Protecta' ? 'selected' : ''}>Protecta</option>
                            <option value="Prolink" ${item.tipe === 'Prolink' ? 'selected' : ''}>Prolink</option>
                            <option value="APC" ${item.tipe === 'APC' ? 'selected' : ''}>APC</option>
                        </select>
                    </td>
                    <td><input type="text" class="item-qty table-qty-input" value="${item.qty}" data-index="${index}" inputmode="numeric"></td>
                    <td><textarea class="item-note ${!item.note ? 'required-empty-orange' : ''}" data-index="${index}" placeholder="Deskripsi (wajib)" rows="2" style="width:100%; border:none; background:transparent; font-size:0.9rem; resize:none; overflow:hidden; font-family:inherit; padding:4px; word-break:break-word;">${item.note || ''}</textarea></td>
                    <td>
                        <button class="remove-item-btn" data-index="${index}" style="position:static; color:#ff4d4f; background:none; border:none; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
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

        // Calculate Total
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        document.getElementById('grand-total').textContent = formatCurrency(total);

        // Update State
        appState.updateItems(items);
        updateEmptyFieldsInfo();
        // manualTitle is updated via its own listener
    };

    // ============================================
    // EVENTS
    // ============================================

    // View Switching
    btnCardView.addEventListener('click', () => { appState.state.manualViewMode = 'card'; render(); });
    btnTableView.addEventListener('click', () => { appState.state.manualViewMode = 'table'; render(); });

    // Add Item
    const addItem = () => {
        items.push({ name: '', price: 0, qty: 1, note: '', tipe: 'Prolink' });
        render();
    };
    addBtn.addEventListener('click', addItem);

    // Container Interactions
    container.addEventListener('click', (e) => {
        const target = e.target;

        // Remove Item
        const removeBtn = target.closest('.remove-item-btn') || target.closest('.swipe-delete');
        if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.index);
            items.splice(idx, 1);
            render();
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
                        items[idx].name = templateItem.name;
                        items[idx].price = templateItem.price;
                        render();
                    }
                }
            });
            document.dispatchEvent(event);
            return;
        }

        // Qty Buttons
        if (target.classList.contains('qty-btn')) {
            const index = parseInt(target.dataset.index);
            if (target.classList.contains('plus')) items[index].qty++;
            else if (items[index].qty > 1) items[index].qty--;
            render();
        }
    });

    // Input Handling
    container.addEventListener('input', (e) => {
        const target = e.target;
        if (target.dataset.index !== undefined) {
            const index = parseInt(target.dataset.index);
            const val = target.value;

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
            }

            if (target.classList.contains('item-qty')) items[index].qty = parseInt(val) || 1;

            if (target.classList.contains('item-note')) {
                items[index].note = val;
                // Toggle orange outline based on content
                if (!val.trim()) target.classList.add('required-empty-orange');
                else target.classList.remove('required-empty-orange');
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
        // Warning if data exists? "Peringatan Penggantian Data"
        if (items.length > 0 && (items[0].name !== '' || items.length > 1)) {
            if (!confirm("Data saat ini akan digantikan. Lanjutkan?")) return;
        }

        items = JSON.parse(JSON.stringify(e.detail.items));
        render();
    });

    document.addEventListener('ai-generated', (e) => {
        if (items.length > 0 && (items[0].name !== '' || items.length > 1)) {
            if (!confirm("Data saat ini akan digantikan dengan hasil AI. Lanjutkan?")) return;
        }

        titleInput.value = e.detail.title;
        items = JSON.parse(JSON.stringify(e.detail.items));
        render();
    });

    // Initial
    if (items.length === 0) {
        addItem();
    } else {
        render();
        updateEmptyFieldsInfo();
    }
}
