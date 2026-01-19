/**
 * Settings & Template Logic
 */
import { appState } from '../state.js';

export function initSettings() {
    // ===================================
    // DOM Elements
    // ===================================
    const modal = document.getElementById('settings-modal');
    const btnParams = document.getElementById('btn-settings');
    const btnClose = document.querySelector('.close-modal');

    // Tabs
    const tabGeneral = document.getElementById('tab-general');
    const tabTemplates = document.getElementById('tab-templates');
    const viewGeneral = document.getElementById('settings-general');
    const viewTemplates = document.getElementById('settings-templates');

    // Template UI
    const templateList = document.getElementById('template-list');
    const btnAddTemplate = document.getElementById('btn-add-template');

    // ===================================
    // HELPER: Modal Control
    // ===================================
    const toggleModal = (show) => {
        if (show) modal.classList.add('active');
        else modal.classList.remove('active');
    };

    btnParams.addEventListener('click', () => toggleModal(true));
    btnClose.addEventListener('click', () => toggleModal(false));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    // ===================================
    // TAB LOGIC
    // ===================================
    tabGeneral.addEventListener('click', () => {
        tabGeneral.classList.add('active');
        tabTemplates.classList.remove('active');
        viewGeneral.style.display = 'block';
        viewTemplates.style.display = 'none';
        viewTemplates.classList.add('hidden');
    });

    tabTemplates.addEventListener('click', () => {
        tabTemplates.classList.add('active');
        tabGeneral.classList.remove('active');
        viewGeneral.style.display = 'none';
        viewTemplates.style.display = 'block';
        viewTemplates.classList.remove('hidden');
        renderTemplates(); // Refresh list
    });

    // ===================================
    // GENERAL SETTINGS
    // ===================================
    document.querySelectorAll('.setting-item .toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.parentElement;
            parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (e.target.dataset.theme) {
                const theme = e.target.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                appState.updateSettings({ theme });
            }
            if (e.target.dataset.lang) {
                const lang = e.target.dataset.lang;
                appState.updateSettings({ language: lang });
            }
        });
    });

    // Init Theme
    const currentTheme = appState.state.settings.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector(`[data-theme="${currentTheme}"]`).classList.add('active');

    // ===================================
    // TEMPLATE MANAGEMENT
    // ===================================

    // Helper to format currency
    const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    function renderTemplates() {
        templateList.innerHTML = '';
        const templates = appState.state.templates;

        if (templates.length === 0) {
            templateList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Belum ada template.</p>';
            return;
        }

        templates.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.style.padding = '10px';
            div.style.marginBottom = '8px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:600;">${t.name}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${t.items.length} Items</div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline use-template" data-index="${i}">Pakai</button>
                        <button class="btn btn-sm btn-outline delete-template" data-index="${i}" style="color:red; border-color:red; margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            templateList.appendChild(div);
        });
    }

    // Actions in List
    templateList.addEventListener('click', (e) => {
        const btnUse = e.target.closest('.use-template');
        const btnDel = e.target.closest('.delete-template');

        if (btnUse) {
            const idx = btnUse.dataset.index;
            const template = appState.state.templates[idx];
            // Dispatch to manual mode
            document.dispatchEvent(new CustomEvent('template-selected', { detail: { items: template.items } }));
            toggleModal(false);
        }

        if (btnDel) {
            if (confirm("Hapus template ini?")) {
                appState.state.templates.splice(btnDel.dataset.index, 1);
                appState.save('bme_templates', appState.state.templates); // Direct save for now
                renderTemplates();
            }
        }
    });

    // Add Template (Full List)
    btnAddTemplate.addEventListener('click', () => {
        const name = prompt("Nama Template Baru:");
        if (name) {
            const newTemplate = {
                id: Date.now(),
                name: name,
                items: JSON.parse(JSON.stringify(appState.state.invoiceItems))
            };
            appState.addTemplate(newTemplate);
            renderTemplates();
        }
    });


    // ===================================
    // TEMPLATE PICKER UI (For Single Item)
    // ===================================

    // We create a simpler "Item Template" concept? 
    // Wait, the prompt says "Template Item contains Nama Barang, Harga".
    // This implies there are "Single Item Templates" separate from "Full Invoice Templates".
    // My previous implementation assumed "Template" = "Whole Invoice".
    // "Template Item" seems to be a new data structure.

    // Let's modify AppState to have `itemTemplates` or just piggyback.
    // Prompt: "Template Item ... daftar Template Item ... Setiap Template Item berisi Nama Barang, Harga."
    // OK, let's create a new storage for this: `bme_item_templates`

    // Load Item Templates
    let itemTemplates = localStorage.getItem('bme_item_templates');
    itemTemplates = itemTemplates ? JSON.parse(itemTemplates) : [
        { name: "Kabel NYM 1.5mm", price: 5000 },
        { name: "Lampu LED 10W", price: 35000 },
        { name: "Saklar Single", price: 15000 }
    ];

    const saveItemTemplates = () => {
        localStorage.setItem('bme_item_templates', JSON.stringify(itemTemplates));
    };

    // Handler for "request-template-picker"
    document.addEventListener('request-template-picker', (e) => {
        const callback = e.detail.callback;

        // Create Modal UI dynamically
        const pickerOverlay = document.createElement('div');
        pickerOverlay.className = 'modal active';
        pickerOverlay.style.zIndex = '300'; // Above settings

        const content = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Pilih Barang</h2>
                    <button class="close-picker"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div id="picker-list" style="max-height: 50vh; overflow-y: auto;">
                        ${itemTemplates.map((t, idx) => `
                            <div class="item-card picker-item" data-index="${idx}" style="padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; cursor:pointer;">
                                <span>${t.name}</span>
                                <span style="font-weight:600;">${formatCurrency(t.price)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button id="btn-add-item-template" class="btn btn-outline btn-full" style="margin-top:10px;">
                        <i class="fa-solid fa-plus"></i> Tambah Item Baru
                    </button>
                </div>
            </div>
        `;
        pickerOverlay.innerHTML = content;
        document.body.appendChild(pickerOverlay);

        // Events
        pickerOverlay.addEventListener('click', (evt) => {
            // Close
            if (evt.target === pickerOverlay || evt.target.closest('.close-picker')) {
                pickerOverlay.remove();
            }

            // Select
            const itemEl = evt.target.closest('.picker-item');
            if (itemEl) {
                const idx = itemEl.dataset.index;
                callback(itemTemplates[idx]);
                pickerOverlay.remove();
            }

            // Add New
            if (evt.target.closest('#btn-add-item-template')) {
                const name = prompt("Nama Barang:");
                if (!name) return;
                const price = prompt("Harga:");
                if (!price) return;

                const newItem = { name, price: parseInt(price) || 0 };
                itemTemplates.push(newItem);
                saveItemTemplates();

                // Select immediately? "Template Item langsung tersedia di choices".
                // Yes, logic says "Select it".
                callback(newItem);
                pickerOverlay.remove();
            }
        });
    });

}
