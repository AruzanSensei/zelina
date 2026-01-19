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
        const title = document.getElementById('manual-title')?.value || "Invoice";
        const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        // Render Invoice
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        invoicePreviewContainer.innerHTML = `
            <div class="html-preview-container">
                <div class="html-preview-header">
                    <div>
                        <div style="font-weight:bold; font-size:16px;">BERKAH MAJU ELEKTRIK</div>
                        <div style="font-size:10px; color:#555;">Invoice & Perlengkapan Listrik</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold;">INVOICE</div>
                        <div style="font-size:10px;">${dateStr}</div>
                    </div>
                </div>
                <div style="font-size:12px; margin-bottom:10px;">Ref: ${title}</div>
                
                <table class="html-preview-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align:right;">Harga</th>
                            <th style="text-align:center;">Qty</th>
                            <th style="text-align:right;">Total</th>
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
                
                <div class="html-preview-total">
                    Total: <span style="color:#4A90E2;">Rp ${formatNumber(total)}</span>
                </div>
            </div>
        `;

        // Render Surat Jalan
        letterPreviewContainer.innerHTML = `
            <div class="html-preview-container">
                <div class="html-preview-header">
                    <div>
                        <div style="font-weight:bold; font-size:16px;">BERKAH MAJU ELEKTRIK</div>
                        <div style="font-size:10px; color:#555;">SURAT JALAN</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:10px;">${dateStr}</div>
                    </div>
                </div>
                <div style="font-size:12px; margin-bottom:10px;">Ref: ${title}</div>
               
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
                
                <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:10px; text-align:center;">
                    <div>Penerima<br><br><br>( ........... )</div>
                    <div>Hormat Kami<br><br><br>Admin</div>
                </div>
            </div>
        `;
    };

    // Helper
    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);

    // ============================================
    // LISTENERS
    // ============================================

    // Auto-update on data change
    appState.subscribe('invoiceItems', renderHTML);
    // Also listen to title input input
    document.getElementById('manual-title')?.addEventListener('input', renderHTML);

    // Initial Render
    renderHTML();


    // ============================================
    // PDF ACTIONS
    // ============================================

    // Download Action
    document.getElementById('btn-download').addEventListener('click', () => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title').value || "Invoice";

        if (items.length === 0) return alert("Belum ada item!");

        generatePDFs(items, title);
    });

    // Preview Modal (Full PDF)
    const previewModal = document.getElementById('preview-modal');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const previewTitle = document.getElementById('preview-title');
    const closePreviewBtn = document.querySelector('.close-modal-preview');

    const openPDFPreview = (type) => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title').value || "Invoice";

        if (items.length === 0) return alert("Belum ada item untuk dipreview!");

        let blobUrl;
        if (type === 'invoice') {
            blobUrl = generateInvoiceBlob(items, title);
            previewTitle.textContent = "Preview Invoice (PDF)";
        } else {
            blobUrl = generateLetterBlob(items, title);
            previewTitle.textContent = "Preview Surat Jalan (PDF)";
        }

        previewFrame.src = blobUrl;
        previewModal.classList.add('active');
    };

    // Click on HTML preview opens Full PDF Preview
    document.getElementById('invoice-preview-container').parentNode.addEventListener('click', () => openPDFPreview('invoice'));
    document.getElementById('letter-preview-container').parentNode.addEventListener('click', () => openPDFPreview('surat-jalan'));

    closePreviewBtn.addEventListener('click', () => {
        previewModal.classList.remove('active');
        previewFrame.src = '';
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

export function generateInvoiceBlob(items, titleName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dateStr = getDateStr();

    // Header
    doc.setFontSize(18);
    doc.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc.setFontSize(10);
    doc.text("Invoice & Perlengkapan Listrik", 14, 26);

    // Info
    doc.setFontSize(12);
    doc.text(`Invoice: ${titleName}`, 14, 40);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${dateStr}`, 14, 46);

    // Table
    const tableData = items.map(item => [
        item.name,
        formatCurrency(item.price),
        item.qty,
        formatCurrency(item.price * item.qty)
    ]);

    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    doc.autoTable({
        startY: 55,
        head: [['Barang', 'Harga', 'Pcs', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [74, 144, 226] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ${formatCurrency(total)}`, 140, finalY);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text("Powered By Zanxa Studio", 14, 285);

    return doc.output('bloburl');
}

export function generateLetterBlob(items, titleName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dateStr = getDateStr();

    // Header
    doc.setFontSize(18);
    doc.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("SURAT JALAN", 14, 30);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal: ${dateStr}`, 14, 38);
    doc.text(`Ref: ${titleName}`, 14, 44);

    // Table
    const tableData = items.map(item => [
        item.name,
        item.qty,
        item.note || '-'
    ]);

    doc.autoTable({
        startY: 55,
        head: [['Barang', 'Pcs', 'Note']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [155, 81, 224] },
    });

    const sigY = doc.lastAutoTable.finalY + 30;
    doc.text("Penerima,", 20, sigY);
    doc.text("( ....................... )", 20, sigY + 25);
    doc.text("Hormat Kami,", 140, sigY);
    doc.text("Berkah Maju Elektrik", 140, sigY + 25);

    doc.setFontSize(8);
    doc.text("Powered By Zanxa Studio", 14, 285);

    return doc.output('bloburl');
}

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

    // Add to History
    const today = new Date();
    appState.addToHistory({
        id: Date.now(),
        title: titleName,
        date: `${getDateStr()} | ${today.getHours()}.${today.getMinutes()}`,
        items: items,
        timestamp: Date.now()
    });
}
