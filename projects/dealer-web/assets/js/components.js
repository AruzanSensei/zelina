/* ============================================================
   SHARED COMPONENTS – navbar & footer injected by each page
   ============================================================ */

function getNavbar(activePage) {
  const pages = {
    tentang: 'tentang.html',
    produk: 'produk.html',
    dokumentasi: 'dokumentasi.html',
    kontak: 'kontak.html',
  };
  return `
  <nav class="navbar">
    <div class="container">
      <div class="navbar-inner">
        <a href="index.html" class="nav-logo">
          <div class="nav-logo-icon">M</div>
          MOTO<span>PRIMA</span>
        </a>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="tentang.html" class="nav-link ${activePage==='tentang'?'active':''}">Tentang Kami</a>
          </li>
          <li class="nav-item">
            <a href="produk.html" class="nav-link ${activePage==='produk'?'active':''}">
              Produk <span>▾</span>
            </a>
            <div class="dropdown-menu">
              <a href="produk.html#sedan" class="dropdown-item"><span class="dropdown-item-icon">🚗</span>Sedan</a>
              <a href="produk.html#suv" class="dropdown-item"><span class="dropdown-item-icon">🚙</span>SUV</a>
              <a href="produk.html#mpv" class="dropdown-item"><span class="dropdown-item-icon">🚐</span>MPV</a>
              <a href="produk.html#hatchback" class="dropdown-item"><span class="dropdown-item-icon">🚘</span>Hatchback</a>
              <a href="produk.html#pickup" class="dropdown-item"><span class="dropdown-item-icon">🛻</span>Pickup</a>
              <a href="produk.html#ev" class="dropdown-item"><span class="dropdown-item-icon">⚡</span>Electric Vehicle</a>
            </div>
          </li>
          <li class="nav-item">
            <a href="dokumentasi.html" class="nav-link ${activePage==='dokumentasi'?'active':''}">Dokumentasi</a>
          </li>
          <li class="nav-item">
            <a href="kontak.html" class="nav-link ${activePage==='kontak'?'active':''}">Kontak</a>
          </li>
        </ul>
        <div class="hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <a href="tentang.html" class="mobile-nav-link">Tentang Kami</a>
    <div>
      <a href="produk.html" class="mobile-nav-link">Produk</a>
      <div class="mobile-dropdown">
        <a href="produk.html#sedan" class="mobile-dropdown-item">🚗 Sedan</a>
        <a href="produk.html#suv" class="mobile-dropdown-item">🚙 SUV</a>
        <a href="produk.html#mpv" class="mobile-dropdown-item">🚐 MPV</a>
        <a href="produk.html#hatchback" class="mobile-dropdown-item">🚘 Hatchback</a>
        <a href="produk.html#pickup" class="mobile-dropdown-item">🛻 Pickup</a>
        <a href="produk.html#ev" class="mobile-dropdown-item">⚡ Electric Vehicle</a>
      </div>
    </div>
    <a href="dokumentasi.html" class="mobile-nav-link">Dokumentasi</a>
    <a href="kontak.html" class="mobile-nav-link">Kontak</a>
  </div>`;
}

function getFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">MOTO<span>PRIMA</span> — Dealer Resmi Terpercaya</div>
        <div>© ${new Date().getFullYear()} MotoPrima. All rights reserved.</div>
      </div>
    </div>
  </footer>
  <a href="https://wa.me/6281234567890?text=Halo%20MotoPrima%2C%20saya%20ingin%20konsultasi%20mobil" class="wa-float" target="_blank" rel="noopener">
    <span class="wa-float-icon">💬</span>
    <span class="wa-float-text">Konsultasi</span>
  </a>`;
}

// Auto-inject if elements exist
document.addEventListener('DOMContentLoaded', () => {
  const navEl = document.getElementById('navbar-placeholder');
  const footEl = document.getElementById('footer-placeholder');
  if (navEl) navEl.innerHTML = getNavbar(navEl.dataset.page || '');
  if (footEl) footEl.innerHTML = getFooter();
});
