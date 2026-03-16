/* =============================================================
   PORTFOLIO — script.js
   Handles: theme toggle, mobile nav, scroll reveals,
            project card rendering, filter tabs, smooth scroll.
============================================================= */

/* ── 1. THEME TOGGLE ─────────────────────────────────────── */
(function initTheme() {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    icon.className = theme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
})();


/* ── 2. STICKY NAV SHADOW ────────────────────────────────── */
(function initNavShadow() {
  const nav = document.getElementById('nav-header');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 1px 20px rgba(0,0,0,0.08)'
      : 'none';
  }, { passive: true });
})();


/* ── 3. MOBILE HAMBURGER MENU ────────────────────────────── */
(function initMobileMenu() {
  const ham   = document.getElementById('hamburger');
  const menu  = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !ham.contains(e.target)) closeMenu();
  });

  function closeMenu() {
    menu.classList.remove('open');
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
})();


/* ── 4. SCROLL-REVEAL (Intersection Observer) ────────────── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
})();


/* ── 5. PROJECT CARDS ────────────────────────────────────── */
(function initProjects() {
  const grid       = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let   allProjects   = [];

  // Fetch from projects.json (relative path — GitHub Pages compatible)
  fetch('./projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load projects.json');
      return res.json();
    })
    .then(data => {
      allProjects = data;
      renderProjects(data);
    })
    .catch(err => {
      grid.innerHTML = `<p class="projects-loading">
        Could not load projects. Ensure projects.json is in the same directory.<br>
        <small style="color:var(--ink-3)">${err.message}</small>
      </p>`;
    });

  /* ── Render cards ── */
  function renderProjects(projects) {
    grid.innerHTML = '';

    if (projects.length === 0) {
      grid.innerHTML = '<p class="projects-loading">No projects to show.</p>';
      return;
    }

    projects.forEach((project, i) => {
      const card = createCard(project);
      grid.appendChild(card);
      // Staggered entrance
      setTimeout(() => card.classList.add('visible'), i * 80 + 50);
    });
  }

  /* ── Build a single project card ── */
  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.featured = p.featured ? 'true' : 'false';

    const tagsHtml = p.tags
      .map(t => `<span class="badge">${escHtml(t)}</span>`)
      .join('');

    const githubLink = p.github
      ? `<a class="card-link" href="${escHtml(p.github)}" target="_blank" rel="noopener">
           <i class="ph ph-github-logo"></i> Code
         </a>`
      : '';

    const demoLink = p.demo
      ? `<a class="card-link" href="${escHtml(p.demo)}" target="_blank" rel="noopener">
           <i class="ph ph-arrow-square-out"></i> Live Demo
         </a>`
      : '';

    const featuredDot = p.featured
      ? `<div class="card-featured-dot" title="Featured project"></div>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-title">${escHtml(p.title)}</h3>
        ${featuredDot}
      </div>
      <p class="card-desc">${escHtml(p.description)}</p>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-links">
        ${githubLink}
        ${demoLink}
      </div>
    `;

    return card;
  }

  /* ── Filter buttons ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter   = btn.dataset.filter;
      const filtered = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.featured);

      renderProjects(filtered);
    });
  });

  /* ── HTML escape helper ── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();


/* ── 6. SMOOTH SCROLL (polyfill for older iOS Safari) ───── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ── 7. ACTIVE NAV LINK HIGHLIGHT ────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();
