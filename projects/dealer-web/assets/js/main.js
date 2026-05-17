/* ============================================================
   DEALER MOBIL – MAIN JS
   ============================================================ */

/* ---- NAVBAR ---- */
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-nav-link, .mobile-dropdown-item').forEach(el => {
  el.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Mobile dropdown toggle
document.querySelectorAll('.mobile-nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) target.style.display = target.style.display === 'flex' ? 'none' : 'flex';
  });
});

/* ---- HERO SLIDESHOW ---- */
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');

if (slides.length > 0) {
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startTimer() {
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });

  slides[0].classList.add('active');
  if (dots[0]) dots[0].classList.add('active');
  startTimer();
}

/* ---- ACCORDION ---- */
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const accordion = header.parentElement;
    const isOpen = accordion.classList.contains('open');
    // Close all
    document.querySelectorAll('.accordion').forEach(a => a.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) accordion.classList.add('open');
  });
});

/* ---- DOC FILTER ---- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.doc-item').forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* ---- LIGHTBOX ---- */
const lightbox = document.getElementById('lightbox');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxIcon = document.getElementById('lightbox-icon');

document.querySelectorAll('.doc-item').forEach(item => {
  item.addEventListener('click', () => {
    if (lightbox) {
      lightboxCaption.textContent = item.dataset.title || 'Dokumentasi';
      lightboxIcon.textContent = item.dataset.icon || '🖼️';
      lightbox.classList.add('open');
    }
  });
});

if (lightbox) {
  document.querySelector('.lightbox-close')?.addEventListener('click', () => {
    lightbox.classList.remove('open');
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
}

/* ---- SIMULASI KREDIT ---- */
const kredit = document.getElementById('kredit-form');
if (kredit) {
  function hitungKredit() {
    const harga = parseFloat(document.getElementById('k-harga')?.value) || 500000000;
    const dp = parseFloat(document.getElementById('k-dp')?.value) || 20;
    const tenor = parseInt(document.getElementById('k-tenor')?.value) || 36;
    const bunga = 0.065;
    const pinjaman = harga * (1 - dp / 100);
    const totalBunga = pinjaman * bunga * (tenor / 12);
    const cicilan = Math.round((pinjaman + totalBunga) / tenor);
    const result = document.getElementById('kredit-result-val');
    if (result) result.textContent = 'Rp ' + cicilan.toLocaleString('id-ID') + '/bulan';
  }
  kredit.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', hitungKredit);
  });
  hitungKredit();
}

/* ---- FORM SUBMIT ---- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = '✓ Pesan Terkirim!';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#22c55e';
    setTimeout(() => {
      btn.textContent = 'Kirim Pesan';
      btn.style.background = '';
      btn.style.borderColor = '';
      contactForm.reset();
    }, 3000);
  });
}

/* ---- LAZY LOAD ---- */
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[data-src]');
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => imgObserver.observe(img));
}

/* ---- ANIMATE ON SCROLL (simple) ---- */
if ('IntersectionObserver' in window) {
  const animEls = document.querySelectorAll('.stat-card, .product-card, .testi-card, .visi-card, .cabang-card, .legal-card');
  animEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  });
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animEls.forEach(el => animObserver.observe(el));
}
