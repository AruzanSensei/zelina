# Technical Report: Manual Mode Table System (BME Application)

## 1. Core Logic: "Excel-like Auto-Width"
The table system is designed to mimic Microsoft Excel behavior where column widths are determined by the longest content in each column.

### CSS Strategy:
- **`table-layout: auto`**: Default browser calculation for column widths.
- **`width: 1%` on `th` & `td`**: Forces the table to shrink-wrap every column to its minimum necessary width.
- **`white-space: nowrap`**: Prevents text from wrapping into multiple lines, forcing the column to expand horizontally instead.
- **`.table-view-container`**: A wrapper with `overflow-x: auto` to handle tables that exceed the screen width.

## 2. Dynamic Input Sizing
Since standard HTML `<input>` elements do not auto-expand to fit their text, we implemented a hybrid JS/CSS solution:
- **`size` Attribute**: In `manual.js`, the `size` attribute of inputs (Barang, Harga, Pcs) is updated in real-time based on `value.length`.
- **CSS `width: auto`**: Allows the `size` attribute to dictate the physical width of the input box, which in turn pushes the table cell's width.

## 3. Relevant Code Snippets

### A. JavaScript (`manual.js`) - Render Logic
```javascript
const renderTableView = () => {
    container.innerHTML = '';
    container.classList.add('table-view-container');
    const table = document.createElement('table');
    table.className = 'item-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Barang</th>
                <th>Harga</th>
                <th>Tipe</th>
                <th>Pcs</th>
                <th>Note</th>
                <th style="width:40px;"></th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item, index) => `
            <tr>
                <td>
                    <div class="input-with-icon">
                        <input type="text" class="item-name" data-index="${index}" value="${item.name || ''}">
                        <button class="template-picker-btn" data-index="${index}"><i data-lucide="list"></i></button>
                    </div>
                </td>
                <td><input type="text" class="item-price-format" value="${formatNumberStr(String(item.price))}" data-index="${index}" size="${Math.max(5, formatNumberStr(String(item.price)).length)}"></td>
                <td><select class="item-tipe" data-index="${index}">...</select></td>
                <td><input type="text" class="item-qty" value="${item.qty}" data-index="${index}" size="${Math.max(2, String(item.qty).length)}"></td>
                <td><textarea class="item-note" data-index="${index}">${item.note || ''}</textarea></td>
            </tr>
            `).join('')}
        </tbody>`;
    container.appendChild(table);
};
```

### B. CSS (`manual.css`) - Styling
```css
.item-table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: auto;
}
.item-table th, .item-table td {
    width: 1%;
    white-space: nowrap;
    padding: 8px;
}
.item-table td input {
    width: auto;
    border: none;
    background: transparent;
}
/* Note column is the only flexible one */
.item-table td:nth-child(5) {
    width: auto;
    min-width: 140px;
    white-space: normal;
}
```

## 4. Unresolved Issues
Despite the logic above, users still report **clipping/overlapping (tertimpa)** in the **Harga** and **Pcs** columns when entering long numbers.
- **Symptom**: The text inside the input box is cut off at the right edge, even though the column *seems* wide enough.
- **Symptom**: The input box doesn't always expand correctly when digits are added rapidly or when large initial values are rendered.

## 5. Root Cause Analysis
1. **Input Padding & Border**: Browser default styles for `input` might add internal padding or a `min-width` that conflicts with the `size` attribute calculation, causing the text to overflow internally.
2. **`size` Attribute Accuracy**: The `size` attribute is based on "average character width" of the font. For proportional fonts (like Inter/Roboto), it's just an estimate. Large numbers (wide digits like '8' vs '1') can cause clipping if the estimate is too tight.
3. **Table Layout Timing**: The browser's table layout engine calculates widths before some JS-driven attribute changes are fully propagated, or vice versa.
4. **`width: 100%` Inheritance**: Some global styles might still be forcing `width: 100%` on inputs, which inside a `width: 1%` table cell, leads to a "death spiral" where the input collapses to its minimum possible size.
5. **Box-Sizing**: Conflicts between `content-box` and `border-box` on inputs inside table cells can cause the perceived width to be smaller than the actual text width.

---

## 6. Fix Applied: Hidden Span via CSS Grid

### Diagnosis
The core problem is that the `size` attribute only estimates width based on average character width — not accurate for proportional fonts like Inter/Roboto, especially for numbers (digit `8` is much wider than `1`).

### Solution: CSS Grid + `::after` Pseudo-element

The `size` attribute logic is replaced with a **CSS Grid trick** where an invisible `::after` pseudo-element mirrors the input's value and forces the container to the exact correct width.

```
┌─ .input-sizer (display: inline-grid) ─────────────────┐
│  ::after { content: attr(data-value) }  ← INVISIBLE, measures real text width │
│  <input>                                ← overlaid on top, fills 100% width    │
└────────────────────────────────────────────────────────┘
```

Both `::after` and `<input>` share `grid-area: 1 / 1`, so they occupy the same space. The browser sizes the container to fit `::after` (which uses the exact same font as the input), and the input fills 100% of that width — **pixel-perfect accuracy, no estimation needed.**

### A. Updated CSS (`manual.css`)

```css
/* Core fix: Hidden Span via CSS Grid */
.input-sizer {
    display: inline-grid;
    align-items: center;
    grid-template-columns: 1fr;
    min-width: 2ch;
}

