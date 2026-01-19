/**
 * PDF Generator
 */
import { appState } from '../state.js';

export function initPDFGenerator() {
    document.getElementById('btn-download').addEventListener('click', () => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title').value || "Invoice";

        if (items.length === 0) return alert("Belum ada item!");

        generatePDFs(items, title);
    });
}

export function generatePDFs(items, titleName) {
    const { jsPDF } = window.jspdf;

    // Date formatter
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = today.getHours() + "." + today.getMinutes();

    // Common Config
    const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    // ======================
    // 1. INVOICE PDF
    // ======================
    const doc1 = new jsPDF();

    // Header
    doc1.setFontSize(18);
    doc1.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc1.setFontSize(10);
    doc1.text("Invoice & Perlengkapan Listrik", 14, 26);
    // doc1.text("Jl. Raya Contoh No. 123, Kota", 14, 32); 

    // Info
    doc1.setFontSize(12);
    doc1.text(`Invoice: ${titleName}`, 14, 40);
    doc1.setFontSize(10);
    doc1.text(`Tanggal: ${dateStr}`, 14, 46);

    // Table
    const tableData1 = items.map(item => [
        item.name,
        formatCurrency(item.price),
        item.qty,
        formatCurrency(item.price * item.qty)
    ]);

    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    doc1.autoTable({
        startY: 55,
        head: [['Barang', 'Harga', 'Pcs', 'Subtotal']],
        body: tableData1,
        theme: 'grid',
        headStyles: { fillColor: [74, 144, 226] }, // Blue
    });

    // Total
    const finalY = doc1.lastAutoTable.finalY + 10;
    doc1.setFontSize(12);
    doc1.setFont(undefined, 'bold');
    doc1.text(`Total: ${formatCurrency(total)}`, 140, finalY);

    // Footer
    doc1.setFontSize(8);
    doc1.setFont(undefined, 'normal');
    doc1.text("Terima kasih telah berbelanja di Berkah Maju Elektrik.", 14, 280);
    doc1.text("Powered By Zanxa Studio", 14, 285);

    // ======================
    // 2. SURAT JALAN PDF
    // ======================
    const doc2 = new jsPDF();

    // Header
    doc2.setFontSize(18);
    doc2.text("BERKAH MAJU ELEKTRIK", 14, 20);
    doc2.setFontSize(14);
    doc2.setFont(undefined, 'bold');
    doc2.text("SURAT JALAN", 14, 30);

    doc2.setFontSize(10);
    doc2.setFont(undefined, 'normal');
    doc2.text(`Tanggal: ${dateStr}`, 14, 38);
    doc2.text(`Ref: ${titleName}`, 14, 44);

    // Table
    const tableData2 = items.map(item => [
        item.name,
        item.qty,
        item.note || '-'
    ]);

    doc2.autoTable({
        startY: 55,
        head: [['Barang', 'Pcs', 'Note']],
        body: tableData2,
        theme: 'grid',
        headStyles: { fillColor: [155, 81, 224] }, // Purple/Secondary
    });

    // Signatures
    const sigY = doc2.lastAutoTable.finalY + 30;
    doc2.text("Penerima,", 20, sigY);
    doc2.text("( ....................... )", 20, sigY + 25);

    doc2.text("Hormat Kami,", 140, sigY);
    doc2.text("Berkah Maju Elektrik", 140, sigY + 25);

    doc2.setFontSize(8);
    doc2.text("Powered By Zanxa Studio", 14, 285);

    // ======================
    // SAVE & HISTORY
    // ======================
    doc1.save(`Invoice-${titleName}.pdf`);
    doc2.save(`SuratJalan-${titleName}.pdf`);

    // Add to History
    appState.addToHistory({
        id: Date.now(),
        title: titleName,
        date: `${dateStr} | ${timeStr}`,
        items: items,
        timestamp: Date.now()
    });
}
