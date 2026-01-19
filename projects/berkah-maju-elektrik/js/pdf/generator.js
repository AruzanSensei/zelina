/**
 * PDF Generator
 */
import { appState } from '../state.js';

export function initPDFGenerator() {
    // Download Action
    document.getElementById('btn-download').addEventListener('click', () => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title').value || "Invoice";

        if (items.length === 0) return alert("Belum ada item!");

        generatePDFs(items, title);
    });

    // Preview Actions
    const previewModal = document.getElementById('preview-modal');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const previewTitle = document.getElementById('preview-title');
    const closePreviewBtn = document.querySelector('.close-modal-preview');

    const openPreview = (type) => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title').value || "Invoice";

        if (items.length === 0) return alert("Belum ada item untuk dipreview!");

        let blobUrl;
        if (type === 'invoice') {
            blobUrl = generateInvoiceBlob(items, title);
            previewTitle.textContent = "Preview Invoice";
        } else {
            blobUrl = generateLetterBlob(items, title);
            previewTitle.textContent = "Preview Surat Jalan";
        }

        previewFrame.src = blobUrl;
        previewModal.classList.add('active');
    };

    document.querySelector('.invoice-preview').addEventListener('click', () => openPreview('invoice'));
    document.querySelector('.letter-preview').addEventListener('click', () => openPreview('surat-jalan'));

    closePreviewBtn.addEventListener('click', () => {
        previewModal.classList.remove('active');
        previewFrame.src = ''; // Cleanup
    });
}

// Common helpers
const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
const getDateStr = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ============================================
// GENERATORS
// ============================================

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

    // Total
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

    // We can reuse the logic but for download we need .save()
    // To avoid duplication, we could return the DOC object, but .output('bloburl') consumes it potentially or we just recreate.
    // Creating distinct docs is safer for clean state.

    // 1. INVOICE
    const doc1 = new jsPDF();
    // ... Copy paste logic or reuse via a renderer function? 
    // For simplicity given the constraint to be robust, I'll allow some duplication to ensure the 'download' version is exactly as intended, 
    // or I can parse the blobl url back? No.
    // Let's just call the same logic steps.

    // Actually, let's keep the existing generatePDFs logic but update it to match the Blob style if needed.
    // The previous implementation was fine. I will just overwrite with a version that does both.
    // Optimally: make a `renderInvoice(doc)` helper.

    const renderInvoice = (doc) => {
        const dateStr = getDateStr();
        doc.setFontSize(18);
        doc.text("BERKAH MAJU ELEKTRIK", 14, 20);
        doc.setFontSize(10);
        doc.text("Invoice & Perlengkapan Listrik", 14, 26);
        doc.setFontSize(12);
        doc.text(`Invoice: ${titleName}`, 14, 40);
        doc.setFontSize(10);
        doc.text(`Tanggal: ${dateStr}`, 14, 46);
        const tableData = items.map(item => [
            item.name, formatCurrency(item.price), item.qty, formatCurrency(item.price * item.qty)
        ]);
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        doc.autoTable({
            startY: 55, head: [['Barang', 'Harga', 'Pcs', 'Subtotal']], body: tableData,
            theme: 'grid', headStyles: { fillColor: [74, 144, 226] },
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12); doc.setFont(undefined, 'bold');
        doc.text(`Total: ${formatCurrency(total)}`, 140, finalY);
        doc.setFontSize(8); doc.setFont(undefined, 'normal');
        doc.text("Terima kasih telah berbelanja di Berkah Maju Elektrik.", 14, 280);
        doc.text("Powered By Zanxa Studio", 14, 285);
    };

    const renderLetter = (doc) => {
        const dateStr = getDateStr();
        doc.setFontSize(18);
        doc.text("BERKAH MAJU ELEKTRIK", 14, 20);
        doc.setFontSize(14); doc.setFont(undefined, 'bold');
        doc.text("SURAT JALAN", 14, 30);
        doc.setFontSize(10); doc.setFont(undefined, 'normal');
        doc.text(`Tanggal: ${dateStr}`, 14, 38);
        doc.text(`Ref: ${titleName}`, 14, 44);
        const tableData = items.map(item => [item.name, item.qty, item.note || '-']);
        doc.autoTable({
            startY: 55, head: [['Barang', 'Pcs', 'Note']], body: tableData,
            theme: 'grid', headStyles: { fillColor: [155, 81, 224] },
        });
        const sigY = doc.lastAutoTable.finalY + 30;
        doc.text("Penerima,", 20, sigY); doc.text("( ....................... )", 20, sigY + 25);
        doc.text("Hormat Kami,", 140, sigY); doc.text("Berkah Maju Elektrik", 140, sigY + 25);
        doc.setFontSize(8); doc.text("Powered By Zanxa Studio", 14, 285);
    };

    // EXECUTE
    renderInvoice(doc1);
    doc1.save(`Invoice-${titleName}.pdf`);

    const doc2 = new jsPDF();
    renderLetter(doc2);
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
