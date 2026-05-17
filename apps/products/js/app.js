const STORAGE_KEYS = {
    products: "products",
    meta: "products_meta",
    theme: "products_theme"
};

const state = {
    currentTab: "entry",
    query: "",
    filters: {
        model: "",
        capacity: "",
        voltage: ""
    },
    products: loadProducts(),
    selectedProductId: null,
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "light"
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    applyTheme(state.theme);
    hydrateSelectedProduct();
    renderAll();
});

function cacheElements() {
    elements.tabs = [...document.querySelectorAll(".tab-btn")];
    elements.views = [...document.querySelectorAll(".view")];
    elements.form = document.getElementById("product-form");
    elements.resetForm = document.getElementById("reset-form");
    elements.themeToggle = document.getElementById("theme-toggle");
    elements.capacity = document.getElementById("capacity");
    elements.voltage = document.getElementById("voltage");
    elements.frequency = document.getElementById("frequency");
    elements.model = document.getElementById("model");
    elements.password = document.getElementById("password");
    elements.previewProductName = document.getElementById("preview-product-name");
    elements.previewSerialNumber = document.getElementById("preview-serial-number");
    elements.previewProductNumber = document.getElementById("preview-product-number");
    elements.searchInput = document.getElementById("search-input");
    elements.filterModel = document.getElementById("filter-model");
    elements.filterCapacity = document.getElementById("filter-capacity");
    elements.filterVoltage = document.getElementById("filter-voltage");
    elements.clearFilters = document.getElementById("clear-filters");
    elements.productList = document.getElementById("product-list");
    elements.visibleCount = document.getElementById("visible-count");
    elements.selectedSummary = document.getElementById("selected-summary");
    elements.statTotal = document.getElementById("stat-total");
    elements.statModels = document.getElementById("stat-models");
    elements.statSerial = document.getElementById("stat-serial");
    elements.detailEmpty = document.getElementById("detail-empty");
    elements.detailCard = document.getElementById("detail-card");
    elements.toast = document.getElementById("toast");
    elements.detailFields = {
        product_name: document.getElementById("detail-product-name"),
        serial_number: document.getElementById("detail-serial-number"),
        product_number: document.getElementById("detail-product-number"),
        capacity: document.getElementById("detail-capacity"),
        voltage: document.getElementById("detail-voltage"),
        frequency: document.getElementById("detail-frequency"),
        model: document.getElementById("detail-model"),
        password: document.getElementById("detail-password")
    };
}

