/**
 * PDF Generator & HTML Previewer
 */
import { appState } from '../state.js';

export function initPDFGenerator() {

    // HTML Preview Elements
    const invoicePreviewContainer = document.getElementById('invoice-preview-container');
    const letterPreviewContainer = document.getElementById('letter-preview-container');

    // ============================================
    // HTML RENDERER (Real-time)
    // ============================================
    const renderHTML = () => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title')?.value || "";
        const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        // Calculate Totals
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Helper for styling to match PDF exact look (Zoomed out handled by CSS zoom/transform)
        // PDF Font 18 for Header -> ~24px HTML
        // PDF Font 10 -> ~13px HTML

        invoicePreviewContainer.innerHTML = `
            <div class="html-preview-container">
                <div class="html-preview-header">
                    <div>
                        <div style="font-weight:bold; font-size:18px;">BERKAH MAJU ELEKTRIK</div>
                        <div style="font-size:11px; color:#555; margin-top:2px;">Invoice & Perlengkapan Listrik</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:14px;">INVOICE</div>
                        <div style="font-size:11px; margin-top:2px;">${dateStr}</div>
                    </div>
                </div>
                <div style="font-size:12px; margin-bottom:15px; font-weight:600;">Ref: ${title || '<span style="color:red; opacity:0.5;">(Tanpa Judul)</span>'}</div>
                
                <table class="html-preview-table">
                    <thead>
                        <tr>
                            <th style="background:#4A90E2;">Item</th>
                            <th style="background:#4A90E2; text-align:right;">Harga</th>
                            <th style="background:#4A90E2; text-align:center;">Qty</th>
                            <th style="background:#4A90E2; text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr>
                            <td>${item.name || '-'}</td>
                            <td style="text-align:right;">${formatNumber(item.price)}</td>
                            <td style="text-align:center;">${item.qty}</td>
                            <td style="text-align:right;">${formatNumber(item.price * item.qty)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="html-preview-total" style="font-size:14px; margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
                    Total: <span style="color:#4A90E2; font-size:16px;">Rp ${formatNumber(total)}</span>
                </div>
                
                <div style="font-size:9px; color:#888; margin-top:30px; border-top:1px solid #eee; padding-top:5px;">
                    Powered By Zanxa Studio
                </div>
            </div>
        `;

        // Render Surat Jalan
        letterPreviewContainer.innerHTML = `
            <div class="html-preview-container">
                <div class="html-preview-header">
                    <div>
                        <div style="font-weight:bold; font-size:18px;">BERKAH MAJU ELEKTRIK</div>
                        <div style="font-size:14px; font-weight:bold; margin-top:5px;">SURAT JALAN</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:11px;">${dateStr}</div>
                    </div>
                </div>
                <div style="font-size:12px; margin-bottom:15px;">Ref: ${title || '<span style="color:red; opacity:0.5;">(Tanpa Judul)</span>'}</div>
               
                <table class="html-preview-table">
                    <thead>
                        <tr>
                            <th style="background:#9B51E0;">Item</th>
                            <th style="background:#9B51E0; text-align:center;">Qty</th>
                            <th style="background:#9B51E0;">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr>
                            <td>${item.name || '-'}</td>
                            <td style="text-align:center;">${item.qty}</td>
                            <td>${item.note || '-'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top:40px; display:flex; justify-content:space-between; font-size:11px; text-align:center;">
                    <div>Penerima<br><br><br><br>( ....................... )</div>
                    <div>Hormat Kami<br><br><br><br>Berkah Maju Elektrik</div>
                </div>
                
                <div style="font-size:9px; color:#888; margin-top:30px; border-top:1px solid #eee; padding-top:5px;">
                    Powered By Zanxa Studio
                </div>
            </div>
        `;
    };

    // Helper
    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

    // ============================================
    // LISTENERS
    // ============================================

    appState.subscribe('invoiceItems', renderHTML);
    const titleInput = document.getElementById('manual-title');
    if (titleInput) titleInput.addEventListener('input', renderHTML);

    renderHTML(); // Initial

    // ============================================
    // ACTIONS
    // ============================================

    // Validate Title
    const validate = () => {
        const title = titleInput?.value.trim();
        if (!title) {
            alert("Harap isi Judul Invoice terlebih dahulu!");
            titleInput?.focus();
            return false;
        }
        return title;
    };

    // SAVE ONLY (To History)
    const btnSave = document.getElementById('btn-save-only');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const title = validate();
            if (!title) return;

            const items = appState.state.invoiceItems;
            if (items.length === 0) return alert("Belum ada item!");

            saveToHistory(items, title);
            alert("Data berhasil disimpan ke History.");
            // Optional: Clear form? No, request didn't say.
        });
    }

    // DOWNLOAD (PDF + History)
    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const title = validate();
            if (!title) return;

            const items = appState.state.invoiceItems;
            if (items.length === 0) return alert("Belum ada item!");

            saveToHistory(items, title);
            generatePDFs(items, title);
        });
    }
}


