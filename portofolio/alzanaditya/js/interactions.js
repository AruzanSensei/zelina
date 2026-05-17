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
  // Clone untuk infinite loop
  row.innerHTML += row.innerHTML;

  const RESUME_DELAY = 800;
  const DRAG_THRESHOLD = 5;

  let isActive = false;
  let isDragging = false;
  let startX = 0;
  let currentDelta = 0;
  let baseOffset = 0;
  let resumeTimer = null;

  // Baca posisi visual saat ini dari matrix computed style
  function getCurrentX() {
    const mat = new DOMMatrixReadOnly(window.getComputedStyle(row).transform);
    return mat.m41;
  }

  // Konversi offset px → animation-delay negatif (ms) untuk resume seamless
  function offsetToDelay(offsetX) {
    const halfW = row.scrollWidth / 2;
    const dur = parseFloat(window.getComputedStyle(row).animationDuration) * 1000;
    const isRight = row.dataset.direction === "right";
    let progress;
    if (isRight) {
      const x = Math.max(-halfW, Math.min(0, offsetX));
      progress = (x + halfW) / halfW;
    } else {
      const x = Math.max(-halfW, Math.min(0, offsetX));
      progress = Math.abs(x) / halfW;
    }
    return -(progress * dur);
  }

  // Hentikan CSS animation sepenuhnya — setelah ini style.transform bekerja normal
  function freeze() {
    clearTimeout(resumeTimer);
    baseOffset = getCurrentX();
    row.style.animationName = "none"; // matikan animasi CSS
    row.style.transform = `translateX(${baseOffset}px)`; // JS ambil alih posisi
  }

  // Restart animasi CSS dari offset tertentu
  function resumeFrom(offsetX) {
    // Set delay dulu (sebelum animationName dikembalikan) agar tidak flicker di frame awal
    row.style.animationDelay = `${offsetToDelay(offsetX)}ms`;
    row.style.transform = "";       // hapus inline transform
    row.style.animationName = "";   // kembalikan animasi CSS
    row.style.animationPlayState = "running";
  }

  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => resumeFrom(baseOffset), RESUME_DELAY);
  }

  // ── Mouse ──────────────────────────────────────────────
  row.addEventListener("mousedown", (e) => {
    isActive = true;
    isDragging = false;
    startX = e.clientX;
    currentDelta = 0;
    freeze();
    row.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isActive) return;
    currentDelta = e.clientX - startX;
    if (Math.abs(currentDelta) > DRAG_THRESHOLD) isDragging = true;
    if (isDragging) {
      // style.transform bisa dipakai langsung karena animationName sudah "none"
      row.style.transform = `translateX(${baseOffset + currentDelta}px)`;
    }
  });

  window.addEventListener("mouseup", () => {
    if (!isActive) return;
    isActive = false;
    row.style.cursor = "";

    if (isDragging) {
      baseOffset = baseOffset + currentDelta;
      scheduleResume(); // resume setelah idle 1.5 detik
    } else {
      resumeFrom(baseOffset); // klik biasa: langsung resume di posisi sama
    }

    isDragging = false;
    currentDelta = 0;
  });

  // ── Touch ──────────────────────────────────────────────
  row.addEventListener("touchstart", (e) => {
    isActive = true;
    isDragging = false;
    startX = e.touches[0].clientX;
    currentDelta = 0;
    freeze();
  }, { passive: true });

  row.addEventListener("touchmove", (e) => {
    if (!isActive) return;
    currentDelta = e.touches[0].clientX - startX;
    if (Math.abs(currentDelta) > DRAG_THRESHOLD) isDragging = true;
    if (isDragging) {
      row.style.transform = `translateX(${baseOffset + currentDelta}px)`;
    }
  }, { passive: true });

  row.addEventListener("touchend", () => {
    if (!isActive) return;
    isActive = false;

    if (isDragging) {
      baseOffset = baseOffset + currentDelta;
      scheduleResume();
    } else {
      resumeFrom(baseOffset); // tap biasa: langsung resume
    }

    isDragging = false;
    currentDelta = 0;
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
