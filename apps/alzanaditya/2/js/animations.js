// ── STARS CANVAS ──
(function() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    const count = Math.floor((w * h) / 5000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 0.9 + 0.1,
        alpha: Math.random(),
        speed: Math.random() * 0.006 + 0.002,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.016;
    stars.forEach(s => {
      const a = 0.3 + 0.5 * Math.sin(s.phase + t * s.speed * 60);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,215,255,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

// ── TYPEWRITER ──
(function() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  const words = ['Web Developer', 'Designer', 'Content Creator'];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);
    let delay = deleting ? 60 : 100;
    if (!deleting && ci > word.length) { delay = 1600; deleting = true; }
    else if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  }
  tick();
})();

// ── SCROLL REVEAL ──
(function() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── NAVBAR SCROLL ──
(function() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
})();