function bindEvents() {
    elements.tabs.forEach((tab) => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    ["input", "change"].forEach((eventName) => {
        [elements.capacity, elements.voltage, elements.frequency, elements.model, elements.password].forEach((input) => {
            input.addEventListener(eventName, renderGeneratorPreview);
        });
    });

    elements.form.addEventListener("submit", handleSubmit);
    elements.resetForm.addEventListener("click", () => {
        elements.form.reset();
        renderGeneratorPreview();
    });

    elements.themeToggle.addEventListener("click", () => {
        const nextTheme = state.theme === "light" ? "dark" : "light";
        applyTheme(nextTheme);
    });

    elements.searchInput.addEventListener("input", (event) => {
        state.query = event.target.value.trim();
        renderCatalog();
    });

    elements.filterModel.addEventListener("change", (event) => {
        state.filters.model = event.target.value;
        renderCatalog();
    });

    elements.filterCapacity.addEventListener("change", (event) => {
        state.filters.capacity = event.target.value;
        renderCatalog();
    });

    elements.filterVoltage.addEventListener("change", (event) => {
        state.filters.voltage = event.target.value;
        renderCatalog();
    });

    elements.clearFilters.addEventListener("click", () => {
        state.query = "";
        state.filters = {
            model: "",
            capacity: "",
            voltage: ""
        };
        elements.searchInput.value = "";
        elements.filterModel.value = "";
        elements.filterCapacity.value = "";
        elements.filterVoltage.value = "";
        renderCatalog();
    });
}

function handleSubmit(event) {
    event.preventDefault();

    const payload = {
        capacity: sanitizeField(elements.capacity.value),
        voltage: sanitizeField(elements.voltage.value),
        frequency: sanitizeField(elements.frequency.value),
        model: sanitizeField(elements.model.value, true),
        password: elements.password.value.trim()
    };

    if (Object.values(payload).some((value) => value === "")) {
        showToast("Semua field wajib diisi.");
        return;
    }

    const product = addProduct(payload);
    state.selectedProductId = product.id;
    elements.form.reset();
    renderAll();
    renderGeneratorPreview();
    switchTab("detail");
    showToast(`Produk ${product.product_name} berhasil disimpan.`);
}

function renderAll() {
    renderGeneratorPreview();
    renderStats();
    renderFilterOptions();
    renderCatalog();
    renderDetail();
}

function renderGeneratorPreview() {
    const capacity = sanitizeField(elements.capacity.value);
    const model = sanitizeField(elements.model.value, true);
    const nextMeta = getMeta();
    const previewSuffix = String(nextMeta.lastSequence + 1).padStart(4, "0");
    const previewIncrement = String(nextMeta.lastIncrement + 1).padStart(6, "0");

    elements.previewProductName.textContent = buildProductName(capacity || "0000", model || "MODEL");
    elements.previewSerialNumber.textContent = `XSI-XX000-X-${capacity || "0000"}-1-${previewSuffix}`;
    elements.previewProductNumber.textContent = `XXXXX-${previewIncrement}`;
}

function renderStats() {
    const models = new Set(state.products.map((product) => product.model));
    const lastProduct = state.products[0];

    elements.statTotal.textContent = String(state.products.length);
    elements.statModels.textContent = String(models.size);
    elements.statSerial.textContent = lastProduct ? lastProduct.serial_number : "-";
}

function renderFilterOptions() {
    syncSelectOptions(elements.filterModel, uniqueValues("model"), "All models");
    syncSelectOptions(elements.filterCapacity, uniqueValues("capacity"), "All capacities");
    syncSelectOptions(elements.filterVoltage, uniqueValues("voltage"), "All voltages");

    elements.filterModel.value = state.filters.model;
    elements.filterCapacity.value = state.filters.capacity;
    elements.filterVoltage.value = state.filters.voltage;
}

function renderCatalog() {
    const visibleProducts = findProduct(state.query, filterProducts(state.filters, state.products));
    elements.visibleCount.textContent = String(visibleProducts.length);

    const selected = getSelectedProduct();
    elements.selectedSummary.textContent = selected ? selected.product_name : "None";

    if (visibleProducts.length === 0) {
        elements.productList.innerHTML = `
            <div class="empty-state">
                <h3>Tidak ada hasil</h3>
                <p>Coba ubah kata kunci pencarian atau kombinasi filter yang sedang aktif.</p>
            </div>
        `;
        return;
    }

    elements.productList.innerHTML = visibleProducts.map((product) => {
        const isSelected = product.id === state.selectedProductId;
        return `
            <article class="product-item ${isSelected ? "is-selected" : ""}" data-product-id="${product.id}">
                <div class="product-main">
                    <div class="product-topline">
                        <div class="product-title">${escapeHtml(product.product_name)}</div>
                        <div class="chip-row">
                            <span class="chip">${escapeHtml(product.model)}</span>
                            <span class="chip">${escapeHtml(product.capacity)}</span>
                            <span class="chip">${escapeHtml(product.voltage)}</span>
                        </div>
                    </div>
                    <div class="serial-line">${escapeHtml(product.serial_number)}</div>
                    <div class="serial-line">${escapeHtml(product.product_number)}</div>
                </div>
                <button class="btn btn-outline item-action" type="button" data-open-detail="${product.id}">Open Detail</button>
            </article>
        `;
    }).join("");

    document.querySelectorAll("[data-open-detail]").forEach((button) => {
        button.addEventListener("click", () => {
            state.selectedProductId = button.dataset.openDetail;
            renderCatalog();
            renderDetail();
            switchTab("detail");
        });
    });
}

function renderDetail() {
    const product = getSelectedProduct();

    if (!product) {
        elements.detailEmpty.classList.remove("hidden");
        elements.detailCard.classList.add("hidden");
        return;
    }

    elements.detailEmpty.classList.add("hidden");
    elements.detailCard.classList.remove("hidden");

    Object.entries(elements.detailFields).forEach(([key, node]) => {
        node.textContent = product[key] || "-";
    });
}

function switchTab(targetTab) {
    state.currentTab = targetTab;
    elements.tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === targetTab);
    });

    elements.views.forEach((view) => {
        view.classList.toggle("hidden", view.id !== `${targetTab}-view`);
    });
}

function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    elements.themeToggle.textContent = theme === "light" ? "Dark" : "Light";
}

function loadProducts() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.products);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to load products:", error);
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function getMeta() {
    const fallback = {
        lastIncrement: 0,
        lastSequence: 0
    };

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.meta);
        if (!stored) {
            return fallback;
        }

        return {
            ...fallback,
            ...JSON.parse(stored)
        };
    } catch (error) {
        console.error("Failed to load product meta:", error);
        return fallback;
    }
}

