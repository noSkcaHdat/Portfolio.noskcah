(function () {
  const audio = document.getElementById("site-audio");
  if (!audio) return;

  const attemptPlayback = () => audio.play().catch(() => {});
  const unlockPlayback = () => {
    attemptPlayback();
    window.removeEventListener("pointerdown", unlockPlayback);
    window.removeEventListener("touchstart", unlockPlayback);
    window.removeEventListener("keydown", unlockPlayback);
  };

  audio.loop = true;
  attemptPlayback();

  window.addEventListener("pointerdown", unlockPlayback, { once: true, passive: true });
  window.addEventListener("touchstart", unlockPlayback, { once: true, passive: true });
  window.addEventListener("keydown", unlockPlayback, { once: true });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && audio.paused) {
      attemptPlayback();
    }
  });
})();
