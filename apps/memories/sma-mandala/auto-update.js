const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const indexPath = path.join(__dirname, 'index.html');

try {
    // Baca semua file dari folder assets
    const files = fs.readdirSync(assetsDir);

    const items = [];
    const tilts = ['tilt-left', 'tilt-right', 'tilt-mini-left', 'tilt-mini-right'];
    const tapes = ['tape-top', 'tape-left', ''];

    files.forEach((file, i) => {
        const ext = path.extname(file).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);

        if (isImage || isVideo) {
            const type = isVideo ? 'video' : 'image';
            // Menggunakan nama file sebagai caption (tanpa ekstensi)
            const caption = path.parse(file).name;

            const tilt = tilts[i % tilts.length];
            const tape = tapes[i % tapes.length];
            const tiltClass = tape ? `${tilt} ${tape}` : tilt;

            items.push(`      { type: '${type}', src: 'assets/${file}', caption: '${caption}', tilt: '${tiltClass}' }`);
        }
    });

    const itemsString = `const items = [\n${items.join(',\n')}\n    ];`;

    // Baca file index.html
    let htmlIndex = fs.readFileSync(indexPath, 'utf-8');

    // Regex untuk mencari dan mengganti array items yang ada
    const regex = /const items = \[[^]*?\];/m;

    if (regex.test(htmlIndex)) {
        htmlIndex = htmlIndex.replace(regex, itemsString);
        fs.writeFileSync(indexPath, htmlIndex, 'utf-8');
        console.log(`✅ Berhasil! ${items.length} file dari folder assets telah ditambahkan ke index.html`);
    } else {
        console.log('❌ Tidak dapat menemukan array "const items = [...]" di index.html');
    }

} catch (err) {
    console.error('❌ Terjadi kesalahan:', err);
}
