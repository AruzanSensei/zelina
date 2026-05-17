(function () {
  const rows = document.querySelectorAll("[data-carousel]");
  if (!rows.length) return;

  rows.forEach((row) => {
    const pause = () => row.classList.add("is-paused");
    const resume = () => row.classList.remove("is-paused");
    let lockedByTap = false;

    row.addEventListener("mouseenter", () => {
      if (!lockedByTap) pause();
    });

    row.addEventListener("mouseleave", () => {
      if (!lockedByTap) resume();
    });

    row.addEventListener("click", () => {
      lockedByTap = !lockedByTap;
      row.classList.toggle("is-paused", lockedByTap);
    });
  });
})();
