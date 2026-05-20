const ICON_BASE =
    "https://cdn.zanxa.site/icons/untitledui";

async function loadIcons() {
    const icons = document.querySelectorAll("[icon]");

    for (const el of icons) {
        const name = el.getAttribute("icon");

        try {
            const svg = await fetch(
                `${ICON_BASE}/${name}.svg`
            ).then(r => r.text());

            el.innerHTML = svg;

            el.classList.add("zx-icon");
        } catch (err) {
            console.error(`Icon "${name}" gagal dimuat.`);
        }
    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadIcons
);