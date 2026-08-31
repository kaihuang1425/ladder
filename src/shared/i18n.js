/* Ladder - translation engine.
   Dictionaries live in src/shared/locales/*.js and register themselves on
   Ladder.LOCALES. English is the source of truth: any key missing from another
   locale falls back to English rather than rendering blank. */
(function (root) {
  'use strict';

  const NS = (root.Ladder = root.Ladder || {});

  NS.LOCALES = NS.LOCALES || {};

  const LOCALE_ORDER = ['en', 'zh-TW', 'zh-CN', 'es'];

  /* Endonyms: a language picker should name each language in that language. */
  const LOCALE_NAMES = {
    en: 'English',
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    es: 'Español'
  };

  /* Shown under the name in the picker, in the user's current language. */
  const LOCALE_REGION_KEY = {
    en: 'lang.en.note',
    'zh-TW': 'lang.zhTW.note',
    'zh-CN': 'lang.zhCN.note',
    es: 'lang.es.note'
  };

  /* What the model should write its answers in. */
  const REPLY_LANGUAGE = {
    en: 'English',
    'zh-TW': 'Traditional Chinese as written in Taiwan (繁體中文，台灣用語)',
    'zh-CN': 'Simplified Chinese as written in mainland China (简体中文)',
    es: 'Spanish (español), in a neutral international register'
  };

  /* CJK needs its own font stack and a little more line height. */
  const LOCALE_FONT = {
    'zh-TW': '"PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", ' +
      '"Noto Sans TC", "Hiragino Sans CNS", sans-serif',
    'zh-CN': '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", ' +
      '"Noto Sans SC", "Hiragino Sans GB", sans-serif'
  };

  /* BCP-47 tags Chrome may report, mapped onto what Ladder actually ships.
     Hong Kong and Macau resolve to the Taiwan dictionary: both write
     Traditional characters, so it is far closer than falling back to English. */
  function normalise(tag) {
    const t = String(tag || '').replace(/_/g, '-').toLowerCase();
    if (!t) return 'en';
    if (t === 'zh' || t.startsWith('zh-hans') || t.startsWith('zh-cn') ||
        t.startsWith('zh-sg') || t.startsWith('zh-my')) return 'zh-CN';
    if (t.startsWith('zh')) return 'zh-TW';   // tw, hk, mo, hant, and bare variants
    if (t.startsWith('es')) return 'es';
    if (t.startsWith('en')) return 'en';
    return 'en';
  }

  function browserLocale() {
    try {
      if (root.chrome && chrome.i18n && chrome.i18n.getUILanguage) {
        return normalise(chrome.i18n.getUILanguage());
      }
    } catch (_) { /* not in an extension context */ }
    if (root.navigator && navigator.language) return normalise(navigator.language);
    return 'en';
  }

  /* 'auto' follows the browser; anything else is an explicit user choice. */
  function resolveLocale(pref) {
    if (!pref || pref === 'auto') return browserLocale();
    return NS.LOCALES[pref] ? pref : normalise(pref);
  }

  let current = 'en';

  function setLocale(code) {
    current = NS.LOCALES[code] ? code : 'en';
    return current;
  }

  function getLocale() { return current; }

  function dict(code) { return NS.LOCALES[code] || NS.LOCALES.en || {}; }

  /* t('rung.1.label') or t('progress.hintN', { n: 3 }) */
  function t(key, vars) {
    let s = dict(current)[key];
    if (s == null) s = dict('en')[key];
    if (s == null) return key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (whole, name) {
        return Object.prototype.hasOwnProperty.call(vars, name)
          ? String(vars[name]) : whole;
      });
    }
    return s;
  }

  /* Does this locale actually define the key, or is it falling back? */
  function has(key, code) {
    return dict(code || current)[key] != null;
  }

  /* Apply translations to static markup.
       data-i18n="key"            -> textContent
       data-i18n-html="key"       -> innerHTML (for copy containing <code> etc.)
       data-i18n-attr="placeholder:key, title:key"
     Only leaf text nodes should carry data-i18n: setting textContent wipes
     any child elements. */
  function applyLocale(scope) {
    const doc = scope || document;

    doc.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });

    doc.querySelectorAll('[data-i18n-html]').forEach(function (node) {
      node.innerHTML = t(node.getAttribute('data-i18n-html'));
    });

    doc.querySelectorAll('[data-i18n-attr]').forEach(function (node) {
      const spec = node.getAttribute('data-i18n-attr');
      for (const pair of spec.split(',')) {
        const bits = pair.split(':');
        if (bits.length !== 2) continue;
        node.setAttribute(bits[0].trim(), t(bits[1].trim()));
      }
    });

    if (doc.documentElement) {
      doc.documentElement.setAttribute('lang', current);
    }
  }

  /* The font stack for the active locale, or '' to keep the Latin default. */
  function localeFont(code) {
    return LOCALE_FONT[code || current] || '';
  }

  function replyLanguage(code) {
    return REPLY_LANGUAGE[code || current] || REPLY_LANGUAGE.en;
  }

  /* Read the stored preference and switch to it. Call before first render. */
  async function initLocale() {
    let pref = 'auto';
    try {
      const settings = await NS.getSettings();
      pref = settings.locale || 'auto';
    } catch (_) { /* storage unavailable; stay on the browser locale */ }
    return setLocale(resolveLocale(pref));
  }

  Object.assign(NS, {
    LOCALE_ORDER: LOCALE_ORDER,
    LOCALE_NAMES: LOCALE_NAMES,
    LOCALE_REGION_KEY: LOCALE_REGION_KEY,
    normaliseLocale: normalise,
    browserLocale: browserLocale,
    resolveLocale: resolveLocale,
    setLocale: setLocale,
    getLocale: getLocale,
    initLocale: initLocale,
    localeFont: localeFont,
    replyLanguage: replyLanguage,
    applyLocale: applyLocale,
    hasKey: has,
    t: t
  });
})(typeof globalThis !== 'undefined' ? globalThis : self);
