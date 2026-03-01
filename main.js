/* ========================
   NAVBAR SCROLL STATE
   ======================== */
(function () {
  const nav = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 24);
    lastY = y;
  }, { passive: true });
})();

/* ========================
   ACTIVE NAV LINK
   ======================== */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const offset = 80;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === '#' + id) l.classList.add('active');
        });
      }
    });
  }, { rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 });

  sections.forEach(s => io.observe(s));
})();

/* ========================
   MOBILE MENU
   ======================== */
(function () {
  const btn = document.querySelector('.nav-hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ========================
   SMOOTH SCROLL
   ======================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ========================
   REVEAL ON SCROLL
   ======================== */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in the same grid/flex parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (idx % 6) * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ========================
   PROJECT FILTER TABS
   ======================== */
(function () {
  const tabs = document.querySelectorAll('.ftab');
  const cards = document.querySelectorAll('.proj-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      cards.forEach((card, i) => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          setTimeout(() => {
            card.classList.remove('visible');
            void card.offsetWidth; // reflow
            card.classList.add('visible');
          }, i * 60);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ========================
   FAQ ACCORDION
   ======================== */
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ========================
   CONTACT FORM VALIDATION
   ======================== */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const rules = {
    name: { fn: v => v.trim().length > 1 ? '' : 'Harap masukkan nama lengkap Anda.' },
    email: { fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Harap masukkan alamat email yang valid.' },
    service: { fn: v => v ? '' : 'Harap pilih layanan.' },
    message: { fn: v => v.trim().length >= 10 ? '' : 'Pesan harus minimal 10 karakter.' }
  };

  function getField(id) {
    return {
      el: form.querySelector('#' + id),
      err: form.querySelector('#' + id + 'Error')
    };
  }

  Object.entries(rules).forEach(([id, rule]) => {
    const { el, err } = getField(id);
    if (!el) return;

    el.addEventListener('blur', () => {
      const msg = rule.fn(el.value);
      if (err) err.textContent = msg;
      el.classList.toggle('error', !!msg);
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const msg = rule.fn(el.value);
        if (err) err.textContent = msg;
        el.classList.toggle('error', !!msg);
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    Object.entries(rules).forEach(([id, rule]) => {
      const { el, err } = getField(id);
      if (!el) return;
      const msg = rule.fn(el.value);
      if (err) err.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    const btn = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');

    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      success.classList.add('show');
      form.reset();
      Object.keys(rules).forEach(id => {
        const { el } = getField(id);
        el?.classList.remove('error');
      });
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1800);
  });
})();

/* ========================
   COPY TO CLIPBOARD (contact cards)
   ======================== */
function copyToClipboard(text, el) {
  if (!navigator.clipboard) {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Tersalin: ' + text);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast('Tersalin: ' + text);
    if (el) {
      const hint = el.querySelector('.cic-hint');
      if (hint) {
        const prev = hint.textContent;
        hint.textContent = 'Tersalin!';
        setTimeout(() => { hint.textContent = prev; }, 1500);
      }
    }
  });
}

/* ========================
   TECH STRIP (clone for seamless loop)
   ======================== */
(function () {
  const strip = document.getElementById('techStrip');
  if (!strip) return;
  // Already has duplicates in HTML, just ensure smooth loop
  strip.addEventListener('animationend', () => {
    strip.style.transform = 'translateX(0)';
  });
})();

/* ========================
   TOAST NOTIFICATION
   ======================== */
let toastTimer;
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ========================
   WHATSAPP BUTTON — pulse attention after delay
   ======================== */
(function () {
  const wa = document.querySelector('.wa-btn');
  if (!wa) return;

  // After 5s show an extra attention "bounce" if user hasn't interacted
  setTimeout(() => {
    wa.classList.add('wa-attention');
    setTimeout(() => wa.classList.remove('wa-attention'), 800);
  }, 5000);
})();

/* ========================
   SCROLL PROGRESS INDICATOR (subtle top bar)
   ======================== */
(function () {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; z-index: 9999;
    background: linear-gradient(90deg, #8B5CF6, #FB923C);
    width: 0%; transition: width 0.1s linear; pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();
