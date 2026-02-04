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
    // Hidden container for capturing high-res render if needed
    let hiddenContainer = document.createElement('div');
    hiddenContainer.id = 'hidden-pdf-render-container';
    hiddenContainer.style.position = 'absolute';
    hiddenContainer.style.left = '-9999px';
    hiddenContainer.style.top = '-9999px';
    document.body.appendChild(hiddenContainer);

    // Load Logo immediately
    loadLogoAsBase64('assets/Logo%20berkah%20maju%20elektrik.png').then(res => {
        logoBase64 = res;
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

    // ============================================
    // HTML RENDERER (Real-time with Scaling)
    // ============================================
    const renderHTML = () => {
        const items = appState.state.invoiceItems;
        const dateStr = getDateStr();

        if (!invoicePreviewContainer || !letterPreviewContainer) return;

        const refWidth = 794; // A4 approx width in px for scaling
        const parentWidth = invoicePreviewContainer.parentElement.clientWidth;
        const scale = parentWidth > 0 ? (parentWidth / refWidth) : 0.35; // Fallback scale for hidden tabs

        // Calculate Totals
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // STYLES & TEMPLATE SHARED LOGIC
        const getInvoiceLayout = (isForPDF = false) => `
            <div class="${isForPDF ? 'pdf-render' : 'preview-render'}" style="font-family: 'Times New Roman', Times, serif; width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; color: #000; text-align: left; box-sizing: border-box;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h1 style="font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 0 0 30px 0;">INVOICE</h1>
                </div>

                <div style="font-family: Calibri, sans-serif; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                        <img src="${logoBase64 || 'assets/Logo%20berkah%20maju%20elektrik.png'}" style="width: 60px; height: auto;">
                        <div>
                            <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 3px 0; line-height: 1.2;">BERKAH MAJU ELEKTRIK</h2>
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
                            <p style="font-size: 14px; margin: 2px 0; line-height: 1; font-weight: bold;">PT. SARASWANTI INDO GENETECH</p>
                        </div>
                    </div>
                </div>

                <div style="border-top: 2px solid #000; margin: 14px 0 30px 0;"></div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 13px; font-weight: bold; width: 50px;">NO</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 13px; font-weight: bold; width: 180px;">KETERANGAN</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 13px; font-weight: bold; width: 70px;">QTY</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 13px; font-weight: bold; width: 110px;">HARGA<br>SATUAN</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 8px 6px; text-align: center; font-size: 13px; font-weight: bold; width: 110px;">JUMLAH</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 16px; width: 50px;">${index + 1}</td>
                            <td style="border: 1px solid #000; padding: 6px 8px; text-align: left; font-size: 16px; width: 180px;">Battery ${item.name || ''} ${item.tipe || ''} ${item.note || ''}</td>
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
                        <div style="padding: 6px 8px; text-align: center; font-weight: bold; font-size: 16px; width: 263px; border: 1px solid #000; border-top: none; border-left: none; border-right: none;">Rp ${formatNumber(total)}</div>
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

        const getLetterLayout = (isForPDF = false) => `
            <div class="${isForPDF ? 'pdf-render' : 'preview-render'}" style="font-family: 'Times New Roman', Times, serif; width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; color: #000; text-align: left; box-sizing: border-box;">
                <div style="font-family: Calibri, sans-serif; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 2px;">
                    <div style="display: flex; align-items: center; gap: 7px; flex: 1;">
                        <img src="${logoBase64 || 'assets/Logo%20berkah%20maju%20elektrik.png'}" style="width: 65px; height: auto;">
                        <div>
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
                        <p><strong style="font-size: 18px;">PT. Saraswanti Indo Genetech</strong></p>
                        <p>Jl. Rasamala, Jl. Ring Road Yasmin No. 20,</p>
                        <p>RT.02/RW.03, Curugmekar,</p>
                        <p>Kec. Bogor Barat</p>
                        <p>Kota Bogor 16113</p>
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
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; font-weight: bold; width: 50px;">No.</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; font-weight: bold; width: 230px;">Nama Barang</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; font-weight: bold; width: 100px;">Jumlah</th>
                            <th style="background-color: #c0c0c0; border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; font-weight: bold; width: 260px;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; width: 50px;">${index + 1}</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-size: 16px; width: 230px;">Battery ${item.name || ''}</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; width: 100px;">${item.qty} pcs</td>
                            <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 16px; width: 260px;">UPS ${item.tipe || ''} ${item.note || ''}</td>
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

        // Apply Scaled Previews
        invoicePreviewContainer.innerHTML = `<div style="transform: scale(${scale}); transform-origin: top center;">${getInvoiceLayout()}</div>`;
        letterPreviewContainer.innerHTML = `<div style="transform: scale(${scale}); transform-origin: top center;">${getLetterLayout()}</div>`;
    };

    // ============================================
    // LISTENERS & SUBSCRIPTIONS
    // ============================================
    appState.subscribe('items', renderHTML);
    appState.subscribe('manualTitle', renderHTML);

    window.addEventListener('resize', renderHTML);
    renderHTML(); // Initial

    // ============================================
    // PDF ACTIONS
    // ============================================
    const generatePDFs = async () => {
        const items = appState.state.invoiceItems;
        const title = appState.state.manualTitle || "";
        const { jsPDF } = window.jspdf;

        showAlert("Sedang mengunduh...", false);

        const types = ['invoice', 'letter'];
        for (const type of types) {
            // Use high-fidelity Rendering logic
            const doc = await getPDFDoc(type, items, title);
            doc.save(`${type === 'invoice' ? 'Invoice' : 'SuratJalan'}-${title}.pdf`);
        }

        showAlert("Berhasil diunduh", true);
    };

    const openFullScreen = async (type) => {
        if (!previewModal) return;
        const items = appState.state.invoiceItems;
        const title = appState.state.manualTitle || "";

        showAlert("Menyiapkan preview...", false);
        const doc = await getPDFDoc(type, items, title);
        const blobUrl = doc.output('bloburl');

        const frame = document.getElementById('pdf-preview-frame');
        if (frame) {
            frame.src = blobUrl;
            document.getElementById('preview-title').textContent = type === 'invoice' ? 'Preview Invoice' : 'Preview Surat Jalan';
            previewModal.classList.remove('hidden');
            previewModal.classList.add('active');
        }
    };

    const getPDFDoc = async (type, items, titleName) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Setup hidden render for 1:1 Capture
        const hidden = document.getElementById('hidden-pdf-render-container');
        const dateStr = getDateStr();
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Inject high-res layout
        if (type === 'invoice') {
            hidden.innerHTML = `
                <div id="capture-target" style="width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; text-align: left; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; color: #000;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="font-size: 28pt; font-weight: bold; letter-spacing: 2px; margin: 0 0 30px 0;">INVOICE</h1>
                    </div>
                    <div style="font-family: Calibri, sans-serif; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; gap: 12px; flex: 1;">
                            <img src="${logoBase64 || ''}" style="width: 60px; height: auto;">
                            <div>
                                <h2 style="font-size: 22pt; font-weight: bold; margin: 0 0 3px 0;">BERKAH MAJU ELEKTRIK</h2>
                                <p style="font-size: 13pt; margin: 0;">Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                                <p style="font-size: 13pt; margin: 0;">0855-9174-9020 / 0853-1212-2030</p>
                                <p style="font-size: 13pt; margin: 0;">Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="border: 2px solid #000; padding: 8px 10px; width: 210px;">Tanggal : ${dateStr}</div>
                            <div style="border: 2px solid #000; padding: 8px 10px; width: 210px;">
                                <p style="margin:0;">Kepada :</p>
                                <p style="margin:0; font-weight:bold;">PT. SARASWANTI INDO GENETECH</p>
                            </div>
                        </div>
                    </div>
                    <div style="border-top: 2px solid #000; margin: 15px 0 30px 0;"></div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #c0c0c0;">
                                <th style="border: 1px solid #000; padding: 6pt; width: 40pt; text-align: center;">NO</th>
                                <th style="border: 1px solid #000; padding: 6pt; width: 140pt; text-align: center;">KETERANGAN</th>
                                <th style="border: 1px solid #000; padding: 6pt; width: 55pt; text-align: center;">QTY</th>
                                <th style="border: 1px solid #000; padding: 6pt; width: 90pt; text-align: center;">HARGA<br>SATUAN</th>
                                <th style="border: 1px solid #000; padding: 6pt; width: 90pt; text-align: center;">JUMLAH</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, idx) => `
                            <tr>
                                <td style="border: 1px solid #000; padding: 6pt; text-align: center; font-size: 12pt;">${idx + 1}</td>
                                <td style="border: 1px solid #000; padding: 6pt; font-size: 12pt;">Battery ${item.name} ${item.tipe} ${item.note}</td>
                                <td style="border: 1px solid #000; padding: 6pt; text-align: center; font-size: 12pt;">${item.qty} pcs</td>
                                <td style="border: 1px solid #000; padding: 6pt; text-align: center; font-size: 12pt;">Rp ${formatNumber(item.price)}</td>
                                <td style="border: 1px solid #000; padding: 6pt; text-align: center; font-size: 12pt;">Rp ${formatNumber(item.price * item.qty)}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    <div style="display: flex; justify-content: flex-end;">
                        <div style="border: 1px solid #000; border-top: none; display: flex;">
                            <div style="padding: 6pt; font-weight: bold; border-right: 1px solid #000; width: 100px; text-align: center;">JUMLAH</div>
                            <div style="padding: 6pt; font-weight: bold; width: 220px; text-align: center;">Rp ${formatNumber(total)}</div>
                        </div>
                    </div>
                    <p style="margin-top: 30px; font-size: 12pt;">Pembayaran Bisa melalui rekening Bank <strong>BCA 5737162660</strong> a.n SAEPUL IMAN</p>
                    <div style="margin-top: 40px; text-align: right;">
                        <p style="padding-right: 25px;">Hormat Kami</p>
                        <div style="height: 60px;"></div>
                        <p style="font-weight: bold;">Berkah Maju Elektrik</p>
                    </div>
                </div>
            `;
        } else {
            hidden.innerHTML = `
                <div id="capture-target" style="width: 210mm; min-height: 297mm; background: white; padding: 28mm 20mm 25mm 25mm; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; color: #000;">
                    <div style="font-family: Calibri, sans-serif; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 2px;">
                        <div style="display: flex; align-items: center; gap: 7px; flex: 1;">
                            <img src="${logoBase64 || ''}" style="width: 65px; height: auto;">
                            <div>
                                <h2 style="font-size: 24pt; font-weight: bold; margin: 0;">BERKAH MAJU ELEKTRIK</h2>
                                <p style="font-size: 13pt; line-height: 1.1; margin: 0;">Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
                                <p style="font-size: 13pt; line-height: 1.1; margin: 0;">0855-9174-9020 / 0853-1212-2030</p>
                                <p style="font-size: 13pt; line-height: 1.1; margin: 0;">Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 5px; height: 75px; background: #000;"></div>
                            <h1 style="font-size: 36pt; font-weight: bold; margin: 0;">SURAT JALAN</h1>
                        </div>
                    </div>
                    <div style="border-bottom: 1px solid #000; margin-bottom: 35px;"></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 12pt;">
                        <div>
                            <p>Kepada Yth.</p>
                            <p><strong style="font-size: 14pt;">PT. Saraswanti Indo Genetech</strong></p>
                            <p>Jl. Rasamala, Jl. Ring Road Yasmin No. 20,<br>RT.02/RW.03, Curugmekar, Kec. Bogor Barat<br>Kota Bogor 16113</p>
                        </div>
                        <div style="text-align: right;">Tanggal : ${dateStr}</div>
                    </div>
                    <p style="margin-bottom: 20px;">Bersama dengan ini kami kirimkan sejumlah barang sebagai berikut:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #c0c0c0;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 10pt; width: 40pt; text-align: center;">No.</th>
                                <th style="border: 1px solid #000; padding: 10pt; width: 170pt; text-align: center;">Nama Barang</th>
                                <th style="border: 1px solid #000; padding: 10pt; width: 80pt; text-align: center;">Jumlah</th>
                                <th style="border: 1px solid #000; padding: 10pt; width: 200pt; text-align: center;">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, idx) => `
                            <tr>
                                <td style="border: 1px solid #000; padding: 10pt; text-align: center;">${idx + 1}</td>
                                <td style="border: 1px solid #000; padding: 10pt;">Battery ${item.name}</td>
                                <td style="border: 1px solid #000; padding: 10pt; text-align: center;">${item.qty} pcs</td>
                                <td style="border: 1px solid #000; padding: 10pt; text-align: center;">UPS ${item.tipe} ${item.note}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    <p style="margin-top: 40px;">Diterima Tanggal : .....................................</p>
                    <div style="margin-top: 60px; display: flex; justify-content: space-around; text-align: center;">
                        <div style="width: 200px;"><p>Penerima</p><div style="height: 80px;"></div><p>(.....................................)</p></div>
                        <div style="width: 200px;"><p>Pengirim</p><div style="height: 80px;"></div><p>(.....................................)</p></div>
                    </div>
                </div>
            `;
        }

        const element = document.getElementById('capture-target');

        // Use doc.html for Perfect 1:1 Rendering
        await doc.html(element, {
            callback: function (d) { return d; },
            x: 0,
            y: 0,
            width: 210, // Target width in mm
            windowWidth: 794, // Ref width in px for CSS calculation
            autoPaging: 'text'
        });

        return doc;
    };

    // ============================================
    // LISTENERS
    // ============================================
    if (invoicePreviewContainer) {
        invoicePreviewContainer.parentElement.addEventListener('click', () => openFullScreen('invoice'));
    }
    if (letterPreviewContainer) {
        letterPreviewContainer.parentElement.addEventListener('click', () => openFullScreen('letter'));
    }

    const btnSave = document.getElementById('btn-save-only');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const title = appState.state.manualTitle || "";
            const items = appState.state.invoiceItems;
            if (items.length === 0) return showAlert("Belum ada item!");
            saveToHistory(items, title);
            showAlert("Berhasil disimpan", true);
        });
    }

    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const items = appState.state.invoiceItems;
            const title = appState.state.manualTitle || "";
            if (!title) return showAlert("Harap isi Judul Invoice!");
            if (items.length === 0) return showAlert("Belum ada item!");
            saveToHistory(items, title);
            generatePDFs();
        });
    }

    // UI Helpers
    const showAlert = (message, isSuccess = false) => {
        const alertEl = document.getElementById('custom-alert');
        const messageEl = document.getElementById('alert-message');
        if (!alertEl || !messageEl) return;
        messageEl.innerHTML = isSuccess ? `${message} <i class="fa-solid fa-circle-check" style="color:#2ecc71;"></i>` : message;
        alertEl.classList.remove('hidden');
        alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
        setTimeout(() => {
            alertEl.style.animation = 'alert-out 0.3s ease-in forwards';
            setTimeout(() => { alertEl.classList.add('hidden'); }, 300);
        }, 2000);
    };

    function saveToHistory(items, title) {
        const today = new Date();
        appState.addToHistory({
            id: Date.now(),
            title: title || "(Tanpa Judul)",
            date: `${today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${today.getHours()}.${String(today.getMinutes()).padStart(2, '0')}`,
            items: items,
            timestamp: Date.now()
        });
    }
}
