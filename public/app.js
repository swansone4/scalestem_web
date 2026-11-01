const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation?.classList.toggle('open', open);
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation?.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

const header = document.querySelector('[data-header]');
const scrollProgress = document.querySelector('[data-scroll-progress]');
let scrollQueued = false;

function updateScrollState() {
  scrollQueued = false;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
  scrollProgress?.style.setProperty('--progress', String(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0));
}

window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(updateScrollState);
}, { passive: true });
updateScrollState();

const headlineRotator = document.querySelector('[data-headline-rotator]');
const headlineSlides = [...(headlineRotator?.querySelectorAll('[data-headline-slide]') ?? [])];
const headlineDots = [...document.querySelectorAll('[data-headline-dot]')];
if (headlineSlides.length > 1) {
  let activeHeadline = 0;
  const headlineSwapDelay = reducedMotion.matches ? 0 : 720;
  window.setInterval(() => {
    const outgoing = headlineSlides[activeHeadline];
    const nextIndex = (activeHeadline + 1) % headlineSlides.length;
    const incoming = headlineSlides[nextIndex];
    outgoing.classList.remove('is-active');
    outgoing.setAttribute('aria-hidden', 'true');
    headlineDots.forEach((dot, index) => dot.classList.toggle('is-active', index === nextIndex));
    window.setTimeout(() => {
      incoming.classList.add('is-active');
      incoming.removeAttribute('aria-hidden');
      activeHeadline = nextIndex;
    }, headlineSwapDelay);
  }, 7200);
}

const marketRibbon = document.querySelector('[data-market-ribbon]');
const marketTrack = marketRibbon?.querySelector('[data-market-track]');
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

const revealTargets = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((element) => observer.observe(element));

  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionObserver.observe(section);
  });
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

const workspace = document.querySelector('[data-workspace]');
const workspaceTabs = [...(workspace?.querySelectorAll('[data-workspace-tab]') ?? [])];
const workspaceTimer = workspace?.querySelector('[data-workspace-timer]');
const workspaceDelay = 6000;
let workspaceIndex = 0;
let workspaceTimeout = 0;
let workspaceVisible = false;
let workspaceHeld = false;
let workspaceAutoplay = !reducedMotion.matches;

function selectWorkspaceTab(index, focus = false) {
  workspaceIndex = (index + workspaceTabs.length) % workspaceTabs.length;
  workspaceTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === workspaceIndex;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (panel) {
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    }
  });
  if (focus) workspaceTabs[workspaceIndex].focus();
  scheduleWorkspace();
}

function scheduleWorkspace() {
  window.clearTimeout(workspaceTimeout);
  workspaceTimer?.classList.remove('is-running');
  if (!workspaceAutoplay || !workspaceVisible || workspaceHeld) return;
  if (workspaceTimer) {
    void workspaceTimer.offsetWidth;
    workspaceTimer.style.setProperty('--ws-delay', `${workspaceDelay}ms`);
    workspaceTimer.classList.add('is-running');
  }
  workspaceTimeout = window.setTimeout(() => selectWorkspaceTab(workspaceIndex + 1), workspaceDelay);
}

if (workspace && workspaceTabs.length) {
  workspaceTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      workspaceAutoplay = false;
      selectWorkspaceTab(index);
    });
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (event.key === 'Home' || event.key === 'End' || step) {
        event.preventDefault();
        workspaceAutoplay = false;
        selectWorkspaceTab(event.key === 'Home' ? 0 : event.key === 'End' ? workspaceTabs.length - 1 : workspaceIndex + step, true);
      }
    });
  });

  const hold = (held) => { workspaceHeld = held; scheduleWorkspace(); };
  workspace.addEventListener('pointerenter', () => hold(true));
  workspace.addEventListener('pointerleave', () => hold(false));
  workspace.addEventListener('focusin', () => hold(true));
  workspace.addEventListener('focusout', (event) => { if (!workspace.contains(event.relatedTarget)) hold(false); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      workspaceVisible = entry.isIntersecting;
      scheduleWorkspace();
    }, { threshold: 0.4 }).observe(workspace);
  }
}
