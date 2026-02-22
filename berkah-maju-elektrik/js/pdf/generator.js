import { appState } from '../state.js';

// ============================================
// GLOBAL HELPERS
// ============================================
const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);
const getDateStr = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

let logoBase64 = null;
const loadLogoAsBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Logo load failed:", e);
        return null;
    }
};

// ============================================
// INITIALIZER
// ============================================
export function initPDFGenerator() {
    // Load Logo immediately
    loadLogoAsBase64('assets/Logo%20berkah%20maju%20elektrik.png').then(res => {
        logoBase64 = res;
        // Re-render if logo is loaded late
        renderHTML();
    });

    // HTML Preview Elements
    const invoicePreviewContainer = document.getElementById('invoice-preview-container');
    const letterPreviewContainer = document.getElementById('letter-preview-container');

    const previewModal = document.getElementById('preview-modal');
    const closePreviewBtn = document.querySelector('.close-modal-preview');

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
            previewModal.classList.remove('active');
        });
    }

    const openFullScreen = (type) => {
        if (!previewModal) return;
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title')?.value || "";

        const doc = getPDFDoc(type, items, title);
        const blobUrl = doc.output('bloburl');

        const frame = document.getElementById('pdf-preview-frame');
        if (frame) {
            frame.src = blobUrl;
            document.getElementById('preview-title').textContent = type === 'invoice' ? 'Preview Invoice' : 'Preview Surat Jalan';
            previewModal.classList.remove('hidden');
            previewModal.classList.add('active');
        }
    };

    if (invoicePreviewContainer) {
        invoicePreviewContainer.parentElement.style.cursor = 'zoom-in';
        invoicePreviewContainer.parentElement.addEventListener('click', () => openFullScreen('invoice'));
    }
    if (letterPreviewContainer) {
        letterPreviewContainer.parentElement.style.cursor = 'zoom-in';
        letterPreviewContainer.parentElement.addEventListener('click', () => openFullScreen('letter'));
    }

    // ============================================
    // HTML RENDERER (Real-time with Scaling)
    // ============================================
    const renderHTML = () => {
        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title')?.value || "";
        const dateStr = getDateStr();

        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        const refWidth = 794; // A4 approx width in px for scaling
        const parentWidth = invoicePreviewContainer.parentElement.clientWidth;
        const scale = parentWidth / refWidth;

        // Calculate Totals
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Render Invoice (EXACT MATCH with invoice.html)
        invoicePreviewContainer.innerHTML = `
            <div class="html-preview-container" style="transform: scale(${scale}); transform-origin: top center; font-family: 'Times New Roman', Times, serif; width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; position: relative; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h1 style="font-size: 28px; font-weight: bold; letter-spacing: 2px; margin-bottom: 30px; color: #000;">INVOICE</h1>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; font-family: Calibri, sans-serif;">
                    <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                        <img src="${logoBase64 || 'assets/Logo%20berkah%20maju%20elektrik.png'}" style="width: 60px; height: auto;">
                        <div style="text-align: left;">
                            <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 3px 0;">BERKAH MAJU ELEKTRIK</h2>
                            <p style="font-size: 13px; line-height: 1; margin: 1px 0;">Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                            <p style="font-size: 13px; line-height: 1; margin: 1px 0;">0855-9174-9020 / 0853-1212-2030</p>
                            <p style="font-size: 13px; line-height: 1; margin: 1px 0;">Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="border: 2px solid #000; padding: 8px 10px; min-width: 210px;">
                            <p style="font-size: 14px; margin: 2px 0; line-height: 1;">Tanggal : ${dateStr}</p>
                        </div>
                        <div style="border: 2px solid #000; padding: 8px 10px; min-width: 210px;">
                            <p style="font-size: 14px; margin: 2px 0; line-height: 1;">Kepada :</p>
                            <p style="font-size: 14px; margin: 2px 0; line-height: 1; font-weight: bold;">${title || '(Tanpa Nama)'}</p>
                        </div>
                    </div>
                </div>

                <div style="border-top: 2px solid #000; margin: 14px 0 30px 0;"></div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 8px 6px; font-size: 13px; font-weight: bold; width: 50px; text-align: center;">NO</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 8px 6px; font-size: 13px; font-weight: bold; text-align: left; width: 180px;">KETERANGAN</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 8px 6px; font-size: 13px; font-weight: bold; width: 70px; text-align: center;">QTY</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 8px 6px; font-size: 13px; font-weight: bold; text-align: center; width: 110px;">HARGA<br>SATUAN</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 8px 6px; font-size: 13px; font-weight: bold; text-align: center; width: 110px;">JUMLAH</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 16px; width: 50px;">${index + 1}</td>
                            <td style="border: 1px solid #000; padding: 6px 8px; font-size: 16px; width: 180px;">Battery ${item.name || ''} ${item.tipe || ''} ${item.note || ''}</td>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 16px; width: 70px;">${item.qty} pcs</td>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 16px; width: 110px;">Rp ${formatNumber(item.price)}</td>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 16px; width: 110px;">Rp ${formatNumber(item.price * item.qty)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="width: 100%; margin-top: 0;">
                    <div style="display: flex; justify-content: flex-end; border: 1px solid #000; border-top: none; border-left: none; border-bottom: none;">
                        <div style="padding: 6px 8px; text-align: center; font-weight: bold; font-size: 16px; border-right: 1px solid #000; width: 120px;">JUMLAH</div>
                        <div style="padding: 6px 8px; text-align: center; font-weight: bold; font-size: 16px; width: 220px; border: 1px solid #000; border-top: none; border-left: none; border-right: none;">Rp ${formatNumber(total)}</div>
                    </div>
                </div>

                <div style="font-size: 16px; margin: 35px 0 65px 0; text-align: left;">
                    <p>Pembayaran Bisa melalui rekening Bank <strong>BCA 5737162660</strong> a.n SAEPUL IMAN</p>
                </div>
                
                <div style="margin-top: 35px; text-align: right;">
                    <p style="padding-right: 28px; font-size: 16px; margin: 4px 0;">Hormat Kami</p>
                    <div style="margin-top: 80px;"></div>
                    <p style="font-size: 16px; margin: 4px 0;">Berkah Maju Elektrik</p>
                </div>
            </div>
        `;

        // Render Surat Jalan (EXACT MATCH with surat-jalan.html)
        letterPreviewContainer.innerHTML = `
            <div class="html-preview-container" style="transform: scale(${scale}); transform-origin: top center; font-family: 'Times New Roman', Times, serif; width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; position: relative; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="font-family: Calibri, sans-serif; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 2px;">
                    <div style="display: flex; align-items: center; gap: 7px; flex: 1;">
                        <img src="${logoBase64 || 'assets/Logo%20berkah%20maju%20elektrik.png'}" style="width: 65px; height: auto;">
                        <div style="text-align: left;">
                            <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 2px 0;">BERKAH MAJU ELEKTRIK</h2>
                            <p style="font-size: 13px; line-height: 1.1; margin: 0;">Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                            <p style="font-size: 13px; line-height: 1.1; margin: 0;">0855-9174-9020 / 0853-1212-2030</p>
                            <p style="font-size: 13px; line-height: 1.1; margin: 0;">Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 5px; height: 75px; background-color: #000;"></div>
                        <h1 style="font-size: 36px; font-weight: bold; letter-spacing: 1px; margin: 0;">SURAT JALAN</h1>
                    </div>
                </div>
                <div style="border-bottom: 1px solid #000; margin-bottom: 35px;"></div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 16px;">
                    <div style="line-height: 1.3;">
                        <p>Kepada Yth.</p>
                        <p><strong style="font-size: 18px;">${title || '(Tanpa Nama)'}</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <p>Tanggal : ${dateStr}</p>
                    </div>
                </div>

                <div style="margin-bottom: 20px; font-size: 16px;">
                    <p>Bersama dengan ini kami kirimkan sejumlah barang sebagai berikut:</p>
                </div>
               
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                    <thead>
                        <tr>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 10px 8px; font-size: 16px; font-weight: bold; width: 50px; text-align: center;">No.</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 10px 8px; font-size: 16px; font-weight: bold; text-align: left; width: 230px;">Nama Barang</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 10px 8px; font-size: 16px; font-weight: bold; width: 100px; text-align: center;">Jumlah</th>
                            <th style="background:#c0c0c0; border: 1px solid #000; padding: 10px 8px; font-size: 16px; font-weight: bold; text-align: center; width: 260px;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; width: 50px;">${index + 1}</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; font-size: 16px; width: 230px;">Battery ${item.name || ''}</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; width: 100px;">${item.qty} pcs</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; font-size: 16px; text-align: center; width: 260px;">UPS ${item.tipe || ''} ${item.note || ''}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-bottom: 40px; font-size: 16px;">
                    <p>Diterima Tanggal : .....................................</p>
                </div>

                <div style="display: flex; justify-content: space-around; text-align: center; font-size: 16px;">
                    <div style="width: 200px;">
                        <p>Penerima</p>
                        <div style="margin-top: 100px;"></div>
                        <p>(..................................... )</p>
                    </div>
                    <div style="width: 200px;">
                        <p>Pengirim</p>
                        <div style="margin-top: 100px;"></div>
                        <p>(..................................... )</p>
                    </div>
                </div>
            </div>
        `;
    };

    // ============================================
    // LISTENERS
    // ============================================
    appState.subscribe('items', renderHTML);
    const titleInput = document.getElementById('manual-title');
    if (titleInput) titleInput.addEventListener('input', renderHTML);

    window.addEventListener('resize', renderHTML);
    renderHTML(); // Initial

    // Custom Alert System
    const showAlert = (message, isSuccess = false) => {
        const alertEl = document.getElementById('custom-alert');
        const messageEl = document.getElementById('alert-message');
        if (!alertEl || !messageEl) return;

        messageEl.innerHTML = isSuccess ? `${message} <i class="fa-solid fa-circle-check" style="color:#2ecc71;"></i>` : message;
        alertEl.classList.remove('hidden');
        alertEl.style.animation = 'alert-in 0.3s ease-out forwards';

        setTimeout(() => {
            alertEl.style.animation = 'alert-out 0.3s ease-in forwards';
            setTimeout(() => {
                alertEl.classList.add('hidden');
            }, 300);
        }, 2000);
    };

    // ============================================
    // ACTIONS
    // ============================================
    const validate = () => {
        const title = titleInput?.value.trim();
        if (!title) {
            titleInput?.classList.add('blink-error');
            titleInput?.focus();
            showAlert("Harap isi Judul Invoice terlebih dahulu!");
            setTimeout(() => {
                titleInput?.classList.remove('blink-error');
            }, 1500);
            return false;
        }
        return title;
    };

    const btnSave = document.getElementById('btn-save-only');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const title = validate();
            if (!title) return;
            const items = appState.state.invoiceItems;
            if (items.length === 0) return showAlert("Belum ada item!");
            saveToHistory(items, title);
            showAlert("Berhasil disimpan", true);
        });
    }

    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const title = validate();
            if (!title) return;
            const items = appState.state.invoiceItems;
            if (items.length === 0) return showAlert("Belum ada item!");
            saveToHistory(items, title);
            generatePDFs(items, title);
            showAlert("Berhasil diunduh", true);
        });
    }
}

