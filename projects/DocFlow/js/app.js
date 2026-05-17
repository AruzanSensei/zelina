/**
 * DocFlow — Main Application Entry Point
 */

import { appState } from './state.js';
import { getAllTemplates, getTemplate } from './templates/registry.js';
import { fetchTemplate, renderTemplate, resolveFileName } from './engine.js';
import {
    renderTemplateSelector, renderExtraFields, renderTableHeader, renderTableBody,
    addItem, removeItem, collectExtraFields, collectItems, renderTemplateCards
} from './forms.js';
import { exportToPNG, exportToJPEG } from './pdf/imageExporter.js';

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // TAB SWITCHING
    // ============================================
    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');
    const actionBar = document.getElementById('action-bar');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;

            views.forEach(v => {
                if (v.id === `${target}-view`) v.classList.remove('hidden');
                else v.classList.add('hidden');
            });

            // Show action bar only on generator tab
            if (actionBar) {
                actionBar.classList.toggle('hidden', target !== 'generator');
            }
        });
    });

    // ============================================
    // TEMPLATES TAB
    // ============================================
    renderTemplateCards();

    // Click template card → switch to generator with that template
    document.getElementById('template-grid')?.addEventListener('click', (e) => {
        const card = e.target.closest('.template-card');
        if (!card) return;

        const templateId = card.dataset.template;
        appState.updateCurrentDoc({ templateId });

        // Switch to generator tab
        document.querySelector('[data-tab="generator"]')?.click();
        initGenerator();
    });

    // ============================================
    // GENERATOR TAB
    // ============================================
    const templateSelector = document.getElementById('template-selector');

    function initGenerator() {
        renderTemplateSelector();
        const templateId = appState.state.currentDoc.templateId;
        if (templateSelector) templateSelector.value = templateId;
        renderExtraFields(templateId);
        renderTableHeader(templateId);
        renderTableBody(templateId);
        updatePreview();
    }

    if (templateSelector) {
        templateSelector.addEventListener('change', (e) => {
            appState.updateCurrentDoc({ templateId: e.target.value, items: [], data: {} });
            initGenerator();
        });
    }

    // Add item button
    document.getElementById('btn-add-item')?.addEventListener('click', () => {
        // Save current state first
        saveFormState();
        const templateId = appState.state.currentDoc.templateId;
        addItem(templateId);
        renderTableBody(templateId);
        updatePreview();
    });

    // Remove item (delegated)
    document.getElementById('items-tbody')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-item');
        if (!btn) return;
        const index = parseInt(btn.dataset.index);
        saveFormState();
        removeItem(index);
        renderTableBody(appState.state.currentDoc.templateId);
        updatePreview();
    });

    // Live update on input change (delegated)
    document.getElementById('items-tbody')?.addEventListener('input', debounce(() => {
        saveFormState();
        updatePreview();
    }, 300));

    document.getElementById('extra-fields-container')?.addEventListener('input', debounce(() => {
        saveFormState();
        updatePreview();
    }, 300));

    document.getElementById('doc-title')?.addEventListener('input', debounce(() => {
        saveFormState();
        updatePreview();
    }, 300));

    // ============================================
    // PREVIEW
    // ============================================
    async function updatePreview() {
        const previewGrid = document.getElementById('preview-grid');
        if (!previewGrid) return;

        const templateId = appState.state.currentDoc.templateId;
        const template = getTemplate(templateId);
        if (!template) return;

        const data = { ...appState.state.currentDoc.data, judul: appState.state.currentDoc.title };
        const items = appState.state.currentDoc.items || [];

        // Render all templates in the export group
        const group = template.exportGroup;
        previewGrid.dataset.count = String(group.length);
        previewGrid.innerHTML = '';

        for (const docId of group) {
            const docTemplate = getTemplate(docId);
            if (!docTemplate) continue;

            const rawHtml = await fetchTemplate(docTemplate.htmlFile);
            if (!rawHtml) continue;

            const rendered = renderTemplate(rawHtml, data, items, docTemplate);

            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `
                <div class="preview-card-header">
                    <span>${docTemplate.name}</span>
                    <i class="fa-solid fa-expand" style="cursor:pointer; color:var(--text-muted);"></i>
                </div>
                <div class="preview-card-body">
                    <iframe srcdoc="${escapeAttr(rendered)}"></iframe>
                </div>`;

            // Scale iframe to fit
            const iframe = card.querySelector('iframe');
            card.querySelector('.preview-card-body').addEventListener('click', () => {
                openFullPreview(docTemplate, rendered);
            });

            previewGrid.appendChild(card);

            // Auto-scale after iframe loads
            iframe.onload = () => {
                const body = card.querySelector('.preview-card-body');
                const bodyW = body.clientWidth;
                const scale = bodyW / 794; // 210mm ≈ 794px
                iframe.style.transform = `scale(${scale})`;
            };
        }
    }

    function openFullPreview(docTemplate, renderedHtml) {
        const modal = document.getElementById('preview-modal');
        const title = document.getElementById('preview-modal-title');
        const body = document.getElementById('preview-modal-body');
        if (!modal || !body) return;

        title.textContent = docTemplate.name;
        body.innerHTML = `<iframe srcdoc="${escapeAttr(renderedHtml)}" style="width:100%; height:70vh; border:1px solid var(--border); border-radius:var(--radius-md);"></iframe>`;

        // Download button
        const dlBtn = document.getElementById('preview-download-btn');
        if (dlBtn) {
            dlBtn.onclick = async () => {
                const method = appState.state.settings.defaultDownloadMethod || 'png';
                const data = { ...appState.state.currentDoc.data, judul: appState.state.currentDoc.title };
                const filename = resolveFileName(docTemplate, data);

                if (method === 'pdf') {
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open();
                    w.document.write(renderedHtml);
                    w.document.close();
                    w.document.title = filename;
                    setTimeout(() => { w.focus(); w.print(); }, 300);
                } else if (method === 'jpeg') {
                    await exportToJPEG(renderedHtml, filename);
                } else {
                    await exportToPNG(renderedHtml, filename);
                }
                showAlert('Berhasil mengunduh!', true);
            };
        }

        modal.classList.add('active');
    }

    document.getElementById('close-preview-modal')?.addEventListener('click', () => {
        document.getElementById('preview-modal')?.classList.remove('active');
    });

    // ============================================
    // GENERATE & DOWNLOAD
    // ============================================
    document.getElementById('btn-generate')?.addEventListener('click', async () => {
        saveFormState();

        const templateId = appState.state.currentDoc.templateId;
        const template = getTemplate(templateId);
        if (!template) return;

        const title = appState.state.currentDoc.title;
        const items = appState.state.currentDoc.items || [];

        if (!title) {
            showAlert('Judul dokumen wajib diisi!');
            return;
        }

        if (items.length === 0) {
            showAlert('Tambahkan minimal 1 item!');
            return;
        }

        const data = { ...appState.state.currentDoc.data, judul: title };
        const method = appState.state.settings.defaultDownloadMethod || 'png';

        showAlert('Mengekspor dokumen... <i class="fa-solid fa-spinner fa-spin"></i>');

        for (const docId of template.exportGroup) {
            const docTemplate = getTemplate(docId);
            if (!docTemplate) continue;

            const rawHtml = await fetchTemplate(docTemplate.htmlFile);
            if (!rawHtml) continue;

            const rendered = renderTemplate(rawHtml, data, items, docTemplate);
            const filename = resolveFileName(docTemplate, data);

            if (method === 'pdf') {
                const w = window.open('', '_blank');
                if (w) {
                    w.document.open();
                    w.document.write(rendered);
                    w.document.close();
                    w.document.title = filename;
                    setTimeout(() => { w.focus(); w.print(); }, 300);
                }
            } else if (method === 'jpeg') {
                await exportToJPEG(rendered, filename);
            } else {
                await exportToPNG(rendered, filename);
            }

            // Small delay between exports
            await new Promise(r => setTimeout(r, 500));
        }

        // Save to history
        appState.addToHistory({
            id: Date.now(),
            templateId,
            title,
            date: new Date().toLocaleString('id-ID'),
            items: [...items],
            data: { ...data }
        });

        showAlert('Dokumen berhasil di-generate!', true);
        renderHistory();
    });

    // ============================================
    // RESET
    // ============================================
    document.getElementById('btn-reset-form')?.addEventListener('click', () => {
        appState.resetCurrentDoc();
        initGenerator();
        showAlert('Form direset.', true);
    });

    // ============================================
    // HISTORY TAB
    // ============================================
    function renderHistory() {
        const list = document.getElementById('history-list');
        const empty = document.getElementById('history-empty');
        if (!list) return;

        const history = appState.state.history || [];

        if (history.length === 0) {
            list.innerHTML = '';
            empty?.classList.remove('hidden');
            return;
        }
        empty?.classList.add('hidden');

        list.innerHTML = history.map((entry, i) => `
            <div class="card" style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <div class="card-title">${entry.title}</div>
                    <div class="text-sm text-muted">${entry.date} · ${getTemplate(entry.templateId)?.name || entry.templateId}</div>
                </div>
                <button class="btn-icon btn-outline btn-delete-history" data-index="${i}" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    document.getElementById('history-list')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-delete-history');
        if (!btn) return;
        appState.removeFromHistory(parseInt(btn.dataset.index));
        renderHistory();
    });

    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
        if (appState.state.history.length === 0) return;
        appState.clearHistory();
        renderHistory();
        showAlert('Riwayat dihapus.', true);
    });

    // ============================================
    // CLIENTS TAB
    // ============================================
    function renderClients() {
        const list = document.getElementById('client-list');
        const empty = document.getElementById('clients-empty');
        if (!list) return;

        // For now, clients managed via localStorage (same as the rest)
        const clients = JSON.parse(localStorage.getItem('docflow_clients') || '[]');

        if (clients.length === 0) {
            list.innerHTML = '';
            empty?.classList.remove('hidden');
            return;
        }
        empty?.classList.add('hidden');

        list.innerHTML = clients.map((client, i) => `
            <div class="client-item">
                <div class="client-item-info">
                    <div class="client-avatar">${client.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h4>${client.name}</h4>
                        <p>${client.documents?.length || 0} dokumen</p>
                    </div>
                </div>
                <div class="client-item-actions">
                    <button class="btn-icon btn-outline btn-view-client" data-index="${i}" title="Lihat">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button class="btn-icon btn-outline btn-delete-client" data-index="${i}" title="Hapus">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Add client modal
    document.getElementById('btn-add-client')?.addEventListener('click', () => {
        document.getElementById('add-client-modal')?.classList.add('active');
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-name').focus();
    });

    document.getElementById('close-client-modal')?.addEventListener('click', () => {
        document.getElementById('add-client-modal')?.classList.remove('active');
    });

    document.getElementById('btn-save-client')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-client-name');
        const name = nameInput?.value.trim();
        if (!name) {
            showAlert('Nama klien wajib diisi!');
            return;
        }

        const clients = JSON.parse(localStorage.getItem('docflow_clients') || '[]');
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        clients.push({
            id,
            name,
            folderPath: `Client/${id}`,
            createdAt: new Date().toISOString(),
            documents: []
        });

        localStorage.setItem('docflow_clients', JSON.stringify(clients));
        document.getElementById('add-client-modal')?.classList.remove('active');
        renderClients();
        showAlert(`Klien "${name}" berhasil ditambahkan!`, true);
    });

    document.getElementById('client-list')?.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.btn-delete-client');
        if (delBtn) {
            const clients = JSON.parse(localStorage.getItem('docflow_clients') || '[]');
            clients.splice(parseInt(delBtn.dataset.index), 1);
            localStorage.setItem('docflow_clients', JSON.stringify(clients));
            renderClients();
            showAlert('Klien dihapus.', true);
        }
    });

    // ============================================
    // HELPERS
    // ============================================
    function saveFormState() {
        const title = document.getElementById('doc-title')?.value || '';
        const data = collectExtraFields();
        const items = collectItems();
        appState.updateCurrentDoc({ title, data, items });
    }

    function showAlert(message, isSuccess = false) {
        const alertEl = document.getElementById('custom-alert');
        const messageEl = document.getElementById('alert-message');
        if (!alertEl || !messageEl) return;

        messageEl.innerHTML = isSuccess
            ? `${message} <i class="fa-solid fa-circle-check" style="color:var(--success);"></i>`
            : message;
        alertEl.classList.remove('hidden');
        alertEl.style.animation = 'slideDown 0.3s ease-out forwards';

        setTimeout(() => {
            alertEl.style.animation = 'slideUp 0.3s ease-in forwards';
            setTimeout(() => alertEl.classList.add('hidden'), 300);
        }, 2500);
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // ============================================
    // INIT
    // ============================================
    initGenerator();
    renderHistory();
    renderClients();
});
