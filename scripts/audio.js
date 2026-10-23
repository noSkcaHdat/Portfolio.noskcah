(function () {
  const audio = document.getElementById("site-audio");
  const toggle = document.getElementById("audio-toggle");
  if (!audio || !toggle) return;

  const label = toggle.querySelector(".foot-audio__label");
  let soundEnabled = false;

  const renderState = () => {
    const isPlaying = soundEnabled && !audio.paused && !audio.muted;
    toggle.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "Mute soundtrack" : "Play soundtrack");
    if (label) label.textContent = isPlaying ? "Sound on" : "Sound off";
  };

  audio.loop = true;
  audio.preload = "none";
  audio.muted = true;

  toggle.addEventListener("click", async () => {
    if (soundEnabled && !audio.paused && !audio.muted) {
      soundEnabled = false;
      audio.muted = true;
      renderState();
      return;
    }

    soundEnabled = true;
    audio.muted = false;
    try {
      await audio.play();
    } catch {
      soundEnabled = false;
      audio.muted = true;
    }
    renderState();
  });

  audio.addEventListener("play", renderState);
  audio.addEventListener("pause", renderState);
  renderState();
})();
