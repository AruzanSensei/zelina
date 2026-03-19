const portfolioItems = [
  {
    title: 'Corporate Portfolio Refresh',
    type: 'Website Portfolio',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    description: 'Perapihan portfolio studio kreatif dengan cover project yang lebih premium, struktur konten yang lebih kuat, dan CTA yang lebih jelas.',
    meta: ['Minimal UI', 'Conversion', 'Mobile-first']
  },
  {
    title: 'Creative Agency Showcase',
    type: 'Agency Profile',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Showcase agency dengan komposisi visual yang lebih hidup untuk menampilkan karya, layanan, dan alasan bekerja sama.',
    meta: ['Trust-building', 'Elegant Grid', 'Responsive']
  },
  {
    title: 'Business Landing System',
    type: 'Landing Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    description: 'Landing page untuk penawaran bisnis dengan ritme informasi yang jelas dan presentasi yang lebih meyakinkan.',
    meta: ['Sales-ready', 'Clear CTA', 'Fast Scan']
  },
  {
    title: 'Personal Brand Portfolio',
    type: 'Personal Site',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    description: 'Portfolio personal yang menampilkan hasil kerja dan identitas profesional tanpa terasa terlalu ramai.',
    meta: ['Personal Brand', 'Clean Layout', 'Modern']
  },
  {
    title: 'Studio Case Archive',
    type: 'Case Study Layout',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    description: 'Arsip project dengan sistem grid yang scalable, sehingga banyak karya tetap terlihat terstruktur dan nyaman dipindai.',
    meta: ['Scalable', 'Case Studies', 'Structure']
  },
  {
    title: 'Product Presentation Page',
    type: 'Product Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    description: 'Presentasi produk dengan visual cover yang kuat agar halaman terasa lebih bernilai dan lebih siap dipakai pitching.',
    meta: ['Premium feel', 'Information Design', 'UI Polish']
  }
];

const logos = [
  { name: 'Google', domain: 'google.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Airbnb', domain: 'airbnb.com' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'Shopify', domain: 'shopify.com' },
  { name: 'Dropbox', domain: 'dropbox.com' }
];

const grid = document.getElementById('portfolio-grid');
const topRow = document.getElementById('logo-row-top');
const bottomRow = document.getElementById('logo-row-bottom');

portfolioItems.forEach((item, index) => {
  const article = document.createElement('article');
  article.className = 'portfolio-item reveal';
  article.style.transitionDelay = `${80 + index * 40}ms`;

  article.innerHTML = `
    <div class="portfolio-cover">
      <img src="${item.image}" alt="${item.title}" loading="lazy" />
    </div>
    <div class="portfolio-body">
      <div class="portfolio-top">
        <span class="portfolio-tag">${item.type}</span>
        <span class="portfolio-year">${item.year}</span>
      </div>
      <div class="portfolio-copy">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      <div class="portfolio-meta">
        ${item.meta.map(tag => `<span>${tag}</span>`).join('')}
      </div>
    </div>
  `;

  grid.appendChild(article);
});

function buildLogoPills(target, items) {
  const repeated = [...items, ...items];
  repeated.forEach(item => {
    const logo = document.createElement('div');
    logo.className = 'logo-pill';
    logo.innerHTML = `
      <img src="https://logo.clearbit.com/${item.domain}" alt="${item.name}" loading="lazy" />
      <span>${item.name}</span>
    `;
    target.appendChild(logo);
  });
}

buildLogoPills(topRow, logos);
buildLogoPills(bottomRow, [...logos].reverse());

const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const button = item.querySelector('.faq-question');
  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    faqItems.forEach(other => {
      other.classList.remove('is-open');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealElements.forEach(element => observer.observe(element));
