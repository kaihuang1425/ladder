/* Ladder toolbar popup. */
(function () {
  'use strict';

  const L = window.Ladder;
  const T = function (key, vars) { return L.t(key, vars); };
  const $ = function (id) { return document.getElementById(id); };

  async function activeTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function askContent(tabId, msg) {
    try {
      return await chrome.tabs.sendMessage(tabId, msg);
    } catch (_) {
      return null;
    }
  }

  (async function boot() {
    const settings = await L.getSettings();
    L.setLocale(L.resolveLocale(settings.locale));
    L.applyLocale(document);
    const font = L.localeFont();
    if (font) document.body.style.fontFamily = font;
    const all = await L.getAll();
    const tab = await activeTab();

    /* provider line */
    const pv = $('provider');
    if (settings.provider && L.PROVIDERS[settings.provider]) {
      const p = L.PROVIDERS[settings.provider];
      pv.textContent = p.label + ' · ' + L.modelFor(p, settings);
      pv.className = 'ok';
    } else {
      pv.textContent = T('popup.noProvider');
    }

    /* current page */
    const ctx = $('context');
    const status = tab && tab.id ? await askContent(tab.id, { type: 'ladder:status' }) : null;

    if (status && status.title) {
      ctx.innerHTML =
        '<div class="t"></div><div class="s"></div>';
      ctx.querySelector('.t').textContent = status.title;
      ctx.querySelector('.s').textContent = (status.site || '') + ' · ' +
        (status.hintLevel
          ? T('popup.hintLevel', { n: status.hintLevel })
          : T('popup.noHints'));
      if (!status.found) {
        ctx.classList.add('warn');
        ctx.querySelector('.s').textContent = T('popup.noStatement');
      }
    } else {
      const host = tab && tab.url ? new URL(tab.url).hostname : '';
      ctx.classList.add('warn');
      ctx.innerHTML = '<div class="t"></div><div class="s"></div>';
      ctx.querySelector('.t').textContent = T('popup.notProblem');
      ctx.querySelector('.s').textContent =
        T(host ? 'popup.notProblemBody' : 'popup.openProblem');
    }

    /* actions */
    $('open').addEventListener('click', async function () {
      if (!tab || !tab.id) return;
      await chrome.runtime.sendMessage({ type: 'togglePanelInTab', tabId: tab.id });
      window.close();
    });

    $('hint').addEventListener('click', async function () {
      if (!tab || !tab.id) return;
      const sent = await askContent(tab.id, { type: 'ladder:next-hint' });
      if (!sent) {
        await chrome.runtime.sendMessage({ type: 'togglePanelInTab', tabId: tab.id });
      }
      window.close();
    });

    $('hint').disabled = !settings.provider;

    /* stats */
    const problems = Object.values(all.problems || {});
    const solved = problems.filter(function (p) { return p.status === 'solved'; }).length;
    $('stats').innerHTML = [
      [all.stats.streak || 0, 'popup.streak'],
      [solved, 'popup.solved'],
      [problems.length, 'popup.seen']
    ].map(function (s) {
      return '<div class="stat"><div class="v">' + s[0] + '</div>' +
        '<div class="k">' + L.escapeHtml(T(s[1])) + '</div></div>';
    }).join('');

    /* review queue */
    const due = problems
      .filter(function (p) { return p.reviewDue && p.reviewDue <= Date.now(); })
      .sort(function (a, b) { return a.reviewDue - b.reviewDue; })
      .slice(0, 4);

    if (due.length) {
      $('due-wrap').classList.remove('hidden');
      const box = $('due');
      box.innerHTML = '';
      for (const p of due) {
        const a = document.createElement('a');
        a.className = 'due-item';
        a.href = p.url || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = p.title || p.id;
        box.appendChild(a);
      }
    }

    $('settings').addEventListener('click', function () {
      chrome.runtime.openOptionsPage();
      window.close();
    });
  })();
})();
