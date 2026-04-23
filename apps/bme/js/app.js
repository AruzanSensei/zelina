/**
 * Main Application Entry Point
 */
import { appState } from './state.js';
import { initManualMode } from './modes/manual.js';
import { initAIMode } from './modes/ai.js';
import { initHistoryMode } from './modes/history.js';
import { initFinanceMode } from './modes/finance.js';
import { initSettings } from './settings/manager.js';
import { initPDFGenerator } from './pdf/generator.js';

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Modules safely
    const initSafely = (name, fn) => {
        try {
            fn();
            console.log(`[BME] Initialized ${name} successfully`);
        } catch (e) {
            console.error(`[BME] CRITICAL ERROR in ${name}:`, e);
            document.body.insertAdjacentHTML('afterbegin', `<div style="background:red;color:white;padding:10px;z-index:9999;position:fixed;top:0;left:0;right:0;">Error in ${name}: ${e.message}</div>`);
        }
    };

    initSafely('ManualMode', initManualMode);
    initSafely('AIMode', initAIMode);
    initSafely('HistoryMode', initHistoryMode);
    initSafely('FinanceMode', initFinanceMode);
    initSafely('Settings', initSettings);
    initSafely('PDFGenerator', initPDFGenerator);

    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');
    const previewSection = document.getElementById('preview-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;

            // View Toggle
            views.forEach(v => {
                if (v.id === `${target}-view`) v.classList.remove('hidden');
                else v.classList.add('hidden');
            });

            // Handle Global Mode State
            appState.state.currentMode = target; // Simplified, not persisting mode for now

            // Preview Section Visibility
            if (target === 'history' || target === 'finance') {
                previewSection.style.display = 'none';
            } else {
                previewSection.style.display = 'block';
            }
        });
    });

    // Check for "Logo" existence (Visual fix)
    const logoImg = document.querySelector('.app-logo');
    if (logoImg) {
        logoImg.onerror = function () {
            this.style.display = 'none';
        };
    }

    // ============================================
    // INIT SETTINGS (Visuals)
    // ============================================
    // Theme — support 'system' as default
    const applyTheme = (theme) => {
        let effectiveTheme = theme;
        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        // Sync segmented buttons
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    };

    const currentTheme = appState.state.settings.theme || 'system';
    applyTheme(currentTheme);

    // Listen for OS theme change when mode is 'system'
    const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemMediaQuery.addEventListener('change', () => {
        if ((appState.state.settings.theme || 'system') === 'system') applyTheme('system');
    });

    // ============================================
    // PWA Check
    // ============================================
    if ('serviceWorker' in navigator) {
        console.log("PWA Ready");
    }

    // ============================================
    // SMART UI: Header & Footer
    // ============================================
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.app-header');
    const footer = document.querySelector('.action-bar-sticky');

    // Header Logic
    if (header) {
        const applyHeaderMode = (mode) => {
            if (mode === 'history' || mode === 'finance') {
                // In history/finance mode: non-sticky, can be scrolled past
                header.style.position = 'relative';
                header.style.top = '';
                header.classList.remove('hide');
            } else {
                // In other modes: sticky with smart hide/show
                header.style.position = '';
                header.style.top = '';
            }
        };

        // Apply initial mode
        applyHeaderMode(appState.state.currentMode);

        // Reapply on tab switch
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                applyHeaderMode(tab.dataset.tab);
                lastScrollY = window.scrollY;
                header.classList.remove('hide');
            });
        });

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            const curMode = appState.state.currentMode;
            if (curMode === 'history' || curMode === 'finance') {
                // In history/finance mode: reveal if within 100px from top
                if (currentScrollY <= 100) {
                    header.style.position = 'sticky';
                    header.style.top = '0';
                    header.classList.remove('hide');
                } else {
                    header.style.position = 'relative';
                    header.style.top = '';
                    header.classList.remove('hide');
                }
                lastScrollY = currentScrollY;
                return;
            }

            // Normal smart hide/show for other modes
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                header.classList.add('hide');
            } else {
                header.classList.remove('hide');
            }
            lastScrollY = currentScrollY;
        });
    }

    // Footer Logic (Idle Detection)
    let idleTimer;

    const showFooter = () => {
        if (!footer) return;
        footer.classList.remove('hide');
        clearTimeout(idleTimer);
        // Hide again after 2s
        idleTimer = setTimeout(() => {
            footer.classList.add('hide');
        }, 2000);
    };

    const resetIdleTimer = () => {
        showFooter();
    };

    // Listen to interactions
    ['touchstart', 'scroll', 'click', 'keydown', 'mousemove'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // ============================================
    // ONBOARDING LOGIC
    // ============================================
    const initOnboarding = () => {
        const modal = document.getElementById('onboarding-modal');
        const selector = document.getElementById('onboarding-format-selector');
        const btnStart = document.getElementById('btn-onboarding-start');

        if (!appState.state.settings.onboarded) {
            modal.classList.remove('hidden');
        }

        let selectedMethod = 'pdf'; // Default

        if (selector) {
            selector.querySelectorAll('.segmented-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    selectedMethod = btn.dataset.value;
                    selector.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }

        btnStart?.addEventListener('click', () => {
            appState.updateSettings({
                onboarded: true,
                defaultDownloadMethod: selectedMethod
            });
            modal.classList.add('hidden');
        });
    };

    initSafely('Onboarding', initOnboarding);

    // Theme cycle control (1 button: light -> dark -> system)
    const themeCycleBtn = document.getElementById('btn-theme-cycle');
    const themeSequence = ['light', 'dark', 'system'];
    
    const updateThemeIcon = (theme) => {
        if (!themeCycleBtn) return;
        const icons = {
            'light': 'sun',
            'dark': 'moon',
            'system': 'monitor'
        };
        themeCycleBtn.innerHTML = `<i data-lucide="${icons[theme] || 'monitor'}" style="width:16px;height:16px;stroke-width:2"></i>`;
        if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [themeCycleBtn] });
    };

    if (themeCycleBtn) {
        themeCycleBtn.addEventListener('click', () => {
            const current = appState.state.settings.theme || 'system';
            const nextIdx = (themeSequence.indexOf(current) + 1) % themeSequence.length;
            const nextTheme = themeSequence[nextIdx];
            
            appState.updateSettings({ theme: nextTheme });
            applyTheme(nextTheme);
            updateThemeIcon(nextTheme);
        });
    }

    // Subscribe to theme changes from settings module
    appState.subscribe('settings', (settings) => {
        if (settings.theme) {
            applyTheme(settings.theme);
            updateThemeIcon(settings.theme);
        }
    });

    // Initial state
    updateThemeIcon(appState.state.settings.theme || 'system');

    // Global Template Picker button (orange button next to + Tambah Item)
    const btnGlobalPicker = document.getElementById('btn-global-template-picker');
    if (btnGlobalPicker) {
        btnGlobalPicker.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('request-item-picker', {
                detail: {
                    callback: (selectedItem) => {
                        // Add a new item using the selected template
                        document.dispatchEvent(new CustomEvent('add-item-from-template', {
                            detail: { item: selectedItem }
                        }));
                    }
                }
            }));
        });
        if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', nodes: [...btnGlobalPicker.querySelectorAll('[data-lucide]')] });
    }

    // Initial show
    showFooter();
});
