/* Fakes just enough of the extension APIs that the real content scripts run
   on a plain web page. Used to eyeball the panel and to check the adapters
   against realistic markup without packing the extension. */
(function () {
  'use strict';

  const store = JSON.parse(localStorage.getItem('ladder-fixture') || '{}');
  const listeners = { message: [], changed: [] };

  function persist() {
    localStorage.setItem('ladder-fixture', JSON.stringify(store));
  }

  /* ?seedLocale=xx sets the language before the page's own script boots, so a
     one-shot screenshot can capture a specific locale. */
  const seedLocale = new URLSearchParams(location.search).get('seedLocale');
  if (seedLocale) {
    store.settings = Object.assign({}, store.settings, { locale: seedLocale });
    persist();
  }

  /* A canned answer so the streaming path, markdown rendering, copy buttons
     and the spoiler cover can all be exercised offline. */
  const CANNED = {
    1: [
      '**In plain English**',
      '',
      'You are handed a row of numbers and one target number. Find the two',
      'positions whose numbers add up to the target, and hand back those two',
      'positions.',
      '',
      '**What you are given**',
      '',
      '- `nums` — the row of numbers. It can hold up to 10,000 of them.',
      '- `target` — the single number the pair has to add up to.',
      '',
      'Because `nums` can hold 10,000 numbers, checking every possible pair means',
      'about 50 million checks. That is on the edge of too slow.',
      '',
      '**Work one example by hand**',
      '',
      '| step | looking at | need to find | in the row? |',
      '|------|-----------|--------------|-------------|',
      '| 1 | 2 (position 0) | 9 - 2 = 7 | yes, position 1 |',
      '',
      'So the answer is `[0, 1]`.'
    ].join('\n'),
    5: [
      '**Solution**',
      '',
      '```python',
      'def two_sum(nums, target):',
      '    seen = {}                      # value -> the position we saw it at',
      '    for i, n in enumerate(nums):',
      '        need = target - n          # the partner this number is waiting for',
      '        if need in seen:',
      '            return [seen[need], i]',
      '        seen[n] = i',
      '    return []',
      '```',
      '',
      '**Complexity**',
      '',
      'One pass over the row, and each lookup is instant, so the work grows in',
      'step with the input: O(n) time, O(n) space.'
    ].join('\n')
  };

  const DEFAULT_REPLY = [
    '**Notice this**',
    '',
    'Every time you look at a number, you already know exactly which partner it',
    'needs — it is just `target` minus the number in front of you.',
    '',
    '**Ask yourself**',
    '',
    '1. If I knew instantly whether a particular number was somewhere in the row,',
    '   how many passes would I need?',
    '2. What would I have to write down as I go, to make that true?',
    '',
    '**Try this first**',
    '',
    'Take the sample row on paper. For each number, write down the partner it',
    'needs. Then look at your two columns side by side.'
  ].join('\n');

  window.chrome = {
    i18n: { getUILanguage: function () { return 'en-US'; } },
    runtime: {
      id: 'fixture',
      getURL: function (p) { return '/' + p; },
      openOptionsPage: function () { window.open('/src/options/options.html', '_blank'); },
      sendMessage: function (msg) {
        if (msg && msg.type === 'openOptions') {
          window.open('/src/options/options.html', '_blank');
        }
        if (msg && msg.type === 'testKey') {
          return Promise.resolve({
            ok: true,
            models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
          });
        }
        return Promise.resolve({ ok: true });
      },
      onMessage: {
        addListener: function (fn) { listeners.message.push(fn); }
      },
      connect: function () {
        const port = {
          _handlers: [],
          onMessage: {
            addListener: function (fn) { port._handlers.push(fn); },
            removeListener: function (fn) {
              port._handlers = port._handlers.filter(function (h) { return h !== fn; });
            }
          },
          onDisconnect: { addListener: function () {} },
          postMessage: function (msg) {
            if (msg.type !== 'stream') return;
            const level = msg.opts && msg.opts.level;
            const text = CANNED[level] || DEFAULT_REPLY;
            const emit = function (m) {
              port._handlers.slice().forEach(function (h) { h(m); });
            };
            emit({ type: 'start', requestId: msg.requestId });
            // stream it in word-sized chunks, like a real provider
            const words = text.match(/\S+\s*/g) || [];

            // Background tabs clamp timers, which stalls the simulated stream.
            // Instant mode delivers the whole thing in one go for tests.
            if (window.__ladderTest && window.__ladderTest.instant) {
              for (const w of words) {
                emit({ type: 'delta', requestId: msg.requestId, delta: w });
              }
              emit({ type: 'done', requestId: msg.requestId, ms: 0 });
              return;
            }

            let i = 0;
            const tick = function () {
              if (i >= words.length) {
                emit({ type: 'done', requestId: msg.requestId, ms: 900 });
                return;
              }
              emit({ type: 'delta', requestId: msg.requestId, delta: words[i++] });
              setTimeout(tick, 12);
            };
            setTimeout(tick, 180);
          }
        };
        return port;
      }
    },
    storage: {
      local: {
        get: function (keys) {
          const list = Array.isArray(keys) ? keys : [keys];
          const out = {};
          for (const k of list) if (k in store) out[k] = store[k];
          return Promise.resolve(out);
        },
        set: function (obj) {
          const changes = {};
          for (const [k, v] of Object.entries(obj)) {
            changes[k] = { oldValue: store[k], newValue: v };
            store[k] = v;
          }
          persist();
          listeners.changed.forEach(function (fn) { fn(changes, 'local'); });
          return Promise.resolve();
        },
        clear: function () {
          for (const k of Object.keys(store)) delete store[k];
          persist();
          return Promise.resolve();
        }
      },
      onChanged: { addListener: function (fn) { listeners.changed.push(fn); } }
    },
    permissions: { request: function (o, cb) { cb(true); } }
  };

  /* Test controls, driven from the page or the console. */
  window.__ladderTest = {
    send: function (type) {
      listeners.message.forEach(function (fn) { fn({ type: type }, {}, function () {}); });
    },
    open: function () { window.__ladderTest.send('ladder:open'); },
    toggle: function () { window.__ladderTest.send('ladder:toggle'); },
    reset: function () { localStorage.removeItem('ladder-fixture'); location.reload(); },
    /* Switch language through the real settings path, so the storage
       listener and applyLocaleChrome() are exercised. */
    lang: function (code) { return window.Ladder.setSettings({ locale: code }); },
    seed: function (patch) {
      store.settings = Object.assign({}, store.settings, patch);
      persist();
    },
    /* Run every adapter's selectors against this page and report. */
    adapters: function () {
      const rows = [];
      for (const a of window.Ladder.ADAPTERS) {
        let title = '', statement = '', err = '';
        try { title = a.title() || ''; } catch (e) { err = e.message; }
        try { statement = a.statement() || ''; } catch (e) { err = e.message; }
        rows.push({
          id: a.id,
          title: title.slice(0, 60),
          chars: statement.length,
          err: err
        });
      }
      return rows;
    }
  };
})();
