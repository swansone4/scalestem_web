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
const applicationList = simulation?.querySelector('.application-list');
const emailList = simulation?.querySelector('.reply-list');
const inboxTotalElements = simulation?.querySelectorAll('[data-inbox-total]');
const initialApplicationMarkup = applicationList?.innerHTML ?? '';
const initialEmailMarkup = emailList?.innerHTML ?? '';
const applicationSamples = [
  { title: 'Thermal Systems Intern', company: 'Northstar Energy', source: 'Indeed', kind: 'internship' },
  { title: 'National Research Fellowship', company: 'Orion Institute', source: 'LinkedIn', kind: 'fellowship' },
  { title: 'Modeling Engineer I', company: 'Aster Dynamics', source: 'LinkedIn', kind: 'job' },
  { title: 'Computational Science Fellowship', company: 'Federal Research Lab', source: 'Indeed', kind: 'fellowship' },
  { title: 'Simulation Analyst', company: 'Helios Systems', source: 'LinkedIn', kind: 'job' },
  { title: 'Summer Research Internship', company: 'Terra Lab', source: 'Indeed', kind: 'internship' },
  { title: 'Junior Systems Modeler', company: 'Vector Engineering', source: 'LinkedIn', kind: 'job' },
  { title: 'Climate Data Fellowship', company: 'Earth Systems Institute', source: 'Indeed', kind: 'fellowship' }
];
let countFrame = 0;
let countInterval = 0;
let simulationVisible = false;
let simulationStarted = false;
let inboxTotal = 28;
let activityIndex = 0;
let lastApplication = null;
const reduceSimulationMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stopOngoingCount() {
  if (!countInterval) return;
  window.clearInterval(countInterval);
  countInterval = 0;
}

function startOngoingCount() {
  if (!count || countInterval || reduceSimulationMotion || !simulationVisible) return;
  countInterval = window.setInterval(() => {
    if (!countFrame) count.textContent = String(Number(count.textContent) + 1);
    rollApplicationActivity();
  }, 1400);
}

function readApplication(row) {
  const details = row?.querySelector('small')?.textContent.split(' · ') ?? [];
  const title = row?.querySelector('.job-row strong')?.textContent ?? row?.querySelector('strong')?.textContent ?? 'STEM position';
  return {
    row,
    title,
    company: details[0] ?? 'Example employer',
    source: details[1] ?? 'Company site',
    kind: row?.dataset.kind ?? (title.toLowerCase().includes('fellowship') ? 'fellowship' : title.toLowerCase().includes('intern') ? 'internship' : 'job')
  };
}

function makeApplicationRow(sample) {
  const row = document.createElement('article');
  row.className = 'job-row is-arriving';
  row.dataset.kind = sample.kind;

  const sourceMark = document.createElement('span');
  sourceMark.className = `job-source-mark${sample.source === 'Indeed' ? ' job-source-indeed' : ''}`;
  const logo = document.createElement('img');
  logo.src = sample.source === 'Indeed' ? '/assets/indeed.svg' : '/assets/linkedin.svg';
  logo.alt = '';
  sourceMark.append(logo);

  const details = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = sample.title;
  const company = document.createElement('small');
  company.textContent = `${sample.company} · ${sample.source}`;
  details.append(title, company);

  const status = document.createElement('span');
  status.className = 'status-label status-pending';
  status.textContent = 'Submitted';
  row.append(sourceMark, details, status);
  return row;
}

function makeRejectionEmail(application) {
  const email = document.createElement('article');
  email.className = 'email-row is-arriving';

  const checkbox = document.createElement('span');
  checkbox.className = 'email-checkbox';
  checkbox.setAttribute('aria-hidden', 'true');
  const star = document.createElement('span');
  star.className = 'email-star';
  star.setAttribute('aria-hidden', 'true');
  star.textContent = '☆';
  const sender = document.createElement('strong');
  sender.className = 'email-sender';
  sender.textContent = application.company;
  const subject = document.createElement('div');
  subject.className = 'email-subject';
  const subjectTitle = document.createElement('strong');
  subjectTitle.textContent = application.kind === 'fellowship'
    ? `Fellowship decision: ${application.title}`
    : application.kind === 'internship'
      ? `Update on your ${application.title} application`
      : `Update on your ${application.title} application`;
  const subjectSnippet = document.createElement('span');
  subjectSnippet.textContent = application.kind === 'fellowship'
    ? ' — Thank you for applying. We are unable to offer you a fellowship this cycle.'
    : application.kind === 'internship'
      ? ' — We have filled this internship with another candidate. Thank you for your interest.'
      : ' — We have decided to move forward with applicants whose experience more closely matches the role.';
  subject.append(subjectTitle, subjectSnippet);
  const time = document.createElement('time');
  time.textContent = 'Just now';
  email.append(checkbox, star, sender, subject, time);
  return email;
}

function updateInboxTotal() {
  inboxTotalElements?.forEach((element) => { element.textContent = String(inboxTotal); });
}

function rollApplicationActivity() {
  if (!applicationList || !emailList) return;

  if (lastApplication) {
    const status = lastApplication.row.querySelector('.status-label');
    if (status) {
      status.className = 'status-label status-rejected';
      status.textContent = lastApplication.kind === 'fellowship' ? 'Declined' : 'Not selected';
    }
    emailList.prepend(makeRejectionEmail(lastApplication));
    inboxTotal += 1;
    updateInboxTotal();
    while (emailList.children.length > 3) emailList.lastElementChild.remove();
  }

  const sample = applicationSamples[activityIndex % applicationSamples.length];
  activityIndex += 1;
  const row = makeApplicationRow(sample);
  applicationList.append(row);
  while (applicationList.children.length > 4) applicationList.firstElementChild.remove();
  lastApplication = { ...sample, row };
}

function resetSimulationActivity() {
  if (!applicationList || !emailList) return;
  applicationList.innerHTML = initialApplicationMarkup;
  emailList.innerHTML = initialEmailMarkup;
  inboxTotal = 28;
  activityIndex = 0;
  lastApplication = readApplication(applicationList.lastElementChild);
  updateInboxTotal();
}

function playApplicationSimulation() {
  if (!simulation || !count) return;
  if (countFrame) cancelAnimationFrame(countFrame);
  stopOngoingCount();
  resetSimulationActivity();
  simulation.classList.remove('is-running');
  count.textContent = '0';
  void simulation.offsetWidth;
  simulation.classList.add('is-running');
  startOngoingCount();

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
    else countFrame = 0;
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
