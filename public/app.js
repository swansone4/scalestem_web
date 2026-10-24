const SCALESTEM_EMAIL = 'scalestem@gmail.com';

const methodology = [
  ['01', 'Career path identification', 'Start by asking what you want to do. Explore industry, research and development, or academic paths, then use a short reflection and mentor conversations to set a direction.', '01 / FIND A QUESTION', 'path'],
  ['02', 'Mentor pairing', 'Get matched with a STEM mentor whose background and interests can help you shape a meaningful, achievable project.', '02 / FIND YOUR PEOPLE', 'pair'],
  ['03', 'Research skill building', 'Work through a curated sequence covering literature searches, research communication, slide design, scientific writing, and presenting your ideas.', '03 / LEARN THE TOOLS', 'learn'],
  ['04', 'Project creation', 'Turn an interest into a computational project. Scope the question, review what is known, learn the tools you need, and build iteratively with mentor guidance.', '04 / MAKE SOMETHING', 'build'],
  ['05', 'Share your work', 'Prepare a technical report and present your project at a virtual symposium. Leave with a clear account of what you explored and learned.', '05 / SHARE THE RESULT', 'share']
];

const routes = {
  '/about': {
    title: 'Research should be within reach.', label: 'ABOUT SCALESTEM',
    intro: 'We are building a computational research community for undergraduate students who want to explore STEM, develop a project, and gain access to the mentoring and skills that help research careers begin.',
    heading: 'Our mission',
    body: 'Undergraduate research can strengthen learning and open doors to future opportunities. But students at under-resourced institutions, first-generation students, and students without established research networks may face extra barriers to getting started. ScaleSTEM exists to help close that access gap through equitable mentorship, structured research experience, and career-ready skills.',
    cards: [['A real starting point', 'You do not need to arrive with a polished research question. We help you narrow an interest into a focused, manageable project.'], ['Mentorship with structure', 'A mentor helps you navigate the work, while guided modules support communication, literature review, writing, and presenting.'], ['A result you can share', 'The goal is tangible progress: a technical project, a report, and experience explaining what you built and learned.']]
  },
  '/programs': {
    title: 'An idea becomes a research project.', label: 'THE PROGRAM',
    intro: 'ScaleSTEM follows a mentored cohort model over approximately 8–12 weeks. Students move from exploring a career direction to developing and sharing a computational research project.',
    heading: 'A guided path, shaped around you.',
    body: 'Each student is paired with a STEM mentor—such as a graduate student, researcher, academic, or industry professional. The specific project scope and schedule are shaped around the student’s interests, experience, and availability.',
    cards: [['Career path identification', 'Explore industry, R&D, and academic pathways. A guided questionnaire and mentor discussion help turn uncertainty into a useful first direction.'], ['Mentor pairing', 'Work with a STEM mentor who can help you scope your project, identify resources, and make steady progress.'], ['Project and presentation', 'Build a computational project, prepare a technical report, and practice presenting your work at a virtual symposium.']]
  }
};

