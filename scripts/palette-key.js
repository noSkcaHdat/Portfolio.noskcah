/* ============================================================
   PALETTE KEY — stealth cycler (Archive → Hazard → Blueprint)
   Lives top-left of About section. Click cycles; persists.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "ha-palette-v1";
  var cycle = ["archive", "hazard", "blueprint"];
  var labels = { archive: "Archive", hazard: "Hazard", blueprint: "Blueprint" };
  var keyEl = null;

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function applyPalette(id) {
    if (cycle.indexOf(id) < 0) id = "archive";
    root.setAttribute("data-palette", id);
    if (keyEl) {
      keyEl.textContent = labels[id];
      keyEl.setAttribute("data-palette", id);
       keyEl.setAttribute("aria-label", "Current palette: " + labels[id] + ". Activate to cycle.");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var color = getComputedStyle(root).getPropertyValue("--color-primary").trim();
      if (color) meta.setAttribute("content", color);
    }
    safeSet(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("palettechange", { detail: { palette: id } }));
  }

  function init() {
    keyEl = document.querySelector(".js-palette-key");
    if (!keyEl) return;

    var stored = safeGet(STORAGE_KEY);
    var initial = (cycle.indexOf(stored) >= 0) ? stored : "archive";
    applyPalette(initial);

    keyEl.addEventListener("click", function () {
      var current = keyEl.getAttribute("data-palette") || "archive";
      var idx = cycle.indexOf(current);
      var next = cycle[(idx + 1) % cycle.length];
      applyPalette(next);
    });

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
