import { initLenis } from './lenis.js';
import { initScrollTrigger } from './gsap-init.js';
import { initHero } from './hero.js';

const lenis = initLenis();
initScrollTrigger();
initHero();

// ===== CURSOR GLOW =====
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 768) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
  });

  function animate() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== NAVBAR =====
(function initNav() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('active');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!navMenu) return;
      navMenu.classList.remove('active');
      navToggle?.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
})();

// ===== COSMOS — ELLIPTICAL ORBITS (responsive offset-path) =====
(function initCosmos() {
  const cosmos = document.getElementById('cosmos');
  if (!cosmos) return;

  function buildEllipsePath(rx, ry) {
    // Closed ellipse path centered at origin, traversed clockwise
    const r1x = rx.toFixed(1);
    const r1y = ry.toFixed(1);
    return `path("M -${r1x},0 A ${r1x},${r1y} 0 1,1 ${r1x},0 A ${r1x},${r1y} 0 1,1 -${r1x},0")`;
  }

  function update() {
    const w = cosmos.clientWidth;
    const h = cosmos.clientHeight;
    if (!w || !h) return;
    const css = getComputedStyle(cosmos);

    function readRadius(varName, dim) {
      const raw = css.getPropertyValue(varName).trim();
      if (!raw) return null;
      if (raw.endsWith('%')) return (parseFloat(raw) / 100) * dim;
      if (raw.endsWith('px')) return parseFloat(raw);
      return parseFloat(raw);
    }

    const orbits = [
      { sel: '.orbit-1 .planet', rx: readRadius('--rx-1', w / 2), ry: readRadius('--ry-1', h / 2) },
      { sel: '.orbit-2 .planet', rx: readRadius('--rx-2', w / 2), ry: readRadius('--ry-2', h / 2) },
      { sel: '.orbit-3 .planet', rx: readRadius('--rx-3', w / 2), ry: readRadius('--ry-3', h / 2) },
    ];

    for (const o of orbits) {
      if (!o.rx || !o.ry) continue;
      const path = buildEllipsePath(o.rx, o.ry);
      cosmos.querySelectorAll(o.sel).forEach((el) => {
        el.style.offsetPath = path;
        el.style.webkitOffsetPath = path;
      });
    }
  }

  update();

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => update());
    ro.observe(cosmos);
  } else {
    window.addEventListener('resize', update);
  }

  // Recompute after fonts/images settle, in case layout shifts
  window.addEventListener('load', update, { once: true });
})();

// ===== CASE CARD SCREENSHOT CAROUSEL =====
(function initCaseCarousels() {
  const cards = document.querySelectorAll('.case-card');
  if (!cards.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach((card) => {
    const shots = card.querySelectorAll('.case-shot');
    const bar = card.querySelector('.case-progress-bar');
    if (shots.length < 2) return;

    let active = 0;
    let timer = null;
    let progressTimer = null;
    let progress = 0;
    let intervalMs = 3400;
    let visible = false;
    let hovered = false;

    function setActive(i) {
      shots.forEach((el, idx) => el.classList.toggle('active', idx === i));
      active = i;
    }

    function tick() {
      const next = (active + 1) % shots.length;
      setActive(next);
      progress = 0;
      if (bar) bar.style.width = '0%';
    }

    function startProgress() {
      if (reduced || !bar) return;
      stopProgress();
      const stepMs = 60;
      progressTimer = setInterval(() => {
        if (!visible || hovered) return;
        progress = Math.min(100, progress + (100 * stepMs) / intervalMs);
        bar.style.width = progress + '%';
      }, stepMs);
    }

    function stopProgress() {
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
    }

    function start() {
      if (reduced) return;
      stop();
      timer = setInterval(() => {
        if (!visible) return;
        if (hovered) return;
        tick();
      }, intervalMs);
      startProgress();
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      stopProgress();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.4 });
    io.observe(card);

    card.addEventListener('mouseenter', () => {
      hovered = true;
      intervalMs = 1700;
      stop();
      start();
    });
    card.addEventListener('mouseleave', () => {
      hovered = false;
      intervalMs = 3400;
      stop();
      start();
    });

    card.addEventListener('focusin', () => { hovered = true; });
    card.addEventListener('focusout', () => { hovered = false; });
  });
})();

// ===== SCROLL REVEAL =====
(function initReveal() {
  const revealElements = document.querySelectorAll(
    '.service-card, .case-card, .process-step, .value-card, ' +
    '.about-text-block, .contact-form, .contact-aside, ' +
    '.contact-card, .section-header, .cases-cta, .cosmos'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal');
    const siblings = el.parentElement?.children;
    if (!siblings) return;
    const siblingIndex = Array.from(siblings).indexOf(el);
    if (siblingIndex > 0 && siblingIndex < 5) {
      el.classList.add(`reveal-delay-${siblingIndex}`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
})();

// ===== CONTACT FORM =====
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    const mailSubject = encodeURIComponent(`[${subject}] Contacto desde GanymeDEV - ${name}`);
    const mailBody = encodeURIComponent(
      `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subject}\n\nMensaje:\n${message}`
    );
    window.location.href = `mailto:ganymedev.sdk@gmail.com?subject=${mailSubject}&body=${mailBody}`;
  });
})();
