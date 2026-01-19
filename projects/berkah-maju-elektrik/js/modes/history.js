/**
 * History Mode Logic
 */
import { appState } from '../state.js';
import { generatePDFs } from '../pdf/generator.js';

export function initHistoryMode() {
    const container = document.getElementById('history-list');

    const render = (history) => {
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Belum ada riwayat.</div>';
            return;
        }

        history.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <h4>${entry.title || 'Tanpa Judul'}</h4>
                    <p><small>${entry.date} | ${entry.items.length} Item</small></p>
                </div>
                <div class="history-actions">
                    <button class="icon-btn btn-copy" data-index="${index}" title="Edit / Copy">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button class="icon-btn btn-download" data-index="${index}" title="Download PDF">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    };

    // Initial Render
    render(appState.state.history);

    // Listen to changes
    appState.subscribe('history', (data) => {
        render(data);
    });

    // Event Delegation
    container.addEventListener('click', (e) => {
        const btnCopy = e.target.closest('.btn-copy');
        const btnDownload = e.target.closest('.btn-download');

        if (btnCopy) {
            const index = btnCopy.dataset.index;
            const entry = appState.state.history[index];

            // Send to manual mode
            const event = new CustomEvent('template-selected', {
                detail: { items: entry.items }
            });
            document.dispatchEvent(event);

            // Set title
            document.getElementById('manual-title').value = entry.title;

            // Switch tabs
            document.querySelector('[data-tab="manual"]').click();
        }

        if (btnDownload) {
            const index = btnDownload.dataset.index;
            const entry = appState.state.history[index];

            // Regenerate PDF
            // We need to trigger the generator with this entry's data
            // Since generator reads from state/DOM usually, we can pass data directly if we refactor generator,
            // or just use the generator function directly if it accepts args.
            // Let's make generator accept optional data.
            generatePDFs(entry.items, entry.title, true); // true = silent/download only (conceptually)
        }
    });
}
