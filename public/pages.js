// FAQ and demo pages. Everything here runs in the browser only; nothing is sent anywhere.
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const onView = (el, fn, margin = '0px 0px -10% 0px') => {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    fn();
  }, { rootMargin: margin });
  io.observe(el);
};

/* ---------- FAQ ---------- */
const faq = document.querySelector('[data-faq]');
if (faq) {
  const items = [...faq.querySelectorAll('.faq-item')];
  const jump = document.querySelector('[data-faq-jump]');
  const setOpen = (item, open) => {
    const button = item.querySelector('h2 button');
    button.setAttribute('aria-expanded', String(open));
    item.classList.toggle('is-open', open);
    if (open) item.querySelector('[data-faq-timeline]')?.classList.add('is-run');
    jump?.querySelector(`a[href="#${item.id}"]`)?.classList.toggle('is-open', open);
  };
  items.forEach((item, i) => {
    item.querySelector('h2 button').addEventListener('click', () => setOpen(item, !item.classList.contains('is-open')));
    if (jump) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${item.id}`;
      a.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>`;
      a.append(item.querySelector('.faq-q').textContent);
      a.addEventListener('click', () => setOpen(item, true));
      li.append(a);
      jump.append(li);
    }
  });
  const fromHash = items.find((item) => `#${item.id}` === window.location.hash);
  setOpen(fromHash || items[0], true);
  window.addEventListener('hashchange', () => {
    const target = items.find((item) => `#${item.id}` === window.location.hash);
    if (target) setOpen(target, true);
  });
}

