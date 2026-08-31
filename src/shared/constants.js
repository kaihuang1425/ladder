/* Ladder — shared constants and storage helpers.
   Loaded as a classic script in content scripts, popup and options,
   and via importScripts() in the service worker. Attaches to globalThis.Ladder. */
(function (root) {
  'use strict';

  const NS = (root.Ladder = root.Ladder || {});

  /* ---------------------------------------------------------------- schema */

  const SCHEMA_VERSION = 1;

  /* Labels and blurbs live in the locale dictionaries under rung.<n>.label
     and rung.<n>.blurb, so a rung is just its number here. */
  const HINT_LEVELS = [
    { level: 1, key: 'restate', icon: '1' },
    { level: 2, key: 'nudge', icon: '2' },
    { level: 3, key: 'approach', icon: '3' },
    { level: 4, key: 'plan', icon: '4' },
    { level: 5, key: 'solution', icon: '5' }
  ];

  const LANGUAGES = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#',
    'Go', 'Rust', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'Scala', 'SQL'
  ];

  const DEFAULT_SETTINGS = {
    schema: SCHEMA_VERSION,
    locale: 'auto',          // auto | en | zh-TW | zh-CN | es
    provider: '',            // '' until the user configures one
    models: {},              // { providerId: modelName }
    beginnerMode: true,      // explain every term, no assumed CS background
    spoilerGuard: true,      // blur level-5 answers until clicked
    autoOpen: false,         // open the panel automatically on problem pages
    theme: 'auto',           // auto | light | dark
    panelWidth: 460,
    language: 'Python',
    sendCode: true,          // allow the editor's code to be sent with reviews
    temperature: 0.4,
    lastTab: 'coach'
  };

  const DEFAULT_STATS = {
    streak: 0,
    lastActiveDay: '',
    problemsSeen: 0,
    hintsUsed: 0,
    solved: 0
  };

  /* --------------------------------------------------------------- storage */

  const AREA = () => chrome.storage.local;

  async function getAll() {
    const raw = await AREA().get(['settings', 'keys', 'problems', 'stats']);
    return {
      settings: Object.assign({}, DEFAULT_SETTINGS, raw.settings || {}),
      keys: raw.keys || {},
      problems: raw.problems || {},
      stats: Object.assign({}, DEFAULT_STATS, raw.stats || {})
    };
  }

  async function getSettings() {
    const { settings } = await AREA().get('settings');
    return Object.assign({}, DEFAULT_SETTINGS, settings || {});
  }

  async function setSettings(patch) {
    const current = await getSettings();
    const next = Object.assign({}, current, patch);
    await AREA().set({ settings: next });
    return next;
  }

  async function getKeys() {
    const { keys } = await AREA().get('keys');
    return keys || {};
  }

  async function setKey(providerId, value) {
    const keys = await getKeys();
    if (value) keys[providerId] = value;
    else delete keys[providerId];
    await AREA().set({ keys });
    return keys;
  }

  async function getProblem(id) {
    const { problems } = await AREA().get('problems');
    return (problems || {})[id] || null;
  }

  async function saveProblem(id, patch) {
    const { problems } = await AREA().get('problems');
    const all = problems || {};
    const prev = all[id] || {
      id,
      hintLevel: 0,
      notes: '',
      status: 'attempting',
      attempts: 0,
      firstSeen: Date.now(),
      history: [],
      reviewDue: 0,
      reviewStep: 0
    };
    all[id] = Object.assign(prev, patch, { lastSeen: Date.now() });
    await AREA().set({ problems: all });
    return all[id];
  }

  async function bumpStats(patch) {
    const { stats } = await AREA().get('stats');
    const s = Object.assign({}, DEFAULT_STATS, stats || {});
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastActiveDay !== today) {
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      s.streak = s.lastActiveDay === yesterday ? s.streak + 1 : 1;
      s.lastActiveDay = today;
    }
    for (const [k, v] of Object.entries(patch || {})) {
      s[k] = (s[k] || 0) + v;
    }
    await AREA().set({ stats: s });
    return s;
  }

  /* Spaced repetition: 1d, 3d, 7d, 16d, 35d. */
  const REVIEW_STEPS = [1, 3, 7, 16, 35];

  function nextReview(step) {
    const days = REVIEW_STEPS[Math.min(step, REVIEW_STEPS.length - 1)];
    return Date.now() + days * 864e5;
  }

  /* ----------------------------------------------------------------- utils */

  function problemId(site, slug) {
    return `${site}:${slug}`;
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function relTime(ts) {
    const T = NS.t || function (k) { return k; };
    if (!ts) return T('time.never');
    const d = Math.round((ts - Date.now()) / 864e5);
    if (d === 0) return T('time.today');
    if (d === 1) return T('time.tomorrow');
    if (d === -1) return T('time.yesterday');
    return d > 0 ? T('time.inDays', { n: d }) : T('time.agoDays', { n: -d });
  }

  Object.assign(NS, {
    SCHEMA_VERSION,
    HINT_LEVELS,
    LANGUAGES,
    DEFAULT_SETTINGS,
    DEFAULT_STATS,
    REVIEW_STEPS,
    getAll,
    getSettings,
    setSettings,
    getKeys,
    setKey,
    getProblem,
    saveProblem,
    bumpStats,
    nextReview,
    problemId,
    clamp,
    relTime
  });
})(typeof globalThis !== 'undefined' ? globalThis : self);
