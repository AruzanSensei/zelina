(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav-links]');

  const setMenuState = (open) => {
    if (!menuButton || !nav) {
      return;
    }

    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!nav.contains(target) && !menuButton.contains(target)) {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 780) {
        setMenuState(false);
      }
    });
  }

  const yearNode = document.querySelector('[data-year]');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  const forms = document.querySelectorAll('[data-demo-form]');
  forms.forEach((form) => {
    const status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const required = Array.from(form.querySelectorAll('[required]'));
      const isValid = required.every((field) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
          return true;
        }

        return field.value.trim().length > 0;
      });

      if (!status) {
        return;
      }

      status.classList.remove('is-success', 'is-error');

      if (!isValid) {
        status.textContent = 'Please complete the required fields before submitting.';
        status.classList.add('is-error');
        return;
      }

      status.textContent = 'Thank you. Our team will contact you within one business day.';
      status.classList.add('is-success');
      form.reset();
    });
  });
})();
