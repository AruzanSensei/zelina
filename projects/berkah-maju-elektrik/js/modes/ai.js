/**
 * AI Mode Logic (Simulated)
 */

export function initAIMode() {
    const btnGenerate = document.getElementById('btn-ai-generate');
    const promptInput = document.getElementById('ai-prompt');
    const titleInput = document.getElementById('ai-title');

    // Auto-resize Textarea
    const autoResize = () => {
        promptInput.style.height = 'auto';
        promptInput.style.height = promptInput.scrollHeight + 'px';
    };
    promptInput.addEventListener('input', autoResize);

    const mockAIParser = (text) => {
        const lines = text.split(/\n|,/).filter(line => line.trim().length > 0);
        const items = [];

        lines.forEach(line => {
            let name = line.trim();
            let qty = 1;
            let price = 0;
            let note = "";

            // Simple heuristic parsing

            // Extract Price (e.g., 50k, 50.000)
            const priceMatch = line.match(/(\d+)[kK]|(\d+)[rR]b|(\d{1,3}(?:\.\d{3})*)/);
            if (priceMatch) {
                let p = priceMatch[0].toLowerCase().replace(/\./g, '');
                if (p.includes('k') || p.includes('r')) {
                    p = parseInt(p.replace(/[krba-z]/g, '')) * 1000;
                } else {
                    p = parseInt(p);
                }
                if (p > 500) {
                    price = p;
                    name = name.replace(priceMatch[0], '').trim();
                }
            }

            // Extract Qty
            const qtyMatch = line.match(/(\d+)\s*(pcs|bh|buah|x|batang|btn|lembar)/i);
            if (qtyMatch) {
                qty = parseInt(qtyMatch[1]);
                name = name.replace(qtyMatch[0], '').trim();
            } else {
                const startNum = line.match(/^(\d+)\s+/);
                if (startNum && !price) {
                    if (parseInt(startNum[1]) < 100) {
                        qty = parseInt(startNum[1]);
                        name = name.replace(startNum[0], '').trim();
                    }
                }
            }

            name = name.replace(/harga|rp|@/gi, '').trim();

            if (price === 0) {
                price = (Math.floor(Math.random() * 90) + 10) * 1000;
                note = "Estimasi Harga AI";
            }

            if (name.length > 2) {
                items.push({ name, qty, price, note });
            }
        });

        return items;
    };

    btnGenerate.addEventListener('click', () => {
        const prompt = promptInput.value;
        if (!prompt) return alert("Isi prompt terlebih dahulu!");

        btnGenerate.innerHTML = 'Thinking... <i class="fa-solid fa-spinner fa-spin"></i>';

        setTimeout(() => {
            const items = mockAIParser(prompt);

            // Overwrite Warning
            // Check state directly
            const currentItems = appState.state.invoiceItems;
            if (currentItems.length > 0 && (currentItems[0].name || currentItems.length > 1)) {
                if (!confirm("Hasil AI akan menggantikan data manual saat ini. Lanjutkan?")) {
                    btnGenerate.innerHTML = 'Generate <i class="fa-solid fa-wand-magic-sparkles"></i>';
                    return;
                }
            }

            // Fire event
            const event = new CustomEvent('ai-generated', {
                detail: {
                    items: items,
                    title: titleInput.value || "Invoice AI Generated"
                }
            });
            document.dispatchEvent(event);

            document.querySelector('[data-tab="manual"]').click();

            btnGenerate.innerHTML = 'Generate <i class="fa-solid fa-wand-magic-sparkles"></i>';
            promptInput.value = '';
            promptInput.style.height = 'auto'; // Reset
        }, 1500);
    });
}
