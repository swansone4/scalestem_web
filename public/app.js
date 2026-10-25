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
