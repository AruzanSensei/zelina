/* =====================================================
   settings.js — User preference management
   Phase 1
   ===================================================== */
import storage from './storage.js';

const settings = (() => {
  let _cache = {};

  /* ── Load all settings into memory cache ─────────── */
  async function load() {
    _cache = await storage.getAllSettings();
    applyTheme(_cache.theme || 'light');
    applyFontSize(_cache.fontSize || 14);
    applySidebarWidth(_cache.sidebarWidth || 240);
    return _cache;
  }

  /* ── Get ─────────────────────────────────────────── */
  function get(key, fallback = null) {
    return key in _cache ? _cache[key] : fallback;
  }

  /* ── Set & persist ───────────────────────────────── */
  async function set(key, value) {
    _cache[key] = value;
    await storage.saveSetting(key, value);

    // Side effects
    if (key === 'theme')        applyTheme(value);
    if (key === 'fontSize')     applyFontSize(value);
    if (key === 'sidebarWidth') applySidebarWidth(value);
    if (key === 'compactMode')  applyCompactMode(value);
  }

  /* ── Theme ───────────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.innerHTML = theme === 'dark'
        ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
    }
  }

  function toggleTheme() {
    const current = _cache.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    set('theme', next);
    return next;
  }

  /* ── Font size ───────────────────────────────────── */
  function applyFontSize(size) {
    document.documentElement.style.fontSize = `${size}px`;
    const display = document.getElementById('font-size-display');
    if (display) display.textContent = `${size}px`;
    const slider = document.getElementById('font-size-slider');
    if (slider) slider.value = size;
  }

  /* ── Sidebar width ───────────────────────────────── */
  function applySidebarWidth(width) {
    document.documentElement.style.setProperty('--sidebar-w', `${width}px`);
    const display = document.getElementById('sidebar-width-display');
    if (display) display.textContent = `${width}px`;
    const slider = document.getElementById('sidebar-width-slider');
    if (slider) slider.value = width;
  }

  /* ── Compact mode ────────────────────────────────── */
  function applyCompactMode(on) {
    document.documentElement.classList.toggle('compact', on);
  }

  /* ── Public ──────────────────────────────────────── */
  return { load, get, set, toggleTheme, applyTheme };
})();

export default settings;
