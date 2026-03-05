import { parseMarkdown } from './parser.js';

/* ── DOM ELEMENTS ── */
const mdInput = document.getElementById('md-input');
const previewScroll = document.getElementById('preview-scroll');
const charCountEl = document.getElementById('char-count');
const wordCountEl = document.getElementById('word-count');
const pageCountEl = document.getElementById('page-count');
const toastEl = document.getElementById('toast');
const wrapEl = document.getElementById('editor-wrap');
const themeBtn = document.getElementById('theme-btn');
const iframe = document.getElementById('print-frame');

const PAGE_H = 900;
let darkPrev = true;
let renderTimer;

/* ── RENDER ── */
function showEmpty() {
    previewScroll.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📄</div>
      <div>Mulai mengetik untuk melihat preview</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Mendukung semua sintaks Markdown standar</div>
    </div>`;
}

function renderPreview() {
    const md = mdInput.value;

    charCountEl.textContent = md.length + ' karakter';
    wordCountEl.textContent = (md.trim() ? md.trim().split(/\s+/).length : 0) + ' kata';

    previewScroll.innerHTML = '';

    if (!md.trim()) {
        pageCountEl.textContent = '0 hal';
        showEmpty();
        return;
    }

    const fullHTML = parseMarkdown(md);

    // Measure height
    const measurer = document.createElement('div');
    measurer.className = 'a4-page';
    measurer.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:-9999px;width:210mm;min-height:auto;pointer-events:none;';
    measurer.innerHTML = fullHTML;
    document.body.appendChild(measurer);
    const totalH = measurer.scrollHeight;
    document.body.removeChild(measurer);

    const numPages = Math.max(1, Math.ceil(totalH / PAGE_H));

    if (numPages === 1) {
        const page = makePage(1);
        page.innerHTML = fullHTML;
        previewScroll.appendChild(page);
        pageCountEl.textContent = '1 hal';
        return;
    }

    // Multi-page split
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHTML;

    let currentPage = makePage(1);
    previewScroll.appendChild(currentPage);
    let currentH = 0, pageNum = 1;

    for (const node of Array.from(tempDiv.childNodes)) {
        if (node.nodeType !== 1) continue; // skip non-element nodes
        const clone = node.cloneNode(true);
        currentPage.appendChild(clone);
        const h = clone.offsetHeight || estimateH(node);
        currentH += h + 16;
        if (currentH > PAGE_H) {
            currentPage.removeChild(clone);
            pageNum++;
            currentPage = makePage(pageNum);
            previewScroll.appendChild(currentPage);
            currentPage.appendChild(clone);
            currentH = h + 16;
        }
    }

    pageCountEl.textContent = pageNum + ' hal';

    // Trigger syntax highlighting
    if (window.hljs) {
        previewScroll.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
}

function makePage(num) {
    const p = document.createElement('div');
    p.className = 'a4-page';
    p.setAttribute('data-page', num);
    return p;
}

function estimateH(node) {
    const map = { H1: 60, H2: 44, H3: 36, H4: 28, H5: 24, H6: 22, P: 64, PRE: 110, BLOCKQUOTE: 72, UL: 48, OL: 48, TABLE: 90, HR: 20, IMG: 120, DIV: 110 /* For code-container */ };
    return map[node.tagName] || 44;
}

/* ── PDF EXPORT via hidden iframe ── */
window.printPDF = function () {
    const md = mdInput.value;
    if (!md.trim()) { showToast('⚠ Tulis konten dulu!'); return; }

    const pages = previewScroll.querySelectorAll('.a4-page');
    if (!pages.length) { showToast('⚠ Tidak ada konten'); return; }

    let pagesHTML = '';
    pages.forEach(p => { pagesHTML += p.outerHTML; });

    fetch('theme.css').then(res => res.text()).then(themeCss => {
        fetch('style.css').then(res => res.text()).then(styleCss => {
            exportWithCSS(pagesHTML, themeCss + '\n' + styleCss);
        });
    });
}

function exportWithCSS(pagesHTML, css) {
    const doc = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>MarkPDF</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
<style>${css}</style>
</head>
<body data-theme="light">
${pagesHTML}
</body>
</html>`;

    // Reset iframe
    iframe.src = 'about:blank';

    setTimeout(() => {
        try {
            const ifrDoc = iframe.contentDocument || iframe.contentWindow.document;
            ifrDoc.open('text/html', 'replace');
            ifrDoc.write(doc);
            ifrDoc.close();
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                showToast('🖨 Membuka dialog cetak / simpan PDF…');
            }, 700);
        } catch (e) {
            const blob = new Blob([doc], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            showToast('📄 Dibuka di tab baru — cetak dengan Ctrl+P');
        }
    }, 100);
}

