/**
 * AI Mode Logic with Prompt Controls, Structured Card Generation, Inline Editing, and Normal/Select Mode Action Bar
 */
import { appState } from '../state.js';
import { buildInvoiceHTML, buildSuratJalanHTML, openPreviewModal, pdfPrintQueue, buildCombinedPDFHTML } from '../pdf/generator.js';
import { exportBothDocuments } from '../pdf/imageExporter.js';

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const formatNumberStr = (str) => {
    if (!str) return '';
    const num = parseInt(String(str).replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
};

const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
};

// ---------------------------------------------------------
// MAIN INITIATION
// ---------------------------------------------------------
export function initAIMode() {
    // ── DOM ELEMENTS ─────────────────────────────────────────
    const aiView = document.getElementById('ai-view');
    const promptInput = document.getElementById('ai-prompt');
    const btnResize = document.getElementById('btn-ai-prompt-resize');
    const modelSelect = document.getElementById('ai-model-select');
    const btnCopy = document.getElementById('btn-ai-prompt-copy');
    const btnPaste = document.getElementById('btn-ai-prompt-paste');
    const btnGenerate = document.getElementById('btn-ai-generate');
    const outputContainer = document.getElementById('ai-output-container');

    const aiActionBar = document.getElementById('ai-action-bar');
    const actionNormal = document.getElementById('ai-action-normal');
    const actionSelect = document.getElementById('ai-action-select');
    const generatedCountText = document.getElementById('ai-generated-count');

    const btnDeleteAll = document.getElementById('btn-ai-delete-all');
    const btnSaveAll = document.getElementById('btn-ai-save-all');
    const btnSelectMode = document.getElementById('btn-ai-select-mode');

    const btnDeleteSelected = document.getElementById('btn-ai-delete-selected');
    const btnDownloadSelected = document.getElementById('btn-ai-download-selected');
    const btnSaveSelected = document.getElementById('btn-ai-save-selected');
    const btnExitSelect = document.getElementById('btn-ai-exit-select');
    const selectBadge = document.getElementById('ai-select-badge');

    // ── STATE VARIABLES ──────────────────────────────────────
    let selectModeActive = false;
    let selectedCardsSet = new Set(); // holds card IDs

    // ── REMOVE OLD LOCKED STATE OVERLAY IF ANY ───────────────
    if (aiView) {
        const lockedOverlay = aiView.querySelector('.ai-locked-overlay');
        if (lockedOverlay) lockedOverlay.remove();
        aiView.style.position = ''; // reset position relative if locked overlay is removed
    }

    // Unblock elements
    if (promptInput) {
        promptInput.disabled = false;
        promptInput.placeholder = 'Contoh: Kabel NYM 50 meter harga 15rb, MCB 10 pcs harga 50rb...';
    }
    if (btnGenerate) {
        btnGenerate.disabled = false;
        btnGenerate.style.opacity = '';
        btnGenerate.style.cursor = '';
    }

    // ── PROMPT CONTROLS ──────────────────────────────────────
    if (btnResize && promptInput) {
        btnResize.addEventListener('click', () => {
            const isMaximized = promptInput.classList.toggle('maximized');
            promptInput.classList.toggle('minimized', !isMaximized);
            
            // Toggle icon maximize vs minimize
            const icon = btnResize.querySelector('i-ui');
            if (icon) {
                icon.setAttribute('name', isMaximized ? 'minimize-02' : 'maximize-02');
            }
        });
    }

    if (btnCopy && promptInput) {
        btnCopy.addEventListener('click', () => {
            const val = promptInput.value.trim();
            if (!val) return;
            navigator.clipboard.writeText(val).then(() => {
                if (window.showBMEAlert) window.showBMEAlert("Prompt berhasil disalin ke clipboard", "success");
            });
        });
    }

    if (btnPaste && promptInput) {
        btnPaste.addEventListener('click', () => {
            navigator.clipboard.readText().then(text => {
                if (text) {
                    promptInput.value = text;
                    autoResize(promptInput);
                    if (window.showBMEAlert) window.showBMEAlert("Teks berhasil ditempel dari clipboard", "success");
                }
            }).catch(err => {
                console.warn("Gagal mengakses clipboard: ", err);
                if (window.showBMEAlert) window.showBMEAlert("Gagal membaca clipboard. Mohon berikan izin browser.", "warning");
            });
        });
    }

    // ── MODEL DROPDOWN SELECT ─────────────────────────────────
    if (modelSelect) {
        const selected = modelSelect.querySelector('.select-selected');
        const selectedText = selected?.querySelector('.selected-text');
        const selectItems = modelSelect.querySelector('.select-items');

        selected?.addEventListener('click', (e) => {
            e.stopPropagation();
            const existingPortal = document.querySelector('.select-items-portal');
            if (existingPortal) {
                existingPortal.remove();
                if (existingPortal.dataset.sourceId === 'ai-model-select') return;
            }

            const portal = selectItems.cloneNode(true);
            portal.classList.remove('select-hide');
            portal.classList.add('select-items-portal');
            portal.dataset.sourceId = 'ai-model-select';

            const rect = modelSelect.getBoundingClientRect();
            portal.style.position = 'fixed';
            portal.style.top = rect.bottom + 'px';
            portal.style.left = rect.left + 'px';
            portal.style.width = rect.width + 'px';
            portal.style.zIndex = '999999';
            portal.style.marginTop = '4px';

            document.body.appendChild(portal);

            portal.querySelectorAll('div').forEach(item => {
                item.addEventListener('click', () => {
                    const val = item.dataset.value;
                    modelSelect.dataset.value = val;
                    if (selectedText) selectedText.textContent = item.textContent;
                    
                    portal.querySelectorAll('div').forEach(el => el.classList.remove('same-as-selected'));
                    item.classList.add('same-as-selected');
                    portal.remove();
                });
            });
        });
    }

    // ── GENERATE AI ACTION ───────────────────────────────────
    if (btnGenerate && promptInput) {
        btnGenerate.addEventListener('click', async () => {
            const prompt = promptInput.value.trim();
            if (!prompt) {
                if (window.showBMEAlert) window.showBMEAlert("Silakan ketik deskripsi barang terlebih dahulu!", "warning");
                return;
            }

            // Show loading spinner
            btnGenerate.disabled = true;
            btnGenerate.innerHTML = `<i-ui name="loading-01" size="14" class="spin-icon" style="margin-right: 4px;"></i-ui> Generating...`;
            promptInput.disabled = true;

            const activeModel = modelSelect?.dataset.value || 'gemini-3.5-flash';
            const defaultInstruction = appState.state.settings.aiDefaultPrompt || '';

            try {
                // Gunakan endpoint worker tepercaya
                const response = await fetch('https://api.zanxa.site/bme-api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        model: activeModel,
                        systemInstruction: defaultInstruction
                    })
                });

                if (!response.ok) {
                    throw new Error(`Worker HTTP error! Status: ${response.status}`);
                }

                const resData = await response.json();
                
                if (resData.cards && Array.isArray(resData.cards)) {
                    const cards = resData.cards.map((c, index) => ({
                        id: 'ai_card_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
                        title: c.title || 'masukan judul',
                        items: (c.items || []).map(item => ({
                            name: item.name || '...',
                            tipe: item.tipe || '-',
                            qtyUnit: item.qtyUnit || 'pcs',
                            qty: parseInt(item.qty) || 1,
                            price: parseInt(item.price) || 0,
                            note: item.note || '...'
                        })),
                        isCollapsed: false // expand by default for user review
                    }));

                    appState.updateActiveTabData({ aiCards: cards });
                    
                    // Exit select mode if active
                    exitSelectMode();
                    renderAICards();
                    
                    if (window.showBMEAlert) window.showBMEAlert(`AI berhasil memproses ${cards.length} data invoice!`, "success");
                } else {
                    throw new Error("Format respons JSON tidak valid dari Worker.");
                }
            } catch (err) {
                console.error("AI Generation failed:", err);
                if (window.showBMEAlert) window.showBMEAlert("Gagal memproses AI: " + err.message, "error");
            } finally {
                btnGenerate.disabled = false;
                btnGenerate.innerHTML = `<i-ui name="star-04" size="15" style="margin-right: 4px;"></i-ui> Generate`;
                promptInput.disabled = false;
            }
        });
    }

    // ── RENDER AI GENERATED CARDS ─────────────────────────────
    const renderAICards = () => {
        if (!outputContainer) return;
        outputContainer.innerHTML = '';

        const activeTab = appState.getActiveTab();
        const cards = activeTab?.data?.aiCards || [];

        // Update Normal/Select Footer indicators
        if (generatedCountText) {
            generatedCountText.textContent = `${cards.length} Judul`;
        }

        if (cards.length === 0) {
            outputContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted); width: 100%; grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                    <i-ui name="star-04" size="32" style="opacity: 0.3; color: var(--primary);"></i-ui>
                    <p style="font-weight: 500; font-size: 0.95rem; margin: 0;">Belum ada hasil generate</p>
                    <small style="font-size: 0.8rem; opacity: 0.7;">Silakan masukkan data mentah di atas lalu klik Generate</small>
                </div>
            `;
            // Hide AI Action Bar if no cards are generated
            if (aiActionBar) aiActionBar.style.display = 'none';
            return;
        }

        // Show AI action bar
        if (aiActionBar) {
            aiActionBar.style.display = 'flex';
        }

        // Sync Container Class with Select Mode
        if (selectModeActive) {
            outputContainer.classList.add('select-mode-active');
        } else {
            outputContainer.classList.remove('select-mode-active');
        }

        cards.forEach((card, cardIndex) => {
            const cardId = card.id;
            const isSelected = selectedCardsSet.has(cardId);

            const cardEl = document.createElement('div');
            cardEl.className = `ai-card ${isSelected ? 'is-selected' : ''}`;
            cardEl.dataset.cardId = cardId;
            cardEl.dataset.index = cardIndex;

            // Render Card Header
            const headerHTML = `
                <div class="ai-card-header">
                    <input type="text" class="ai-card-title-input ${!card.title || card.title === 'masukan judul' ? 'required-empty-orange' : ''}" 
                        value="${card.title || ''}" 
                        placeholder="masukan judul" 
                        data-card-index="${cardIndex}">
                    <div class="ai-card-select-overlay"></div>
                </div>
            `;

            // Render Card Items Body
            let itemsHTML = '';
            card.items.forEach((item, itemIndex) => {
                const isNameEmpty = !item.name || item.name === '...';
                const isTipeEmpty = !item.tipe || item.tipe === '-';
                const isNoteEmpty = !item.note || item.note === '...';
                const isQtyEmpty = !item.qty || item.qty <= 0;
                const isPriceEmpty = !item.price || item.price <= 0;

                itemsHTML += `
                    <div class="ai-card-item-group" style="border-bottom: 1px dashed rgba(255, 255, 255, 0.04); padding-bottom: 8px; margin-bottom: 8px;">
                        <!-- Row 1: Barang -->
                        <div class="ai-item-row" style="margin-bottom: 6px;">
                            <span class="ai-field-label">barang</span>
                            <div class="ai-field-value-wrap">
                                <input type="text" class="ai-field-input item-name ${isNameEmpty ? 'required-empty-orange' : ''}" 
                                    value="${item.name || ''}" 
                                    placeholder="..." 
                                    data-card-index="${cardIndex}" 
                                    data-item-index="${itemIndex}">
                            </div>
                        </div>

                        <!-- Row 2: Tipe & Item -->
                        <div class="ai-item-split-row" style="margin-bottom: 6px;">
                            <div class="ai-item-split-col">
                                <span class="ai-field-label">tipe</span>
                                <div class="custom-select ai-item-tipe" data-card-index="${cardIndex}" data-item-index="${itemIndex}" data-value="${item.tipe || ''}">
                                    <div class="select-selected ${isTipeEmpty ? 'required-empty-orange' : ''}">
                                        <span class="selected-text">${item.tipe || '...'}</span>
                                        <i-ui name="chevron-down" size="12" style="opacity:0.5;flex-shrink:0"></i-ui>
                                    </div>
                                    <div class="select-items select-hide">
                                        <div data-value="-">-</div>
                                        <div data-value="ICA">ICA</div>
                                        <div data-value="Protecta">Protecta</div>
                                        <div data-value="Prolink">Prolink</div>
                                        <div data-value="APC">APC</div>
                                    </div>
                                </div>
                            </div>
                            <div class="ai-item-split-col">
                                <span class="ai-field-label-sub">item</span>
                                <div class="custom-select ai-item-unit" data-card-index="${cardIndex}" data-item-index="${itemIndex}" data-value="${item.qtyUnit || 'pcs'}">
                                    <div class="select-selected">
                                        <span class="selected-text">${item.qtyUnit || 'pcs'}</span>
                                        <i-ui name="chevron-down" size="12" style="opacity:0.5;flex-shrink:0"></i-ui>
                                    </div>
                                    <div class="select-items select-hide">
                                        <div data-value="pcs">pcs</div>
                                        <div data-value="lot">lot</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Row 3: Qty & Harga -->
                        <div class="ai-item-split-row" style="margin-bottom: 6px;">
                            <div class="ai-item-split-col">
                                <span class="ai-field-label">qty</span>
                                <div class="ai-field-value-wrap">
                                    <input type="number" class="ai-field-input item-qty ${isQtyEmpty ? 'required-empty-orange' : ''}" 
                                        value="${item.qty || ''}" 
                                        placeholder="..." 
                                        data-card-index="${cardIndex}" 
                                        data-item-index="${itemIndex}"
                                        min="1">
                                </div>
                            </div>
                            <div class="ai-item-split-col">
                                <span class="ai-field-label-sub">harga</span>
                                <div class="ai-field-value-wrap">
                                    <input type="text" class="ai-field-input item-price-format ${isPriceEmpty ? 'required-empty-orange' : ''}" 
                                        value="${item.price > 0 ? formatNumberStr(String(item.price)) : ''}" 
                                        placeholder="..." 
                                        data-card-index="${cardIndex}" 
                                        data-item-index="${itemIndex}"
                                        inputmode="numeric">
                                </div>
                            </div>
                        </div>

                        <!-- Row 4: Catatan -->
                        <div class="ai-item-row" style="margin-bottom: 4px;">
                            <span class="ai-field-label">catatan</span>
                            <div class="ai-field-value-wrap">
                                <textarea class="ai-field-input ai-note-textarea item-note ${isNoteEmpty ? 'required-empty-orange' : ''}" 
                                    placeholder="..." 
                                    data-card-index="${cardIndex}" 
                                    data-item-index="${itemIndex}" 
                                    rows="1" style="height:auto;">${item.note && item.note !== '...' ? item.note : ''}</textarea>
                            </div>
                        </div>
                    </div>
                `;
            });

            const bodyHTML = `
                <div class="ai-card-body ${card.isCollapsed ? 'collapsed' : ''}">
                    ${itemsHTML}
                </div>
            `;

            // Render Card Bottom Actions (Hidden in select mode automatically via CSS)
            const actionsHTML = `
                <div class="ai-card-actions">
                    <div class="ai-card-actions-left">
                        <button class="btn-delete-card" data-card-index="${cardIndex}" title="Hapus Judul">
                            <i-ui name="trash-04" size="15"></i-ui>
                        </button>
                    </div>
                    <div class="ai-card-actions-right">
                        <button class="btn-card-action btn-collapse-card ${card.isCollapsed ? '' : 'active-collapse'}" data-card-index="${cardIndex}" title="Expand / Collapse">
                            <i-ui name="chevron-right" size="14"></i-ui>
                        </button>
                        <button class="btn-card-action btn-preview-card" data-card-index="${cardIndex}" title="Preview PDF">
                            <i-ui name="eye" size="14"></i-ui>
                        </button>
                        <button class="btn-card-action btn-download-card" data-card-index="${cardIndex}" title="Unduh PDF / Gambar">
                            <i-ui name="download-02" size="14"></i-ui>
                        </button>
                        <button class="btn-card-action btn-save-card" data-card-index="${cardIndex}" title="Simpan ke Riwayat">
                            <i-ui name="save-01" size="14"></i-ui>
                        </button>
                    </div>
                </div>
            `;

            cardEl.innerHTML = headerHTML + bodyHTML + actionsHTML;
            outputContainer.appendChild(cardEl);

            // Trigger flexible notes resize
            cardEl.querySelectorAll('.ai-note-textarea').forEach(ta => autoResize(ta));
        });
    };

    // ── CLICK HANDLER FOR INLINE INTERACTIONS ─────────────────
    if (outputContainer) {
        outputContainer.addEventListener('click', (e) => {
            const target = e.target;

            // Handle Card Selection in Select Mode
            if (selectModeActive) {
                const cardEl = target.closest('.ai-card');
                if (cardEl && !target.closest('input, textarea, button, .custom-select')) {
                    const cardId = cardEl.dataset.cardId;
                    if (selectedCardsSet.has(cardId)) {
                        selectedCardsSet.delete(cardId);
                        cardEl.classList.remove('is-selected');
                    } else {
                        selectedCardsSet.add(cardId);
                        cardEl.classList.add('is-selected');
                    }
                    updateSelectBadge();
                    return;
                }
            }

            // Custom Select Dropdown Handler
            const selectSelected = target.closest('.select-selected');
            if (selectSelected) {
                const wrapper = selectSelected.closest('.custom-select');
                const selectItems = wrapper.querySelector('.select-items');
                const cardIdx = parseInt(wrapper.dataset.cardIndex);
                const itemIdx = parseInt(wrapper.dataset.itemIndex);
                const isTipe = wrapper.classList.contains('ai-item-tipe');

                const existingPortal = document.querySelector('.select-items-portal');
                if (existingPortal) {
                    existingPortal.remove();
                    if (existingPortal.dataset.sourceIndex === `${cardIdx}_${itemIdx}_${isTipe}`) return;
                }

                const portal = selectItems.cloneNode(true);
                portal.classList.remove('select-hide');
                portal.classList.add('select-items-portal');
                portal.dataset.sourceIndex = `${cardIdx}_${itemIdx}_${isTipe}`;

                const rect = wrapper.getBoundingClientRect();
                portal.style.position = 'fixed';
                portal.style.top = rect.bottom + 'px';
                portal.style.left = rect.left + 'px';
                portal.style.width = rect.width + 'px';
                portal.style.zIndex = '999999';
                portal.style.marginTop = '4px';

                document.body.appendChild(portal);

                portal.querySelectorAll('div').forEach(div => {
                    div.addEventListener('click', () => {
                        const val = div.dataset.value;
                        const activeTab = appState.getActiveTab();
                        const cards = activeTab?.data?.aiCards || [];
                        
                        if (isTipe) {
                            cards[cardIdx].items[itemIdx].tipe = val;
                        } else {
                            cards[cardIdx].items[itemIdx].qtyUnit = val;
                        }

                        appState.updateActiveTabData({ aiCards: cards });
                        renderAICards();
                        portal.remove();
                    });
                });
                return;
            }

            // Individual Card Action: Hapus Card
            const deleteBtn = target.closest('.btn-delete-card');
            if (deleteBtn) {
                const cardIdx = parseInt(deleteBtn.dataset.cardIndex);
                const activeTab = appState.getActiveTab();
                const cards = activeTab?.data?.aiCards || [];
                
                if (window.showBMEAlert) {
                    window.showBMEAlert("Hapus data invoice ini?", "error", {
                        confirm: true,
                        onConfirm: () => {
                            cards.splice(cardIdx, 1);
                            appState.updateActiveTabData({ aiCards: cards });
                            renderAICards();
                        }
                    });
                }
                return;
            }

            // Individual Card Action: Collapse/Expand Detail
            const collapseBtn = target.closest('.btn-collapse-card');
            if (collapseBtn) {
                const cardIdx = parseInt(collapseBtn.dataset.cardIndex);
                const activeTab = appState.getActiveTab();
                const cards = activeTab?.data?.aiCards || [];
                
                cards[cardIdx].isCollapsed = !cards[cardIdx].isCollapsed;
                appState.updateActiveTabData({ aiCards: cards });
                
                const cardEl = collapseBtn.closest('.ai-card');
                const body = cardEl?.querySelector('.ai-card-body');
                
                if (body) {
                    body.classList.toggle('collapsed', cards[cardIdx].isCollapsed);
                    collapseBtn.classList.toggle('active-collapse', !cards[cardIdx].isCollapsed);
                }
                return;
            }

            // Individual Card Action: Preview PDF
            const previewBtn = target.closest('.btn-preview-card');
            if (previewBtn) {
                const cardIdx = parseInt(previewBtn.dataset.cardIndex);
                const activeTab = appState.getActiveTab();
                const card = activeTab?.data?.aiCards[cardIdx];
                
                if (card) {
                    openPreviewModal(card.items, card.title);
                }
                return;
            }

            // Individual Card Action: Unduh
            const downloadBtn = target.closest('.btn-download-card');
            if (downloadBtn) {
                const cardIdx = parseInt(downloadBtn.dataset.cardIndex);
                const activeTab = appState.getActiveTab();
                const card = activeTab?.data?.aiCards[cardIdx];
                
                if (card) {
                    executeDownload(card.items, card.title);
                }
                return;
            }

            // Individual Card Action: Simpan
            const saveBtn = target.closest('.btn-save-card');
            if (saveBtn) {
                const cardIdx = parseInt(saveBtn.dataset.cardIndex);
                const activeTab = appState.getActiveTab();
                const card = activeTab?.data?.aiCards[cardIdx];
                
                if (card) {
                    saveToHistory(card.items, card.title);
                    if (window.showBMEAlert) window.showBMEAlert(`Invoice "${card.title}" berhasil disimpan ke riwayat!`, "success");
                }
                return;
            }
        });
    }

    // ── PORTAL ESCAPE ACTIONS ─────────────────────────────────
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-selected') && !e.target.closest('.select-items-portal')) {
            document.querySelectorAll('.select-items-portal').forEach(el => el.remove());
        }
    });

    document.addEventListener('scroll', (e) => {
        if (e.target.closest && e.target.closest('.select-items-portal')) return;
        document.querySelectorAll('.select-items-portal').forEach(el => el.remove());
    }, true);

    // ── INPUT CHANGES HANDLERS FOR INLINE EDITING ──────────────
    if (outputContainer) {
        outputContainer.addEventListener('input', (e) => {
            const target = e.target;
            const cardIdx = parseInt(target.dataset.cardIndex);
            const itemIdx = parseInt(target.dataset.itemIndex);
            
            const activeTab = appState.getActiveTab();
            const cards = activeTab?.data?.aiCards || [];

            if (isNaN(cardIdx)) return;

            // 1. Title Input
            if (target.classList.contains('ai-card-title-input')) {
                cards[cardIdx].title = target.value;
                if (!target.value.trim()) {
                    target.classList.add('required-empty-orange');
                } else {
                    target.classList.remove('required-empty-orange');
                }
            }

            // 2. Item Name Input
            else if (target.classList.contains('item-name')) {
                cards[cardIdx].items[itemIdx].name = target.value;
                if (!target.value.trim()) {
                    target.classList.add('required-empty-orange');
                } else {
                    target.classList.remove('required-empty-orange');
                }
            }

            // 3. Qty Input
            else if (target.classList.contains('item-qty')) {
                const qtyVal = parseInt(target.value) || 0;
                cards[cardIdx].items[itemIdx].qty = qtyVal;
                if (qtyVal <= 0) {
                    target.classList.add('required-empty-orange');
                } else {
                    target.classList.remove('required-empty-orange');
                }
            }

            // 4. Harga / Price Input
            else if (target.classList.contains('item-price-format')) {
                const raw = target.value.replace(/\D/g, '');
                const num = parseInt(raw) || 0;
                cards[cardIdx].items[itemIdx].price = num;
                
                if (raw === '') target.value = '';
                else target.value = formatNumberStr(raw);

                if (num <= 0) {
                    target.classList.add('required-empty-orange');
                } else {
                    target.classList.remove('required-empty-orange');
                }
            }

            // 5. Note Input
            else if (target.classList.contains('item-note')) {
                cards[cardIdx].items[itemIdx].note = target.value;
                autoResize(target);
                if (!target.value.trim()) {
                    target.classList.add('required-empty-orange');
                } else {
                    target.classList.remove('required-empty-orange');
                }
            }

            appState.updateActiveTabData({ aiCards: cards });
        });
    }

    // ── STICKY ACTION BAR FUNCTIONS (Normal & Select) ───────────
    const exitSelectMode = () => {
        selectModeActive = false;
        selectedCardsSet.clear();
        if (outputContainer) outputContainer.classList.remove('select-mode-active');
        
        // Remove .is-selected classes
        if (outputContainer) {
            outputContainer.querySelectorAll('.ai-card').forEach(card => card.classList.remove('is-selected'));
        }

        if (actionNormal) actionNormal.style.display = 'flex';
        if (actionSelect) {
            actionSelect.style.display = 'none';
            actionSelect.classList.add('hidden');
        }
        updateSelectBadge();
    };

    const updateSelectBadge = () => {
        if (selectBadge) {
            selectBadge.textContent = selectedCardsSet.size;
        }
    };

    // 1. Normal: Pilih (Select Mode)
    btnSelectMode?.addEventListener('click', () => {
        selectModeActive = true;
        if (outputContainer) outputContainer.classList.add('select-mode-active');
        
        if (actionNormal) actionNormal.style.display = 'none';
        if (actionSelect) {
            actionSelect.style.display = 'flex';
            actionSelect.classList.remove('hidden');
        }
        updateSelectBadge();
    });

    // 2. Select: Escape / Kembali
    btnExitSelect?.addEventListener('click', () => {
        exitSelectMode();
    });

    // 3. Normal: Hapus Semua
    btnDeleteAll?.addEventListener('click', () => {
        const activeTab = appState.getActiveTab();
        const cards = activeTab?.data?.aiCards || [];
        if (cards.length === 0) return;

        if (window.showBMEAlert) {
            window.showBMEAlert("Hapus seluruh hasil generate AI?", "error", {
                confirm: true,
                onConfirm: () => {
                    appState.updateActiveTabData({ aiCards: [] });
                    exitSelectMode();
                    renderAICards();
                }
            });
        }
    });

    // 4. Normal: Simpan Semua
    btnSaveAll?.addEventListener('click', () => {
        const activeTab = appState.getActiveTab();
        const cards = activeTab?.data?.aiCards || [];
        if (cards.length === 0) return;

        cards.forEach(card => {
            saveToHistory(card.items, card.title);
        });

        if (window.showBMEAlert) {
            window.showBMEAlert(`Berhasil menyimpan ${cards.length} invoice ke riwayat!`, "success");
        }
    });

    // 5. Select: Hapus Terpilih
    btnDeleteSelected?.addEventListener('click', () => {
        if (selectedCardsSet.size === 0) {
            if (window.showBMEAlert) window.showBMEAlert("Silakan pilih minimal 1 data terlebih dahulu!", "warning");
            return;
        }

        if (window.showBMEAlert) {
            window.showBMEAlert(`Hapus ${selectedCardsSet.size} data terpilih?`, "error", {
                confirm: true,
                onConfirm: () => {
                    const activeTab = appState.getActiveTab();
                    let cards = activeTab?.data?.aiCards || [];
                    
                    // Filter out selected ones
                    cards = cards.filter(card => !selectedCardsSet.has(card.id));
                    
                    appState.updateActiveTabData({ aiCards: cards });
                    exitSelectMode();
                    renderAICards();
                }
            });
        }
    });

    // 6. Select: Simpan Terpilih
    btnSaveSelected?.addEventListener('click', () => {
        if (selectedCardsSet.size === 0) {
            if (window.showBMEAlert) window.showBMEAlert("Silakan pilih minimal 1 data terlebih dahulu!", "warning");
            return;
        }

        const activeTab = appState.getActiveTab();
        const cards = activeTab?.data?.aiCards || [];
        let count = 0;

        cards.forEach(card => {
            if (selectedCardsSet.has(card.id)) {
                saveToHistory(card.items, card.title);
                count++;
            }
        });

        exitSelectMode();
        if (window.showBMEAlert) {
            window.showBMEAlert(`Berhasil menyimpan ${count} data terpilih ke riwayat!`, "success");
        }
    });

    // 7. Select: Unduh Terpilih
    btnDownloadSelected?.addEventListener('click', async () => {
        if (selectedCardsSet.size === 0) {
            if (window.showBMEAlert) window.showBMEAlert("Silakan pilih minimal 1 data terlebih dahulu!", "warning");
            return;
        }

        const activeTab = appState.getActiveTab();
        const cards = activeTab?.data?.aiCards || [];
        const selectedCards = cards.filter(c => selectedCardsSet.has(c.id));

        const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';

        if (defaultMethod === 'pdf') {
            const pageMode = appState.state.settings.pdfPageMode || 'single';
            pdfPrintQueue._reset();
            
            selectedCards.forEach(card => {
                const { items, title } = card;
                if (pageMode === 'combined') {
                    const html = buildCombinedPDFHTML(items, title);
                    pdfPrintQueue.add(`${title} (Invoice + SJ)`, () => {
                        const w = window.open('', '_blank');
                        if (!w) return;
                        w.document.open(); w.document.write(html); w.document.close();
                        w.document.title = title;
                        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                    });
                } else {
                    const invHtml = buildInvoiceHTML(items, title);
                    const sjHtml  = buildSuratJalanHTML(items);
                    pdfPrintQueue
                        .add(`Invoice — ${title}`, () => {
                            const w = window.open('', '_blank');
                            if (!w) return;
                            w.document.open(); w.document.write(invHtml); w.document.close();
                            w.document.title = `Invoice-${title}`;
                            setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                        })
                        .add(`Surat Jalan — ${title}`, () => {
                            const w = window.open('', '_blank');
                            if (!w) return;
                            w.document.open(); w.document.write(sjHtml); w.document.close();
                            w.document.title = `Surat Jalan-${title}`;
                            setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                        });
                }
            });
            pdfPrintQueue.start();
        } else {
            // PNG or JPEG download sequentially
            for (const card of selectedCards) {
                await executeDownload(card.items, card.title, defaultMethod);
                await new Promise(r => setTimeout(r, 400));
            }
        }

        exitSelectMode();
    });

    // ── EXTERNAL DOWNLOAD INTEGRATION ────────────────────────
    const executeDownload = async (items, title, format) => {
        const formatToUse = format || appState.state.settings.defaultDownloadMethod || 'pdf';

        if (formatToUse === 'pdf') {
            const pdfMode = appState.state.settings.pdfPageMode || 'single';
            pdfPrintQueue._reset();
            
            if (pdfMode === 'combined') {
                const html = buildCombinedPDFHTML(items, title);
                pdfPrintQueue.add(`${title} (Invoice + Surat Jalan)`, () => {
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open(); w.document.write(html); w.document.close();
                    w.document.title = title;
                    setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                });
            } else {
                const invHtml = buildInvoiceHTML(items, title);
                const sjHtml  = buildSuratJalanHTML(items);
                pdfPrintQueue
                    .add(`Invoice — ${title}`, () => {
                        const w = window.open('', '_blank');
                        if (!w) return;
                        w.document.open(); w.document.write(invHtml); w.document.close();
                        w.document.title = `Invoice-${title}`;
                        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                    })
                    .add(`Surat Jalan — ${title}`, () => {
                        const w = window.open('', '_blank');
                        if (!w) return;
                        w.document.open(); w.document.write(sjHtml); w.document.close();
                        w.document.title = `Surat Jalan-${title}`;
                        setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 300);
                    });
            }
            pdfPrintQueue.start();
        } else {
            const sourceInvoice = buildInvoiceHTML;
            const sourceLetter  = buildSuratJalanHTML;
            await exportBothDocuments(sourceInvoice, sourceLetter, items, title, formatToUse);
        }
    };

    const saveToHistory = (items, title) => {
        const today = new Date();
        appState.addToHistory({
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: title || 'Untitled',
            date: `${today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${today.getHours()}.${String(today.getMinutes()).padStart(2, '0')}`,
            items: JSON.parse(JSON.stringify(items)),
            timestamp: Date.now(),
            cardMode: appState.state.manualCardMode || 'simple'
        });
    };

    // ── INITIAL LAUNCH ON TAB SWITCH ────────────────────────
    document.addEventListener('tab-switched', (e) => {
        if (e.detail.mode === 'ai') {
            exitSelectMode();
            renderAICards();
        }
    });

    // Render immediately on init if currently in AI tab
    const currentMode = appState.getActiveTab()?.mode;
    if (currentMode === 'ai') {
        exitSelectMode();
        renderAICards();
    }
}
