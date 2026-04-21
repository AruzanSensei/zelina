/* =====================================================
   parser.js — todo.md Parser
   Phase 2: Parse markdown checklist to task objects
   ===================================================== */

const parser = (() => {

  /* ── Simple hash for stable IDs ──────────────────── */
  function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }

  /* ── Parse raw todo.md string → task objects ─────── */
  function parse(rawMarkdown, projectId = '') {
    if (!rawMarkdown) return { tasks: [], sections: [] };

    const lines    = rawMarkdown.split('\n');
    const tasks    = [];
    const sections = [];

    let currentSection    = 'General';
    let currentSubSection = null;

    lines.forEach((rawLine, lineNumber) => {
      const line = rawLine;
      const trimmed = line.trim();

      // ── Heading detection ──────────────────────────
      if (/^#{1}\s/.test(trimmed) && !/^#{2,}\s/.test(trimmed)) {
        currentSection    = trimmed.replace(/^#+\s*/, '').trim();
        currentSubSection = null;
        if (!sections.find(s => s.name === currentSection && !s.parent)) {
          sections.push({ name: currentSection, parent: null });
        }
        return;
      }

      if (/^#{2}\s/.test(trimmed)) {
        currentSubSection = trimmed.replace(/^#+\s*/, '').trim();
        const parent = currentSection;
        if (!sections.find(s => s.name === currentSubSection && s.parent === parent)) {
          sections.push({ name: currentSubSection, parent });
        }
        return;
      }

      // ── Task line detection ────────────────────────
      const taskMatch = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
      if (!taskMatch) return;

      const done    = taskMatch[1].toLowerCase() === 'x';
      let   text    = taskMatch[2];

      // Extract tags (#tagname — not part of heading)
      const tags = [];
      text = text.replace(/#([a-zA-Z0-9_-]+)/g, (_, tag) => {
        tags.push(tag.toLowerCase());
        return '';
      });

      // Extract due date: 📅 YYYY-MM-DD or due: YYYY-MM-DD
      let dueDate = null;
      text = text.replace(/📅\s*(\d{4}-\d{2}-\d{2})/g, (_, d) => {
        dueDate = new Date(d);
        return '';
      });
      text = text.replace(/due:\s*(\d{4}-\d{2}-\d{2})/gi, (_, d) => {
        dueDate = new Date(d);
        return '';
      });

      // Extract priority
      let priority = 'medium';
      if (/⚡/.test(text) || /!high/i.test(text)) {
        priority = 'high';
        text = text.replace(/⚡/g, '').replace(/!high/gi, '');
      } else if (/!low/i.test(text)) {
        priority = 'low';
        text = text.replace(/!low/gi, '');
      } else if (/!med/i.test(text) || /!medium/i.test(text)) {
        priority = 'medium';
        text = text.replace(/!med(ium)?/gi, '');
      }

      text = text.trim().replace(/\s{2,}/g, ' ');

      const today    = new Date(); today.setHours(0,0,0,0);
      const isOverdue = dueDate && !done && new Date(dueDate) < today;

      const section = currentSubSection || currentSection;

      const task = {
        id:          hashStr(`${projectId}:${lineNumber}:${rawLine}`),
        text,
        done,
        section,
        parentSection: currentSubSection ? currentSection : null,
        tags,
        dueDate,
        priority,
        isOverdue,
        lineNumber,
        rawLine: line
      };

      tasks.push(task);
    });

    return { tasks, sections };
  }

  /* ── Toggle a task's done state in raw markdown ─── */
  function toggleTask(rawMarkdown, lineNumber) {
    const lines = rawMarkdown.split('\n');
    const line = lines[lineNumber];
    if (!line) return rawMarkdown;

    // Replace [ ] with [x] or [x]/[X] with [ ]
    const toggled = line
      .replace(/\[ \]/, '[x]')            // pending → done
      .replace(/\[x\]/i, '[ ]');          // done → pending (handles [X] too)

    lines[lineNumber] = toggled;
    return lines.join('\n');
  }

  /* ── Append a new task to raw markdown ────────────── */
  function addTask(rawMarkdown, { text, section, priority, dueDate, tags = [] }) {
    let line = `- [ ] ${text}`;

    if (priority === 'high') line += ' ⚡';
    if (priority === 'low')  line += ' !low';

    tags.forEach(t => { line += ` #${t}`; });

    if (dueDate) {
      const iso = dueDate instanceof Date
        ? dueDate.toISOString().split('T')[0]
        : dueDate;
      line += ` 📅 ${iso}`;
    }

    // Try to find the section and append after it
    if (section) {
      const lines = rawMarkdown.split('\n');
      let sectionIdx = -1;
      let insertIdx  = lines.length;

      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        const isHeading = /^#{1,2}\s/.test(t);
        const headingText = t.replace(/^#+\s*/, '').trim();

        if (headingText === section) {
          sectionIdx = i;
        }

        // Next heading after our section = insertion boundary
        if (sectionIdx >= 0 && i > sectionIdx && isHeading) {
          insertIdx = i;
          break;
        }
      }

      if (sectionIdx >= 0) {
        lines.splice(insertIdx, 0, line);
        return lines.join('\n');
      }
    }

    // Fallback: append at end
    return rawMarkdown.trimEnd() + '\n' + line + '\n';
  }

  /* ── Group tasks by section ─────────────────────── */
  function groupBySection(tasks) {
    const map = {};
    tasks.forEach(task => {
      const key = task.section || 'General';
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }

  /* ── Get summary stats from tasks ────────────────── */
  function getStats(tasks) {
    const total      = tasks.length;
    const done       = tasks.filter(t => t.done).length;
    const pending    = total - done;
    const overdue    = tasks.filter(t => t.isOverdue).length;
    const highPrio   = tasks.filter(t => t.priority === 'high' && !t.done).length;
    const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, pending, overdue, highPrio, pct };
  }

  /* ── Simple markdown → HTML (for Prompt view) ────── */
  function markdownToHtml(md) {
    if (!md) return '';
    let html = md
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

      // Headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>')

      // Code blocks (``` ... ```)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code class="lang-${lang || 'text'}">${code.trimEnd()}</code></pre>`)

      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')

      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/__(.+?)__/g,     '<strong>$1</strong>')
      .replace(/_([^_]+)_/g,     '<em>$1</em>')

      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

      // Horizontal rule
      .replace(/^---$/gm, '<hr>')

      // Unordered lists
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)(?=\s*<li>|$)/g, '<ul>$1</ul>')

      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

      // Paragraphs — blank lines become paragraph breaks
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }

  /* ── Public API ──────────────────────────────────── */
  return {
    parse,
    toggleTask,
    addTask,
    groupBySection,
    getStats,
    markdownToHtml
  };

})();

export default parser;
