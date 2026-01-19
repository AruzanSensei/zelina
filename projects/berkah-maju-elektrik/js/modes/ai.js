/**
 * AI Mode Logic (Simulated)
 */

export function initAIMode() {
    const btnGenerate = document.getElementById('btn-ai-generate');
    const promptInput = document.getElementById('ai-prompt');
    const titleInput = document.getElementById('ai-title');

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

                // If the number is suspiciously small (like dates or qty), maybe it's not price
                // unless explicitly stated? For now assume > 500 is price.
                if (p > 500) {
                    price = p;
                    // remove price from name
                    name = name.replace(priceMatch[0], '').trim();
                }
            }

            // Extract Qty (e.g., 5pcs, 10x, 5 buah)
            const qtyMatch = line.match(/(\d+)\s*(pcs|bh|buah|x|batang|btn|lembar)/i);
            if (qtyMatch) {
                qty = parseInt(qtyMatch[1]);
                name = name.replace(qtyMatch[0], '').trim();
            } else {
                // Check for just numbers at start
                const startNum = line.match(/^(\d+)\s+/);
                if (startNum && !price) { // if price was found, this might be price? No, price logic is separate
                    // It's ambiguous. Let's assume if < 100 it's qty
                    if (parseInt(startNum[1]) < 100) {
                        qty = parseInt(startNum[1]);
                        name = name.replace(startNum[0], '').trim();
                    }
                }
            }

            // Cleanup name
            name = name.replace(/harga|rp|@/gi, '').trim();

            // Fallback dummy price if 0 (Simulating AI "guessing" price)
            if (price === 0) {
                // Random realistic price between 10k and 100k
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

            // Fire event to switch to Manual mode with data
            const event = new CustomEvent('ai-generated', {
                detail: {
                    items: items,
                    title: titleInput.value || "Invoice AI Generated"
                }
            });
            document.dispatchEvent(event);

            // Switch tab UI to manual
            document.querySelector('[data-tab="manual"]').click();

            btnGenerate.innerHTML = 'Generate <i class="fa-solid fa-wand-magic-sparkles"></i>';
            promptInput.value = ''; // Clear
        }, 1500); // Fake delay
    });
}
