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

  type();
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