/* ---------- Demo app ---------- */
const app = document.querySelector('[data-app]');
if (app) {
  const tabs = [...app.querySelectorAll('[role="tab"]')];
  const views = [...app.querySelectorAll('[role="tabpanel"]')];
  const ink = app.querySelector('[data-tab-ink]');
  const path = app.querySelector('[data-app-path]');
  const firstShow = new Map();

  const placeInk = () => {
    const on = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (!on || !ink) return;
    ink.style.width = `${on.offsetWidth}px`;
    ink.style.transform = `translateX(${on.offsetLeft}px)`;
    const list = on.parentElement;
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: on.offsetLeft - 12, behavior: calm ? 'auto' : 'smooth' });
  };

  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    views.forEach((v) => {
      const on = v.id === tab.getAttribute('aria-controls');
      v.hidden = !on;
      v.classList.toggle('is-active', on);
      if (on && !firstShow.get(v.id)) { firstShow.set(v.id, true); v.dispatchEvent(new CustomEvent('view:first')); }
    });
    if (path) path.textContent = tab.dataset.path;
    if (focus) tab.focus();
    placeInk();
    try { history.replaceState(null, '', `#${tab.dataset.path}`); } catch { /* ignore */ }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
  window.addEventListener('resize', placeInk);

  /* Learning plan: lessons, the refinement figure, checkpoints */
  const lessonBody = app.querySelector('[data-lp-body]');
  const lessonTitle = app.querySelector('[data-lp-title]');
  const lessonKicker = app.querySelector('[data-lp-kicker]');
  const lessonCard = app.querySelector('[data-lp-lesson]');
  const units = [...app.querySelectorAll('[data-lp-units] li')];
  const lockNote = app.querySelector('[data-lp-note]');
  const current = { title: lessonTitle.textContent, body: lessonBody.innerHTML };
  const past = [
    { title: 'Incompressible Navier–Stokes equations', body: `<h3>Summary</h3><p>Mass and momentum conservation for a fluid of constant density. Everything later in the course discretizes these two lines.</p>
      <div class="eq" role="math" aria-label="continuity"><span class="eq-n">(1)</span>∇ · <b>u</b> = 0</div>
      <div class="eq" role="math" aria-label="Reynolds number"><span class="eq-n">(2)</span><i>Re</i> = <span class="frac"><span><i>U L</i></span><span><i>ν</i></span></span> ≈ 2 × 10<sup>5</sup> for your airfoil</div>
      <p class="lp-passed">✓ Passed: understanding check, reading check, homework</p>` },
    { title: 'Finite volume method basics', body: `<h3>Summary</h3><p>Integrate the equations over each cell so what leaves one cell enters its neighbour. Conservation holds by construction.</p>
      <div class="eq" role="math" aria-label="integral form"><span class="eq-n">(1)</span><span class="frac"><span>d</span><span>d<i>t</i></span></span>∫<sub><i>V</i></sub> <i>φ</i> d<i>V</i> + ∮<sub><i>S</i></sub> <i>φ</i> <b>u</b> · <b>n</b> d<i>S</i> = 0</div>
      <div class="eq" role="math" aria-label="discrete form"><span class="eq-n">(2)</span><i>V<sub>i</sub></i> <span class="frac"><span>d<i>φ<sub>i</sub></i></span><span>d<i>t</i></span></span> + Σ<sub><i>f</i></sub> <i>φ<sub>f</sub></i> (<b>u</b> · <b>n</b>)<sub><i>f</i></sub> <i>A<sub>f</sub></i> = 0</div>
      <p class="lp-passed">✓ Passed: understanding check, reading check, homework</p>` },
    { title: 'Mesh generation and data structures', body: `<h3>Summary</h3><p>Structured and unstructured meshes, how cells store neighbours, and the quality metrics that predict a bad solution before you run it.</p>
      <div class="eq" role="math" aria-label="y plus"><span class="eq-n">(1)</span><i>y</i><sup>+</sup> = <span class="frac"><span><i>u<sub>τ</sub> y</i></span><span><i>ν</i></span></span> ≲ 1 at the wall</div>
      <div class="eq" role="math" aria-label="aspect ratio"><span class="eq-n">(2)</span><i>AR<sub>K</sub></i> = <span class="frac"><span>max edge</span><span>min edge</span></span></div>
      <p class="lp-passed">✓ Passed: understanding check, reading check, homework</p>` },
  ];
  const showLesson = (which) => {
    const data = which === 3 ? current : past[which];
    lessonCard.classList.remove('is-swap');
    void lessonCard.offsetWidth;
    lessonCard.classList.add('is-swap');
    lessonTitle.textContent = data.title;
    lessonKicker.textContent = `Lesson ${which + 1} of 8 · Computational fluid dynamics`;
    lessonBody.innerHTML = data.body;
    units.forEach((u, i) => u.classList.toggle('is-open', i === which));
    if (which === 3) initAmr();
  };
  units.forEach((u) => u.querySelector('button').addEventListener('click', () => {
    const key = u.querySelector('button').dataset.lesson;
    if (key === 'locked' || u.classList.contains('is-locked')) {
      lockNote.textContent = 'Locked. Pass this lesson’s checkpoints to open the next one.';
      u.classList.remove('is-shake');
      void u.offsetWidth;
      u.classList.add('is-shake');
      app.querySelector('.lp-checkpoints')?.classList.add('is-hint');
      window.setTimeout(() => app.querySelector('.lp-checkpoints')?.classList.remove('is-hint'), 1600);
      return;
    }
    lockNote.textContent = '';
    if (key === 'next') {
      lessonCard.classList.remove('is-swap'); void lessonCard.offsetWidth; lessonCard.classList.add('is-swap');
      lessonTitle.textContent = 'Refinement criteria in incompressible CFD';
      lessonKicker.textContent = 'Lesson 5 of 8 · Unlocked just now';
      lessonBody.innerHTML = '<h3>Ready when you are</h3><p>This lesson is built for your project the first time you open it: gradient, vorticity and adjoint-based criteria, compared on your teardrop wake.</p><p class="lp-passed">✓ Unlocked by passing lesson 4</p>';
      units.forEach((x) => x.classList.toggle('is-open', x === u));
      return;
    }
    showLesson(Number(key));
  }));

  const cps = [...app.querySelectorAll('[data-cp]')];
  const cpCount = app.querySelector('[data-cp-count]');
  cps.forEach((cp) => cp.addEventListener('click', () => {
    cp.classList.toggle('is-pass');
    const passed = cps.filter((c) => c.classList.contains('is-pass')).length;
    cpCount.textContent = `${passed} of ${cps.length} passed`;
    const next = units[4];
    if (passed === cps.length && next.classList.contains('is-locked')) {
      next.classList.remove('is-locked');
      next.classList.add('is-unlocked');
      next.querySelector('button').dataset.lesson = 'next';
      next.querySelector('span').textContent = '5';
      units[3].classList.replace('is-current', 'is-done');
      units[3].querySelector('span').textContent = '✓';
      lockNote.textContent = 'Lesson 5 unlocked.';
      document.querySelectorAll('.mascot-demo .mascot').forEach((m) => m.click());
    }
  }));

  function initAmr() {
    const svg = app.querySelector('[data-amr-svg]');
    const input = app.querySelector('[data-amr-input]');
    if (!svg || !input) return;
    const out = app.querySelector('[data-amr-theta]');
    const cellsOut = app.querySelector('[data-amr-cells]');
    const flaggedOut = app.querySelector('[data-amr-flagged]');
    const NS = 'http://www.w3.org/2000/svg';
    const W = 320, H = 160, N = 20;
    const eta = (x, y) => {
      const behind = Math.max(x - 128, 0);
      const width = 7 + behind * 0.09;
      const wake = x > 120 ? Math.exp(-(((y - 80) / width) ** 2)) * Math.exp(-behind / 260) : 0;
      const dx = (x - 98) / 44, dy = (y - 80) / 22;
      const body = Math.exp(-((Math.hypot(dx, dy) - 1) ** 2) * 9) * 0.85;
      return Math.min(1, Math.max(wake, body));
    };
    const draw = () => {
      const theta = Number(input.value);
      out.textContent = theta.toFixed(2);
      const g = document.createDocumentFragment();
      let cells = 0, flagged = 0;
      const cell = (x, y, s, depth) => {
        const e = Math.max(eta(x + s / 2, y + s / 2), eta(x + s * .2, y + s * .2), eta(x + s * .8, y + s * .8));
        const limit = theta + (1 - theta) * (depth === 0 ? 0 : 0.45);
        if (depth < 2 && e > limit) {
          if (depth === 0) flagged += 1;
          const h = s / 2;
          cell(x, y, h, depth + 1); cell(x + h, y, h, depth + 1); cell(x, y + h, h, depth + 1); cell(x + h, y + h, h, depth + 1);
          return;
        }
        cells += 1;
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', s); r.setAttribute('height', s);
        r.setAttribute('class', depth ? `amr-c amr-d${depth}` : 'amr-c');
        if (depth) r.style.animationDelay = `${((x / W) * 0.35).toFixed(2)}s`;
        g.append(r);
      };
      for (let y = 0; y < H; y += N) for (let x = 0; x < W; x += N) cell(x, y, N, 0);
      svg.replaceChildren(g);
      ['M-10 52 C 60 52 70 40 100 44 S 170 58 330 56', 'M-10 108 C 60 108 70 120 100 116 S 170 102 330 104', 'M-10 66 C 50 66 70 58 96 60 S 160 74 330 72', 'M-10 94 C 50 94 70 102 96 100 S 160 86 330 88'].forEach((d) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d); p.setAttribute('class', 'amr-flow');
        svg.append(p);
      });
      const body = document.createElementNS(NS, 'path');
      body.setAttribute('d', 'M58 80 C58 67 72 62 88 64 C108 67 124 75 138 80 C124 85 108 93 88 96 C72 98 58 93 58 80Z');
      body.setAttribute('class', 'amr-body');
      svg.append(body);
      cellsOut.textContent = cells;
      flaggedOut.textContent = `${Math.round((flagged / ((W / N) * (H / N))) * 100)}%`;
    };
    input.addEventListener('input', draw);
    draw();
  }
  initAmr();

  const advisorAnswer = app.querySelector('[data-type-on-view]');
  if (advisorAnswer && !calm) {
    const full = advisorAnswer.textContent;
    advisorAnswer.textContent = '';
    advisorAnswer.classList.add('is-typing');
    onView(advisorAnswer, () => {
      let i = 0;
      const tick = () => {
        i += 2;
        advisorAnswer.textContent = full.slice(0, i);
        if (i < full.length) window.setTimeout(tick, 18); else advisorAnswer.classList.remove('is-typing');
      };
      window.setTimeout(tick, 900);
    });
  }

  /* Project: journey, milestone, panels */
  const stages = [
    ['Career direction', 'CP', 'Choose the role you’re aiming for and the capabilities it asks for.'],
    ['Project scope', 'P', 'Turn that goal into a research question you can answer in about 3.5 months.'],
    ['Foundations', 'L', 'Lessons on the physics and math the project depends on.'],
    ['Methods', 'LP', 'Pick the numerical method and justify it.'],
    ['Tooling', 'P', 'Repository, environment and a first test case that runs.'],
    ['First outreach', 'CP', 'Start writing to researchers, with real work to point to.'],
    ['Mesh and convergence', 'PL', 'Show your results don’t depend on the mesh. You are here.'],
    ['Validation', 'P', 'Compare against published reference data.'],
    ['Experiments', 'P', 'Run the study your question needs.'],
    ['Analysis', 'PL', 'Turn the runs into findings you can defend.'],
    ['Outreach, round two', 'C', 'Follow up with results in hand.'],
    ['Draft write-up', 'P', 'Methods and results, written while they’re fresh.'],
    ['Technical report', 'P', 'The full report that sits next to your code.'],
    ['Review', 'PC', 'Feedback on the report and on your applications.'],
    ['Journal publication', 'P', 'Publish in the ScaleSTEM Computational Research Journal.'],
    ['Résumé and applications', 'C', 'A targeted résumé line and the roles to send it to.'],
  ];
  const stageList = app.querySelector('[data-stages]');
  const stageDesc = app.querySelector('[data-stage-desc]');
  const stageNum = app.querySelector('[data-stage-num]');
  const NOW = 6;
  const pickStage = (i) => {
    [...stageList.children].forEach((li, j) => li.querySelector('button').classList.toggle('is-sel', j === i));
    stageDesc.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `Stage ${i + 1}: ${stages[i][0]}. `;
    stageDesc.append(b, stages[i][2]);
    stageNum.textContent = i + 1;
    stageDesc.classList.remove('is-swap'); void stageDesc.offsetWidth; stageDesc.classList.add('is-swap');
  };
  stages.forEach(([name, kinds], i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = i < NOW ? 'is-done' : i === NOW ? 'is-now' : '';
    btn.setAttribute('aria-label', `Stage ${i + 1}: ${name}`);
    btn.style.setProperty('--i', i);
    btn.innerHTML = `<span>${i + 1}</span><em>${[...kinds].map((k) => `<i class="c-${k === 'L' ? 'learn' : k === 'P' ? 'proj' : 'career'}"></i>`).join('')}</em>`;
    btn.addEventListener('click', () => pickStage(i));
    li.append(btn);
    stageList.append(li);
  });
  pickStage(NOW);

  app.querySelectorAll('[data-pj-tab]').forEach((t) => t.addEventListener('click', () => {
    app.querySelectorAll('[data-pj-tab]').forEach((x) => x.classList.toggle('is-on', x === t));
    app.querySelectorAll('[data-pj-panel]').forEach((p) => {
      const on = p.dataset.pjPanel === t.dataset.pjTab;
      p.hidden = !on;
      p.classList.toggle('is-on', on);
    });
  }));

  const checks = [...app.querySelectorAll('[data-ms-checks] button')];
  const submit = app.querySelector('[data-ms-submit]');
  const status = app.querySelector('[data-ms-status]');
  const hint = app.querySelector('[data-ms-hint]');
  const sync = () => {
    const all = checks.every((c) => c.classList.contains('is-on'));
    submit.disabled = !all || submit.classList.contains('is-sent');
    if (hint) hint.hidden = all;
  };
  checks.forEach((c) => c.addEventListener('click', () => {
    if (submit.classList.contains('is-sent')) return;
    const on = !c.classList.contains('is-on');
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-pressed', String(on));
    sync();
  }));
  submit.addEventListener('click', () => {
    submit.classList.add('is-sent', 'is-busy');
    submit.disabled = true;
    submit.textContent = 'Reviewing…';
    status.textContent = '◔ In review';
    window.setTimeout(() => {
      submit.classList.remove('is-busy');
      submit.textContent = 'Submitted';
      status.textContent = '✓ Accepted';
      status.classList.add('is-ok');
      app.querySelector('[data-milestone]').classList.add('is-accepted');
      app.querySelector('[data-ms-feedback]').hidden = false;
      const tab = app.querySelector('[data-pj-tab="milestone"]');
      tab.textContent = 'Milestone (5/12 accepted)';
    }, calm ? 50 : 1400);
  });
  sync();

  /* Career: counters, status cycling */
  const careerView = app.querySelector('#view-career');
  const counters = [...careerView.querySelectorAll('[data-count]')];
  const rows = [...careerView.querySelectorAll('[data-cr-log] button')];
  const labels = ['Sent', 'Replied', 'Interview'];
  const base = {
    replies: 5 - rows.filter((r) => Number(r.dataset.state) >= 1).length,
    interviews: 2 - rows.filter((r) => Number(r.dataset.state) >= 2).length,
  };
  const recount = () => {
    const replies = base.replies + rows.filter((r) => Number(r.dataset.state) >= 1).length;
    const interviews = base.interviews + rows.filter((r) => Number(r.dataset.state) >= 2).length;
    careerView.querySelector('[data-stat="replies"]').textContent = replies;
    careerView.querySelector('[data-stat="interviews"]').textContent = interviews;
  };
  rows.forEach((r) => {
    r.className = `cr-st s${r.dataset.state}`;
    r.addEventListener('click', () => {
      const s = (Number(r.dataset.state) + 1) % 3;
      r.dataset.state = s;
      r.textContent = labels[s];
      r.className = `cr-st s${s} is-bump`;
      recount();
    });
  });
  careerView.addEventListener('view:first', () => {
    careerView.querySelector('.cr').classList.add('is-run');
    counters.forEach((c) => {
      const to = Number(c.dataset.count);
      if (calm) { c.textContent = to; return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 900, 1);
        c.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });

  /* Commons: the thread arrives, likes, a post of your own */
  const commons = app.querySelector('#view-commons');
  const posts = commons.querySelector('[data-cm-posts]');
  const typing = commons.querySelector('[data-cm-typing]');
  const wireLike = (btn) => btn.addEventListener('click', () => {
    const n = btn.querySelector('span');
    const on = !btn.classList.contains('is-on');
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    n.textContent = Number(n.textContent) + (on ? 1 : -1);
  });
  posts.querySelectorAll('[data-like]').forEach((b) => { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Like'); wireLike(b); });
  const addPost = ({ av, cls, name, handle, text, reply }) => {
    const li = document.createElement('li');
    li.className = `cm-post is-new${reply ? ' is-reply' : ''}`;
    li.innerHTML = `<span class="av ${cls}"></span><div><p class="cm-who"><b></b> <span></span></p><p class="cm-text"></p><p class="cm-act"><button type="button" data-like aria-pressed="false" aria-label="Like">♥ <span>0</span></button></p></div>`;
    li.querySelector('.av').textContent = av;
    li.querySelector('.cm-who b').textContent = name;
    li.querySelector('.cm-who span').textContent = `${handle} · just now`;
    li.querySelector('.cm-text').textContent = text;
    wireLike(li.querySelector('[data-like]'));
    posts.append(li);
    return li;
  };
  commons.addEventListener('view:first', () => {
    commons.querySelector('.cm').classList.add('is-run');
    window.setTimeout(() => typing.classList.add('is-on'), calm ? 0 : 2600);
    window.setTimeout(() => {
      typing.classList.remove('is-on');
      addPost({ av: 'MC', cls: 'av-m', name: 'Maya Chen', handle: '@maya', text: 'Ran it on three meshes: GCI 1.4% on the finest pair. Going in the report. Thanks, both!', reply: true });
    }, calm ? 0 : 4600);
  });
  const compose = commons.querySelector('[data-cm-compose]');
  const input = commons.querySelector('[data-cm-input]');
  compose.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    addPost({ av: 'You', cls: 'av-new', name: 'You', handle: '@you', text });
    input.value = '';
  });

  // Open the tab named in the address (e.g. /demo/#commons), else the learning plan.
  const fromHash = tabs.find((t) => `#${t.dataset.path}` === window.location.hash);
  select(fromHash || tabs[0]);
  if (document.fonts?.ready) document.fonts.ready.then(placeInk);
}
