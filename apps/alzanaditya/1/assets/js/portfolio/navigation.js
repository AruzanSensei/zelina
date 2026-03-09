(function () {
  const header = document.getElementById("navbar");
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const closeMenu = () => {
    if (!toggle || !mobileMenu) return;
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();
})();
