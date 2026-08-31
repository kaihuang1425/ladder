/* Drives the fixture into a named state so a headless one-shot screenshot
   captures something worth looking at. Used by tools/shots.js.
   Add ?shot=<name> to a fixture URL. */
(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  const locale = params.get('locale');
  const theme = params.get('theme');
  const width = params.get('w');
  const adapter = params.get('adapter');
  const scroll = params.get('scroll');

  // Hides the fixture toolbar for the duration of a capture.
  if (shot) document.documentElement.setAttribute('data-shot', '1');

  /* On localhost the hostname test picks the generic adapter, so the header
     reads "This page". Forcing the site adapter makes the fixture behave the
     way the extension does on the real host, which is what a screenshot
     should show. */
  if (adapter && window.Ladder && window.Ladder.adapterById) {
    const a = window.Ladder.adapterById(adapter);
    if (a) {
      window.Ladder.currentAdapter = function () { return a; };
      const realRead = window.Ladder.readProblem;
      window.Ladder.readProblem = function () {
        const p = realRead();
        try {
          p.site = a.id;
          p.siteLabel = a.label;
          p.slug = a.slug();
          p.title = a.title() || p.title;
          p.difficulty = a.difficulty() || p.difficulty;
          const st = a.statement();
          if (st && st.length > 120) { p.statement = st; p.ok = true; }
        } catch (_) { /* keep the generic read */ }
        return p;
      };
      window.Ladder.readCode = function () {
        try { return a.code ? a.code() : ''; } catch (_) { return ''; }
      };
    }
  }

  function shadow() {
    const host = document.getElementById('ladder-root');
    return host && host.shadowRoot;
  }

  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  async function until(fn, timeout) {
    const end = Date.now() + (timeout || 4000);
    while (Date.now() < end) {
      const v = fn();
      if (v) return v;
      await wait(40);
    }
    return null;
  }

  async function run() {
    if (!shot) return;

    // Instant streaming: the headless run must finish inside the virtual-time
    // budget, and background tabs clamp timers anyway.
    window.__ladderTest.instant = true;

    const patch = {};
    // A configured provider is the normal state; without it every shot is
    // dominated by the first-run setup card.
    if (params.get('seeded') !== '0') patch.provider = 'gemini';
    if (locale) patch.locale = locale;
    if (theme) patch.theme = theme;
    if (width) patch.panelWidth = Number(width);
    if (Object.keys(patch).length) {
      await window.Ladder.setSettings(patch);
      await wait(120);
    }

    window.__ladderTest.open();
    const sr = await until(shadow);
    if (!sr) return;
    await until(function () { return sr.querySelector('.rung'); });
    await wait(120);

    const tab = function (id) {
      const b = sr.querySelector('[data-tab="' + id + '"]');
      if (b) b.click();
    };

    if (shot === 'hint1') {
      sr.querySelectorAll('.rung')[0].click();
      await wait(250);
    } else if (shot === 'solution') {
      window.confirm = function () { return true; };
      sr.querySelectorAll('.rung')[4].click();
      await wait(250);
    } else if (shot === 'solution-open') {
      window.confirm = function () { return true; };
      sr.querySelectorAll('.rung')[4].click();
      await wait(250);
      const rev = sr.querySelector('.reveal');
      if (rev) rev.click();
      await wait(120);
    } else if (shot === 'learn') {
      tab('learn');
      await wait(200);
      const first = sr.querySelectorAll('.term');
      for (let i = 0; i < Math.min(3, first.length); i++) first[i].open = true;
      await wait(80);
    } else if (shot === 'code') {
      tab('code');
      await wait(200);
    } else if (shot === 'progress') {
      tab('progress');
      await wait(300);
    }

    if (scroll === 'top') {
      const pane = sr.querySelector('.pane:not([hidden])');
      if (pane) pane.scrollTop = 0;
      await wait(60);
    } else if (scroll === 'reveal') {
      const rev = sr.querySelector('.reveal');
      if (rev) rev.scrollIntoView({ block: 'center' });
      await wait(60);
    }

    // Signal readiness for --virtual-time-budget to settle on.
    document.documentElement.setAttribute('data-shot-ready', '1');
  }

  if (document.readyState === 'complete') setTimeout(run, 400);
  else window.addEventListener('load', function () { setTimeout(run, 400); });
})();
