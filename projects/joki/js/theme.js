// Theme Management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    if (darkModeToggle) {
      darkModeToggle.checked = this.theme === 'dark';
      darkModeToggle.addEventListener('change', (e) => {
        this.setTheme(e.target.checked ? 'dark' : 'light');
      });
    }
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.theme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Update settings toggle if exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.checked = theme === 'dark';
    }
  }

  applyTheme(theme) {
    // Add transitioning class to prevent flash
    document.body.classList.add('theme-transitioning');
    
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Update theme toggle icon
    this.updateThemeIcon(theme);

    // Remove transitioning class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = theme === 'dark' 
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>`;

    themeToggle.innerHTML = icon;
  }
}

// Initialize theme manager when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}
