/* ============================================
   ALZAN ADYTIA JUNIAR — main.js v2
   ============================================ */

/* ============================================
   QR INTRO OVERLAY
   ============================================ */
(function () {
  const params = new URLSearchParams(window.location.search);
  const from = params.get('From') || params.get('from');
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  if (from === 'QROutfit') {
    overlay.innerHTML = `
      <div class="intro-card">
        <div class="intro-icon">👔</div>
        <div class="intro-title">Hei, Ketahuan Deh!</div>
        <div class="intro-sub">
          Klo kamu liat aku kaya ga kerja,<br>
          aku kerja kok — tapi sebagai<br>
          <strong>Web Developer &amp; Designer</strong>.<br><br>
          Penasaran sama project-project gw? Yuk intip! 👇
        </div>
        <button class="intro-btn" id="introCta">🚀 Lihat Portofolio</button>
      </div>`;
    document.getElementById('introCta').addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 600);
    });
  } else if (from === 'QRNameCard') {
    overlay.innerHTML = `
      <div class="intro-card">
        <div class="intro-icon">🪪</div>
        <div class="intro-title">Terima kasih sudah menscan kartu nama ini!</div>
        <div class="intro-sub">Berikut adalah portofolio saya. Semoga bermanfaat ✨</div>
      </div>`;
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 600);
    }, 2800);
  } else {
    overlay.style.display = 'none';
  }
})();


/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cur = document.getElementById('cur');
const trail = document.getElementById('cur-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function loop() {
  tx += (mx - tx) * .13; ty += (my - ty) * .13;
  trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
  requestAnimationFrame(loop);
})();

const hoverSel = 'a,button,.contact-item,.tech-item,.stat-card,.testi-card,.project-card,.pill,.social-btn,.tab-btn,.accordion-header';
document.querySelectorAll(hoverSel).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


/* ============================================
   NAVBAR
   ============================================ */
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobileMenu');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,.08)' : 'none';
  document.getElementById('btt').classList.toggle('show', window.scrollY > 400);
  highlightNav();
});

hamburger.addEventListener('click', () => {
  navbar.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    navbar.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

const allSections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

function highlightNav() {
  let cur = '';
  allSections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
  navLinkEls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}


/* ============================================
   COUNTER ANIMATION
   ============================================ */
let countersRan = false;
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersRan) {
    countersRan = true;
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = +el.dataset.target;
      let count = 0;
      const step = target / 40;
      const t = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count) + '+';
        if (count >= target) clearInterval(t);
      }, 40);
    });
  }
}, { threshold: .3 }).observe(document.querySelector('.stat-cards'));


/* ============================================
   SKILL BARS
   ============================================ */
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-bar-fill').forEach(b => b.style.width = b.dataset.pct + '%');
    }
  });
}, { threshold: .3 }).observe(document.querySelector('#about'));


/* ============================================
   SCROLL REVEAL
   ============================================ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('up'); revObs.unobserve(e.target); }
  });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));


/* ============================================
   PROJECT FILTER — FIXED
   ============================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('filtered-out');
      } else {
        card.classList.add('filtered-out');
      }
    });
  });
});


/* ============================================
   3D TILT
   ============================================ */
