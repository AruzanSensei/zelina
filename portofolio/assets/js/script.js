const projects = [
  {
    title: 'Atelier Studio Portfolio Refresh',
    category: 'Portfolio',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    description: 'Redesign website studio kreatif supaya positioning premium lebih terasa dan layanan lebih mudah dipahami.',
    tags: ['Brand Positioning', 'Responsive UI', 'UX Copy'],
    result: '+34% qualified inquiries in 2 months'
  },
  {
    title: 'Nusa Creative Landing System',
    category: 'Landing Page',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Landing page campaign untuk agency dengan fokus pada clarity offer dan alur CTA yang lebih terstruktur.',
    tags: ['Conversion UI', 'Section Strategy', 'Fast Delivery'],
    result: '+27% consultation bookings'
  },
  {
    title: 'Formea Service Website',
    category: 'Business Site',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    description: 'Perombakan halaman jasa dari style lama ke layout modern yang lebih rapi dan mudah discan di mobile.',
    tags: ['Service Clarity', 'Mobile-first', 'Frontend Build'],
    result: 'Bounce rate dropped by 19%'
  },
  {
    title: 'Founder Personal Portfolio',
    category: 'Portfolio',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description: 'Website personal brand untuk founder product studio dengan narrative yang lebih solid dan meyakinkan.',
    tags: ['Narrative Design', 'Trust Layer', 'Visual Hierarchy'],
    result: '3 enterprise leads in first quarter'
  },
  {
    title: 'Sava Product Launch Page',
    category: 'Landing Page',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    description: 'Halaman launch produk dengan ritme konten yang menjaga attention sampai section pricing dan CTA final.',
    tags: ['Product Story', 'Offer Framing', 'UI Motion'],
    result: '+41% waitlist signups'
  },
  {
    title: 'Berkah Elektrik Company Profile',
    category: 'Business Site',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    description: 'Company profile untuk jasa teknikal dengan struktur konten yang menyeimbangkan kredibilitas dan kejelasan layanan.',
    tags: ['Authority Design', 'Structured Content', 'SEO Basics'],
    result: 'Lead quality improved on inbound forms'
  }
];

