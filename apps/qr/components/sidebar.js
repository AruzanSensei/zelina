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
    <div class="sidebar__logo" style="display:flex; flex-direction:column; align-items:flex-start; gap:6px;">
      <img src="../assets/ets-logo.png" alt="ETS" style="height:32px;">
      <span style="font-size: 0.55rem; color: rgba(255,255,255,0.4); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2;">Protecting & improving<br>Electricity</span>
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

      reinitTopbar(); // Re-init ham-btn + Refresh button since topbar was replaced

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

// ── Reinit entire topbar after SPA navigation ─────────────
function reinitTopbar() {
  const sidebarEl = document.getElementById('sidebar');

  // 1. Re-attach hamburger icon + handler
  const ham = document.getElementById('ham-btn');
  if (ham) {
    ham.innerHTML = `<i data-lucide="menu"></i>`;
    if (window.lucide) lucide.createIcons({ nodes: [ham] });
    ham.onclick = (e) => {
      e.stopPropagation();
      if (sidebarEl) sidebarEl.classList.toggle('open');
    };
  }

  // 2. Inject page title from .page-header h1 into topbar
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    // Remove old injected title if exists
    const oldTitle = topbar.querySelector('#topbar-page-title');
    if (oldTitle) oldTitle.remove();

    const pageH1 = document.querySelector('.page-header h1');
    if (pageH1) {
      const titleEl = document.createElement('span');
      titleEl.id = 'topbar-page-title';
      titleEl.textContent = pageH1.textContent;
      titleEl.style.cssText = 'font-size: 1.3rem; font-weight: 800; color: var(--green); letter-spacing: -.01em;';
      // Insert after ham-btn (first child)
      const firstChild = topbar.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        topbar.insertBefore(titleEl, firstChild.nextSibling);
      } else {
        topbar.appendChild(titleEl);
      }
    }

    // 3. Re-inject Refresh button if not already present
    if (!topbar.querySelector('#topbar-refresh')) {
      const btn = document.createElement('button');
      btn.id = 'topbar-refresh';
      btn.title = 'Refresh';
      btn.style.cssText = 'display:flex; align-items:center; gap:6px; padding:6px 12px; border:1px solid var(--border-md); border-radius:8px; box-shadow:var(--shadow-sm); background:var(--bg-card); color:var(--text-main); cursor:pointer; font-size:.8rem; font-weight:500;';
      btn.innerHTML = `<i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Refresh`;
      if (window.lucide) lucide.createIcons({ nodes: [btn] });
      btn.onclick = () => {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        window.navigateTo(currentFile, true);
      };
      topbar.appendChild(btn);
    }
  }
}

// Initial injection
document.addEventListener('DOMContentLoaded', reinitTopbar);
reinitTopbar();

// Handle browser Back/Forward buttons gracefully
window.addEventListener('popstate', () => window.location.reload());
