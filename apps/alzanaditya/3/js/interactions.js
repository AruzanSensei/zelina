const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-nav a");
const mobileContactBtn = document.querySelector(".mobile-contact-btn");

function closeMobileMenu() {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

if (mobileContactBtn) {
  mobileContactBtn.addEventListener("click", closeMobileMenu);
}

document.querySelectorAll("[data-accordion-group]").forEach((group) => {
  const items = Array.from(group.querySelectorAll(".accordion-item"));

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("is-open");

      items.forEach((currentItem) => {
        currentItem.classList.remove("is-open");
        currentItem.querySelector(".accordion-trigger")?.setAttribute("aria-expanded", "false");
      });

      if (shouldOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
});

const filterButtons = document.querySelectorAll(".filter-chip");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((chip) => chip.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

document.querySelectorAll(".testimonial-row").forEach((row) => {
  row.innerHTML += row.innerHTML;

  row.addEventListener("click", () => {
    if (window.innerWidth >= 1024) return;
    row.classList.toggle("is-paused");
  });
});

// Header Hide on Scroll
let lastScrollY = window.scrollY;
const topbar = document.querySelector(".topbar");

if (topbar) {
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    // mobileMenu is defined at the top of this file
    const isMobileMenuOpen = mobileMenu ? mobileMenu.classList.contains("is-open") : false;

    if (isMobileMenuOpen) return;

    // Scroll Down -> Hide; Scroll Up -> Show
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      topbar.classList.add("topbar-hidden");
    } else if (currentScrollY < lastScrollY) {
      topbar.classList.remove("topbar-hidden");
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}
