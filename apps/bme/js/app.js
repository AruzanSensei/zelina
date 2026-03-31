/**
 * Main Application Entry Point
 */
import { appState } from './state.js';
import { initManualMode } from './modes/manual.js';
import { initAIMode } from './modes/ai.js';
import { initHistoryMode } from './modes/history.js';
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
            if (target === 'history') {
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
    // Theme
    const currentTheme = appState.state.settings.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector(`[data-theme="${currentTheme}"]`).classList.add('active');

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
        window.addEventListener('scroll', () => {
            if (appState && appState.state && appState.state.currentMode === 'history') {
                header.classList.remove('hide');
                lastScrollY = window.scrollY;
                return;
            }

            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scroll Down
                header.classList.add('hide');
            } else {
                // Scroll Up
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

    // ============================================
    // THEME TOGGLE LOGIC
    // ============================================
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    const updateThemeIcon = (theme) => {
        const icon = themeToggleBtn?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = appState.state.settings.theme === 'light' ? 'dark' : 'light';
            appState.updateSettings({ theme: newTheme });
        });
    }

    // Subscribe to theme changes to update header icon
    appState.subscribe('settings', (settings) => {
        if (settings.theme) updateThemeIcon(settings.theme);
    });

    // Initial icon state
    updateThemeIcon(appState.state.settings.theme);

    // Initial show
    showFooter();
});
