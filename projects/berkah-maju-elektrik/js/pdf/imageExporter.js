/**
 * Image Export Module for PNG/JPEG Downloads
 * CRITICAL: Reuses the EXACT same HTML/CSS as PDF generation
 */

// Wait for all fonts to be loaded
async function waitForFonts() {
    try {
        await document.fonts.ready;
        // Extra delay to ensure fonts are fully rendered
        await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
        console.warn('Font loading check failed:', error);
        // Continue anyway after a delay
        await new Promise(resolve => setTimeout(resolve, 500));
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

// Create off-screen clone with absolute logo path
async function createOffscreenClone(htmlString) {
    // Convert relative logo path to absolute or data URL
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

    // Create off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.zIndex = '-1';
    container.style.width = '210mm'; // A4 width
    container.style.height = '297mm'; // A4 height

    // Parse HTML string and inject into container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Find the body content
    const bodyContent = tempDiv.querySelector('body');
    if (bodyContent) {
        container.innerHTML = bodyContent.innerHTML;
    } else {
        container.innerHTML = htmlString;
    }

    document.body.appendChild(container);

    return container;
}

// Remove off-screen element
function removeOffscreenClone(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

// Export to PNG
export async function exportToPNG(htmlString, filename) {
    let container = null;

    try {
        // Wait for fonts
        await waitForFonts();

        // Create off-screen clone
        container = await createOffscreenClone(htmlString);

        // Find the page container (the actual A4 content)
        const pageContainer = container.querySelector('.page-container');
        const targetElement = pageContainer || container;

        // Wait for layout to stabilize
        await new Promise(resolve => setTimeout(resolve, 100));

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
        // Clean up off-screen element
        if (container) {
            removeOffscreenClone(container);
        }
    }
}

// Export to JPEG
export async function exportToJPEG(htmlString, filename) {
    let container = null;

    try {
        // Wait for fonts
        await waitForFonts();

        // Create off-screen clone
        container = await createOffscreenClone(htmlString);

        // Find the page container (the actual A4 content)
        const pageContainer = container.querySelector('.page-container');
        const targetElement = pageContainer || container;

        // Wait for layout to stabilize
        await new Promise(resolve => setTimeout(resolve, 100));

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
        // Clean up off-screen element
        if (container) {
            removeOffscreenClone(container);
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
