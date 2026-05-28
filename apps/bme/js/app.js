/**
 * Main Application Entry Point
 */
import { appState } from './state.js';
import { initDashboardMode } from './modes/dashboard.js';
import { initManualMode } from './modes/manual.js';
import { initAIMode } from './modes/ai.js';
import { initHistoryMode } from './modes/history.js';
import { initFinanceMode } from './modes/finance.js';
import { initSettings } from './settings/manager.js';
import { initPDFGenerator } from './pdf/generator.js';

// Lazy import sync system (loaded after critical UI)
let syncModulePromise = null;
function loadSyncModule() {
    if (!syncModulePromise) {
        syncModulePromise = import('./sync/index.js');
    }
    return syncModulePromise;
}

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

    initSafely('DashboardMode', initDashboardMode);
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
            const isDashboard = tab.mode === 'dashboard';
            const tabEl = document.createElement('div');
            tabEl.className = `chrome-tab ${isActive ? 'active' : ''} ${tab.mode}`;
            tabEl.dataset.id = tab.id;
            tabEl.innerHTML = `
                <div class="tab-color-indicator"></div>
                <span class="tab-title">${tab.title || 'Tab Baru'}</span>
                ${isDashboard ? '' : `<button class="tab-close" data-id="${tab.id}"><i-ui name="x" size="20"></i-ui></button>`}
            `;

            // Click to switch tab
            tabEl.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) return;
                appState.switchTab(tab.id);
            });

            // Close tab
            const closeBtn = tabEl.querySelector('.tab-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    appState.closeTab(tab.id);
                });
            }

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
        const isPreviewEnabled = activeTab && (activeTab.mode === 'manual');

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

        const isPreviewEnabled = (currentMode === 'manual');

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
        const manualFooter = document.getElementById('manual-action-bar');
        const aiFooter = document.getElementById('ai-action-bar');
        if (manualFooter) {
            manualFooter.style.display = (currentMode === 'manual') ? 'flex' : 'none';
        }
        if (aiFooter) {
            aiFooter.style.display = (currentMode === 'ai') ? 'flex' : 'none';
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

        // 7. Desktop workspace-header: only visible in Manual Mode on Desktop (prevent mobile bleeding)
        const workspaceHeader = document.querySelector('.workspace-header');
        if (workspaceHeader) {
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop) {
                workspaceHeader.style.display = (currentMode === 'manual') ? 'flex' : 'none';
            } else {
                workspaceHeader.style.display = ''; // Reset inline style so CSS stylesheet rules take control on mobile
            }
        }

        // 8. Sync control toggles & DOM previews
        syncControlToggles();
        syncPreviewPanelDOM();

        // 9. Sync Mobile App Header layout and sticky state
        const headerBrandContainer = document.getElementById('header-brand-container');
        const headerPageTitle = document.getElementById('header-page-title');
        const headerEl = document.querySelector('.app-header');

        if (headerEl) {
            if (currentMode === 'dashboard') {
                if (headerBrandContainer) headerBrandContainer.style.display = 'flex';
                if (headerPageTitle) headerPageTitle.style.display = 'none';
                headerEl.style.position = 'relative';
                headerEl.style.top = '';
                headerEl.classList.remove('hide');
            } else {
                if (headerBrandContainer) headerBrandContainer.style.display = 'none';
                if (headerPageTitle) {
                    headerPageTitle.style.display = 'block';
                    const modeNames = {
                        manual: 'manual',
                        ai: 'AI Mode',
                        finance: 'Keuangan',
                        history: 'Histori'
                    };
                    headerPageTitle.textContent = modeNames[currentMode] || currentMode;
                }
                headerEl.style.position = 'sticky';
                headerEl.style.top = '0';
            }
        }
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

    // Connect AI wrapper click to button click for better mobile tap targets
    const aiWrapper = document.querySelector('.tab-btn-ai-wrapper');
    aiWrapper?.addEventListener('click', (e) => {
        const aiBtn = aiWrapper.querySelector('.tab-btn-ai');
        if (aiBtn && e.target !== aiBtn) {
            aiBtn.click();
        }
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

    // ── Label Visibility Toggle (Mobile & Desktop Integration) ────────
    const btnLabelToggle = document.getElementById('btn-label-toggle');

    // Restore saved state from localStorage
    let labelsHidden = localStorage.getItem('bme_labels_hidden') === 'true';

    const applyLabelState = () => {
        if (labelsHidden) {
            document.body.classList.add('labels-hidden');
            document.body.classList.add('hide-labels');
        } else {
            document.body.classList.remove('labels-hidden');
            document.body.classList.remove('hide-labels');
        }
        syncControlToggles();
    };

    // Apply initial state immediately on load
    applyLabelState();

    // Listen for click event
    btnLabelToggle?.addEventListener('click', () => {
        labelsHidden = !labelsHidden;
        localStorage.setItem('bme_labels_hidden', labelsHidden);
        applyLabelState();
    });

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

    // Also wire mobile split arrow → same dropdown
    const splitArrowMobile = document.getElementById('btn-download-split-arrow-mobile');
    const formatDropdownMobile = document.getElementById('download-format-dropdown-mobile');
    splitArrowMobile?.addEventListener('click', (e) => {
        e.stopPropagation();
        formatDropdownMobile?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.download-split-btn') && !e.target.closest('.action-download-group')) {
            formatDropdown?.classList.remove('show');
            formatDropdownMobile?.classList.remove('show');
        }

        // Close custom select portals when clicking outside
        if (!e.target.closest('.select-selected') && !e.target.closest('.select-items-portal')) {
            document.querySelectorAll('.select-items-portal').forEach(el => el.remove());
        }
    });

    const formatOptions = document.querySelectorAll('.glass-dropdown-item');
    formatOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const format = opt.getAttribute('data-format');
            appState.updateSettings({ defaultDownloadMethod: format });
            formatDropdown?.classList.remove('show');
            formatDropdownMobile?.classList.remove('show');
            // Trigger download on the active (visible) button
            document.getElementById('btn-download')?.click();
        });
    });

    // Proxy mobile save/download buttons → desktop handlers
    document.getElementById('btn-save-only-mobile')?.addEventListener('click', () => {
        document.getElementById('btn-save-only')?.click();
    });
    document.getElementById('btn-download-mobile')?.addEventListener('click', () => {
        document.getElementById('btn-download')?.click();
    });
    // Sync grand-total-mobile with grand-total (observe DOM changes)
    const grandTotal = document.getElementById('grand-total');
    const grandTotalMobile = document.getElementById('grand-total-mobile');
    if (grandTotal && grandTotalMobile) {
        const syncMobileTotal = () => { grandTotalMobile.textContent = grandTotal.textContent; };
        new MutationObserver(syncMobileTotal).observe(grandTotal, { childList: true, characterData: true, subtree: true });
        syncMobileTotal();
    }


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

    // Header Logic
    if (header) {
        // Apply initial mode on boot
        if (typeof syncActiveTabUI === 'function') {
            syncActiveTabUI();
        }

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const activeTab = appState.getActiveTab();
            const curMode = activeTab ? activeTab.mode : appState.state.currentMode;

            if (curMode === 'dashboard') {
                // Dashboard mode header is static/relative and never hides
                header.style.position = 'relative';
                header.style.top = '';
                header.classList.remove('hide');
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

    // Footer Logic (Idle Detection with Active Mode Selection)
    let idleTimer;

    const showFooter = () => {
        const activeTab = appState.getActiveTab();
        const curMode = activeTab ? activeTab.mode : appState.state.currentMode;

        let activeFooter = null;
        if (curMode === 'manual') {
            activeFooter = document.getElementById('manual-action-bar');
        } else if (curMode === 'ai') {
            activeFooter = document.getElementById('ai-action-bar');
        }

        if (!activeFooter) return;
        activeFooter.classList.remove('hide');
        clearTimeout(idleTimer);
        // Hide again after 2s
        idleTimer = setTimeout(() => {
            activeFooter.classList.add('hide');
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

    // ============================================
    // SUPABASE SESSION, HEADER & SIDEBAR SYNC INTEGRATION
    // ============================================
    const syncHeaderProfile = () => {
        const logoContainer = document.getElementById('header-logo-container');
        const logoImg = document.getElementById('header-logo-img');
        const logoPlaceholder = document.getElementById('header-logo-placeholder');
        const welcomeTitle = document.getElementById('header-welcome-title');
        const welcomeSub = document.getElementById('header-welcome-sub');

        if (!logoContainer || !welcomeTitle || !welcomeSub) return;

        if (appState.state.isLoggedIn && appState.state.adminProfile) {
            const profile = appState.state.adminProfile;

            // Extract values safely
            const fullName = profile.user_metadata?.full_name ||
                profile.raw_user_meta_data?.full_name ||
                profile.full_name ||
                '';

            const avatarUrl = profile.user_metadata?.avatar_url ||
                profile.user_metadata?.picture ||
                profile.raw_user_meta_data?.avatar_url ||
                profile.raw_user_meta_data?.picture ||
                profile.avatar_url ||
                '';

            const email = profile.email || '';

            // 1. Title: Hai, [FirstName]!
            let firstName = 'Admin';
            if (fullName) {
                const parts = fullName.trim().split(/\s+/);
                if (parts.length > 0) {
                    const rawFirst = parts[0];
                    firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
                }
            }
            welcomeTitle.textContent = `Hai, ${firstName}!`;

            // 2. Subtitle: email
            welcomeSub.textContent = email;

            // 3. Avatar Image & Border
            if (avatarUrl) {
                if (logoImg) {
                    logoImg.src = avatarUrl;
                    logoImg.style.display = 'block';
                    logoImg.style.borderRadius = '50%';
                    logoImg.style.objectFit = 'cover';
                }
                if (logoPlaceholder) logoPlaceholder.style.display = 'none';
                logoContainer.style.borderRadius = '50%';
                logoContainer.style.border = '1.5px solid var(--primary)';
            } else {
                if (logoImg) logoImg.style.display = 'none';
                if (logoPlaceholder) {
                    logoPlaceholder.style.display = 'flex';
                    logoPlaceholder.textContent = firstName.charAt(0).toUpperCase();
                }
                logoContainer.style.borderRadius = '50%';
                logoContainer.style.border = '1.5px solid var(--primary)';
            }
        } else {
            // Guest Mode / Default State
            welcomeTitle.textContent = 'BERKAH MAJU ELEKTRIK';
            welcomeSub.textContent = 'Invoice & Surat Jalan';

            if (logoImg) {
                logoImg.src = 'assets/icons/logo-bme.png';
                logoImg.style.display = 'block';
                logoImg.style.borderRadius = '0';
                logoImg.style.objectFit = 'contain';
            }
            if (logoPlaceholder) logoPlaceholder.style.display = 'none';
            logoContainer.style.borderRadius = '0';
            logoContainer.style.border = 'none';
        }
    };

    const syncSidebarProfile = () => {
        // Sync mobile header brand area first
        syncHeaderProfile();
        const sidebarProfile = document.querySelector('.sidebar-profile');
        if (!sidebarProfile) return;

        if (appState.state.isLoggedIn && appState.state.adminProfile) {
            const profile = appState.state.adminProfile;

            // Robust extraction from Supabase user object metadata structure
            const fullName = profile.user_metadata?.full_name ||
                profile.raw_user_meta_data?.full_name ||
                profile.full_name ||
                'Admin';

            const avatarUrl = profile.user_metadata?.avatar_url ||
                profile.user_metadata?.picture ||
                profile.raw_user_meta_data?.avatar_url ||
                profile.raw_user_meta_data?.picture ||
                profile.avatar_url ||
                '';

            const email = profile.email || '';

            if (avatarUrl) {
                sidebarProfile.innerHTML = `
                    <img src="${avatarUrl}" alt="Avatar" style="width:24px; height:24px; border-radius:50%; border:1.5px solid var(--primary); object-fit:cover; margin:0; flex-shrink:0;">
                    <div style="display:flex; flex-direction:column; align-items:flex-start; min-width:0; flex:1; text-align:left; gap:1px;">
                        <div style="display:flex; align-items:center; gap:6px; width:100%; min-width:0;">
                            <span style="font-weight:600; font-size:0.82rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${fullName}</span>
                            <span style="font-size:0.55rem; font-weight:700; color:#fff; background:linear-gradient(90deg, #d4880d, #f39c12); padding:1px 5px; border-radius:50px; text-transform:uppercase; flex-shrink:0;">Admin</span>
                        </div>
                        <span style="font-weight:400; font-size:0.68rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${email}</span>
                    </div>
                `;
            } else {
                sidebarProfile.innerHTML = `
                    <div style="width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #d4880d); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.75rem; font-weight:700; flex-shrink:0; margin:0;">${fullName.charAt(0).toUpperCase()}</div>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; min-width:0; flex:1; text-align:left; gap:1px;">
                        <div style="display:flex; align-items:center; gap:6px; width:100%; min-width:0;">
                            <span style="font-weight:600; font-size:0.82rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${fullName}</span>
                            <span style="font-size:0.55rem; font-weight:700; color:#fff; background:linear-gradient(90deg, #d4880d, #f39c12); padding:1px 5px; border-radius:50px; text-transform:uppercase; flex-shrink:0;">Admin</span>
                        </div>
                        <span style="font-weight:400; font-size:0.68rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${email}</span>
                    </div>
                `;
            }
        } else {
            // Guest Mode
            sidebarProfile.innerHTML = `
                <i-ui name="user-01" size="20"></i-ui>
                <span>Berkah Maju Elektrik</span>
            `;
        }
    };

    // Resolusi Konflik Sinkronisasi (Merge Conflict Strategy)
    // Visual badge & banner controller for sync conflicts
    const toggleConflictBadge = (show) => {
        // No-op: Always hide conflict badges and banners to keep background sync 100% automatic!
        show = false;

        const desktopBtn = document.querySelector('.sidebar-item[data-tab="history"]');
        const mobileBtn = document.querySelector('.tab-btn[data-tab="history"]');

        [desktopBtn, mobileBtn].forEach(btn => {
            if (!btn) return;
            let badge = btn.querySelector('.conflict-badge');
            if (show) {
                if (!badge) {
                    btn.style.position = 'relative';
                    badge = document.createElement('span');
                    badge.className = 'conflict-badge';
                    badge.innerHTML = '!';
                    badge.style.cssText = `
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        background: #ff4d4f;
                        color: white;
                        border-radius: 50%;
                        width: 14px;
                        height: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        font-weight: 800;
                        border: 1px solid var(--bg-card);
                        z-index: 10;
                    `;
                    btn.appendChild(badge);
                }
            } else {
                if (badge) badge.remove();
            }
        });

        const banner = document.getElementById('conflict-resolution-banner');
        if (banner) {
            if (show) {
                banner.style.display = 'flex';
                banner.classList.remove('hidden');
            } else {
                banner.style.display = 'none';
                banner.classList.add('hidden');
            }
        }
    };

    // Deep conflict detector cloud vs local (comparing history content only)
    const detectConflict = (cloudData) => {
        console.log('[BME Sync Debug] Running detectConflict...');
        if (!cloudData) {
            console.log('[BME Sync Debug] No cloud data found.');
            return false;
        }
        if (!cloudData.history) {
            console.log('[BME Sync Debug] No cloud history found in payload.');
            return false;
        }

        const localHistory = appState.state.history || [];
        const cloudHistory = cloudData.history || [];

        console.log(`[BME Sync Debug] History lengths - Local: ${localHistory.length}, Cloud: ${cloudHistory.length}`);

        if (localHistory.length !== cloudHistory.length) {
            console.log('[BME Sync Debug] Length mismatch. Conflict detected.');
            return true;
        }

        // Map cloud history entries by their stringified ID for type-safe fast matching
        const cloudMap = new Map();
        cloudHistory.forEach(item => {
            if (item && item.id !== undefined && item.id !== null) {
                cloudMap.set(String(item.id), item);
            }
        });

        // Helper to normalize transaction item fields to ensure type-safe comparison (preventing number vs string mismatches)
        const normalizeItemFields = (itemObj) => {
            if (!itemObj) return {};
            const normItems = (itemObj.items || []).map(e => {
                if (!e) return {};
                return {
                    name: String(e.name || '').trim(),
                    price: Number(e.price) || 0,
                    qty: Number(e.qty) || 0,
                    note: String(e.note || '').trim(),
                    tipe: String(e.tipe || '').trim(),
                    invKeterangan: String(e.invKeterangan || '').trim(),
                    sjKeterangan: String(e.sjKeterangan || '').trim()
                };
            });
            return {
                title: String(itemObj.title || '').trim(),
                date: String(itemObj.date || '').trim(),
                cardMode: String(itemObj.cardMode || 'simple').trim(),
                items: normItems
            };
        };

        for (let i = 0; i < localHistory.length; i++) {
            const localItem = localHistory[i];
            if (!localItem) continue;

            let cloudItem = null;
            if (localItem.id !== undefined && localItem.id !== null) {
                cloudItem = cloudMap.get(String(localItem.id));
            } else {
                // Fallback for legacy items: match by index
                cloudItem = cloudHistory[i];
            }

            if (!cloudItem) {
                console.log(`[BME Sync Debug] Conflict: Local item ID ${localItem.id} not found in Cloud.`);
                return true;
            }

            const cleanLocal = normalizeItemFields(localItem);
            const cleanCloud = normalizeItemFields(cloudItem);

            if (JSON.stringify(cleanLocal) !== JSON.stringify(cleanCloud)) {
                console.log(`[BME Sync Debug] Content mismatch for item ID ${localItem.id || i}:`, { cleanLocal, cleanCloud });
                return true;
            }
        }

        console.log('[BME Sync Debug] No conflict detected. History is in perfect sync.');
        return false;
    };

    // Merges cloud data into local storage safely
    const mergeCloudIntoLocal = (cloudData) => {
        if (!cloudData) return;

        if (cloudData.settings) {
            appState.state.settings = { ...appState.state.settings, ...cloudData.settings };
            localStorage.setItem('bme_settings', JSON.stringify(appState.state.settings));
        }

        if (cloudData.history) {
            const mergedHistory = [...appState.state.history];
            const localIds = new Set(mergedHistory.map(h => h.id));
            cloudData.history.forEach(item => {
                if (!localIds.has(item.id)) {
                    mergedHistory.push(item);
                }
            });
            mergedHistory.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
            appState.state.history = mergedHistory;
            localStorage.setItem('bme_history', JSON.stringify(mergedHistory));
        }

        if (cloudData.templates) {
            const mergedTemplates = [...appState.state.templates];
            const localTemplateIds = new Set(mergedTemplates.map(t => t.id));
            cloudData.templates.forEach(item => {
                if (!localTemplateIds.has(item.id)) {
                    mergedTemplates.push(item);
                }
            });
            appState.state.templates = mergedTemplates;
            localStorage.setItem('bme_templates', JSON.stringify(mergedTemplates));
        }

        if (cloudData.tabs) {
            const mergedTabs = [...appState.state.tabs];
            const localTabIds = new Set(mergedTabs.map(t => t.id));
            cloudData.tabs.forEach(item => {
                if (!localTabIds.has(item.id)) {
                    mergedTabs.push(item);
                }
            });
            appState.state.tabs = mergedTabs;
            localStorage.setItem('bme_tabs', JSON.stringify(mergedTabs));
        }

        appState.notify('settings', appState.state.settings);
        appState.notify('history', appState.state.history);
        appState.notify('templates', appState.state.templates);
        appState.notify('tabs', appState.state.tabs);

        syncActiveTabUI();
    };

    // Binds interactive conflict resolution buttons
    const initConflictResolutionHandlers = () => {
        const btnKeep = document.getElementById('btn-conflict-keep');
        const btnPull = document.getElementById('btn-conflict-pull');
        const btnMerge = document.getElementById('btn-conflict-merge');

        btnKeep?.addEventListener('click', async () => {
            if (window.showBMEAlert) {
                window.showBMEAlert('Memperbarui data Cloud dengan data Lokal...', 'info');
            }
            await appState.triggerCloudSync();
            toggleConflictBadge(false);
            if (window.showBMEAlert) {
                window.showBMEAlert('Berhasil mempertahankan data lokal di cloud.', 'success');
            }
        });

        btnPull?.addEventListener('click', async () => {
            const cloudData = window.latestCloudData;
            if (!cloudData) return;

            if (window.showBMEAlert) {
                window.showBMEAlert('Menimpa seluruh data dengan data Cloud...', 'info');
            }
            if (cloudData.settings) {
                appState.state.settings = { ...appState.state.settings, ...cloudData.settings };
                localStorage.setItem('bme_settings', JSON.stringify(appState.state.settings));
            }
            if (cloudData.history) {
                appState.state.history = cloudData.history;
                localStorage.setItem('bme_history', JSON.stringify(appState.state.history));
            }
            if (cloudData.templates) {
                appState.state.templates = cloudData.templates;
                localStorage.setItem('bme_templates', JSON.stringify(appState.state.templates));
            }
            if (cloudData.tabs) {
                appState.state.tabs = cloudData.tabs;
                localStorage.setItem('bme_tabs', JSON.stringify(appState.state.tabs));
            }

            appState.notify('settings', appState.state.settings);
            appState.notify('history', appState.state.history);
            appState.notify('templates', appState.state.templates);
            appState.notify('tabs', appState.state.tabs);

            syncActiveTabUI();
            toggleConflictBadge(false);

            if (window.showBMEAlert) {
                window.showBMEAlert('Data lokal berhasil ditimpa dengan data Cloud.', 'success');
            }
        });

        btnMerge?.addEventListener('click', async () => {
            const cloudData = window.latestCloudData;
            if (!cloudData) return;

            if (window.showBMEAlert) {
                window.showBMEAlert('Menggabungkan data Cloud dan data Lokal...', 'info');
            }
            mergeCloudIntoLocal(cloudData);
            await appState.triggerCloudSync();
            toggleConflictBadge(false);

            if (window.showBMEAlert) {
                window.showBMEAlert('Data cloud dan lokal berhasil digabungkan.', 'success');
            }
        });
    };

    // Initialize conflict buttons handlers
    initConflictResolutionHandlers();

    // Sesi Supabase Startup Initialization (Sync-Aware)
    const initSupabaseSession = async () => {
        try {
            const { getSupabase, getSupabaseClient, validateAdminServer, logout, fetchUserData } = await import('./supabase.js');
            const supabase = getSupabase();
            if (!supabase) return;

            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session) {
                // Verifikasi Admin di Sisi Server
                try {
                    const result = await validateAdminServer(session.access_token);
                    if (result && result.isAdmin) {
                        appState.setLoginSession(session, result.user);

                        console.log('[BME Supabase] Berhasil login otomatis sebagai Administrator:', result.user.email);

                        // Use sync system for session restore
                        try {
                            const syncModule = await loadSyncModule();
                            const supabaseClient = getSupabaseClient();
                            const loginResult = await syncModule.loginSync.handleSessionRestore(session, result.user, supabaseClient);

                            if (loginResult.case === 'C') {
                                // Conflict detected on refresh — show subtle notification
                                toggleConflictBadge(true);
                            } else {
                                appState.state.syncStatus = 'synced';
                                appState.notify('syncStatus', 'synced');
                            }

                            // Listen for sync events to refresh UI
                            syncModule.onSyncEvent((type, data) => {
                                if (type === 'remote-update' || type === 'remote-sync' || type === 'tab-update') {
                                    // Refresh local state from localStorage (which sync engine updates)
                                    _refreshStateFromStorage();
                                    syncActiveTabUI();
                                } else if (type === 'tab-logout' || type === 'remote-logout') {
                                    // Another tab/device logged out
                                    appState.handleLogoutCleanup();
                                    syncSidebarProfile();
                                } else if (type === 'login-sync') {
                                    if (data?.event === 'conflict') {
                                        // Show conflict dialog
                                        syncModule.conflictDialog.show({
                                            localCounts: data.localCounts,
                                            cloudCounts: data.cloudCounts,
                                            cloudData: data.cloudData,
                                            onResolved: (choice, success) => {
                                                if (success) {
                                                    _refreshStateFromStorage();
                                                    syncActiveTabUI();
                                                    toggleConflictBadge(false);
                                                }
                                            }
                                        });
                                    } else if (data?.event === 'sync-complete') {
                                        _refreshStateFromStorage();
                                        syncActiveTabUI();
                                        if (window.showBMEAlert) {
                                            window.showBMEAlert(data.message || 'Sinkronisasi selesai.', 'success');
                                        }
                                    } else if (data?.event === 'sync-error') {
                                        if (window.showBMEAlert) {
                                            window.showBMEAlert(data.message || 'Gagal sinkronisasi.', 'error');
                                        }
                                    }
                                }
                            });
                        } catch (syncErr) {
                            console.warn('[BME] Sync system unavailable, using legacy flow:', syncErr);
                            // Fallback to legacy conflict detection
                            const cloudData = await fetchUserData(session.access_token);
                            if (cloudData) {
                                window.latestCloudData = cloudData;
                                const hasConflict = detectConflict(cloudData);
                                if (hasConflict) {
                                    toggleConflictBadge(true);
                                } else {
                                    appState.state.syncStatus = 'synced';
                                    appState.notify('syncStatus', 'synced');
                                }
                            }
                        }
                    }
                } catch (verifyErr) {
                    if (verifyErr.message === '403') {
                        console.warn('[BME Supabase] Sesi otomatis dibatalkan. Pengguna non-admin terdeteksi.');
                        await logout();
                        appState.handleLogoutCleanup();
                    } else {
                        throw verifyErr;
                    }
                }
            }
        } catch (err) {
            console.error('[BME Supabase] Sesi inisialisasi startup gagal:', err);
        } finally {
            syncSidebarProfile();
        }
    };

    // Helper: Refresh in-memory state from localStorage
    // (called when sync engine updates localStorage from cloud/other tabs)
    const _refreshStateFromStorage = () => {
        try {
            const historyRaw = localStorage.getItem('bme_history');
            if (historyRaw) {
                appState.state.history = JSON.parse(historyRaw);
                appState.notify('history', appState.state.history);
            }

            const templatesRaw = localStorage.getItem('bme_templates');
            if (templatesRaw) {
                appState.state.templates = JSON.parse(templatesRaw);
                appState.notify('templates', appState.state.templates);
            }

            const tabsRaw = localStorage.getItem('bme_tabs');
            if (tabsRaw) {
                appState.state.tabs = JSON.parse(tabsRaw);
                appState.notify('tabs', appState.state.tabs);
            }

            const settingsRaw = localStorage.getItem('bme_settings');
            if (settingsRaw) {
                appState.state.settings = { ...appState.state.settings, ...JSON.parse(settingsRaw) };
                appState.notify('settings', appState.state.settings);
            }
        } catch (e) {
            console.warn('[BME] State refresh from storage failed:', e);
        }
    };

    // Menangani Event Login Baru (Sync-Aware)
    document.addEventListener('admin-logged-in', async (e) => {
        const { session, user } = e.detail;
        syncSidebarProfile();

        try {
            const syncModule = await loadSyncModule();
            const { getSupabaseClient } = await import('./supabase.js');
            const supabaseClient = getSupabaseClient();

            const loginResult = await syncModule.loginSync.handleLogin(session, user, supabaseClient);

            if (loginResult.case === 'C') {
                // Conflict dialog will be shown via loginSync event listener
            } else if (loginResult.case === 'A' || loginResult.case === 'B') {
                // Auto-sync completed — refresh UI
                _refreshStateFromStorage();
                syncActiveTabUI();
            }
        } catch (err) {
            console.warn('[BME Sync] Sync system login failed, using legacy merge:', err);
            // Fallback to legacy merge
            try {
                const { fetchUserData } = await import('./supabase.js');
                const cloudData = await fetchUserData(session.access_token);
                if (cloudData) {
                    mergeCloudIntoLocal(cloudData);
                    if (window.showBMEAlert) {
                        window.showBMEAlert('Data cloud berhasil digabungkan ke lokal.', 'success');
                    }
                }
            } catch (fallbackErr) {
                console.error('[BME Sync] Legacy fallback also failed:', fallbackErr);
            }
        }
    });

    // Menangani Event Logout
    document.addEventListener('admin-logout', () => {
        syncSidebarProfile();
    });

    // Subscribe to changes
    appState.subscribe('isLoggedIn', () => syncSidebarProfile());
    appState.subscribe('adminProfile', () => syncSidebarProfile());

    // Initialize Sync System (non-blocking, after critical UI)
    const initSyncSystemSafely = async () => {
        try {
            const syncModule = await loadSyncModule();
            await syncModule.initSyncSystem();
            console.log('[BME] Sync system initialized');
        } catch (e) {
            console.warn('[BME] Sync system initialization failed (app continues without sync):', e);
        }
    };

    // Start sync system initialization, then Supabase session
    initSyncSystemSafely().then(() => {
        initSupabaseSession();
    });

    // ============================================
    // AI RADIAL GESTURE INTERACTIONS
    // ============================================
    const initAIRadialGestures = () => {
        const tabBtnAi = document.querySelector('.tab-btn-ai');
        const radialOverlay = document.getElementById('ai-radial-overlay');
        if (!tabBtnAi || !radialOverlay) return;

        const radialAnchor = radialOverlay.querySelector('.radial-center-anchor');
        let gestureTimer = null;
        let isGestureMode = false;
        let lastActiveTarget = null;
        let isGlobalRecording = false;

        const checkCollision = (clientX, clientY) => {
            const micBtn = document.getElementById('btn-radial-mic');
            const camBtn = document.getElementById('btn-radial-camera');
            const galBtn = document.getElementById('btn-radial-gallery');
            if (!micBtn || !camBtn) return null;

            const micRect = micBtn.getBoundingClientRect();
            const camRect = camBtn.getBoundingClientRect();

            const micCenterX = micRect.left + micRect.width / 2;
            const micCenterY = micRect.top + micRect.height / 2;

            const camCenterX = camRect.left + camRect.width / 2;
            const camCenterY = camRect.top + camRect.height / 2;

            const distMic = Math.hypot(clientX - micCenterX, clientY - micCenterY);
            const distCam = Math.hypot(clientX - camCenterX, clientY - camCenterY);

            let distGal = Infinity;
            if (galBtn) {
                const galRect = galBtn.getBoundingClientRect();
                const galCenterX = galRect.left + galRect.width / 2;
                const galCenterY = galRect.top + galRect.height / 2;
                distGal = Math.hypot(clientX - galCenterX, clientY - galCenterY);
            }

            let activeTarget = null;
            if (distMic < 52) {
                activeTarget = 'mic';
            } else if (distCam < 52) {
                activeTarget = 'camera';
            } else if (distGal < 52) {
                activeTarget = 'gallery';
            }

            if (activeTarget === 'mic') {
                micBtn.classList.add('active');
                camBtn.classList.remove('active');
                if (galBtn) galBtn.classList.remove('active');
            } else if (activeTarget === 'camera') {
                camBtn.classList.add('active');
                micBtn.classList.remove('active');
                if (galBtn) galBtn.classList.remove('active');
            } else if (activeTarget === 'gallery') {
                if (galBtn) galBtn.classList.add('active');
                micBtn.classList.remove('active');
                camBtn.classList.remove('active');
            } else {
                micBtn.classList.remove('active');
                camBtn.classList.remove('active');
                if (galBtn) galBtn.classList.remove('active');
            }

            return activeTarget;
        };

        const handleActiveTargetChange = (target) => {
            if (target === 'mic') {
                if (!isGlobalRecording) {
                    window.bmeAI?.startRecording();
                    isGlobalRecording = true;
                }
            }
        };

        const onStart = (e) => {
            // Stop any active background recording before starting gesture menu
            if (window.bmeAI?.isRecording()) {
                window.bmeAI?.stopRecording();
            }

            const touch = e.touches ? e.touches[0] : e;
            const clientX = touch.clientX;
            const clientY = touch.clientY;

            // Compute exact button center
            const rect = tabBtnAi.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            radialAnchor.style.left = `${centerX}px`;
            radialAnchor.style.top = `${centerY}px`;

            isGestureMode = false;
            lastActiveTarget = null;
            isGlobalRecording = false;

            gestureTimer = setTimeout(() => {
                isGestureMode = true;
                radialOverlay.classList.remove('hidden');
                radialOverlay.classList.add('active');
                radialOverlay.style.display = 'block';

                lastActiveTarget = checkCollision(clientX, clientY);
                handleActiveTargetChange(lastActiveTarget);
            }, 250);

            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchend', onEnd);
            document.addEventListener('mouseup', onEnd);
        };

        const onMove = (e) => {
            if (!gestureTimer) return;
            const touch = e.touches ? e.touches[0] : e;

            if (isGestureMode) {
                if (e.cancelable) e.preventDefault();
                const target = checkCollision(touch.clientX, touch.clientY);
                if (target !== lastActiveTarget) {
                    lastActiveTarget = target;
                    handleActiveTargetChange(target);
                }
            }
        };

        const onEnd = (e) => {
            clearTimeout(gestureTimer);
            gestureTimer = null;

            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('mouseup', onEnd);

            if (isGestureMode) {
                if (e.cancelable) e.preventDefault();

                // Switch to AI tab
                const existingTab = appState.state.tabs.find(t => t.mode === 'ai');
                if (existingTab) {
                    appState.switchTab(existingTab.id);
                } else {
                    appState.createNewTab('ai');
                }

                if (lastActiveTarget === 'mic') {
                    if (window.bmeAI?.isRecording()) {
                        window.bmeAI?.stopRecording();
                    }
                } else if (lastActiveTarget === 'camera') {
                    if (window.bmeAI?.isRecording()) {
                        window.bmeAI?.stopRecording();
                    }
                    setTimeout(() => {
                        window.bmeAI?.triggerCamera();
                    }, 100);
                } else if (lastActiveTarget === 'gallery') {
                    if (window.bmeAI?.isRecording()) {
                        window.bmeAI?.stopRecording();
                    }
                    setTimeout(() => {
                        window.bmeAI?.triggerGallery();
                    }, 100);
                } else {
                    if (window.bmeAI?.isRecording()) {
                        window.bmeAI?.stopRecording();
                    }
                }

                radialOverlay.classList.remove('active');
                setTimeout(() => {
                    if (!radialOverlay.classList.contains('active')) {
                        radialOverlay.style.display = 'none';
                        radialOverlay.classList.add('hidden');
                    }
                }, 250);

                const micBtn = document.getElementById('btn-radial-mic');
                const camBtn = document.getElementById('btn-radial-camera');
                const galBtn = document.getElementById('btn-radial-gallery');
                if (micBtn) micBtn.classList.remove('active');
                if (camBtn) camBtn.classList.remove('active');
                if (galBtn) galBtn.classList.remove('active');
            }
            isGlobalRecording = false;
        };

        tabBtnAi.addEventListener('touchstart', onStart, { passive: true });
        tabBtnAi.addEventListener('mousedown', onStart);
    };

    initSafely('AIRadialGestures', initAIRadialGestures);

    // Initial show
    showFooter();
});
