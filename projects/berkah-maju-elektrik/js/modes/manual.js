/**
 * Manual Mode Logic
 */
import { appState } from '../state.js';

// Helper to format currency
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
                        <input type="number" class="form-input item-price" value="${item.price}" data-index="${index}" placeholder="Rp 0">
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
                    <input type="text" class="form-input item-note" value="${item.note || ''}" data-index="${index}" placeholder="Catatan (opsional)">
                </div>
                
                <div style="text-align: right; margin-top: 8px; font-weight: 600; color: var(--primary);">
                    ${formatCurrency(item.price * item.qty)}
                </div>
            `;
            container.appendChild(div);
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
                    <th style="width: 35%;">Barang</th>
                    <th style="width: 25%;">Harga</th>
                    <th style="width: 15%;">Pcs</th>
                    <th style="width: 20%;">Note</th>
                    <th style="width: 5%;"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, index) => `
                <tr>
                    <td>
                        <div class="input-with-icon">
                            <input type="text" class="item-name" value="${item.name}" data-index="${index}" placeholder="Item">
                            <button class="input-icon-btn template-picker-btn" data-index="${index}" style="right:0;"><i class="fa-solid fa-list-ul"></i></button>
                        </div>
                    </td>
                    <td><input type="number" class="item-price" value="${item.price}" data-index="${index}" placeholder="0"></td>
                    <td><input type="number" class="item-qty" value="${item.qty}" data-index="${index}" min="1"></td>
                    <td><input type="text" class="item-note" value="${item.note || ''}" data-index="${index}" placeholder="..."></td>
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
    btnCardView.addEventListener('click', () => {
        appState.state.manualViewMode = 'card';
        render();
    });

    btnTableView.addEventListener('click', () => {
        appState.state.manualViewMode = 'table';
        render();
    });

    // Add Item
    const addItem = () => {
        items.push({ name: '', price: 0, qty: 1, note: '' });
        render();
    };
    addBtn.addEventListener('click', addItem);

    // Container Interactions (Delegation)
    container.addEventListener('click', (e) => {
        const target = e.target; // Clicked element

        // Remove
        const removeBtn = target.closest('.remove-item-btn');
        if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.index);
            items.splice(idx, 1);
            render();
            return;
        }

        // Template Picker
        const pickerBtn = target.closest('.template-picker-btn');
        if (pickerBtn) {
            const idx = parseInt(pickerBtn.dataset.index);

            // Dispatch event to open enhanced picker
            const event = new CustomEvent('request-item-picker', {
                detail: {
                    callback: (templateItem) => {
                        // Update item fields
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
            if (target.classList.contains('item-price')) items[index].price = parseInt(val) || 0;
            if (target.classList.contains('item-qty')) items[index].qty = parseInt(val) || 1;
            if (target.classList.contains('item-note')) items[index].note = val;

            // Recalc Total
            const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            document.getElementById('grand-total').textContent = formatCurrency(total);

            // If in Card View, update subtotal
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

    // External Event Listeners
    document.addEventListener('template-selected', (e) => {
        // Full template load
        items = JSON.parse(JSON.stringify(e.detail.items));
        render();
    });

    document.addEventListener('ai-generated', (e) => {
        titleInput.value = e.detail.title;
        items = JSON.parse(JSON.stringify(e.detail.items));
        render();
    });

    // Initial
    if (items.length === 0) addItem(); // Ensure one item
}
