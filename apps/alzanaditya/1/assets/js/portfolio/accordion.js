(function () {
  const groups = document.querySelectorAll("[data-accordion-group]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const items = group.querySelectorAll(".accordion-item");

    items.forEach((item, index) => {
      const trigger = item.querySelector(".accordion-trigger");
      const panel = item.querySelector(".accordion-panel");
      if (!trigger || !panel) return;

      const panelId = `${group.id || "accordion"}-panel-${index}`;
      const buttonId = `${group.id || "accordion"}-button-${index}`;

      trigger.id = buttonId;
      trigger.setAttribute("aria-controls", panelId);
      panel.id = panelId;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", buttonId);

      trigger.addEventListener("click", () => {
        const wasOpen = item.classList.contains("is-open");

        items.forEach((entry) => {
          entry.classList.remove("is-open");
          entry.querySelector(".accordion-trigger")?.setAttribute("aria-expanded", "false");
        });

        if (!wasOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
})();
