/**
 * History Mode Logic
 */
import { appState } from '../state.js';
import { printInvoicePDF } from '../pdf/generator.js';

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

            const swipeContainer = document.createElement('div');
            swipeContainer.className = 'item-swipe-container';
            swipeContainer.style.cssText = 'position:relative; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:8px;';

            const timeClass = getTimeClass(entry.timestamp);

            swipeContainer.innerHTML = `
                <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                    <button class="swipe-btn history-edit-btn" data-index="${realIndex}" style="background-color:#F5A623; border:none; color:white; padding:0 18px; cursor:pointer; font-size:1rem;"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="swipe-btn history-delete-btn" data-index="${realIndex}" style="background-color:#ff4d4f; border:none; color:white; padding:0 18px; cursor:pointer; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:1rem;"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="history-item ${timeClass} history-swipe-card" data-index="${realIndex}" style="position:relative; z-index:2; transition:transform 0.2s; cursor:pointer; background:var(--bg-card);">
                    <div class="history-info" style="pointer-events:none;">
                        <h4>${entry.title || 'Tanpa Judul'}</h4>
                        <p><small>${entry.date} | ${entry.items.length} Item</small></p>
                    </div>
                    <div class="history-actions">
                        <button class="icon-btn btn-download" data-index="${realIndex}" title="Download PDF">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(swipeContainer);
        });

        // Init swipe for all cards
        initHistorySwipe();
    };

    render(appState.state.history);
    appState.subscribe('history', (data) => render(data));

    // ===================================
    // SWIPE LOGIC FOR HISTORY ITEMS
    // ===================================
    let touchStartX = 0;
    let activeHistoryCard = null;

    const initHistorySwipe = () => {
        container.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.history-swipe-card');
            if (!card) return;
            touchStartX = e.touches[0].clientX;
            activeHistoryCard = card;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!activeHistoryCard) return;
            const diff = e.touches[0].clientX - touchStartX;
            if (diff < 0 && diff > -150) {
                activeHistoryCard.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!activeHistoryCard) return;
            const diff = e.changedTouches[0].clientX - touchStartX;
            activeHistoryCard.style.transform = '';
            if (diff < -80) {
                // Close any other open cards
                container.querySelectorAll('.history-swipe-card.swiped-left').forEach(c => {
                    if (c !== activeHistoryCard) c.classList.remove('swiped-left');
                });
                activeHistoryCard.classList.add('swiped-left');
            } else if (diff > 50) {
                activeHistoryCard.classList.remove('swiped-left');
            }
            activeHistoryCard = null;
        });
    };

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
            printInvoicePDF(entry.items, entry.title);
            return;
        }

        // Swipe Delete
        const deleteBtn = e.target.closest('.history-delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const index = parseInt(deleteBtn.dataset.index);
            if (confirm('Hapus riwayat ini?')) {
                appState.state.history.splice(index, 1);
                appState.save('bme_history', appState.state.history);
                appState.notify('history', appState.state.history);
            }
            return;
        }

        // Swipe Edit (rename title)
        const editBtn = e.target.closest('.history-edit-btn');
        if (editBtn) {
            e.stopPropagation();
            const index = parseInt(editBtn.dataset.index);
            const entry = appState.state.history[index];
            const newTitle = prompt('Edit judul riwayat:', entry.title || '');
            if (newTitle !== null) {
                entry.title = newTitle.trim() || entry.title;
                appState.save('bme_history', appState.state.history);
                appState.notify('history', appState.state.history);
            }
            return;
        }

        // Handle Item Click (Detail)
        const itemEl = e.target.closest('.history-swipe-card');
        if (itemEl) {
            const index = itemEl.dataset.index;
            openDetail(index);
        }
    });
}
