/* Ladder self-test. Runs the shared logic and the service worker's stream
   parser under Node, with just enough of the extension APIs faked.
   Run: node tools/selftest.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
let pass = 0;
const failures = [];

function check(name, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error('returned false');
    pass++;
  } catch (e) {
    failures.push(name + ' -> ' + e.message);
  }
}
function eq(a, b, what) {
  if (a !== b) throw new Error((what || 'value') + ': expected ' + JSON.stringify(b) +
    ', got ' + JSON.stringify(a));
}
function has(hay, needle, what) {
  if (String(hay).indexOf(needle) < 0) {
    throw new Error((what || 'text') + ' is missing ' + JSON.stringify(needle));
  }
}
function lacks(hay, needle, what) {
  if (String(hay).indexOf(needle) >= 0) {
    throw new Error((what || 'text') + ' should not contain ' + JSON.stringify(needle));
  }
}

/* ---------------------------------------------------------- environment */

const store = { settings: {}, keys: {}, problems: {}, stats: {} };
globalThis.self = globalThis;
globalThis.chrome = {
  storage: {
    local: {
      get: async function (k) {
        const keys = Array.isArray(k) ? k : [k];
        const out = {};
        for (const key of keys) if (key in store) out[key] = store[key];
        return out;
      },
      set: async function (obj) { Object.assign(store, obj); },
      clear: async function () { for (const k of Object.keys(store)) delete store[k]; }
    },
    onChanged: { addListener: function () {} }
  },
  runtime: {
    onConnect: { addListener: function () {} },
    onMessage: { addListener: function () {} },
    onInstalled: { addListener: function () {} },
    openOptionsPage: function () {},
    getURL: function (p) { return 'chrome-extension://test/' + p; }
  },
  commands: { onCommand: { addListener: function () {} } },
  tabs: { query: async function () { return []; }, sendMessage: async function () {} },
  scripting: { executeScript: async function () {}, insertCSS: async function () {} },
  permissions: { request: function (o, cb) { cb(true); } }
};

function load(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
}

