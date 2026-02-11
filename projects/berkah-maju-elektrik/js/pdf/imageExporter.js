/**
 * Image Export Module for PNG/JPEG Downloads
 * CRITICAL: Reuses the EXACT same HTML/CSS as PDF generation
 */

// Wait for all fonts to be loaded (CRITICAL for Desktop-Android consistency)
async function waitForFonts() {
    try {
        // Wait for all fonts to be ready
        await document.fonts.ready;

        // Additional check for Inter font specifically (our primary font)
        const interLoaded = document.fonts.check('12px Inter');
        if (!interLoaded) {
            console.warn('Inter font not detected, waiting additional time...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Extra delay to ensure fonts are fully rendered and metrics stabilized
        await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
        console.warn('Font loading check failed:', error);
        // Fallback delay if font API fails
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

// Convert image to base64 data URL
async function imageToDataURL(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            console.warn(`Failed to load image: ${imagePath}`);
            resolve(''); // Return empty if image fails to load
        };

        img.src = imagePath;
    });
}

// Create off-screen iframe with complete HTML (includes styles)
async function createOffscreenIframe(htmlString) {
    // Convert relative logo path to data URL
    const logoPath = 'assets/Logo berkah maju elektrik.png';
    let logoDataURL = '';

    try {
        logoDataURL = await imageToDataURL(logoPath);
    } catch (error) {
        console.warn('Could not convert logo to data URL:', error);
    }

    // Replace logo src with data URL if available
    if (logoDataURL) {
        htmlString = htmlString.replace(
            /src="assets\/Logo berkah maju elektrik\.png"/g,
            `src="${logoDataURL}"`
        );
    }

    // Create off-screen iframe (this properly renders complete HTML with styles)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-99999px';
    iframe.style.top = '0';
    iframe.style.zIndex = '-1';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    // Inject complete HTML into iframe (this preserves <style> tags)
    iframe.srcdoc = htmlString;

    // Wait for iframe to load
    await new Promise((resolve) => {
        iframe.onload = resolve;
        // Fallback in case onload doesn't fire
        setTimeout(resolve, 500);
    });

    return iframe;
}

// Remove off-screen iframe
function removeOffscreenIframe(iframe) {
    if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
    }
}

// Export to PNG
export async function exportToPNG(htmlString, filename) {
    let iframe = null;

    try {
        // Wait for fonts
        await waitForFonts();

        // Create off-screen iframe with complete HTML
        iframe = await createOffscreenIframe(htmlString);

        // Get the document inside iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Find the page container (the actual A4 content)
        const pageContainer = iframeDoc.querySelector('.page-container');
        const targetElement = pageContainer || iframeDoc.body;

        // Wait for layout to stabilize and fonts to render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Convert to PNG using html-to-image
        const dataUrl = await htmlToImage.toPng(targetElement, {
            quality: 1.0,
            pixelRatio: 2, // High resolution
            cacheBust: true,
            backgroundColor: '#ffffff'
        });

        // Download the image
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();

        return true;
    } catch (error) {
        console.error('PNG export failed:', error);
        alert('Gagal mengekspor ke PNG. Silakan coba lagi.');
        return false;
    } finally {
        // Clean up off-screen iframe
        if (iframe) {
            removeOffscreenIframe(iframe);
        }
    }
}

// Export to JPEG
export async function exportToJPEG(htmlString, filename) {
    let iframe = null;

    try {
        // Wait for fonts
        await waitForFonts();

        // Create off-screen iframe with complete HTML
        iframe = await createOffscreenIframe(htmlString);

        // Get the document inside iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Find the page container (the actual A4 content)
        const pageContainer = iframeDoc.querySelector('.page-container');
        const targetElement = pageContainer || iframeDoc.body;

        // Wait for layout to stabilize and fonts to render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Convert to JPEG using html-to-image
        const dataUrl = await htmlToImage.toJpeg(targetElement, {
            quality: 0.95,
            pixelRatio: 2, // High resolution
            cacheBust: true,
            backgroundColor: '#ffffff'
        });

        // Download the image
        const link = document.createElement('a');
        link.download = `${filename}.jpeg`;
        link.href = dataUrl;
        link.click();

        return true;
    } catch (error) {
        console.error('JPEG export failed:', error);
        alert('Gagal mengekspor ke JPEG. Silakan coba lagi.');
        return false;
    } finally {
        // Clean up off-screen iframe
        if (iframe) {
            removeOffscreenIframe(iframe);
        }
    }
}

// Export both Invoice and Surat Jalan in specified format
export async function exportBothDocuments(buildInvoiceHTML, buildSuratJalanHTML, items, title, format = 'png') {
    const invoiceHTML = buildInvoiceHTML(items, title);
    const suratJalanHTML = buildSuratJalanHTML(items);

    const invoiceFilename = `Invoice-${title}`;
    const suratJalanFilename = `Surat-Jalan-${title}`;

    // Show loading indicator (reuse existing alert system)
    const alertEl = document.getElementById('custom-alert');
    const messageEl = document.getElementById('alert-message');
    if (alertEl && messageEl) {
        messageEl.innerHTML = 'Mengekspor dokumen... <i class="fa-solid fa-spinner fa-spin"></i>';
        alertEl.classList.remove('hidden');
        alertEl.style.animation = 'alert-in 0.3s ease-out forwards';
    }

    try {
        if (format === 'png') {
            await exportToPNG(invoiceHTML, invoiceFilename);
            // Small delay between exports
            await new Promise(resolve => setTimeout(resolve, 500));
            await exportToPNG(suratJalanHTML, suratJalanFilename);
        } else if (format === 'jpeg') {
            await exportToJPEG(invoiceHTML, invoiceFilename);
            // Small delay between exports
            await new Promise(resolve => setTimeout(resolve, 500));
            await exportToJPEG(suratJalanHTML, suratJalanFilename);
        }

        // Hide loading and show success
        if (alertEl && messageEl) {
            messageEl.innerHTML = 'Berhasil mengekspor dokumen <i class="fa-solid fa-circle-check" style="color:#2ecc71;"></i>';
            setTimeout(() => {
                alertEl.style.animation = 'alert-out 0.3s ease-in forwards';
                setTimeout(() => {
                    alertEl.classList.add('hidden');
                }, 300);
            }, 2000);
        }

        return true;
    } catch (error) {
        console.error('Export failed:', error);

        // Hide loading
        if (alertEl) {
            alertEl.classList.add('hidden');
        }

        return false;
    }
}
