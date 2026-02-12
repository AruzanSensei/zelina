import { appState } from '../state.js';
import { exportToPNG, exportToJPEG, exportBothDocuments } from './imageExporter.js';

// ============================================
// HELPERS
// ============================================
const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num);
const getDateStr = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ============================================
// TEMPLATE BUILDERS (HTML + CSS 1:1 dengan file referensi)
// ============================================
const INVOICE_STYLE = `
        /* Font Rendering Stabilization - Desktop-Android Consistency */
        html {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            line-height: 1.4;
            background-color: #f5f5f5;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 28mm 18mm 25mm 18mm;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
        }

        .header h1 {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 30px;
            color: #000;
        }

        .company-info {
            font-family: 'Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', sans-serif;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
        }

        .company-left {
            display: flex;
            align-items: flex-start;
            gap: 3px;
            flex: 1;
        }

        .company-logo {
            width: 70px;
            height: auto;
        }

        .company-details {
            text-align: left;
        }

        .company-details h2 {
            font-size: 22px;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 3px;
        }

        .company-details p {
            font-size: 13px;
            line-height: 1.2;
            margin: 1px 0;
        }

        .invoice-info-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .invoice-box {
            border: 2px solid #000;
            padding: 8px 10px;
            min-width: 210px;
            margin-right: 0px;
        }

        .invoice-box p {
            font-size: 14px;
            margin: 2px 0;
            line-height: 1;
        }

        .invoice-box strong {
            font-weight: bold;
        }

        .separator {
            border-top: 2px solid #000;
            margin: 14px 0 30px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }

        table th {
            background-color: #c0c0c0;
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            line-height: 1.2;
        }

        table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 16px;
            line-height: 1.3;
        }

        table td:nth-child(1) {
            text-align: center;
            width: 50px;
        }

        table td:nth-child(2) {
            text-align: left;
            width: 180px;
        }

        table td:nth-child(3) {
            text-align: center;
            width: 70px;
        }

        table td:nth-child(4),
        table td:nth-child(5) {
            text-align: center;
            width: 110px;
        }

        .total-section {
            width: 100%;
            margin-top: 0;
        }

        .total-row {
            display: flex;
            justify-content: flex-end;
            border: 1px solid #000;
            border-top: none;
            border-left: none;
            border-bottom: none;
        }

        .total-label {
            padding: 6px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            line-height: 1.3;
            border-right: 1px solid #000;
            width: 120px;
        }

        .total-value {
            padding: 6px 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #000;
            border-top: none;
            border-left: none;
            border-right: none;
            font-size: 16px;
            width: 277px;
        }

        .payment-info {
            font-size: 16px;
            margin: 35px 0 65px 0;
            text-align: left;
        }

        .footer {
            margin-top: 35px;
            text-align: right;
        }

        .footer p {
            font-size: 16px;
            margin: 4px 0;
        }

        .hormat-kami {
            padding-right: 28px;
        }

        .signature-space {
            margin-top: 80px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .page-container {
                box-shadow: none;
                margin: 0;
                width: 210mm;
                min-height: 297mm;
            }

            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
        }
`;