// ============================================
// HISTORY WORKER
// ============================================
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
export function getPDFDoc(type, items, titleName) {
    const { jsPDF } = window.jspdf;
    const dateStr = getDateStr();
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const doc = new jsPDF();

    // Margins (mm)
    const marginL = 25;
    const marginR = 20;
    const marginT = 28;
    const contentW = 210 - marginL - marginR;

    if (type === 'invoice') {
        // Font: Times New Roman
        doc.setFont("times", "bold");
        doc.setFontSize(21); // 28px
        doc.text("INVOICE", 105, marginT + 10, { align: "center" });

        const headerY = marginT + 30;

        // Calibri fallback
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16.5); // 22px
        doc.text("BERKAH MAJU ELEKTRIK", marginL + 15, headerY + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.75); // 13px
        doc.text("Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor", marginL + 15, headerY + 10);
        doc.text("0855-9174-9020 / 0853-1212-2030", marginL + 15, headerY + 14);
        doc.text("Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS", marginL + 15, headerY + 18);

        // Add Logo
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', marginL, headerY, 12, 12);
        }

        // Date & Recipient Boxes
        doc.setLineWidth(0.75); // 2px is roughly 0.75mm in PDF standard? No, 2px is 2/96 * 25.4 = 0.53mm.
        doc.setLineWidth(0.5);

        doc.rect(130, headerY, 60, 10);
        doc.setFontSize(10.5); // 14px
        doc.text(`Tanggal : ${dateStr}`, 133, headerY + 6);

        doc.rect(130, headerY + 13, 60, 15);
        doc.text("Kepada :", 133, headerY + 18);
        doc.setFont("helvetica", "bold");
        doc.text(titleName || "(Tanpa Nama)", 133, headerY + 23);

        // Separator
        doc.setLineWidth(0.75);
        doc.line(marginL, headerY + 35, 190, headerY + 35);

        // Table
        const tableData = items.map((item, index) => [
            index + 1,
            `Battery UPS ${item.name || ''} ${item.tipe || ''} ${item.note || ''}`,
            `${item.qty} pcs`,
            `Rp ${formatNumber(item.price)}`,
            `Rp ${formatNumber(item.price * item.qty)}`
        ]);

        doc.autoTable({
            startY: headerY + 45,
            margin: { left: marginL, right: marginR },
            head: [['NO', 'KETERANGAN', 'QTY', 'HARGA SATUAN', 'JUMLAH']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [192, 192, 192],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15.8 },
                1: { halign: 'left', cellWidth: 57.1 },
                2: { halign: 'center', cellWidth: 22.2 },
                3: { halign: 'center', cellWidth: 34.9 },
                4: { halign: 'center', cellWidth: 34.9 }
            },
            styles: {
                font: "times",
                fontSize: 12, // 16px is 12pt
                cellPadding: 2,
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            }
        });

        const finalY = doc.lastAutoTable.finalY;

        // Total Row
        doc.rect(125, finalY, 38, 10);
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.text("JUMLAH", 144, finalY + 6.5, { align: "center" });
        doc.rect(163, finalY, 27, 10);
        doc.text(`Rp ${formatNumber(total)}`, 188, finalY + 6.5, { align: "right" });

        // Payment
        doc.setFont("times", "normal");
        doc.text("Pembayaran Bisa melalui rekening Bank BCA 5737162660 a.n SAEPUL IMAN", marginL, finalY + 25);

        // Footer
        doc.text("Hormat Kami", 170, finalY + 45, { align: "center" });
        doc.setFont("times", "bold");
        doc.text("Berkah Maju Elektrik", 170, finalY + 75, { align: "center" });

    } else {
        // SURAT JALAN
        const headerY = marginT;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18); // 24px
        doc.text("BERKAH MAJU ELEKTRIK", marginL + 18, headerY + 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.75); // 13px
        doc.text("Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor", marginL + 18, headerY + 15);
        doc.text("0855-9174-9020 / 0853-1212-2030", marginL + 18, headerY + 19);
        doc.text("Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS", marginL + 18, headerY + 23);

        // Add Logo
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', marginL, headerY, 15, 15);
        }

        // Vertical Bar
        doc.setLineWidth(1.5);
        doc.line(140, headerY + 5, 140, headerY + 28);

        doc.setFontSize(27); // 36px
        doc.setFont("helvetica", "bold");
        doc.text("SURAT JALAN", 145, headerY + 22);

        // Double lines
        doc.setLineWidth(0.75);
        doc.line(marginL, headerY + 32, 190, headerY + 32);
        doc.setLineWidth(0.25);
        doc.line(marginL, headerY + 34, 190, headerY + 34);

        // Content
        const contentY = headerY + 50;
        doc.setFont("times", "normal");
        doc.setFontSize(12);
        doc.text("Kepada Yth.", marginL, contentY);
        doc.setFont("times", "bold");
        doc.setFontSize(13.5); // 18px
        doc.text(titleName || "(Tanpa Nama)", marginL, contentY + 6);

        doc.setFont("times", "normal");
        doc.setFontSize(12);
        doc.text(`Tanggal : ${dateStr}`, 190, contentY, { align: "right" });

        doc.text("Bersama dengan ini kami kirimkan sejumlah barang sebagai berikut:", marginL, contentY + 25);

        const tableData = items.map((item, index) => [
            index + 1,
            `Battery ${item.name || ''}`,
            `${item.qty} pcs`,
            `UPS ${item.tipe || ''} ${item.note || ''}`
        ]);

        doc.autoTable({
            startY: contentY + 32,
            margin: { left: marginL, right: marginR },
            head: [['No.', 'Nama Barang', 'Jumlah', 'Keterangan']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [192, 192, 192],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12.9 },
                1: { halign: 'left', cellWidth: 59.3 },
                2: { halign: 'center', cellWidth: 25.8 },
                3: { halign: 'center', cellWidth: 67 }
            },
            styles: {
                font: "times",
                fontSize: 12,
                cellPadding: 3,
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            }
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.text("Diterima Tanggal : .....................................", marginL, finalY + 20);

        doc.text("Penerima", 60, finalY + 40, { align: "center" });
        doc.text("(.....................................)", 60, finalY + 80, { align: "center" });

        doc.text("Pengirim", 155, finalY + 40, { align: "center" });
        doc.text("(.....................................)", 155, finalY + 80, { align: "center" });
    }
    return doc;
}

export function generatePDFs(items, titleName) {
    const doc1 = getPDFDoc('invoice', items, titleName);
    doc1.save(`Invoice-${titleName}.pdf`);

    const doc2 = getPDFDoc('letter', items, titleName);
    doc2.save(`SuratJalan-${titleName}.pdf`);
}
