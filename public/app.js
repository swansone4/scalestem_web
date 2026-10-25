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

const simulation = document.querySelector('[data-application-sim]');
const count = simulation?.querySelector('[data-application-count]');
const replayButton = simulation?.querySelector('[data-replay-simulation]');
let countFrame = 0;
let countInterval = 0;
let simulationVisible = false;
let simulationStarted = false;
const reduceSimulationMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stopOngoingCount() {
  if (!countInterval) return;
  window.clearInterval(countInterval);
  countInterval = 0;
}

function startOngoingCount() {
  if (!count || countInterval || reduceSimulationMotion || !simulationVisible) return;
  countInterval = window.setInterval(() => {
    count.textContent = String(Number(count.textContent) + 1);
  }, 1400);
}

function playApplicationSimulation() {
  if (!simulation || !count) return;
  if (countFrame) cancelAnimationFrame(countFrame);
  stopOngoingCount();
  simulation.classList.remove('is-running');
  count.textContent = '0';
  void simulation.offsetWidth;
  simulation.classList.add('is-running');

  const target = 28;
  if (reduceSimulationMotion) {
    count.textContent = String(target);
    return;
  }

  const start = performance.now();
  const duration = 2400;
  function updateCount(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    count.textContent = String(Math.round(target * eased));
    if (progress < 1) countFrame = requestAnimationFrame(updateCount);
    else {
      countFrame = 0;
      startOngoingCount();
    }
  }
  countFrame = requestAnimationFrame(updateCount);
}

if (simulation && count) {
  count.textContent = '28';
  if ('IntersectionObserver' in window) {
    const simulationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        simulationVisible = entry.isIntersecting;
        if (simulationVisible && !simulationStarted) {
          simulationStarted = true;
          playApplicationSimulation();
        } else if (simulationVisible && !countFrame) startOngoingCount();
        else if (!simulationVisible) stopOngoingCount();
      });
    }, { threshold: 0.25 });
    simulationObserver.observe(simulation);
  } else {
    simulationVisible = true;
  }

  replayButton?.addEventListener('click', () => {
    simulationStarted = true;
    playApplicationSimulation();
  });
}

document.querySelector('[data-mailto-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const details = [...new FormData(form).entries()]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key === 'target' ? 'Target role or research interest' : key}: ${value}`)
    .join('\n');
  const subject = encodeURIComponent('ScaleSTEM future cohort interest');
  const body = encodeURIComponent(details);
  form.querySelector('[data-form-status]').textContent = 'Your email draft is opening. Review it and press Send to register your interest.';
  window.location.href = `mailto:scalestem@gmail.com?subject=${subject}&body=${body}`;
});
