document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  const loaderText = document.getElementById('loader-text');
  const greetingsLoader = document.getElementById('greetings-loader');
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-content');
  const desktopNav = document.getElementById('desktop-nav');
  const mobileNav = document.getElementById('mobile-nav');

  // Work filters & Dynamic Projects
  const workFilterButtons = document.querySelectorAll('.work-filter');
  const projectsContainer = document.getElementById('projects-container');
  let allProjects = [];

  function showLoader(text) {
    if (!loader && !loaderText && !greetingsLoader) return;
    if (greetingsLoader) try { greetingsLoader.style.display = 'none'; } catch(e){}
    try { if (loaderText) { loaderText.style.opacity = '1'; loaderText.textContent = `• ${text}`; } } catch(e){}
    try { if (loader) { loader.classList.add('is-visible'); loader.classList.remove('is-hidden'); } } catch(e){}
  }
  function hideLoader() {
    if (!loader) return;
    try { loader.classList.add('is-hidden'); loader.classList.remove('is-visible'); } catch(e){}
  }

  // Initial page load: greetings should fully play before hiding loader
  const greetingNodes = document.querySelectorAll('#greetings-loader .greeting');
  if (greetingNodes && greetingNodes.length) greetingNodes.forEach((el, i) => { try{ el.style.animationDelay = `${i * 0.35}s`; }catch(e){} });

  (function initLoaderWithGreetings() {
    try {
      const stepMs = 400;
      const animMs = 550;
      const count = (greetingNodes && greetingNodes.length) ? greetingNodes.length : 0;
      const totalMs = (Math.max(0, count - 1) * stepMs) + animMs + 200;

      if (count === 0) {
        // No greetings UI — ensure loader hidden quickly
        setTimeout(() => { hideLoader(); const home = document.getElementById('page-home'); if (home) { initScrollReveal(home); } if (typeof updateNavActiveState === 'function') updateNavActiveState('home'); }, 50);
        return;
      }

      setTimeout(() => {
        if (greetingsLoader) try{ greetingsLoader.style.opacity = '0'; }catch(e){}
        if (loaderText) try{ loaderText.style.opacity = '1'; }catch(e){}

        setTimeout(() => {
          hideLoader();
          const home = document.getElementById('page-home');
          if (home) { initScrollReveal(home); }
          if (typeof updateNavActiveState === 'function') updateNavActiveState('home');
        }, 400);
      }, totalMs);
    } catch (e) {
      hideLoader();
    }
  })();

  // === Scroll Reveal ===
  function initScrollReveal(containerEl) {
    const root = containerEl || document;
    const revealEls = root.querySelectorAll('.reveal-on-scroll');
    revealEls.forEach(el => el.classList.remove('is-visible'));
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
  }

  // === Dynamic Projects & Filters ===
  fetch('data/projects.json')
    .then(response => response.json())
    .then(data => {
      allProjects = data;
      renderProjects('all');
    })
    .catch(error => console.error('Error loading projects:', error));

  // Support for static work grids (if `projects-container` isn't present)
  const workGridWeb = document.getElementById('work-grid-web');
  const workGridGraphic = document.getElementById('work-grid-graphic');

  function showWorkCategory(category){
    [workGridWeb, workGridGraphic].forEach(g => g && g.classList.add('hidden'));
    workFilterButtons.forEach(btn => btn.classList.remove('is-active'));
    if(category === 'web'){
      workGridWeb && workGridWeb.classList.remove('hidden');
      document.getElementById('work-filter-web')?.classList.add('is-active');
    } else if(category === 'graphic'){
      workGridGraphic && workGridGraphic.classList.remove('hidden');
      document.getElementById('work-filter-graphic')?.classList.add('is-active');
    } else {
      workGridWeb && workGridWeb.classList.remove('hidden');
      workGridGraphic && workGridGraphic.classList.remove('hidden');
      document.getElementById('work-filter-all')?.classList.add('is-active');
    }
  }

  function renderProjects(category) {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';

    const filtered = category === 'all'
      ? allProjects
      : allProjects.filter(p => p.category === category);

    filtered.forEach(project => {
      const card = document.createElement('a');
      card.href = project.link;
      card.className = 'project-card reveal-on-scroll';
      if (project.link !== '#') {
        card.target = '_blank';
        card.rel = 'noreferrer noopener';
      }

      card.innerHTML = `
        <div class="w-full bg-gray-200 aspect-[4/3] overflow-hidden">
          <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.src='https://placehold.co/600x400/e0e0e0/a0a0a0?text=${encodeURIComponent(project.title)}'" />
        </div>
        <div class="p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold">${project.title}</h3>
            <span class="text-sm font-medium text-gray-500">${project.role || project.year}</span>
          </div>
          <p class="text-base text-gray-600 mt-2">${project.description}</p>
        </div>
      `;
      projectsContainer.appendChild(card);
    });

    initScrollReveal(document.getElementById('page-work'));
  }

  workFilterButtons.forEach(btn => btn.addEventListener('click', () => {
    // If a dynamic projects container exists, render dynamically; otherwise show static grids
    if (projectsContainer) {
      workFilterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderProjects(btn.dataset.filter);
    } else {
      showWorkCategory(btn.dataset.filter);
    }
  }));

  // === Routing ===
  function navigateTo(pageId) {
    const targetPage = document.getElementById(`page-${pageId}`);
    if (!targetPage) return;
    const pageTitle = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    showLoader(pageTitle);
    updateNavActiveState(pageId);
    pages.forEach(p => p.classList.add('hidden'));
    setTimeout(() => {
      targetPage.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.title = `${pageTitle} | Karthik Raja`;
      history.pushState({ pageId }, pageTitle, `#${pageId}`);
      if (pageId === 'work') {
        // Optional: reset filter or keep state
      }
      initScrollReveal(targetPage);
      setTimeout(hideLoader, 100);
    }, 800);
  }

  function updateNavActiveState(pageId) {
    [desktopNav, mobileNav].forEach(nav => {
      if (!nav) return;
      nav.querySelectorAll('.nav-link').forEach(link => {
        const active = link.dataset.page === pageId;
        link.classList.toggle('is-active', active);
        if (nav.id === 'mobile-nav') { link.classList.toggle('font-bold', active); link.classList.toggle('text-black', active); }
        if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      });
    });
  }

  navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); navigateTo(link.dataset.page); closeMenu(); }));

  if (location.hash) { const pageFromHash = location.hash.replace('#', '').trim(); if (document.getElementById(`page-${pageFromHash}`)) { setTimeout(() => navigateTo(pageFromHash), 100); } }

  window.addEventListener('popstate', () => {
    const hash = (location.hash || '#home').replace('#', '');
    const id = document.getElementById(`page-${hash}`) ? hash : 'home';
    pages.forEach(p => p.classList.add('hidden'));
    const pageEl = document.getElementById(`page-${id}`);
    pageEl.classList.remove('hidden');
    updateNavActiveState(id);
    initScrollReveal(pageEl);
  });

  // Local time
  const timeEl = document.getElementById('local-time');
  function updateTime() { if (timeEl) { const now = new Date(); timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }); } }
  setInterval(updateTime, 1000); updateTime();

  // Mobile menu
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const overlay = document.getElementById('menu-overlay');
  function openMenu() { if (overlay) { overlay.classList.add('is-open'); overlay.hidden = false; } document.body.style.overflow = 'hidden'; openBtn?.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { if (overlay) { overlay.classList.remove('is-open'); overlay.hidden = true; } document.body.style.overflow = ''; openBtn?.setAttribute('aria-expanded', 'false'); }
  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });

  // Marquee
  const marqueeWrapper = document.querySelector('.marquee-wrapper');
  const marqueeContent = document.querySelector('.marquee-content');
  if (marqueeWrapper && marqueeContent) {
    marqueeWrapper.addEventListener('click', () => {
      marqueeContent.classList.toggle('paused');
    });
  }

  // Parallax
  const parallaxImage = document.getElementById('hero-image');
  if (parallaxImage) { let ticking = false; function updateParallax() { const scrollY = window.scrollY; const maxOffset = parallaxImage.parentElement.clientHeight - parallaxImage.clientHeight; const offset = Math.min(0, Math.max(maxOffset, scrollY * -0.2)); parallaxImage.style.transform = `translateY(${offset}px)`; ticking = false; } window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(updateParallax); ticking = true; } }); }

  // === Lenis Smooth Scroll ===
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // === Custom Cursor ===
  const cursor = document.getElementById('custom-cursor');
  if (cursor && window.matchMedia('(min-width: 768px)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.1;
      cursorY += dy * 0.1;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

      // Check for hover state
      const hoveredElement = document.elementFromPoint(mouseX, mouseY);
      if (hoveredElement && (hoveredElement.tagName === 'A' || hoveredElement.tagName === 'BUTTON' || hoveredElement.closest('a') || hoveredElement.closest('button'))) {
        cursor.classList.add('hovering');
      } else {
        cursor.classList.remove('hovering');
      }

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // === Contact Form Handling ===
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Sending...';
      btn.disabled = true;
      formStatus.classList.add('hidden');

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formStatus.textContent = "Thanks! I'll get back to you soon.";
          formStatus.className = "mt-4 text-sm text-green-400";
          contactForm.reset();
        } else {
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            formStatus.textContent = data.errors.map(error => error.message).join(", ");
          } else {
            formStatus.textContent = "Oops! There was a problem submitting your form.";
          }
          formStatus.className = "mt-4 text-sm text-red-400";
        }
      } catch (error) {
        formStatus.textContent = "Oops! There was a problem submitting your form.";
        formStatus.className = "mt-4 text-sm text-red-400";
      } finally {
        formStatus.classList.remove('hidden');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});