.input-sizer::after {
    content: attr(data-value) " "; /* trailing space prevents too-tight fit */
    visibility: hidden;
    white-space: pre;              /* preserves exact character widths */
    grid-area: 1 / 1;
    font: inherit;                 /* must match input font exactly */
    padding: inherit;
    border: inherit;
    letter-spacing: inherit;
}

.input-sizer input {
    grid-area: 1 / 1;             /* overlaid on top of ::after */
    width: 100%;
    min-width: 0;                  /* allow shrinking below browser default */
    box-sizing: border-box;
    border: none;
    background: transparent;
    font: inherit;
    padding: 0;
    margin: 0;
    outline: none;
}
```

### B. Updated JavaScript (`manual.js`)

Replace all `size="${...}"` attribute logic with a `createSizedInput()` helper:

```javascript
/**
 * Creates a self-sizing input wrapped in .input-sizer.
 * data-value is kept in sync with the input's value so
 * the ::after pseudo-element always reflects the current content.
 */
const createSizedInput = ({ type = 'text', className, value, dataIndex, minChars = 2 }) => {
    const wrapper = document.createElement('span');
    wrapper.className = 'input-sizer';
    wrapper.dataset.value = value || ''.padEnd(minChars, '0');

    const input = document.createElement('input');
    input.type = type;
    input.className = className;
    input.value = value;
    input.dataset.index = dataIndex;

    // Keep data-value in sync on every keystroke
    input.addEventListener('input', () => {
        wrapper.dataset.value = input.value || ''.padEnd(minChars, '0');
    });

    wrapper.appendChild(input);
    return { wrapper, input };
};
```

Usage example for the **Harga** column (with number formatting):

```javascript
const formattedPrice = formatNumberStr(String(item.price));
const { wrapper: wHarga, input: inputHarga } = createSizedInput({
    className: 'item-price-format',
    value: formattedPrice,
    dataIndex: index,
    minChars: 5,
});

// Re-sync after formatting on input
inputHarga.addEventListener('input', () => {
    const raw = inputHarga.value.replace(/\D/g, '');
    const formatted = formatNumberStr(raw);
    inputHarga.value = formatted;
    wHarga.dataset.value = formatted || '00000';
});
```

### C. Before vs After

| Aspect | Before (`size` attribute) | After (CSS Grid trick) |
|---|---|---|
| Width measurement | Estimated (avg char width) | Exact (browser measures real font) |
| Accuracy for proportional fonts | ❌ Inaccurate | ✅ Pixel-perfect |
| Clipping on wide digits (`8`, `0`) | ❌ Happens | ✅ Never |
| JS complexity | Simple but broken | Slightly more code, reliable |
| Dependency | `size` attr + JS calc | CSS `::after` + `data-value` sync |

### D. Additional Audits Recommended
- Check `base.css` and `components.css` for any global `input { width: 100% }` or `min-width` overrides that may conflict with `.input-sizer input { width: 100%; min-width: 0 }`.
- Ensure `box-sizing: border-box` is consistently applied to all inputs to prevent border/padding from collapsing the visible text area.
