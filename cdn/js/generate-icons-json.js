// generate-icons-json.js

const fs = require("fs");
const path = require("path");

//
// CONFIG
//
const ICONS_DIR = path.join(__dirname, "untitledui");
const OUTPUT_DIR = path.join(__dirname, "dist");

const OUTPUT_FILE = "untitled-ui-line.v1.json";

//
// MAIN
//
async function generateIconsJson() {
    console.log("─────────────────────────────");
    console.log(" Untitled UI Icon Generator");
    console.log("─────────────────────────────\n");

    // cek folder icons
    if (!fs.existsSync(ICONS_DIR)) {
        console.error(`❌ Folder not found: ${ICONS_DIR}`);
        process.exit(1);
    }

    // buat dist folder kalau belum ada
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const files = fs
        .readdirSync(ICONS_DIR)
        .filter((file) => file.endsWith(".svg"));

    if (files.length === 0) {
        console.error("❌ No SVG files found.");
        process.exit(1);
    }

    console.log(`📦 Found ${files.length} SVG icons\n`);

    const icons = {};

    for (const file of files) {
        try {
            const filePath = path.join(ICONS_DIR, file);

            let svg = fs.readFileSync(filePath, "utf8");

            //
            // EXTRACT ONLY INNER SVG CONTENT
            // remove <svg ...>
            // remove </svg>
            //
            svg = svg
                .replace(/<svg[^>]*>/i, "")
                .replace(/<\/svg>/i, "")
                .trim();

            //
            // remove line breaks + extra spaces
            //
            svg = svg
                .replace(/\r?\n|\r/g, " ")
                .replace(/\s{2,}/g, " ")
                .trim();

            //
            // icon name
            //
            const iconName = path.basename(file, ".svg");

            icons[iconName] = svg;

            console.log(`✅ ${iconName}`);
        } catch (err) {
            console.error(`❌ Failed: ${file}`);
            console.error(err.message);
        }
    }

    //
    // RAW / READABLE JSON
    //
    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

    fs.writeFileSync(
        outputPath,
        JSON.stringify(icons, null, 4),
        "utf8"
    );

    //
    // stats
    //
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log("\n─────────────────────────────");
    console.log(" 🎉 JSON Generated");
    console.log("─────────────────────────────");
    console.log(`📄 File : ${OUTPUT_FILE}`);
    console.log(`📦 Size : ${sizeKB} KB`);
    console.log(`📁 Path : ${outputPath}`);
    console.log("─────────────────────────────\n");
}

generateIconsJson();