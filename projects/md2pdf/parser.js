/* ── MARKDOWN PARSER ── */
export function parseMarkdown(md) {
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function inline(s) {
        return s
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.+?)__/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/_(.+?)_/g, '<em>$1</em>')
            .replace(/~~(.+?)~~/g, '<del>$1</del>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/  \n/g, '<br>');
    }

    const lines = md.split('\n');
    let html = '', i = 0, inList = null, inTable = false;

    function closeList() { if (inList) { html += `</${inList}>`; inList = null; } }
    function closeTable() { if (inTable) { html += '</tbody></table>'; inTable = false; } }

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block with advanced UI
        if (/^```/.test(line)) {
            closeList(); closeTable();
            const lang = line.slice(3).trim() || 'text';
            let code = '';
            i++;
            while (i < lines.length && !/^```/.test(lines[i])) { code += esc(lines[i]) + '\n'; i++; }

            // Wrap code block in advanced Mac-style UI container
            html += `
<div class="code-container">
  <div class="code-header">
    <div class="code-header-left">
      <div class="mac-btn"></div>
      <div class="mac-btn yellow"></div>
      <div class="mac-btn green"></div>
    </div>
    <span class="code-lang-label">${lang}</span>
  </div>
  <pre><code class="lang-${lang}">${code.trimEnd()}</code></pre>
</div>`;
            i++; continue;
        }

        // Headings
        const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (hMatch) {
            closeList(); closeTable();
            const level = hMatch[1].length;
            html += `<h${level}>${inline(hMatch[2])}</h${level}>`;
            i++; continue;
        }

        // HR
        if (/^(---+|\*\*\*+|___+)\s*$/.test(line)) {
            closeList(); closeTable();
            html += '<hr>'; i++; continue;
        }

        // Blockquote
        if (/^>\s?/.test(line)) {
            closeList(); closeTable();
            let bq = '';
            while (i < lines.length && /^>\s?/.test(lines[i])) { bq += lines[i].replace(/^>\s?/, '') + '\n'; i++; }
            html += `<blockquote>${parseMarkdown(bq.trim())}</blockquote>`;
            continue;
        }

        // Table
        if (!inTable && /\|/.test(line) && i + 1 < lines.length && /^\|?[\s\-|:]+\|?$/.test(lines[i + 1])) {
            closeList();
            html += '<table><thead><tr>';
            line.split('|').map(c => c.trim()).filter(Boolean).forEach(h => { html += `<th>${inline(h)}</th>`; });
            html += '</tr></thead><tbody>';
            inTable = true; i += 2; continue;
        }
        if (inTable && /\|/.test(line)) {
            html += '<tr>';
            line.split('|').map(c => c.trim()).filter(Boolean).forEach(c => { html += `<td>${inline(c)}</td>`; });
            html += '</tr>'; i++; continue;
        }
        if (inTable && !/\|/.test(line)) closeTable();

        // Unordered list
        const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
        if (ulMatch) {
            closeTable();
            const content = ulMatch[3];
            const taskMatch = content.match(/^\[([ xX])\]\s+(.*)/);
            if (inList !== 'ul') { if (inList) closeList(); html += '<ul>'; inList = 'ul'; }
            if (taskMatch) {
                const checked = taskMatch[1].toLowerCase() === 'x' ? 'checked' : '';
                html += `<li><input type="checkbox" ${checked} disabled> ${inline(taskMatch[2])}</li>`;
            } else {
                html += `<li>${inline(content)}</li>`;
            }
            i++; continue;
        }

        // Ordered list
        const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
        if (olMatch) {
            closeTable();
            if (inList !== 'ol') { if (inList) closeList(); html += '<ol>'; inList = 'ol'; }
            html += `<li>${inline(olMatch[1])}</li>`;
            i++; continue;
        }

        // Blank line
        if (line.trim() === '') { closeList(); closeTable(); i++; continue; }

        // Paragraph
        closeList(); closeTable();
        let para = '';
        while (i < lines.length && lines[i].trim() !== '' &&
            !/^(#{1,6}\s|>|```|\s*[-*+]\s|\s*\d+\.\s|---+|\*\*\*+|___+)/.test(lines[i])) {
            para += (para ? ' ' : '') + lines[i]; i++;
        }
        if (para) html += `<p>${inline(para)}</p>`;
    }

    closeList(); closeTable();
    return html;
}
