const greetings = [
  "Hello",
  "Hola",
  "Bonjour",
  "Ciao",
  "Guten Tag",
  "Olá",
  "Namaste",
  "Kia Ora",
  "Salut",
  "こんにちは",
  "안녕하세요",
  "مرحبا",
  "Sawubona",
  "Hej",
  "สวัสดี",
];

const overlay = document.querySelector("#intro-overlay");
const greetingLabel = document.querySelector(".intro-greeting");
const sections = document.querySelectorAll("[data-animate]");
const yearSpan = document.querySelector("#year");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

if (overlay && greetingLabel) {
  let greetingIndex = 0;

  function cycleGreeting() {
    greetingIndex = (greetingIndex + 1) % greetings.length;
    greetingLabel.textContent = greetings[greetingIndex];
  }

  const greetingInterval = setInterval(cycleGreeting, 320);

  window.addEventListener("load", () => {
    setTimeout(() => {
      overlay.classList.add("hidden");
      clearInterval(greetingInterval);
    }, 2600);
  });

  overlay.addEventListener('transitionend', () => {
    if (overlay.classList.contains('hidden')) {
      overlay.remove();
    }
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.3,
  }
);

sections.forEach((section) => observer.observe(section));

const navLinks = document.querySelectorAll('.primary-nav a');
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

const availabilityBtn = document.querySelector('.availability');
let pulseTimeout;

function pulseAvailability() {
  availabilityBtn.classList.toggle('pulsing');
  pulseTimeout = setTimeout(pulseAvailability, 2600);
}

if (availabilityBtn) {
  availabilityBtn.addEventListener('mouseenter', () => {
    clearTimeout(pulseTimeout);
    availabilityBtn.classList.remove('pulsing');
  });
  availabilityBtn.addEventListener('mouseleave', () => {
    pulseTimeout = setTimeout(pulseAvailability, 1200);
  });
  pulseAvailability();
}
