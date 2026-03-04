/**
 * DocFlow — Dynamic Form Builder
 * Reads template config from registry and generates form inputs dynamically.
 */

import { getTemplate, getAllTemplates } from './templates/registry.js';
import { appState } from './state.js';

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

/**
 * Render the template selector dropdown
 */
export function renderTemplateSelector() {
    const select = document.getElementById('template-selector');
    if (!select) return;

    const templates = getAllTemplates();
    select.innerHTML = templates.map(t =>
        `<option value="${t.id}">${t.name}</option>`
    ).join('');

    // Set current
    select.value = appState.state.currentDoc.templateId || templates[0]?.id;
}

/**
 * Render extra fields (non-table fields like "Kepada", "Tanggal")
 */
export function renderExtraFields(templateId) {
    const container = document.getElementById('extra-fields');
    if (!container) return;

    const template = getTemplate(templateId);
    if (!template) return;

    const currentData = appState.state.currentDoc.data || {};

    container.innerHTML = template.extraFields.map(field => {
        const value = currentData[field.id] || '';
        const isOptional = field.optional ? '<span class="text-muted text-sm"> (opsional)</span>' : '';

        if (field.type === 'date') {
            return `
                <div class="form-group">
                    <label class="form-label">${field.label}${isOptional}</label>
                    <input type="date" class="form-input extra-field" data-field-id="${field.id}" value="${value}">
                </div>`;
        }

        if (field.type === 'textarea') {
            return `
                <div class="form-group">
                    <label class="form-label">${field.label}${isOptional}</label>
                    <textarea class="form-textarea extra-field" data-field-id="${field.id}" placeholder="${field.placeholder || ''}">${value}</textarea>
                </div>`;
        }

        return `
            <div class="form-group">
                <label class="form-label">${field.label}${isOptional}</label>
                <input type="text" class="form-input extra-field" data-field-id="${field.id}" value="${value}" placeholder="${field.placeholder || ''}">
            </div>`;
    }).join('');
}

/**
 * Render table header based on template columns
 */
export function renderTableHeader(templateId) {
    const thead = document.getElementById('items-thead');
    if (!thead) return;

    const template = getTemplate(templateId);
    if (!template) return;

    const cols = template.tableColumns.filter(c => !c.optional || true); // Show all columns
    thead.innerHTML = `
        <tr>
            <th style="width:35px">#</th>
            ${cols.map(c => `<th>${c.label}</th>`).join('')}
            <th style="width:40px"></th>
        </tr>`;

    // Show/hide total row
    const totalRow = document.getElementById('total-row');
    if (totalRow) {
        totalRow.classList.toggle('hidden', !template.hasPriceTotal);
    }
}

/**
 * Render table body with item rows
 */
export function renderTableBody(templateId) {
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;

    const template = getTemplate(templateId);
    if (!template) return;

    const items = appState.state.currentDoc.items || [];
    const cols = template.tableColumns;

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${cols.length + 2}" class="text-center text-muted" style="padding:20px;">
                    Belum ada item. Klik "+ Tambah" untuk memulai.
                </td>
            </tr>`;
        updateTotal(templateId);
        return;
    }

    tbody.innerHTML = items.map((item, index) => `
        <tr data-index="${index}">
            <td class="text-center text-muted">${index + 1}</td>
            ${cols.map(col => {
        const val = item[col.id] || '';
        if (col.type === 'number') {
            return `<td><input type="number" class="item-input" data-col="${col.id}" data-index="${index}" value="${val}" min="0"></td>`;
        }
        if (col.type === 'currency') {
            return `<td><input type="number" class="item-input" data-col="${col.id}" data-index="${index}" value="${val}" min="0"></td>`;
        }
        return `<td><input type="text" class="item-input" data-col="${col.id}" data-index="${index}" value="${val}" placeholder="${col.placeholder || ''}"></td>`;
    }).join('')}
            <td>
                <button class="btn-icon btn-danger btn-remove-item" data-index="${index}" title="Hapus">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </td>
        </tr>
    `).join('');

    updateTotal(templateId);
}

/**
 * Update the total value display
 */
function updateTotal(templateId) {
    const template = getTemplate(templateId);
    if (!template || !template.hasPriceTotal) return;

    const items = appState.state.currentDoc.items || [];
    const total = items.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0) * (Number(item.price) || 0);
    }, 0);

    const totalEl = document.getElementById('total-value');
    if (totalEl) {
        totalEl.textContent = `Rp ${formatNumber(total)}`;
    }
}

/**
 * Add a new empty item row
 */
export function addItem(templateId) {
    const template = getTemplate(templateId);
    if (!template) return;

    const newItem = {};
    template.tableColumns.forEach(col => {
        newItem[col.id] = col.type === 'number' || col.type === 'currency' ? 0 : '';
    });

    const items = [...(appState.state.currentDoc.items || []), newItem];
    appState.setDocItems(items);
}

/**
 * Remove an item by index
 */
export function removeItem(index) {
    const items = [...(appState.state.currentDoc.items || [])];
    items.splice(index, 1);
    appState.setDocItems(items);
}

/**
 * Collect all extra field values from the DOM
 */
export function collectExtraFields() {
    const data = {};
    document.querySelectorAll('.extra-field').forEach(el => {
        data[el.dataset.fieldId] = el.value;
    });
    return data;
}

/**
 * Collect all item values from the DOM
 */
export function collectItems() {
    const items = [];
    const rows = document.querySelectorAll('#items-tbody tr[data-index]');
    rows.forEach(row => {
        const item = {};
        row.querySelectorAll('.item-input').forEach(input => {
            const col = input.dataset.col;
            const val = input.type === 'number' ? Number(input.value) || 0 : input.value;
            item[col] = val;
        });
        items.push(item);
    });
    return items;
}

/**
 * Render template cards on the Templates tab
 */
export function renderTemplateCards() {
    const grid = document.getElementById('template-grid');
    if (!grid) return;

    const templates = getAllTemplates();

    grid.innerHTML = templates.map(t => `
        <div class="template-card" data-template="${t.id}">
            <div class="template-icon">
                <i class="fa-solid fa-file-invoice"></i>
            </div>
            <h3>${t.name}</h3>
            <p>${t.tableColumns.length} kolom · ${t.extraFields.length} field · ${t.hasPriceTotal ? 'Total harga' : 'Tanpa harga'}</p>
            <div class="badge">${t.exportGroup.length} dok</div>
        </div>
    `).join('');
}
