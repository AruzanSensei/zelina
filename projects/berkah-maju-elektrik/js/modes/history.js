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
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'item-card';
                div.style.padding = '10px';
                div.innerHTML = `
                    <div style="font-weight:600; margin-bottom:4px;">${item.name}</div>
                    <div style="display:flex; gap:10px; font-size:0.9rem; color:var(--text-muted);">
                        <span>${item.qty} pcs</span>
                        <span>x</span>
                        <span>${new Intl.NumberFormat('id-ID').format(item.price)}</span>
                    </div>
                    ${item.note ? `<div style="font-size:0.85rem; margin-top:4px; font-style:italic;">"${item.note}"</div>` : ''}
                `;
                detailContent.appendChild(div);
            });
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

        // Handle Item Click (Detail)
        const itemEl = e.target.closest('.history-item');
        if (itemEl) {
            const index = itemEl.dataset.index;
            openDetail(index);
        }
    });
}
