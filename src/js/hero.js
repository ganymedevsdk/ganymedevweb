import { gsap } from './gsap-init.js';

export function initHero() {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.from('.hero-badge', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    })
    .from('.hero-title .hero-line', {
      opacity: 0,
      y: 48,
      stagger: 0.14,
      duration: 0.75,
      ease: 'power3.out',
    }, '-=0.2')
    .from('.hero-desc', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.35')
    .from('.hero-buttons .btn', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.4')
    .from('.hero-visual-inner', {
      opacity: 0,
      scale: 0.92,
      duration: 1.0,
      ease: 'power2.out',
    }, 0.1)
    .from('.hero-visual-badge', {
      opacity: 0,
      y: 16,
      stagger: 0.15,
      duration: 0.6,
      ease: 'back.out(1.4)',
    }, '-=0.4');
  });
}
