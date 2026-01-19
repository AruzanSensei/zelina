/**
 * Settings Logic
 */
import { appState } from '../state.js';

export function initSettings() {
    const modal = document.getElementById('settings-modal');
    const btnParams = document.getElementById('btn-settings');
    const btnClose = document.querySelector('.close-modal');

    // Toggle Modal
    const toggleModal = (show) => {
        if (show) modal.classList.add('active');
        else modal.classList.remove('active');
    };

    btnParams.addEventListener('click', () => toggleModal(true));
    btnClose.addEventListener('click', () => toggleModal(false));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    // Theme & Language Toggles
    document.querySelectorAll('.toggle-btn').forEach(btn => {
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
                // TODO: Update UI Text based on lang
            }
        });
    });

    // Init Theme from State
    const currentTheme = appState.state.settings.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector(`[data-theme="${currentTheme}"]`).classList.add('active');

    // Template Management
    const templateList = document.getElementById('template-list');

    const renderTemplates = (templates) => {
        templateList.innerHTML = '';
        templates.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'item-card'; // Reuse style
            div.style.padding = '10px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>${t.name}</b> (${t.items.length} items)</span>
                    <button class="btn btn-sm btn-primary use-template" data-index="${i}">Pilih</button>
                </div>
            `;
            templateList.appendChild(div);
        });
    };

    renderTemplates(appState.state.templates);

    // Template Actions
    templateList.addEventListener('click', (e) => {
        if (e.target.classList.contains('use-template')) {
            const idx = e.target.dataset.index;
            const template = appState.state.templates[idx];

            const event = new CustomEvent('template-selected', {
                detail: { items: template.items }
            });
            document.dispatchEvent(event);
            toggleModal(false);
        }
    });

    // Add Template (Simple version: save current manual items as template)
    document.getElementById('btn-add-template').addEventListener('click', () => {
        const name = prompt("Nama Template Baru:");
        if (name) {
            const newTemplate = {
                id: Date.now(),
                name: name,
                items: JSON.parse(JSON.stringify(appState.state.invoiceItems))
            };
            appState.addTemplate(newTemplate);
            renderTemplates(appState.state.templates);
        }
    });
}
