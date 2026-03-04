/**
 * DocFlow Template Engine
 * Fetches HTML template files and replaces {{placeholder}} variables with actual data.
 */

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

// Cache for fetched templates (avoids re-fetching)
const templateCache = {};

/**
 * Fetch a template HTML file and return its raw string
 */
export async function fetchTemplate(htmlFilePath) {
    if (templateCache[htmlFilePath]) {
        return templateCache[htmlFilePath];
    }

    try {
        const response = await fetch(htmlFilePath);
        if (!response.ok) throw new Error(`Template not found: ${htmlFilePath}`);
        const html = await response.text();
        templateCache[htmlFilePath] = html;
        return html;
    } catch (error) {
        console.error('[DocFlow Engine] Failed to fetch template:', error);
        return null;
    }
}

/**
 * Render a template with the given data
 * @param {string} htmlTemplate - Raw HTML string with {{placeholders}}
 * @param {object} data - Object with keys matching placeholder names
 * @param {array} items - Array of row objects for the table
 * @param {object} templateConfig - The template config from registry.js
 * @returns {string} Rendered HTML
 */
export function renderTemplate(htmlTemplate, data, items, templateConfig) {
    let html = htmlTemplate;

    // 1. Replace simple {{key}} placeholders with data values
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        html = html.replace(regex, value || '');
    }

    // 2. Replace date tokens
    const now = new Date();
    html = html.replace(/\{\{YYYY\}\}/g, String(now.getFullYear()));
    html = html.replace(/\{\{MM\}\}/g, String(now.getMonth() + 1).padStart(2, '0'));
    html = html.replace(/\{\{DD\}\}/g, String(now.getDate()).padStart(2, '0'));
    html = html.replace(/\{\{HH\}\}/g, String(now.getHours()).padStart(2, '0'));
    html = html.replace(/\{\{mm\}\}/g, String(now.getMinutes()).padStart(2, '0'));

    // 3. Replace table rows block: {{#items}} ... {{/items}}
    const itemsBlockRegex = /\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/;
    const itemsMatch = html.match(itemsBlockRegex);

    if (itemsMatch && items && items.length > 0) {
        const rowTemplate = itemsMatch[1];
        let renderedRows = '';

        items.forEach((item, index) => {
            let row = rowTemplate;
            row = row.replace(/\{\{_index\}\}/g, String(index + 1));

            // Replace each column value
            for (const col of templateConfig.tableColumns) {
                const val = item[col.id];
                let displayVal = '';

                if (col.type === 'currency' && val !== undefined) {
                    displayVal = formatNumber(Number(val) || 0);
                } else if (col.type === 'number' && val !== undefined) {
                    displayVal = String(val || 0);
                } else {
                    displayVal = String(val || '');
                }

                row = row.replace(new RegExp(`\\{\\{${col.id}\\}\\}`, 'g'), displayVal);
            }

            // Replace computed {{total}} if hasPriceTotal
            if (templateConfig.hasPriceTotal) {
                const qty = Number(item.qty) || 0;
                const price = Number(item.price) || 0;
                row = row.replace(/\{\{total\}\}/g, formatNumber(qty * price));
            }

            renderedRows += row;
        });

        html = html.replace(itemsBlockRegex, renderedRows);
    } else if (itemsMatch) {
        // No items — remove the block
        html = html.replace(itemsBlockRegex, '');
    }

    // 4. Replace {{grandTotal}} if applicable
    if (templateConfig.hasPriceTotal && items) {
        const grandTotal = items.reduce((sum, item) => {
            return sum + (Number(item.qty) || 0) * (Number(item.price) || 0);
        }, 0);
        html = html.replace(/\{\{grandTotal\}\}/g, formatNumber(grandTotal));
    }

    // 5. Clean up any remaining unreplaced placeholders
    html = html.replace(/\{\{[a-zA-Z_0-9]+\}\}/g, '');

    return html;
}

/**
 * Resolve the filename for a document export
 */
export function resolveFileName(template, data) {
    let filename = template.defaultFileName;

    for (const [key, value] of Object.entries(data)) {
        filename = filename.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    }

    const now = new Date();
    filename = filename.replace(/\{\{YYYY\}\}/g, String(now.getFullYear()));
    filename = filename.replace(/\{\{MM\}\}/g, String(now.getMonth() + 1).padStart(2, '0'));
    filename = filename.replace(/\{\{DD\}\}/g, String(now.getDate()).padStart(2, '0'));
    filename = filename.replace(/\{\{HH\}\}/g, String(now.getHours()).padStart(2, '0'));
    filename = filename.replace(/\{\{mm\}\}/g, String(now.getMinutes()).padStart(2, '0'));

    return filename;
}
