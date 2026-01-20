/**
 * History Mode Logic
 */
import { appState } from '../state.js';
import { generatePDFs } from '../pdf/generator.js';

export function initHistoryMode() {
    const container = document.getElementById('history-list');

    // Bottom Sheet Elements
    const detailSheet = document.getElementById('detail-sheet');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    const btnCloseDetail = document.querySelector('.close-detail');

    // View Toggles in Sheet
    const btnFormView = document.getElementById('detail-form-view');
    const btnTableView = document.getElementById('detail-table-view');

    let currentDetailItem = null;
    let detailViewMode = 'form'; // 'form' | 'table'

    // ===================================
    // TIME HELPERS
    // ===================================
    const getTimeClass = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const itemDate = new Date(timestamp);
        const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'history-today';
        if (diffDays === 1) return 'history-yesterday';
        if (diffDays <= 7) return 'history-week';
        if (diffDays <= 30) return 'history-month';
        return 'history-year';
    };

    // ===================================
    // RENDER LIST
    // ===================================
    const render = (history) => {
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Belum ada riwayat.</div>';
            return;
        }

        const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

        sortedHistory.forEach((entry, index) => {
            const realIndex = appState.state.history.findIndex(h => h.id === entry.id || h.timestamp === entry.timestamp);

            const div = document.createElement('div');
            const timeClass = getTimeClass(entry.timestamp);

            div.className = `history-item ${timeClass}`;
            div.style.cursor = 'pointer';
            div.dataset.index = realIndex;

            div.innerHTML = `
                <div class="history-info" style="pointer-events:none;">
                    <h4>${entry.title || 'Tanpa Judul'}</h4>
                    <p><small>${entry.date} | ${entry.items.length} Item</small></p>
                </div>
                <div class="history-actions">
                    <!-- FIX 33b: Move to Manual Button -->
                    <button class="icon-btn btn-move-manual" data-index="${realIndex}" title="Edit/Pindah ke Manual" style="color:#F5A623;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn btn-download" data-index="${realIndex}" title="Download PDF">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    };

    render(appState.state.history);
    appState.subscribe('history', (data) => render(data));

    // ===================================
    // DETAIL VIEW LOGIC
    // ===================================
    const renderDetailContent = () => {
        if (!currentDetailItem) return;
        const items = currentDetailItem.items;

        detailContent.innerHTML = '';

        // Inject "Edit Back in Manual" Button into Header
        let btnEdit = document.getElementById('btn-detail-edit');
        if (!btnEdit) {
            btnEdit = document.createElement('button');
            btnEdit.id = 'btn-detail-edit';
            btnEdit.className = 'icon-btn';
            btnEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
            btnEdit.style.marginRight = '10px';
            btnEdit.style.color = '#F5A623'; // Orange
            btnEdit.title = "Edit di Mode Manual/Pindah ke Manual";

            // Insert before close button
            btnCloseDetail.parentNode.insertBefore(btnEdit, btnCloseDetail);

            btnEdit.addEventListener('click', () => {
                if (!currentDetailItem) return;

                // Confirm Overwrite?
                if (!confirm("Pindah ke Mode Manual untuk mengedit? Data yang sedang aktif di Manual (jika ada) akan digantikan.")) return;

                // Restore logic
                document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: currentDetailItem.items } }));

                // Use explicit DOM manipulation for Title as event only passes items usually
                const manualTitle = document.getElementById('manual-title');
                if (manualTitle) manualTitle.value = currentDetailItem.title;

                // Update State Manual Title
                // Switch to Manual
                document.querySelector('[data-tab="manual"]').click();

                closeDetail();
            });
        }

        // Render content
        if (detailViewMode === 'table') {
            const table = document.createElement('table');
            table.className = 'item-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Barang</th>
                        <th>Harga</th>
                        <th>Pcs</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${new Intl.NumberFormat('id-ID').format(item.price)}</td>
                        <td>${item.qty}</td>
                        <td>${item.note || '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            `;
            const div = document.createElement('div');
            div.className = 'table-view-container';
            div.appendChild(table);
            detailContent.appendChild(div);
        } else {
            // Form View - INLINE EDITING (Fix 33a)
            items.forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'item-card';
                div.style.padding = '10px';

                // Editable Fields
                div.innerHTML = `
                    <div style="margin-bottom:4px; display:flex; gap:5px;">
                       <input type="text" class="form-input hist-edit-name" data-idx="${i}" value="${item.name}" style="font-weight:600; flex:2;">
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div style="display:flex; align-items:center;">
                            <input type="number" class="form-input hist-edit-qty" data-idx="${i}" value="${item.qty}" style="width:50px; text-align:center;">
                            <span style="margin-left:5px; font-size:0.9rem;">pcs</span>
                        </div>
                        <span style="color:var(--text-muted);">x</span>
                        <div style="flex:1;">
                            <input type="number" class="form-input hist-edit-price" data-idx="${i}" value="${item.price}">
                        </div>
                    </div>
                    <div style="margin-top:5px;">
                         <input type="text" class="form-input hist-edit-note" data-idx="${i}" value="${item.note || ''}" placeholder="Catatan (opsional)" style="font-size:0.85rem;">
                    </div>
                `;
                detailContent.appendChild(div);
            });

            // Add "Save Changes" Button for Inline Edits
            const btnSave = document.createElement('button');
            btnSave.className = 'btn btn-primary btn-full';
            btnSave.style.marginTop = '15px';
            btnSave.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Perubahan';
            btnSave.onclick = () => {
                const names = detailContent.querySelectorAll('.hist-edit-name');
                const qtys = detailContent.querySelectorAll('.hist-edit-qty');
                const prices = detailContent.querySelectorAll('.hist-edit-price');
                const notes = detailContent.querySelectorAll('.hist-edit-note');

                const newItems = [];
                names.forEach((el, i) => {
                    newItems.push({
                        name: el.value,
                        qty: parseInt(qtys[i].value) || 0,
                        price: parseInt(prices[i].value) || 0,
                        note: notes[i].value
                    });
                });

                // Update State
                if (confirm("Simpan perubahan pada riwayat ini?")) {
                    currentDetailItem.items = newItems;
                    // Find and update in main array
                    const realIdx = appState.state.history.findIndex(h => h.id === currentDetailItem.id);
                    if (realIdx !== -1) {
                        appState.state.history[realIdx] = currentDetailItem;
                        appState.save('bme_history', appState.state.history);
                        render(appState.state.history); // Refresh list
                        alert("Perubahan disimpan.");
                    }
                }
            };
            detailContent.appendChild(btnSave);
        }
    };

    const openDetail = (index) => {
        currentDetailItem = appState.state.history[index];
        detailTitle.textContent = currentDetailItem.title || "Detail Invoice";
        detailSheet.classList.add('active');
        renderDetailContent();
    };

    const closeDetail = () => {
        detailSheet.classList.remove('active');
        currentDetailItem = null;

        // Remove edit button to clean up
        const btnEdit = document.getElementById('btn-detail-edit');
        if (btnEdit) btnEdit.remove();
    };

    // Toggle Handlers
    btnFormView.addEventListener('click', () => {
        detailViewMode = 'form';
        btnFormView.classList.add('active');
        btnTableView.classList.remove('active');
        renderDetailContent();
    });

    btnTableView.addEventListener('click', () => {
        detailViewMode = 'table';
        btnTableView.classList.add('active');
        btnFormView.classList.remove('active');
        renderDetailContent();
    });

    btnCloseDetail.addEventListener('click', closeDetail);

    // ===================================
    // EVENTS
    // ===================================
    container.addEventListener('click', (e) => {
        const btnDownload = e.target.closest('.btn-download');
        if (btnDownload) {
            e.stopPropagation();
            const index = btnDownload.dataset.index;
            const entry = appState.state.history[index];
            generatePDFs(entry.items, entry.title);
            return;
        }

        // Handle Move to Manual (Main Card)
        const btnMove = e.target.closest('.btn-move-manual');
        if (btnMove) {
            e.stopPropagation();
            if (!confirm("Pindah ke Mode Manual? Data saat ini akan diganti.")) return;

            const index = btnMove.dataset.index;
            const entry = appState.state.history[index];

            document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: entry.items } }));
            const manualTitle = document.getElementById('manual-title');
            if (manualTitle) manualTitle.value = entry.title || "";

            document.querySelector('[data-tab="manual"]').click();
            return;
        }

        // Handle Item Click (Detail)
        const itemEl = e.target.closest('.history-item');
        if (itemEl) {
            const index = itemEl.dataset.index;
            openDetail(index);
        }
    });
}
