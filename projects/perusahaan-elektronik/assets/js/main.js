/* ================================================
   POWERCO - Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- Navbar scroll behavior ----
  const navbar = document.querySelector('.navbar');
  const isHome = navbar && navbar.classList.contains('transparent');

  function handleNavScroll() {
    if (!navbar) return;
    if (isHome) {
      if (window.scrollY > 60) {
        navbar.classList.remove('transparent');
        navbar.classList.add('solid');
      } else {
        navbar.classList.remove('solid');
        navbar.classList.add('transparent');
      }
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ---- Mobile menu ----
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- WhatsApp float + IntersectionObserver ----
  const waFloat = document.querySelector('.wa-float');
  const hero = document.querySelector('.hero');
  if (waFloat) {
    if (hero) {
      const obs = new IntersectionObserver(([entry]) => {
        waFloat.classList.toggle('visible', !entry.isIntersecting);
      }, { threshold: 0.1 });
      obs.observe(hero);
    } else {
      waFloat.classList.add('visible');
    }
    // Periodic bounce
    setInterval(() => {
      waFloat.classList.add('bounce');
      setTimeout(() => waFloat.classList.remove('bounce'), 5000);
    }, 5000);
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // ---- Filter drawer (mobile) ----
  const drawerTrigger = document.querySelector('.sidebar-mobile-trigger');
  const filterDrawer = document.querySelector('.filter-drawer');
  const filterOverlay = document.querySelector('.filter-overlay');
  const drawerClose = document.querySelector('.drawer-close-btn');

  function openDrawer() {
    filterDrawer && filterDrawer.classList.add('open');
    filterOverlay && filterOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    filterDrawer && filterDrawer.classList.remove('open');
    filterOverlay && filterOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  drawerTrigger && drawerTrigger.addEventListener('click', openDrawer);
  filterOverlay && filterOverlay.addEventListener('click', closeDrawer);
  drawerClose && drawerClose.addEventListener('click', closeDrawer);

  // ---- Product detail tabs ----
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = document.getElementById('tab-' + target);
      if (content) content.classList.add('active');
    });
  });

  // ---- Contact form (prevent default) ----
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Permintaan Terkirim!';
        btn.style.background = '#00C851';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Kirim Permintaan';
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });
  }

  // ---- Lazy load hero video ----
  window.addEventListener('load', () => {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
      const src = heroVideo.dataset.src;
      if (src) heroVideo.src = src;
    }
  });

  // ---- Filter toggle in sidebar ----
  const filterTitles = document.querySelectorAll('.filter-title[data-toggle]');
  filterTitles.forEach(title => {
    title.addEventListener('click', () => {
      const body = title.nextElementSibling;
      const icon = title.querySelector('i');
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : '';
      if (icon) icon.style.transform = isOpen ? 'rotate(-90deg)' : '';
    });
  });

  // ---- Active nav link ----
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
