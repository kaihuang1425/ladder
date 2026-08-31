/* Ladder - site adapters.
   Each adapter turns a problem page into { title, statement, difficulty, slug }.
   Selectors on these sites churn, so every adapter is written as a list of
   candidates ending in a structural fallback that does not depend on class names. */
(function (root) {
  'use strict';

  const NS = (root.Ladder = root.Ladder || {});

  /* ------------------------------------------------------------ extraction */

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'BUTTON', 'NAV', 'IFRAME', 'TEXTAREA'
  ]);

  /* Convert a DOM subtree to markdown-ish text: keeps code blocks, lists,
     headings and tables, drops chrome. */
  function toText(node, depth) {
    if (!node) return '';
    depth = depth || 0;
    if (depth > 40) return '';

    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue.replace(/\s+/g, ' ');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName;
    if (SKIP_TAGS.has(tag)) return '';
    if (node.getAttribute && node.getAttribute('aria-hidden') === 'true') return '';

    const kids = function () {
      let out = '';
      for (const child of node.childNodes) out += toText(child, depth + 1);
      return out;
    };

    switch (tag) {
      case 'PRE': {
        const body = (node.innerText || node.textContent || '').replace(/\n{3,}/g, '\n\n');
        return '\n```\n' + body.trim() + '\n```\n';
      }
      case 'CODE': {
        const inner = (node.textContent || '').trim();
        if (!inner) return '';
        if (node.closest && node.closest('pre')) return inner;
        return inner.includes('\n') ? '\n```\n' + inner + '\n```\n' : '`' + inner + '`';
      }
      case 'BR':
        return '\n';
      case 'HR':
        return '\n---\n';
      case 'LI':
        return '\n- ' + kids().trim();
      case 'P':
      case 'DIV':
      case 'SECTION':
      case 'ARTICLE':
      case 'TR':
        return '\n' + kids() + '\n';
      case 'H1': case 'H2': case 'H3':
        return '\n\n### ' + kids().trim() + '\n';
      case 'H4': case 'H5': case 'H6':
        return '\n\n**' + kids().trim() + '**\n';
      case 'STRONG': case 'B':
        return '**' + kids().trim() + '**';
      case 'EM': case 'I':
        return '*' + kids().trim() + '*';
      case 'TD': case 'TH':
        return kids().trim() + ' | ';
      case 'IMG': {
        const alt = node.getAttribute('alt');
        return alt ? '[image: ' + alt + ']' : '[image]';
      }
      case 'SUP':
        return '^' + kids().trim();
      case 'SUB':
        return '_' + kids().trim();
      default:
        return kids();
    }
  }

  function clean(text) {
    return String(text || '')
      .replace(/ /g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function extract(el) {
    if (!el) return '';
    return clean(toText(el, 0));
  }

  function first(selectors, scope) {
    const doc = scope || document;
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel);
        if (el && (el.innerText || '').trim().length > 20) return el;
      } catch (_) { /* invalid selector, keep going */ }
    }
    return null;
  }

  function firstText(selectors, scope) {
    const doc = scope || document;
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel);
        const t = el && (el.innerText || el.textContent || '').trim();
        if (t) return t;
      } catch (_) { /* keep going */ }
    }
    return '';
  }

  /* Structural fallback: the densest block of prose on the page that
     contains something looking like a worked example. */
  function densestBlock() {
    const roots = document.querySelectorAll('main, article, [role="main"], body');
    let best = null;
    let bestScore = 0;
    for (const r of roots) {
      const candidates = r.querySelectorAll('div, section, article');
      for (const el of candidates) {
        const text = el.innerText || '';
        if (text.length < 200 || text.length > 20000) continue;
        if (el.querySelector('div, section') && el.innerText.length > 12000) continue;
        let score = Math.min(text.length, 6000);
        if (/example\s*1|sample input|sample test|input\s*\n/i.test(text)) score += 3000;
        if (/constraint|1 <=|1 ≤/i.test(text)) score += 1500;
        if (el.querySelector('pre')) score += 800;
        if (/sign in|cookie|subscribe|premium/i.test(text.slice(0, 200))) score -= 2000;
        if (score > bestScore) { bestScore = score; best = el; }
      }
    }
    return best;
  }

  /* ------------------------------------------------------------- adapters */

  const ADAPTERS = [
    {
      id: 'leetcode',
      label: 'LeetCode',
      test: function (h) { return /(^|\.)leetcode\.(com|cn)$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/\/problems\/([^/]+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () {
        const t = firstText([
          'div[data-cy="question-title"]',
          'a[href^="/problems/"].no-underline',
          '.text-title-large a',
          'div.text-title-large'
        ]);
        if (t) return t.replace(/^\d+\.\s*/, '');
        const dt = document.title.replace(/\s*-\s*LeetCode.*$/i, '').trim();
        return dt.replace(/^\d+\.\s*/, '');
      },
      difficulty: function () {
        const t = firstText([
          'div[class*="text-difficulty"]',
          'div[diff]',
          '.text-olive', '.text-yellow', '.text-pink'
        ]);
        const m = (t || document.body.innerText.slice(0, 4000))
          .match(/\b(Easy|Medium|Hard)\b/);
        return m ? m[1] : '';
      },
      statement: function () {
        const el = first([
          'div[data-track-load="description_content"]',
          'div[class*="elfjS"]',
          '.question-content__JfgR',
          '#question-detail-main-tabs div[class*="content"]',
          'div.description__24sA'
        ]);
        return extract(el || densestBlock());
      },
      code: function () {
        const lines = document.querySelectorAll('.monaco-editor .view-line');
        if (!lines.length) return '';
        const out = [];
        for (const l of lines) out.push(l.innerText.replace(/ /g, ' '));
        return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      },
      language: function () {
        return firstText(['button[id*="headlessui-listbox-button"]', '.ant-select-selection-item']);
      }
    },

    {
      id: 'codeforces',
      label: 'Codeforces',
      test: function (h) { return /codeforces\.com$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/(?:contest|gym|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Za-z0-9]+)/);
        return m ? m[1] + m[2] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () {
        const t = firstText(['.problem-statement .title', '.header .title']);
        return t || document.title.replace(/\s*-\s*Codeforces.*$/i, '').trim();
      },
      difficulty: function () {
        const tags = document.querySelectorAll('.tag-box');
        for (const t of tags) {
          const m = (t.innerText || '').match(/^\*(\d{3,4})$/);
          if (m) return 'Rating ' + m[1];
        }
        return '';
      },
      statement: function () {
        const el = first(['.problem-statement', '#pageContent .ttypography']);
        if (!el) return extract(densestBlock());
        const parts = [];
        const legend = el.querySelector('.header + div, .legend');
        const push = function (label, sel) {
          const n = el.querySelector(sel);
          if (n) parts.push('### ' + label + '\n' + extract(n));
        };
        if (legend) parts.push(extract(legend));
        push('Input', '.input-specification');
        push('Output', '.output-specification');
        push('Examples', '.sample-tests');
        push('Note', '.note');
        const joined = clean(parts.join('\n\n'));
        return joined.length > 200 ? joined : extract(el);
      },
      code: function () { return ''; }
    },

    {
      id: 'atcoder',
      label: 'AtCoder',
      test: function (h) { return /atcoder\.jp$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/contests\/([^/]+)\/tasks\/([^/]+)/);
        return m ? m[2] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () {
        const t = firstText(['span.h2', '.h2', 'h2']);
        return (t || document.title).replace(/\s*-\s*AtCoder.*$/i, '').trim();
      },
      difficulty: function () { return ''; },
      statement: function () {
        // AtCoder ships both Japanese and English; prefer the English span.
        const en = document.querySelector('#task-statement span.lang-en');
        const el = en || first(['#task-statement', '.part']);
        return extract(el || densestBlock());
      },
      code: function () {
        const ta = document.querySelector('#sourceCode textarea, .editor textarea');
        return ta ? ta.value : '';
      }
    },

    {
      id: 'hackerrank',
      label: 'HackerRank',
      test: function (h) { return /hackerrank\.com$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/challenges\/([^/]+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () {
        return firstText(['.challenge-title', 'h1']) ||
          document.title.replace(/\s*\|\s*HackerRank.*$/i, '').trim();
      },
      difficulty: function () {
        const m = document.body.innerText.slice(0, 3000).match(/\b(Easy|Medium|Hard)\b/);
        return m ? m[1] : '';
      },
      statement: function () {
        const el = first([
          '.challenge-body-html',
          '.problem-statement',
          '.challenge_problem_statement'
        ]);
        return extract(el || densestBlock());
      },
      code: function () {
        const lines = document.querySelectorAll('.CodeMirror-line, .monaco-editor .view-line');
        if (!lines.length) return '';
        return Array.from(lines).map(function (l) { return l.innerText; }).join('\n').trim();
      }
    },

    {
      id: 'codechef',
      label: 'CodeChef',
      test: function (h) { return /codechef\.com$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/problems\/([^/]+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () {
        return firstText(['#problem-statement h1', 'h1']) ||
          document.title.replace(/\s*\|\s*CodeChef.*$/i, '').trim();
      },
      difficulty: function () { return ''; },
      statement: function () {
        return extract(first(['#problem-statement', '.problem-statement']) || densestBlock());
      },
      code: function () { return ''; }
    },

    {
      id: 'cses',
      label: 'CSES',
      test: function (h) { return /cses\.fi$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/task\/(\d+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () { return firstText(['.title-block h1', 'h1']); },
      difficulty: function () { return ''; },
      statement: function () { return extract(first(['.md', '.content']) || densestBlock()); },
      code: function () { return ''; }
    },

    {
      id: 'kattis',
      label: 'Kattis',
      test: function (h) { return /kattis\.com$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/problems\/([^/]+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () { return firstText(['.book-page-heading', 'h1']); },
      difficulty: function () {
        const m = document.body.innerText.match(/Difficulty[^\d]*([\d.]+)/i);
        return m ? 'Difficulty ' + m[1] : '';
      },
      statement: function () {
        return extract(first(['.problembody', '#problem-body']) || densestBlock());
      },
      code: function () { return ''; }
    },

    {
      id: 'spoj',
      label: 'SPOJ',
      test: function (h) { return /spoj\.com$/.test(h); },
      slug: function () {
        const m = location.pathname.match(/problems\/([^/]+)/);
        return m ? m[1] : location.pathname.replace(/\W+/g, '-');
      },
      title: function () { return firstText(['#problem-name', 'h2']); },
      difficulty: function () { return ''; },
      statement: function () { return extract(first(['#problem-body']) || densestBlock()); },
      code: function () { return ''; }
    },

    {
      id: 'exercism',
      label: 'Exercism',
      test: function (h) { return /exercism\.org$/.test(h); },
      slug: function () { return location.pathname.replace(/\W+/g, '-'); },
      title: function () { return firstText(['h1', '.exercise-title']); },
      difficulty: function () { return ''; },
      statement: function () {
        return extract(first(['#instructions', '.instructions', '.c-textual-content']) || densestBlock());
      },
      code: function () { return ''; }
    },

    {
      id: 'hackerearth',
      label: 'HackerEarth',
      test: function (h) { return /hackerearth\.com$/.test(h); },
      slug: function () { return location.pathname.replace(/\W+/g, '-'); },
      title: function () { return firstText(['.problem-name', 'h1']); },
      difficulty: function () { return ''; },
      statement: function () {
        return extract(first(['.problem-statement', '.starwars-lab']) || densestBlock());
      },
      code: function () { return ''; }
    },

    /* Last resort: works on any page the user force-opens the panel on. */
    {
      id: 'generic',
      label: 'This page',
      test: function () { return true; },
      slug: function () {
        return (location.hostname + location.pathname).replace(/\W+/g, '-').slice(0, 80);
      },
      title: function () { return document.title.trim(); },
      difficulty: function () { return ''; },
      statement: function () { return extract(densestBlock()); },
      code: function () { return ''; }
    }
  ];

  function pick() {
    const host = location.hostname.replace(/^www\./, '');
    for (const a of ADAPTERS) {
      if (a.test(host)) return a;
    }
    return ADAPTERS[ADAPTERS.length - 1];
  }

  /* Read the current page into a problem object. */
  function readProblem() {
    const adapter = pick();
    let statement = '';
    let title = '';
    let difficulty = '';
    try { statement = adapter.statement() || ''; } catch (e) { statement = ''; }
    try { title = adapter.title() || ''; } catch (e) { title = ''; }
    try { difficulty = adapter.difficulty() || ''; } catch (e) { difficulty = ''; }

    return {
      site: adapter.id,
      siteLabel: adapter.label,
      slug: adapter.slug(),
      title: title || 'Untitled problem',
      difficulty: difficulty,
      statement: statement,
      url: location.href.split('#')[0],
      readAt: Date.now(),
      ok: statement.length > 120
    };
  }

  function readCode() {
    const adapter = pick();
    try { return adapter.code ? adapter.code() : ''; } catch (e) { return ''; }
  }

  function isProblemPage() {
    const adapter = pick();
    if (adapter.id === 'generic') return false;
    return /problem|challenge|task|contest|problemset|gym|tracks/i.test(location.pathname);
  }

  function adapterById(id) {
    for (const a of ADAPTERS) if (a.id === id) return a;
    return null;
  }

  Object.assign(NS, {
    readProblem: readProblem,
    readCode: readCode,
    isProblemPage: isProblemPage,
    currentAdapter: pick,
    adapterById: adapterById,
    ADAPTERS: ADAPTERS,
    extractText: extract
  });
})(typeof globalThis !== 'undefined' ? globalThis : self);
