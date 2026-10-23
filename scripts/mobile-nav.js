(function () {
  const toggle = document.querySelector(".sb-menu-toggle");
  const menu = document.getElementById("site-navigation");
  if (!toggle || !menu) return;

  const mobile = window.matchMedia("(max-width: 987px)");
  const firstLink = menu.querySelector("a");

  const setOpen = (open, returnFocus = false) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close site navigation" : "Open site navigation");
    if (open && firstLink) firstLink.focus();
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (mobile.matches && event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (mobile.matches && menu.classList.contains("is-open") &&
        !menu.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false, true);
    }
  });

  mobile.addEventListener("change", () => setOpen(false));
})();
