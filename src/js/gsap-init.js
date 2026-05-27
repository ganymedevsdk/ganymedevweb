import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function initScrollTrigger() {
  // Update ScrollTrigger on Lenis scroll events
  // (Lenis 1.x + GSAP 3.12 don't need scrollerProxy)
  ScrollTrigger.refresh();
}