const page = routes[location.pathname];
if (page) {
  document.title = `${page.title} — ScaleSTEM`;
  document.querySelector('main').innerHTML = `
    <section class="subpage-hero"><div class="eyebrow"><span class="eyebrow-line"></span>${page.label}</div><h1>${page.title}</h1><p>${page.intro}</p><a class="button button-dark" href="/apply">Register interest for a future cohort <span>↗</span></a></section>
    <section class="subpage-band"><div><div class="section-kicker">OUR MISSION</div><h2>${page.heading}</h2></div><p>${page.body}</p></section>
    <section class="method-section" id="methodology"><div class="method-heading"><div class="section-kicker">THE SCALESTEM METHODOLOGY</div><h2>Five steps from <em>curiosity to creation.</em></h2><p>An 8–12 week journey with room for different interests, starting points, and project ideas.</p></div><div class="method-list">${methodology.map(([number, title, body, label, art]) => `<article class="method-step"><div class="method-number">${number}<span></span></div><div class="method-info"><span class="method-label">${label}</span><h3>${title}</h3><p>${body}</p></div><div class="method-art method-${art}" aria-hidden="true"><span class="method-symbol">${['◎','↔','▤','⌘','↗'][Number(number)-1]}</span><span class="method-art-caption">SCALESTEM / ${number}</span></div></article>`).join('')}</div></section>
    <section class="simple-cards"><div class="section-kicker">WHAT YOU CAN EXPECT</div><div class="simple-grid">${page.cards.map(([heading, body], index) => `<article class="simple-tile"><span>0${index + 1} / SCALESTEM</span><h3>${heading}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section class="future-callout"><span class="section-kicker">PROSPECTIVE COHORT</span><h2>Interested in a future launch?</h2><p>Share your goals and availability. This form registers interest; it is not a commitment or guarantee of a program start date. We’ll follow up when cohort details are available.</p><a class="button button-dark" href="/apply">Register your interest <span>↗</span></a></section>`;
}

if (location.pathname === '/apply' || location.pathname === '/mentor' || location.pathname === '/contact') {
  const isApply = location.pathname === '/apply';
  const isMentor = location.pathname === '/mentor';
  const title = isApply ? 'Register your interest.' : isMentor ? 'Help a student take the next step.' : 'Talk to ScaleSTEM.';
  document.title = `${title} — ScaleSTEM`;
  document.querySelector('main').innerHTML = `
    <section class="subpage-hero"><div class="eyebrow"><span class="eyebrow-line"></span>${isApply ? 'PROSPECTIVE STUDENT / INTEREST FORM' : isMentor ? 'TA & MENTOR INTEREST' : 'CONTACT SCALESTEM'}</div><h1>${title}</h1><p>${isApply ? 'Interested in joining a future ScaleSTEM cohort? Tell us what you hope to explore. We’ll use your note to understand your interests and follow up when plans and dates are available.' : isMentor ? 'We welcome interest from graduate students, researchers, academics, and industry professionals who want to support undergraduate STEM research.' : 'Have a question about the community, program, or a potential partnership? Send us a note and we’ll be glad to hear from you.'}</p></section>
    <section class="form-shell"><div class="form-card"><span class="section-kicker">${isApply ? 'START HERE / ABOUT 3 MINUTES' : 'START A CONVERSATION'}</span><h2>${isApply ? 'Your first step is simple.' : isMentor ? 'A little about you' : 'How can we help?'}</h2><p>${isApply ? '1. Share your contact and school details. 2. Tell us which STEM questions interest you. 3. Submit by opening a pre-filled email to ScaleSTEM. No application account is needed.' : 'Complete the short form. Your email app will open with a message addressed to ScaleSTEM so you can review it before sending.'}</p>
      <form class="contact-form" data-mailto-form data-form-kind="${isApply ? 'student' : isMentor ? 'mentor' : 'contact'}">
        <div class="field"><label for="name">YOUR NAME</label><input id="name" name="name" autocomplete="name" required placeholder="First and last name"></div>
        <div class="field"><label for="email">EMAIL ADDRESS</label><input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
        ${isApply ? `<div class="field"><label for="school">COLLEGE OR UNIVERSITY</label><input id="school" name="school" autocomplete="organization" required placeholder="Your school"></div><div class="field"><label for="year">YEAR IN SCHOOL</label><select id="year" name="year" required><option value="">Choose one</option><option>First year</option><option>Second year</option><option>Third year</option><option>Fourth year</option><option>Graduate student</option><option>Other / prefer to share</option></select></div><div class="field full"><label for="interest">WHAT STEM AREAS OR QUESTIONS INTEREST YOU?</label><input id="interest" name="interest" required placeholder="For example: computational biology, climate modeling, robotics"></div><div class="field full"><label for="availability">COHORT AVAILABILITY (OPTIONAL)</label><input id="availability" name="availability" placeholder="Weeks, days, or hours you may be available"></div>` : isMentor ? `<div class="field full"><label for="background">YOUR FIELD OR BACKGROUND</label><input id="background" name="background" placeholder="Your research area, role, or experience"></div>` : ''}
        <div class="field full"><label for="message">${isApply ? 'WHAT WOULD YOU LIKE TO EXPLORE OR BUILD?' : 'YOUR MESSAGE'}</label><textarea id="message" name="message" required placeholder="A few sentences is plenty to get started."></textarea></div>
        ${isApply ? `<label class="consent field full"><span><input type="checkbox" name="consent" required> I understand this is an expression of interest in a prospective future cohort, not a confirmed placement or launch date.</span></label>` : ''}
        <button class="button button-dark" type="submit">${isApply ? 'Review and email my interest' : isMentor ? 'Email mentor interest' : 'Review and email my message'} <span>↗</span></button>
        <p class="form-note full" data-form-status role="status" aria-live="polite">Nothing is sent automatically. Your email opens for review; you choose whether to send.</p>
      </form>
    </div></section>`;
}

if (location.pathname === '/journal') {
  document.title = 'ScaleSTEM Research Journal';
  document.querySelector('main').innerHTML = `
    <section class="subpage-hero"><div class="eyebrow"><span class="eyebrow-line"></span>RESEARCH JOURNAL</div><h1>Work in progress.<br><em>Ideas in motion.</em></h1><p>The ScaleSTEM Research Journal is a future home for student projects, technical reports, and notes from the research process. We’re building toward it alongside the program.</p><a class="button button-dark" href="/apply">Explore a future cohort <span>↗</span></a></section>
    <section class="journal-feature"><div class="journal-graphic" aria-hidden="true"><span class="journal-orbit"></span><span class="journal-chip">RESEARCH<br>IN PROGRESS</span><span class="journal-spark">✳</span></div><div><span class="section-kicker">A PLACE FOR STUDENT WORK</span><h2>From a first question to a shareable result.</h2><p>Participants will work toward documenting a project in a technical report and presenting it at a virtual symposium. Journal publication plans and timelines will be shared as the cohort develops.</p><a class="underlined-link" href="/contact">Ask us about the journal <span>↗</span></a></div></section>`;
}

const menuButton = document.querySelector('.menu-toggle');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  document.querySelector('.nav')?.classList.toggle('open', open);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-mailto-form]');
  if (!form) return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const kind = form.dataset.formKind;
  const subject = encodeURIComponent(kind === 'student' ? 'Prospective ScaleSTEM student interest' : kind === 'mentor' ? 'ScaleSTEM mentor interest' : 'ScaleSTEM inquiry');
  const bodyParts = [...fields.entries()].filter(([key, value]) => key !== 'consent' && value).map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`);
  bodyParts.push('', 'I understand that sending this message opens my email app; I will review and send it myself.');
  const body = encodeURIComponent(bodyParts.join('\n'));
  form.querySelector('[data-form-status]').textContent = 'Your email app should open with your details ready to review. Press Send in your email app to submit your interest.';
  window.location.href = `mailto:${SCALESTEM_EMAIL}?subject=${subject}&body=${body}`;
});
