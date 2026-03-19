const projects = [
  {
    title: 'Corporate Portfolio Refresh',
    category: 'Website Portfolio',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    description: 'Perapihan portfolio studio kreatif dengan struktur konten lebih tegas, cover visual yang lebih kuat, dan CTA yang lebih siap dipakai untuk pitching.',
    tags: ['Minimal UI', 'Conversion', 'Mobile-first']
  },
  {
    title: 'Creative Agency Showcase',
    category: 'Agency Profile',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Showcase agency dengan ritme section yang lebih lega dan lebih cocok untuk menampilkan banyak layanan serta karya pilihan.',
    tags: ['Trust-building', 'Elegant Grid', 'Responsive']
  },
  {
    title: 'Business Landing System',
    category: 'Landing Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    description: 'Landing page bisnis dengan keseimbangan antara visual premium dan struktur yang memudahkan pengunjung mengambil keputusan.',
    tags: ['Sales-ready', 'Clear CTA', 'Fast Scan']
  },
  {
    title: 'Personal Brand Portfolio',
    category: 'Personal Site',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    description: 'Portfolio personal yang terasa bersih, lebih luas, dan lebih representatif untuk desainer, developer, atau konsultan independen.',
    tags: ['Personal Brand', 'Clean Layout', 'Modern']
  },
  {
    title: 'Studio Case Archive',
    category: 'Case Study Layout',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    description: 'Arsip karya dengan grid yang scalable, cocok untuk project banyak tanpa membuat halaman terlihat padat dan sumpek.',
    tags: ['Scalable', 'Case Studies', 'Structure']
  },
  {
    title: 'Product Presentation Page',
    category: 'Product Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    description: 'Presentasi produk dengan layout bersih dan visual pendukung yang cukup kuat untuk membangun nilai persepsi lebih tinggi.',
    tags: ['Premium feel', 'Information Design', 'UI Polish']
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

const projectGrid = document.getElementById('projectGrid');
const logoTop = document.getElementById('logo-row-top');
const logoBottom = document.getElementById('logo-row-bottom');

projects.forEach((project, index) => {
  const card = document.createElement('article');
  card.className = 'project-card reveal';
  card.style.transitionDelay = `${80 + index * 40}ms`;
  card.innerHTML = `
    <div class="project-cover">
      <img src="${project.image}" alt="${project.title}" loading="lazy" />
    </div>
    <div class="project-body">
      <div class="project-meta">
        <span>${project.category}</span>
        <span>${project.year}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
    </div>
  `;
  projectGrid.appendChild(card);
});

function fillLogos(target, items) {
  const repeated = [...items, ...items];
  repeated.forEach(item => {
    const el = document.createElement('div');
    el.className = 'logo-pill';
    el.innerHTML = `
      <img src="https://logo.clearbit.com/${item.domain}" alt="${item.name}" loading="lazy" />
      <span>${item.name}</span>
    `;
    target.appendChild(el);
  });
}

fillLogos(logoTop, logos);
fillLogos(logoBottom, [...logos].reverse());

const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const accordionItems = document.querySelectorAll('#faqAccordion .accordion-item');
accordionItems.forEach(item => {
  const trigger = item.querySelector('.accordion-trigger');
  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    accordionItems.forEach(other => {
      other.classList.remove('is-open');
      other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
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
}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));
