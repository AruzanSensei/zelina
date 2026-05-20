const fs = require("fs");
const path = require("path");
const { transform } = require("@svgr/core");
const prettier = require("prettier");

const ICONS_DIR = "icons";
let OUTPUT_JSON_PATH = "line-icons-jsx.json"; // Default output path

// Check for command-line argument for output file name
if (process.argv[2]) {
    OUTPUT_JSON_PATH = process.argv[2];
    console.log(`Custom output path specified: ${OUTPUT_JSON_PATH}`);
}

// Custom SVGR template to output only the JSX of the SVG
const jsxOnlyTemplate = (variables, { tpl }) => {
    return tpl`${variables.jsx}`;
};

// SVGR options can be passed here if needed, but it will also pick up .svgrrc.js
// For example: const svgrOptions = { icon: true, svgo: false };
// We will let it use the .svgrrc.js by default

async function getAllSvgIconsAsJsx() {
    const allIconsJsx = {};
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
            prettierConfig = {};
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
                console.error("Terminating icon gathering due to error reading ICONS_DIR.");
            }
            return allIconsJsx;
        }

        const subdirectories = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

        const rootSvgFiles = dirents
            .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".svg"))
            .map((dirent) => dirent.name);

        if (subdirectories.length === 0 && rootSvgFiles.length === 0) {
            console.log(`No subdirectories or SVG files found directly in ${ICONS_DIR}.`);
            return allIconsJsx;
        }

        // Process subdirectories first
        if (subdirectories.length > 0) {
            console.log(`Found subdirectories: ${subdirectories.join(", ")}`);
            for (const subdirName of subdirectories) {
                const subdirPath = path.join(ICONS_DIR, subdirName);
                allIconsJsx[subdirName] = {}; // Initialize object for subdirectory
                console.log(`Processing subdirectory: ${subdirPath}`);

                let svgFilesInSubdir;
                try {
                    svgFilesInSubdir = fs
                        .readdirSync(subdirPath, { withFileTypes: true })
                        .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".svg"))
                        .map((dirent) => dirent.name);
                } catch (readSubdirError) {
                    console.error(`Error reading subdirectory ${subdirPath}:`, readSubdirError.message);
                    continue; // Skip this subdirectory
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
                        const svgCode = fs.readFileSync(filePath, "utf8");
                        const jsxString = await transform(
                            svgCode,
                            {
                                template: jsxOnlyTemplate,
                                expandProps: false,
                                prettier: false,
                                jsx: {
                                    babelConfig: {
                                        plugins: [
                                            [
                                                "@svgr/babel-plugin-remove-jsx-attribute",
                                                {
                                                    elements: ["svg"],
                                                    attributes: ["xmlns"],
                                                },
                                            ],
                                        ],
                                    },
                                },
                            },
                            { componentName: iconName.replace(/[^a-zA-Z0-9_]/g, "") || "Icon" }
                        );
                        const formattedJsxString = prettier.format(jsxString, {
                            ...prettierConfig,
                            parser: "babel",
                        });
                        allIconsJsx[subdirName][iconName] = formattedJsxString;
                    } catch (transformError) {
                        console.error(`Error transforming file ${filePath} to JSX:`, transformError.message);
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

                if (allIconsJsx.hasOwnProperty(iconName)) {
                    console.warn(
                        `Skipping root icon '${svgFileName}' for JSX conversion because an entry (likely a subdirectory) with the name '${iconName}' already exists.`
                    );
                    continue;
                }

                try {
                    const svgCode = fs.readFileSync(filePath, "utf8");
                    const jsxString = await transform(
                        svgCode,
                        {
                            template: jsxOnlyTemplate,
                            expandProps: false,
                            prettier: false,
                            jsx: {
                                babelConfig: {
                                    plugins: [
                                        [
                                            "@svgr/babel-plugin-remove-jsx-attribute",
                                            {
                                                elements: ["svg"],
                                                attributes: ["xmlns"],
                                            },
                                        ],
                                    ],
                                },
                            },
                        },
                        { componentName: iconName.replace(/[^a-zA-Z0-9_]/g, "") || "Icon" }
                    );
                    const formattedJsxString = prettier.format(jsxString, {
                        ...prettierConfig,
                        parser: "babel",
                    });
                    allIconsJsx[iconName] = formattedJsxString; // Assign directly to the root
                } catch (transformError) {
                    console.error(`Error transforming file ${filePath} to JSX:`, transformError.message);
                }
            }
        } else {
            console.log(`No SVG files found directly in ${ICONS_DIR}.`);
        }

        return allIconsJsx;
    } catch (error) {
        console.error("An error occurred while gathering and transforming SVG icons:", error.message);
        return allIconsJsx;
    }
}

async function generateJsxJson() {
    try {
        console.log("Starting SVG to JSX conversion and JSON generation...");
        const iconsJsxData = await getAllSvgIconsAsJsx();

        if (Object.keys(iconsJsxData).length === 0) {
            console.log("No icon JSX data was generated. Exiting.");
            return;
        }

        const jsonData = JSON.stringify(iconsJsxData, null, 4);
        fs.writeFileSync(OUTPUT_JSON_PATH, jsonData, "utf8"); // Use the potentially updated OUTPUT_JSON_PATH
        console.log(`Successfully generated JSX JSON at ${OUTPUT_JSON_PATH}`);
        const stats = fs.statSync(OUTPUT_JSON_PATH);
        console.log(`File size: ${stats.size} bytes`);
    } catch (error) {
        console.error("Failed to generate icons JSX JSON:", error);
    }
}

generateJsxJson();
