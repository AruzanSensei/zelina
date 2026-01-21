document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const defaultData = {
        categories: ['Gadget', 'Outfit', 'Aksesoris', 'Hobi'],
        items: [],
        activityLog: []
    };

    let data = loadData();
    let currentViewMode = 'grid'; // 'grid' or 'table'

    // --- DOM ELEMENTS ---
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Dashboard Stats
    const statTotalItems = document.getElementById('stat-total-items');
    const statTotalCost = document.getElementById('stat-total-cost');
    const statBoughtItems = document.getElementById('stat-bought-items');
    const activityList = document.getElementById('recent-activity-list');

    // Wishlist Controls
    const btnViewCard = document.getElementById('btn-view-card');
    const btnViewTable = document.getElementById('btn-view-table');
    const wishlistContainer = document.getElementById('wishlist-content');

    // Inputs
    const itemInputName = document.getElementById('inp-name');
    const itemInputPrice = document.getElementById('inp-price');
    const itemInputCat = document.getElementById('inp-category');
    const btnAddItem = document.getElementById('btn-add-item');
    const btnAddCatTrigger = document.getElementById('btn-add-cat-trigger');

    // Selection Bar
    const selectionBar = document.getElementById('selection-bar');
    const selCount = document.getElementById('sel-count');
    const selTotal = document.getElementById('sel-total');

    // History
    const historyTableBody = document.getElementById('history-table-body');
    const emptyHistory = document.getElementById('empty-history');

    // Settings
    const categoryList = document.getElementById('category-list');
    const settingNewCat = document.getElementById('setting-new-cat');
    const btnSettingAddCat = document.getElementById('btn-setting-add-cat');
    const btnClearData = document.getElementById('btn-clear-data');

    // Modals
    const modalCat = document.getElementById('modal-cat');
    const modalCatInput = document.getElementById('modal-cat-input');
    const modalCatSave = document.getElementById('modal-cat-save');
    const modalCatCancel = document.getElementById('modal-cat-cancel');

    // Notification
    const toast = document.getElementById('toast');

    // --- INITIALIZATION ---
    init();

    function init() {
        renderAll();
        setupEventListeners();
        calculateDashboard();
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                const target = item.getAttribute('data-target');
                switchView(target);

                // Mobile: close sidebar on click
                if (window.innerWidth <= 768) sidebar.classList.remove('open');
            });
        });

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // View Toggles
        btnViewCard.addEventListener('click', () => setViewMode('grid'));
        btnViewTable.addEventListener('click', () => setViewMode('table'));

        // Core Actions
        btnAddItem.addEventListener('click', addNewItem);
        btnAddCatTrigger.addEventListener('click', () => toggleModal(true));

        // Modal Actions
        modalCatSave.addEventListener('click', addNewCategoryModal);
        modalCatCancel.addEventListener('click', () => toggleModal(false));

        // Settings Actions
        btnSettingAddCat.addEventListener('click', addNewCategorySetting);
        btnClearData.addEventListener('click', clearAllData);
    }

    // --- LOGIC FUNCTIONS ---

    function loadData() {
        const stored = localStorage.getItem('wishDataRefactored');
        return stored ? JSON.parse(stored) : defaultData;
    }

    function saveData() {
        localStorage.setItem('wishDataRefactored', JSON.stringify(data));
        renderAll();
        calculateDashboard();
    }

    function logActivity(text) {
        data.activityLog.unshift({ text, date: new Date().toISOString() });
        if (data.activityLog.length > 5) data.activityLog.pop();
    }

    function switchView(viewId) {
        viewSections.forEach(v => v.classList.remove('active'));
        document.getElementById(`${viewId}-view`).classList.add('active');
    }

    function setViewMode(mode) {
        currentViewMode = mode;
        if (mode === 'grid') {
            btnViewCard.classList.add('active');
            btnViewTable.classList.remove('active');
            wishlistContainer.classList.remove('table-view');
            wishlistContainer.classList.add('grid-view');
        } else {
            btnViewCard.classList.remove('active');
            btnViewTable.classList.add('active');
            wishlistContainer.classList.remove('grid-view');
            wishlistContainer.classList.add('table-view');
        }
        renderWishlist();
    }

    function addNewItem() {
        const name = itemInputName.value.trim();
        const price = parseFloat(itemInputPrice.value);
        const category = itemInputCat.value;

        if (!name || isNaN(price)) {
            showToast('Nama dan harga wajib diisi');
            return;
        }

        const item = {
            id: Date.now(),
            name,
            price,
            category,
            bought: false,
            selected: false,
            dateAdded: new Date().toISOString()
        };

        data.items.unshift(item); // Add to top
        logActivity(`Menambahkan item "${name}" ke wishlist.`);

        // Reset Inputs
        itemInputName.value = '';
        itemInputPrice.value = '';

        saveData();
        showToast('Item berhasil ditambahkan');
    }

    function addNewCategory(name) {
        if (name && !data.categories.includes(name)) {
            data.categories.push(name);
            saveData();
            showToast('Kategori baru dibuat');
            return true;
        }
        return false;
    }

    function addNewCategoryModal() {
        const name = modalCatInput.value.trim();
        if (addNewCategory(name)) {
            toggleModal(false);
            modalCatInput.value = '';
            itemInputCat.value = name; // Select it
        }
    }

    function addNewCategorySetting() {
        const name = settingNewCat.value.trim();
        if (addNewCategory(name)) {
            settingNewCat.value = '';
        }
    }

    function deleteItem(id) {
        if (confirm('Hapus item ini?')) {
            data.items = data.items.filter(i => i.id !== id);
            saveData();
            showToast('Item dihapus');
        }
    }

    function toggleBought(id) {
        const item = data.items.find(i => i.id === id);
        if (item) {
            item.bought = !item.bought;
            item.selected = false;

            if (item.bought) {
                item.dateBought = new Date().toISOString();
                logActivity(`Membeli item "${item.name}".`);
                showToast('Hore! Item berhasil dibeli');
            } else {
                delete item.dateBought;
                logActivity(`Mengembalikan "${item.name}" ke wishlist.`);
                showToast('Item dikembalikan ke wishlist');
            }
            saveData();
        }
    }

    function toggleSelection(id) {
        const item = data.items.find(i => i.id === id);
        if (item) {
            item.selected = !item.selected;
            saveData();
        }
    }

    function clearAllData() {
        if (confirm('Yakin ingin menghapus SEMUA data? Aksi ini tidak bisa dibatalkan.')) {
            localStorage.removeItem('wishDataRefactored');
            data = { categories: ['Umum'], items: [], activityLog: [] };
            location.reload();
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderAll() {
        renderCategories();
        renderWishlist();
        renderHistory();
        renderSettingsCats();
    }

    function renderCategories() {
        // Save current selection if possible
        const currentVal = itemInputCat.value;
        itemInputCat.innerHTML = '';
        data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            itemInputCat.appendChild(opt);
        });
        if (data.categories.includes(currentVal)) itemInputCat.value = currentVal;
    }

    function renderSettingsCats() {
        categoryList.innerHTML = '';
        data.categories.forEach(cat => {
            const li = document.createElement('li');
            li.textContent = cat;
            categoryList.appendChild(li);
        });
    }

    function renderWishlist() {
        wishlistContainer.innerHTML = '';
        const activeItems = data.items.filter(i => !i.bought);

        if (currentViewMode === 'grid') {
            // RENDER GRID
            if (activeItems.length === 0) {
                wishlistContainer.innerHTML = `<div class="empty-placeholder" style="grid-column: 1/-1">Wishlist kosong.</div>`;
                return;
            }

            activeItems.forEach(item => {
                const el = document.createElement('div');
                el.className = 'item-card';
                el.innerHTML = `
                    <div class="card-top">
                        <input type="checkbox" class="custom-checkbox" ${item.selected ? 'checked' : ''} onchange="window.app.toggleSel(${item.id})">
                        <span class="badge-cat">${item.category}</span>
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <div class="card-price">${formatRupiah(item.price)}</div>
                    <div class="card-actions">
                         <button class="btn-icon delete" onclick="window.app.del(${item.id})" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                         <button class="btn-icon check" onclick="window.app.buy(${item.id})" title="Tandai Dibeli"><i class="fa-solid fa-check"></i></button>
                    </div>
                `;
                wishlistContainer.appendChild(el);
            });

        } else {
            // RENDER TABLE
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th style="width: 40px"><i class="fa-solid fa-check-double"></i></th>
                        <th>Barang</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th style="text-align:right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeItems.map(item => `
                        <tr>
                            <td><input type="checkbox" class="custom-checkbox" ${item.selected ? 'checked' : ''} onchange="window.app.toggleSel(${item.id})"></td>
                            <td><strong>${item.name}</strong></td>
                            <td><span class="badge-cat">${item.category}</span></td>
                            <td>${formatRupiah(item.price)}</td>
                            <td style="text-align:right">
                                <button class="btn-icon delete" style="display:inline-flex" onclick="window.app.del(${item.id})"><i class="fa-solid fa-trash"></i></button>
                                <button class="btn-icon check" style="display:inline-flex" onclick="window.app.buy(${item.id})"><i class="fa-solid fa-check"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            if (activeItems.length === 0) {
                wishlistContainer.innerHTML = `<div class="empty-placeholder">Wishlist kosong.</div>`;
            } else {
                wishlistContainer.appendChild(table);
            }
        }

        updateSelectionBar();
    }

    function renderHistory() {
        const historyItems = data.items.filter(i => i.bought);
        historyTableBody.innerHTML = '';

        if (historyItems.length === 0) {
            emptyHistory.classList.remove('hidden');
            document.querySelector('.history-table-container').classList.add('hidden');
        } else {
            emptyHistory.classList.add('hidden');
            document.querySelector('.history-table-container').classList.remove('hidden');

            historyItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td><span class="badge-cat">${item.category}</span></td>
                    <td>${formatRupiah(item.price)}</td>
                    <td>${new Date(item.dateBought || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-text" onclick="window.app.buy(${item.id})" style="color:var(--primary)">
                            <i class="fa-solid fa-rotate-left"></i> Batal Beli
                        </button>
                    </td>
                `;
                historyTableBody.appendChild(tr);
            });
        }
    }

    function calculateDashboard() {
        const activeItems = data.items.filter(i => !i.bought);
        const boughtItems = data.items.filter(i => i.bought);

        statTotalItems.textContent = activeItems.length;
        statBoughtItems.textContent = boughtItems.length;

        const total = activeItems.reduce((sum, i) => sum + i.price, 0);
        statTotalCost.textContent = formatRupiah(total);

        // Render Activity
        activityList.innerHTML = '';
        if (data.activityLog.length === 0) {
            activityList.innerHTML = '<div class="empty-placeholder" style="padding:10px; font-size:0.9rem">Belum ada aktivitas.</div>';
        } else {
            data.activityLog.forEach(log => {
                const div = document.createElement('div');
                div.className = 'activity-item';
                div.innerHTML = `<strong>${new Date(log.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong> - ${log.text}`;
                activityList.appendChild(div);
            });
        }
    }

    function updateSelectionBar() {
        const selected = data.items.filter(i => !i.bought && i.selected);
        if (selected.length > 0) {
            selectionBar.classList.add('show');
            selCount.textContent = selected.length;
            selTotal.textContent = formatRupiah(selected.reduce((s, i) => s + i.price, 0));
        } else {
            selectionBar.classList.remove('show');
        }
    }

    function toggleModal(show) {
        if (show) {
            modalCat.classList.remove('hidden');
            modalCatInput.focus();
        } else {
            modalCat.classList.add('hidden');
        }
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 3000);
    }

    function formatRupiah(num) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    }

    // Expose Global
    window.app = {
        del: deleteItem,
        buy: toggleBought,
        toggleSel: toggleSelection
    }
});