function saveMeta(meta) {
    localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta));
}

function addProduct(data) {
    const meta = getMeta();
    const nextIncrement = meta.lastIncrement + 1;
    const nextSequence = meta.lastSequence + 1;

    const product = {
        id: createId(),
        product_name: buildProductName(data.capacity, data.model),
        serial_number: generateSerial(data.capacity, nextSequence, state.products),
        product_number: generateProductNumber(nextIncrement, state.products),
        capacity: data.capacity,
        voltage: data.voltage,
        frequency: data.frequency,
        model: data.model,
        password: data.password,
        created_at: new Date().toISOString()
    };

    state.products = [product, ...state.products];
    saveProducts(state.products);
    saveMeta({
        lastIncrement: nextIncrement,
        lastSequence: nextSequence
    });
    return product;
}

function getAllProducts() {
    return [...state.products];
}

function findProduct(query, products = getAllProducts()) {
    if (!query) {
        return [...products];
    }

    const normalizedQuery = normalize(query);

    return [...products]
        .map((product) => ({
            product,
            score: getSearchScore(product, normalizedQuery)
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score || compareDates(right.product, left.product))
        .map((entry) => entry.product);
}

function filterProducts(filters, products = getAllProducts()) {
    return products.filter((product) => {
        const modelMatch = !filters.model || normalize(product.model) === normalize(filters.model);
        const capacityMatch = !filters.capacity || normalize(product.capacity) === normalize(filters.capacity);
        const voltageMatch = !filters.voltage || normalize(product.voltage) === normalize(filters.voltage);
        return modelMatch && capacityMatch && voltageMatch;
    });
}

function generateSerial(capacity, sequence, products = getAllProducts()) {
    const suffix = String(sequence).padStart(4, "0");
    let serial = "";

    do {
        const randomBlock = `${randomLetters(2)}${randomDigits(3)}-${randomLetters(1)}`;
        serial = `XSI-${randomBlock}-${capacity}-1-${suffix}`;
    } while (products.some((product) => product.serial_number === serial));

    return serial;
}

function generateProductNumber(incrementId, products = getAllProducts()) {
    const padded = String(incrementId).padStart(6, "0");
    let productNumber = "";

    do {
        productNumber = `${randomAlphaNumeric(5)}-${padded}`;
    } while (products.some((product) => product.product_number === productNumber));

    return productNumber;
}

function getSelectedProduct() {
    return state.products.find((product) => product.id === state.selectedProductId) || null;
}

function hydrateSelectedProduct() {
    if (state.products.length > 0) {
        state.selectedProductId = state.products[0].id;
    }
}

function getSearchScore(product, query) {
    const serial = normalize(product.serial_number);
    const number = normalize(product.product_number);
    const name = normalize(product.product_name);

    if (serial === query) {
        return 300;
    }
    if (serial.includes(query)) {
        return 240;
    }
    if (number === query) {
        return 180;
    }
    if (number.includes(query)) {
        return 140;
    }
    if (name === query) {
        return 90;
    }
    if (name.includes(query)) {
        return 60;
    }
    return 0;
}

function buildProductName(capacity, model) {
    return `ETS-${capacity}.${model}`;
}

function uniqueValues(key) {
    return [...new Set(state.products.map((product) => product[key]).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function syncSelectOptions(select, values, emptyLabel) {
    const current = select.value;
    const options = [`<option value="">${emptyLabel}</option>`]
        .concat(values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`));
    select.innerHTML = options.join("");
    select.value = current;
}

function sanitizeField(value, uppercase = false) {
    const sanitized = value.trim().replace(/\s+/g, " ");
    return uppercase ? sanitized.toUpperCase() : sanitized;
}

function normalize(value) {
    return String(value || "").trim().toUpperCase();
}

function randomLetters(length) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let output = "";
    for (let index = 0; index < length; index += 1) {
        output += letters[Math.floor(Math.random() * letters.length)];
    }
    return output;
}

function randomDigits(length) {
    let output = "";
    for (let index = 0; index < length; index += 1) {
        output += String(Math.floor(Math.random() * 10));
    }
    return output;
}

function randomAlphaNumeric(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let output = "";
    for (let index = 0; index < length; index += 1) {
        output += characters[Math.floor(Math.random() * characters.length)];
    }
    return output;
}

function createId() {
    return `prd-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function compareDates(left, right) {
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove("hidden");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        elements.toast.classList.add("hidden");
    }, 2500);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
