/**
 * Manual Mode Logic
 */
import { appState } from '../state.js';

export function initManualMode() {
    const container = document.getElementById('manual-items-container');
    const addBtn = document.getElementById('btn-add-item');
    const titleInput = document.getElementById('manual-title');

    let items = [];

    // Helper to format currency
    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Render a single item card
    const createItemCard = (item, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            
            <div class="input-group" style="margin-bottom: 8px;">
                <label><small>Barang</small></label>
                <input type="text" class="form-input item-name" value="${item.name}" data-index="${index}" placeholder="Nama Barang">
            </div>
            
            <div class="item-row">
                <div style="flex: 2;">
                    <label><small>Harga</small></label>
                    <input type="number" class="form-input item-price" value="${item.price}" data-index="${index}" placeholder="Rp 0">
                </div>
                <div style="flex: 1;">
                    <label><small>Pcs</small></label>
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
        return div;
    };

    // Render loop
    const render = () => {
        container.innerHTML = '';
        items.forEach((item, index) => {
            container.appendChild(createItemCard(item, index));
        });

        // Calculate Total
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        document.getElementById('grand-total').textContent = formatCurrency(total);

        // Update State
        appState.updateItems(items);
        appState.state.manualTitle = titleInput.value;
    };

    // Add new item
    const addItem = () => {
        items.push({ name: '', price: 0, qty: 1, note: '' });
        render();
    };

    // Event Delegation
    container.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);

        // Remove
        if (e.target.closest('.remove-item-btn')) {
            const btn = e.target.closest('.remove-item-btn');
            const idx = parseInt(btn.dataset.index);
            items.splice(idx, 1);
            render();
        }

        // Qty Buttons
        if (e.target.classList.contains('qty-btn')) {
            if (e.target.classList.contains('plus')) {
                items[index].qty++;
            } else {
                if (items[index].qty > 1) items[index].qty--;
            }
            render();
        }
    });

    container.addEventListener('input', (e) => {
        if (e.target.dataset.index !== undefined) {
            const index = parseInt(e.target.dataset.index);
            const val = e.target.value;

            if (e.target.classList.contains('item-name')) items[index].name = val;
            if (e.target.classList.contains('item-price')) items[index].price = parseInt(val) || 0;
            if (e.target.classList.contains('item-qty')) items[index].qty = parseInt(val) || 1;
            if (e.target.classList.contains('item-note')) items[index].note = val;

            // Only re-render if it affects totals (price/qty), otherwise just update value logic to avoid focus loss
            // Actually, for simplicity on mobile, let's just update the specific total display relative to this card
            // But to keep total sync, we update state.
            // Full render causes focus loss.

            const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            document.getElementById('grand-total').textContent = formatCurrency(total);

            // Update individual subtotal display without full re-render
            const card = e.target.closest('.item-card');
            const subtotalDisplay = card.querySelector('div[style*="text-align: right"]');
            if (subtotalDisplay) {
                subtotalDisplay.textContent = formatCurrency(items[index].price * items[index].qty);
            }

            appState.updateItems(items);
        }
    });

    addBtn.addEventListener('click', addItem);

    // Initial Item
    if (items.length === 0) addItem();

    // Listen for template selection to populate items
    document.addEventListener('template-selected', (e) => {
        items = JSON.parse(JSON.stringify(e.detail.items)); // Deep copy
        render();
    });

    // Listen for AI generation
    document.addEventListener('ai-generated', (e) => {
        titleInput.value = e.detail.title;
        items = JSON.parse(JSON.stringify(e.detail.items));
        render();
    });
}
