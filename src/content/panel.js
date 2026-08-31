/* Ladder - the side-by-side panel.
   Lives in a shadow root so the host site cannot style it and it cannot
   style the host site. Never sees an API key: it asks the service worker
   to stream, and receives text back. */
(function () {
  'use strict';

  if (window.__ladderLoaded) return;
  window.__ladderLoaded = true;

  const L = window.Ladder;
  const T = function (key, vars) { return L.t(key, vars); };
  const ICONS = {
    ladder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 2v20M17 2v20M7 7h10M7 12h10M7 17h10"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9c-4 0-9-3-9-9z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
    dock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>'
  };

  const TABS = ['coach', 'learn', 'code', 'notes', 'progress'];

  const state = {
    settings: null,
    problem: null,
    record: null,
    thread: [],
    tab: 'coach',
    open: false,
    streaming: false,
    port: null,
    seq: 0,
    dock: true
  };

  let host, shadow, root, els = {};

  /* ------------------------------------------------------------- plumbing */

  function connect() {
    if (state.port) return state.port;
    state.port = chrome.runtime.connect({ name: 'ladder' });
    state.port.onDisconnect.addListener(function () { state.port = null; });
    return state.port;
  }

  function $(sel) { return shadow.querySelector(sel); }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function toast(text) {
    if (!els.toast) return;
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(els.toast._t);
    els.toast._t = setTimeout(function () {
      els.toast.classList.remove('show');
    }, 2200);
  }

  /* ---------------------------------------------------------------- shell */

  async function buildShell() {
    host = document.createElement('div');
    host.id = 'ladder-root';
    host.style.cssText = 'all:initial;position:static;';
    shadow = host.attachShadow({ mode: 'open' });

    const cssUrl = chrome.runtime.getURL('src/content/panel.css');
    let css = '';
    try {
      css = await (await fetch(cssUrl)).text();
    } catch (_) { /* fall through with no styles rather than crash */ }
    const style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);

    root = el('div', 'root');
    root.hidden = true;
    root.innerHTML = [
      '<div class="resizer"></div>',
      '<div class="head">',
      '  <div class="brand">',
      '    <div class="mark">' + ICONS.ladder + '</div>',
      '    <div class="titles">',
      '      <div class="p-title"></div>',
      '      <div class="p-sub"></div>',
      '    </div>',
      '  </div>',
      '  <button class="icon-btn" data-act="reread" title="' + T('head.reread') + '">' + ICONS.refresh + '</button>',
      '  <button class="icon-btn" data-act="dock" title="' + T('head.dock') + '">' + ICONS.dock + '</button>',
      '  <button class="icon-btn" data-act="theme" title="' + T('head.theme') + '">' + ICONS.theme + '</button>',
      '  <button class="icon-btn" data-act="settings" title="' + T('head.settings') + '">' + ICONS.gear + '</button>',
      '  <button class="icon-btn" data-act="close" title="' + T('head.close') + '">' + ICONS.close + '</button>',
      '</div>',
      '<div class="tabs" role="tablist"></div>',
      TABS.map(function (id) {
        return '<div class="pane" data-pane="' + id + '" hidden></div>';
      }).join(''),
      '<div class="composer" hidden>',
      '  <div class="composer-row">',
      '    <textarea rows="1" placeholder="' + T('composer.placeholder') + '"></textarea>',
      '    <button class="send" title="' + T('composer.send') + '">' + ICONS.send + '</button>',
      '  </div>',
      '  <div class="composer-foot">',
      '    <span class="hint-state"></span><span class="spacer"></span>',
      '    <select class="lang-select" title="' + T('composer.langTitle') + '"></select>',
      '  </div>',
      '</div>',
      '<div class="toast"></div>'
    ].join('');
    shadow.appendChild(root);

    const launcher = el('button', 'launcher', ICONS.ladder);
    launcher.title = T('head.launcher');
    launcher.hidden = true;
    shadow.appendChild(launcher);

    document.documentElement.appendChild(host);

    els = {
      root: root,
      launcher: launcher,
      title: $('.p-title'),
      sub: $('.p-sub'),
      tabs: $('.tabs'),
      composer: $('.composer'),
      input: $('.composer textarea'),
      send: $('.send'),
      hintState: $('.hint-state'),
      langSelect: $('.lang-select'),
      toast: $('.toast'),
      panes: {}
    };
    for (const id of TABS) {
      els.panes[id] = shadow.querySelector('[data-pane="' + id + '"]');
    }

    buildTabs();
    wireHeader();
    wireComposer();
    wireResizer();
    launcher.addEventListener('click', function () { setOpen(true); });
  }

  function buildTabs() {
    els.tabs.innerHTML = '';
    for (const id of TABS) {
      const b = el('button', 'tab', T('tab.' + id));
      b.setAttribute('role', 'tab');
      b.dataset.tab = id;
      b.setAttribute('aria-selected', String(id === state.tab));
      b.addEventListener('click', function () { setTab(id); });
      els.tabs.appendChild(b);
    }
  }

  function wireHeader() {
    root.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'close') setOpen(false);
      else if (act === 'settings') chrome.runtime.sendMessage({ type: 'openOptions' });
      else if (act === 'theme') cycleTheme();
      else if (act === 'dock') toggleDock();
      else if (act === 'reread') reread();
    });

    root.addEventListener('click', function (e) {
      const copy = e.target.closest('[data-copy]');
      if (!copy) return;
      const pre = copy.closest('.md-code').querySelector('code');
      navigator.clipboard.writeText(pre.textContent).then(function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1400);
      });
    });
  }

  function wireComposer() {
    const ta = els.input;
    ta.addEventListener('input', function () {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitChat();
      }
      e.stopPropagation();
    });
    els.send.addEventListener('click', submitChat);

    for (const lang of L.LANGUAGES) {
      const o = document.createElement('option');
      o.value = lang;
      o.textContent = lang;
      els.langSelect.appendChild(o);
    }
    els.langSelect.addEventListener('change', async function () {
      state.settings = await L.setSettings({ language: els.langSelect.value });
      toast(T('toast.codeLang', { lang: els.langSelect.value }));
    });
  }

  function wireResizer() {
    const r = $('.resizer');
    let startX = 0, startW = 0;

    function move(e) {
      const w = L.clamp(startW + (startX - e.clientX), 320, window.innerWidth * 0.9);
      root.style.width = w + 'px';
      applyDock();
    }
    function up() {
      r.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.body.style.userSelect = '';
      L.setSettings({ panelWidth: parseInt(root.style.width, 10) || 460 });
    }
    r.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startX = e.clientX;
      startW = root.getBoundingClientRect().width;
      r.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  /* ------------------------------------------------------------ docking */

  let dockStyle = null;

  function applyDock() {
    if (!dockStyle) {
      dockStyle = document.createElement('style');
      dockStyle.id = 'ladder-dock';
      document.documentElement.appendChild(dockStyle);
    }
    if (state.open && state.dock) {
      // Use the width we asked for, not the measured one: on the first open the
      // element has not been laid out yet and measures at its CSS min-width,
      // which would dock the page to the wrong offset.
      const intended = parseInt(root.style.width, 10);
      const w = Math.round(
        intended || root.getBoundingClientRect().width || state.settings.panelWidth || 460
      );
      dockStyle.textContent =
        'html{margin-right:' + w + 'px !important;' +
        'width:calc(100% - ' + w + 'px) !important;' +
        'overflow-x:hidden !important;}';
    } else {
      dockStyle.textContent = '';
    }
  }

  async function toggleDock() {
    state.dock = !state.dock;
    applyDock();
    await L.setSettings({ dockPanel: state.dock });
    toast(T(state.dock ? 'toast.docked' : 'toast.floating'));
  }

  /* ------------------------------------------------------------- language */

  /* Header titles and placeholders are baked into the shell's markup, so
     switching language has to refresh them in place rather than waiting for
     the next render. */
  function applyLocaleChrome() {
    const set = function (sel, attr, key) {
      const n = $(sel);
      if (n) n.setAttribute(attr, T(key));
    };
    set('[data-act="reread"]', 'title', 'head.reread');
    set('[data-act="dock"]', 'title', 'head.dock');
    set('[data-act="theme"]', 'title', 'head.theme');
    set('[data-act="settings"]', 'title', 'head.settings');
    set('[data-act="close"]', 'title', 'head.close');
    set('.composer textarea', 'placeholder', 'composer.placeholder');
    set('.send', 'title', 'composer.send');
    set('.lang-select', 'title', 'composer.langTitle');
    if (els.launcher) els.launcher.title = T('head.launcher');

    const locale = L.getLocale();
    root.setAttribute('lang', locale);
    // Chinese needs its own stack or the browser falls back to a Latin face
    // and renders CJK in whatever it can find.
    const font = L.localeFont(locale);
    if (font) root.style.setProperty('--font', font);
    else root.style.removeProperty('--font');

    buildTabs();
  }

  /* -------------------------------------------------------------- theming */

  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme() {
    root.dataset.theme = resolveTheme(state.settings.theme);
  }

  async function cycleTheme() {
    const order = ['auto', 'light', 'dark'];
    const next = order[(order.indexOf(state.settings.theme) + 1) % 3];
    state.settings = await L.setSettings({ theme: next });
    applyTheme();
    toast(T('toast.theme', { mode: T('theme.' + next) }));
  }

  /* -------------------------------------------------------------- opening */

  function setOpen(open) {
    state.open = open;
    root.hidden = !open;
    els.launcher.hidden = open;
    applyDock();
    if (open) {
      render();
      setTimeout(function () { els.input.focus(); }, 40);
    }
  }

  function setTab(id) {
    state.tab = id;
    for (const b of els.tabs.querySelectorAll('.tab')) {
      b.setAttribute('aria-selected', String(b.dataset.tab === id));
    }
    for (const pid of TABS) els.panes[pid].hidden = pid !== id;
    els.composer.hidden = !(id === 'coach' || id === 'code' || id === 'learn');
    L.setSettings({ lastTab: id });
    render();
  }

  /* -------------------------------------------------------------- problem */

  function problemKey() {
    return L.problemId(state.problem.site, state.problem.slug);
  }

  async function loadProblem() {
    state.problem = L.readProblem();
    const id = problemKey();
    state.record = (await L.getProblem(id)) || (await L.saveProblem(id, {
      site: state.problem.site,
      title: state.problem.title,
      url: state.problem.url,
      difficulty: state.problem.difficulty
    }));
    if (!state.record.title || state.record.title === 'Untitled problem') {
      state.record = await L.saveProblem(id, { title: state.problem.title });
    }
    state.thread = Array.isArray(state.record.history) ? state.record.history : [];
    await L.bumpStats({ problemsSeen: 0 });
  }

  async function reread() {
    await loadProblem();
    render();
    toast(T(state.problem.ok ? 'toast.reread' : 'toast.rereadFail'));
  }

  function headerText() {
    els.title.textContent = state.problem.title || T('head.appName');
    const bits = [state.problem.siteLabel];
    if (state.problem.difficulty) bits.push(state.problem.difficulty);
    const p = state.settings.provider;
    if (p && L.PROVIDERS && L.PROVIDERS[p]) bits.push(L.PROVIDERS[p].label);
    els.sub.textContent = bits.filter(Boolean).join(' · ');
  }

  /* --------------------------------------------------------------- render */

  function render() {
    if (!state.settings || !state.problem) return;
    applyTheme();
    headerText();
    els.langSelect.value = state.settings.language || 'Python';
    els.hintState.textContent =
      T('composer.hintState', { n: state.record.hintLevel || 0 });

    if (state.tab === 'coach') renderCoach();
    else if (state.tab === 'learn') renderLearn();
    else if (state.tab === 'code') renderCode();
    else if (state.tab === 'notes') renderNotes();
    else if (state.tab === 'progress') renderProgress();
  }

  function needsSetupNotice() {
    if (state.settings.provider) return null;
    const n = el('div', 'notice');
    n.innerHTML = '<h4></h4><p></p>';
    n.querySelector('h4').textContent = T('notice.setup.title');
    n.querySelector('p').textContent = T('notice.setup.body');
    const b = el('button', 'btn', T('notice.setup.cta'));
    b.addEventListener('click', function () {
      chrome.runtime.sendMessage({ type: 'openOptions' });
    });
    n.appendChild(b);
    return n;
  }

  function noStatementNotice() {
    if (state.problem.ok) return null;
    const n = el('div', 'notice bad');
    n.innerHTML = '<h4></h4><p></p>';
    n.querySelector('h4').textContent = T('notice.nostmt.title');
    n.querySelector('p').textContent = T('notice.nostmt.body');
    return n;
  }

  /* -------------------------------------------------------------- Coach */

  function renderCoach() {
    const pane = els.panes.coach;
    pane.innerHTML = '';

    const setup = needsSetupNotice();
    if (setup) { pane.appendChild(setup); }
    const nos = noStatementNotice();
    if (nos) pane.appendChild(nos);

    pane.appendChild(el('div', 'section-label', T('coach.ladder')));
    pane.appendChild(el('div', 'rung-note', T('coach.ladderNote')));

    const rungs = el('div', 'rungs');
    const level = state.record.hintLevel || 0;
    for (const h of L.HINT_LEVELS) {
      const b = el('button', 'rung');
      const stateName = h.level <= level ? 'done' : (h.level === level + 1 ? 'next' : 'locked');
      b.dataset.state = stateName;
      b.innerHTML =
        '<span class="n">' + h.icon + '</span>' +
        '<span><span class="l"></span><span class="b"></span></span>';
      b.querySelector('.l').textContent = T('rung.' + h.level + '.label');
      b.querySelector('.b').textContent = T('rung.' + h.level + '.blurb');
      b.disabled = state.streaming;
      b.addEventListener('click', function () { askHint(h.level); });
      rungs.appendChild(b);
    }
    pane.appendChild(rungs);

    pane.appendChild(el('div', 'section-label', T('coach.quick')));
    const chips = el('div', 'chips');
    for (const kind of ['concepts', 'testcases', 'dryrun', 'optimize']) {
      const c = el('button', 'chip', T('quick.' + kind));
      c.addEventListener('click', function () { ask(kind, {}); });
      chips.appendChild(c);
    }
    pane.appendChild(chips);

    const thread = el('div', 'thread');
    thread.dataset.thread = '1';
    pane.appendChild(thread);
    for (const m of state.thread) thread.appendChild(messageEl(m));
    scrollThread();
  }

  function messageEl(m) {
    if (m.role === 'user') {
      const n = el('div', 'msg user');
      n.textContent = m.content;
      return n;
    }
    const n = el('div', 'msg');
    const spoiler = state.settings.spoilerGuard && m.level === 5;
    n.innerHTML =
      '<div class="msg-head">' +
      (m.level ? '<span class="lvl">' + T('msg.hintBadge', { n: m.level }) + '</span>' : '') +
      '<span>' + T('msg.author') + '</span>' +
      '<span class="spacer"></span></div>' +
      '<div class="msg-body md-out' + (spoiler ? ' spoiler' : '') + '"></div>';
    const body = n.querySelector('.msg-body');
    body.innerHTML = L.md(m.content || '');
    if (spoiler) {
      const rev = el('div', 'reveal', '<span></span>');
      rev.querySelector('span').textContent = T('msg.reveal');
      rev.addEventListener('click', function () {
        body.classList.remove('spoiler');
        rev.remove();
      });
      body.appendChild(rev);
    }
    return n;
  }

  function scrollThread() {
    const pane = els.panes[state.tab];
    if (pane) pane.scrollTop = pane.scrollHeight;
  }

  /* --------------------------------------------------------------- Learn */

  function renderLearn() {
    const pane = els.panes.learn;
    pane.innerHTML = '';

    const found = L.glossaryDetect(
      (state.problem.statement || '') + ' ' + (state.problem.title || '')
    );

    pane.appendChild(el('div', 'section-label',
      T(found.length ? 'learn.found' : 'learn.fallback')));

    const list = found.length ? found : L.glossaryAll().slice(0, 14);
    pane.appendChild(el('div', 'rung-note', found.length
      ? T(found.length === 1 ? 'learn.foundNote.one' : 'learn.foundNote.other',
          { n: found.length })
      : T('learn.fallbackNote')));

    for (const t of list) {
      const d = el('details', 'term');
      d.innerHTML =
        '<summary>' + L.escapeHtml(t.term) + '</summary>' +
        '<div class="body">' + L.escapeHtml(t.def) +
        '<div class="why">' + L.escapeHtml(t.why) + '</div>' +
        '<div class="ask"></div></div>';
      const ask = d.querySelector('.ask');
      const b = el('button', 'chip', T('learn.explain'));
      b.addEventListener('click', function () {
        setTab('coach');
        askGlossary(t.term);
      });
      ask.appendChild(b);
      pane.appendChild(d);
    }

    pane.appendChild(el('div', 'section-label', T('learn.deeper')));
    const chips = el('div', 'chips');
    const c1 = el('button', 'chip', T('learn.concepts'));
    c1.addEventListener('click', function () { setTab('coach'); ask('concepts', {}); });
    chips.appendChild(c1);
    const c2 = el('button', 'chip',
      T(state.settings.beginnerMode ? 'learn.beginnerOff' : 'learn.beginnerOn'));
    c2.addEventListener('click', async function () {
      state.settings = await L.setSettings({ beginnerMode: !state.settings.beginnerMode });
      toast(T(state.settings.beginnerMode
        ? 'toast.beginnerOn' : 'toast.beginnerOff'));
      render();
    });
    chips.appendChild(c2);
    pane.appendChild(chips);
  }

  /* ---------------------------------------------------------------- Code */

  function renderCode() {
    const pane = els.panes.code;
    pane.innerHTML = '';

    const grabbed = L.readCode();

    const f1 = el('div', 'field');
    f1.innerHTML = '<label><span class="lbl"></span> <span class="hint"></span></label>';
    f1.querySelector('.lbl').textContent = T('code.yourCode');
    f1.querySelector('.hint').textContent =
      T(grabbed ? 'code.grabbed' : 'code.notGrabbed');
    const ta = el('textarea', 'code-input');
    ta.value = state.record.draftCode || grabbed || '';
    ta.placeholder = T('code.placeholder');
    ta.addEventListener('input', function () {
      clearTimeout(ta._t);
      ta._t = setTimeout(function () {
        L.saveProblem(problemKey(), { draftCode: ta.value });
      }, 500);
    });
    f1.appendChild(ta);
    pane.appendChild(f1);

    const f2 = el('div', 'field');
    f2.innerHTML = '<label><span class="lbl"></span> <span class="hint"></span></label>';
    f2.querySelector('.lbl').textContent = T('code.errLabel');
    f2.querySelector('.hint').textContent = T('code.optional');
    const err = el('textarea', 'code-input');
    err.style.minHeight = '70px';
    err.placeholder = T('code.errPlaceholder');
    err.value = state.record.draftError || '';
    err.addEventListener('input', function () {
      clearTimeout(err._t);
      err._t = setTimeout(function () {
        L.saveProblem(problemKey(), { draftError: err.value });
      }, 500);
    });
    f2.appendChild(err);
    pane.appendChild(f2);

    const chips = el('div', 'chips');
    for (const kind of ['review', 'debug', 'optimize', 'dryrun']) {
      const c = el('button', 'chip', T('code.' + kind));
      c.addEventListener('click', function () {
        if (!ta.value.trim()) { toast(T('toast.needCode')); return; }
        setTab('coach');
        ask(kind, { code: ta.value, error: err.value });
      });
      chips.appendChild(c);
    }
    pane.appendChild(chips);

    pane.appendChild(el('div', 'section-label', T('code.mark')));
    const marks = el('div', 'chips');
    const solved = el('button', 'chip',
      T(state.record.status === 'solved' ? 'code.solvedDone' : 'code.solved'));
    solved.addEventListener('click', async function () {
      const step = (state.record.reviewStep || 0);
      state.record = await L.saveProblem(problemKey(), {
        status: 'solved',
        reviewStep: step + 1,
        reviewDue: L.nextReview(step)
      });
      await L.bumpStats({ solved: 1 });
      toast(T('toast.solvedMark', { when: L.relTime(state.record.reviewDue) }));
      render();
    });
    marks.appendChild(solved);

    const stuck = el('button', 'chip', T('code.stuck'));
    stuck.addEventListener('click', async function () {
      state.record = await L.saveProblem(problemKey(), {
        status: 'stuck',
        reviewDue: Date.now() + 864e5
      });
      toast(T('toast.stuckMark'));
      render();
    });
    marks.appendChild(stuck);
    pane.appendChild(marks);
  }

  /* --------------------------------------------------------------- Notes */

  function renderNotes() {
    const pane = els.panes.notes;
    pane.innerHTML = '';
    pane.appendChild(el('div', 'section-label', T('notes.title')));
    pane.appendChild(el('div', 'rung-note', T('notes.note')));

    const ta = el('textarea', 'notes-area');
    ta.value = state.record.notes || '';
    ta.placeholder = T('notes.placeholder');
    ta.addEventListener('input', function () {
      clearTimeout(ta._t);
      ta._t = setTimeout(async function () {
        state.record = await L.saveProblem(problemKey(), { notes: ta.value });
      }, 400);
    });
    pane.appendChild(ta);

    const chips = el('div', 'chips');
    const summarize = el('button', 'chip', T('notes.summarize'));
    summarize.addEventListener('click', function () {
      setTab('coach');
      ask('chat', { userText: T('notes.summarizePrompt') });
    });
    chips.appendChild(summarize);
    pane.appendChild(chips);
  }

  /* ------------------------------------------------------------ Progress */

  async function renderProgress() {
    const pane = els.panes.progress;
    pane.innerHTML = '<div class="empty"></div>';
    pane.firstChild.textContent = T('progress.loading');
    const all = await L.getAll();
    const problems = Object.values(all.problems || {});
    const solved = problems.filter(function (p) { return p.status === 'solved'; });
    const due = problems
      .filter(function (p) { return p.reviewDue && p.reviewDue <= Date.now(); })
      .sort(function (a, b) { return a.reviewDue - b.reviewDue; });

    pane.innerHTML = '';
    const grid = el('div', 'stat-grid');
    const stats = [
      [all.stats.streak || 0, 'progress.streak'],
      [solved.length, 'progress.solved'],
      [problems.length, 'progress.seen'],
      [all.stats.hintsUsed || 0, 'progress.hints']
    ];
    for (const [v, k] of stats) {
      const cell = el('div', 'stat', '<div class="v"></div><div class="k"></div>');
      cell.querySelector('.v').textContent = v;
      cell.querySelector('.k').textContent = T(k);
      grid.appendChild(cell);
    }
    pane.appendChild(grid);

    pane.appendChild(el('div', 'section-label', T('progress.due')));
    if (!due.length) {
      const e = el('div', 'empty');
      e.textContent = T('progress.dueEmpty');
      pane.appendChild(e);
    } else {
      const list = el('div', 'plist');
      for (const p of due.slice(0, 12)) list.appendChild(problemRow(p, 'due'));
      pane.appendChild(list);
    }

    pane.appendChild(el('div', 'section-label', T('progress.recent')));
    const recent = problems
      .sort(function (a, b) { return (b.lastSeen || 0) - (a.lastSeen || 0); })
      .slice(0, 15);
    if (!recent.length) {
      const e2 = el('div', 'empty');
      e2.textContent = T('progress.recentEmpty');
      pane.appendChild(e2);
    } else {
      const list = el('div', 'plist');
      for (const p of recent) list.appendChild(problemRow(p));
      pane.appendChild(list);
    }
  }

  function problemRow(p, kind) {
    const a = el('a', 'pitem');
    a.href = p.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const badge = p.status === 'solved'
      ? '<span class="badge solved">' + L.escapeHtml(T('badge.solved')) + '</span>'
      : (kind === 'due'
        ? '<span class="badge due">' + L.escapeHtml(T('badge.review')) + '</span>' : '');
    a.innerHTML =
      '<span class="t">' + L.escapeHtml(p.title || p.id) + '</span>' +
      badge +
      '<span class="m">' +
      (p.hintLevel ? L.escapeHtml(T('progress.hintN', { n: p.hintLevel })) : '') +
      '</span>';
    return a;
  }

  /* ------------------------------------------------------------ requests */

  function persistThread() {
    L.saveProblem(problemKey(), { history: state.thread.slice(-20) });
  }

  function askHint(level) {
    const current = state.record.hintLevel || 0;
    if (level > current + 1 && current < 5) {
      const skipped = level - current - 1;
      const ok = confirm(T(
        skipped === 1 ? 'confirm.skip.one' : 'confirm.skip.other',
        { n: skipped, label: T('rung.' + level + '.label') }
      ));
      if (!ok) return;
    }
    ask('hint', { level: level });
  }

  function askGlossary(term) {
    ask('glossary', { userText: T('ask.glossary', { term: term }) });
  }

  function submitChat() {
    const text = els.input.value.trim();
    if (!text || state.streaming) return;
    els.input.value = '';
    els.input.style.height = 'auto';
    ask('chat', { userText: text });
  }

  async function ask(kind, opts) {
    if (state.streaming) { toast(T('toast.busy')); return; }
    opts = opts || {};

    if (state.tab !== 'coach') setTab('coach');
    const thread = els.panes.coach.querySelector('[data-thread]');
    if (!thread) return;

    const userText = opts.userText || null;
    if (userText) {
      const um = { role: 'user', content: userText };
      state.thread.push(um);
      thread.appendChild(messageEl(um));
    } else {
      const label = kind === 'hint'
        ? T('rung.' + (opts.level || 1) + '.label')
        : (L.hasKey('ask.' + kind) ? T('ask.' + kind) : T('ask.fallback'));
      const um = { role: 'user', content: label };
      state.thread.push(um);
      thread.appendChild(messageEl(um));
    }

    const holder = el('div', 'msg');
    holder.innerHTML =
      '<div class="msg-head">' +
      (kind === 'hint'
        ? '<span class="lvl">' + T('msg.hintBadge', { n: opts.level }) + '</span>' : '') +
      '<span>' + T('msg.author') + '</span><span class="spacer"></span>' +
      '<span class="typing"><i></i><i></i><i></i></span></div>' +
      '<div class="msg-body md-out"></div>';
    const body = holder.querySelector('.msg-body');
    thread.appendChild(holder);
    scrollThread();

    state.streaming = true;
    els.send.disabled = true;

    const requestId = 'r' + (++state.seq);
    const port = connect();
    let buffer = '';
    let raf = 0;

    const paint = function () {
      raf = 0;
      body.innerHTML = L.md(buffer);
      scrollThread();
    };

    const onMsg = function (msg) {
      if (msg.requestId !== requestId) return;

      if (msg.type === 'delta') {
        buffer += msg.delta;
        if (!raf) raf = requestAnimationFrame(paint);
        return;
      }

      if (msg.type === 'done') {
        if (raf) cancelAnimationFrame(raf);
        finish(buffer, null);
        return;
      }

      if (msg.type === 'error') {
        if (raf) cancelAnimationFrame(raf);
        finish(buffer, msg);
        return;
      }

      if (msg.type === 'aborted') {
        if (raf) cancelAnimationFrame(raf);
        finish(buffer || T('msg.stopped'), null);
      }
    };

    const finish = async function (text, errMsg) {
      port.onMessage.removeListener(onMsg);
      state.streaming = false;
      els.send.disabled = false;
      holder.querySelector('.typing').remove();

      if (errMsg) {
        const note = el('div', 'notice bad');
        note.innerHTML = '<h4></h4><p></p>';
        note.querySelector('h4').textContent = T('notice.error.title');
        note.querySelector('p').textContent = errMsg.error;
        if (errMsg.needsSetup) {
          const b = el('button', 'btn', T('notice.error.cta'));
          b.addEventListener('click', function () {
            chrome.runtime.sendMessage({ type: 'openOptions' });
          });
          note.appendChild(b);
        }
        body.innerHTML = '';
        body.appendChild(note);
        if (!text) {
          state.thread.pop();  // drop the unanswered user turn
          persistThread();
        }
        return;
      }

      // Always paint the final text. requestAnimationFrame is suspended while
      // the tab is in the background, so the incremental paints may never have
      // run even though every delta arrived.
      body.innerHTML = L.md(text);

      const record = { role: 'assistant', content: text };
      if (kind === 'hint') record.level = opts.level;
      state.thread.push(record);
      persistThread();

      if (kind === 'hint' && opts.level > (state.record.hintLevel || 0)) {
        state.record = await L.saveProblem(problemKey(), { hintLevel: opts.level });
        await L.bumpStats({ hintsUsed: 1 });
        renderRungsOnly();
      }
      if (state.settings.spoilerGuard && kind === 'hint' && opts.level === 5) {
        // rebuild this bubble so the spoiler cover is applied
        const fresh = messageEl(record);
        holder.replaceWith(fresh);
      }
      els.hintState.textContent =
        T('composer.hintState', { n: state.record.hintLevel || 0 });
    };

    port.onMessage.addListener(onMsg);
    port.postMessage({
      type: 'stream',
      requestId: requestId,
      opts: {
        kind: kind,
        level: opts.level,
        problem: state.problem,
        code: opts.code || (state.settings.sendCode ? state.record.draftCode : ''),
        error: opts.error,
        history: state.thread.slice(0, -1),
        hintLevel: state.record.hintLevel || 0,
        userText: userText
      },
      maxTokens: kind === 'hint' && opts.level === 5 ? 6000 : 3000
    });
  }

  function renderRungsOnly() {
    const pane = els.panes.coach;
    const rungs = pane.querySelector('.rungs');
    if (!rungs) return;
    const level = state.record.hintLevel || 0;
    const buttons = rungs.querySelectorAll('.rung');
    buttons.forEach(function (b, i) {
      const lvl = i + 1;
      b.dataset.state = lvl <= level ? 'done' : (lvl === level + 1 ? 'next' : 'locked');
    });
  }

  /* ----------------------------------------------------------- messaging */

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || !msg.type) return;
    if (msg.type === 'ladder:toggle') {
      setOpen(!state.open);
      sendResponse({ ok: true, open: state.open });
    } else if (msg.type === 'ladder:open') {
      setOpen(true);
      sendResponse({ ok: true });
    } else if (msg.type === 'ladder:next-hint') {
      setOpen(true);
      askHint(Math.min((state.record.hintLevel || 0) + 1, 5));
      sendResponse({ ok: true });
    } else if (msg.type === 'ladder:status') {
      sendResponse({
        ok: true,
        open: state.open,
        title: state.problem && state.problem.title,
        site: state.problem && state.problem.siteLabel,
        found: state.problem && state.problem.ok,
        hintLevel: state.record && state.record.hintLevel
      });
    }
    return false;
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'local' || !changes.settings) return;
    const before = L.getLocale();
    state.settings = Object.assign({}, L.DEFAULT_SETTINGS, changes.settings.newValue || {});
    const after = L.setLocale(L.resolveLocale(state.settings.locale));
    if (after !== before) applyLocaleChrome();
    if (state.open) render();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.open && shadow.activeElement !== els.input) {
      setOpen(false);
    }
  }, true);

  /* Single-page navigation: LeetCode swaps problems without a reload. */
  let lastUrl = location.href;
  setInterval(function () {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    setTimeout(async function () {
      await loadProblem();
      if (state.open) render();
    }, 900);
  }, 1200);

  /* ----------------------------------------------------------------- boot */

  (async function boot() {
    state.settings = await L.getSettings();
    // Language must be resolved before the shell is built: its titles and
    // placeholders are rendered once, from markup.
    L.setLocale(L.resolveLocale(state.settings.locale));
    state.dock = state.settings.dockPanel !== false;
    state.tab = state.settings.lastTab || 'coach';

    await buildShell();
    root.style.width = (state.settings.panelWidth || 460) + 'px';
    applyLocaleChrome();

    await loadProblem();
    setTab(state.tab);

    const supported = L.isProblemPage();
    els.launcher.hidden = !supported;

    if (state.settings.autoOpen && supported && state.problem.ok) {
      setOpen(true);
    } else {
      applyTheme();
    }
  })();
})();
