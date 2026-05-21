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

    // ============================================
    // SYSTEM TABS & LAYOUT CONTROLLER
    // ============================================

    // Render Chrome-like tabs bar UI dynamically based on state tabs
    const renderChromeTabs = () => {
        const tabsList = document.getElementById('chrome-tabs-list');
        if (!tabsList) return;
        tabsList.innerHTML = '';


        appState.state.tabs.forEach(tab => {
            const isActive = tab.id === appState.state.activeTabId;
            const tabEl = document.createElement('div');
            tabEl.className = `chrome-tab ${isActive ? 'active' : ''} ${tab.mode}`;
            tabEl.dataset.id = tab.id;
            tabEl.innerHTML = `
                <div class="tab-color-indicator"></div>
                <span class="tab-title">${tab.title || 'Tab Baru'}</span>
                <button class="tab-close" data-id="${tab.id}"><i-ui name="x" size="20"></i-ui></button>
            `;

            // Click to switch tab
            tabEl.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) return;
                appState.switchTab(tab.id);
            });

            // Close tab
            const closeBtn = tabEl.querySelector('.tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                appState.closeTab(tab.id);
            });

            tabsList.appendChild(tabEl);
        });
    };

    // Card/Table and Simple/Advance control toggles sync
    const syncControlToggles = () => {
        const viewMode = appState.state.manualViewMode || 'card';
        const cardMode = appState.state.manualCardMode || 'simple';

        // Card/Table View
        const btnCard = document.getElementById('view-card-btn');
        const btnTable = document.getElementById('view-table-btn');
        const btnCardD = document.getElementById('desktop-view-card-btn');
        const btnTableD = document.getElementById('desktop-view-table-btn');

        if (viewMode === 'table') {
            btnCard?.classList.remove('active');
            btnTable?.classList.add('active');
            btnCardD?.classList.remove('active');
            btnTableD?.classList.add('active');
        } else {
            btnCard?.classList.add('active');
            btnTable?.classList.remove('active');
            btnCardD?.classList.add('active');
            btnTableD?.classList.remove('active');
        }

        // Simple/Advance Card Mode
        const btnSimple = document.getElementById('mode-simple-btn');
        const btnAdvance = document.getElementById('mode-advance-btn');
        const btnSimpleD = document.getElementById('desktop-mode-simple-btn');
        const btnAdvanceD = document.getElementById('desktop-mode-advance-btn');

        if (cardMode === 'advance') {
            btnSimple?.classList.remove('active');
            btnAdvance?.classList.add('active');
            btnSimpleD?.classList.remove('active');
            btnAdvanceD?.classList.add('active');
        } else {
            btnSimple?.classList.add('active');
            btnAdvance?.classList.remove('active');
            btnSimpleD?.classList.add('active');
            btnAdvanceD?.classList.remove('active');
        }

        // Label Visibility eye toggle sync
        const labelHidden = document.body.classList.contains('hide-labels');
        const eyeIcon = document.getElementById('wrap-icon-eye');
        const eyeClosedIcon = document.getElementById('wrap-icon-eye-closed');
        const eyeIconD = document.getElementById('desktop-wrap-icon-eye');
        const eyeClosedIconD = document.getElementById('desktop-wrap-icon-eye-closed');

        if (labelHidden) {
            if (eyeIcon) eyeIcon.style.display = 'none';
            if (eyeClosedIcon) eyeClosedIcon.style.display = 'block';
            if (eyeIconD) eyeIconD.style.display = 'none';
            if (eyeClosedIconD) eyeClosedIconD.style.display = 'block';
        } else {
            if (eyeIcon) eyeIcon.style.display = 'block';
            if (eyeClosedIcon) eyeClosedIcon.style.display = 'none';
            if (eyeIconD) eyeIconD.style.display = 'block';
            if (eyeClosedIconD) eyeClosedIconD.style.display = 'none';
        }

        // Sync Desktop Premium Toolbar Dropdown Pills
        // 1. Pill Tampilan
        const pillTampilan = document.getElementById('pill-tampilan');
        if (pillTampilan) {
            const trigger = pillTampilan.querySelector('.pill-trigger');
            const icon = trigger?.querySelector('i-ui');
            const label = trigger?.querySelector('span');
            const optCard = document.getElementById('opt-view-card');
            const optTable = document.getElementById('opt-view-table');

            if (viewMode === 'table') {
                icon?.setAttribute('name', 'list');
                if (label) label.textContent = 'Tabel';
                optTable?.classList.add('active');
                optCard?.classList.remove('active');
            } else {
                icon?.setAttribute('name', 'layout-grid-01');
                if (label) label.textContent = 'Kartu';
                optCard?.classList.add('active');
                optTable?.classList.remove('active');
            }
        }

        // 2. Pill Label/Mode
        const pillLabel = document.getElementById('pill-label');
        if (pillLabel) {
            const trigger = pillLabel.querySelector('.pill-trigger');
            const icon = trigger?.querySelector('i-ui');
            const label = trigger?.querySelector('span');
            const optDetail = document.getElementById('opt-label-detail');
            const optSederhana = document.getElementById('opt-label-sederhana');

            if (labelHidden) {
                icon?.setAttribute('name', 'eye-off');
                if (label) label.textContent = 'sederhana';
                optSederhana?.classList.add('active');
                optDetail?.classList.remove('active');
            } else {
                icon?.setAttribute('name', 'eye');
                if (label) label.textContent = 'detail';
                optDetail?.classList.add('active');
                optSederhana?.classList.remove('active');
            }
        }

        // 3. Pill Tema
        const pillTema = document.getElementById('pill-tema');
        if (pillTema) {
            const trigger = pillTema.querySelector('.pill-trigger');
            const icon = trigger?.querySelector('i-ui');
            const label = trigger?.querySelector('span');
            const optDark = document.getElementById('opt-theme-dark');
            const optLight = document.getElementById('opt-theme-light');
            const optSystem = document.getElementById('opt-theme-system');

            const currentTheme = appState.state.settings.theme || 'system';

            optDark?.classList.remove('active');
            optLight?.classList.remove('active');
            optSystem?.classList.remove('active');

            if (currentTheme === 'dark') {
                icon?.setAttribute('name', 'moon-01');
                if (label) label.textContent = 'Gelap';
                optDark?.classList.add('active');
            } else if (currentTheme === 'light') {
                icon?.setAttribute('name', 'sun');
                if (label) label.textContent = 'Terang';
                optLight?.classList.add('active');
            } else {
                icon?.setAttribute('name', 'monitor-02');
                if (label) label.textContent = 'Sistem';
                optSystem?.classList.add('active');
            }
        }
    };

    // Dynamically compute the correct CSS scale for preview thumbnails.
    // Handled completely by CSS variables for a fixed, easily adjustable design.
    const updatePreviewScale = () => {
        // No-op: Scaling is now fully driven by CSS variables in desktop-ui.css
    };

    // Dynamic Preview DOM transfer (highly efficient)
    const syncPreviewPanelDOM = () => {
        const previewCards = document.querySelector('.preview-cards');
        if (!previewCards) return;

        const isDesktop = window.innerWidth >= 1024;
        const activeTab = appState.getActiveTab();
        const isPreviewEnabled = activeTab && (activeTab.mode === 'manual' || activeTab.mode === 'ai');

        if (isDesktop) {
            const desktopPreviewBody = document.getElementById('desktop-preview-body');
            if (desktopPreviewBody && isPreviewEnabled) {
                if (previewCards.parentNode !== desktopPreviewBody) {
                    desktopPreviewBody.appendChild(previewCards);
                }
            }
        } else {
            const mobilePreviewSection = document.getElementById('preview-section');
            if (mobilePreviewSection && isPreviewEnabled) {
                if (previewCards.parentNode !== mobilePreviewSection) {
                    mobilePreviewSection.appendChild(previewCards);
                }
            }
        }

        // Sync thumbnail scale after any DOM transfer
        updatePreviewScale();
    };


    // Sync all tab navigation states, panel visibilities, and title inputs
    const syncActiveTabUI = () => {
        renderChromeTabs();

        const activeTab = appState.getActiveTab();
        if (!activeTab) return;

        const currentMode = activeTab.mode;

        // 1. Sync sidebar nav active state
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            const tabAttr = item.getAttribute('data-tab');
            if (tabAttr === currentMode) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 2. Sync mobile nav active state
        const mobileTabs = document.querySelectorAll('.tab-nav .tab-btn');
        mobileTabs.forEach(tab => {
            const tabAttr = tab.getAttribute('data-tab');
            if (tabAttr === currentMode) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 3. Switch view stack
        const views = document.querySelectorAll('.view');
        views.forEach(v => {
            if (v.id === `${currentMode}-view`) {
                v.classList.remove('hidden');
                v.classList.add('active');
            } else {
                v.classList.add('hidden');
                v.classList.remove('active');
            }
        });

        // 4. Preview panel visibility (Manual & AI modes only)
        const previewSection = document.getElementById('preview-section');
        const desktopPreviewPanel = document.getElementById('desktop-preview-panel');
        const collapsedPreviewStrip = document.getElementById('collapsed-preview-strip');

        const isPreviewEnabled = (currentMode === 'manual' || currentMode === 'ai');

        if (window.innerWidth >= 1024) {
            previewSection.style.display = 'none'; // always hide mobile block

            if (isPreviewEnabled) {
                const isCollapsed = document.body.classList.contains('preview-collapsed');
                if (isCollapsed) {
                    desktopPreviewPanel.style.display = 'none';
                    collapsedPreviewStrip.style.display = 'flex';
                } else {
                    desktopPreviewPanel.style.display = 'flex';
                    collapsedPreviewStrip.style.display = 'none';
                }
            } else {
                desktopPreviewPanel.style.display = 'none';
                collapsedPreviewStrip.style.display = 'none';
            }
        } else {
            if (isPreviewEnabled) {
                previewSection.style.display = 'block';
            } else {
                previewSection.style.display = 'none';
            }
            desktopPreviewPanel.style.display = 'none';
            collapsedPreviewStrip.style.display = 'none';
        }

        // 5. Action bar visibility (Manual & AI modes only)
        const footer = document.querySelector('.action-bar-sticky');
        if (footer) {
            if (isPreviewEnabled) {
                footer.style.display = 'flex';
            } else {
                footer.style.display = 'none';
            }
        }

        // 6. Sync manual titles inputs
        const titleInputMobile = document.getElementById('manual-title');
        const titleInputDesktop = document.getElementById('manual-title-desktop');

        if (currentMode === 'manual') {
            const titleVal = activeTab.title || '';
            if (titleInputMobile) titleInputMobile.value = titleVal;
            if (titleInputDesktop) titleInputDesktop.value = titleVal;

            if (!titleVal.trim()) {
                titleInputMobile?.classList.add('required-empty-orange');
                titleInputDesktop?.classList.add('required-empty-orange');
            } else {
                titleInputMobile?.classList.remove('required-empty-orange');
                titleInputDesktop?.classList.remove('required-empty-orange');
            }
        }

        // 7. Desktop workspace-title-wrap: only visible in Manual Mode
        const titleWrap = document.querySelector('.workspace-title-wrap');
        if (titleWrap) {
            titleWrap.style.display = (currentMode === 'manual') ? 'flex' : 'none';
        }

        // 8. Sync control toggles & DOM previews
        syncControlToggles();
        syncPreviewPanelDOM();
    };

    // Helper to sync sidebar toggle button icon dynamically
    const syncSidebarToggleIcon = () => {
        const toggleBtn = document.getElementById('btn-sidebar-toggle');
        const icon = toggleBtn?.querySelector('i-ui');
        if (icon) {
            const isCollapsed = document.body.classList.contains('sidebar-collapsed');
            icon.setAttribute('name', isCollapsed ? 'flex-align-right' : 'flex-align-left');
        }
    };

    // Load and apply cached collapsible states
    const initCollapseStates = () => {
        const sidebarCollapsed = localStorage.getItem('bme_sidebar_collapsed') === 'true';
        document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);

        const previewCollapsed = localStorage.getItem('bme_preview_collapsed') === 'true';
        document.body.classList.toggle('preview-collapsed', previewCollapsed);

        const toolbarCollapsed = localStorage.getItem('bme_toolbar_collapsed') === 'true';
        const toolbar = document.querySelector('.workspace-header-toolbar');
        if (toolbar) {
            toolbar.classList.toggle('collapsed', toolbarCollapsed);
        }

        // Sync icon on init
        syncSidebarToggleIcon();
    };

    // Connect Sidebar Collapse click
    const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
    btnSidebarToggle?.addEventListener('click', () => {
        const collapsed = document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('bme_sidebar_collapsed', collapsed);
        syncSidebarToggleIcon();
        syncActiveTabUI();
    });

    // Connect Preview Collapse/Expand clicks
    const btnPreviewCollapse = document.getElementById('btn-preview-collapse');
    btnPreviewCollapse?.addEventListener('click', () => {
        document.body.classList.add('preview-collapsed');
        localStorage.setItem('bme_preview_collapsed', 'true');
        syncActiveTabUI();
    });

    const btnPreviewExpand = document.getElementById('btn-preview-expand');
    btnPreviewExpand?.addEventListener('click', () => {
        document.body.classList.remove('preview-collapsed');
        localStorage.setItem('bme_preview_collapsed', 'false');
        syncActiveTabUI();
        // Re-compute scale after panel transition completes (300ms)
        setTimeout(updatePreviewScale, 320);
    });

    // Connect Workspace Toolbar collapse click
    const btnToolbarToggle = document.getElementById('btn-toolbar-toggle');
    btnToolbarToggle?.addEventListener('click', () => {
        const toolbar = document.querySelector('.workspace-header-toolbar');
        if (toolbar) {
            const collapsed = toolbar.classList.toggle('collapsed');
            localStorage.setItem('bme_toolbar_collapsed', collapsed);
        }
    });

    // Connect mobile nav bar tabs switching
    const mobileTabs = document.querySelectorAll('.tab-nav .tab-btn');
    mobileTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-tab');
            const existingTab = appState.state.tabs.find(t => t.mode === mode);
            if (existingTab) {
                appState.switchTab(existingTab.id);
            } else {
                appState.createNewTab(mode);
            }
        });
    });

    // Connect desktop sidebar navigation links
    const sidebarNavLinks = document.querySelectorAll('.sidebar-item[data-tab]');
    sidebarNavLinks.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.getAttribute('data-tab');
            const existingTab = appState.state.tabs.find(t => t.mode === mode);
            if (existingTab) {
                appState.switchTab(existingTab.id);
            } else {
                appState.createNewTab(mode);
            }
        });
    });

    // Connect settings proxy
    const btnSidebarSettings = document.getElementById('btn-sidebar-settings');
    btnSidebarSettings?.addEventListener('click', () => {
        document.getElementById('btn-settings')?.click();
    });

    // Connect Chrome tabs add button
    const btnAddTabChrome = document.getElementById('btn-add-tab-chrome');
    btnAddTabChrome?.addEventListener('click', () => {
        appState.createNewTab('manual');
    });

    // Bind Proxy clicks
    const bindProxyClick = (desktopId, mobileId) => {
        const dBtn = document.getElementById(desktopId);
        const mBtn = document.getElementById(mobileId);
        if (dBtn && mBtn) {
            dBtn.addEventListener('click', () => {
                mBtn.click();
                syncControlToggles();
            });
        }
    };

    bindProxyClick('desktop-view-card-btn', 'view-card-btn');
    bindProxyClick('desktop-view-table-btn', 'view-table-btn');
    bindProxyClick('desktop-mode-simple-btn', 'mode-simple-btn');
    bindProxyClick('desktop-mode-advance-btn', 'mode-advance-btn');
    bindProxyClick('desktop-btn-label-toggle', 'btn-label-toggle');
    bindProxyClick('desktop-btn-theme-cycle', 'btn-theme-cycle');

    // Connect Premium Desktop Toolbar Dropdown items
    const optViewCard = document.getElementById('opt-view-card');
    const optViewTable = document.getElementById('opt-view-table');
    optViewCard?.addEventListener('click', () => {
        document.getElementById('view-card-btn')?.click();
        syncControlToggles();
    });
    optViewTable?.addEventListener('click', () => {
        document.getElementById('view-table-btn')?.click();
        syncControlToggles();
    });

    const optLabelDetail = document.getElementById('opt-label-detail');
    const optLabelSederhana = document.getElementById('opt-label-sederhana');
    optLabelDetail?.addEventListener('click', () => {
        if (document.body.classList.contains('hide-labels')) {
            document.getElementById('btn-label-toggle')?.click();
            syncControlToggles();
        }
    });
    optLabelSederhana?.addEventListener('click', () => {
        if (!document.body.classList.contains('hide-labels')) {
            document.getElementById('btn-label-toggle')?.click();
            syncControlToggles();
        }
    });

    const bindThemeOption = (optId, themeValue) => {
        const opt = document.getElementById(optId);
        opt?.addEventListener('click', () => {
            appState.updateSettings({ theme: themeValue });
            applyTheme(themeValue);
            updateThemeIcon(themeValue);
            syncControlToggles();
        });
    };
    bindThemeOption('opt-theme-dark', 'dark');
    bindThemeOption('opt-theme-light', 'light');
    bindThemeOption('opt-theme-system', 'system');

    // Split Format Download Menu triggers
    const splitArrow = document.getElementById('btn-download-split-arrow');
    const formatDropdown = document.getElementById('download-format-dropdown');

    splitArrow?.addEventListener('click', (e) => {
        e.stopPropagation();
        formatDropdown?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.download-split-btn')) {
            formatDropdown?.classList.remove('show');
        }
    });

    const formatOptions = document.querySelectorAll('.glass-dropdown-item');
    formatOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const format = opt.getAttribute('data-format');
            appState.updateSettings({ defaultDownloadMethod: format });
            formatDropdown?.classList.remove('show');
            document.getElementById('btn-download')?.click();
        });
    });

    // Wire quick insert plus green button
    const btnQuickAddAction = document.getElementById('btn-quick-add-action');
    btnQuickAddAction?.addEventListener('click', () => {
        const btnAddItem = document.getElementById('btn-add-item');
        btnAddItem?.click();
        setTimeout(() => {
            const container = document.getElementById('manual-items-container');
            if (container && container.lastElementChild) {
                container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    });

    // Initialize Collapse States & Tab UI on start
    initCollapseStates();
    syncActiveTabUI();

    // Subscribe to state updates to react automatically
    appState.subscribe('tabs', () => {
        syncActiveTabUI();
    });
    appState.subscribe('activeTabId', () => {
        syncActiveTabUI();
    });

    // Listen on resize event
    window.addEventListener('resize', () => {
        syncActiveTabUI();
        updatePreviewScale();
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
        mobileTabs.forEach(tab => {
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
            'dark': 'moon-01',
            'system': 'monitor-02'
        };
        themeCycleBtn.innerHTML = `<i-ui name="${icons[theme] || 'monitor'}" size="16"></i-ui>`;
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
    }

    // Initial show
    showFooter();
});
