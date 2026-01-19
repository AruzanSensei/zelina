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
    // RENDER LIST
    // ===================================
    const render = (history) => {
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Belum ada riwayat.</div>';
            return;
        }

        history.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.cursor = 'pointer'; // Indicate clickable
            div.dataset.index = index;
            div.innerHTML = `
                <div class="history-info" style="pointer-events:none;">
                    <h4>${entry.title || 'Tanpa Judul'}</h4>
                    <p><small>${entry.date} | ${entry.items.length} Item</small></p>
                </div>
                <div class="history-actions">
                    <button class="icon-btn btn-copy" data-index="${index}" title="Edit / Copy">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button class="icon-btn btn-download" data-index="${index}" title="Download PDF">
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

        if (detailViewMode === 'table') {
            // Table View
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
            // Form View (Read Only Cards)
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
        // Handle Buttons first
        const btnCopy = e.target.closest('.btn-copy');
        const btnDownload = e.target.closest('.btn-download');

        if (btnCopy) {
            e.stopPropagation();
            const index = btnCopy.dataset.index;
            const entry = appState.state.history[index];
            document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: entry.items } }));
            document.getElementById('manual-title').value = entry.title;
            document.querySelector('[data-tab="manual"]').click();
            return;
        }

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