/* ── FORMAT TOOLBAR ── */
window.insertFmt = function (before, after) {
    const s = mdInput.selectionStart, e = mdInput.selectionEnd;
    const sel = mdInput.value.substring(s, e);
    mdInput.value = mdInput.value.substring(0, s) + before + sel + after + mdInput.value.substring(e);
    mdInput.selectionStart = s + before.length;
    mdInput.selectionEnd = e + before.length;
    mdInput.focus(); renderPreview();
}

window.insertLine = function (prefix) {
    const s = mdInput.selectionStart;
    const ls = mdInput.value.lastIndexOf('\n', s - 1) + 1;
    mdInput.value = mdInput.value.substring(0, ls) + prefix + mdInput.value.substring(ls);
    mdInput.selectionStart = mdInput.selectionEnd = ls + prefix.length;
    mdInput.focus(); renderPreview();
}

window.insertCodeBlock = function () {
    const s = mdInput.selectionStart;
    const ins = '```\n\n```\n';
    mdInput.value = mdInput.value.substring(0, s) + ins + mdInput.value.substring(s);
    mdInput.selectionStart = mdInput.selectionEnd = s + 4;
    mdInput.focus(); renderPreview();
}

/* ── FILE IMPORT ── */
window.importFile = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        mdInput.value = ev.target.result;
        renderPreview();
        showToast('✓ File berhasil diimpor');
    };
    reader.readAsText(file);
}

/* ── DRAG DROP ── */
wrapEl.addEventListener('dragover', e => { e.preventDefault(); wrapEl.classList.add('dragover'); });
wrapEl.addEventListener('dragleave', () => wrapEl.classList.remove('dragover'));
wrapEl.addEventListener('drop', e => {
    e.preventDefault(); wrapEl.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        mdInput.value = ev.target.result;
        renderPreview(); showToast('✓ File berhasil di-drop');
    };
    reader.readAsText(file);
});

/* ── MISC ── */
window.clearAll = function () { mdInput.value = ''; renderPreview(); showToast('✓ Editor dikosongkan'); }

window.toggleTheme = function () {
    darkPrev = !darkPrev;
    document.documentElement.setAttribute('data-theme', darkPrev ? 'dark' : 'light');
    themeBtn.textContent = darkPrev ? '🌙 Gelap' : '☀️ Terang';
}

function showToast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2800);
}

/* ── SAMPLE ── */
window.loadSample = function () {
    mdInput.value = `# Laporan Proyek MarkPDF

## Pendahuluan

Ini adalah **contoh dokumen** Markdown yang menampilkan berbagai elemen formatting. Setiap elemen dirancang dengan *tipografi yang berbeda* agar dokumen terasa profesional dan mudah dibaca.

## Fitur yang Didukung

### Teks Dasar

Markdown mendukung berbagai format teks: **tebal**, *miring*, ~~coret~~, dan \`kode inline\`. Anda juga bisa membuat [tautan ke website](https://example.com).

### Daftar Item

Berikut daftar fitur utama:

- Konversi real-time ke format A4
- Mendukung semua sintaks Markdown standar
- Layout halaman otomatis
- Export langsung ke PDF

Langkah penggunaan:

1. Ketik atau tempel teks Markdown
2. Lihat preview di sebelah kanan
3. Klik **Unduh PDF** untuk menyimpan

### Task List

- [x] Parser Markdown
- [x] Preview A4 real-time
- [x] Export ke PDF
- [ ] Mode kolaborasi (segera hadir)

---

## Kode Program

Contoh kode JavaScript:

\`\`\`javascript
function helloWorld(name) {
  const greeting = \`Halo, \${name}!\`;
  console.log(greeting);
  return greeting;
}

helloWorld('MarkPDF');
\`\`\`

## Kutipan

> "Desain yang baik adalah tentang kejelasan dan keindahan yang bekerja bersama." — Prinsip Tipografi Modern

## Tabel Data

| Fitur | Status | Prioritas |
|-------|--------|-----------|
| Parser MD | Selesai | Tinggi |
| Preview A4 | Selesai | Tinggi |
| Multi-halaman | Selesai | Sedang |
| Dark mode | Selesai | Rendah |

## Kesimpulan

MarkPDF adalah alat yang sederhana namun powerful untuk mengonversi dokumen Markdown menjadi PDF yang rapi dan profesional. Cocok untuk laporan, artikel, dokumentasi, dan berbagai kebutuhan lainnya.`;
    renderPreview(); showToast('✓ Contoh konten dimuat');
}

/* ── LIVE RENDER ── */
mdInput.addEventListener('input', () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 200);
});

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); printPDF(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); printPDF(); }
});

// Init
renderPreview();
