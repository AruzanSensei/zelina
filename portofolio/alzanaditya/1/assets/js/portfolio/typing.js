(function () {
  const el = document.getElementById("typedText");
  if (!el) return;

  const words = ["Web dev", "Designer", "Creator"];
  const typingSpeed = 90;
  const deletingSpeed = 48;
  const holdDelay = 1400;
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    el.textContent = currentWord.slice(0, charIndex);

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      window.setTimeout(tick, holdDelay);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }

    window.setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
  };

  tick();
})();
