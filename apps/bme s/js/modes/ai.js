/**
 * AI Mode Logic (Disabled / Locked)
 */

export function initAIMode() {
    const btnGenerate = document.getElementById('btn-ai-generate');
    const promptInput = document.getElementById('ai-prompt');
    const titleInput = document.getElementById('ai-title');

    // Disable all inputs
    if (titleInput) {
        titleInput.disabled = true;
        titleInput.placeholder = 'Mode AI Terkunci';
    }

    if (promptInput) {
        promptInput.disabled = true;
        promptInput.placeholder = 'Mode AI sedang tidak tersedia...';
    }

    if (btnGenerate) {
        btnGenerate.disabled = true;
        btnGenerate.style.opacity = '0.5';
        btnGenerate.style.cursor = 'not-allowed';
    }

    // Add locked overlay to AI view
    const aiView = document.getElementById('ai-view');
    if (aiView) {
        aiView.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.className = 'ai-locked-overlay';
        overlay.innerHTML = `
            <i class="fa-solid fa-lock"></i>
            <p>Mode AI Terkunci</p>
            <small>Fitur ini belum tersedia</small>
        `;
        aiView.appendChild(overlay);
    }
}
