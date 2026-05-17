// components/qr-generator.js — Unified QR Code generator

/**
 * Generates a QR Code inside the specified container.
 * 
 * @param {HTMLElement|string} elementOrId - The DOM element or its ID where the QR code will be generated.
 * @param {string} text - The text/URL to encode.
 * @param {Object} [options] - Optional configuration overrides for the QR code.
 * @returns {QRCode|null} The QRCode instance, or null if generation failed.
 */
function generateQRCode(elementOrId, text, options = {}) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  
  if (!el) {
    console.warn(`generateQRCode: Target element not found (${elementOrId})`);
    return null;
  }

  // Clear existing content
  el.innerHTML = '';

  const defaultOptions = {
    text: text,
    width: 140,
    height: 140,
    colorDark: "#1a1a1a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return new QRCode(el, finalOptions);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    el.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.72rem;">Error</div>';
    return null;
  }
}
