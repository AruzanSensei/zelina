/**
 * Dashboard Mode Logic
 * Handles dynamic stats calculation and quick shortcut redirects
 */
import { appState } from '../state.js';

export function initDashboardMode() {
    const totalRevenueEl = document.getElementById('dashboard-total-revenue');
    const totalHistoryEl = document.getElementById('dashboard-total-history');
    const totalTemplatesEl = document.getElementById('dashboard-total-templates');
    const progressFillEl = document.getElementById('dashboard-target-progress');
    const progressPercentEl = document.getElementById('dashboard-target-percent');
    const targetValEl = document.getElementById('dashboard-target-val');
    
    const avatarImgEl = document.getElementById('dashboard-avatar');
    const avatarPlaceholderEl = document.getElementById('dashboard-avatar-placeholder');
    const welcomeNameEl = document.getElementById('dashboard-welcome-name');
    const syncStatusEl = document.getElementById('dashboard-sync-status');
    const activeTabDescEl = document.getElementById('dashboard-active-tab-desc');

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Calculate dynamic stats
    const updateStats = () => {
        const history = appState.state.history || [];
        const templates = appState.state.templates || [];
        
        // 1. Total History Count
        if (totalHistoryEl) totalHistoryEl.textContent = history.length;
        
        // 2. Total Templates Count
        if (totalTemplatesEl) totalTemplatesEl.textContent = templates.length;

        // 3. Total Revenue (sum of all history invoice totals)
        let totalRevenue = 0;
        history.forEach(item => {
            if (item.items && Array.isArray(item.items)) {
                item.items.forEach(i => {
                    totalRevenue += (i.price || 0) * (i.qty || 0);
                });
            }
        });
        if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);

        // 4. Monthly Target Progress Bar
        const monthlyTarget = appState.state.settings.monthlyTarget || 3800000;
        if (targetValEl) targetValEl.textContent = `Target: ${formatCurrency(monthlyTarget)}`;
        
        const progressPercent = Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) || 0;
        if (progressPercentEl) progressPercentEl.textContent = `${progressPercent}%`;
        if (progressFillEl) progressFillEl.style.width = `${progressPercent}%`;

        // 5. Active tabs description
        if (activeTabDescEl) {
            const tabsCount = appState.state.tabs.length;
            activeTabDescEl.textContent = `${tabsCount} tab sedang aktif berjalan.`;
        }
    };

    // Update Profile Information
    const updateProfile = () => {
        const isLoggedIn = appState.state.isLoggedIn;
        const profile = appState.state.adminProfile;

        if (isLoggedIn && profile) {
            const fullName = profile.user_metadata?.full_name || 
                             profile.raw_user_meta_data?.full_name || 
                             profile.full_name || 
                             'Administrator';
            
            const avatarUrl = profile.user_metadata?.avatar_url || 
                              profile.user_metadata?.picture || 
                              profile.raw_user_meta_data?.avatar_url || 
                              profile.raw_user_meta_data?.picture || 
                              profile.avatar_url || 
                              '';

            if (welcomeNameEl) welcomeNameEl.textContent = `Halo, ${fullName}`;
            
            if (avatarUrl && avatarImgEl && avatarPlaceholderEl) {
                avatarImgEl.src = avatarUrl;
                avatarImgEl.style.display = 'block';
                avatarPlaceholderEl.style.display = 'none';
            } else if (avatarPlaceholderEl && avatarImgEl) {
                avatarImgEl.style.display = 'none';
                avatarPlaceholderEl.style.display = 'flex';
                avatarPlaceholderEl.textContent = fullName.charAt(0).toUpperCase();
            }

            // Sync Connected Badge
            if (syncStatusEl) {
                syncStatusEl.className = 'dashboard-badge-status connected';
                const statusSpan = syncStatusEl.querySelector('span');
                if (statusSpan) statusSpan.textContent = 'Cloud Connected';
                const statusIcon = syncStatusEl.querySelector('i-ui');
                if (statusIcon) statusIcon.setAttribute('name', 'check-done-01');
            }
        } else {
            // Guest Mode
            if (welcomeNameEl) welcomeNameEl.textContent = 'Selamat Datang, Guest';
            if (avatarImgEl && avatarPlaceholderEl) {
                avatarImgEl.style.display = 'none';
                avatarPlaceholderEl.style.display = 'flex';
                avatarPlaceholderEl.textContent = 'G';
            }
            if (syncStatusEl) {
                syncStatusEl.className = 'dashboard-badge-status';
                const statusSpan = syncStatusEl.querySelector('span');
                if (statusSpan) statusSpan.textContent = 'Guest Mode';
                const statusIcon = syncStatusEl.querySelector('i-ui');
                if (statusIcon) statusIcon.setAttribute('name', 'alert-circle');
            }
        }
    };

    // Bind shortcuts clicks
    const bindShortcuts = () => {
        const container = document.getElementById('dashboard-view');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.shortcut-item');
            if (!btn) return;

            const targetTab = btn.getAttribute('data-shortcut');
            if (targetTab === 'settings') {
                document.getElementById('btn-settings')?.click();
                return;
            }

            // Redirect to appropriate tab
            const existingTab = appState.state.tabs.find(t => t.mode === targetTab);
            if (existingTab) {
                appState.switchTab(existingTab.id);
            } else {
                appState.createNewTab(targetTab);
            }
        });
    };

    // Register State Subscriptions for Realtime updates
    appState.subscribe('history', () => updateStats());
    appState.subscribe('isLoggedIn', () => {
        updateProfile();
        updateStats();
    });
    appState.subscribe('adminProfile', () => {
        updateProfile();
        updateStats();
    });
    appState.subscribe('settings', () => updateStats());

    // Init Calls
    updateStats();
    updateProfile();
    bindShortcuts();
}
