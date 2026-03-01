/* ============================================
   KANTOR HUKUM - Main JavaScript
   ============================================ */

// ============================================
// NAVBAR: Scroll behavior & Hamburger
// ============================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  // Close on mobile nav link click
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// HERO VIDEO: Lazy load after page fully loaded
// ============================================
window.addEventListener('load', () => {
  const heroVideo = document.querySelector('.hero-bg video');
  if (heroVideo) {
    const sources = heroVideo.querySelectorAll('source[data-src]');
    sources.forEach(source => {
      source.src = source.getAttribute('data-src');
      source.removeAttribute('data-src');
    });
    heroVideo.load();
    heroVideo.play().catch(() => {
      // Autoplay failed, that's fine
    });
  }
});

// ============================================
// FLOATING WHATSAPP: IntersectionObserver
// ============================================
const waFloat = document.querySelector('.wa-float');
const heroSection = document.querySelector('.hero');

if (waFloat && heroSection) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        waFloat.classList.remove('visible');
      } else {
        waFloat.classList.add('visible');
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(heroSection);
} else if (waFloat) {
  // On inner pages without hero, always show
  waFloat.classList.add('visible');
}

// ============================================
// ACCORDION
// ============================================
function initAccordion(containerSelector) {
  const accordionItems = document.querySelectorAll(`${containerSelector} .accordion-item`);
  if (!accordionItems.length) return;

  accordionItems.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      accordionItems.forEach(i => {
        i.classList.remove('active');
        const b = i.querySelector('.accordion-body');
        if (b) b.style.maxHeight = null;
      });

      // Open clicked if not already active
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // Open first by default
  const first = accordionItems[0];
  if (first) {
    first.classList.add('active');
    const firstBody = first.querySelector('.accordion-body');
    if (firstBody) firstBody.style.maxHeight = firstBody.scrollHeight + 'px';
  }
}

initAccordion('.accordion-wrapper');
initAccordion('.kabinet-accordion');

// ============================================
// SCROLL ANIMATION
// ============================================
const animatedEls = document.querySelectorAll('[data-animate]');

if ('IntersectionObserver' in window && animatedEls.length) {
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, Number(delay));
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedEls.forEach(el => animObserver.observe(el));
}

// ============================================
// LAZY LOAD IMAGES
// ============================================
const lazyImages = document.querySelectorAll('img[data-src]');

if ('IntersectionObserver' in window && lazyImages.length) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imgObserver.observe(img));
}

// ============================================
// SMOOTH SCROLL for anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================
// ACTIVE NAV LINK
// ============================================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && (href === currentPage || 
    (currentPage === '' && href === 'index.html') ||
    (currentPage === 'index.html' && href === 'index.html'))) {
    link.classList.add('active');
  }
});