/* The service worker pulls the shared modules in with importScripts. */
globalThis.importScripts = function () {
  for (const p of arguments) load(p.replace(/^\//, ''));
};

load('src/shared/constants.js');
load('src/shared/i18n.js');
for (const code of ['en', 'zh-TW', 'zh-CN', 'es']) {
  load('src/shared/locales/' + code + '.js');
}
load('src/shared/providers.js');
load('src/shared/prompts.js');
load('src/shared/markdown.js');
load('src/shared/glossary.js');

const L = globalThis.Ladder;

/* ------------------------------------------------------------- markdown */

check('markdown: fenced code becomes a copyable block', function () {
  const out = L.md('Here:\n\n```python\nx = 1\n```\n');
  has(out, '<div class="md-code">');
  has(out, 'data-copy');
  has(out, 'x = 1');
  has(out, 'python');
});

check('markdown: html in model output is escaped, not executed', function () {
  const out = L.md('Try <img src=x onerror=alert(1)> and <script>bad()</script>');
  lacks(out, '<img');
  lacks(out, '<script>');
  has(out, '&lt;img');
});

check('markdown: code fence contents are escaped too', function () {
  const out = L.md('```\n<b>not bold</b>\n```');
  has(out, '&lt;b&gt;');
  lacks(out, '<b>not bold</b>');
});

check('markdown: tables render with a scroll wrapper', function () {
  const out = L.md('| i | val |\n|---|-----|\n| 0 | 5 |\n| 1 | 7 |');
  has(out, '<div class="md-table-wrap">');
  has(out, '<th>i</th>');
  has(out, '<td>7</td>');
});

check('markdown: bold, inline code and lists', function () {
  const out = L.md('**Notice** the `left` pointer:\n\n- one\n- two\n\n1. first\n2. second');
  has(out, '<strong>Notice</strong>');
  has(out, '<code>left</code>');
  has(out, '<ul>');
  has(out, '<ol>');
});

check('markdown: asterisks inside code are not turned into emphasis', function () {
  const out = L.md('use `a * b` here');
  has(out, '<code>a * b</code>');
  lacks(out, '<em>');
});

/* ------------------------------------------------------------- glossary */

check('glossary: finds terms actually present in a statement', function () {
  const statement =
    'Given an array of integers nums and an integer target, return indices of the ' +
    'two numbers such that they add up to target. You may assume exactly one answer. ' +
    'Constraints: 2 <= nums.length <= 10^4.';
  const found = L.glossaryDetect(statement);
  const names = found.map(function (f) { return f.term; });
  if (names.indexOf('array') < 0) throw new Error('missed "array": ' + names.join(','));
  if (names.indexOf('index') < 0) throw new Error('missed "index": ' + names.join(','));
  if (names.indexOf('constraints') < 0) throw new Error('missed "constraints"');
});

check('glossary: does not match a term inside a longer word', function () {
  const found = L.glossaryDetect('The setting was unremarkable and treelike.');
  const names = found.map(function (f) { return f.term; });
  if (names.indexOf('set') >= 0) throw new Error('"setting" wrongly matched "set"');
  if (names.indexOf('tree') >= 0) throw new Error('"treelike" wrongly matched "tree"');
});

check('glossary: every entry has a definition and a why', function () {
  for (const t of L.glossaryAll()) {
    if (!t.def || !t.why) throw new Error('incomplete entry: ' + t.term);
  }
  return L.GLOSSARY_COUNT >= 40;
});

check('glossary: lookup works through aliases', function () {
  eq(L.glossaryLookup('hashmap').term, 'hash map');
  eq(L.glossaryLookup('BIG-O').term, 'time complexity');
  eq(L.glossaryLookup('nonsense-term'), null);
});

/* ------------------------------------------------------------- providers */

check('providers: key shapes route to the right provider', function () {
  eq(L.detectProvider('AIzaSyD-abcdefghijklmnopqrstuvwxyz123'), 'gemini');
  eq(L.detectProvider('gsk_abcdefghijklmnopqrstuvwxyz0123456789'), 'groq');
  eq(L.detectProvider('sk-ant-api03-abcdefghijklmnopqrstuvwxyz'), 'anthropic');
  eq(L.detectProvider('sk-or-v1-' + 'a'.repeat(40)), 'openrouter');
  eq(L.detectProvider('xai-abcdefghijklmnopqrstuvwxyz'), 'xai');
  eq(L.detectProvider('csk-abcdefghijklmnopqrstuvwxyz01'), 'cerebras');
  eq(L.detectProvider('sk-proj-abcdefghijklmnopqrstuvwxyz'), 'openai');
  eq(L.detectProvider(''), null);
});

check('providers: gemini request is SSE and carries the key in the query', function () {
  const r = L.buildRequest({
    providerId: 'gemini', key: 'AIzaTEST', settings: { models: {} },
    messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }]
  });
  has(r.url, 'streamGenerateContent');
  has(r.url, 'alt=sse');
  has(r.url, 'key=AIzaTEST');
  eq(r.wire, 'gemini');
  const body = JSON.parse(r.init.body);
  eq(body.systemInstruction.parts[0].text, 'sys');
  eq(body.contents[0].role, 'user');
  eq(body.contents.length, 1, 'system message must not appear in contents');
});

check('providers: gemini maps assistant turns to the "model" role', function () {
  const r = L.buildRequest({
    providerId: 'gemini', key: 'k', settings: { models: {} },
    messages: [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
      { role: 'user', content: 'c' }
    ]
  });
  const body = JSON.parse(r.init.body);
  eq(body.contents[1].role, 'model');
});

check('providers: anthropic sends the browser-access header and hoists system', function () {
  const r = L.buildRequest({
    providerId: 'anthropic', key: 'sk-ant-x', settings: { models: {} },
    messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'hi' }]
  });
  eq(r.init.headers['anthropic-version'], '2023-06-01');
  eq(r.init.headers['anthropic-dangerous-direct-browser-access'], 'true');
  eq(r.init.headers['x-api-key'], 'sk-ant-x');
  const body = JSON.parse(r.init.body);
  eq(body.system, 'sys');
  eq(body.messages.length, 1);
  eq(body.stream, true);
});