const SURAT_JALAN_STYLE = `
        /* Font Rendering Stabilization - Desktop-Android Consistency */
        html {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            line-height: 1.4;
            background-color: #f5f5f5;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 28mm 18mm 25mm 18mm;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header-container {
            font-family: 'Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', sans-serif;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 2px;
        }

        .company-info {
            display: flex;
            align-items: center;
            gap: 7px;
            flex: 1;
        }

        .company-logo {
            width: 65px;
            height: auto;
        }

        .company-details h2 {
            font-size: 24px;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .company-details p {
            font-size: 12px;
            line-height: 1.1;
            margin: 0;
        }

        .document-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .vertical-bar {
            width: 5px;
            height: 75px;
            background-color: #000;
        }

        .document-title h1 {
            font-size: 36px;
            font-weight: bold;
            line-height: 1.1;
            letter-spacing: 1px;
        }

        .header-underline {
            border-bottom: 1px solid #000;
            margin-bottom: 35px;
        }

        .content-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            font-size: 16px;
        }

        .recipient-info {
            line-height: 1.3;
        }

        .recipient-info strong {
            font-size: 18px;
        }

        .date-info {
            text-align: right;
        }

        .opening-text {
            margin-bottom: 20px;
            font-size: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        table th {
            background-color: #c0c0c0;
            border: 1px solid #000;
            padding: 10px 8px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            line-height: 1.2;
        }

        table td {
            border: 1px solid #000;
            padding: 10px 8px;
            font-size: 16px;
            line-height: 1.3;
            vertical-align: middle;
        }

        table td:nth-child(1) {
            text-align: center;
            width: 50px;
        }

        table td:nth-child(2) {
            text-align: left;
            width: 230px;
        }

        table td:nth-child(3) {
            text-align: center;
            width: 100px;
        }

        table td:nth-child(4) {
            text-align: center;
            width: 260px;
        }

        .received-date {
            margin-bottom: 40px;
            font-size: 16px;
        }

        .signature-section {
            display: flex;
            justify-content: space-around;
            text-align: center;
            font-size: 16px;
        }

        .signature-box {
            width: 200px;
        }

        .signature-space {
            margin-top: 100px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .page-container {
                box-shadow: none;
                margin: 0;
                width: 210mm;
                min-height: 297mm;
            }

            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
        }
`;

const buildInvoiceHTML = (items, titleName) => {
    const dateStr = getDateStr();
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const rows = items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ''} ${item.tipe || ''} ${item.note || ''}</td>
                    <td>${item.qty} pcs</td>
                    <td>Rp ${formatNumber(item.price)}</td>
                    <td>Rp ${formatNumber(item.price * item.qty)}</td>
                </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Berkah Maju Elektrik</title>
    <style>
${INVOICE_STYLE}
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header">
            <h1>INVOICE</h1>
                </div>

        <div class="company-info">
            <div class="company-left">
                <img src="assets/Logo berkah maju elektrik.png" alt="Berkah Maju Elektrik Logo" class="company-logo">
                <div class="company-details">
                    <h2>BERKAH MAJU ELEKTRIK</h2>
                    <p>Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                    <p>0855-9174-9020 / 0853-1212-2030</p>
                    <p>Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                        </div>
                    </div>
            <div class="invoice-info-container">
                <div class="invoice-box">
                    <p>Tanggal :</p>
                        </div>
                <div class="invoice-box">
                    <p>Kepada :</p>
                    <p><strong>PT. SARASWANTI INDO GENETECH</strong></p>
                        </div>
                    </div>
                </div>

        <div class="separator"></div>
                
        <table>
                    <thead>
                        <tr>
                    <th>NO</th>
                    <th>KETERANGAN</th>
                    <th>QTY</th>
                    <th>HARGA<br>SATUAN</th>
                    <th>JUMLAH</th>
                        </tr>
                    </thead>
                    <tbody>
${rows}
                    </tbody>
                </table>
                
        <div class="total-section">
            <div class="total-row">
                <div class="total-label">JUMLAH</div>
                <div class="total-value">Rp ${formatNumber(total)}</div>
                    </div>
                </div>

        <div class="payment-info">
                    <p>Pembayaran Bisa melalui rekening Bank <strong>BCA 5737162660</strong> a.n SAEPUL IMAN</p>
                </div>
                
        <div class="footer">
            <p class="hormat-kami">Hormat Kami</p>
            <div class="signature-space"></div>
            <p>Berkah Maju Elektrik</p>
                </div>
            </div>
