const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation?.classList.toggle('open', open);
});

navigation?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    navigation?.classList.remove('open');
  });
});

const headlineRotator = document.querySelector('[data-headline-rotator]');
const headlineSlides = [...(headlineRotator?.querySelectorAll('[data-headline-slide]') ?? [])];
if (headlineSlides.length > 1) {
  let activeHeadline = 0;
  const headlineSwapDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720;
  window.setInterval(() => {
    const outgoing = headlineSlides[activeHeadline];
    const nextIndex = (activeHeadline + 1) % headlineSlides.length;
    const incoming = headlineSlides[nextIndex];
    outgoing.classList.remove('is-active');
    outgoing.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      incoming.classList.add('is-active');
      incoming.removeAttribute('aria-hidden');
      activeHeadline = nextIndex;
    }, headlineSwapDelay);
  }, 7200);
}

const marketRibbon = document.querySelector('[data-market-ribbon]');
const marketTrack = marketRibbon?.querySelector('[data-market-track]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let marketOffset = 0;
let marketLastTime = 0;

if (marketRibbon && marketTrack && !reducedMotion.matches) {
  const moveQuotes = (now) => {
    const loopWidth = marketTrack.scrollWidth / 2;
    if (loopWidth > 0 && marketLastTime > 0) {
      const elapsed = Math.min(now - marketLastTime, 50) / 1000;
      const secondsPerLoop = 62;
      const speed = (loopWidth / secondsPerLoop) * (marketRibbon.matches(':hover') ? 0.78 : 1);
      marketOffset = (marketOffset + speed * elapsed) % loopWidth;
      marketTrack.style.transform = `translate3d(${-marketOffset}px, 0, 0)`;
    }
    marketLastTime = now;
    window.requestAnimationFrame(moveQuotes);
  };
  window.requestAnimationFrame(moveQuotes);
  document.addEventListener('visibilitychange', () => { marketLastTime = 0; });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.resume-section, .pipeline').forEach((element) => observer.observe(element));
}