check('providers: every openai-compatible provider builds a streaming request', function () {
  const openaiLike = L.PROVIDER_ORDER.filter(function (id) {
    return L.PROVIDERS[id].wire === 'openai' && !L.PROVIDERS[id].configurable;
  });
  if (openaiLike.length < 7) throw new Error('expected more openai-compatible providers');
  for (const id of openaiLike) {
    const r = L.buildRequest({
      providerId: id, key: 'test-key', settings: { models: {} },
      messages: [{ role: 'user', content: 'hi' }]
    });
    has(r.url, '/chat/completions', id + ' url');
    eq(r.init.headers.Authorization, 'Bearer test-key', id + ' auth header');
    const body = JSON.parse(r.init.body);
    eq(body.stream, true, id + ' stream flag');
    if (!body.model) throw new Error(id + ' has no default model');
  }
});

check('providers: custom endpoint without a base URL fails loudly', function () {
  let threw = false;
  try {
    L.buildRequest({
      providerId: 'custom', key: '', settings: { models: {} },
      messages: [{ role: 'user', content: 'hi' }]
    });
  } catch (e) { threw = /endpoint/i.test(e.message); }
  return threw;
});

check('providers: custom endpoint honours the configured base and model', function () {
  const r = L.buildRequest({
    providerId: 'custom', key: 'k',
    settings: { customBase: 'https://my.host/v1/', models: { custom: 'my-model' } },
    messages: [{ role: 'user', content: 'hi' }]
  });
  eq(r.url, 'https://my.host/v1/chat/completions');
  eq(JSON.parse(r.init.body).model, 'my-model');
});

check('providers: ollama needs no key and can be re-pointed', function () {
  const r = L.buildRequest({
    providerId: 'ollama', key: '',
    settings: { ollamaBase: 'http://127.0.0.1:11434/v1', models: {} },
    messages: [{ role: 'user', content: 'hi' }]
  });
  eq(r.url, 'http://127.0.0.1:11434/v1/chat/completions');
  if ('Authorization' in r.init.headers) throw new Error('should not send an auth header');
});

check('providers: probe URLs are built for each wire format', function () {
  has(L.buildProbe({ providerId: 'gemini', key: 'K', settings: {} }).url, '/models?key=K');
  eq(L.buildProbe({ providerId: 'anthropic', key: 'K', settings: {} })
    .init.headers['x-api-key'], 'K');
  eq(L.buildProbe({ providerId: 'groq', key: 'K', settings: {} })
    .init.headers.Authorization, 'Bearer K');
});

