// ============================================================
// scripts/public/scanner.js
// QR Code Scanner — front-end only, GitHub Pages compatible
// Library: Nimiq QR-Scanner (ESM/UMD via CDN)
// ============================================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  let qrScanner = null;
  let isTorchOn = false;
  let canScan   = true;      // debounce flag
  let hasTorch  = false;
  let hasMultipleCameras = false;

  const $ = id => document.getElementById(id);

  // ── Configure Library ──────────────────────────────────────
  if (typeof window.QrScanner !== 'undefined') {
    window.QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';
  }

  // ── Beep (Web Audio API, no file needed) ───────────────────
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  }

  // ── Vibrate ────────────────────────────────────────────────
  function vibrate() {
    try { navigator.vibrate && navigator.vibrate(60); } catch (_) {}
  }

  // ── Toast ──────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg, type = '') {
    const el = $('scan-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'scan-toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'scan-toast'; }, 2800);
  }

  // ── URL validator ──────────────────────────────────────────
  function isValidUrl(text) {
    try {
      const u = new URL(text);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) { return false; }
  }

  // ── Success flash ──────────────────────────────────────────
  function flashSuccess() {
    const el = $('scan-success-flash');
    if (!el) return;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 250);
  }

  // ── Open / close scanner ───────────────────────────────────
  function openScanner() {
    $('scanner-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    startCamera();
  }

  function closeScanner() {
    stopCamera();
    $('scanner-overlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Camera start/stop ──────────────────────────────────────
  async function startCamera() {
    const loading = $('scanner-loading');
    const video   = $('scanner-video');
    loading.classList.remove('hidden');
    canScan = true;

    // Check QrScanner library
    if (typeof QrScanner === 'undefined') {
      showError('Library QR Scanner tidak termuat. Coba refresh halaman.');
      loading.classList.add('hidden');
      return;
    }

    // Check camera support
    const hasCamera = await QrScanner.hasCamera().catch(() => false);
    if (!hasCamera) {
      showError('Kamera tidak ditemukan di perangkat ini.');
      loading.classList.add('hidden');
      return;
    }

    // Check multiple cameras for switch button
    try {
      const cameras = await QrScanner.listCameras(true);
      hasMultipleCameras = cameras.length > 1;
      if (hasMultipleCameras) $('sc-switch').classList.remove('hidden');
      else $('sc-switch').classList.add('hidden');
    } catch (_) {}

    // Create scanner
    try {
      qrScanner = new QrScanner(
        video,
        result => onDecode(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: 8,
        }
      );

      await qrScanner.start();

      video.classList.add('loaded');
      loading.classList.add('hidden');

      // Check torch support
      hasTorch = await qrScanner.hasFlash().catch(() => false);
      if (hasTorch) $('sc-torch').classList.remove('hidden');
      else $('sc-torch').classList.add('hidden');

    } catch (err) {
      loading.classList.add('hidden');
      let msg = 'Kamera gagal dibuka.';
      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        msg = 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.';
      } else if (err.name === 'NotFoundError') {
        msg = 'Kamera tidak ditemukan.';
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg = 'Scanner kamera memerlukan koneksi HTTPS.';
      }
      showError(msg);
    }
  }

  function stopCamera() {
    if (!qrScanner) return;
    qrScanner.stop();
    qrScanner.destroy();
    qrScanner = null;
    const video = $('scanner-video');
    video.classList.remove('loaded');
    isTorchOn = false;
    $('sc-torch').classList.remove('active');
  }

  // ── Decode handler ─────────────────────────────────────────
  function onDecode(text) {
    if (!canScan || !text) return;
    canScan = false; // debounce: block further scans

    if (isValidUrl(text)) {
      beep();
      vibrate();
      flashSuccess();
      showToast('QR berhasil dibaca! Mengalihkan...', 'success');

      // Smooth fade then redirect
      setTimeout(() => {
        window.location.href = text;
      }, 600);

    } else {
      showToast('QR tidak berisi link valid: ' + text.slice(0, 40), 'error');
      // Resume scan after 2.5s
      setTimeout(() => { canScan = true; }, 2500);
    }
  }

  // ── Error display (inside scanner body) ───────────────────
  function showError(msg) {
    const loading = $('scanner-loading');
    loading.classList.remove('hidden');
    loading.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef5350" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
      </svg>
      <p style="color:#f87171;text-align:center;max-width:260px;line-height:1.5;">${msg}</p>
      <button onclick="window.__scannerRetry()" style="
        margin-top:8px;padding:10px 24px;border-radius:8px;
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
        color:rgba(255,255,255,.8);font-size:.8rem;cursor:pointer;">
        Coba Lagi
      </button>`;
  }

  // ── Torch toggle ───────────────────────────────────────────
  async function toggleTorch() {
    if (!qrScanner || !hasTorch) return;
    try {
      if (isTorchOn) {
        await qrScanner.turnFlashOff();
        isTorchOn = false;
        $('sc-torch').classList.remove('active');
      } else {
        await qrScanner.turnFlashOn();
        isTorchOn = true;
        $('sc-torch').classList.add('active');
      }
    } catch (_) {}
  }

  // ── Camera switch ──────────────────────────────────────────
  async function switchCamera() {
    if (!qrScanner) return;
    try {
      const current = qrScanner._preferredCamera || 'environment';
      const next = current === 'environment' ? 'user' : 'environment';
      await qrScanner.setCamera(next);
      qrScanner._preferredCamera = next;
    } catch (_) {}
  }

  // ── Scan from Image (File Upload) ──────────────────────────
  async function scanFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loading = $('scanner-loading');
    loading.classList.remove('hidden');
    loading.innerHTML = `<div class="scan-spinner"></div><p>Menganalisa gambar...</p>`;

    try {
      // It's sometimes more reliable across browsers to create an Object URL
      // rather than passing the File object directly.
      const imageUrl = URL.createObjectURL(file);
      
      const result = await QrScanner.scanImage(imageUrl, { 
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true 
      });
      
      URL.revokeObjectURL(imageUrl);
      loading.classList.add('hidden');
      
      canScan = true; // ensure debounce is open
      onDecode(result.data);
    } catch (err) {
      loading.classList.add('hidden');
      // Tampilkan pesan error spesifik jika ada, untuk memudahkan debugging
      const errMsg = err?.message || err || 'QR code tidak terdeteksi pada gambar';
      showToast(errMsg === 'No QR code found' ? 'QR code tidak terdeteksi pada gambar' : errMsg, 'error');
    }
    e.target.value = ''; // Reset
  }

  // ── Inject HTML structure ──────────────────────────────────
  function injectUI() {
    // Scanner Overlay
    const overlay = document.createElement('div');
    overlay.id = 'scanner-overlay';
    overlay.className = 'scanner-overlay';
    overlay.innerHTML = `
      <div class="scanner-header">
        <span class="scanner-title">SCAN QR CODE</span>
        <button class="scanner-close" id="scanner-close-btn" aria-label="Tutup scanner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 2l12 12M14 2L2 14" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="scanner-body">
        <!-- Loading state -->
        <div class="scanner-loading" id="scanner-loading">
          <div class="scan-spinner"></div>
          <p>Membuka kamera...</p>
        </div>

        <!-- Camera feed -->
        <video id="scanner-video" playsinline muted></video>

        <!-- Scan frame overlay -->
        <div class="scanner-cutout-wrap" id="scanner-cutout-wrap">
          <div class="scanner-frame">
            <div class="scanner-corners"></div>
            <div class="scan-line"></div>
          </div>
          <div class="scanner-hint">Arahkan QR code ke dalam frame</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="scanner-controls">
        <button class="sc-btn hidden" id="sc-torch" aria-label="Senter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 2h6l1 7H8L9 2z" stroke-linejoin="round"/>
            <path d="M8 9l-1 13h10L16 9" stroke-linejoin="round"/>
            <path d="M10 15l1.5 3L13 15" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Senter
        </button>

        <button class="sc-btn hidden" id="sc-switch" aria-label="Ganti kamera">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 7h-4l-2-3H10L8 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke-linejoin="round"/>
            <path d="M8 13a4 4 0 108 0" stroke-linecap="round"/>
            <path d="M16 13l2-2-2-2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Ganti
        </button>

        <input type="file" id="sc-file-input" accept="image/*" style="display:none;">
        <button class="sc-btn" id="sc-file-btn" aria-label="Upload Foto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Galeri
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Toast
    const toast = document.createElement('div');
    toast.id = 'scan-toast';
    toast.className = 'scan-toast';
    document.body.appendChild(toast);

    // Success flash
    const flash = document.createElement('div');
    flash.id = 'scan-success-flash';
    flash.className = 'scan-success-flash';
    document.body.appendChild(flash);

    // Events
    $('scanner-close-btn').addEventListener('click', closeScanner);
    $('sc-torch').addEventListener('click', toggleTorch);
    $('sc-switch').addEventListener('click', switchCamera);
    $('sc-file-btn').addEventListener('click', () => $('sc-file-input').click());
    $('sc-file-input').addEventListener('change', scanFromFile);

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('scanner-overlay').classList.contains('active')) {
        closeScanner();
      }
    });

    // Stop camera when leaving page
    window.addEventListener('pagehide', () => stopCamera());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCamera();
    });

    // Global retry hook
    window.__scannerRetry = () => startCamera();
  }

  // ── Inject scan button in search-card ─────────────────────
  function injectTriggerBtn() {
    const searchCard = document.querySelector('.search-card');
    if (!searchCard) return;

    const wrap = document.createElement('div');
    wrap.className = 'scan-trigger-wrap';
    wrap.innerHTML = `
      <button class="scan-btn" id="open-scanner-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 17v3M20 14v2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Scan QR Code dengan Kamera
      </button>
    `;
    searchCard.appendChild(wrap);
    $('open-scanner-btn').addEventListener('click', openScanner);
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    injectUI();
    injectTriggerBtn();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
