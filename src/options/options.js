/* Ladder settings page. */
(function () {
  'use strict';

  const L = window.Ladder;
  const T = function (key, vars) { return L.t(key, vars); };
  const $ = function (id) { return document.getElementById(id); };

  let settings = null;
  let keys = {};

  /* ------------------------------------------------------------- helpers */

  function maskedValue(key) {
    if (!key) return '';
    if (key.length <= 10) return '•'.repeat(key.length);
    return key.slice(0, 6) + '•'.repeat(Math.max(4, key.length - 10)) + key.slice(-4);
  }

  function setStatus() {
    const pill = $('status-pill');
    const p = settings.provider && L.PROVIDERS[settings.provider];
    if (!p) {
      pill.textContent = T('opt.status.none');
      pill.classList.remove('ok');
      return;
    }
    pill.textContent = T('opt.status.using', {
      provider: p.label, model: L.modelFor(p, settings)
    });
    pill.classList.add('ok');
  }

  /* ----------------------------------------------------------- providers */

  function providerCard(id) {
    const p = L.PROVIDERS[id];
    const card = document.createElement('div');
    card.className = 'prov' + (settings.provider === id ? ' active' : '');
    card.dataset.provider = id;

    const tags = [];
    if (p.free) tags.push('<span class="tag">' + T('opt.prov.free') + '</span>');
    if (p.local) tags.push('<span class="tag local">' + T('opt.prov.local') + '</span>');

    card.innerHTML = [
      '<div class="prov-head">',
      '  <span class="prov-name">' + p.label + '</span>',
      tags.join(''),
      '  <span class="spacer"></span>',
      '  <button class="use-btn' + (settings.provider === id ? ' on' : '') + '" data-use>' +
      T(settings.provider === id ? 'opt.prov.inUse' : 'opt.prov.use') + '</button>',
      '</div>',
      '<div class="prov-tag">' + L.escapeHtml(L.providerTagline(id)) + '</div>',
      p.configurable
        ? '<input class="txt" data-base placeholder="' +
          L.escapeHtml(T('opt.prov.basePlaceholder')) + '">'
        : '',
      p.local
        ? '<input class="txt" data-base placeholder="' + p.base + '">'
        : '',
      p.noKey ? '' : [
        '<div class="key-row">',
        '  <input type="password" data-key placeholder="' +
        L.escapeHtml(L.providerKeyHint(id) || T('opt.prov.keyPlaceholder')) +
        '" autocomplete="off" spellcheck="false">',
        '  <button class="mini" data-toggle>' + T('opt.prov.show') + '</button>',
        '  <button class="mini" data-save>' + T('opt.prov.save') + '</button>',
        '</div>'
      ].join(''),
      '<div class="model-row">',
      '  <label>' + T('opt.prov.model') + '</label>',
      p.configurable || p.local
        ? '<input class="txt" data-model placeholder="' +
          L.escapeHtml(p.defaultModel || T('opt.prov.modelPlaceholder')) + '">'
        : '<select data-model></select>',
      '  <button class="mini" data-test>' + T('opt.prov.test') + '</button>',
      '</div>',
      '<div class="prov-foot">',
      p.keyUrl
        ? '<a href="' + p.keyUrl + '" target="_blank" rel="noopener">' +
          T(p.noKey ? 'opt.prov.install' : 'opt.prov.getKey') + '</a>'
        : '',
      '  <span class="spacer"></span>',
      '  <span class="result" data-result></span>',
      '</div>'
    ].join('');

    /* key field */
    const keyInput = card.querySelector('[data-key]');
    if (keyInput) {
      if (keys[id]) {
        keyInput.value = keys[id];
        keyInput.dataset.saved = '1';
      }
      const toggle = card.querySelector('[data-toggle]');
      toggle.addEventListener('click', function () {
        const showing = keyInput.type === 'text';
        keyInput.type = showing ? 'password' : 'text';
        toggle.textContent = T(showing ? 'opt.prov.show' : 'opt.prov.hide');
      });
      card.querySelector('[data-save]').addEventListener('click', async function () {
        const v = keyInput.value.trim();
        keys = await L.setKey(id, v);
        const res = card.querySelector('[data-result]');
        if (v) {
          res.className = 'result ok';
          res.textContent = T('opt.res.saved');
          if (!settings.provider) await useProvider(id);
        } else {
          res.className = 'result';
          res.textContent = T('opt.res.removed');
        }
        setStatus();
      });
      keyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') card.querySelector('[data-save]').click();
      });
    }

    /* base URL for custom / local */
    const baseInput = card.querySelector('[data-base]');
    if (baseInput) {
      baseInput.value = id === 'custom'
        ? (settings.customBase || '')
        : (settings.ollamaBase || '');
      baseInput.addEventListener('change', async function () {
        const patch = {};
        if (id === 'custom') patch.customBase = baseInput.value.trim();
        else patch.ollamaBase = baseInput.value.trim();
        settings = await L.setSettings(patch);
        maybeRequestPermission(baseInput.value.trim(), card);
      });
    }

    /* model field */
    const modelField = card.querySelector('[data-model]');
    if (modelField.tagName === 'SELECT') {
      fillModels(modelField, p.models, L.modelFor(p, settings));
    } else {
      modelField.value = (settings.models && settings.models[id]) || '';
    }
    modelField.addEventListener('change', async function () {
      const models = Object.assign({}, settings.models || {});
      models[id] = modelField.value;
      settings = await L.setSettings({ models: models });
      setStatus();
    });

    /* test */
    card.querySelector('[data-test]').addEventListener('click', function () {
      testProvider(id, card);
    });

    /* use */
    card.querySelector('[data-use]').addEventListener('click', function () {
      useProvider(id);
    });

    return card;
  }

  function fillModels(select, models, current) {
    select.innerHTML = '';
    const list = models.slice();
    if (current && list.indexOf(current) < 0) list.unshift(current);
    for (const m of list) {
      const o = document.createElement('option');
      o.value = m;
      o.textContent = m;
      if (m === current) o.selected = true;
      select.appendChild(o);
    }
  }

  async function useProvider(id) {
    settings = await L.setSettings({ provider: id });
    renderProviders();
    setStatus();
  }

  async function testProvider(id, card) {
    const p = L.PROVIDERS[id];
    const res = card.querySelector('[data-result]');
    const keyInput = card.querySelector('[data-key]');
    const key = keyInput ? keyInput.value.trim() : '';

    if (!key && !p.noKey) {
      res.className = 'result bad';
      res.textContent = T('opt.res.needKey');
      return;
    }

    res.className = 'result busy';
    res.textContent = T('opt.res.testing');

    const overrides = {};
    const baseInput = card.querySelector('[data-base]');
    if (baseInput && baseInput.value.trim()) {
      if (id === 'custom') overrides.customBase = baseInput.value.trim();
      else overrides.ollamaBase = baseInput.value.trim();
    }

    const reply = await chrome.runtime.sendMessage({
      type: 'testKey', providerId: id, key: key, overrides: overrides
    });

    if (!reply || !reply.ok) {
      res.className = 'result bad';
      res.textContent = (reply && reply.error) || T('opt.res.failed');
      return;
    }

    res.className = 'result ok';
    res.textContent = reply.models && reply.models.length
      ? T('opt.res.workingN', { n: reply.models.length })
      : T('opt.res.working');

    // Replace the hard-coded list with what this account can actually reach.
    const modelField = card.querySelector('[data-model]');
    if (modelField.tagName === 'SELECT' && reply.models && reply.models.length) {
      const current = L.modelFor(p, settings);
      const ranked = reply.models.slice().sort(function (a, b) {
        const pa = p.models.indexOf(a), pb = p.models.indexOf(b);
        if (pa >= 0 && pb >= 0) return pa - pb;
        if (pa >= 0) return -1;
        if (pb >= 0) return 1;
        return a.localeCompare(b);
      });
      fillModels(modelField, ranked, current);
    }
  }

  function maybeRequestPermission(url, card) {
    if (!/^https?:\/\//i.test(url)) return;
    let origin;
    try { origin = new URL(url).origin + '/*'; } catch (_) { return; }
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) return;
    // Requested here rather than in the service worker: Chrome only grants
    // optional permissions from inside a user gesture, which does not survive
    // a trip through runtime messaging.
    chrome.permissions.request({ origins: [origin] }, function (granted) {
      const res = card.querySelector('[data-result]');
      if (granted) {
        res.className = 'result ok';
        res.textContent = T('opt.res.permOk', { origin: origin });
      } else {
        res.className = 'result bad';
        res.textContent = T('opt.res.permNo', { origin: origin });
      }
    });
  }

  function renderProviders() {
    const box = $('providers');
    box.innerHTML = '';
    for (const id of L.PROVIDER_ORDER) box.appendChild(providerCard(id));
  }

  /* ---------------------------------------------------------- smart paste */

  function wireSmartPaste() {
    const input = $('smart-key');
    const note = $('smart-note');
    const save = $('smart-save');

    const describe = function () {
      const v = input.value.trim();
      if (!v) {
        note.className = 'paste-note';
        note.textContent = T('opt.paste.hint');
        return null;
      }
      const id = L.detectProvider(v);
      if (id) {
        note.className = 'paste-note ok';
        note.textContent = T('opt.paste.detected', { provider: L.PROVIDERS[id].label });
      } else {
        note.className = 'paste-note';
        note.textContent = T('opt.paste.unknownType');
      }
      return id;
    };

    input.addEventListener('input', describe);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') save.click();
    });

    save.addEventListener('click', async function () {
      const v = input.value.trim();
      if (!v) { input.focus(); return; }
      const id = L.detectProvider(v);
      if (!id) {
        note.className = 'paste-note bad';
        note.textContent = T('opt.paste.unknownSave');
        return;
      }
      keys = await L.setKey(id, v);
      settings = await L.setSettings({ provider: id });
      input.value = '';
      note.className = 'paste-note ok';
      note.textContent = T('opt.paste.savedTesting', { provider: L.PROVIDERS[id].label });
      renderProviders();
      setStatus();
      const card = document.querySelector('[data-provider="' + id + '"]');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await testProvider(id, card);
        const res = card.querySelector('[data-result]');
        note.className = 'paste-note ' + (res.classList.contains('ok') ? 'ok' : 'bad');
        note.textContent = res.classList.contains('ok')
          ? T('opt.paste.savedOk')
          : T('opt.paste.savedFail', { error: res.textContent });
      }
    });
  }

  /* --------------------------------------------------------- preferences */

  function wirePrefs() {
    const bind = function (id, prop, event) {
      const node = $(id);
      const isCheck = node.type === 'checkbox';
      if (isCheck) node.checked = !!settings[prop];
      else node.value = settings[prop];
      node.addEventListener(event || 'change', async function () {
        settings = await L.setSettings({ [prop]: isCheck ? node.checked : node.value });
      });
    };

    bind('beginnerMode', 'beginnerMode');
    bind('spoilerGuard', 'spoilerGuard');
    bind('autoOpen', 'autoOpen');
    bind('sendCode', 'sendCode');
    bind('theme', 'theme');

    const lang = $('language');
    for (const l of L.LANGUAGES) {
      const o = document.createElement('option');
      o.value = l; o.textContent = l;
      lang.appendChild(o);
    }
    lang.value = settings.language || 'Python';
    lang.addEventListener('change', async function () {
      settings = await L.setSettings({ language: lang.value });
    });

    const temp = $('temperature');
    const out = $('temperature-out');
    temp.value = Math.round((settings.temperature != null ? settings.temperature : 0.4) * 10);
    out.textContent = (temp.value / 10).toFixed(1);
    temp.addEventListener('input', function () {
      out.textContent = (temp.value / 10).toFixed(1);
    });
    temp.addEventListener('change', async function () {
      settings = await L.setSettings({ temperature: Number(temp.value) / 10 });
    });
  }

  /* ----------------------------------------------------------------- data */

  function wireData() {
    const note = $('data-note');

    $('export').addEventListener('click', async function () {
      const all = await L.getAll();
      // Never write keys into a file the user might share.
      const payload = {
        exportedAt: new Date().toISOString(),
        app: 'ladder',
        schema: L.SCHEMA_VERSION,
        settings: Object.assign({}, all.settings, { models: all.settings.models }),
        problems: all.problems,
        stats: all.stats
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ladder-progress-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      note.className = 'data-note ok';
      note.textContent = T('opt.data.exported');
    });

    $('import').addEventListener('click', function () { $('import-file').click(); });

    $('import-file').addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.app !== 'ladder') throw new Error(T('opt.data.notLadder'));
        const current = await L.getAll();
        const merged = Object.assign({}, current.problems, data.problems || {});
        await chrome.storage.local.set({
          problems: merged,
          stats: Object.assign({}, current.stats, data.stats || {})
        });
        note.className = 'data-note ok';
        note.textContent = T('opt.data.imported', {
          n: Object.keys(data.problems || {}).length
        });
      } catch (err) {
        note.className = 'data-note bad';
        note.textContent = T('opt.data.importFail', { error: err.message });
      }
      e.target.value = '';
    });

    $('clear').addEventListener('click', async function () {
      const ok = confirm(T('opt.data.confirmClear'));
      if (!ok) return;
      await chrome.storage.local.clear();
      settings = await L.getSettings();
      keys = {};
      renderProviders();
      wirePrefs();
      setStatus();
      note.className = 'data-note ok';
      note.textContent = T('opt.data.cleared');
    });
  }

  /* ----------------------------------------------------------------- boot */

  /* Redraw everything that carries text after a language change. */
  function applyLanguage() {
    L.applyLocale(document);
    const font = L.localeFont();
    document.body.style.fontFamily = font || '';
    $('start-title').textContent =
      T(settings.provider ? 'opt.start.title2' : 'opt.start.title');
    fillLocaleSelect($('uiLang'), true);
    fillLocaleSelect($('uiLangTop'), false);
    renderProviders();
    setStatus();
  }

  /* The picker names each language in that language, so someone who cannot
     read the current UI can still find their own. */
  function fillLocaleSelect(select, withAuto) {
    if (!select) return;
    select.innerHTML = '';
    if (withAuto) {
      const auto = document.createElement('option');
      auto.value = 'auto';
      auto.textContent = T('lang.auto');
      select.appendChild(auto);
    }
    for (const code of L.LOCALE_ORDER) {
      const o = document.createElement('option');
      o.value = code;
      o.textContent = L.LOCALE_NAMES[code];
      select.appendChild(o);
    }
    select.value = withAuto ? (settings.locale || 'auto') : L.getLocale();
  }

  function wireLocalePickers() {
    const onPick = async function (value) {
      settings = await L.setSettings({ locale: value });
      L.setLocale(L.resolveLocale(settings.locale));
      applyLanguage();
    };
    $('uiLang').addEventListener('change', function () { onPick(this.value); });
    $('uiLangTop').addEventListener('change', function () { onPick(this.value); });
  }

  (async function boot() {
    settings = await L.getSettings();
    keys = await L.getKeys();
    L.setLocale(L.resolveLocale(settings.locale));

    renderProviders();
    wireSmartPaste();
    wirePrefs();
    wireData();
    wireLocalePickers();
    applyLanguage();
  })();
})();