const logos = [
  'Atelier Studio',
  'Nusa Creative Lab',
  'Formea',
  'Berkah Elektrik',
  'Sava Product',
  'Corpolution',
  'Daffa Putra',
  'Northline Ventures'
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const projectGrid = document.getElementById('projectGrid');
const projectFilters = document.getElementById('projectFilters');
const noResults = document.getElementById('noResults');
const logoTop = document.getElementById('logo-row-top');
const logoBottom = document.getElementById('logo-row-bottom');

const categoryOrder = ['All Projects', ...new Set(projects.map((item) => item.category))];
let activeCategory = 'All Projects';

const revealObserver = prefersReducedMotion
  ? null
  : new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

function applyReveal(elements) {
  elements.forEach((el) => {
    if (prefersReducedMotion || !revealObserver) {
      el.classList.add('is-visible');
      return;
    }

    revealObserver.observe(el);
  });
}

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function fillLogos(target, items) {
  if (!target) {
    return;
  }

  const repeated = [...items, ...items];

  repeated.forEach((name) => {
    const pill = document.createElement('div');
    pill.className = 'logo-pill';
    pill.innerHTML = `
      <span class="logo-dot" aria-hidden="true">${initialsFromName(name)}</span>
      <span>${name}</span>
    `;
    target.appendChild(pill);
  });
}

function createProjectCard(project, index) {
  const card = document.createElement('article');
  card.className = 'project-card reveal';
  card.style.transitionDelay = `${70 + index * 35}ms`;
  card.innerHTML = `
    <div class="project-cover">
      <img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async" />
      <span class="project-badge">${project.category}</span>
    </div>
    <div class="project-body">
      <div class="project-meta">
        <span>${project.year}</span>
        <span>${project.tags[0]}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-result">${project.result}</div>
      <div class="project-tags">${project.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
    </div>
  `;
  return card;
}

function updateNoResults(isEmpty) {
  if (!noResults) {
    return;
  }

  noResults.hidden = !isEmpty;
}

function renderProjects() {
  if (!projectGrid) {
    return;
  }

  const visibleProjects =
    activeCategory === 'All Projects'
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  projectGrid.innerHTML = '';

  if (visibleProjects.length) {
    const fragment = document.createDocumentFragment();

    visibleProjects.forEach((project, index) => {
      fragment.appendChild(createProjectCard(project, index));
    });

    projectGrid.appendChild(fragment);
  }

  updateNoResults(!visibleProjects.length);
  applyReveal([...projectGrid.querySelectorAll('.reveal')]);
}

function renderFilters() {
  if (!projectFilters) {
    return;
  }

  projectFilters.innerHTML = '';

  categoryOrder.forEach((category) => {
    const isActive = category === activeCategory;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-btn${isActive ? ' is-active' : ''}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('aria-controls', 'projectGrid');
    button.setAttribute('tabindex', isActive ? '0' : '-1');
    button.textContent = category;

    button.addEventListener('click', () => {
      activeCategory = category;
      renderFilters();
      renderProjects();
      const activeButton = projectFilters.querySelector('.filter-btn.is-active');
      if (activeButton) {
        activeButton.focus();
      }
    });

    projectFilters.appendChild(button);
  });
}

function setupFilterKeyboard() {
  if (!projectFilters) {
    return;
  }

  projectFilters.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }

    const buttons = [...projectFilters.querySelectorAll('.filter-btn')];
    if (!buttons.length) {
      return;
    }

    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    if (currentIndex < 0) {
      return;
    }

    event.preventDefault();

    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % buttons.length;
    }

    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }

    if (event.key === 'Home') {
      nextIndex = 0;
    }

    if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    }

    buttons[nextIndex].click();
  });
}

function setupMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const siteHeader = document.querySelector('.site-header');

  if (!navToggle || !mobileMenu || !siteHeader) {
    return;
  }

  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    const clickedInside = siteHeader.contains(event.target);
    if (!clickedInside) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeMenu();
    }
  });
}

function setAccordionState(item, expanded) {
  const trigger = item.querySelector('.accordion-trigger');
  const panel = item.querySelector('.accordion-panel');

  if (!trigger || !panel) {
    return;
  }

  item.classList.toggle('is-open', expanded);
  trigger.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function setupAccordion() {
  const accordionItems = [...document.querySelectorAll('#faqAccordion .accordion-item')];

  accordionItems.forEach((item, index) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    if (!trigger || !panel) {
      return;
    }

    const panelId = `faq-panel-${index + 1}`;
    const triggerId = `faq-trigger-${index + 1}`;
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);
    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);

    setAccordionState(item, item.classList.contains('is-open'));

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      accordionItems.forEach((otherItem) => {
        setAccordionState(otherItem, false);
      });

      if (!isOpen) {
        setAccordionState(item, true);
      }
    });
  });
}

function setupActiveNav() {
  const desktopLinks = [...document.querySelectorAll('.desktop-nav a')];
  if (!desktopLinks.length) {
    return;
  }

  const linksBySection = new Map();

  desktopLinks.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      linksBySection.set(id, link);
    }
  });

  const sections = [...linksBySection.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const setActive = (id) => {
    desktopLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function setupHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) {
    return;
  }

  const applyState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

function setFooterYear() {
  const yearNode = document.getElementById('currentYear');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

function initReveals() {
  applyReveal([...document.querySelectorAll('.reveal:not(.project-card)')]);
}

fillLogos(logoTop, logos);
fillLogos(logoBottom, [...logos].reverse());
renderFilters();
renderProjects();
setupFilterKeyboard();
setupMobileMenu();
setupAccordion();
setupActiveNav();
setupHeaderState();
setFooterYear();
initReveals();
