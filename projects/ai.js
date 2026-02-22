/**
 * AI Mode Logic (Disabled / Locked)
 */

export function initAIMode() {
    const btnGenerate = document.getElementById('btn-ai-generate');
    const promptInput = document.getElementById('ai-prompt');
    const titleInput = document.getElementById('ai-title');

    // ===== LOCKED: AI Mode is currently disabled =====
    const lockEl = (el) => {
        if (!el) return;
        el.disabled = true;
        el.style.opacity = '0.45';
        el.style.cursor = 'not-allowed';
        el.style.pointerEvents = 'none';
    };

    lockEl(promptInput);
    lockEl(titleInput);
    lockEl(btnGenerate);

    // Show locked banner in AI view
    const aiView = document.getElementById('ai-view');
    if (aiView) {
        const banner = document.createElement('div');
        banner.style.cssText = `
            margin: 12px 0 8px;
            padding: 10px 14px;
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            color: #856404;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        banner.innerHTML = '<i class="fa-solid fa-lock"></i> <span>Mode AI saat ini dinonaktifkan.</span>';
        aiView.insertBefore(banner, aiView.firstChild);
    }
}
