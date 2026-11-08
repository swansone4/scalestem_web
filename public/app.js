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

const story = document.querySelector('[data-story]');
if (story) {
  const steps = [...story.querySelectorAll('[data-step]')];
  const scenes = [...story.querySelectorAll('[data-scene]')];
  const rail = [...story.querySelectorAll('.story-rail li')];
  const navItems = [...story.querySelectorAll('[data-nav]')];
  const device = story.querySelector('[data-device]');
  const sim = story.querySelector('[data-sim]');
  const stepCount = story.querySelector('[data-step-count]');
  const intake = story.querySelector('.scene-intake');
  let current = -1;
  let typed = false;

  const typeIntake = () => {
    if (typed || !intake) return;
    typed = true;
    const fields = [...intake.querySelectorAll('[data-type]')];
    if (reducedMotion.matches) {
      fields.forEach((field) => { field.textContent = field.dataset.type; });
      intake.classList.add('is-done');
      return;
    }
    let field = 0;
    let char = 0;
    const tick = () => {
      const el = fields[field];
      if (!el) { intake.classList.add('is-done'); return; }
      el.classList.add('is-typing');
      el.textContent = el.dataset.type.slice(0, ++char);
      if (char >= el.dataset.type.length) {
        el.classList.remove('is-typing');
        field += 1;
        char = 0;
        window.setTimeout(tick, 320);
      } else {
        window.setTimeout(tick, 24 + Math.random() * 30);
      }
    };
    window.setTimeout(tick, 700);
  };

  const setStep = (index) => {
    if (index === current) return;
    current = index;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
    rail.forEach((dot, i) => { dot.classList.toggle('is-active', i === index); dot.classList.toggle('is-done', i < index); });
    navItems.forEach((item) => item.classList.toggle('is-on', item.dataset.nav.split(' ').includes(String(index))));
    device?.classList.toggle('is-doc', index === 7);
    if (stepCount) stepCount.textContent = String(index + 1).padStart(2, '0');
    device?.style.setProperty('--step-p', String((index + 1) / steps.length));
    document.dispatchEvent(new CustomEvent('story:step', { detail: index }));
    if (index === 0) typeIntake();
    if (sim) {
      if (index === 5 && !reducedMotion.matches) {
        sim.preload = 'auto';
        sim.play().catch(() => {});
      } else {
        sim.pause();
      }
    }
  };

  // The active step is the last one whose top has passed a reading line: mid-screen on desktop,
  // just under the pinned workspace on phones (its height varies with the screen).
  const stage = story.querySelector('.story-stage');
  let stepQueued = false;
  const pickStep = () => {
    stepQueued = false;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const line = narrow ? stage.getBoundingClientRect().bottom + 60 : window.innerHeight * 0.55;
    let index = 0;
    steps.forEach((step, i) => { if (step.getBoundingClientRect().top <= line) index = i; });
    setStep(index);
  };
  const queueStep = () => {
    if (stepQueued) return;
    stepQueued = true;
    window.requestAnimationFrame(pickStep);
  };
  window.addEventListener('scroll', queueStep, { passive: true });
  window.addEventListener('resize', queueStep);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && sim) sim.preload = 'auto';
    }, { rootMargin: '600px 0px' }).observe(story);
  }
  setStep(0);
  pickStep();

  if (device && !reducedMotion.matches) {
    let tiltQueued = false;
    const tilt = () => {
      tiltQueued = false;
      const top = story.getBoundingClientRect().top;
      const p = Math.min(Math.max((window.innerHeight - top) / (window.innerHeight * 0.9), 0), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      device.style.setProperty('--tilt', `${(1 - eased) * 18}deg`);
      device.style.setProperty('--lift', `${(1 - eased) * 40}px`);
    };
    window.addEventListener('scroll', () => {
      if (tiltQueued) return;
      tiltQueued = true;
      window.requestAnimationFrame(tilt);
    }, { passive: true });
    tilt();
  }
}

