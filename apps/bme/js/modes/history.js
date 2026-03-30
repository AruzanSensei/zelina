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
    let longPressInitialized = false;

    // Search state
    let searchQuery = '';

    // Click timer to prevent click/dblclick conflict
    let clickTimer = null;

    // Context menu state
    let contextActiveItem = null;
    let longPressTimer = null;
    let longPressTriggered = false;

    // ===================================
    // DATA AGE HELPERS
    // ===================================
    const getDataAge = (timestamp) => {
        if (!timestamp) return { label: '', cls: '' };
        const now = new Date();
        const itemDate = new Date(timestamp);
        // Compare calendar days, not just 24h
        const nowDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        const diffDays = Math.round((nowDay - itemDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { label: 'Hari ini',  cls: 'age-today' };
        if (diffDays === 1) return { label: 'Kemarin',   cls: 'age-yesterday' };
        if (diffDays <= 7)  return { label: `${diffDays} hari lalu`,  cls: 'age-week' };
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return { label: weeks === 1 ? 'Minggu lalu' : `${weeks} minggu lalu`, cls: 'age-last-week' };
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return { label: months === 1 ? 'Bulan lalu' : `${months} bulan lalu`, cls: 'age-month' };
        }
        const years = Math.floor(diffDays / 365);
        return { label: years === 1 ? 'Tahun lalu' : `${years} tahun lalu`, cls: 'age-year' };
    };

    // ===================================
    // CONTEXT MENU DOM SETUP
    // ===================================
    let contextMenu = document.getElementById('bme-context-menu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'bme-context-menu';
        document.body.appendChild(contextMenu);
    }

    const showContextMenu = (x, y, entry, realIndex) => {
        // Build menu content
        contextMenu.innerHTML = `
            <button class="ctx-item" data-action="download">
                <i class="fa-solid fa-download"></i> Unduh
            </button>
            <button class="ctx-item" data-action="print">
                <i class="fa-solid fa-print"></i> Print
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item" data-action="preview">
                <i class="fa-solid fa-eye"></i> Pratinjau...
            </button>
            <button class="ctx-item orange" data-action="edit">
                <i class="fa-solid fa-pen-to-square"></i> Edit...
            </button>
            <button class="ctx-item" data-action="multiselect">
                <i class="fa-solid fa-check-double"></i> Pilih beberapa...
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item" data-action="rename">
                <i class="fa-solid fa-i-cursor"></i> Ubah nama
            </button>
            <button class="ctx-item danger" data-action="delete">
                <i class="fa-solid fa-trash"></i> Hapus
            </button>
        `;

        // Attach action handlers
        contextMenu.querySelectorAll('.ctx-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleContextAction(btn.dataset.action, entry, realIndex);
                closeContextMenu();
            });
        });

        // Position: show offscreen first to measure size
        contextMenu.style.left = '-9999px';
        contextMenu.style.top  = '-9999px';
        contextMenu.classList.add('visible');

        // Smart positioning (keep inside viewport)
        const SAFE = 10;
        const mw = contextMenu.offsetWidth  || 210;
        const mh = contextMenu.offsetHeight || 300;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = x;
        let top  = y;
        if (left + mw + SAFE > vw) left = vw - mw - SAFE;
        if (top  + mh + SAFE > vh) top  = vh - mh - SAFE;
        if (left < SAFE) left = SAFE;
        if (top  < SAFE) top  = SAFE;

        contextMenu.style.left = `${left}px`;
        contextMenu.style.top  = `${top}px`;
        contextMenu.style.transformOrigin = x > vw / 2 ? 'top right' : 'top left';
    };

    const closeContextMenu = () => {
        contextMenu.classList.remove('visible');
        // Remove active highlight
        if (contextActiveItem) {
            contextActiveItem.classList.remove('context-active');
            contextActiveItem = null;
        }
    };

    const handleContextAction = (action, entry, index) => {
        switch (action) {
            case 'preview':
                openDetail(index);
                break;

            case 'edit': {
                if (!confirm('Pindah ke Mode Manual untuk mengedit data ini?')) return;
                document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: JSON.parse(JSON.stringify(entry.items)) } }));
                const manualTitleEl = document.getElementById('manual-title');
                if (manualTitleEl) {
                    manualTitleEl.value = entry.title || '';
                    appState.updateManualTitle(entry.title || '');
                    manualTitleEl.dispatchEvent(new Event('input'));
                }
                document.querySelector('[data-tab="manual"]')?.click();
                break;
            }

            case 'multiselect':
                if (!isMultiSelectMode) toggleMultiSelect();
                // Pre-select this item
                selectedIndices.add(index);
                render(appState.state.history);
                break;

            case 'rename': {
                const newTitle = prompt('Ubah nama:', entry.title || '');
                if (newTitle !== null && newTitle.trim() !== '') {
                    appState.updateHistoryTitle(entry.id, newTitle.trim());
                }
                break;
            }

            case 'download': {
                const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';
                if (defaultMethod === 'pdf') {
                    printInvoicePDF(entry.items, entry.title);
                } else {
                    exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, entry.items, entry.title, defaultMethod);
                }
                break;
            }

            case 'print':
                printInvoicePDF(entry.items, entry.title);
                break;

            case 'delete':
                if (confirm('Hapus riwayat ini?')) {
                    appState.removeFromHistory(index);
                }
                break;
        }
    };

    // Close on outside click or scroll
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) closeContextMenu();
    }, true);
    document.addEventListener('scroll', closeContextMenu, true);

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

        filtered.forEach((entry, filteredIdx) => {
            const realIndex = appState.state.history.findIndex(h => h.id === entry.id || h.timestamp === entry.timestamp);
            const age = getDataAge(entry.timestamp);

            // Format total for display
            const total = (entry.items || []).reduce((s, i) => s + (i.price * i.qty), 0);
            const totalStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total);

            // Swipe container — flush, no gap, no radius
            const swipeContainer = document.createElement('div');
            swipeContainer.className = 'item-swipe-container';
            // Add top border for very first item to close the list visually
            const topBorder = filteredIdx === 0 ? 'border-top: 1px solid var(--border-color);' : '';
            swipeContainer.style.cssText = `position:relative; overflow:hidden; margin-bottom:0; ${topBorder}`;

            const checkboxHTML = isMultiSelectMode
                ? `<input type="checkbox" class="history-checkbox" data-index="${realIndex}" ${selectedIndices.has(realIndex) ? 'checked' : ''} style="margin-right:10px; margin-top:2px; flex-shrink:0;">`
                : '';

            swipeContainer.innerHTML = `
                <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                    <button class="swipe-btn swipe-edit-history" data-index="${realIndex}" style="background-color:#F5A623; border:none; color:white; padding:0 20px; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="swipe-btn swipe-delete-history" data-index="${realIndex}" style="background-color:#ff4d4f; border:none; color:white; padding:0 20px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="history-item" data-index="${realIndex}" style="cursor:pointer; transition:transform 0.2s; position:relative; z-index:2; background:var(--bg-card);">
                    <div style="display:flex; align-items:flex-start; gap:8px;">
                        ${checkboxHTML}
                        <div style="flex:1; min-width:0;">
                            <!-- Row 1: Title + Badge -->
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:3px;">
                                <h4 class="history-title-text" data-id="${entry.id}" style="margin:0; font-size:0.95rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;">${entry.title || 'Tanpa Judul'}</h4>
                                ${age.label ? `<span class="age-badge ${age.cls}" style="flex-shrink:0;">${age.label}</span>` : ''}
                            </div>
                            <!-- Row 2: Date + Price -->
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                                <span style="font-size:0.78rem; color:var(--text-muted);">${entry.date} | ${entry.items.length} Item</span>
                                <span style="font-weight:700; color:var(--primary); font-size:0.88rem; white-space:nowrap; flex-shrink:0;">${totalStr}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(swipeContainer);
        });

        if (!isMultiSelectMode) {
            initHistorySwipe();
        }
        updateBatchBar();
        initLongPress();
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
            // Cancel long-press if finger moves
            if (Math.abs(diff) > 8) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            if (diff < 0 && diff > -150) {
                activeSwipeCard.style.transform = `translateX(${diff}px)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
            longPressTimer = null;
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
    // LONG PRESS (Mobile Context Menu)
    // ===================================
    function initLongPress() {
        if (longPressInitialized) return;
        longPressInitialized = true;
        container.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.history-item');
            if (!card) return;
            if (e.target.closest('button') || e.target.closest('input')) return;

            const index = parseInt(card.dataset.index);
            const entry = appState.state.history[index];
            if (!entry) return;

            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                // Haptic feedback (if supported)
                if (navigator.vibrate) navigator.vibrate(30);

                closeContextMenu();
                contextActiveItem = card;
                card.classList.add('context-active');

                const touch = e.touches[0];
                showContextMenu(touch.clientX, touch.clientY, entry, index);
            }, 400);
        }, { passive: true });

        container.addEventListener('touchend', () => {
            if (!longPressTriggered) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
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

        // Per-card download buttons (orange, left of Preview)
        const makeDownloadBtn = (type) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.innerHTML = '<i class="fa-solid fa-download"></i>';
            btn.style.cssText = 'position:absolute; right:10px; bottom:8px; padding:7px 11px; font-size:0.78rem; z-index:2; background:#e67e22; border-color:#d35400; color:white;';
            btn.title = type === 'invoice' ? 'Unduh Invoice' : 'Unduh Surat Jalan';
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const html = type === 'invoice' ? invoiceHTML : suratJalanHTML;
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
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open();
                    w.document.write(html);
                    w.document.close();
                    w.document.title = title;
                    setTimeout(() => { w.focus(); w.print(); }, 300);
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
            });
            return btn;
        };

        // Adjust Preview button to not overlap with download button
        invoiceCard.querySelectorAll('.btn.btn-outline').forEach(b => { b.style.right = '52px'; });
        suratCard.querySelectorAll('.btn.btn-outline').forEach(b => { b.style.right = '52px'; });

        invoiceCard.appendChild(makeDownloadBtn('invoice'));
        suratCard.appendChild(makeDownloadBtn('surat'));
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
    // Right-click context menu (Desktop)
    container.addEventListener('contextmenu', (e) => {
        const card = e.target.closest('.history-item');
        if (!card) return;
        e.preventDefault();
        e.stopPropagation();

        const index = parseInt(card.dataset.index);
        const entry = appState.state.history[index];
        if (!entry) return;

        closeContextMenu();
        contextActiveItem = card;
        card.classList.add('context-active');
        showContextMenu(e.clientX, e.clientY, entry, index);
    });

    container.addEventListener('click', (e) => {
        // If long press was triggered, suppress click
        if (longPressTriggered) {
            longPressTriggered = false;
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

        // Double Click to Rename
        const titleEl = e.target.closest('.history-title-text');
        if (titleEl && e.type === 'dblclick') {
            e.stopPropagation();
            const originalTitle = titleEl.textContent;
            const itemId = parseInt(titleEl.dataset.id);

            const input = document.createElement('input');
            input.type = 'text';
            input.value = originalTitle === 'Tanpa Judul' ? '' : originalTitle;
            input.className = 'form-input';
            input.style.cssText = 'height:auto; padding:4px 8px; font-size:1rem; font-weight:600; width:100%; border-color:var(--primary);';

            const finishEdit = (save = true) => {
                const newTitle = input.value.trim();
                if (save && newTitle && newTitle !== originalTitle) {
                    appState.updateHistoryTitle(itemId, newTitle);
                } else {
                    titleEl.textContent = originalTitle;
                }
                input.remove();
                titleEl.style.display = 'block';
            };

            input.onkeydown = (ev) => {
                if (ev.key === 'Enter') finishEdit(true);
                if (ev.key === 'Escape') finishEdit(false);
            };

            input.onblur = () => finishEdit(true);

            titleEl.style.display = 'none';
            titleEl.parentNode.insertBefore(input, titleEl);
            input.focus();
            input.select();
            return;
        }

        // Handle Item Click (Detail) — only if not in multi-select mode
        const itemEl = e.target.closest('.history-item');
        if (itemEl && !itemEl.classList.contains('swiped-left') && !isMultiSelectMode) {
            const index = itemEl.dataset.index;
            
            // To prevent conflict with dblclick, we can check if it was a title click
            if (e.target.closest('.history-title-text')) {
                // If double clicked, dblclick handler will fire and stop propagation
                // But click fires first. Let's use a small delay.
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                } else {
                    clickTimer = setTimeout(() => {
                        openDetail(index);
                        clickTimer = null;
                    }, 250);
                }
            } else {
                openDetail(index);
            }
        }
    });

    container.addEventListener('dblclick', (e) => {
        // Just trigger the same click handler but it will catch dblclick
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }
    });
}
