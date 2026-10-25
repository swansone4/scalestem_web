document.documentElement.classList.add('js-enabled');

const monthContent = [
  {
    eyebrow: '01 / DEFINE',
    title: 'Connect the role to a research question.',
    copy: 'Clarify the skills your target path calls for, choose a computational question, and shape a realistic project with your mentor.',
    output: 'A focused question + project plan'
  },
  {
    eyebrow: '02 / BUILD',
    title: 'Turn the question into a working model.',
    copy: 'Work through the research, methods, and computational tools needed to build and evaluate your project, with mentor guidance as you go.',
    output: 'A computational project + documented methods'
  },
  {
    eyebrow: '03 / COMMUNICATE',
    title: 'Review the work. Make it easy to show.',
    copy: 'Analyze what you found, develop a technical write-up with mentor and graduate-student feedback, and shape a clear account of the project.',
    output: 'A reviewed document + resume-ready evidence'
  }
];

const monthTabs = [...document.querySelectorAll('.month-tab')];
const monthPanel = document.querySelector('.month-panel');

function setMonth(index) {
  const content = monthContent[index];
  if (!content || !monthPanel) return;
  monthTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  monthPanel.querySelector('.panel-index').textContent = content.eyebrow;
  monthPanel.setAttribute('aria-labelledby', `month-${index + 1}`);
  monthPanel.querySelector('[data-panel-title]').textContent = content.title;
  monthPanel.querySelector('[data-panel-copy]').textContent = content.copy;
  monthPanel.querySelector('[data-panel-output]').textContent = content.output;
  monthPanel.classList.remove('panel-change');
  requestAnimationFrame(() => monthPanel.classList.add('panel-change'));
  document.querySelector('.month-nav')?.style.setProperty('--active-month', index);
}

monthTabs.forEach((tab) => {
  tab.addEventListener('click', () => setMonth(Number(tab.dataset.month)));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = (Number(tab.dataset.month) + direction + monthTabs.length) % monthTabs.length;
    setMonth(next);
    monthTabs[next].focus();
  });
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('open', open);
});
navigation?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('[data-mailto-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const details = [...fields.entries()]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key === 'target' ? 'Target role / research interest' : key}: ${value}`)
    .join('\n');
  const subject = encodeURIComponent('ScaleSTEM future cohort interest');
  const body = encodeURIComponent(details);
  form.querySelector('[data-form-status]').textContent = 'Your email draft is opening. Review it and press Send to register your interest.';
  window.location.href = `mailto:scalestem@gmail.com?subject=${subject}&body=${body}`;
});
