/**
 * History Mode Logic with Search, Multi-Select, Swipe, and Detail Preview
 */
import { appState } from '../state.js';
import { printInvoicePDF, buildInvoiceHTML, buildSuratJalanHTML, openPreviewModal } from '../pdf/generator.js';
import { exportToPNG, exportToJPEG, exportBothDocuments } from '../pdf/imageExporter.js';
export function initHistoryMode() {
    const container = document.getElementById('history-list');
    const searchInput = document.getElementById('history-search');
    const btnMultiSelect = document.getElementById('btn-multi-select');
    const batchDeleteBar = document.getElementById('batch-delete-bar');
    const batchCount = document.getElementById('batch-count');
    const btnBatchDelete = document.getElementById('btn-batch-delete');

    // Bottom Sheet Elements
    const detailSheet = document.getElementById('detail-sheet');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    const btnCloseDetail = document.querySelector('.close-detail');

    // View Toggles in Sheet
    const btnFormView = document.getElementById('detail-form-view');
    const btnTableView = document.getElementById('detail-table-view');

    let currentDetailItem = null;
    let detailViewMode = 'form';

    // Multi-select state
    let isMultiSelectMode = false;
    let selectedIndices = new Set();

    // Swipe state
    let touchStartX = 0;
    let activeSwipeCard = null;
    let swipeInitialized = false;

    // Search state
    let searchQuery = '';

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
            updateBatchBar();
            return;
        }

        const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

        // Apply search filter
        const filtered = searchQuery
            ? sortedHistory.filter(e =>
                (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.date || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
            : sortedHistory;

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Tidak ditemukan.</div>';
            return;
        }

        filtered.forEach((entry) => {
            const realIndex = appState.state.history.findIndex(h => h.id === entry.id || h.timestamp === entry.timestamp);
            const timeClass = getTimeClass(entry.timestamp);

            // Swipe container wrapping each history item
            const swipeContainer = document.createElement('div');
            swipeContainer.className = 'item-swipe-container';
            swipeContainer.style.cssText = 'position:relative; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:8px;';

            const checkboxHTML = isMultiSelectMode
                ? `<input type="checkbox" class="history-checkbox" data-index="${realIndex}" ${selectedIndices.has(realIndex) ? 'checked' : ''} style="margin-right:10px;">`
                : '';

            swipeContainer.innerHTML = `
                <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                    <button class="swipe-btn swipe-edit-history" data-index="${realIndex}" style="background-color:#F5A623; border:none; color:white; padding:0 20px; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="swipe-btn swipe-delete-history" data-index="${realIndex}" style="background-color:#ff4d4f; border:none; color:white; padding:0 20px; cursor:pointer; border-radius:0 var(--radius-sm) var(--radius-sm) 0;"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="history-item ${timeClass}" data-index="${realIndex}" style="cursor:pointer; transition:transform 0.2s; position:relative; z-index:2; background:var(--bg-card); display:flex; align-items:center;">
                    ${checkboxHTML}
                    <div class="history-info" style="flex:1; pointer-events:none;">
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

        if (!isMultiSelectMode) {
            initHistorySwipe();
        }
        updateBatchBar();
    };

    render(appState.state.history);
    appState.subscribe('history', (data) => render(data));

    // ===================================
    // SEARCH
    // ===================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            render(appState.state.history);
        });
    }

    // ===================================
    // MULTI-SELECT
    // ===================================
    const toggleMultiSelect = () => {
        isMultiSelectMode = !isMultiSelectMode;
        selectedIndices.clear();
        if (isMultiSelectMode) {
            btnMultiSelect.style.color = '#F5A623';
        } else {
            btnMultiSelect.style.color = '';
        }
        render(appState.state.history);
    };

    function updateBatchBar() {
        if (isMultiSelectMode && selectedIndices.size > 0) {
            batchDeleteBar.classList.remove('hidden');
            batchCount.textContent = `${selectedIndices.size} dipilih`;
        } else {
            batchDeleteBar.classList.add('hidden');
        }
    }

    if (btnMultiSelect) {
        btnMultiSelect.addEventListener('click', toggleMultiSelect);
    }

    if (btnBatchDelete) {
        btnBatchDelete.addEventListener('click', () => {
            if (selectedIndices.size === 0) return;
            if (!confirm(`Hapus ${selectedIndices.size} riwayat?`)) return;
            appState.removeMultipleFromHistory([...selectedIndices]);
            selectedIndices.clear();
            isMultiSelectMode = false;
            btnMultiSelect.style.color = '';
        });
    }

    // Handle checkbox clicks via delegation
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('history-checkbox')) {
            const idx = parseInt(e.target.dataset.index);
            if (e.target.checked) {
                selectedIndices.add(idx);
            } else {
                selectedIndices.delete(idx);
            }
            updateBatchBar();
        }
    });

    // ===================================
    // SWIPE LOGIC
    // ===================================
    function initHistorySwipe() {
        if (swipeInitialized) return;
        swipeInitialized = true;

        container.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.history-item');
            if (!card) return;
            if (e.target.closest('button') || e.target.closest('input')) return;
            touchStartX = e.touches[0].clientX;
            activeSwipeCard = card;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!activeSwipeCard) return;
            const touchCurrentX = e.touches[0].clientX;
            const diff = touchCurrentX - touchStartX;
            if (diff < 0 && diff > -150) {
                activeSwipeCard.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            if (!activeSwipeCard) return;
            const transform = activeSwipeCard.style.transform;
            const match = transform.match(/translateX\((-?\d+)/);
            const diff = match ? parseInt(match[1]) : 0;
            activeSwipeCard.style.transform = '';

            if (diff < -80) {
                const openCards = container.querySelectorAll('.history-item.swiped-left');
                openCards.forEach(c => {
                    if (c !== activeSwipeCard) c.classList.remove('swiped-left');
                });
                activeSwipeCard.classList.add('swiped-left');
            } else {
                activeSwipeCard.classList.remove('swiped-left');
            }
            activeSwipeCard = null;
        });
    }

    // ===================================
    // DETAIL VIEW LOGIC
    // ===================================
    const renderDetailContent = () => {
        if (!currentDetailItem) return;
        const items = currentDetailItem.items;
        const title = currentDetailItem.title;

        detailContent.innerHTML = '';

        // Inject "Edit Back in Manual" Button into Header
        let btnEdit = document.getElementById('btn-detail-edit');
        if (btnEdit) {
            btnEdit.remove();
        }

        btnEdit = document.createElement('button');
        btnEdit.id = 'btn-detail-edit';
        btnEdit.className = 'icon-btn';
        btnEdit.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
        btnEdit.style.marginRight = '10px';
        btnEdit.style.color = '#F5A623';
        btnEdit.title = "Buka di Mode Manual";

        btnCloseDetail.parentNode.insertBefore(btnEdit, btnCloseDetail);

        btnEdit.addEventListener('click', () => {
            if (!currentDetailItem) return;

            const confirmModal = document.getElementById('history-to-manual-confirm');
            if (!confirmModal) return;

            confirmModal.classList.remove('hidden');
            confirmModal.classList.add('active');

            const btnCancel = document.getElementById('btn-history-confirm-cancel');
            const btnProceed = document.getElementById('btn-history-confirm-proceed');

            const cleanup = () => {
                confirmModal.classList.add('hidden');
                confirmModal.classList.remove('active');
            };

            const onCancel = () => { cleanup(); };
            const onProceed = () => {
                cleanup();

                const clonedItems = JSON.parse(JSON.stringify(currentDetailItem.items));
                const historyTitle = currentDetailItem.title;

                // Dispatch template-selected so manual.js re-renders items
                document.dispatchEvent(new CustomEvent('template-selected', {
                    detail: { items: clonedItems }
                }));

                // Update title
                const manualTitle = document.getElementById('manual-title');
                if (manualTitle) {
                    manualTitle.value = historyTitle;
                    manualTitle.dispatchEvent(new Event('input'));
                }

                // Switch tab to Manual Mode
                const tabManual = document.querySelector('[data-tab="manual"]');
                if (tabManual) tabManual.click();

                closeDetail();
            };

            btnCancel.addEventListener('click', onCancel, { once: true });
            btnProceed.addEventListener('click', onProceed, { once: true });
        });

        // Render data content (form or table)
        if (detailViewMode === 'table') {
            const table = document.createElement('table');
            table.className = 'item-table';
            table.innerHTML = `
                <thead>
                    <tr><th>Barang</th><th>Harga</th><th>Pcs</th><th>Note</th></tr>
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
                div.style.marginBottom = '10px';
                div.style.borderTop = '1px solid var(--border-color)';
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

        // ===================================
        // PREVIEW RENDERING (Invoice + Surat Jalan) — compact preview-cards style
        // ===================================
        let invoiceHTML = '';
        let suratJalanHTML = '';
        try {
            invoiceHTML = buildInvoiceHTML(items, title);
            suratJalanHTML = buildSuratJalanHTML(items);
        } catch (err) {
            console.warn('Could not build preview HTML in detail:', err);
        }

        const previewSection = document.createElement('div');
        previewSection.style.cssText = 'margin-top:16px; border-top:1px solid var(--border-color); padding-top:16px;';

        const previewHeader = document.createElement('h4');
        previewHeader.textContent = 'Preview';
        previewHeader.style.cssText = 'margin-bottom:10px; font-size:0.9rem; color:var(--text-muted);';
        previewSection.appendChild(previewHeader);

        const cardsRow = document.createElement('div');
        cardsRow.style.cssText = 'display:flex; gap:12px; margin-bottom:12px;';
        previewSection.appendChild(cardsRow);

        detailContent.appendChild(previewSection);

        // Build a self-contained preview card with explicit inline sizing
        const buildPreviewCard = (htmlStr, bgColor) => {
            // Outer card — aspect-ratio A4, clips overflow
            const card = document.createElement('div');
            card.style.cssText = `
                flex:1; position:relative; border-radius:var(--radius-sm);
                border:1px solid var(--border-color); overflow:hidden;
                background:${bgColor}; aspect-ratio:1/1.414;
            `;

            if (htmlStr) {
                // Inner frame-wrap: will be sized explicitly once we know the card width
                const frameWrap = document.createElement('div');
                frameWrap.style.cssText = 'position:absolute; top:0; left:0; width:100%; overflow:hidden;';
                card.appendChild(frameWrap);

                const iframe = document.createElement('iframe');
                iframe.style.cssText = 'border:0; pointer-events:none; display:block; width:794px; height:1123px; transform-origin:top left;';
                iframe.srcdoc = htmlStr;
                frameWrap.appendChild(iframe);

                // After modal finishes its 300ms open animation, measure and scale
                // Pass cardsRow reference so we have a fallback width source
                setTimeout(() => {
                    const availW = card.offsetWidth || cardsRow.offsetWidth / 2 || 150;
                    const scale = availW / 794;
                    iframe.style.transform = `scale(${scale})`;
                }, 400);
            }

            return card;
        };

        const invoiceCard = buildPreviewCard(invoiceHTML, 'var(--invoice-bg, #f0f4ff)');
        const suratCard = buildPreviewCard(suratJalanHTML, 'var(--letter-bg, #f0fff4)');

        // Add Preview buttons
        const makePreviewBtn = (type) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline';
            btn.textContent = 'Preview';
            btn.style.cssText = 'position:absolute; right:8px; bottom:8px; padding:5px 10px; font-size:0.78rem; z-index:2;';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const html = type === 'invoice' ? invoiceHTML : suratJalanHTML;
                const label = type === 'invoice' ? 'Preview Invoice' : 'Preview Surat Jalan';

                const editAction = () => {
                    if (confirm('Buka riwayat ini di Mode Manual untuk diedit?')) {
                        // Populate state
                        appState.state.invoiceItems = JSON.parse(JSON.stringify(items));
                        const manualTitle = document.getElementById('manual-title');
                        if (manualTitle) manualTitle.value = title;
                        appState.save('bme_invoice_items', appState.state.invoiceItems);

                        // Close preview modal
                        const previewModal = document.getElementById('preview-modal');
                        if (previewModal) {
                            previewModal.classList.add('hidden');
                            previewModal.classList.remove('active');
                        }
                        closeDetail(); // Close detail sheet

                        // Switch tab to Manual Mode
                        const tabManual = document.querySelector('[data-tab="manual"]');
                        if (tabManual) tabManual.click();
                    }
                };

                openPreviewModal(html, label, type, async () => {
                    const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
                    const formats = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };
                    const template = type === 'surat' ? formats.suratJalan : formats.invoice;

                    const now = new Date();
                    const filename = template
                        .replace(/\{judul\}/gi, title)
                        .replace(/%YYYY/g, String(now.getFullYear()))
                        .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
                        .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
                        .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
                        .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
                        .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));

                    if (defaultMethod === 'pdf') {
                        printInvoicePDF(items, title);
                    } else {
                        const alertEl = document.getElementById('custom-alert');
                        const messageEl = document.getElementById('alert-message');
                        if (alertEl && messageEl) {
                            messageEl.innerHTML = 'Mengekspor... <i class="fa-solid fa-spinner fa-spin"></i>';
                            alertEl.classList.remove('hidden');
                            alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
                        }
                        if (defaultMethod === 'jpeg') {
                            await exportToJPEG(html, filename);
                        } else {
                            await exportToPNG(html, filename);
                        }
                        if (alertEl) alertEl.classList.add('hidden');
                    }
                }, editAction, true);
            });
            return btn;
        };

        invoiceCard.appendChild(makePreviewBtn('invoice'));
        suratCard.appendChild(makePreviewBtn('surat'));
        cardsRow.appendChild(invoiceCard);
        cardsRow.appendChild(suratCard);
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

    // Header buttons in Detail Sheet
    const btnDetailDownloadMode = document.getElementById('btn-detail-download-mode');
    if (btnDetailDownloadMode) {
        btnDetailDownloadMode.addEventListener('click', () => {
            if (!currentDetailItem) return;
            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
            if (defaultMethod === 'pdf') {
                printInvoicePDF(currentDetailItem.items, currentDetailItem.title);
            } else {
                exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, currentDetailItem.items, currentDetailItem.title, defaultMethod);
            }
        });
    }

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
        // Download button
        const btnDownloadEl = e.target.closest('.btn-download');
        if (btnDownloadEl) {
            e.stopPropagation();
            const index = btnDownloadEl.dataset.index;
            const entry = appState.state.history[index];

            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
            if (defaultMethod === 'pdf') {
                printInvoicePDF(entry.items, entry.title);
            } else {
                // For main list download button, we download BOTH
                exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, entry.items, entry.title, defaultMethod);
            }
            return;
        }

        // Swipe Delete
        const deleteBtn = e.target.closest('.swipe-delete-history');
        if (deleteBtn) {
            e.stopPropagation();
            const idx = parseInt(deleteBtn.dataset.index);
            if (confirm('Hapus riwayat ini?')) {
                appState.removeFromHistory(idx);
            }
            return;
        }

        // Swipe Edit (move to manual mode)
        const editBtn = e.target.closest('.swipe-edit-history');
        if (editBtn) {
            e.stopPropagation();
            const idx = parseInt(editBtn.dataset.index);
            const entry = appState.state.history[idx];
            if (!entry) return;
            if (!confirm("Pindah ke Mode Manual untuk mengedit?")) return;

            document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: entry.items } }));
            const manualTitle = document.getElementById('manual-title');
            if (manualTitle) {
                manualTitle.value = entry.title || '';
                appState.updateManualTitle(entry.title || '');
            }
            document.querySelector('[data-tab="manual"]').click();
            return;
        }

        // Handle Item Click (Detail) — only if not in multi-select mode
        const itemEl = e.target.closest('.history-item');
        if (itemEl && !itemEl.classList.contains('swiped-left') && !isMultiSelectMode) {
            const index = itemEl.dataset.index;
            openDetail(index);
        }
    });
}
