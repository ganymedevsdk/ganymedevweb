import { initScrambleReveal, bindScrambleHover, TextScramble } from './scramble.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── nav: stuck state + mobile toggle + active link ─────────────────── */
(function nav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...document.querySelectorAll('.nav__link')];
  if (sections.length && links.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY + 120;
      let current = '';
      sections.forEach((s) => { if (y >= s.offsetTop) current = s.id; });
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${current}`));
    }, { passive: true });
  }
})();

/* ── scroll reveal (IntersectionObserver, no GSAP needed) ───────────── */
(function reveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (REDUCED) { els.forEach((el) => el.classList.add('is-revealed')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-revealed');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  els.forEach((el) => io.observe(el));
})();

/* ── scramble: reveal-on-scroll + hover on work rows ────────────────── */
initScrambleReveal();
document.querySelectorAll('[data-scramble-hover]').forEach(bindScrambleHover);

/* ── work rows: floating thumbnail preview ──────────────────────────── */
(function workThumb() {
  const rows = document.querySelectorAll('.work__row[data-thumb]');
  if (!rows.length || window.matchMedia('(hover: none)').matches) return;

  const thumb = document.createElement('div');
  thumb.className = 'work__thumb';
  const img = document.createElement('img');
  thumb.appendChild(img);
  document.body.appendChild(thumb);

  let raf = 0, tx = 0, ty = 0;
  const render = () => {
    thumb.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%) scale(${thumb.classList.contains('is-on') ? 1 : 0.94})`;
    raf = 0;
  };

  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => {
      img.src = row.dataset.thumb;
      thumb.classList.add('is-on');
    });
    row.addEventListener('mouseleave', () => thumb.classList.remove('is-on'));
    row.addEventListener('mousemove', (e) => {
      tx = e.clientX + 28; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(render);
    });
  });
})();

/* ── contact form → Web3Forms ───────────────────────────────────────── */
(function form() {
  const f = document.getElementById('contactForm');
  if (!f) return;

  f.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalHTML = f.innerHTML;
    const btn = f.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '// Transmitiendo...';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(f),
      });
      const json = await res.json();

      if (json.success) {
        f.innerHTML = `<p class="form-success">[ UPLINK ESTABLECIDO ]<br>Mensaje cifrado recibido. Coordenadas registradas.<br>// En ruta. Menos de 24 horas.</p>`;

        await new Promise((r) => setTimeout(r, 5000));

        const successEl = f.querySelector('.form-success');
        if (successEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          await new TextScramble(successEl).setText('');
        }

        await new Promise((r) => setTimeout(r, 220));
        f.innerHTML = originalHTML;
      } else {
        throw new Error(json.message || 'Error desconocido');
      }
    } catch {
      f.innerHTML = originalHTML;
      const errEl = document.createElement('p');
      errEl.className = 'form-error';
      errEl.textContent = '// Error al transmitir. Intentá de nuevo o escribinos directamente.';
      f.appendChild(errEl);
    }
  });
})();
