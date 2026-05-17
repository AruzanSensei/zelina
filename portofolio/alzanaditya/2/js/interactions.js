// ── BURGER MENU ──
(function() {
  const burger = document.querySelector('.nav-burger');
  const drawer = document.querySelector('.nav-drawer');
  if (!burger || !drawer) return;
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('active');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── ACCORDION ──
(function() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const body = item.querySelector('.accordion-body');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      items.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.accordion-body').classList.remove('open');
      });
      if (!isOpen) {
        item.classList.add('active');
        body.classList.add('open');
      }
    });
  });
  // Open first by default
  const first = items[0];
  if (first) { first.classList.add('active'); first.querySelector('.accordion-body').classList.add('open'); }
})();

// ── GALLERY FILTER ──
(function() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // add fadeIn keyframe
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(style);

  // Set first tab active
  const firstTab = document.querySelector('.filter-tab');
  if (firstTab) firstTab.classList.add('active');
})();

// ── MOBILE TESTI PAUSE ──
(function() {
  const tracks = document.querySelectorAll('.testi-track');
  tracks.forEach(track => {
    track.addEventListener('click', () => {
      const paused = track.style.animationPlayState === 'paused';
      track.style.animationPlayState = paused ? 'running' : 'paused';
    });
  });
})();
