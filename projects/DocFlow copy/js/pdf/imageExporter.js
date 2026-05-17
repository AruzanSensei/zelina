/**
 * Image Export Module for PNG/JPEG Downloads
 * DocFlow version — cleaned for dynamic template system
 */

// Format filename using template tokens
function formatFileName(template, title) {
    const now = new Date();
    return template
        .replace(/\{judul\}/gi, title || 'Untitled')
        .replace(/%YYYY/g, String(now.getFullYear()))
        .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
        .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
        .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
        .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
        .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));
}

// Wait for all fonts to be loaded (CRITICAL for Desktop-Android consistency)
async function waitForFonts() {
    try {
        // Wait for all fonts to be ready
        await document.fonts.ready;

        // Additional check for Times New Roman (template's primary font)
        const timesLoaded = document.fonts.check('12px "Times New Roman"');
        if (!timesLoaded) {
            console.warn('Times New Roman font not detected, waiting additional time...');
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

        document.dispatchEvent(new CustomEvent('download-complete'));
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

        document.dispatchEvent(new CustomEvent('download-complete'));
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


