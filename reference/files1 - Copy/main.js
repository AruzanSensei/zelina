/* ========================
   NAVBAR SCROLL
   ======================== */
(function() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ========================
   MOBILE MENU
   ======================== */
(function() {
  const btn = document.querySelector('.nav-hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ========================
   SMOOTH SCROLL
   ======================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = document.getElementById('navbar').offsetHeight;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

/* ========================
   REVEAL ON SCROLL
   ======================== */
(function() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), (i % 5) * 70);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ========================
   PROJECT FILTER TABS
   ======================== */
(function() {
  const tabs = document.querySelectorAll('.ftab');
  const cards = document.querySelectorAll('.proj-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });
})();

/* ========================
   FAQ ACCORDION
   ======================== */
(function() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      if (!isOpen) { item.classList.add('open'); item.querySelector('.faq-q').setAttribute('aria-expanded', 'true'); }
    });
  });
})();

/* ========================
   CONTACT FORM
   ======================== */
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const rules = {
    name:    { el: form.querySelector('#name'),    err: form.querySelector('#nameError'),    fn: v => v.trim().length > 1 ? '' : 'Please enter your name.' },
    email:   { el: form.querySelector('#email'),   err: form.querySelector('#emailError'),   fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.' },
    service: { el: form.querySelector('#service'), err: form.querySelector('#serviceError'), fn: v => v ? '' : 'Please select a service.' },
    message: { el: form.querySelector('#message'), err: form.querySelector('#messageError'), fn: v => v.trim().length >= 10 ? '' : 'Minimum 10 characters.' }
  };

  Object.values(rules).forEach(r => {
    if (!r.el) return;
    r.el.addEventListener('blur', () => { const m = r.fn(r.el.value); r.err.textContent = m; r.el.classList.toggle('error', !!m); });
    r.el.addEventListener('input', () => { if (r.el.classList.contains('error')) { const m = r.fn(r.el.value); r.err.textContent = m; r.el.classList.toggle('error', !!m); } });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.values(rules).forEach(r => {
      if (!r.el) return;
      const m = r.fn(r.el.value);
      r.err.textContent = m;
      r.el.classList.toggle('error', !!m);
      if (m) ok = false;
    });
    if (!ok) return;

    const btn = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');
    btn.classList.add('loading'); btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove('loading'); btn.disabled = false;
      success.classList.add('show');
      form.reset();
      Object.values(rules).forEach(r => r.el && r.el.classList.remove('error'));
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1600);
  });
})();

/* ========================
   TOAST
   ======================== */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}