</body>
</html>`;
};

const buildSuratJalanHTML = (items) => {
    const rows = items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ''}</td>
                    <td>${item.qty} pcs</td>
                    <td>UPS ${item.tipe || ''} ${item.note || ''}</td>
                </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surat Jalan - Berkah Maju Elektrik</title>
    <style>
${SURAT_JALAN_STYLE}
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header-container">
            <div class="company-info">
                <img src="assets/Logo berkah maju elektrik.png" alt="Berkah Maju Elektrik Logo" class="company-logo">
                <div class="company-details">
                    <h2>BERKAH MAJU ELEKTRIK</h2>
                    <p>Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                    <p>0855-9174-9020 / 0853-1212-2030</p>
                    <p>Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                        </div>
                    </div>
            <div class="document-title">
                <div class="vertical-bar"></div>
                <h1>SURAT JALAN</h1>
                    </div>
                </div>
        <div class="header-underline"></div>

        <div class="content-info">
            <div class="recipient-info">
                        <p>Kepada Yth.</p>
                <p><strong>PT. Saraswanti Indo Genetech</strong></p>
                <p>Jl. Rasamala, Jl. Ring Road Yasmin No. 20,</p>
                <p>RT.02/RW.03, Curugmekar,</p>
                <p>Kec. Bogor Barat</p>
                <p>Kota Bogor 16113</p>
                    </div>
            <div class="date-info">
                <p>Tanggal : .....................................</p>
                    </div>
                </div>

        <div class="opening-text">
                    <p>Bersama dengan ini kami kirimkan sejumlah barang sebagai berikut:</p>
                </div>
               
        <table>
                    <thead>
                        <tr>
                    <th>No.</th>
                    <th>Nama Barang</th>
                    <th>Jumlah</th>
                    <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
${rows}
                    </tbody>
                </table>
                
        <div class="received-date">
                    <p>Diterima Tanggal : .....................................</p>
                </div>

        <div class="signature-section">
            <div class="signature-box">
                        <p>Penerima</p>
                <div class="signature-space"></div>
                <p>(.....................................)</p>
                    </div>
            <div class="signature-box">
                        <p>Pengirim</p>
                <div class="signature-space"></div>
                <p>(.....................................)</p>
                    </div>
                </div>
            </div>
</body>
</html>`;
};

// ============================================
// PINCH ZOOM (MOBILE PREVIEW)
// ============================================
function setupPinchZoom(wrapper, frame) {
    if (wrapper.dataset.pinchBound) return;
    wrapper.dataset.pinchBound = '1';

    let pointers = new Map();
    let initialDistance = 0;
    let initialZoom = 1;

    const getDistance = () => {
        const pts = Array.from(pointers.values());
        if (pts.length < 2) return 0;
        const [a, b] = pts;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const updateTransform = () => {
        const baseScale = parseFloat(frame.dataset.baseScale || '1');
        const zoom = parseFloat(frame.dataset.zoom || '1');
        frame.style.transform = `scale(${baseScale * zoom})`;
    };

    const onPointerDown = (e) => {
        if (e.pointerType !== 'touch') return;
        wrapper.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            initialDistance = getDistance();
            initialZoom = parseFloat(frame.dataset.zoom || '1');
        }
    };

    const onPointerMove = (e) => {
        if (!pointers.has(e.pointerId)) return;
        if (e.pointerType !== 'touch') return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2 && initialDistance > 0) {
            const dist = getDistance();
            if (!dist) return;
            let nextZoom = initialZoom * (dist / initialDistance);
            nextZoom = Math.max(0.5, Math.min(3, nextZoom));
            frame.dataset.zoom = String(nextZoom);
            updateTransform();
        }
    };

    const onPointerUp = (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        if (pointers.size < 2) {
            initialDistance = 0;
        }
    };

    wrapper.style.touchAction = 'none';
    wrapper.addEventListener('pointerdown', onPointerDown);
    wrapper.addEventListener('pointermove', onPointerMove);
    wrapper.addEventListener('pointerup', onPointerUp);
    wrapper.addEventListener('pointercancel', onPointerUp);
    wrapper.addEventListener('pointerleave', onPointerUp);
}

