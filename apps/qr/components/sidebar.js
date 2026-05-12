// ============================================================
// components/sidebar.js — Admin sidebar (injected via JS)
// Requires: auth.js loaded before this file
// ============================================================

const SIDEBAR_MENU = [
  { id: 'dashboard', label: 'Dashboard', href: 'index.html', icon: `<i data-lucide="layout-grid"></i>` },
  { id: 'products', label: 'Products', href: 'products.html', icon: `<i data-lucide="package-search"></i>` },
  { id: 'qrcodes', label: 'QR Codes', href: 'qrcodes.html', icon: `<i data-lucide="qr-code"></i>` },
  { id: 'analytics', label: 'Scan Analytics', href: 'analytics.html', icon: `<i data-lucide="chart-no-axes-combined"></i>` },
  { id: 'media', label: 'Media', href: 'media.html', icon: `<i data-lucide="image"></i>` },
];

const SIDEBAR_BOTTOM = [
  { id: 'settings', label: 'Settings', href: 'settings.html', icon: `<i data-lucide="settings"></i>` },
];

function renderSidebar(activePage) {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;
  sidebarEl.classList.add('sidebar');

  // If already rendered, just update active states to prevent logo refresh
  if (sidebarEl.querySelector('.sidebar__nav')) {
    sidebarEl.querySelectorAll('.sidebar__item').forEach(el => {
      const href = el.getAttribute('href');
      if (SIDEBAR_MENU.find(m => m.id === activePage && m.href === href) ||
        SIDEBAR_BOTTOM.find(m => m.id === activePage && m.href === href)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    
    // Ensure Lucide icons in the newly injected page content are transformed
    if (window.lucide) lucide.createIcons();
    return;
  }

  const menuHtml = SIDEBAR_MENU.map(item => `
    <a href="${item.href}" class="sidebar__item${activePage === item.id ? ' active' : ''}">
      ${item.icon}
      <span>${item.label}</span>
    </a>
  `).join('');

  const bottomHtml = SIDEBAR_BOTTOM.map(item => `
    <a href="${item.href}" class="sidebar__item${activePage === item.id ? ' active' : ''}">
      ${item.icon}
      <span>${item.label}</span>
    </a>
  `).join('');

  // Extract user info from topbar if it exists to mirror it in sidebar
  let userEmail = '—';
  let userAvatar = '?';
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl) userEmail = emailEl.textContent;
  if (avatarEl) userAvatar = avatarEl.textContent;

  sidebarEl.innerHTML = `
    <div class="sidebar__logo">
      <img src="../assets/ets-logo.png" alt="ETS">
    </div>
    <nav class="sidebar__nav">
      ${menuHtml}
      <div class="sidebar__divider"></div>
      ${bottomHtml}
    </nav>
    <div class="sidebar__footer">
      <div class="sidebar__user" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin: 0 12px 8px; background: rgba(255,255,255,0.04); border-radius: 8px;">
        <div class="sidebar__avatar" id="user-avatar" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem;">${userAvatar}</div>
        <span id="user-email" style="font-size: .85rem; font-weight: 500; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userEmail}</span>
      </div>
      <div class="sidebar__logout" id="sidebar-logout">
        <i data-lucide="log-out"></i>
        <span>Logout</span>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Logout handler
  document.getElementById('sidebar-logout').addEventListener('click', () => {
    if (typeof logout === 'function') logout();
  });

  // Mobile hamburger toggle
  const ham = document.getElementById('ham-btn');
  if (ham) {
    if (!ham.innerHTML.includes('lucide')) {
      ham.innerHTML = `<i data-lucide="menu"></i>`;
      if (window.lucide) lucide.createIcons({ root: ham });
    }
    // Use onclick to prevent duplicate listeners from SPA navigation, and stop propagation to prevent global click from instantly closing it
    ham.onclick = (e) => {
      e.stopPropagation();
      sidebarEl.classList.toggle('open');
    };
  }
}

// Global outside click handler (added only once)
document.addEventListener('click', e => {
  const sidebarEl = document.getElementById('sidebar');
  const ham = document.getElementById('ham-btn');
  if (sidebarEl && sidebarEl.classList.contains('open') &&
    !sidebarEl.contains(e.target) &&
    ham && !ham.contains(e.target)) {
    sidebarEl.classList.remove('open');
  }
});

// PJAX Navigation logic
window.navigateTo = async (url, forceRefresh = false) => {
  if (!forceRefresh && url === window.location.pathname.split('/').pop()) {
    // If already on the same page on mobile, just close the sidebar
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) sidebarEl.classList.remove('open');
    return;
  }

  if (forceRefresh && typeof clearApiCache === 'function') {
    clearApiCache();
  }

  // Visual feedback for sidebar
  document.querySelectorAll('.sidebar__item').forEach(el => el.classList.remove('active'));
  const activeLink = Array.from(document.querySelectorAll('a.sidebar__item')).find(a => a.getAttribute('href') === url);
  if (activeLink) activeLink.classList.add('active');

  try {
    const html = await fetch(url).then(r => {
      if (!r.ok) throw new Error('Fetch failed');
      return r.text();
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Replace the main application content without reloading the browser
    const currentMain = document.querySelector('.admin-main');
    const newMain = doc.querySelector('.admin-main');
    if (currentMain && newMain) {

      // Preserve topbar user info to prevent the "—" flash
      const oldEmail = currentMain.querySelector('#user-email');
      const newEmail = newMain.querySelector('#user-email');
      if (oldEmail && newEmail && oldEmail.textContent !== '—') {
        newEmail.textContent = oldEmail.textContent;
      }

      const oldAvatar = currentMain.querySelector('#user-avatar');
      const newAvatar = newMain.querySelector('#user-avatar');
      if (oldAvatar && newAvatar && oldAvatar.textContent !== '?') {
        newAvatar.textContent = oldAvatar.textContent;
      }

      currentMain.innerHTML = newMain.innerHTML;
      document.title = doc.title;
      history.pushState(null, '', url);

      // Close sidebar if open on mobile
      const sidebarEl = document.getElementById('sidebar');
      if (sidebarEl) sidebarEl.classList.remove('open');
      window.scrollTo(0, 0);

      injectRefreshBtn(); // Re-inject refresh button since topbar was replaced

      // Execute page-specific script — wait for it to fully load before calling init
      const pageScript = Array.from(doc.querySelectorAll('script')).find(s => s.src.includes('/scripts/admin/'));
      if (pageScript) {
        const s = document.createElement('script');
        s.src = pageScript.src + '?t=' + Date.now(); // force re-evaluate
        document.body.appendChild(s);
      }
    } else {
      window.location.href = url;
    }
  } catch (err) {
    window.location.href = url;
  }
};

// Intercept sidebar link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a.sidebar__item');
  if (!link) return;

  const url = link.getAttribute('href');
  if (!url || url.startsWith('http') || url.startsWith('#')) return;

  e.preventDefault();
  window.navigateTo(url);
});

// Inject Refresh button to Topbar
function injectRefreshBtn() {
  const topbarUser = document.querySelector('.topbar__user');
  if (topbarUser && !document.getElementById('topbar-refresh')) {
    const btn = document.createElement('button');
    btn.id = 'topbar-refresh';
    btn.className = 'btn btn-outline btn-sm';
    btn.style.marginRight = '12px';
    btn.style.padding = '6px 10px';
    btn.style.border = '1px solid var(--border-md)';
    btn.style.background = 'transparent';
    btn.style.color = 'var(--text-sub)';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '6px';
    btn.style.borderRadius = 'var(--r-sm)';
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg> <span style="font-size:0.75rem;font-weight:600;">Refresh</span>`;

    // Hover effects using standard JS instead of messy inline CSS
    btn.onmouseover = () => btn.style.background = 'var(--gray-100)';
    btn.onmouseout = () => btn.style.background = 'transparent';

    btn.onclick = () => {
      const icon = btn.querySelector('svg');
      if (icon) icon.style.animation = 'spin 1s linear infinite';
      btn.style.pointerEvents = 'none';
      btn.querySelector('span').innerText = 'Memuat...';
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      window.navigateTo(currentFile, true);
    };

    // Add spin animation to document if not exists
    if (!document.getElementById('spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spin-keyframes';
      style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    topbarUser.parentNode.insertBefore(btn, topbarUser);
  }
}

// Initial injection
document.addEventListener('DOMContentLoaded', injectRefreshBtn);
// Call it immediately just in case DOM is already loaded
injectRefreshBtn();

// Handle browser Back/Forward buttons gracefully
window.addEventListener('popstate', () => window.location.reload());
