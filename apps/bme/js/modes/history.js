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
    const btnBatchDownload = document.getElementById('btn-batch-download');

    // Bottom Sheet Elements
    const detailSheet = document.getElementById('detail-sheet');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');

    // Action buttons in detail view
    const btnDetailDownload = document.getElementById('btn-detail-download');
    const btnDetailEditToggle = document.getElementById('btn-detail-edit-toggle');
    const btnDetailDelete = document.getElementById('btn-detail-delete');

    let currentDetailItem = null;
    let currentDetailIndex = null;
    let isDetailEditMode = false;

    // Multi-select state
    let isMultiSelectMode = false;
    let selectedIndices = new Set();

    // Swipe state
    let touchStartX = 0;
    let activeSwipeCard = null;
    let swipeInitialized = false;
    let longPressInitialized = false;

    // Search & Filter state
    let searchQuery = '';
    let filterSortDate = 'terbaru';
    let filterSortPrice = 'none';
    let filterMinPrice = '';
    let filterMaxPrice = '';

    // Click timer to prevent click/dblclick conflict
    let clickTimer = null;

    // Context menu & Focus state
    let contextActiveItem = null;
    let longPressTimer = null;
    let longPressTriggered = false;

    // ===================================
    // FILTER MENU DOM SETUP
    // ===================================
    const btnHistoryFilter = document.getElementById('btn-history-filter');

    // --- Filter Chips Bar ---
    const historyView = document.getElementById('history-view');
    let chipsBar = document.getElementById('history-filter-chips');
    if (!chipsBar) {
        chipsBar = document.createElement('div');
        chipsBar.id = 'history-filter-chips';
        // Insert inside the sticky wrapper so it sticks with the toolbar
        const stickyWrapper = document.getElementById('history-sticky-wrapper');
        stickyWrapper.appendChild(chipsBar);
    }

    const updateFilterIconColor = () => {
        if (!btnHistoryFilter) return;
        const isActive = filterSortDate !== 'terbaru' || filterSortPrice !== 'none' || filterMinPrice !== '' || filterMaxPrice !== '';
        btnHistoryFilter.style.color = isActive ? 'var(--tertiary)' : '';
    };

    const renderFilterChips = () => {
        chipsBar.innerHTML = '';
        const chips = [];

        // Sort Date chip (skip default)
        if (filterSortDate !== 'terbaru') {
            chips.push({
                label: filterSortDate === 'terlama' ? 'Terlama' : filterSortDate,
                onClear: () => {
                    filterSortDate = 'terbaru';
                    syncFilterMenu();
                    render(appState.state.history);
                }
            });
        }

        // Sort Price chip (skip default)
        if (filterSortPrice !== 'none') {
            const priceLabels = { asc: 'Termurah', desc: 'Termahal' };
            chips.push({
                label: priceLabels[filterSortPrice],
                onClear: () => {
                    filterSortPrice = 'none';
                    syncFilterMenu();
                    render(appState.state.history);
                }
            });
        }

        // Price range chip
        if (filterMinPrice !== '' || filterMaxPrice !== '') {
            const fmt = (v) => v !== '' ? new Intl.NumberFormat('id-ID').format(v) : '...';
            chips.push({
                label: `${fmt(filterMinPrice)} – ${fmt(filterMaxPrice)}`,
                onClear: () => {
                    filterMinPrice = '';
                    filterMaxPrice = '';
                    syncFilterMenu();
                    render(appState.state.history);
                }
            });
        }

        if (chips.length === 0) {
            chipsBar.style.display = 'none';
        } else {
            chipsBar.style.display = 'flex';
            chips.forEach(chip => {
                const el = document.createElement('button');
                el.className = 'filter-chip';
                el.innerHTML = `<span class="chip-label">${chip.label}</span><i data-lucide="x" class="chip-x" style="width:12px;height:12px;stroke-width:2.5"></i>`;
                if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...el.querySelectorAll('[data-lucide]')] });
                // X icon clears the filter
                el.querySelector('.chip-x').addEventListener('click', (e) => {
                    e.stopPropagation();
                    chip.onClear();
                });
                chipsBar.appendChild(el);
            });
        }

        updateFilterIconColor();
    };

    const syncFilterMenu = () => {
        const fsd = document.getElementById('filter-sort-date');
        const fsp = document.getElementById('filter-sort-price');
        const fmin = document.getElementById('filter-min-price');
        const fmax = document.getElementById('filter-max-price');
        if (fsd) fsd.value = filterSortDate;
        if (fsp) fsp.value = filterSortPrice;
        if (fmin) fmin.value = filterMinPrice;
        if (fmax) fmax.value = filterMaxPrice;
        renderFilterChips();
    };

    // --- Filter Modal Menu ---
    let filterMenu = document.getElementById('history-filter-menu');
    if (!filterMenu) {
        filterMenu = document.createElement('div');
        filterMenu.id = 'history-filter-menu';
        filterMenu.style.display = 'none';
        filterMenu.innerHTML = `
            <div class="filter-section">
                <label class="filter-label">Urutan Waktu</label>
                <select id="filter-sort-date">
                    <option value="terbaru">Terbaru (Default)</option>
                    <option value="terlama">Terlama</option>
                </select>
            </div>
            <div class="filter-section">
                <label class="filter-label">Urutan Harga</label>
                <select id="filter-sort-price">
                    <option value="none">- Bawaan -</option>
                    <option value="asc">Termurah ke Termahal</option>
                    <option value="desc">Termahal ke Termurah</option>
                </select>
            </div>
            <div class="filter-section">
                <label class="filter-label">Rentang Harga</label>
                <div style="display:flex; gap:8px;">
                    <input type="number" id="filter-min-price" placeholder="Min" style="width:100%; padding:6px; border:1px solid var(--border-color); border-radius:4px; font-size:0.85rem; background:var(--bg-input); color:var(--text-main);">
                    <input type="number" id="filter-max-price" placeholder="Max" style="width:100%; padding:6px; border:1px solid var(--border-color); border-radius:4px; font-size:0.85rem; background:var(--bg-input); color:var(--text-main);">
                </div>
            </div>
        `;
        document.body.appendChild(filterMenu);

        // Events for filter changes
        const triggerFilterUpdate = () => {
            filterSortDate = document.getElementById('filter-sort-date').value;
            filterSortPrice = document.getElementById('filter-sort-price').value;
            filterMinPrice = document.getElementById('filter-min-price').value;
            filterMaxPrice = document.getElementById('filter-max-price').value;
            renderFilterChips();
            render(appState.state.history);
        };

        document.getElementById('filter-sort-date').addEventListener('change', triggerFilterUpdate);
        document.getElementById('filter-sort-price').addEventListener('change', triggerFilterUpdate);
        document.getElementById('filter-min-price').addEventListener('input', triggerFilterUpdate);
        document.getElementById('filter-max-price').addEventListener('input', triggerFilterUpdate);
    }

    if (btnHistoryFilter) {
        btnHistoryFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            if (filterMenu.style.display === 'block') {
                filterMenu.style.display = 'none';
                btnHistoryFilter.style.color = '';
            } else {
                const rect = btnHistoryFilter.getBoundingClientRect();
                filterMenu.style.top = `${rect.bottom + 8}px`;
                filterMenu.style.right = `${window.innerWidth - rect.right}px`;
                filterMenu.style.display = 'block';
                btnHistoryFilter.style.color = '#F5A623'; // Active color
            }
        });
    }

    // Hide menus on outside click/scroll
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) closeContextMenu();
        if (filterMenu && filterMenu.style.display === 'block' && !filterMenu.contains(e.target) && !e.target.closest('#btn-history-filter')) {
            filterMenu.style.display = 'none';
            if (btnHistoryFilter) btnHistoryFilter.style.color = '';
        }
    }, true);
    document.addEventListener('scroll', () => {
        closeContextMenu();
        if (filterMenu && filterMenu.style.display === 'block') {
            filterMenu.style.display = 'none';
            if (btnHistoryFilter) btnHistoryFilter.style.color = '';
        }
    }, true);

    // ===================================
    // DATA AGE HELPERS
    // ===================================
    const getDataAge = (timestamp) => {
        if (!timestamp) return { label: '', cls: '' };
        const now = new Date();
        const itemDate = new Date(timestamp);
        // Compare calendar days, not just 24h
        const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        const diffDays = Math.round((nowDay - itemDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { label: 'Hari ini', cls: 'age-today' };
        if (diffDays === 1) return { label: 'Kemarin', cls: 'age-yesterday' };
        if (diffDays <= 7) return { label: `${diffDays} hari lalu`, cls: 'age-week' };
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
            <i data-lucide="download" style="width:14px;height:14px;stroke-width:2.5"></i> Unduh
            </button>
            <button class="ctx-item" data-action="print">
            <i data-lucide="printer" style="width:14px;height:14px;stroke-width:2"></i> Print
            </button>
            <button class="ctx-item" data-action="duplicate">
                <i data-lucide="copy" style="width:14px;height:14px;stroke-width:2"></i> Duplikat
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item" data-action="preview">
                <i data-lucide="eye" style="width:14px;height:14px;stroke-width:2"></i> Pratinjau...
            </button>
            <button class="ctx-item orange" data-action="edit">
                <i data-lucide="pencil" style="width:14px;height:14px;stroke-width:2"></i> Edit...
            </button>
            <button class="ctx-item" data-action="multiselect">
                <i data-lucide="check-check" style="width:14px;height:14px;stroke-width:2.5"></i> Pilih beberapa...
            </button>
            <div class="ctx-separator"></div>
            <button class="ctx-item" data-action="rename">
                <i data-lucide="type" style="width:14px;height:14px;stroke-width:2"></i> Ubah nama
            </button>
            <button class="ctx-item danger" data-action="delete">
                <i data-lucide="trash-2" style="width:14px;height:14px;stroke-width:2.5"></i> Hapus
            </button>
        `;

        // Attach action handlers
        if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...contextMenu.querySelectorAll('[data-lucide]')] });
        contextMenu.querySelectorAll('.ctx-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleContextAction(btn.dataset.action, entry, realIndex);
                closeContextMenu();
            });
        });

        // Position: show offscreen first to measure size
        contextMenu.style.left = '-9999px';
        contextMenu.style.top = '-9999px';
        contextMenu.classList.add('visible');

        // Smart positioning (keep inside viewport)
        const SAFE = 10;
        const mw = contextMenu.offsetWidth || 210;
        const mh = contextMenu.offsetHeight || 300;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = x;
        let top = y;
        if (left + mw + SAFE > vw) left = vw - mw - SAFE;
        if (top + mh + SAFE > vh) top = vh - mh - SAFE;
        if (left < SAFE) left = SAFE;
        if (top < SAFE) top = SAFE;

        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;
        contextMenu.style.transformOrigin = x > vw / 2 ? 'top right' : 'top left';
    };

    const closeContextMenu = () => {
        contextMenu.classList.remove('visible');
        if (contextActiveItem) {
            contextActiveItem.classList.remove('context-active');
            contextActiveItem = null;
        }
        updateFocusState();
    };

    const handleContextAction = (action, entry, index) => {
        switch (action) {
            case 'duplicate': {
                const now = new Date();
                const cloned = JSON.parse(JSON.stringify(entry));
                cloned.id = Date.now();
                cloned.timestamp = Date.now();
                cloned.date = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${now.getHours()}.${String(now.getMinutes()).padStart(2, '0')}`;
                appState.addToHistory(cloned);
                break;
            }

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

    // ===================================
    // RENDER LIST
    // ===================================
    const updateFocusState = () => {
        if (contextMenu && contextMenu.classList.contains('visible')) {
            container.classList.add('is-focused');
            // Remove focused class from all, apply only to active item
            document.querySelectorAll('.item-swipe-container').forEach(c => c.classList.remove('focused'));
            if (contextActiveItem) {
                const parentSwipe = contextActiveItem.closest('.item-swipe-container');
                if (parentSwipe) parentSwipe.classList.add('focused');
            }
        } else if (isMultiSelectMode) {
            container.classList.add('is-focused');
            // Highlight selected items
            document.querySelectorAll('.item-swipe-container').forEach(c => {
                const idx = parseInt(c.querySelector('.history-item').dataset.index);
                if (selectedIndices.has(idx)) {
                    c.classList.add('focused');
                } else {
                    c.classList.remove('focused');
                }
            });
        } else {
            container.classList.remove('is-focused');
        }
    };

    const render = (history) => {
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Belum ada riwayat.</div>';
            updateBatchBar();
            return;
        }

        // Apply advanced filtering & sorting
        let resultData = [...history];

        // 1. Sort Date
        if (filterSortDate === 'terbaru') {
            resultData.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            resultData.sort((a, b) => a.timestamp - b.timestamp);
        }

        // Compute total values once per item so we can filter and sort by it
        resultData.forEach(h => {
            h._totalPrice = (h.items || []).reduce((s, i) => s + (i.price * i.qty), 0);
        });

        // 2. Price Range Filter
        if (filterMinPrice) {
            const min = parseFloat(filterMinPrice);
            resultData = resultData.filter(h => h._totalPrice >= min);
        }
        if (filterMaxPrice) {
            const max = parseFloat(filterMaxPrice);
            resultData = resultData.filter(h => h._totalPrice <= max);
        }

        // 3. Search text
        if (searchQuery) {
            resultData = resultData.filter(e =>
                (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.date || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 4. Sort Price
        if (filterSortPrice === 'asc') {
            resultData.sort((a, b) => a._totalPrice - b._totalPrice);
        } else if (filterSortPrice === 'desc') {
            resultData.sort((a, b) => b._totalPrice - a._totalPrice);
        }

        const filtered = resultData;

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Tidak ditemukan.</div>';
            return;
        }

        // Track which exact age labels have already been shown (dedup by label string)
        const shownAgeLabels = new Set();

        filtered.forEach((entry, filteredIdx) => {
            const realIndex = appState.state.history.findIndex(h => h.id === entry.id || h.timestamp === entry.timestamp);
            const age = getDataAge(entry.timestamp);

            // Badge dedup: show label only for first occurrence of each exact label
            const badgeLabel = (age.label && !shownAgeLabels.has(age.label)) ? age.label : '';
            if (age.label) shownAgeLabels.add(age.label);

            // Format total: number only (formatted), Rp as inline superscript
            const total = entry._totalPrice || 0;
            const numStr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(total);
            const totalHTML = `<sup style="font-size:0.6em; font-weight:500; vertical-align:super; letter-spacing:0; opacity:0.75;">Rp</sup>${numStr}`;

            // Swipe container — flush, no gap, no radius
            const swipeContainer = document.createElement('div');
            swipeContainer.className = 'item-swipe-container';
            // Add top border for very first item to close the list visually
            const topBorder = filteredIdx === 0 ? 'border-top: 1px solid var(--border-color);' : '';
            swipeContainer.style.cssText = `position:relative; overflow:hidden; margin-bottom:0; ${topBorder}`;

            const isChecked = selectedIndices.has(realIndex);
            const checkboxHTML = isMultiSelectMode
                ? `<label class="history-checkbox-custom">
                    <input type="checkbox" class="history-checkbox" data-index="${realIndex}" ${isChecked ? 'checked' : ''}>
                    <span class="checkmark"></span>
                   </label>`
                : '';

            swipeContainer.innerHTML = `
                <div class="swipe-actions" style="position:absolute; top:0; bottom:0; right:0; display:flex; z-index:1;">
                    <button class="swipe-btn swipe-edit-history" data-index="${realIndex}" style="background-color:#F5A623; border:none; color:white; padding:0 20px; cursor:pointer;"><i data-lucide="pencil" style="width:16px;height:16px;stroke-width:2"></i></button>
                    <button class="swipe-btn swipe-delete-history" data-index="${realIndex}" style="background-color:#ff4d4f; border:none; color:white; padding:0 20px; cursor:pointer;"><i data-lucide="trash-2" style="width:16px;height:16px;stroke-width:2.5"></i></button>
                </div>
                <div class="history-item" data-index="${realIndex}" style="cursor:pointer; transition:transform 0.2s; position:relative; z-index:2; background:var(--bg-card);">
                    <div style="display:flex; align-items:center; gap:8px; width:100%;">
                        ${checkboxHTML}
                        <div class="history-content-wrapper" style="flex:1; min-width:0; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div class="history-left-group" style="display:flex; flex-direction:column; min-width:0; flex:1;">
                                <h4 class="history-title-text" data-id="${entry.id}" style="margin:0; font-size:0.95rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${entry.title || 'Tanpa Judul'}</h4>
                                <span class="history-info-text" style="font-size:0.78rem; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${entry.date} | ${entry.items.length} Item</span>
                            </div>
                            <div class="history-right-group" style="display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0;">
                                <span class="age-badge ${age.cls}">${badgeLabel}</span>
                                <span class="history-price-text" style="font-weight:700; color:var(--primary); font-size:0.92rem; white-space:nowrap; line-height:1;">${totalHTML}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(swipeContainer);
            if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...swipeContainer.querySelectorAll('[data-lucide]')] });
        });

        if (!isMultiSelectMode) {
            initHistorySwipe();
        }
        updateBatchBar();
        initLongPress();
        updateFocusState();
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

    const exitMultiSelect = () => {
        isMultiSelectMode = false;
        selectedIndices.clear();
        if (btnMultiSelect) btnMultiSelect.style.color = '';
        updateBatchBar();
        render(appState.state.history);
    };

    if (btnMultiSelect) {
        btnMultiSelect.addEventListener('click', toggleMultiSelect);
    }

    if (btnBatchDownload) {
        btnBatchDownload.addEventListener('click', async () => {
            if (selectedIndices.size === 0) return;
            const selectedEntries = [...selectedIndices].map(i => appState.state.history[i]).filter(Boolean);
            const count = selectedEntries.length;

            // First-time notification about multiple downloads
            const NOTIF_KEY = 'bme_batch_dl_notified';
            if (!localStorage.getItem(NOTIF_KEY)) {
                const ok = confirm(
                    `Akan mengunduh ${count} file invoice.\n\n` +
                    `⚠️ Browser membatasi unduhan dari satu situs secara bersamaan.\n` +
                    `Jika muncul perintah izin, pilih "Izinkan".\n\n` +
                    `Lanjutkan?`
                );
                if (!ok) return;
                localStorage.setItem(NOTIF_KEY, '1');
            } else if (!confirm(`Unduh ${count} file invoice?`)) {
                return;
            }

            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';
            for (const entry of selectedEntries) {
                if (defaultMethod === 'pdf') {
                    printInvoicePDF(entry.items, entry.title);
                } else {
                    exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, entry.items, entry.title, defaultMethod);
                }
                // Small delay to avoid browser throttling
                await new Promise(r => setTimeout(r, 400));
            }

            // Deactivate multiselect after all downloads are done
            exitMultiSelect();
        });
    }

    if (btnBatchDelete) {
        btnBatchDelete.addEventListener('click', () => {
            if (selectedIndices.size === 0) return;
            if (!confirm(`Hapus ${selectedIndices.size} riwayat?`)) return;
            const toDelete = [...selectedIndices];
            appState.removeMultipleFromHistory(toDelete);
            exitMultiSelect();
        });
    }

    // Handle item click for multiselect toggle (whole row)
    container.addEventListener('click', (e) => {
        if (!isMultiSelectMode) return;
        const item = e.target.closest('.history-item');
        if (!item) return;
        // Don't double-fire if clicking the checkbox label itself
        if (e.target.closest('.history-checkbox-custom')) return;
        const idx = parseInt(item.dataset.index);
        if (selectedIndices.has(idx)) {
            selectedIndices.delete(idx);
        } else {
            selectedIndices.add(idx);
        }
        // Update just the checkbox visually without full re-render
        const cb = item.querySelector('.history-checkbox');
        if (cb) cb.checked = selectedIndices.has(idx);
        updateBatchBar();
        updateFocusState();
    });

    // Handle native checkbox change (for accessibility)
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
                updateFocusState();

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
    // CUSTOM PICKERS LOGIC
    // ===================================
    const dpModal = document.getElementById('custom-date-picker');
    const tpModal = document.getElementById('custom-time-picker');

    let dpCallback = null, tpCallback = null;
    let dpCurrentViewDate = new Date();
    let dpSelectedDate = new Date();

    const renderDP = () => {
        const dpInput = document.getElementById('dp-input');
        const dpMonthYear = document.getElementById('dp-month-year');
        const dpDays = document.getElementById('dp-days');

        const m = dpCurrentViewDate.getMonth();
        const y = dpCurrentViewDate.getFullYear();

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        dpMonthYear.textContent = `${monthNames[m]} ${y}`;

        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const daysInPrevMonth = new Date(y, m, 0).getDate();

        dpDays.innerHTML = '';

        // Prev month faded
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = document.createElement('div');
            d.className = 'dp-day faded';
            d.textContent = daysInPrevMonth - i;
            dpDays.appendChild(d);
        }

        // Current month
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const d = document.createElement('div');
            d.className = 'dp-day';
            d.textContent = i;

            // Highlight today
            if (today.getDate() === i && today.getMonth() === m && today.getFullYear() === y) {
                d.classList.add('today');
            }
            // Highlight selected
            if (dpSelectedDate && dpSelectedDate.getDate() === i && dpSelectedDate.getMonth() === m && dpSelectedDate.getFullYear() === y) {
                d.classList.add('selected');
            }

            d.addEventListener('click', () => {
                dpSelectedDate = new Date(y, m, i);
                const val = `${String(i).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
                dpInput.value = val;
                if (dpCallback) dpCallback(val);
                dpModal.classList.remove('active');
            });
            dpDays.appendChild(d);
        }

        // Next month faded
        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            const d = document.createElement('div');
            d.className = 'dp-day faded';
            d.textContent = i;
            dpDays.appendChild(d);
        }
    };

    if (dpModal) {
        document.getElementById('dp-btn-prev').addEventListener('click', () => {
            dpCurrentViewDate.setMonth(dpCurrentViewDate.getMonth() - 1);
            renderDP();
        });
        document.getElementById('dp-btn-next').addEventListener('click', () => {
            dpCurrentViewDate.setMonth(dpCurrentViewDate.getMonth() + 1);
            renderDP();
        });
        document.getElementById('dp-btn-today').addEventListener('click', () => {
            const t = new Date();
            dpSelectedDate = new Date(t.getFullYear(), t.getMonth(), t.getDate());
            const val = `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`;
            document.getElementById('dp-input').value = val;
            if (dpCallback) dpCallback(val);
            dpModal.classList.remove('active');
        });
        document.getElementById('dp-input').addEventListener('input', (e) => {
            const parts = e.target.value.split('/');
            if (parts.length === 3 && parts[2].length === 4) {
                const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
                if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d > 0 && m >= 0 && m < 12 && d <= 31) {
                    dpSelectedDate = new Date(y, m, d);
                    dpCurrentViewDate = new Date(y, m, 1);
                    renderDP();
                }
            }
        });
        document.getElementById('dp-input').addEventListener('blur', (e) => {
            const parts = e.target.value.split('/');
            if (parts.length === 3 && parts[2].length === 4 && dpCallback) {
                dpCallback(e.target.value);
            }
        });
        dpModal.addEventListener('click', (e) => { if (e.target === dpModal) dpModal.classList.remove('active'); });
    }

    if (tpModal) {
        document.querySelector('.close-timepicker').addEventListener('click', () => {
            tpModal.classList.remove('active');
        });
        document.getElementById('tp-btn-save').addEventListener('click', () => {
            let h = document.getElementById('tp-hour').value;
            let m = document.getElementById('tp-minute').value;
            if (!h) h = '00'; if (!m) m = '00';
            const val = `${h.padStart(2, '0')}.${m.padStart(2, '0')}`;
            if (tpCallback) tpCallback(val);
            tpModal.classList.remove('active');
        });
        tpModal.addEventListener('click', (e) => { if (e.target === tpModal) tpModal.classList.remove('active'); });
    }

    const openDatePicker = (currentStr, callback) => {
        dpCallback = callback;
        if (currentStr) {
            const parts = currentStr.split('/');
            if (parts.length === 3) {
                const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
                dpSelectedDate = new Date(y, m, d);
                dpCurrentViewDate = new Date(y, m, 1);
                document.getElementById('dp-input').value = currentStr;
            }
        } else {
            dpSelectedDate = new Date();
            dpCurrentViewDate = new Date();
            document.getElementById('dp-input').value = '';
        }
        renderDP();
        dpModal.classList.add('active');
    };

    const openTimePicker = (currentStr, callback) => {
        tpCallback = callback;
        if (currentStr) {
            const parts = currentStr.split('.');
            if (parts.length === 2) {
                document.getElementById('tp-hour').value = parts[0];
                document.getElementById('tp-minute').value = parts[1];
            }
        }
        tpModal.classList.add('active');
    };

    // ===================================
    // DETAIL VIEW LOGIC
    // ===================================
    const formatNum = (n) => new Intl.NumberFormat('id-ID').format(n);

    const parseDateString = (dateStr) => {
        // Parses "DD/MM/YYYY | HH.MM" into { datePart, timePart }
        if (!dateStr) return { datePart: '', timePart: '' };
        const parts = dateStr.split('|').map(s => s.trim());
        return { datePart: parts[0] || '', timePart: parts[1] || '' };
    };

    const getTimestampFromDateStr = (str) => {
        const { datePart, timePart } = parseDateString(str);
        const d = datePart.split('/');
        const t = timePart.split('.');
        if (d.length !== 3 || t.length !== 2) return Date.now();
        return new Date(d[2], d[1] - 1, d[0], t[0], t[1]).getTime();
    };

    const renderDetailContent = () => {
        if (!currentDetailItem) return;
        const items = currentDetailItem.items;
        const title = currentDetailItem.title;
        const { datePart, timePart } = parseDateString(currentDetailItem.date);

        detailContent.innerHTML = '';

        // === INFO BAR (Date + Time + Total) ===
        const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
        const totalHTML = `<sup style="font-size:0.6em; font-weight:500; vertical-align:super; opacity:0.75;">Rp</sup>${formatNum(total)}`;

        const infoBar = document.createElement('div');
        infoBar.className = 'detail-info-bar';
        infoBar.innerHTML = `
            <div class="detail-date-time">
                <span class="date-chip" id="detail-date-chip">${datePart}</span>
                <span class="time-chip" id="detail-time-chip">${timePart}</span>
            </div>
            <div class="detail-total">${totalHTML}</div>
        `;
        detailContent.appendChild(infoBar);

        // Date chip click → custom date picker
        const dateChip = infoBar.querySelector('#detail-date-chip');
        dateChip.addEventListener('click', () => {
            openDatePicker(datePart, (newDatePart) => {
                const newDateStr = `${newDatePart} | ${timePart}`;
                const newTimestamp = getTimestampFromDateStr(newDateStr);
                currentDetailItem.date = newDateStr;
                currentDetailItem.timestamp = newTimestamp;
                appState.updateHistoryEntry(currentDetailItem.id, { date: newDateStr, timestamp: newTimestamp });
                dateChip.textContent = newDatePart;
                // update local variable for future edits
                datePart = newDatePart;
            });
        });

        // Time chip click → custom time picker
        const timeChip = infoBar.querySelector('#detail-time-chip');
        timeChip.addEventListener('click', () => {
            openTimePicker(timePart, (newTimePart) => {
                const newDateStr = `${datePart} | ${newTimePart}`;
                const newTimestamp = getTimestampFromDateStr(newDateStr);
                currentDetailItem.date = newDateStr;
                currentDetailItem.timestamp = newTimestamp;
                appState.updateHistoryEntry(currentDetailItem.id, { date: newDateStr, timestamp: newTimestamp });
                timeChip.textContent = newTimePart;
                // update local variable for future edits
                timePart = newTimePart;
            });
        });

        // === ITEM CARDS ===
        items.forEach((item, idx) => {
            const unit = item.qtyUnit || 'pcs';
            const priceFormatted = formatNum(item.price);

            const card = document.createElement('div');
            card.className = 'detail-item-card';
            if (isDetailEditMode) card.classList.add('editing');

            if (isDetailEditMode) {
                card.innerHTML = `
                    <div style="margin-bottom:6px;">
                        <input class="edit-input edit-name" value="${item.name || ''}" placeholder="Nama Barang" data-idx="${idx}">
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:6px; align-items:center;">
                        <input class="edit-input edit-qty" type="number" value="${item.qty}" min="1" style="width:60px;" data-idx="${idx}">
                        
                        <div class="unit-switch edit-unit-switch" data-idx="${idx}" style="margin:0; height:24px;">
                            <span class="unit-opt ${unit === 'pcs' ? 'active' : ''}" data-unit="pcs" onclick="this.parentElement.querySelectorAll('.unit-opt').forEach(el=>el.classList.remove('active')); this.classList.add('active');" style="padding:2px 6px;">Pcs</span>
                            <span class="unit-opt ${unit === 'lot' ? 'active' : ''}" data-unit="lot" onclick="this.parentElement.querySelectorAll('.unit-opt').forEach(el=>el.classList.remove('active')); this.classList.add('active');" style="padding:2px 6px;">Lot</span>
                        </div>
                        
                        <span style="color:var(--text-muted);">•</span>
                        <input class="edit-input edit-price" type="number" value="${item.price}" style="flex:1;" data-idx="${idx}">
                    </div>
                    <div>
                        <input class="edit-input edit-note" value="${item.note || ''}" placeholder="Note (opsional)" data-idx="${idx}">
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="item-name-row">
                        <span class="d-item-name">${item.name || 'Tanpa Nama'}</span>
                        <span class="item-meta">${item.qty} ${unit} • <span class="item-price-tag"><sup style="font-size:0.6em;opacity:0.7;">Rp</sup>${priceFormatted}</span></span>
                    </div>
                    ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
                `;
            }
            detailContent.appendChild(card);
        });

        // === PREVIEW RENDERING ===
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

        const buildPreviewCard = (htmlStr, bgColor) => {
            const card = document.createElement('div');
            card.style.cssText = `flex:1; position:relative; border-radius:var(--radius-sm); border:1px solid var(--border-color); overflow:hidden; background:${bgColor}; aspect-ratio:1/1.414;`;
            if (htmlStr) {
                const frameWrap = document.createElement('div');
                frameWrap.style.cssText = 'position:absolute; top:0; left:0; width:100%; overflow:hidden;';
                card.appendChild(frameWrap);
                const iframe = document.createElement('iframe');
                iframe.style.cssText = 'border:0; pointer-events:none; display:block; width:794px; height:1123px; transform-origin:top left;';
                iframe.srcdoc = htmlStr;
                frameWrap.appendChild(iframe);
                setTimeout(() => {
                    const availW = card.offsetWidth || cardsRow.offsetWidth / 2 || 150;
                    iframe.style.transform = `scale(${availW / 794})`;
                }, 400);
            }
            return card;
        };

        const invoiceCard = buildPreviewCard(invoiceHTML, 'var(--invoice-bg, #f0f4ff)');
        const suratCard = buildPreviewCard(suratJalanHTML, 'var(--letter-bg, #f0fff4)');

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
                        appState.state.invoiceItems = JSON.parse(JSON.stringify(items));
                        const manualTitle = document.getElementById('manual-title');
                        if (manualTitle) manualTitle.value = title;
                        appState.save('bme_invoice_items', appState.state.invoiceItems);
                        const previewModal = document.getElementById('preview-modal');
                        if (previewModal) { previewModal.classList.add('hidden'); previewModal.classList.remove('active'); }
                        closeDetail();
                        const tabManual = document.querySelector('[data-tab="manual"]');
                        if (tabManual) tabManual.click();
                    }
                };
                openPreviewModal(html, label, type, async () => {
                    const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
                    const formats = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };
                    const template = type === 'surat' ? formats.suratJalan : formats.invoice;
                    const now = new Date();
                    const filename = template.replace(/\{judul\}/gi, title).replace(/%YYYY/g, String(now.getFullYear())).replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0')).replace(/%DD/g, String(now.getDate()).padStart(2, '0')).replace(/%HH/g, String(now.getHours()).padStart(2, '0')).replace(/%mm/g, String(now.getMinutes()).padStart(2, '0')).replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));
                    if (defaultMethod === 'pdf') { printInvoicePDF(items, title); }
                    else {
                        const alertEl = document.getElementById('custom-alert');
                        const messageEl = document.getElementById('alert-message');
                        if (alertEl && messageEl) { messageEl.innerHTML = 'Mengekspor... <i data-lucide="loader-2" class="spin-icon" style="width:14px;height:14px;stroke-width:1.5"></i>'; alertEl.classList.remove('hidden'); alertEl.style.animation = 'alert-in 0.3s ease-out forwards'; if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...messageEl.querySelectorAll('[data-lucide]')] }); }
                        if (defaultMethod === 'jpeg') await exportToJPEG(html, filename);
                        else await exportToPNG(html, filename);
                        if (alertEl) alertEl.classList.add('hidden');
                    }
                }, editAction, true);
            });
            return btn;
        };

        invoiceCard.appendChild(makePreviewBtn('invoice'));
        suratCard.appendChild(makePreviewBtn('surat'));

        const makeDownloadBtn = (type) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.innerHTML = '<i data-lucide="download" style="width:15px;height:15px;stroke-width:2.5"></i>';
            btn.style.cssText = 'position:absolute; right:10px; bottom:8px; padding:7px 11px; font-size:0.78rem; z-index:2; background:#e67e22; border-color:#d35400; color:white;';
            if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...btn.querySelectorAll('[data-lucide]')] });
            btn.title = type === 'invoice' ? 'Unduh Invoice' : 'Unduh Surat Jalan';
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const html = type === 'invoice' ? invoiceHTML : suratJalanHTML;
                const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
                const formats = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };
                const template = type === 'surat' ? formats.suratJalan : formats.invoice;
                const now = new Date();
                const filename = template.replace(/\{judul\}/gi, title).replace(/%YYYY/g, String(now.getFullYear())).replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0')).replace(/%DD/g, String(now.getDate()).padStart(2, '0')).replace(/%HH/g, String(now.getHours()).padStart(2, '0')).replace(/%mm/g, String(now.getMinutes()).padStart(2, '0')).replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));
                if (defaultMethod === 'pdf') {
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open(); w.document.write(html); w.document.close(); w.document.title = title;
                    setTimeout(() => { w.focus(); w.print(); }, 300);
                } else {
                    const alertEl = document.getElementById('custom-alert');
                    const messageEl = document.getElementById('alert-message');
                    if (alertEl && messageEl) { messageEl.innerHTML = 'Mengekspor... <i data-lucide="loader-2" class="spin-icon" style="width:14px;height:14px;stroke-width:1.5"></i>'; alertEl.classList.remove('hidden'); alertEl.style.animation = 'alert-in 0.3s ease-out forwards'; if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...messageEl.querySelectorAll('[data-lucide]')] }); }
                    if (defaultMethod === 'jpeg') await exportToJPEG(html, filename);
                    else await exportToPNG(html, filename);
                    if (alertEl) alertEl.classList.add('hidden');
                }
            });
            return btn;
        };

        invoiceCard.querySelectorAll('.btn.btn-outline').forEach(b => { b.style.right = '52px'; });
        suratCard.querySelectorAll('.btn.btn-outline').forEach(b => { b.style.right = '52px'; });
        invoiceCard.appendChild(makeDownloadBtn('invoice'));
        suratCard.appendChild(makeDownloadBtn('surat'));
        cardsRow.appendChild(invoiceCard);
        cardsRow.appendChild(suratCard);
    };

    const collectEditedData = () => {
        if (!currentDetailItem || !isDetailEditMode) return;
        const names = detailContent.querySelectorAll('.edit-name');
        const qtys = detailContent.querySelectorAll('.edit-qty');
        const prices = detailContent.querySelectorAll('.edit-price');
        const notes = detailContent.querySelectorAll('.edit-note');
        const unitSwitches = detailContent.querySelectorAll('.edit-unit-switch');
        names.forEach((el, i) => {
            currentDetailItem.items[i].name = el.value;
            currentDetailItem.items[i].qty = parseInt(qtys[i].value) || 1;
            currentDetailItem.items[i].price = parseFloat(prices[i].value) || 0;
            currentDetailItem.items[i].note = notes[i].value;
            const activeUnitEl = unitSwitches[i].querySelector('.unit-opt.active');
            if (activeUnitEl) {
                currentDetailItem.items[i].qtyUnit = activeUnitEl.dataset.unit;
            }
        });
        // Also update title
        currentDetailItem.title = detailTitle.textContent;
        appState.updateHistoryEntry(currentDetailItem.id, {
            title: currentDetailItem.title,
            items: JSON.parse(JSON.stringify(currentDetailItem.items))
        });
    };

    const openDetail = (index) => {
        currentDetailIndex = index;
        currentDetailItem = appState.state.history[index];
        isDetailEditMode = false;
        detailTitle.textContent = currentDetailItem.title || 'Detail Invoice';
        detailTitle.contentEditable = 'false';
        if (btnDetailDownload) btnDetailDownload.classList.remove('btn-action-faded');
        if (btnDetailDelete) btnDetailDelete.classList.remove('btn-action-faded');
        detailSheet.classList.add('active');
        renderDetailContent();
    };

    const closeDetail = () => {
        if (isDetailEditMode) {
            collectEditedData();
            isDetailEditMode = false;
        }
        detailSheet.classList.remove('active');
        currentDetailItem = null;
        currentDetailIndex = null;
    };

    // === DETAIL ACTION BUTTONS ===
    if (btnDetailDownload) {
        btnDetailDownload.addEventListener('click', () => {
            if (!currentDetailItem) return;
            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';
            if (defaultMethod === 'pdf') {
                printInvoicePDF(currentDetailItem.items, currentDetailItem.title);
            } else {
                exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, currentDetailItem.items, currentDetailItem.title, defaultMethod);
            }
        });
    }

    if (btnDetailEditToggle) {
        btnDetailEditToggle.addEventListener('click', () => {
            if (!currentDetailItem) return;
            if (isDetailEditMode) {
                // Exiting edit mode — save
                collectEditedData();
                isDetailEditMode = false;
                detailTitle.contentEditable = 'false';
                detailTitle.style.outline = '';
                if (btnDetailDownload) btnDetailDownload.classList.remove('btn-action-faded');
                if (btnDetailDelete) btnDetailDelete.classList.remove('btn-action-faded');
                renderDetailContent();
            } else {
                // Entering edit mode
                isDetailEditMode = true;
                detailTitle.contentEditable = 'true';
                detailTitle.style.outline = '1px dashed var(--primary)';
                detailTitle.style.borderRadius = '4px';
                detailTitle.style.padding = '2px 6px';
                if (btnDetailDownload) btnDetailDownload.classList.add('btn-action-faded');
                if (btnDetailDelete) btnDetailDelete.classList.add('btn-action-faded');
                renderDetailContent();
            }
        });
    }

    if (btnDetailDelete) {
        btnDetailDelete.addEventListener('click', () => {
            if (!currentDetailItem || currentDetailIndex === null) return;
            if (confirm('Hapus riwayat ini?')) {
                appState.removeFromHistory(currentDetailIndex);
                closeDetail();
            }
        });
    }

    // Close modal when clicking outside
    detailSheet.addEventListener('click', (e) => {
        if (e.target === detailSheet) {
            closeDetail();
        }
    });

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