const morph = document.querySelector('[data-morph]');
if (morph) {
  const grows = [...morph.querySelectorAll('.grow')];
  const ticks = [...morph.querySelectorAll('.morph-list li')];
  const word = morph.querySelector('[data-morph-word]');
  let stage = -1;
  let morphQueued = false;
  const update = () => {
    morphQueued = false;
    const rect = morph.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const p = Math.min(Math.max(-rect.top / (span > 0 ? span : 1), 0), 1);
    morph.style.setProperty('--p', p.toFixed(3));
    const next = p < 0.12 ? 0 : p < 0.34 ? 1 : p < 0.56 ? 2 : p < 0.78 ? 3 : 4;
    if (next === stage) return;
    stage = next;
    grows.forEach((el) => el.classList.toggle('is-on', Number(el.dataset.at) <= stage));
    ticks.forEach((el) => el.classList.toggle('is-on', Number(el.dataset.at) <= stage));
    morph.classList.toggle('is-started', stage > 0);
    document.dispatchEvent(new CustomEvent('morph:stage', { detail: stage }));
    morph.classList.toggle('is-after', stage >= 4);
    if (word) word.textContent = stage >= 4 ? 'AFTER' : 'BEFORE';
  };
  window.addEventListener('scroll', () => {
    if (morphQueued) return;
    morphQueued = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  const doc = morph.querySelector('.morph-doc');
  const stageEl = morph.querySelector('.morph-stage');
  const fit = () => {
    if (!doc || !stageEl) return;
    morph.classList.add('is-measuring');
    doc.style.setProperty('--doc-zoom', '1');
    const full = doc.offsetHeight;
    const side = window.innerWidth <= 900 ? morph.querySelector('.morph-side').offsetHeight + 14 : 0;
    const room = window.innerHeight - parseFloat(getComputedStyle(stageEl).top) - side - 24;
    morph.classList.remove('is-measuring');
    const max = window.innerWidth <= 900 ? 1 : 1.3;
    doc.style.setProperty('--doc-zoom', Math.min(max, room / full).toFixed(3));
  };
  window.addEventListener('resize', () => { fit(); update(); });
  fit();
  update();
}

const mascotTemplate = document.getElementById('mascot-template');
const mascots = [...document.querySelectorAll('[data-mascot]')];
if (mascotTemplate && mascots.length) {
  mascots.forEach((mascot) => mascot.append(mascotTemplate.content.cloneNode(true)));

  // Each robot keeps its own lines; a click or tap pokes it (the hover animation, for touch too) and speaks.
  const speak = (bubble, text, ms = 2800) => {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('is-on');
    window.clearTimeout(bubble.hideTimer);
    bubble.hideTimer = window.setTimeout(() => bubble.classList.remove('is-on'), ms);
  };
  mascots.forEach((mascot) => {
    const lines = mascot.dataset.lines.split('|');
    const bubble = mascot.parentElement.querySelector('.mascot-bubble');
    let line = 0;
    mascot.addEventListener('click', () => {
      mascot.classList.remove('is-poked');
      void mascot.offsetWidth;
      mascot.classList.add('is-poked');
      window.setTimeout(() => mascot.classList.remove('is-poked'), 1000);
      speak(bubble, lines[line % lines.length]);
      line += 1;
    });
  });

  // Eyes follow the pointer, a few units inside the visor.
  if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    let pointer = null;
    let lookQueued = false;
    const look = () => {
      lookQueued = false;
      mascots.forEach((mascot) => {
        const box = mascot.getBoundingClientRect();
        if (!box.width || box.bottom < 0 || box.top > window.innerHeight) return;
        const dx = pointer.x - (box.left + box.width * 0.53);
        const dy = pointer.y - (box.top + box.height * 0.56);
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(d / 260, 1);
        mascot.style.setProperty('--ex', `${(dx / d) * reach * 3.4}px`);
        mascot.style.setProperty('--ey', `${(dy / d) * reach * 2.2}px`);
      });
    };
    window.addEventListener('pointermove', (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (lookQueued) return;
      lookQueued = true;
      window.requestAnimationFrame(look);
    }, { passive: true });
  }

  // The guide: shown between the hero robot and the closing robot, commenting on the story and the résumé.
  const guide = document.querySelector('[data-guide]');
  if (guide && 'IntersectionObserver' in window) {
    const guideBubble = guide.querySelector('.mascot-bubble');
    const anchors = [...document.querySelectorAll('.mascot-hero, .mascot-closing')];
    const inView = new Set();
    let passedHero = false;
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target);
        if (entry.target.classList.contains('mascot-hero')) passedHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      });
      guide.classList.toggle('is-on', passedHero && inView.size === 0);
    }).observe(anchors[0]);
    anchors.slice(1).forEach((anchor) => new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) inView.add(anchor); else inView.delete(anchor);
      guide.classList.toggle('is-on', passedHero && inView.size === 0);
    }).observe(anchor));

    const stepLines = [
      'It starts with a few questions about you.',
      'That’s a project built for you.',
      'Lessons unlock one at a time.',
      'Pass the checkpoints, then move on.',
      'Stuck? The advisor knows your project.',
      'This is where the model comes together.',
      'Code and a report. Real proof.',
      'And there’s your résumé line.',
    ];
    const morphLines = [null, 'A real research project…', '…with the work behind it…', '…and a new skill.', 'Same student. Stronger résumé.'];
    const comment = (text) => {
      if (!text || !guide.classList.contains('is-on')) return;
      guide.querySelector('.mascot').classList.add('is-poked');
      window.setTimeout(() => guide.querySelector('.mascot').classList.remove('is-poked'), 1000);
      speak(guideBubble, text, 3000);
    };
    document.addEventListener('story:step', (event) => comment(stepLines[event.detail]));
    document.addEventListener('morph:stage', (event) => comment(morphLines[event.detail]));
  }
}

const demo = document.querySelector('[data-demo]');
if (demo) {
  const video = demo.querySelector('[data-demo-video]');
  const start = demo.querySelector('[data-demo-start]');
  start?.addEventListener('click', () => {
    video.controls = true;
    demo.classList.add('is-playing');
    video.play().catch(() => {});
    video.focus({ preventScroll: true });
  });
  video?.addEventListener('play', () => demo.classList.add('is-playing'));
}
