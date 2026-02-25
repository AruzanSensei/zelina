/**
 * generate-manifest.js
 *
 * Scan folder "assets/" dan hasilkan manifest.json secara otomatis.
 * Jalankan: node generate-manifest.js
 *
 * Format output manifest.json:
 * {
 *   "audio": [ { "src", "title", "artist" }, ... ],
 *   "media": [ { "src", "type", "caption" }, ... ]
 * }
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const OUTPUT_FILE = path.join(__dirname, 'manifest.json');
const DEFAULT_AUDIO = 'About You - The 1975.mp3'; // selalu ditaruh pertama

const EXT_AUDIO = new Set(['.mp3', '.ogg', '.wav', '.flac', '.aac', '.m4a']);
const EXT_IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const EXT_VIDEO = new Set(['.mp4', '.webm', '.mov', '.mkv']);

/* ── Helper: parse "Title - Artist.mp3" → { title, artist } ── */
function parseAudioName(filename) {
    const base = path.basename(filename, path.extname(filename));
    // Cari pola "Judul - Artis" (pisah di " - " pertama)
    const sep = base.indexOf(' - ');
    if (sep !== -1) {
        return {
            title: base.slice(0, sep).trim(),
            artist: base.slice(sep + 3).trim(),
        };
    }
    return { title: base.trim(), artist: 'Unknown' };
}

/* ── Helper: buat caption dari nama file ── */
function makeCaption(filename) {
    return path.basename(filename, path.extname(filename));
}

/* ── Main ── */
function main() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`[ERROR] Folder tidak ditemukan: ${ASSETS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(ASSETS_DIR).filter(f => {
        const stat = fs.statSync(path.join(ASSETS_DIR, f));
        return stat.isFile();
    });

    const audio = [];
    const media = [];

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const src = `assets/${file}`;

        if (EXT_AUDIO.has(ext)) {
            const { title, artist } = parseAudioName(file);
            audio.push({ src, title, artist });
        } else if (EXT_IMAGE.has(ext)) {
            media.push({ src, type: 'image', caption: makeCaption(file) });
        } else if (EXT_VIDEO.has(ext)) {
            media.push({ src, type: 'video', caption: makeCaption(file) });
        }
        // file lain (mis. .js, .css) diabaikan
    }

    // Taruh default audio di posisi pertama
    const defIdx = audio.findIndex(a => a.src.endsWith(DEFAULT_AUDIO));
    if (defIdx > 0) {
        const [def] = audio.splice(defIdx, 1);
        audio.unshift(def);
    }

    const manifest = { audio, media };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`✓ manifest.json berhasil dibuat`);
    console.log(`  → ${audio.length} audio, ${media.length} media (foto/video)`);
    console.log(`  → Disimpan ke: ${OUTPUT_FILE}`);
}

main();
