/* ════════════════════════════════════════════════════════════════════
   TextScramble — letters cycle random glyphs, then resolve to target.
   "Alien / AI decode" effect. Dependency-free.
   ════════════════════════════════════════════════════════════════════ */

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01_ΞΔΣØ▚▞░▒▓';

export class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = GLYPHS;
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const old = this.el.textContent;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise((res) => (this.resolve = res));
    this.queue = [];

    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 24);
      const end = start + Math.floor(Math.random() * 24) + 10;
      this.queue.push({ from, to, start, end, char: '' });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const q = this.queue[i];
      if (this.frame >= q.end) {
        complete++;
        output += q.to;
      } else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.28) {
          q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="char-scrambling">${q.char}</span>`;
      } else {
        output += q.from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal-on-scroll scramble for [data-scramble] elements. */
export function initScrambleReveal() {
  const els = document.querySelectorAll('[data-scramble]');
  if (!els.length) return;

  els.forEach((el) => {
    const text = el.dataset.scramble || el.textContent.trim();
    el.textContent = text;
    if (REDUCED) return;

    const fx = new TextScramble(el);
    el._scrambleFx = fx;
    el._scrambleText = text;
    el.dataset.scrambleReady = '1';
  });

  if (REDUCED) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.scrambleDone) return;
        el.dataset.scrambleDone = '1';
        const delay = parseFloat(el.dataset.scrambleDelay || '0') * 1000;
        setTimeout(() => el._scrambleFx.setText(el._scrambleText), delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  els.forEach((el) => el.dataset.scrambleReady && io.observe(el));
}

/* Re-scramble on hover (used by MY WORK rows). */
export function bindScrambleHover(el) {
  if (REDUCED) return;
  const text = el.textContent.trim();
  const fx = new TextScramble(el);
  let busy = false;
  el.closest('[data-scramble-hover-target]')?.addEventListener('mouseenter', async () => {
    if (busy) return;
    busy = true;
    await fx.setText(text);
    busy = false;
  });
}
