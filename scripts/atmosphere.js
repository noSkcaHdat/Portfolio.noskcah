/* ============================================================
   Atmosphere — scroll-velocity heat + hero embers
   ============================================================ */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var heatWash = document.querySelector(".atmo-heat");
  var heroHeat = document.querySelector(".s-hero .s__heat");
  var hero     = document.querySelector(".s-hero");
  var canvas   = document.querySelector(".s-hero .s__embers");

  /* ---------------- heat: scroll velocity -> warm haze ---------- */
  var heat = 0;
  var heatRaf = 0;
  var lastY = window.scrollY;
  var running = false;

  function paintHeat() {
    if (heatWash) heatWash.style.opacity = (heat * 0.34).toFixed(3);
    if (heroHeat) heroHeat.style.opacity = (heat * 0.85).toFixed(3);
  }

  function heatStep() {
    var y = window.scrollY;
    var dy = Math.abs(y - lastY);
    lastY = y;

    var target = Math.min(1, dy / 26);
    heat += (target - heat) * (target > heat ? 0.45 : 0.035);

    if (heat < 0.002) {
      heat = 0;
      paintHeat();
      running = false;
      heatRaf = 0;
      return;
    }

    paintHeat();
    heatRaf = requestAnimationFrame(heatStep);
  }

  function kickHeat() {
    if (running) return;
    running = true;
    heatRaf = requestAnimationFrame(heatStep);
  }

  window.addEventListener("scroll", kickHeat, { passive: true });

  /* ---------------- embers --------------------------------------- */
  var ctx = null;
  var W = 0, H = 0, DPR = 1;
  var parts = [];
  var emberRaf = 0;
  var emberVisible = true;
  var warmSprite = null, hotSprite = null;

  function makeSprite(inner, mid) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.3, mid);
    grad.addColorStop(1, "rgba(255,90,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  }

  function spawn(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 12,
      r: 0.6 + Math.random() * 2.1,
      vy: 0.22 + Math.random() * 0.7,
      amp: 5 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.011,
      alpha: 0.18 + Math.random() * 0.42,
      hot: Math.random() > 0.62
    };
  }

  function sizeEmbers() {
    if (!hero || !canvas || !ctx) return;
    var r = hero.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var n = W < 620 ? 16 : W < 1100 ? 28 : 38;
    parts = [];
    for (var i = 0; i < n; i++) parts.push(spawn(true));
  }

  function drawEmbers() {
    if (!emberVisible) {
      ctx.clearRect(0, 0, W, H);
      emberRaf = 0;
      return;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    var boost = 1 + heat * 1.4;

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.vy * boost;
      p.phase += p.speed * 6;

      if (p.y < -16) {
        parts[i] = spawn(false);
        continue;
      }

      var x = p.x + Math.sin(p.phase) * p.amp;
      var tw = 0.72 + 0.28 * Math.sin(p.phase * 1.7 + p.amp);
      ctx.globalAlpha = Math.min(1, p.alpha * tw * (1 + heat * 0.8));

      var s = p.r * 8;
      ctx.drawImage(p.hot ? hotSprite : warmSprite, x - s / 2, p.y - s / 2, s, s);
    }

    emberRaf = requestAnimationFrame(drawEmbers);
  }

  function startEmbers() {
    if (emberRaf || !ctx) return;
    emberRaf = requestAnimationFrame(drawEmbers);
  }

  function stopEmbers() {
    if (emberRaf) cancelAnimationFrame(emberRaf);
    emberRaf = 0;
  }

  if (hero && canvas && canvas.getContext) {
    ctx = canvas.getContext("2d");
    warmSprite = makeSprite("rgba(255,236,150,1)", "rgba(255,190,60,.55)");
    hotSprite  = makeSprite("rgba(255,180,70,1)", "rgba(255,104,0,.5)");

    sizeEmbers();
    startEmbers();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        emberVisible = entries[0].isIntersecting;
        if (emberVisible) startEmbers();
        else stopEmbers();
      }, { rootMargin: "100px" }).observe(hero);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeEmbers, 180);
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopEmbers();
      else if (emberVisible) startEmbers();
    });
  }
})();
