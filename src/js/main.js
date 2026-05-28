import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smooth: true });

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── NAVBAR ────────────────────────────────────────────────────────────
(function initNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 100;
    sections.forEach(s => {
      const link = navLinks.querySelector(`a[href="#${s.id}"]`);
      if (link) link.classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
    });
  }, { passive: true });
})();

// ── SCROLL REVEAL ─────────────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  gsap.set(els, { opacity: 0, y: 20 });

  els.forEach((el, i) => {
    const siblings = Array.from(el.parentElement?.children ?? []);
    const delay = siblings.indexOf(el) * 0.1;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay }),
      once: true,
    });
  });
})();

// ── HERO MOUSE PARALLAX ───────────────────────────────────────────────
(function initParallax() {
  const card = document.querySelector('.hero-visual');
  if (!card || window.innerWidth < 1024) return;

  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth  / 2 - e.clientX) / 60;
    const y = (window.innerHeight / 2 - e.clientY) / 60;
    gsap.to(card, { x, y, duration: 1, ease: 'power1.out' });
  });
})();

// ── PORTFOLIO SCREENSHOT CAROUSEL ─────────────────────────────────────
(function initCarousels() {
  const carousels = document.querySelectorAll('.portfolio-screenshots');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  carousels.forEach(wrap => {
    const imgs = wrap.querySelectorAll('img');
    if (imgs.length < 2 || reduced) return;

    let idx = 0;
    let timer = null;

    function next() {
      imgs[idx].classList.remove('active');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('active');
    }

    function start(ms = 3200) { timer = setInterval(next, ms); }
    function stop() { clearInterval(timer); }

    const io = new IntersectionObserver(([e]) => {
      e.isIntersecting ? start() : stop();
    }, { threshold: 0.3 });
    io.observe(wrap);

    wrap.closest('article')?.addEventListener('mouseenter', () => { stop(); start(1600); });
    wrap.closest('article')?.addEventListener('mouseleave', () => { stop(); start(3200); });
  });
})();

// ── CONTACT FORM ──────────────────────────────────────────────────────
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subj = encodeURIComponent(`[${d.get('subject')}] Contacto desde GanymeDEV — ${d.get('name')}`);
    const body = encodeURIComponent(`Nombre: ${d.get('name')}\nEmail: ${d.get('email')}\nServicio: ${d.get('subject')}\n\n${d.get('message')}`);
    window.location.href = `mailto:ganymedev.sdk@gmail.com?subject=${subj}&body=${body}`;
  });
})();
