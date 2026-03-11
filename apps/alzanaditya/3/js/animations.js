const typedElement = document.querySelector(".typed-text");
const starfield = document.querySelector(".starfield");
const revealElements = document.querySelectorAll(".reveal");

if (typedElement) {
  const roles = (typedElement.dataset.roles || "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const currentRole = roles[roleIndex] || "";
    typedElement.textContent = currentRole.slice(0, charIndex);

    if (!deleting && charIndex < currentRole.length) {
      charIndex += 1;
      setTimeout(type, 95);
      return;
    }

    if (!deleting && charIndex === currentRole.length) {
      deleting = true;
      setTimeout(type, 1400);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(type, 55);
      return;
    }

    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, 220);
  };

  // Assign type to global to be called by intro sequence
  window.startTyping = type;
}

if (starfield) {
  const starCount = window.innerWidth < 768 ? 48 : 86;

  Array.from({ length: starCount }).forEach(() => {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 2.3 + 1}px`;
    star.style.height = star.style.width;
    star.style.setProperty("--duration", `${Math.random() * 4 + 3}s`);
    star.style.animationDelay = `${Math.random() * 2}s`;
    starfield.appendChild(star);
  });

  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.06;
    starfield.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

if (revealElements.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach((element) => observer.observe(element));
}

// =====================
// INTRO SEQUENCE LOGIC
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const step1 = document.querySelector(".intro-step-1");
  const step2 = document.querySelector(".intro-step-2");
  const isBodyLoading = document.body.classList.contains("is-loading");

  if (isBodyLoading && step1 && step2) {
    // 1. Fade in Step 1 ("Hi, I'm Alzan")
    setTimeout(() => {
      step1.classList.add("is-visible");
    }, 100);

    // 2. Fade in Step 2 ("I'm a...") after Step 1 finishes its 0.8s transition
    setTimeout(() => {
      step2.classList.add("is-visible");

      // Give it slightly more time before typing
      setTimeout(() => {
        if (typeof window.startTyping === "function") {
          window.startTyping();
        }
      }, 1000);

    }, 1500);

    // 3. Reveal rest of the site smoothy after Step 2 finishes
    setTimeout(() => {
      document.body.classList.remove("is-loading");
    }, 4000);
  } else {
    // Fallback
    document.body.classList.remove("is-loading");
    if (typeof window.startTyping === "function") window.startTyping();
  }
});
