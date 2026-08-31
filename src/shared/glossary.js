/* Ladder - offline beginner glossary.
   Works with no API key at all. Terms are matched against the problem
   statement so a newcomer sees plain-English definitions for the words
   the problem assumed they already knew.

   The English terms and aliases stay here because matching runs against the
   problem statement, which is written in English on every site Ladder supports.
   The definitions live in the locale dictionaries under g.<slug>.def / .why,
   so the explanation is translated even though the term being matched is not. */
(function (root) {
  'use strict';

  const NS = (root.Ladder = root.Ladder || {});

  /* [slug, term, aliases] */
  const TERMS = [
    ['array', 'array', ['arrays', 'list', 'lists']],
    ['index', 'index', ['indices', 'indexes', 'i-th', '0-indexed', '1-indexed']],
    ['subarray', 'subarray', ['sub-array', 'contiguous subarray']],
    ['subsequence', 'subsequence', ['subsequences']],
    ['substring', 'substring', ['substrings']],
    ['permutation', 'permutation', ['permutations']],
    ['hash-map', 'hash map', ['hashmap', 'hash table', 'dictionary', 'dict', 'map', 'unordered_map']],
    ['set', 'set', ['hashset', 'unordered_set']],
    ['stack', 'stack', ['stacks', 'lifo']],
    ['queue', 'queue', ['queues', 'fifo', 'deque']],
    ['linked-list', 'linked list', ['linkedlist', 'listnode']],
    ['tree', 'tree', ['binary tree', 'treenode', 'subtree']],
    ['binary-search-tree', 'binary search tree', ['bst']],
    ['graph', 'graph', ['graphs', 'vertices', 'vertex', 'edges', 'adjacency']],
    ['heap', 'heap', ['priority queue', 'priority_queue', 'min-heap', 'max-heap']],
    ['recursion', 'recursion', ['recursive', 'recursively']],
    ['memoization', 'memoization', ['memoisation', 'memo', 'caching']],
    ['dynamic-programming', 'dynamic programming', ['dp', 'bottom-up', 'top-down']],
    ['greedy', 'greedy', ['greedily']],
    ['two-pointers', 'two pointers', ['two-pointer', 'left pointer', 'right pointer']],
    ['sliding-window', 'sliding window', ['window']],
    ['binary-search', 'binary search', ['bisect', 'lower_bound', 'upper_bound']],
    ['prefix-sum', 'prefix sum', ['prefix sums', 'cumulative sum', 'running total']],
    ['bfs', 'bfs', ['breadth-first search', 'breadth first']],
    ['dfs', 'dfs', ['depth-first search', 'depth first']],
    ['backtracking', 'backtracking', ['backtrack']],
    ['time-complexity', 'time complexity', ['big o', 'big-o', 'o(n)', 'o(n^2)', 'o(log n)', 'asymptotic']],
    ['space-complexity', 'space complexity', ['memory limit', 'auxiliary space']],
    ['constraints', 'constraints', ['constraint', 'bounds']],
    ['modulo', 'modulo', ['mod', 'modulus', '10^9+7', '1e9+7', 'remainder']],
    ['overflow', 'overflow', ['integer overflow', 'long long']],
    ['in-place', 'in-place', ['in place']],
    ['stable-sort', 'stable sort', ['stable']],
    ['adjacency-list', 'adjacency list', ['adjacency matrix']],
    ['union-find', 'union find', ['disjoint set', 'dsu', 'union-find']],
    ['trie', 'trie', ['prefix tree']],
    ['bitmask', 'bitmask', ['bit manipulation', 'xor', 'bitwise', 'bits']],
    ['sentinel', 'sentinel', ['dummy node', 'dummy head']],
    ['edge-case', 'edge case', ['edge cases', 'corner case']],
    ['tle', 'tle', ['time limit exceeded']],
    ['mle', 'mle', ['memory limit exceeded']],
    ['wa', 'wa', ['wrong answer']],
    ['rte', 'rte', ['runtime error', 'segmentation fault', 'segfault']],
    ['stdin', 'stdin', ['standard input', 'stdout', 'standard output']],
    ['lexicographic', 'lexicographic', ['lexicographical', 'lexicographically']],
    ['gcd', 'gcd', ['greatest common divisor', 'lcm', 'least common multiple']],
    ['prime', 'prime', ['primes', 'sieve', 'eratosthenes']],
    ['monotonic', 'monotonic', ['monotonic stack', 'monotonic queue', 'non-decreasing']],
    ['invariant', 'invariant', ['loop invariant']]
  ];

  function entry(slug, term) {
    return {
      slug: slug,
      term: term,
      def: NS.t('g.' + slug + '.def'),
      why: NS.t('g.' + slug + '.why')
    };
  }

  const INDEX = (function () {
    const map = new Map();
    for (const [slug, term, aliases] of TERMS) {
      map.set(term.toLowerCase(), slug);
      for (const a of aliases) map.set(String(a).toLowerCase(), slug);
    }
    return map;
  })();

  const BY_SLUG = (function () {
    const map = new Map();
    for (const [slug, term] of TERMS) map.set(slug, term);
    return map;
  })();

  function lookup(word) {
    const slug = INDEX.get(String(word || '').trim().toLowerCase());
    return slug ? entry(slug, BY_SLUG.get(slug)) : null;
  }

  /* Find glossary terms that actually appear in this problem statement. */
  function detect(text) {
    const hay = ' ' + String(text || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
    const found = [];
    const seen = new Set();
    for (const [slug, term, aliases] of TERMS) {
      const candidates = [term].concat(aliases);
      for (const c of candidates) {
        const needle = String(c).toLowerCase();
        const boundary = /^[a-z0-9]/.test(needle)
          ? new RegExp('(^|[^a-z0-9])' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)')
          : null;
        const hit = boundary ? boundary.test(hay) : hay.indexOf(needle) >= 0;
        if (hit && !seen.has(slug)) {
          seen.add(slug);
          const e = entry(slug, term);
          e.matched = c;
          found.push(e);
          break;
        }
      }
    }
    return found;
  }

  function all() {
    return TERMS.map(function (t) { return entry(t[0], t[1]); });
  }

  function slugs() {
    return TERMS.map(function (t) { return t[0]; });
  }

  Object.assign(NS, {
    glossaryLookup: lookup,
    glossaryDetect: detect,
    glossaryAll: all,
    glossarySlugs: slugs,
    GLOSSARY_COUNT: TERMS.length
  });
})(typeof globalThis !== 'undefined' ? globalThis : self);