function saveToHistory(items, title) {
    const today = new Date();
    appState.addToHistory({
        id: Date.now(),
        title: title,
        date: `${today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${today.getHours()}.${String(today.getMinutes()).padStart(2, '0')}`,
        items: items,
        timestamp: Date.now()
    });
}


// ============================================
// PDF GENERATION LOGIC (JSPDF)
// ============================================

const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
const getDateStr = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function generatePDFs(items, titleName) {
    const { jsPDF } = window.jspdf;

    // 1. INVOICE
    const doc1 = new jsPDF();
    const dateStr = getDateStr();
    doc1.setFontSize(18);
    doc1.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc1.setFontSize(10);
    doc1.text("Invoice & Perlengkapan Listrik", 14, 26);
    doc1.setFontSize(12);
    doc1.text(`Invoice: ${titleName}`, 14, 40);
    doc1.setFontSize(10);
    doc1.text(`Tanggal: ${dateStr}`, 14, 46);

    // Table
    const tableData1 = items.map(item => [
        item.name, formatCurrency(item.price), item.qty, formatCurrency(item.price * item.qty)
    ]);
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    doc1.autoTable({
        startY: 55, head: [['Barang', 'Harga', 'Pcs', 'Subtotal']], body: tableData1,
        theme: 'grid', headStyles: { fillColor: [74, 144, 226] },
    });
    const finalY = doc1.lastAutoTable.finalY + 10;
    doc1.setFontSize(12); doc1.setFont(undefined, 'bold');
    doc1.text(`Total: ${formatCurrency(total)}`, 140, finalY);
    doc1.setFontSize(8); doc1.setFont(undefined, 'normal');
    doc1.text("Powered By Zanxa Studio", 14, 285);

    doc1.save(`Invoice-${titleName}.pdf`);

    // 2. SURAT JALAN
    const doc2 = new jsPDF();
    doc2.setFontSize(18);
    doc2.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc2.setFontSize(14); doc2.setFont(undefined, 'bold');
    doc2.text("SURAT JALAN", 14, 30);
    doc2.setFontSize(10); doc2.setFont(undefined, 'normal');
    doc2.text(`Tanggal: ${dateStr}`, 14, 38);
    doc2.text(`Ref: ${titleName}`, 14, 44);

    const tableData2 = items.map(item => [
        item.name, item.qty, item.note || '-'
    ]);
    doc2.autoTable({
        startY: 55, head: [['Barang', 'Pcs', 'Note']], body: tableData2,
        theme: 'grid', headStyles: { fillColor: [155, 81, 224] },
    });
    const sigY = doc2.lastAutoTable.finalY + 30;
    doc2.text("Penerima,", 20, sigY); doc2.text("( ....................... )", 20, sigY + 25);
    doc2.text("Hormat Kami,", 140, sigY); doc2.text("Berkah Maju Elektrik", 140, sigY + 25);
    doc2.setFontSize(8); doc2.text("Powered By Zanxa Studio", 14, 285);

    doc2.save(`SuratJalan-${titleName}.pdf`);
}
