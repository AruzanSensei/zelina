/**
 * generate-manifest.js
 *
 * Scan folder "assets/" dan hasilkan manifest.json.
 * Jalankan: node generate-manifest.js
 *
 * Opsi interaktif:
 *   node generate-manifest.js --no-caption   → semua media tanpa caption
 *   node generate-manifest.js --caption      → semua media dengan caption (default)
 *   node generate-manifest.js               → tanya dulu via prompt
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ASSETS_DIR = path.join(__dirname, 'assets');
const OUTPUT_FILE = path.join(__dirname, 'manifest.json');
const DEFAULT_AUDIO = 'kota ini tak sama tanpamu - Nadhif Basalamah _ Lirik Lagu.mp3';

const EXT_AUDIO = new Set(['.mp3', '.ogg', '.wav', '.flac', '.aac', '.m4a']);
const EXT_IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const EXT_VIDEO = new Set(['.mp4', '.webm', '.mov', '.mkv']);

/* ── Helper: parse "Title - Artist.mp3" → { title, artist } ── */
function parseAudioName(filename) {
    const base = path.basename(filename, path.extname(filename));
    const sep = base.indexOf(' - ');
    if (sep !== -1) {
        return { title: base.slice(0, sep).trim(), artist: base.slice(sep + 3).trim() };
    }
    return { title: base.trim(), artist: 'Unknown' };
}

/* ── Helper: tanya user via stdin ── */
function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
    });
}

/* ── Main ── */
async function main() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`[ERROR] Folder tidak ditemukan: ${ASSETS_DIR}`);
        process.exit(1);
    }

    // Tentukan mode caption dari argv atau tanya
    let withCaption;
    if (process.argv.includes('--no-caption')) {
        withCaption = false;
        console.log('ℹ  Mode: tanpa caption');
    } else if (process.argv.includes('--caption')) {
        withCaption = true;
        console.log('ℹ  Mode: dengan caption');
    } else {
        const ans = await ask('Tambahkan caption pada media (foto/video)? [y/n] (default: y): ');
        withCaption = ans === '' || ans === 'y' || ans === 'ya' || ans === 'yes';
        console.log(`ℹ  Mode: ${withCaption ? 'dengan' : 'tanpa'} caption`);
    }

    const files = fs.readdirSync(ASSETS_DIR).filter(f =>
        fs.statSync(path.join(ASSETS_DIR, f)).isFile()
    );

    const audio = [];
    const media = [];

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const src = `assets/${file}`;

        if (EXT_AUDIO.has(ext)) {
            const { title, artist } = parseAudioName(file);
            audio.push({ src, title, artist });
        } else if (EXT_IMAGE.has(ext)) {
            const item = { src, type: 'image' };
            if (withCaption) item.caption = path.basename(file, ext);
            media.push(item);
        } else if (EXT_VIDEO.has(ext)) {
            const item = { src, type: 'video' };
            if (withCaption) item.caption = path.basename(file, ext);
            media.push(item);
        }
    }

    // Default audio selalu di posisi pertama
    const defIdx = audio.findIndex(a => path.basename(a.src) === DEFAULT_AUDIO);
    if (defIdx > 0) {
        const [def] = audio.splice(defIdx, 1);
        audio.unshift(def);
    } else if (defIdx === -1) {
        console.warn(`⚠  File default audio tidak ditemukan: ${DEFAULT_AUDIO}`);
    }

    const manifest = { audio, media };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`\n✓ manifest.json berhasil dibuat`);
    console.log(`  → ${audio.length} audio, ${media.length} media (foto/video)`);
    console.log(`  → Caption: ${withCaption ? 'ya' : 'tidak'}`);
    console.log(`  → Default audio: ${audio[0]?.title ?? '?'} — ${audio[0]?.artist ?? '?'}`);
    console.log(`  → Disimpan ke: ${OUTPUT_FILE}`);
}

main();
