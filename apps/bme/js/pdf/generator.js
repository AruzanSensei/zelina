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

export const buildInvoiceHTML = (items, titleName) => {
    const dateStr = getDateStr();
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const rows = items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.invKeterangan || `${item.name || ''} ${item.tipe || ''} ${item.note || ''}`.trim()}</td>
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
                <img src="assets/icons/logo-bme.png" alt="Berkah Maju Elektrik Logo" class="company-logo">
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

export const buildSuratJalanHTML = (items) => {
    const rows = items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ''}</td>
                    <td>${item.qty} pcs</td>
                    <td>${item.sjKeterangan || `UPS ${item.tipe || ''} ${item.note || ''}`.trim()}</td>
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
                <img src="assets/icons/logo-bme.png" alt="Berkah Maju Elektrik Logo" class="company-logo">
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
// MODAL PREVIEW & PINCH ZOOM
// ============================================
export const openPreviewModal = (html, titleText, type, downloadAction, editAction = null, showEditButton = true) => {
    const previewModal = document.getElementById('preview-modal');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const previewTitle = document.getElementById('preview-title');
    const previewDownloadBtn = document.getElementById('preview-download-btn');
    const btnModalEdit = document.getElementById('btn-modal-edit');
    if (!previewModal || !previewFrame || !previewTitle || !previewDownloadBtn) return;

    previewTitle.textContent = titleText;
    previewFrame.srcdoc = html;

    // Optional: Hide/Show edit button and attach custom editAction if provided
    if (btnModalEdit) {
        btnModalEdit.style.display = showEditButton ? 'inline-flex' : 'none';

        // Reset editing state on modal load
        btnModalEdit.classList.remove('is-editing');
        btnModalEdit.style.backgroundColor = '';
        btnModalEdit.style.color = '';

        // Tag with editAction so the existing listener can check at click-time
        if (showEditButton && editAction) {
            btnModalEdit._customEditAction = editAction;
        } else {
            btnModalEdit._customEditAction = null;
        }
    }

    previewModal.classList.remove('hidden');
    previewModal.classList.add('active');

    // Attach download action to the download button directly
    const freshDownloadBtn = document.getElementById('preview-download-btn');
    if (freshDownloadBtn) {
        // Clone to remove any previous onclick from last session
        const newDownloadBtn = freshDownloadBtn.cloneNode(true);
        freshDownloadBtn.parentNode.replaceChild(newDownloadBtn, freshDownloadBtn);
        newDownloadBtn.onclick = () => {
            if (downloadAction) downloadAction();
        };
    }

    // Calculate zoom-to-fit
    setTimeout(() => {
        const modalBody = previewModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.display = 'flex';
            modalBody.style.justifyContent = 'center';
            modalBody.style.alignItems = 'center';
            modalBody.style.overflow = 'hidden';
            modalBody.style.cursor = 'grab';

            previewFrame.style.width = '794px';
            previewFrame.style.height = '1123px';
            previewFrame.style.flexShrink = '0';
            previewFrame.style.pointerEvents = 'none';

            // Reset position
            previewFrame.dataset.x = '0';
            previewFrame.dataset.y = '0';

            const refWidth = 794;
            const refHeight = 1123;
            const availableWidth = modalBody.clientWidth || document.documentElement.clientWidth * 0.9;
            const availableHeight = modalBody.clientHeight || document.documentElement.clientHeight * 0.8;
            const scale = Math.min(availableWidth / refWidth, availableHeight / refHeight) * 0.95;

            previewFrame.dataset.minZoom = scale.toString();
            previewFrame.dataset.zoom = scale.toString();
            previewFrame.style.transformOrigin = 'center center';
            previewFrame.style.transform = `translate(0px, 0px) scale(${scale})`;
            previewFrame.style.transition = 'none';

            // Reset pinchBound so setupPinchZoom re-registers clean listeners each open
            delete modalBody.dataset.pinchBound;
            setupPinchZoom(modalBody, previewFrame);
        }
    }, 150);
};