check('providers: model lists parse for both shapes', function () {
  const g = L.parseModelList('gemini', {
    models: [
      { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
      { name: 'models/embedding-001', supportedGenerationMethods: ['embedContent'] }
    ]
  });
  eq(g.length, 1);
  eq(g[0], 'gemini-2.5-flash');
  const o = L.parseModelList('openai', { data: [{ id: 'gpt-4.1-mini' }, { id: 'gpt-4o' }] });
  eq(o.length, 2);
});

/* --------------------------------------------------------------- prompts */

check('prompts: each hint level carries its own instructions', function () {
  for (let lvl = 1; lvl <= 5; lvl++) {
    const msgs = L.buildMessages({
      kind: 'hint', level: lvl,
      settings: { beginnerMode: true, language: 'Python' },
      problem: { title: 'Two Sum', statement: 'Given an array...', site: 'leetcode' }
    });
    const sys = msgs.filter(function (m) { return m.role === 'system'; })
      .map(function (m) { return m.content; }).join('\n');
    has(sys, 'HINT LEVEL ' + lvl + ' of 5', 'level ' + lvl);
  }
});

check('prompts: low rungs forbid giving away the higher rungs', function () {
  const lvl1 = L.LEVEL_INSTRUCTIONS[1];
  has(lvl1, 'Forbidden at this level');
  has(lvl1, 'naming any algorithm');
  const lvl2 = L.LEVEL_INSTRUCTIONS[2];
  has(lvl2, 'Forbidden at this level');
  has(lvl2, 'pseudocode');
  const lvl3 = L.LEVEL_INSTRUCTIONS[3];
  has(lvl3, 'Forbidden at this level');
  has(lvl3, 'real code');
});

check('prompts: beginner mode changes the system prompt', function () {
  const on = L.systemPrompt({ beginnerMode: true, language: 'Python' });
  const off = L.systemPrompt({ beginnerMode: false, language: 'Python' });
  has(on, 'no computer science background');
  lacks(off, 'no computer science background');
  has(off, 'comfortable with programming fundamentals');
});

check('prompts: the chosen language reaches the model', function () {
  has(L.systemPrompt({ language: 'Rust' }), 'writes in Rust');
});

check('prompts: a missing statement is stated, not invented', function () {
  const msgs = L.buildMessages({
    kind: 'hint', level: 1, settings: {}, problem: { title: 'x', statement: '' }
  });
  const sys = msgs.map(function (m) { return m.content; }).join('\n');
  has(sys, 'cannot see the problem');
});

check('prompts: a long statement is truncated rather than dropped', function () {
  const long = 'x'.repeat(40000);
  const msgs = L.buildMessages({
    kind: 'hint', level: 1, settings: {},
    problem: { title: 't', statement: long, site: 'leetcode' }
  });
  const joined = msgs.map(function (m) { return m.content; }).join('');
  has(joined, 'truncated by Ladder');
  if (joined.length > 25000) throw new Error('prompt is still ' + joined.length + ' chars');
});

check('prompts: code and error are passed as separate labelled blocks', function () {
  const msgs = L.buildMessages({
    kind: 'debug', settings: { language: 'Python' },
    problem: { title: 't', statement: 'a problem statement long enough to matter' },
    code: 'def f(): pass', error: 'IndexError: list index out of range'
  });
  const joined = msgs.map(function (m) { return m.content; }).join('\n');
  has(joined, 'LEARNER CODE');
  has(joined, 'def f(): pass');
  has(joined, 'ERROR / FAILING TEST');
  has(joined, 'IndexError');
});

check('prompts: private text is omitted when code sharing is disabled', function () {
  const msgs = L.buildMessages({
    kind: 'debug', settings: { language: 'Python', sendCode: false },
    problem: { title: 't', statement: 'a problem statement long enough to matter' },
    code: 'PRIVATE_SENTINEL_CODE', error: 'PRIVATE_SENTINEL_ERROR'
  });
  const joined = msgs.map(function (m) { return m.content; }).join('\n');
  lacks(joined, 'LEARNER CODE');
  lacks(joined, 'ERROR / FAILING TEST');
  lacks(joined, 'PRIVATE_SENTINEL_CODE');
  lacks(joined, 'PRIVATE_SENTINEL_ERROR');
});

check('prompts: history is capped so long sessions stay in budget', function () {
  const history = [];
  for (let i = 0; i < 40; i++) {
    history.push({ role: i % 2 ? 'assistant' : 'user', content: 'turn ' + i });
  }
  const msgs = L.buildMessages({
    kind: 'chat', settings: {}, problem: { statement: 'x'.repeat(300) },
    history: history, userText: 'and now?'
  });
  const turns = msgs.filter(function (m) { return m.role !== 'system'; });
  if (turns.length > 9) throw new Error('carried ' + turns.length + ' turns');
  has(turns[turns.length - 1].content, 'and now?');
});

check('prompts: chat mode is told the unlocked hint level', function () {
  const msgs = L.buildMessages({
    kind: 'chat', hintLevel: 2, settings: {},
    problem: { statement: 'x'.repeat(300) }, userText: 'what algorithm?'
  });
  has(msgs.map(function (m) { return m.content; }).join('\n'), 'unlocked hint level 2');
});

/* --------------------------------------------------------------- storage */

check('storage: settings round-trip with defaults filled in', async function () {
  return (async function () {
    await L.setSettings({ language: 'Go' });
    const s = await L.getSettings();
    eq(s.language, 'Go');
    eq(s.beginnerMode, true, 'default preserved');
  })();
});

check('storage: spaced repetition intervals grow', function () {
  const now = Date.now();
  const d0 = Math.round((L.nextReview(0) - now) / 864e5);
  const d1 = Math.round((L.nextReview(1) - now) / 864e5);
  const d4 = Math.round((L.nextReview(4) - now) / 864e5);
  eq(d0, 1); eq(d1, 3); eq(d4, 35);
  eq(Math.round((L.nextReview(99) - now) / 864e5), 35, 'clamps at the last step');
});

check('privacy: disabling code sending overrides every code source', function () {
  eq(L.codeForRequest({ sendCode: false }, 'explicit code', 'saved draft'), '');
  eq(L.codeForRequest({ sendCode: true }, 'explicit code', 'saved draft'), 'explicit code');
  eq(L.codeForRequest({ sendCode: true }, '', 'saved draft'), 'saved draft');
  eq(L.privateTextForRequest({ sendCode: false }, 'stack trace'), '');
  eq(L.privateTextForRequest({ sendCode: true }, 'stack trace'), 'stack trace');
});


/* ------------------------------------------------------------------ i18n */

const LOCALES = ['en', 'zh-TW', 'zh-CN', 'es'];

check('i18n: every locale defines every English key', function () {
  const base = Object.keys(L.LOCALES.en);
  const gaps = [];
  for (const code of LOCALES) {
    if (code === 'en') continue;
    for (const key of base) {
      if (L.LOCALES[code][key] == null) gaps.push(code + ' ' + key);
    }
  }
  if (gaps.length) {
    throw new Error(gaps.length + ' missing: ' + gaps.slice(0, 8).join(', '));
  }
  return base.length > 300;
});

check('i18n: no locale defines keys English does not have', function () {
  const base = new Set(Object.keys(L.LOCALES.en));
  const extra = [];
  for (const code of LOCALES) {
    for (const key of Object.keys(L.LOCALES[code])) {
      if (!base.has(key)) extra.push(code + ' ' + key);
    }
  }
  if (extra.length) throw new Error('stray keys: ' + extra.join(', '));
});

check('i18n: placeholders match the English string exactly', function () {
  const tokens = function (s) {
    return (String(s).match(/\{\w+\}/g) || []).sort().join(',');
  };
  const bad = [];
  for (const [key, en] of Object.entries(L.LOCALES.en)) {
    const want = tokens(en);
    for (const code of LOCALES) {
      const got = tokens(L.LOCALES[code][key]);
      if (got !== want) {
        bad.push(code + ' ' + key + ' [' + got + '] != [' + want + ']');
      }
    }
  }
  if (bad.length) throw new Error(bad.slice(0, 6).join(' | '));
});

check('i18n: no untranslated English left in the other locales', function () {
  // A value identical to English is almost always a forgotten string. Allow
  // the handful that are genuinely the same word in every locale.
  const allowed = new Set([
    'msg.author', 'head.appName', 'lang.es.note',
    'opt.status.using', 'theme.light', 'theme.dark',
    'prov.mistral.tagline', 'opt.prov.basePlaceholder'
  ]);
  const same = [];
  for (const [key, en] of Object.entries(L.LOCALES.en)) {
    if (allowed.has(key)) continue;
    for (const code of ['zh-TW', 'zh-CN']) {
      if (L.LOCALES[code][key] === en) same.push(code + ' ' + key);
    }
  }
  if (same.length) throw new Error('untranslated: ' + same.slice(0, 8).join(', '));
});

check('i18n: Chinese locales are not conversions of each other', function () {
  // Traditional-only and Simplified-only forms that must not cross over.
  const tw = Object.values(L.LOCALES['zh-TW']).join('');
  const cn = Object.values(L.LOCALES['zh-CN']).join('');
  for (const ch of ['陣', '堆疊', '佇列', '遞迴', '程式碼', '設定', '資料']) {
    if (cn.indexOf(ch) >= 0) throw new Error('zh-CN contains Taiwanese form: ' + ch);
  }
  for (const ch of ['数组', '递归', '代码', '设置', '数据', '队列']) {
    if (tw.indexOf(ch) >= 0) throw new Error('zh-TW contains Mainland form: ' + ch);
  }
  return true;
});

check('i18n: every glossary term has a definition in every locale', function () {
  const missing = [];
  for (const slug of L.glossarySlugs()) {
    for (const code of LOCALES) {
      for (const part of ['def', 'why']) {
        if (!L.LOCALES[code]['g.' + slug + '.' + part]) {
          missing.push(code + ' g.' + slug + '.' + part);
        }
      }
    }
  }
  if (missing.length) throw new Error(missing.slice(0, 6).join(', '));
  return L.glossarySlugs().length >= 45;
});

check('i18n: t() falls back to English rather than rendering a raw key', function () {
  L.setLocale('es');
  L.LOCALES.es['__probe__'] = undefined;
  L.LOCALES.en['__probe__'] = 'fallback value';
  eq(L.t('__probe__'), 'fallback value');
  delete L.LOCALES.en['__probe__'];
  eq(L.t('__nothing_defines_this__'), '__nothing_defines_this__');
  L.setLocale('en');
});

check('i18n: interpolation substitutes and leaves unknown tokens alone', function () {
  L.setLocale('en');
  eq(L.t('composer.hintState', { n: 3 }), 'Hint 3 of 5');
  eq(L.t('msg.hintBadge', { nope: 1 }), 'Hint {n}');
});

check('i18n: browser tags resolve to a shipped locale', function () {
  eq(L.normaliseLocale('zh-TW'), 'zh-TW');
  eq(L.normaliseLocale('zh-Hant-TW'), 'zh-TW');
  eq(L.normaliseLocale('zh-HK'), 'zh-TW', 'Hong Kong reads Traditional');
  eq(L.normaliseLocale('zh-MO'), 'zh-TW');
  eq(L.normaliseLocale('zh-CN'), 'zh-CN');
  eq(L.normaliseLocale('zh-Hans'), 'zh-CN');
  eq(L.normaliseLocale('zh-SG'), 'zh-CN');
  eq(L.normaliseLocale('zh'), 'zh-CN');
  eq(L.normaliseLocale('es-419'), 'es');
  eq(L.normaliseLocale('es-ES'), 'es');
  eq(L.normaliseLocale('en-GB'), 'en');
  eq(L.normaliseLocale('fr-FR'), 'en', 'unsupported falls back to English');
  eq(L.normaliseLocale(''), 'en');
});

check('i18n: the glossary reads its text from the active locale', function () {
  L.setLocale('zh-TW');
  const tw = L.glossaryLookup('hashmap');
  eq(tw.term, 'hash map', 'the matched term stays English');
  if (!/雜湊表/.test(tw.def)) throw new Error('zh-TW definition not used: ' + tw.def);
  L.setLocale('zh-CN');
  if (!/哈希表/.test(L.glossaryLookup('hashmap').def)) {
    throw new Error('zh-CN definition not used');
  }
  L.setLocale('es');
  if (!/tabla de consulta/.test(L.glossaryLookup('hashmap').def)) {
    throw new Error('es definition not used');
  }
  L.setLocale('en');
});

check('i18n: detection still works on an English statement in any locale', function () {
  const statement = 'Given an array of integers nums, return the indices.';
  for (const code of LOCALES) {
    L.setLocale(code);
    const names = L.glossaryDetect(statement).map(function (f) { return f.term; });
    if (names.indexOf('array') < 0) throw new Error('missed array under ' + code);
  }
  L.setLocale('en');
});

check('i18n: relative times are localised', function () {
  const soon = Date.now() + 3 * 864e5;
  L.setLocale('zh-TW');
  eq(L.relTime(soon), '3 天後');
  L.setLocale('zh-CN');
  eq(L.relTime(soon), '3 天后');
  L.setLocale('es');
  eq(L.relTime(soon), 'dentro de 3 días');
  L.setLocale('en');
  eq(L.relTime(soon), 'in 3 days');
  eq(L.relTime(0), 'never');
});

check('prompts: a non-English locale instructs the model to reply in it', function () {
  const sys = L.systemPrompt({
    language: 'Python', beginnerMode: true, locale: 'zh-TW',
    replyLanguage: L.replyLanguage('zh-TW')
  });
  has(sys, 'Write your entire reply in');
  has(sys, 'Traditional Chinese');
  has(sys, 'translate them rather than emitting them in English');
  has(sys, 'Keep in English, untranslated');
});

check('prompts: English adds no language rule at all', function () {
  const sys = L.systemPrompt({
    language: 'Python', locale: 'en', replyLanguage: L.replyLanguage('en')
  });
  lacks(sys, 'Write your entire reply in');
});

check('prompts: each shipped locale maps to a reply language', function () {
  for (const code of LOCALES) {
    const r = L.replyLanguage(code);
    if (!r || r.length < 5) throw new Error('no reply language for ' + code);
  }
  has(L.replyLanguage('zh-CN'), 'Simplified Chinese');
  has(L.replyLanguage('es'), 'Spanish');
});

check('i18n: CJK locales get a font stack, Latin ones do not', function () {
  if (!L.localeFont('zh-TW')) throw new Error('zh-TW has no font stack');
  if (!L.localeFont('zh-CN')) throw new Error('zh-CN has no font stack');
  has(L.localeFont('zh-TW'), 'PingFang TC');
  has(L.localeFont('zh-CN'), 'PingFang SC');
  eq(L.localeFont('en'), '');
  eq(L.localeFont('es'), '');
});

check('i18n: locale names are endonyms so the picker is readable to anyone', function () {
  eq(L.LOCALE_NAMES['zh-TW'], '繁體中文');
  eq(L.LOCALE_NAMES['zh-CN'], '简体中文');
  eq(L.LOCALE_NAMES.es, 'Español');
  eq(L.LOCALE_ORDER.length, 4);
});

/* --------------------------------------------- service worker SSE parsing */

load('src/background.js');
const streamDeltas = globalThis.streamDeltas;

function fakeResponse(chunks) {
  const enc = new TextEncoder();
  let i = 0;
  return {
    ok: true,
    body: {
      getReader: function () {
        return {
          read: async function () {
            if (i >= chunks.length) return { done: true };
            return { done: false, value: enc.encode(chunks[i++]) };
          }
        };
      }
    }
  };
}

async function collect(chunks, wire) {
  let out = '';
  for await (const d of streamDeltas(fakeResponse(chunks), wire)) out += d;
  return out;
}

const asyncChecks = [];
function checkAsync(name, fn) {
  asyncChecks.push(
    fn().then(function () { pass++; })
      .catch(function (e) { failures.push(name + ' -> ' + e.message); })
  );
}

checkAsync('stream: openai deltas concatenate and [DONE] stops cleanly', async function () {
  const out = await collect([
    'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
    'data: {"choices":[{"delta":{"content":" world"}}]}\n',
    'data: [DONE]\n'
  ], 'openai');
  eq(out, 'Hello world');
});

checkAsync('stream: a chunk split mid-line is reassembled', async function () {
  const out = await collect([
    'data: {"choices":[{"delta":{"con',
    'tent":"split"}}]}\n',
    'data: {"choices":[{"delta":{"content":" ok"}}]}\n'
  ], 'openai');
  eq(out, 'split ok');
});

checkAsync('stream: gemini parts are read out of candidates', async function () {
  const out = await collect([
    'data: {"candidates":[{"content":{"parts":[{"text":"Two"}]}}]}\n\n',
    'data: {"candidates":[{"content":{"parts":[{"text":" pointers"}]}}]}\n\n'
  ], 'gemini');
  eq(out, 'Two pointers');
});

checkAsync('stream: gemini surfaces a non-STOP finish reason', async function () {
  const out = await collect([
    'data: {"candidates":[{"content":{"parts":[{"text":"partial"}]},"finishReason":"SAFETY"}]}\n'
  ], 'gemini');
  has(out, 'SAFETY');
});

checkAsync('stream: anthropic content_block_delta events', async function () {
  const out = await collect([
    'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Use a "}}\n',
    'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"hash map"}}\n',
    'data: {"type":"message_stop"}\n'
  ], 'anthropic');
  eq(out, 'Use a hash map');
});

checkAsync('stream: anthropic error events become exceptions', async function () {
  let threw = false;
  try {
    await collect([
      'data: {"type":"error","error":{"message":"overloaded"}}\n'
    ], 'anthropic');
  } catch (e) { threw = /overloaded/.test(e.message); }
  if (!threw) throw new Error('error event was swallowed');
});

checkAsync('stream: malformed JSON lines are skipped, not fatal', async function () {
  const out = await collect([
    'data: {not json}\n',
    ': a comment line\n',
    'data: {"choices":[{"delta":{"content":"fine"}}]}\n'
  ], 'openai');
  eq(out, 'fine');
});

checkAsync('stream: CRLF line endings are handled', async function () {
  const out = await collect([
    'data: {"choices":[{"delta":{"content":"crlf"}}]}\r\n'
  ], 'openai');
  eq(out, 'crlf');
});

/* ----------------------------------------------------------------- report */

Promise.all(asyncChecks).then(function () {
  const total = pass + failures.length;
  console.log('');
  if (failures.length) {
    console.log('FAILED ' + failures.length + ' of ' + total + ':');
    for (const f of failures) console.log('  x ' + f);
    process.exit(1);
  }
  console.log('All ' + total + ' checks passed.');
});
