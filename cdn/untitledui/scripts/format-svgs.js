const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const ICONS_DIR = "icons";
const PRETTIER_CONFIG_PATH = ".prettierrc";

async function getSvgFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await getSvgFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith(".svg")) {
            files.push(fullPath);
        }
    }
    return files;
}

async function formatSvgs() {
    try {
        console.log("Loading Prettier configuration...");
        const prettierOptions = JSON.parse(fs.readFileSync(PRETTIER_CONFIG_PATH, "utf8"));
        console.log("Prettier configuration loaded:", prettierOptions);

        // Add parser option for SVG files, defaulting to 'html'
        // If you later install @prettier/plugin-xml and it's compatible,
        // you might want to specify it here, e.g., by adding plugins: ['@prettier/plugin-xml']
        // and potentially parser: 'xml' or letting the plugin handle it.
        // For Prettier v2 without the plugin, 'html' is the most common choice for SVGs.
        prettierOptions.parser = "html";

        console.log(`Searching for SVG files in '${ICONS_DIR}'...`);
        const svgFiles = await getSvgFiles(ICONS_DIR);

        if (svgFiles.length === 0) {
            console.log("No SVG files found.");
            return;
        }

        console.log(`Found ${svgFiles.length} SVG files to format.`);

        for (const filePath of svgFiles) {
            console.log(`Formatting ${filePath}...`);
            try {
                const originalContent = fs.readFileSync(filePath, "utf8");
                const formattedContent = prettier.format(originalContent, {
                    ...prettierOptions,
                    filepath: filePath, // Provide filepath for Prettier to potentially infer more
                });

                if (originalContent !== formattedContent) {
                    fs.writeFileSync(filePath, formattedContent, "utf8");
                    console.log(`Formatted and saved ${filePath}`);
                } else {
                    console.log(`No changes needed for ${filePath}`);
                }
            } catch (error) {
                console.error(`Error formatting file ${filePath}:`, error.message);
                // Optionally, decide if you want to stop on error or continue
            }
        }
        console.log("SVG formatting complete.");
    } catch (error) {
        console.error("An error occurred during the formatting process:", error);
    }
}

formatSvgs();
