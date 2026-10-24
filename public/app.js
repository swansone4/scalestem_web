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
    navigation.classList.remove('open');
  });
});

document.querySelector('[data-mailto-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const fields = new FormData(form);
  const details = [...fields.entries()]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const subject = encodeURIComponent('Prospective ScaleSTEM student interest');
  const body = encodeURIComponent(details);
  const status = form.querySelector('[data-form-status]');
  status.textContent = 'Your email app is opening with your details. Review the message and press Send to submit your interest.';
  window.location.href = `mailto:scalestem@gmail.com?subject=${subject}&body=${body}`;
});
