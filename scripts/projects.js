(() => {
  const root = document.documentElement;
  const files = Array.from(document.querySelectorAll(".s-projects .prj"));
  if (!files.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const showAll = () => {
    root.classList.remove("prj-js");
    files.forEach((file) => file.classList.add("is-in"));
  };

  if (reduced.matches || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  root.classList.add("prj-js");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  files.forEach((file) => observer.observe(file));
})();
