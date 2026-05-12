// ============================================================
// components/sidebar.js — Admin sidebar (injected via JS)
// Requires: auth.js loaded before this file
// ============================================================

const SIDEBAR_MENU = [
  { id: 'dashboard',  label: 'Dashboard',       href: 'index.html',     icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>` },
  { id: 'products',   label: 'Products',         href: 'products.html',  icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="16" height="14" rx="1.5"/><path d="M6 4V3a2 2 0 0 1 4 0v1"/></svg>` },
  { id: 'qrcodes',    label: 'QR Codes',         href: 'qrcodes.html',   icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="12" y="2" width="6" height="6" rx="1"/><rect x="2" y="12" width="6" height="6" rx="1"/><path d="M12 14h2m2 0h2M14 12v2m0 2v2"/></svg>` },
  { id: 'analytics',  label: 'Scan Analytics',   href: 'analytics.html', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 14l4-4 4 3 4-5 4 2"/><path d="M2 18h16"/></svg>` },
  { id: 'media',      label: 'Media',            href: 'media.html',     icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="16" height="13" rx="1.5"/><circle cx="7" cy="9" r="1.5"/><path d="M2 14l4-4 4 4 2-2 4 4"/></svg>` },
];

const SIDEBAR_BOTTOM = [
  { id: 'settings', label: 'Settings', href: 'settings.html', icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>` },
];

function renderSidebar(activePage) {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;

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
      <div class="sidebar__logout" id="sidebar-logout">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18">
          <path d="M13 15l4-5-4-5M17 10H7"/>
          <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3"/>
        </svg>
        <span>Logout</span>
      </div>
    </div>
  `;

  // Logout handler
  document.getElementById('sidebar-logout').addEventListener('click', () => {
    if (typeof logout === 'function') logout();
  });

  // Mobile hamburger toggle
  const ham = document.getElementById('ham-btn');
  if (ham) {
    ham.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 5h16M2 10h16M2 15h16" stroke-linecap="round"/></svg>`;
    ham.addEventListener('click', () => sidebarEl.classList.toggle('open'));
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', e => {
    if (sidebarEl.classList.contains('open') &&
        !sidebarEl.contains(e.target) &&
        e.target !== ham) {
      sidebarEl.classList.remove('open');
    }
  });
}