function setupPinchZoom(wrapper, frame) {
    // Clean up any previous pinch/zoom listeners via AbortController
    if (wrapper._pinchZoomAbort) {
        wrapper._pinchZoomAbort.abort();
    }
    const controller = new AbortController();
    wrapper._pinchZoomAbort = controller;
    const sig = controller.signal;
    wrapper.dataset.pinchBound = '1';

    let pointers = new Map();
    let initialDistance = 0;
    let initialZoom = 1;
    let lastPanCenter = null;

    const getDistance = () => {
        const pts = Array.from(pointers.values());
        if (pts.length < 2) return 0;
        const [a, b] = pts;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = () => {
        const pts = Array.from(pointers.values());
        if (pts.length === 1) return { x: pts[0].x, y: pts[0].y };
        if (pts.length >= 2) return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        return { x: 0, y: 0 };
    };

    const updateTransform = () => {
        const zoom = parseFloat(frame.dataset.zoom || '1');
        const x = parseFloat(frame.dataset.x || '0');
        const y = parseFloat(frame.dataset.y || '0');
        frame.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    };

    const onPointerDown = (e) => {
        wrapper.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        lastPanCenter = getCenter();

        if (pointers.size === 2) {
            initialDistance = getDistance();
            initialZoom = parseFloat(frame.dataset.zoom || '1');
        }
    };

    const onPointerMove = (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        const center = getCenter();

        // Panning interaction
        if (lastPanCenter) {
            let x = parseFloat(frame.dataset.x || '0');
            let y = parseFloat(frame.dataset.y || '0');
            x += (center.x - lastPanCenter.x);
            y += (center.y - lastPanCenter.y);
            frame.dataset.x = String(x);
            frame.dataset.y = String(y);
        }
        lastPanCenter = center;

        // Zooming interaction
        if (pointers.size === 2 && initialDistance > 0) {
            const dist = getDistance();
            if (!dist) return;
            const minZoom = parseFloat(frame.dataset.minZoom || '0.3');
            let nextZoom = initialZoom * (dist / initialDistance);
            nextZoom = Math.max(minZoom, Math.min(1, nextZoom)); // limit zoom
            frame.dataset.zoom = String(nextZoom);
        }

        updateTransform();
    };

    const onPointerUp = (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        if (pointers.size < 2) {
            initialDistance = 0;
        }
        if (pointers.size > 0) {
            lastPanCenter = getCenter();
        } else {
            lastPanCenter = null;
        }
    };

    wrapper.style.touchAction = 'none';
    wrapper.style.overflow = 'hidden';
    wrapper.style.cursor = 'grab';

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const minZoom = parseFloat(frame.dataset.minZoom || '0.3');
        let currentZoom = parseFloat(frame.dataset.zoom || minZoom);

        const zoomFactor = 0.05;
        let nextZoom = currentZoom - Math.sign(e.deltaY) * zoomFactor;
        nextZoom = Math.max(minZoom, Math.min(1, nextZoom));

        frame.dataset.zoom = String(nextZoom);
        updateTransform();
    }, { passive: false, signal: sig });

    // Handle mouse cursor changes
    wrapper.addEventListener('pointerdown', (e) => {
        wrapper.style.cursor = 'grabbing';
        onPointerDown(e);
    }, { signal: sig });
    wrapper.addEventListener('pointermove', onPointerMove, { signal: sig });
    wrapper.addEventListener('pointerup', (e) => {
        wrapper.style.cursor = 'grab';
        onPointerUp(e);
    }, { signal: sig });
    wrapper.addEventListener('pointercancel', (e) => {
        wrapper.style.cursor = 'grab';
        onPointerUp(e);
    }, { signal: sig });
    wrapper.addEventListener('pointerleave', (e) => {
        wrapper.style.cursor = 'grab';
        onPointerUp(e);
    }, { signal: sig });
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

    let manualEdits = { invoice: null, letter: null };
    let currentPreviewType = null;

    // ============================================
    // HTML PREVIEW (gunakan HTML olahan dengan CSS template)
    // ============================================
    const renderHTML = () => {
        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        const items = appState.state.invoiceItems;
        const title = document.getElementById('manual-title')?.value || '';

        const invoiceHTML = manualEdits.invoice || buildInvoiceHTML(items, title);
        const suratJalanHTML = manualEdits.letter || buildSuratJalanHTML(items);
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
        currentPreviewType = type;
        const editKey = type === 'surat' ? 'letter' : 'invoice';
        // Show the edited HTML if it exists, otherwise the last rendered HTML
        const html = manualEdits[editKey]
            ? manualEdits[editKey]
            : (type === 'invoice' ? lastInvoiceHTML : lastSuratJalanHTML);
        const titleText = type === 'invoice' ? 'Preview Invoice' : 'Preview Surat Jalan';

        // Use generalized modal open function, pass null for downloadAction to use manual mode's override
        openPreviewModal(html, titleText, type, null);

        // Re-query the download button after openPreviewModal (it may have been replaced by cloneNode)
        const liveDownloadBtn = document.getElementById('preview-download-btn');

        // Customize download click to handle manual edits logic
        if (liveDownloadBtn) {
            liveDownloadBtn.onclick = async () => {
                const title = document.getElementById('manual-title')?.value || '';
                const items = appState.state.invoiceItems;
                if (!items || items.length === 0) return showAlert('Belum ada item!');
                const titleRequired = appState.state.settings?.titleRequired !== false;
                if (titleRequired && !title) return showAlert('Harap isi Judul Invoice terlebih dahulu!');

                // Resolve default method and filename regardless of edit mode
                const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
                const formats = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };
                const template = type === 'surat' ? formats.suratJalan : formats.invoice;
                const now = new Date();
                const filename = template
                    .replace(/\{judul\}/gi, title)
                    .replace(/%YYYY/g, String(now.getFullYear()))
                    .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
                    .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
                    .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
                    .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
                    .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));

                const editKey = type === 'surat' ? 'letter' : 'invoice';
                // Use edited HTML if available, otherwise build fresh
                const htmlDoc = manualEdits[editKey]
                    ? manualEdits[editKey]
                    : (type === 'invoice' ? buildInvoiceHTML(items, title) : buildSuratJalanHTML(items));

                if (defaultMethod === 'pdf') {
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open();
                    w.document.write(htmlDoc);
                    w.document.close();
                    w.document.title = title;
                    setTimeout(() => {
                        w.focus();
                        w.print();
                        document.dispatchEvent(new CustomEvent('download-complete'));
                    }, 300);
                } else {
                    // PNG/JPEG export using htmlDoc (edited or fresh)
                    const alertEl = document.getElementById('custom-alert');
                    const messageEl = document.getElementById('alert-message');
                    if (alertEl && messageEl) {
                        messageEl.innerHTML = 'Mengekspor... <i class="fa-solid fa-spinner fa-spin"></i>';
                        alertEl.classList.remove('hidden');
                        alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
                    }

                    if (defaultMethod === 'jpeg') {
                        await exportToJPEG(htmlDoc, filename);
                    } else {
                        await exportToPNG(htmlDoc, filename);
                    }

                    if (alertEl) {
                        alertEl.classList.add('hidden');
                    }
                }
            };
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

    // Per-card download buttons
    const cardDownloadButtons = document.querySelectorAll('.preview-card-download-btn');
    cardDownloadButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const type = btn.dataset.downloadType === 'surat' ? 'surat' : 'invoice';

            const title = document.getElementById('manual-title')?.value || '';
            const items = appState.state.invoiceItems;

            if (!items || items.length === 0) return showAlert('Belum ada item!');
            const titleRequired = appState.state.settings?.titleRequired !== false;
            if (titleRequired && !title) return showAlert('Harap isi Judul Invoice terlebih dahulu!');

            const defaultMethod = appState.state.settings.defaultDownloadMethod || 'png';
            const formats = appState.state.settings.fileNameFormat || { invoice: 'Invoice-{judul}', suratJalan: 'Surat Jalan-{judul}' };
            const template = type === 'surat' ? formats.suratJalan : formats.invoice;
            const now = new Date();
            const filename = template
                .replace(/\{judul\}/gi, title)
                .replace(/%YYYY/g, String(now.getFullYear()))
                .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
                .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
                .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
                .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
                .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));

            const editKey = type === 'surat' ? 'letter' : 'invoice';
            const htmlDoc = manualEdits[editKey]
                ? manualEdits[editKey]
                : (type === 'invoice' ? buildInvoiceHTML(items, title) : buildSuratJalanHTML(items));

            if (defaultMethod === 'pdf') {
                const w = window.open('', '_blank');
                if (!w) return;
                w.document.open();
                w.document.write(htmlDoc);
                w.document.close();
                w.document.title = title;
                setTimeout(() => {
                    w.focus();
                    w.print();
                    document.dispatchEvent(new CustomEvent('download-complete'));
                }, 300);
            } else {
                const alertEl = document.getElementById('custom-alert');
                const messageEl = document.getElementById('alert-message');
                if (alertEl && messageEl) {
                    messageEl.innerHTML = 'Mengekspor... <i class="fa-solid fa-spinner fa-spin"></i>';
                    alertEl.classList.remove('hidden');
                    alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
                }

                if (defaultMethod === 'jpeg') {
                    await exportToJPEG(htmlDoc, filename);
                } else {
                    await exportToPNG(htmlDoc, filename);
                }

                if (alertEl) {
                    alertEl.classList.add('hidden');
                }
            }
        });
    });

    const btnModalEdit = document.getElementById('btn-modal-edit');
    const editConfirmModal = document.getElementById('edit-confirm-modal');
    const dontShowEditConfirm = document.getElementById('dont-show-edit-confirm');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnProceedEdit = document.getElementById('btn-proceed-edit');

    const disableEditing = () => {
        if (previewFrame && previewFrame.contentDocument) {
            previewFrame.style.pointerEvents = 'none';
            previewFrame.contentDocument.body.contentEditable = "false";
            previewFrame.contentDocument.body.style.outline = "none";

            if (btnModalEdit) {
                btnModalEdit.classList.remove('is-editing');
                btnModalEdit.style.backgroundColor = '';
                btnModalEdit.style.color = '';
            }
        }
    };

    const enableEditing = () => {
        if (previewFrame && previewFrame.contentDocument) {
            // Re-enable pointer events so the user can click text to edit
            previewFrame.style.pointerEvents = 'auto';

            // DO NOT reset transform or overflow here!
            // We want to KEEP the existing pinch/zoom layout set up by openPreviewModal
            // so the user can pan and zoom while editing just like in preview mode.

            // Enable content editable
            previewFrame.contentDocument.body.contentEditable = "true";
            previewFrame.contentDocument.body.style.outline = "2px dashed #f39c12"; // visual feedback
            previewFrame.contentDocument.body.focus();

            if (btnModalEdit) {
                btnModalEdit.classList.add('is-editing');
                btnModalEdit.style.backgroundColor = '#f39c12'; // orange primary color
                btnModalEdit.style.color = '#fff';
            }

            const onInput = () => {
                const editedHTML = "<!DOCTYPE html>\n<html lang=\"id\">\n" + previewFrame.contentDocument.documentElement.innerHTML + "\n</html>";
                const editKey = currentPreviewType === 'surat' ? 'letter' : 'invoice';
                manualEdits[editKey] = editedHTML;

                updateManualEditOverlay();

                const container = currentPreviewType === 'surat' ? letterPreviewContainer : invoicePreviewContainer;
                const miniFrame = container.querySelector('iframe');
                if (miniFrame) {
                    miniFrame.srcdoc = editedHTML;
                }
            };

            previewFrame.contentDocument.body.removeEventListener('input', onInput);
            previewFrame.contentDocument.body.addEventListener('input', onInput);

            // Immediately mark it as edited so the overlay shows up even without typing
            const editKey = currentPreviewType === 'surat' ? 'letter' : 'invoice';
            if (!manualEdits[editKey]) {
                const editedHTML = "<!DOCTYPE html>\n<html lang=\"id\">\n" + previewFrame.contentDocument.documentElement.innerHTML + "\n</html>";
                manualEdits[editKey] = editedHTML;
                updateManualEditOverlay();
            }
        }
    };

    if (btnModalEdit) {
        btnModalEdit.addEventListener('click', () => {
            // If called from history mode, use the custom action
            if (btnModalEdit._customEditAction) {
                btnModalEdit._customEditAction();
                return;
            }

            // Toggle editing off if it's already active
            if (btnModalEdit.classList.contains('is-editing')) {
                disableEditing();
                return;
            }

            // Default: manual mode inline editing
            const editKey = currentPreviewType === 'surat' ? 'letter' : 'invoice';
            if (manualEdits[editKey]) {
                enableEditing();
                return;
            }

            const skipConfirm = localStorage.getItem('skipEditConfirm') === 'true';
            if (skipConfirm) {
                enableEditing();
            } else {
                if (editConfirmModal) {
                    editConfirmModal.classList.remove('hidden');
                    editConfirmModal.classList.add('active');
                } else {
                    enableEditing(); // fallback if modal not found
                }
            }
        });
    }

    if (btnCancelEdit && editConfirmModal) {
        btnCancelEdit.addEventListener('click', () => {
            editConfirmModal.classList.add('hidden');
            editConfirmModal.classList.remove('active');
        });
    }

    if (btnProceedEdit && editConfirmModal) {
        btnProceedEdit.addEventListener('click', () => {
            if (dontShowEditConfirm && dontShowEditConfirm.checked) {
                localStorage.setItem('skipEditConfirm', 'true');
            }
            editConfirmModal.classList.add('hidden');
            editConfirmModal.classList.remove('active');
            enableEditing();
        });
    }

    const updateManualEditOverlay = () => {
        const overlay = document.getElementById('manual-edit-overlay');
        if (overlay) {
            if (manualEdits.invoice || manualEdits.letter) {
                overlay.style.display = 'flex';
            } else {
                overlay.style.display = 'none';
            }
        }
    };

    // Ensure manual edit overlay is hidden on page load (manualEdits is always null on init)
    updateManualEditOverlay();

    const btnResetManual = document.getElementById('btn-reset-manual-edit');
    if (btnResetManual) {
        btnResetManual.addEventListener('click', () => {
            manualEdits = { invoice: null, letter: null };
            updateManualEditOverlay();
            renderHTML();
            showAlert("Berhasil dikembalikan ke Mode Otomatis");
        });
    }

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
    // CONVERTER POPUP (ILOVEPDF)
    // ============================================
    const showConverterPopup = () => {
        // Remove existing one if any
        const existing = document.querySelector('.converter-popup');
        if (existing) existing.remove();

        const popup = document.createElement('a');
        popup.className = 'converter-popup';
        popup.href = 'https://www.ilovepdf.com/id/jpg-ke-pdf/';
        popup.target = '_blank';
        popup.innerHTML = `
            <i class="fa-solid fa-file-pdf"></i>
            <span>Jadikan PDF</span>
            <i class="fa-solid fa-xmark close-popup" id="close-conv-popup"></i>
        `;

        document.body.appendChild(popup);

        // Handle close button click
        const closeBtn = popup.querySelector('#close-conv-popup');
        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            popup.remove();
        };

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.style.animation = 'alert-out 0.3s ease-in forwards';
                setTimeout(() => popup.remove(), 300);
            }
        }, 10000);
    };

    // Attach to the newly implemented global download event
    document.addEventListener('download-complete', showConverterPopup);

    // ============================================
    // DOWNLOAD EXECUTION
    // ============================================
    const executeDownload = async (items, title, format) => {
        const sourceInvoice = manualEdits.invoice || buildInvoiceHTML;
        const sourceLetter = manualEdits.letter || buildSuratJalanHTML;

        const formatToUse = format || appState.state.settings.defaultDownloadMethod || 'pdf';

        if (formatToUse === 'pdf') {
            printInvoicePDF(items, title);
        } else if (formatToUse === 'png') {
            await exportBothDocuments(sourceInvoice, sourceLetter, items, title, 'png');
        } else if (formatToUse === 'jpeg' || formatToUse === 'jpg') {
            await exportBothDocuments(sourceInvoice, sourceLetter, items, title, 'jpeg');
        }
    };

    // Download format menu is removed in favor of Settings selection.
    // ============================================
    // VALIDATION
    // ============================================
    // Show custom confirm modal
    const showCustomConfirm = (title) => {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm');
            const message = document.getElementById('confirm-message');
            const btnCancel = document.getElementById('confirm-cancel');
            const btnProceed = document.getElementById('confirm-proceed');

            if (!modal || !message || !btnCancel || !btnProceed) {
                // Fallback to native confirm if UI missing
                resolve(confirm(`Data dengan judul "${title}" sudah ada di riwayat. Tetap simpan?`));
                return;
            }

            message.textContent = `Data dengan judul "${title}" sudah ada di riwayat. Tetap simpan?`;
            modal.classList.remove('hidden');

            const cleanup = (result) => {
                modal.classList.add('hidden');
                btnCancel.removeEventListener('click', onCancel);
                btnProceed.removeEventListener('click', onProceed);
                resolve(result);
            };

            const onCancel = () => cleanup(false);
            const onProceed = () => cleanup(true);

            btnCancel.addEventListener('click', onCancel);
            btnProceed.addEventListener('click', onProceed);
        });
    };

    const validateSync = () => {
        const titleInput = document.getElementById('manual-title');
        const title = titleInput?.value.trim() || 'Untitled';
        const titleRequired = appState.state.settings.titleRequired !== false;

        if (titleRequired && !titleInput?.value.trim()) {
            titleInput?.classList.add('blink-error');
            titleInput?.focus();
            showAlert("Harap isi Judul Invoice terlebih dahulu!");
            setTimeout(() => {
                titleInput?.classList.remove('blink-error');
            }, 1500);
            return false;
        }

        // Validate item descriptions are filled based on mode
        const items = appState.state.invoiceItems;
        const mode = appState.state.manualCardMode || 'simple';
        
        for (let i = 0; i < items.length; i++) {
            if (mode === 'advance') {
                if (!items[i].invKeterangan?.trim() || !items[i].name?.trim() || !items[i].sjKeterangan?.trim() || !items[i].price || items[i].price <= 0) {
                    showAlert(`Ada kolom yang kosong pada Item ${i + 1}!`);
                    return false;
                }
            } else {
                if (!items[i].name?.trim() || !items[i].price || items[i].price <= 0 || !items[i].tipe?.trim() || !items[i].note?.trim()) {
                    const noteFields = document.querySelectorAll('.item-note');
                    if (noteFields[i] && !items[i].note?.trim()) {
                        noteFields[i].classList.add('blink-error');
                        noteFields[i].focus();
                        setTimeout(() => noteFields[i]?.classList.remove('blink-error'), 1500);
                    }
                    showAlert(`Ada kolom yang kosong pada Item ${i + 1}!`);
                    return false;
                }
            }
        }
        return title;
    };

    const validate = async () => {
        const title = validateSync();
        if (!title) return false;

        // Check for duplicate title in history
        const history = appState.state.history || [];
        const isDuplicate = history.some(h => (h.title || 'Untitled').toLowerCase() === title.toLowerCase());

        if (isDuplicate) {
            const proceed = await showCustomConfirm(title);
            if (!proceed) return false;
        }

        return title;
    };

    const btnSave = document.getElementById('btn-save-only');
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const title = validateSync();
            if (!title) return;

            // Check for duplicate
            const history = appState.state.history || [];
            const isDuplicate = history.some(h => (h.title || 'Untitled').toLowerCase() === title.toLowerCase());

            if (isDuplicate) {
                const proceed = await showCustomConfirm(title);
                if (!proceed) return;
            }

            const items = appState.state.invoiceItems;
            if (items.length === 0 && !manualEdits.invoice && !manualEdits.letter) return showAlert("Belum ada item!");
            saveToHistory(items, title);

            if (manualEdits.invoice || manualEdits.letter) {
                showAlert("Disimpan di Riwayat (Kehilangan format kustom). Harap Unduh lewat Preview langsung!", false);
            } else {
                showAlert("Berhasil disimpan", true);
            }
        });
    }

    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        let isDownloading = false;

        btnDownload.addEventListener('click', async (e) => {
            if (isDownloading) return;

            // Prevent ghost click
            if (e && e.cancelable) e.preventDefault();

            const title = validateSync();
            if (!title) return;

            const items = appState.state.invoiceItems;
            if (items.length === 0) return showAlert("Belum ada item!");

            const shouldSave = appState.state.settings.downloadAndSave === true;

            if (shouldSave) {
                // Check for duplicate synchronously
                const history = appState.state.history || [];
                const isDuplicate = history.some(h => (h.title || 'Untitled').toLowerCase() === title.toLowerCase());

                if (isDuplicate) {
                    const proceed = await showCustomConfirm(title);
                    if (!proceed) return;
                }
            }

            isDownloading = true;
            try {
                if (shouldSave) {
                    saveToHistory(items, title);
                }
                const defaultMethod = appState.state.settings.defaultDownloadMethod || 'pdf';
                await executeDownload(items, title, defaultMethod);
            } finally {
                isDownloading = false;
            }
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
        items: JSON.parse(JSON.stringify(items)),
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

    const invoiceHtml = buildInvoiceHTML(items, titleName);
    const suratJalanHtml = buildSuratJalanHTML(items);
    const fileTitle = `Dokumen-${titleName}`;

    // Combine both documents into one HTML stream with a page break
    // We extract the <body> contents of each and wrap them in a unified HTML structure 
    // to ensure styles apply correctly across both pages.
    const extractBody = (fullHtml) => {
        const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return bodyMatch ? bodyMatch[1] : fullHtml;
    };

    // We extract the <head> of Invoice and Surat Jalan.
    // However, they both redefine global tags like `h1`, `table td`, etc.
    // To prevent Surat Jalan from breaking Invoice styles, we will scope Surat Jalan's CSS
    // by prefixing all of its rules with "#surat-jalan-wrapper "

    // Quick and dirty CSS scoping: find all selectors before '{' and prefix them
    const scopedSuratJalanStyle = SURAT_JALAN_STYLE.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
        // Skip @media, @keyframes, formatting
        if (selector.trim().startsWith('@') || selector.trim() === '') return match;

        // Split by comma if multiple selectors (e.g., h1, h2)
        const scopedSelectors = selector.split(',').map(sel => {
            const s = sel.trim();
            if (!s) return '';
            // Don't prefix root/body, replace them with wrapper
            if (s === 'html' || s === 'body') return `#surat-jalan-wrapper`;
            return `#surat-jalan-wrapper ${s}`;
        }).join(', ');

        return `${scopedSelectors} ${suffix}`;
    });

    const combinedHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${fileTitle}</title>
    <style>
        /* INVOICE STYLES (Applies to the first page) */
        ${INVOICE_STYLE}
        
        /* SURAT JALAN STYLES (Scoped strictly to its wrapper to prevent bleed) */
        ${scopedSuratJalanStyle}

        @media print {
            .page-break { page-break-before: always; }
            body { margin: 0; padding: 0; }
        }
    </style>
</head>
<body>
    <div id="invoice-wrapper">
        ${extractBody(invoiceHtml)}
    </div>
    
    <div class="page-break"></div>
    
    <div id="surat-jalan-wrapper">
        ${extractBody(suratJalanHtml)}
    </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;

    const originalTitle = document.title;
    try {
        w.document.open();
        w.document.write(combinedHtml);
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
            document.dispatchEvent(new CustomEvent('download-complete'));
            try {
                w.document.title = originalTitle;
            } catch { }
        }
    }, 300); // Increased from 150ms to 300ms for font rendering
}