document.querySelectorAll('.project-card,.testi-card').forEach(card => {
  card.addEventListener('mousemove', function (e) {
    const r = this.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    this.style.transform = `translateY(-3px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
  });
});


/* ============================================
   ACCORDION (MOBILE)
   ============================================ */
document.querySelectorAll('.accordion-header').forEach(btn => {
  btn.addEventListener('click', function () {
    const body = this.nextElementSibling;
    const isOpen = !body.classList.contains('collapsed');
    body.classList.toggle('collapsed', isOpen);
    this.classList.toggle('open', !isOpen);
  });
});


/* ============================================
   CLIPBOARD & FORM
   ============================================ */
window.copyToClip = function (text, msg) {
  navigator.clipboard.writeText(text).then(() => showToast(msg));
};
window.handleSubmit = function (e) {
  e.preventDefault();
  const btn = document.getElementById('btnText');
  btn.textContent = '⏳ Sending...';
  setTimeout(() => {
    btn.textContent = '✅ Terkirim!';
    showToast('🎉 Pesan berhasil dikirim!');
    e.target.reset();
    setTimeout(() => { btn.textContent = '🚀 Kirim Pesan'; }, 3000);
  }, 1500);
};

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
window.showToast = showToast;


/* ============================================
   SECTION BACKGROUND ANIMATIONS
   Each section gets a canvas with unique animated elements
   ============================================ */

/* ---- HERO: rotating dashed circles ---- */
(function heroBg() {
  const canvas = document.getElementById('heroBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize); resize();

  const circles = [
    // bottom-right corner (1/4 visible)
    { cx: () => W, cy: () => H, r: 160, speed: .9, dash: [12, 10] },
    { cx: () => W, cy: () => H, r: 220, speed: -.9, dash: [6, 14] },
    // top-left floating
    { cx: () => 60, cy: () => 120, r: 90, speed: .9, dash: [8, 12] },
    { cx: () => 60, cy: () => 120, r: 130, speed: -.9, dash: [4, 16] },
    // mid-right loose
    { cx: () => W * .75, cy: () => H * .4, r: 55, speed: .9, dash: [5, 10] },
  ];

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    angle += .003;
    circles.forEach(c => {
      ctx.save();
      ctx.translate(c.cx(), c.cy());
      ctx.rotate(angle * c.speed);
      ctx.setLineDash(c.dash);
      ctx.strokeStyle = `rgba(193,127,90,0.2)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ---- ABOUT: wave-pulsing dots grid ---- */
(function aboutBg() {
  const canvas = document.getElementById('aboutBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const COLS = 14, ROWS = 9, SPACING = 70;
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const offX = (W - (COLS - 1) * SPACING) / 2;
    const offY = (H - (ROWS - 1) * SPACING) / 2;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = offX + c * SPACING;
        const y = offY + r * SPACING;
        // wave pattern: diagonal wave
        const wave = Math.sin(t + c * .5 + r * .8);
        const radius = 2.5 + wave * 2.2;
        const alpha = .06 + (wave + 1) * .05;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(193,127,90,${alpha})`;
        ctx.fill();
      }
    }
    t += .025;
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ---- PROJECTS: falling shooting stars ---- */
(function projectsBg() {
  const canvas = document.getElementById('projectsBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const COUNT = 14;
  const stars = Array.from({ length: COUNT }, () => makestar());
  function makestar() {
    return {
      x: Math.random() * (W + 200),
      y: Math.random() * H - H,
      len: 60 + Math.random() * 80,
      speed: .4 + Math.random() * .5,
      alpha: .08 + Math.random() * .1,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.x -= s.speed * .6;  // slight left drift
      s.y += s.speed;
      if (s.y > H + 20) Object.assign(s, makestar(), { y: -s.len, x: Math.random() * (W + 200) });

      const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len * .35, s.y - s.len);
      grad.addColorStop(0, `rgba(193,127,90,${s.alpha})`);
      grad.addColorStop(1, `rgba(193,127,90,0)`);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len * .35, s.y - s.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ---- CAREER: floating diagonal lines ---- */
(function careerBg() {
  const canvas = document.getElementById('careerBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const LINES = 18;
  const lines = Array.from({ length: LINES }, (_, i) => ({
    x: (W / LINES) * i,
    y: Math.random() * H,
    len: 40 + Math.random() * 60,
    speed: .25 + Math.random() * .25,
    alpha: .05 + Math.random() * .07,
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => {
      l.y -= l.speed;
      if (l.y + l.len < 0) { l.y = H + l.len; l.x = Math.random() * W; }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(-Math.PI / 6);
      const g = ctx.createLinearGradient(0, 0, 0, l.len);
      g.addColorStop(0, `rgba(139,94,60,0)`);
      g.addColorStop(1, `rgba(139,94,60,${l.alpha})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, l.len);
      ctx.stroke();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ---- TESTIMONIALS: thumbs up pop ---- */
(function testiBg() {
  const canvas = document.getElementById('testiBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const ITEMS = 9;
  function makethumb() {
    return {
      x: Math.random() * W,
      y: H + 20,
      size: 12 + Math.random() * 10,
      speed: .35 + Math.random() * .3,
      alpha: 0,
      phase: 'in', // in → hold → out
      life: 0,
      maxLife: 120 + Math.random() * 80,
    };
  }
  const thumbs = Array.from({ length: ITEMS }, () => {
    const t = makethumb();
    t.y = Math.random() * H; // stagger initial positions
    t.life = Math.random() * t.maxLife;
    return t;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    thumbs.forEach(th => {
      th.y -= th.speed;
      th.life++;
      const progress = th.life / th.maxLife;

      if (progress < .3) {
        th.alpha = progress / .3 * .18;
        th.phase = 'in';
      } else if (progress < .7) {
        th.alpha = .18;
        th.phase = 'hold';
      } else {
        th.alpha = (1 - (progress - .7) / .3) * .18;
        th.size += .08; // grow before fade
        th.phase = 'out';
      }

      if (th.life >= th.maxLife || th.y < -30) {
        Object.assign(th, makethumb());
      }

      ctx.font = `${th.size}px serif`;
      ctx.globalAlpha = th.alpha;
      ctx.fillText('👍', th.x, th.y);
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ---- CONTACT: sparkling stars ---- */
(function contactBg() {
  const canvas = document.getElementById('contactBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  const COUNT = 18;
  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: 8 + Math.random() * 8,
      life: 0,
      maxLife: 100 + Math.random() * 100,
      delay: Math.random() * 120,
    };
  }
  const stars = Array.from({ length: COUNT }, () => { const s = makeStar(); s.life = Math.random() * s.maxLife; return s; });

  function drawStar(cx, cy, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(193,127,90)`;
    const pts = 4, inner = size * .4;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? size : inner;
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
        : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      if (s.delay > 0) { s.delay--; return; }
      s.life++;
      const progress = s.life / s.maxLife;
      let alpha, size = s.size;
      if (progress < .3) { alpha = progress / .3 * .15; }
      else if (progress < .7) { alpha = .15; }
      else { alpha = (1 - (progress - .7) / .3) * .15; size *= 1 + (progress - .7) / .3 * .5; }

      drawStar(s.x, s.y, size, alpha);
      if (s.life >= s.maxLife) Object.assign(s, makeStar());
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
