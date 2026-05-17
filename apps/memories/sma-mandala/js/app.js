/**
 * js/app.js
 * Entry point — fetch manifest.json lalu init player & gallery.
 */

/** Fisher-Yates shuffle (in-place, returns array) */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

(async function () {
    let manifest;
    try {
        const res = await fetch('manifest.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        manifest = await res.json();
    } catch (err) {
        console.error('[app.js] Gagal memuat manifest.json:', err);
        const el = document.getElementById('player-title');
        if (el) el.textContent = '⚠ manifest.json tidak ditemukan — jalankan generate-manifest.js';
        return;
    }

    window.MANIFEST = manifest;

    // Galeri tampil dalam urutan acak setiap page load
    if (window.GalleryAPI && Array.isArray(manifest.media) && manifest.media.length > 0) {
        window.GalleryAPI.buildGallery(shuffle([...manifest.media]));
    }

    // Init music player — autoplay langsung saat halaman dibuka
    if (window.PlayerAPI && Array.isArray(manifest.audio) && manifest.audio.length > 0) {
        window.PlayerAPI.init(manifest.audio, true);
    }
})();
