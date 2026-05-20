/**
 * Universal CDN-Based Icon Web Component (<i-ui>)
 * Zanxa Frontend Infrastructure - Phase 1 Core Infrastructure
 */

(function () {

    // 1. Global Styling Injection (Light DOM structure integration)
    const style = document.createElement('style');
    style.textContent = `
        i-ui {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
            vertical-align: middle;
            flex-shrink: 0;
        }
        i-ui svg {
            display: block;
            width: 100%;
            height: 100%;
        }
        /* Ensure nested SVG path styling respects the custom element properties */
        i-ui svg * {
            stroke: inherit;
            stroke-width: inherit !important;
            stroke-linecap: inherit;
            stroke-linejoin: inherit;
        }
    `;
    document.head.appendChild(style);

    // 2. Singleton Fetch Cache System
    let ICONS = null;
    let ICONS_PROMISE = null;

    async function getIconsBundle() {
        if (ICONS) return ICONS;
        if (ICONS_PROMISE) return ICONS_PROMISE;

        ICONS_PROMISE = (async () => {
            try {
                // Dev Hostname Auto-Resolver
                let scriptSrc = document.currentScript ? document.currentScript.src : '';
                let bundleUrl;

                const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';

                if (isLocal) {
                    // Try to construct URL relative to the script location
                    if (scriptSrc) {
                        bundleUrl = new URL('../icons/untitled-ui-line.v1.json', scriptSrc).href;
                    } else {
                        bundleUrl = '../../cdn/icons/untitled-ui-line.v1.json';
                    }
                } else {
                    bundleUrl = 'https://cdn.zanxa.site/icons/untitled-ui-line.v1.json';
                }

                console.log(`[Icon] Fetching bundle from: ${bundleUrl}`);
                const response = await fetch(bundleUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                ICONS = await response.json();
                return ICONS;
            } catch (err) {
                console.error('[Icon] Failed to load icons bundle:', err);
                ICONS_PROMISE = null; // allow retry
                return null;
            }
        })();

        return ICONS_PROMISE;
    }

    // 3. Web Component Definition (<i-ui>)
    class IUElement extends HTMLElement {
        static get observedAttributes() {
            return ['name', 'size', 'stroke-width', 'color'];
        }

        constructor() {
            super();
            this._isRendered = false;
        }

        connectedCallback() {
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue && this._isRendered) {
                this.render();
            }
        }

        async render() {
            this._isRendered = true;
            let name = this.getAttribute('name');
            if (!name) return;


            const size = this.getAttribute('size') || '24';
            const strokeWidth = this.getAttribute('stroke-width') || '2';
            const color = this.getAttribute('color') || 'currentColor';

            try {
                const icons = await getIconsBundle();
                if (!icons) return;

                const iconPath = icons[name];
                if (!iconPath) {
                    console.warn(`[Icon] "${name}" not found`);
                    this.innerHTML = '';
                    return;
                }

                // Render into Light DOM to inherit styling properly
                this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" stroke="${color}" fill="none" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
            } catch (err) {
                console.error(`[Icon] Failed to render "${name}":`, err);
            }
        }
    }

    // Register Web Component
    if (!customElements.get('i-ui')) {
        customElements.define('i-ui', IUElement);
    }

    // 6. Backward Compatibility Layer (Mock window.lucide)
    window.lucide = {
        createIcons: function (options) {
            options = options || {};
            const nameAttr = options.nameAttr || 'data-lucide';
            const nodes = options.nodes || document.querySelectorAll(`[${nameAttr}]`);

            nodes.forEach(el => {
                let elements = [];
                if (el.hasAttribute && el.hasAttribute(nameAttr)) {
                    elements.push(el);
                }
                if (el.querySelectorAll) {
                    elements = elements.concat(Array.from(el.querySelectorAll(`[${nameAttr}]`)));
                }

                elements.forEach(item => {
                    let name = item.getAttribute(nameAttr);
                    if (!name) return;


                    const iconEl = document.createElement('i-ui');
                    iconEl.setAttribute('name', name);

                    // Transfer attributes
                    for (let attr of item.attributes) {
                        if (attr.name !== nameAttr) {
                            iconEl.setAttribute(attr.name, attr.value);
                        }
                    }

                    // Style-to-attribute parsers
                    const styleStr = item.getAttribute('style') || '';
                    const sizeMatch = styleStr.match(/width:\s*(\d+)px/i) || styleStr.match(/height:\s*(\d+)px/i);
                    if (sizeMatch) {
                        iconEl.setAttribute('size', sizeMatch[1]);
                    }
                    const swMatch = styleStr.match(/stroke-width:\s*([\d.]+)/i);
                    if (swMatch) {
                        iconEl.setAttribute('stroke-width', swMatch[1]);
                    }

                    if (item.parentNode) {
                        item.parentNode.replaceChild(iconEl, item);
                    }
                });
            });
        }
    };
})();