// ============================================
// INITIALIZER
// ============================================
export function initPDFGenerator() {
    const invoicePreviewContainer = document.getElementById('invoice-preview-container');
    const letterPreviewContainer = document.getElementById('letter-preview-container');
    const previewModal = document.getElementById('preview-modal');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const previewTitle = document.getElementById('preview-title');
    const previewDownloadBtn = document.getElementById('preview-download-btn');
    const closePreviewBtn = document.querySelector('.close-modal-preview');

    let lastInvoiceHTML = '';
    let lastSuratJalanHTML = '';

    // ============================================
    // HTML PREVIEW (gunakan HTML olahan dengan CSS template)
    // ============================================
    const renderHTML = () => {
        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title')?.value || '';

        const invoiceHTML = buildInvoiceHTML(items, title);
        const suratJalanHTML = buildSuratJalanHTML(items);
        lastInvoiceHTML = invoiceHTML;
        lastSuratJalanHTML = suratJalanHTML;

        const ensureFrame = (container, html, titleText) => {
            let frame = container.querySelector('iframe[data-template-frame="1"]');
            let wrapper = container.querySelector('.a4-preview-wrapper');

            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'a4-preview-wrapper';
                container.innerHTML = '';
                container.appendChild(wrapper);
            }

            if (!frame) {
                frame = document.createElement('iframe');
                frame.className = 'a4-preview-frame';
                frame.setAttribute('data-template-frame', '1');
                frame.title = titleText;
                frame.loading = 'lazy';
                wrapper.appendChild(frame);
            }

            frame.srcdoc = html;

            const refWidth = 794;
            const refHeight = 1123;
            const availableWidth = wrapper.clientWidth || refWidth;
            const availableHeight = wrapper.clientHeight || refHeight;
            const scale = Math.min(availableWidth / refWidth, availableHeight / refHeight);

            frame.style.transform = `scale(${scale})`;
        };

        ensureFrame(invoicePreviewContainer, invoiceHTML, 'Preview Invoice');
        ensureFrame(letterPreviewContainer, suratJalanHTML, 'Preview Surat Jalan');
    };

    // ============================================
    // LISTENERS
    // ============================================
    renderHTML();
    window.addEventListener('resize', renderHTML);
    appState.subscribe('items', renderHTML);
    const titleInput = document.getElementById('manual-title');
    if (titleInput) titleInput.addEventListener('input', renderHTML);

    // Fullscreen preview (modal)
    const openFullPreview = (type) => {
        if (!previewModal || !previewFrame || !previewTitle || !previewDownloadBtn) return;

        // reset zoom state for modal frame
        previewFrame.dataset.baseScale = '1';
        previewFrame.dataset.zoom = '1';
        previewFrame.style.transform = 'scale(1)';

        if (type === 'invoice') {
            previewTitle.textContent = 'Preview Invoice';
            previewFrame.srcdoc = lastInvoiceHTML;
            previewDownloadBtn.onclick = () => {
                const title = document.getElementById('manual-title')?.value || '';
                const items = appState.state.invoiceItems;
                if (!items || items.length === 0 || !title) return;
                printInvoicePDF(items, title);
            };
        } else {
            previewTitle.textContent = 'Preview Surat Jalan';
            previewFrame.srcdoc = lastSuratJalanHTML;
            // Untuk saat ini, unduh tetap invoice; bisa di-nonaktifkan jika tidak diinginkan
            previewDownloadBtn.onclick = () => {
                const title = document.getElementById('manual-title')?.value || '';
                const items = appState.state.invoiceItems;
                if (!items || items.length === 0 || !title) return;
                printInvoicePDF(items, title);
            };
        }

        previewModal.classList.remove('hidden');
        previewModal.classList.add('active');

        const modalBody = previewModal.querySelector('.modal-body');
        if (modalBody) {
            setupPinchZoom(modalBody, previewFrame);
        }
    };

    if (closePreviewBtn && previewModal) {
        closePreviewBtn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
            previewModal.classList.remove('active');
        });
    }

    // Preview buttons (bottom-right) instead of whole card click
    const previewButtons = document.querySelectorAll('.preview-open-btn');
    previewButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.previewType === 'surat' ? 'surat' : 'invoice';
            openFullPreview(type);
        });
    });

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
    // DOWNLOAD EXECUTION
    // ============================================
    const executeDownload = async (items, title, format) => {
        if (format === 'pdf') {
            printInvoicePDF(items, title);
        } else if (format === 'png') {
            await exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, items, title, 'png');
        } else if (format === 'jpeg') {
            await exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, items, title, 'jpeg');
        }
    };

    // Show format selection menu
    const showFormatMenu = () => {
        const formats = appState.state.settings.downloadFormats || { png: true, jpeg: true, pdf: true };
        const enabledFormats = Object.keys(formats).filter(f => formats[f]);

        if (enabledFormats.length === 0) {
            showAlert("Tidak ada format yang aktif! Silakan aktifkan di Pengaturan.");
            return;
        }

        // Remove existing menu if any
        const existingMenu = document.getElementById('format-menu');
        if (existingMenu) existingMenu.remove();

        // Create menu
        const menu = document.createElement('div');
        menu.id = 'format-menu';
        menu.className = 'format-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 200px;
            animation: slideUp 0.2s ease-out;
        `;

        const formatLabels = {
            png: 'PNG (Gambar)',
            jpeg: 'JPEG (Gambar)',
            pdf: 'PDF (Print)'
        };

        const formatIcons = {
            png: 'fa-file-image',
            jpeg: 'fa-file-image',
            pdf: 'fa-file-pdf'
        };

        enabledFormats.forEach(format => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline btn-full';
            btn.style.cssText = 'margin-bottom: 4px; text-align: left; justify-content: flex-start; gap: 8px;';
            btn.innerHTML = `<i class="fa-solid ${formatIcons[format]}"></i> ${formatLabels[format]}`;
            btn.onclick = async () => {
                menu.remove();
                const title = validate();
                if (!title) return;
                const items = appState.state.invoiceItems;
                if (items.length === 0) return showAlert("Belum ada item!");
                saveToHistory(items, title);
                await executeDownload(items, title, format);
            };
            menu.appendChild(btn);
        });

        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline btn-full';
        cancelBtn.style.cssText = 'margin-top: 4px; border-color: var(--text-muted);';
        cancelBtn.textContent = 'Batal';
        cancelBtn.onclick = () => menu.remove();
        menu.appendChild(cancelBtn);

        document.body.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            const closeOnClickOutside = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeOnClickOutside);
                }
            };
            document.addEventListener('click', closeOnClickOutside);
        }, 100);
    };

    // ============================================
    // VALIDATION
    // ============================================
    const validate = () => {
        const titleInput = document.getElementById('manual-title');
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
        let pressTimer = null;
        let isLongPress = false;

        // Long-press detection
        const startPress = (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showFormatMenu();
                // Haptic feedback if available
                if (navigator.vibrate) navigator.vibrate(50);
            }, 500); // 500ms for long press
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        const handlePress = (e) => {
            cancelPress();

            // If it was a long press, menu already shown, do nothing
            if (isLongPress) {
                isLongPress = false;
                return;
            }

            // Normal click - use default method
            const title = validate();
            if (!title) return;
            const items = appState.state.invoiceItems;
            if (items.length === 0) return showAlert("Belum ada item!");

            saveToHistory(items, title);

            // Execute default download method
            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';
            executeDownload(items, title, defaultMethod);
        };

        // Add event listeners for both touch and mouse
        btnDownload.addEventListener('mousedown', startPress);
        btnDownload.addEventListener('touchstart', startPress, { passive: true });

        btnDownload.addEventListener('mouseup', handlePress);
        btnDownload.addEventListener('touchend', handlePress);

        btnDownload.addEventListener('mouseleave', cancelPress);
        btnDownload.addEventListener('touchcancel', cancelPress);
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
// PRINT (Browser Engine)
// ============================================
export async function printInvoicePDF(items, titleName) {
    // CRITICAL: Wait for fonts to load before printing (Desktop-Android consistency)
    try {
        await document.fonts.ready;
        const timesLoaded = document.fonts.check('12px "Times New Roman"');
        if (!timesLoaded) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } catch (error) {
        console.warn('Font check before PDF failed:', error);
    }

    const html = buildInvoiceHTML(items, titleName);
    const fileTitle = `Invoice-${titleName}`;

    const w = window.open('', '_blank');
    if (!w) return;

    const originalTitle = document.title;
    try {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.document.title = fileTitle;
    } catch {
        return;
    }

    // Give the new window time to load fonts and finish layout before printing
    setTimeout(() => {
        try {
            w.focus();
            w.print();
        } catch {
            // ignore; user can still print manually from the new tab
        } finally {
            try {
                w.document.title = originalTitle;
            } catch { }
        }
    }, 300); // Increased from 150ms to 300ms for font rendering
}
