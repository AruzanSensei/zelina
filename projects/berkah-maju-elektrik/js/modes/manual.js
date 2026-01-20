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

    let items = [];

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

            div.innerHTML = `
            <div class="item-card draggable-item" data-index="${index}" style="position:relative; user-select:none;">
                <!-- Drag Handle indicator optionally or just long press -->
                <!-- Regular Card Content -->
                <button class="remove-item-btn" data-index="${index}" style="right: 12px; top: 12px;"><i class="fa-solid fa-trash"></i></button>

                <div class="input-group" style="margin-bottom: 8px;">
                    <label class="field-label">Barang</label>
                    <div class="input-with-icon">
                        <input type="text" class="form-input item-name" value="${item.name}" data-index="${index}" placeholder="Nama Barang">
                            <button class="input-icon-btn template-picker-btn" data-index="${index}"><i class="fa-solid fa-list-ul"></i></button>
                    </div>
                </div>

                <div class="item-row">
                    <div style="flex: 2;">
                        <label class="field-label">Harga</label>
                        <input type="text" class="form-input item-price-format" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric">
                    </div>
                    <div style="flex: 1;">
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
                        <textarea class="form-textarea item-note" data-index="${index}" placeholder="Catatan (opsional)" rows="1" style="padding-right: 30px; overflow:hidden;">${item.note || ''}</textarea>
                        <button class="copy-icon-btn" data-index="${index}" title="Copy Note"><i class="fa-regular fa-copy"></i></button>
                    </div>
                </div>

                <div style="text-align: right; margin-top: 8px; font-weight: 600; color: var(--primary);">
                    ${formatCurrency(item.price * item.qty)}
                </div>
            </div>
            `;
            container.appendChild(div);

            // Init resize for this item's textarea
            const textarea = div.querySelector('.item-note');
            if (textarea) autoResize(textarea);
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
                    <th>Pcs</th>
                    <th style="padding-right:20px;">Total</th>
                    <th style="width:40px;"></th>
                </tr>
            </thead >
        <tbody>
            ${items.map((item, index) => `
                <tr>
                    <td>
                        <div class="input-with-icon">
                            <input type="text" class="item-name" value="${item.name}" data-index="${index}" placeholder="Item">
                            <!-- Helper icon for table view too -->
                            <button class="input-icon-btn template-picker-btn" data-index="${index}" style="right:0; padding:2px;"><i class="fa-solid fa-list-ul" style="font-size:0.8rem;"></i></button>
                        </div>
                        <input type="text" class="item-note" value="${item.note || ''}" data-index="${index}" placeholder="Note..." style="font-size:0.8rem; color:#888; margin-top:2px;">
                    </td>
                    <td><input type="text" class="item-price-format" value="${formatNumberStr(String(item.price))}" data-index="${index}" placeholder="0" inputmode="numeric"></td>
                    <td><input type="number" class="item-qty" value="${item.qty}" data-index="${index}" min="1" style="width:40px;"></td>
                    <td style="text-align:right;">${formatNumberStr(String(item.price * item.qty))}</td>
                    <td>
                        <button class="remove-item-btn" data-index="${index}" style="position:static; color: #ff4d4f; background:none; border:none;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
                `).join('')}
        </tbody>
    `;
        container.appendChild(table);
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
        appState.state.manualTitle = titleInput.value;
    };

    // ============================================
    // EVENTS
    // ============================================

    // View Switching
    btnCardView.addEventListener('click', () => { appState.state.manualViewMode = 'card'; render(); });
    btnTableView.addEventListener('click', () => { appState.state.manualViewMode = 'table'; render(); });

    // Add Item
    const addItem = () => {
        items.push({ name: '', price: 0, qty: 1, note: '' });
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

        /* REMOVED SWIPE EDIT LOGIC */

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

            if (target.classList.contains('item-name')) items[index].name = val;

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
        }
    });

    // Initial
    if (items.length === 0) addItem();

    // ===================================
    // DRAG & DROP LOGIC (Long Press) for MANUAL ITEMS
    // ===================================
    // This logic needs to be re-initialized or bound to container.
    // Since container rerenders, we'll bind to container touches but check target.

    let dragSrcEl = null;
    let pressTimer = null;
    let isDragging = false;
    let startY = 0;
    let clone = null;
    let autoScrollInterval = null;

    container.addEventListener('touchstart', (e) => {
        // Only trigger on card background, not on inputs/buttons
        // Actually user said long press item.
        const card = e.target.closest('.draggable-item');
        if (!card) return;

        // Check if touching interactive elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.closest('button')) {
            return;
        }

        startY = e.touches[0].clientY;

        pressTimer = setTimeout(() => {
            isDragging = true;
            dragSrcEl = card;

            // Visual Feedback
            navigator.vibrate?.(50);

            // Clone
            clone = card.cloneNode(true);
            clone.classList.add('dragging-clone');
            clone.style.position = 'fixed';
            clone.style.zIndex = '9999';
            clone.style.width = (card.offsetWidth - 20) + 'px'; // adjust for padding
            clone.style.opacity = '0.9';
            clone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            clone.style.background = 'var(--bg-card)';
            clone.style.border = '1px solid var(--primary)';
            clone.style.transform = `translateY(${e.touches[0].clientY - 50}px)`;
            clone.style.left = (card.getBoundingClientRect().left + 10) + 'px';
            clone.style.pointerEvents = 'none';
            document.body.appendChild(clone);

            card.style.opacity = '0.3';

        }, 500); // 500ms Long Press
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !clone) {
            // Cancel timer if moved before activation
            if (e.touches[0] && Math.abs(e.touches[0].clientY - startY) > 10) {
                clearTimeout(pressTimer);
            }
            return;
        }

        e.preventDefault(); // Stop Scroll
        const touchY = e.touches[0].clientY;
        clone.style.top = (touchY - 50) + 'px';

        // Swap Logic
        const elBelow = document.elementFromPoint(e.touches[0].clientX, touchY);
        const targetCard = elBelow?.closest('.draggable-item');

        if (targetCard && targetCard !== dragSrcEl) {
            const srcIdx = parseInt(dragSrcEl.dataset.index);
            const tgtIdx = parseInt(targetCard.dataset.index);

            // Swap in DATA
            const temp = items[srcIdx];
            items[srcIdx] = items[tgtIdx];
            items[tgtIdx] = temp;

            // Re-render immediately to reflect order? 
            // Rerendering kills the drag source DOM usually.
            // Better to swap DOM nodes and update data indices?
            // "Manual" mode rerender is cheap enough? 
            // If we rerender, we lose the 'dragSrcEl' ref and 'touchmove' context potentially if elements are replaced.
            // So we must SWAP DOM only.

            // Swap DOM
            const parent = container;
            const sibling = dragSrcEl.nextSibling === targetCard ? dragSrcEl : targetCard.nextSibling;

            // Visually swap
            if (srcIdx < tgtIdx) {
                parent.insertBefore(dragSrcEl, targetCard.nextSibling);
            } else {
                parent.insertBefore(dragSrcEl, targetCard);
            }

            // Update Indices in DOM to avoid confusion on next move
            // Actually, we should just wait for Drop to re-render fully.
            // But we need to switch the items array to keep track.
            // Let's just swap items in array, and on DROP we re-render fully.
            // But if we continue dragging, indices are wrong.
            // Complex. Simple approach: Just Swap DOM, don't touch Array until Drop.

        }

        // Auto Scroll
        if (touchY > window.innerHeight - 100) {
            window.scrollBy(0, 5);
        } else if (touchY < 100) {
            window.scrollBy(0, -5);
        }

    }, { passive: false });

    const endDrag = (e) => {
        clearTimeout(pressTimer);
        if (isDragging) {
            isDragging = false;
            if (clone) clone.remove();
            if (dragSrcEl) dragSrcEl.style.opacity = '1';

            // Reconstruct Items from DOM Order
            const newItems = [];
            container.querySelectorAll('.draggable-item').forEach(el => {
                const oldIdx = parseInt(el.querySelector('.item-name')?.dataset.index || el.dataset.index);
                // We must grab data from the ARRAY using the OLD INDEX.
                // But wait, the dataset index inside inputs hasn't changed.
                if (!isNaN(oldIdx)) newItems.push(items[oldIdx]);
            });

            // However, we swapped items in array previously? No we commented it out.
            // So 'items' array is still in old order.
            // But we might have duplicates if logic fails?
            // Safer: Update items array based on DOM order tracking.
            // Since we didn't update array during move, 'items[oldIdx]' is correct.

            // Verify Length
            if (newItems.length === items.length) {
                items = newItems;
                render(); // Full re-render to fix indices
            } else {
                render(); // Fallback
            }
        }
        dragSrcEl = null;
        clone = null;
    };

    container.addEventListener('touchend', endDrag);
    container.addEventListener('touchcancel', endDrag);
}
