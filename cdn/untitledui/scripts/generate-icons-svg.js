const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const ICONS_DIR = "../icons";
let OUTPUT_JSON_PATH = "line-icons-svg.json"; // Default output path

// Check for command-line argument for output file name
if (process.argv[2]) {
    OUTPUT_JSON_PATH = process.argv[2];
    console.log(`Custom output path specified: ${OUTPUT_JSON_PATH}`);
}

async function getAllSvgIcons() {
    const allIcons = {};
    let prettierConfig = null;
    try {
        const prettierConfigPath = await prettier.resolveConfigFile();
        if (prettierConfigPath) {
            prettierConfig = await prettier.resolveConfig(prettierConfigPath);
            if (prettierConfig) {
                console.log(`Loaded Prettier config from: ${prettierConfigPath}`);
            } else {
                console.log("Could not resolve Prettier config, using Prettier defaults.");
            }
        } else {
            console.log("No Prettier config file found, using Prettier defaults.");
        }
        if (!prettierConfig) {
            prettierConfig = {}; // Default to an empty object if no config is found/resolved
        }

        console.log(`Scanning base directory: ${ICONS_DIR}`);
        let dirents;
        try {
            dirents = fs.readdirSync(ICONS_DIR, { withFileTypes: true });
        } catch (err) {
            console.error(`Error reading ICONS_DIR (${ICONS_DIR}): ${err.message}`);
            if (err.code === "ENOENT") {
                console.log(`${ICONS_DIR} does not exist. No icons will be processed.`);
            } else {
                // Log other errors but still attempt to proceed or return gracefully
                console.error("Terminating icon gathering due to error reading ICONS_DIR.");
            }
            return allIcons; // Return empty if ICONS_DIR doesn't exist or is unreadable
        }

        const subdirectories = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

        const rootSvgFiles = dirents
            .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".svg"))
            .map((dirent) => dirent.name);

        if (subdirectories.length === 0 && rootSvgFiles.length === 0) {
            console.log(`No subdirectories or SVG files found directly in ${ICONS_DIR}.`);
            return allIcons;
        }

        // Process subdirectories
        if (subdirectories.length > 0) {
            console.log(`Found subdirectories: ${subdirectories.join(", ")}`);
            for (const subdirName of subdirectories) {
                const subdirPath = path.join(ICONS_DIR, subdirName);
                allIcons[subdirName] = {};
                console.log(`Processing subdirectory: ${subdirPath}`);

                let svgFilesInSubdir;
                try {
                    svgFilesInSubdir = fs
                        .readdirSync(subdirPath, { withFileTypes: true })
                        .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".svg"))
                        .map((dirent) => dirent.name);
                } catch (readSubdirError) {
                    console.error(`Error reading subdirectory ${subdirPath}:`, readSubdirError.message);
                    continue; // Skip this subdirectory if it's unreadable
                }

                if (svgFilesInSubdir.length === 0) {
                    console.log(`No SVG files found in ${subdirPath}.`);
                    continue;
                }
                console.log(`Found ${svgFilesInSubdir.length} SVG files in ${subdirPath}.`);

                for (const svgFileName of svgFilesInSubdir) {
                    const filePath = path.join(subdirPath, svgFileName);
                    const iconName = path.basename(svgFileName, ".svg");
                    try {
                        const svgContent = fs.readFileSync(filePath, "utf8");
                        const formattedSvgContent = prettier.format(svgContent, {
                            ...prettierConfig,
                            parser: "html",
                        });
                        allIcons[subdirName][iconName] = formattedSvgContent;
                    } catch (readError) {
                        console.error(`Error reading or formatting file ${filePath}:`, readError.message);
                    }
                }
            }
        } else {
            console.log(`No subdirectories found in ${ICONS_DIR}.`);
        }

        // Process SVG files directly in ICONS_DIR
        if (rootSvgFiles.length > 0) {
            console.log(`Found ${rootSvgFiles.length} SVG files directly in ${ICONS_DIR}.`);

            for (const svgFileName of rootSvgFiles) {
                const filePath = path.join(ICONS_DIR, svgFileName);
                const iconName = path.basename(svgFileName, ".svg");

                // Check for conflicts with already processed subdirectory names
                if (allIcons.hasOwnProperty(iconName)) {
                    console.warn(
                        `Skipping root icon '${svgFileName}' because an entry (likely a subdirectory) with the name '${iconName}' already exists.`
                    );
                    continue; // Skip this root icon
                }

                try {
                    const svgContent = fs.readFileSync(filePath, "utf8");
                    const formattedSvgContent = prettier.format(svgContent, {
                        ...prettierConfig,
                        parser: "html",
                    });
                    allIcons[iconName] = formattedSvgContent; // Assign directly to the root of allIcons
                } catch (readError) {
                    console.error(`Error reading or formatting file ${filePath}:`, readError.message);
                }
            }
        } else {
            console.log(`No SVG files found directly in ${ICONS_DIR}.`);
        }

        return allIcons;
    } catch (error) {
        // This outer catch is for truly unexpected errors not caught by inner handlers
        console.error("An unexpected error occurred in getAllSvgIcons:", error.message);
        return allIcons; // Return whatever was gathered so far or an empty object
    }
}

async function generateJson() {
    try {
        const iconsData = await getAllSvgIcons();

        if (Object.keys(iconsData).length === 0) {
            console.log("No icon data was generated. Exiting.");
            return;
        }

        const jsonData = JSON.stringify(iconsData, null, 4); // Pretty print JSON
        fs.writeFileSync(OUTPUT_JSON_PATH, jsonData, "utf8");
        console.log(`Successfully generated JSON at ${OUTPUT_JSON_PATH}`);
        const stats = fs.statSync(OUTPUT_JSON_PATH);
        console.log(`File size: ${stats.size} bytes`);
    } catch (error) {
        console.error("Failed to generate icons JSON:", error);
    }
}

generateJson();
