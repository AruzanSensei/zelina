document.addEventListener('DOMContentLoaded', () => {

  // ── Year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObs.observe(el));

  // ── Hamburger (mobile)
  const ham = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (ham && navLinks) {
    ham.addEventListener('click', () => {
      const open = navLinks.style.display === 'flex';
      navLinks.style.display = open ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '16px';
      navLinks.style.right = '16px';
      navLinks.style.background = 'rgba(253,251,247,0.97)';
      navLinks.style.backdropFilter = 'blur(20px)';
      navLinks.style.border = '1px solid var(--border-solid)';
      navLinks.style.borderRadius = '16px';
      navLinks.style.padding = '12px';
      navLinks.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
      if (open) navLinks.style.display = 'none';
    });
  }

  // ── Navbar shadow on scroll
  const navIsland = document.querySelector('.nav-island');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navIsland.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)';
    } else {
      navIsland.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
    }
  }, { passive: true });

});
