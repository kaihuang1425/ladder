/* Ladder - English. This is the source of truth: every other locale is a
   translation of these keys, and any key missing elsewhere falls back here. */
(function (root) {
  'use strict';
  const NS = (root.Ladder = root.Ladder || {});
  NS.LOCALES = NS.LOCALES || {};

  NS.LOCALES.en = {
    /* ---------------------------------------------------------- language */
    'lang.en.note': 'English',
    'lang.zhTW.note': 'Traditional Chinese',
    'lang.zhCN.note': 'Simplified Chinese',
    'lang.es.note': 'Spanish',
    'lang.auto': 'Match the browser',

    /* -------------------------------------------------------------- tabs */
    'tab.coach': 'Coach',
    'tab.learn': 'Learn',
    'tab.code': 'Code',
    'tab.notes': 'Notes',
    'tab.progress': 'Progress',

    /* ------------------------------------------------------------ header */
    'head.reread': 'Re-read the problem from the page',
    'head.dock': 'Dock beside the page, or float over it',
    'head.theme': 'Light or dark',
    'head.settings': 'Settings and API keys',
    'head.close': 'Close (Ctrl+Shift+L)',
    'head.launcher': 'Open Ladder (Ctrl+Shift+L)',
    'head.appName': 'Ladder',

    /* ------------------------------------------------------------- rungs */
    'rung.1.label': 'What is this even asking?',
    'rung.1.blurb': 'Plain English. No approach, no spoilers.',
    'rung.2.label': 'Give me a nudge',
    'rung.2.blurb': 'One thing to notice, and a question to ask yourself.',
    'rung.3.label': 'Name the approach',
    'rung.3.blurb': 'The technique and why it fits. Still no code.',
    'rung.4.label': 'Walk me through a plan',
    'rung.4.blurb': 'Numbered pseudocode and the edge cases.',
    'rung.5.label': 'Show the full solution',
    'rung.5.blurb': 'Working code, line by line, plus the takeaway.',

    /* ------------------------------------------------------------- coach */
    'coach.ladder': 'The hint ladder',
    'coach.ladderNote': 'Each rung tells you a little more. Climb only as far as ' +
      'you need — the point is to solve it yourself.',
    'coach.quick': 'Quick asks',
    'quick.concepts': 'What should I learn first?',
    'quick.testcases': 'Edge cases to test',
    'quick.dryrun': 'Dry run the example',
    'quick.optimize': 'Make it faster',

    'msg.author': 'Ladder',
    'msg.hintBadge': 'Hint {n}',
    'msg.reveal': 'Show the solution',
    'msg.stopped': '_(stopped)_',

    'composer.placeholder': 'Ask anything about this problem...',
    'composer.send': 'Send (Enter)',
    'composer.langTitle': 'Language for code examples',
    'composer.hintState': 'Hint {n} of 5',

    /* ----------------------------------------------------------- notices */
    'notice.setup.title': 'One-minute setup',
    'notice.setup.body': 'Ladder needs an AI key to give hints. Google AI Studio ' +
      'gives one away free, no card required. Everything else here — the glossary, ' +
      'notes and progress — already works without it.',
    'notice.setup.cta': 'Add a free key',
    'notice.nostmt.title': 'No problem statement found',
    'notice.nostmt.body': 'Ladder could not read a problem off this page. If the ' +
      'page is still loading, hit refresh in the header. Otherwise paste the ' +
      'statement into the box below and ask away — that works just as well.',
    'notice.error.title': 'That did not go through',
    'notice.error.cta': 'Open settings',

    /* ------------------------------------------------------------- learn */
    'learn.found': 'Words this problem assumes you know',
    'learn.fallback': 'Beginner glossary',
    'learn.foundNote.one': '1 term found in the statement. Plain-English ' +
      'definitions, no key needed.',
    'learn.foundNote.other': '{n} terms found in the statement. Plain-English ' +
      'definitions, no key needed.',
    'learn.fallbackNote': 'Nothing matched on this page, so here are the terms ' +
      'that come up most often. These work with no API key.',
    'learn.explain': 'Explain it for this problem',
    'learn.deeper': 'Go deeper',
    'learn.concepts': 'What concepts does this need?',
    'learn.beginnerOn': 'Switch on beginner mode',
    'learn.beginnerOff': 'Switch off beginner mode',

    /* -------------------------------------------------------------- code */
    'code.yourCode': 'Your code',
    'code.grabbed': 'pulled from the editor — check it looks complete',
    'code.notGrabbed': 'paste it here, the editor on this site could not be read',
    'code.placeholder': 'Paste your attempt here...',
    'code.errLabel': 'Error or failing test',
    'code.optional': 'optional',
    'code.errPlaceholder': 'Paste the error message, or the input that gives the ' +
      'wrong answer...',
    'code.review': 'Review it (no spoilers)',
    'code.debug': 'Why is it failing?',
    'code.optimize': 'Make it faster',
    'code.dryrun': 'Trace it step by step',
    'code.mark': 'Mark this problem',
    'code.solved': 'I solved it',
    'code.solvedDone': 'Solved ✓',
    'code.stuck': 'I am stuck, come back to this',

    /* ------------------------------------------------------------- notes */
    'notes.title': 'Notes on this problem',
    'notes.note': 'Write down the insight in your own words. That is the part ' +
      'that transfers to the next problem. Saved automatically, stays on this computer.',
    'notes.placeholder': 'What made this click?\nWhat would I look for next time?\n' +
      'What did I get wrong first?',
    'notes.summarize': 'Draft a summary from our conversation',
    'notes.summarizePrompt': 'Write three or four bullet points I should keep in ' +
      'my notes about this problem: the key insight, the pattern it belongs to, ' +
      'and the mistake to avoid next time. Keep it short enough to reread in ten seconds.',

    /* ---------------------------------------------------------- progress */
    'progress.streak': 'day streak',
    'progress.solved': 'solved',
    'progress.seen': 'problems seen',
    'progress.hints': 'hints used',
    'progress.due': 'Due for review',
    'progress.dueEmpty': 'Nothing due. Mark a problem solved and Ladder will bring ' +
      'it back in a day, then three, then a week.',
    'progress.recent': 'Recent',
    'progress.recentEmpty': 'No problems tracked yet.',
    'progress.loading': 'Loading...',
    'progress.hintN': 'hint {n}',
    'badge.solved': 'solved',
    'badge.review': 'review',

    /* ------------------------------------------------------------ toasts */
    'toast.theme': 'Theme: {mode}',
    'theme.auto': 'match the system',
    'theme.light': 'light',
    'theme.dark': 'dark',
    'toast.docked': 'Docked beside the page',
    'toast.floating': 'Floating over the page',
    'toast.codeLang': 'Code examples will use {lang}',
    'toast.reread': 'Re-read the problem from the page',
    'toast.rereadFail': 'Could not find a problem statement on this page',
    'toast.busy': 'Still writing the last answer...',
    'toast.needCode': 'Paste your code first',
    'toast.solvedMark': 'Marked solved. Review scheduled for {when}.',
    'toast.stuckMark': 'Added to tomorrow\'s review list.',
    'toast.beginnerOn': 'Beginner mode on: every term gets defined',
    'toast.beginnerOff': 'Beginner mode off: tighter, more technical answers',

    'confirm.skip.one': 'You are about to skip 1 rung and jump straight to ' +
      '"{label}".\n\nSmaller hints are usually enough. Jump anyway?',
    'confirm.skip.other': 'You are about to skip {n} rungs and jump straight to ' +
      '"{label}".\n\nSmaller hints are usually enough. Jump anyway?',

    /* -------------------------------------------------------------- asks */
    'ask.review': 'Review my code',
    'ask.debug': 'Why is it failing?',
    'ask.optimize': 'Make it faster',
    'ask.dryrun': 'Trace it step by step',
    'ask.concepts': 'What should I learn first?',
    'ask.testcases': 'Edge cases to test',
    'ask.glossary': 'Explain "{term}" in the context of this problem.',
    'ask.fallback': 'Help me with this',

    /* -------------------------------------------------------------- time */
    'time.never': 'never',
    'time.today': 'today',
    'time.tomorrow': 'tomorrow',
    'time.yesterday': 'yesterday',
    'time.inDays': 'in {n} days',
    'time.agoDays': '{n} days ago',

    /* ------------------------------------------------------------- popup */
    'popup.noProvider': 'no key yet — click settings below',
    'popup.open': 'Open the panel',
    'popup.hint': 'Next hint',
    'popup.notProblem': 'Not a known problem page',
    'popup.notProblemBody': 'Open the panel anyway and paste a problem in.',
    'popup.openProblem': 'Open a problem on LeetCode, Codeforces, AtCoder and friends.',
    'popup.noStatement': 'No problem statement detected on this page',
    'popup.noHints': 'no hints used yet',
    'popup.hintLevel': 'hint {n} of 5',
    'popup.streak': 'streak',
    'popup.solved': 'solved',
    'popup.seen': 'seen',
    'popup.due': 'Due for review',
    'popup.settings': 'Settings and API keys',

    /* ----------------------------------------------------------- options */
    'opt.title': 'Ladder settings',
    'opt.tagline': 'Progressive hints for LeetCode, Codeforces and friends.',
    'opt.status.none': 'No provider yet',
    'opt.status.using': 'Using {provider} · {model}',

    'opt.start.title': 'Start here: a free key in about a minute',
    'opt.start.title2': 'Add another key, or swap the one you use',
    'opt.step1.title': 'Open Google AI Studio',
    'opt.step1.body': 'Sign in with any Google account. No credit card, no billing setup.',
    'opt.step1.cta': 'Get a free Gemini key',
    'opt.step2.title': 'Click "Create API key", then copy it',
    'opt.step2.body': 'It looks like <code>AIzaSy…</code> — a long string of ' +
      'letters and numbers.',
    'opt.step3.title': 'Paste it below',
    'opt.step3.body': 'Ladder works out which provider it belongs to on its own.',
    'opt.paste.placeholder': 'Paste any API key here',
    'opt.paste.save': 'Save key',
    'opt.paste.hint': 'Works with Gemini, OpenAI, Anthropic, OpenRouter, Groq, ' +
      'DeepSeek, Mistral, xAI, Together and Cerebras keys.',
    'opt.paste.detected': 'Looks like a {provider} key.',
    'opt.paste.unknownType': 'Not a shape Ladder recognises. Save it against a ' +
      'specific provider below instead.',
    'opt.paste.unknownSave': 'Ladder could not tell which provider this key ' +
      'belongs to. Paste it into that provider\'s own box below.',
    'opt.paste.savedTesting': 'Saved and set as your provider: {provider}. ' +
      'Testing it now…',
    'opt.paste.savedOk': 'Saved and working. Open a problem and press Ctrl+Shift+L.',
    'opt.paste.savedFail': 'Saved, but the test failed: {error}',

    'opt.providers': 'Providers',
    'opt.providers.note': 'Add as many as you like and switch between them. Keys ' +
      'are stored in this browser only and are sent nowhere except the provider you picked.',
    'opt.prov.use': 'Use this',
    'opt.prov.inUse': 'In use',
    'opt.prov.show': 'Show',
    'opt.prov.hide': 'Hide',
    'opt.prov.save': 'Save',
    'opt.prov.test': 'Test',
    'opt.prov.model': 'Model',
    'opt.prov.getKey': 'Get a key →',
    'opt.prov.install': 'Install it →',
    'opt.prov.free': 'Free tier',
    'opt.prov.local': 'Local',
    'opt.prov.keyPlaceholder': 'API key',
    'opt.prov.basePlaceholder': 'Base URL, e.g. https://my-host/v1',
    'opt.prov.modelPlaceholder': 'model name',
    'opt.res.saved': 'Saved',
    'opt.res.removed': 'Key removed',
    'opt.res.needKey': 'Add a key first',
    'opt.res.testing': 'Testing…',
    'opt.res.working': 'Working',
    'opt.res.workingN': 'Working · {n} models',
    'opt.res.failed': 'Failed',
    'opt.res.permOk': 'Permission granted for {origin}',
    'opt.res.permNo': 'Ladder needs permission for {origin} to reach it',

    'opt.coach': 'How Ladder coaches you',
    'opt.beginner.title': 'Beginner mode',
    'opt.beginner.body': 'Assume no computer science background. Every term gets ' +
      'defined, every complexity gets explained in plain words. Turn this off once ' +
      'the jargon stops slowing you down.',
    'opt.spoiler.title': 'Blur full solutions until clicked',
    'opt.spoiler.body': 'Stops your eyes landing on the answer by accident when ' +
      'you scroll.',
    'opt.autoOpen.title': 'Open automatically on problem pages',
    'opt.autoOpen.body': 'Off by default, so the panel only appears when you want it.',
    'opt.sendCode.title': 'Include my code with requests',
    'opt.sendCode.body': 'Lets Ladder review what you have written. Turn off to ' +
      'send only the problem statement.',
    'opt.uiLang.title': 'Ladder\'s language',
    'opt.uiLang.body': 'Changes the panel, this page and the language your answers ' +
      'come back in.',
    'opt.lang.title': 'Language for code examples',
    'opt.theme.title': 'Panel theme',
    'opt.theme.auto': 'Match the system',
    'opt.theme.light': 'Light',
    'opt.theme.dark': 'Dark',
    'opt.style.title': 'Answer style',
    'opt.style.body': 'Lower is more predictable, higher is more varied.',

    'opt.keyboard': 'Keyboard',
    'opt.keyboard.note': 'Change these at <code>chrome://extensions/shortcuts</code>.',
    'opt.kb.toggle': 'Show or hide the panel',
    'opt.kb.hint': 'Ask for the next hint',
    'opt.kb.send': 'Send a question',
    'opt.kb.newline': 'New line in a question',
    'opt.kb.close': 'Close the panel',

    'opt.data': 'Your data',
    'opt.data.note': 'Everything Ladder knows lives in this browser profile. ' +
      'Nothing is uploaded anywhere, and there is no account.',
    'opt.data.export': 'Export progress',
    'opt.data.import': 'Import progress',
    'opt.data.clear': 'Erase everything',
    'opt.data.exported': 'Exported. API keys are deliberately left out of the file.',
    'opt.data.imported': 'Imported {n} problems.',
    'opt.data.importFail': 'Could not import: {error}',
    'opt.data.notLadder': 'Not a Ladder export file.',
    'opt.data.confirmClear': 'Erase all Ladder data in this browser?\n\nThis ' +
      'removes your API keys, notes, progress and review schedule. It cannot be undone.',
    'opt.data.cleared': 'Everything erased.',
    'opt.foot': 'Ladder is a study tool. If you are practising for an interview, ' +
      'the hint ladder only helps if you climb it slowly — every rung you skip is ' +
      'a rep you did not do.',

    /* --------------------------------------------------------- providers */
    'prov.gemini.tagline': 'Free tier, no card required. Best place to start.',
    'prov.gemini.keyHint': 'Starts with AIza...',
    'prov.groq.tagline': 'Free tier, answers arrive almost instantly.',
    'prov.groq.keyHint': 'Starts with gsk_...',
    'prov.openrouter.tagline': 'One key, many models. Several are free.',
    'prov.openrouter.keyHint': 'Starts with sk-or-v1-...',
    'prov.cerebras.tagline': 'Free tier, very fast.',
    'prov.cerebras.keyHint': 'Starts with csk-...',
    'prov.mistral.tagline': 'Free tier on La Plateforme.',
    'prov.mistral.keyHint': 'A 32-character key',
    'prov.openai.tagline': 'Paid. Needs billing on the account.',
    'prov.openai.keyHint': 'Starts with sk-...',
    'prov.anthropic.tagline': 'Paid. Strong at step-by-step explanation.',
    'prov.anthropic.keyHint': 'Starts with sk-ant-...',
    'prov.deepseek.tagline': 'Cheap, strong on algorithms.',
    'prov.deepseek.keyHint': 'Starts with sk-...',
    'prov.xai.tagline': 'Paid.',
    'prov.xai.keyHint': 'Starts with xai-...',
    'prov.together.tagline': 'Open-weight models, pay per token.',
    'prov.together.keyHint': 'A 64-character hex key',
    'prov.ollama.tagline': 'Runs locally. No key, no cost, works offline.',
    'prov.ollama.keyHint': 'No key needed. Start it with: OLLAMA_ORIGINS=* ollama serve',
    'prov.custom.tagline': 'Any endpoint that speaks /chat/completions.',
    'prov.custom.keyHint': 'Set the base URL and model yourself',

    /* ------------------------------------------------------------ errors */
    'err.noProvider': 'No AI provider is set up yet. Open Ladder settings to add ' +
      'a key — Google Gemini has a free tier and takes about a minute.',
    'err.unknownProvider': 'Unknown provider: {id}',
    'err.noKey': 'No key saved for {provider}. Open Ladder settings to add one.',
    'err.rejected': 'That API key was rejected (HTTP {status}). Open Ladder\'s ' +
      'settings and check the key for {provider}. {detail}',
    'err.rate': 'Rate limit reached (HTTP 429). Free tiers cap requests per ' +
      'minute — wait a moment and try again, or switch provider in settings. {detail}',
    'err.model404': 'The model was not found (HTTP 404). The model name in ' +
      'settings may be wrong or unavailable on your plan. {detail}',
    'err.bad400': 'The provider rejected the request (HTTP 400). {detail}',
    'err.server5xx': 'The provider had a server error (HTTP {status}). Usually ' +
      'temporary. {detail}',
    'err.generic': 'Request failed (HTTP {status}). {detail}',
    'err.emptyBody': 'The provider returned an empty response.',
    'err.blank': 'The model returned nothing. This usually means a safety filter ' +
      'fired or the model name is wrong. Try a different model in settings.',
    'err.netLocal': 'Could not reach {provider}. Is it running? Local servers must ' +
      'be started with OLLAMA_ORIGINS=* so the extension is allowed to connect.',
    'err.net': 'Could not reach the provider. Check your internet connection, and ' +
      'if you are using a custom endpoint, that Ladder has permission for that host.',
    'err.probeLocal': 'Could not reach that endpoint. Check the server is running ' +
      'and that it allows requests from browser extensions (for Ollama: OLLAMA_ORIGINS=*).',
    'err.probeNet': 'Could not reach the provider: {detail}',
    'err.noEndpoint': 'No endpoint is configured for this provider.',
    'err.noModel': 'No model is configured for this provider.',
    'err.stoppedBy': '\n\n_(stopped: {reason})_',

    /* ---------------------------------------------------------- glossary */
    'g.array.def': 'A numbered row of boxes holding values, side by side.',
    'g.array.why': 'Position 0 is the first box, not position 1. Almost every off-by-one bug starts here.',
    'g.index.def': 'The position number of an item in an array.',
    'g.index.why': 'Read the problem carefully: some sites count from 0, some from 1.',
    'g.subarray.def': 'A run of neighbouring items taken from an array, with no gaps.',
    'g.subarray.why': 'Different from a subsequence: subarrays must be next to each other.',
    'g.subsequence.def': 'Items picked from an array in order, but allowed to skip.',
    'g.subsequence.why': 'From [1,2,3], the subsequence [1,3] is legal; the subarray [1,3] is not.',
    'g.substring.def': 'A run of neighbouring characters inside a string.',
    'g.substring.why': 'Same idea as a subarray, but for text.',
    'g.permutation.def': 'A rearrangement of the same items into a different order.',
    'g.permutation.why': 'n items have n factorial orderings, which grows terrifyingly fast.',
    'g.hash-map.def': 'A lookup table: you give it a name, it hands back the value instantly.',
    'g.hash-map.why': 'Turns "search the whole list for x" into a single instant question.',
    'g.set.def': 'A bag that holds each value at most once and answers "is x in here?" instantly.',
    'g.set.why': 'The standard tool for spotting duplicates.',
    'g.stack.def': 'A pile where you only add and remove from the top.',
    'g.stack.why': 'Good for anything with nesting: brackets, undo, backtracking.',
    'g.queue.def': 'A line where you join at the back and leave from the front.',
    'g.queue.why': 'The engine inside breadth-first search.',
    'g.linked-list.def': 'A chain of boxes where each box also holds an arrow to the next one.',
    'g.linked-list.why': 'You cannot jump to the middle; you must walk from the head.',
    'g.tree.def': 'A structure that branches downward from a single root, with no loops.',
    'g.tree.why': 'Almost every tree problem is solved by doing the same thing to each child.',
    'g.binary-search-tree.def': 'A tree kept in sorted order: smaller values left, larger values right.',
    'g.binary-search-tree.why': 'Its in-order walk gives you the values already sorted.',
    'g.graph.def': 'Dots joined by lines. The dots are nodes, the lines are edges.',
    'g.graph.why': 'Roads between cities, friendships, dependencies: all graphs.',
    'g.heap.def': 'A container that always hands you the smallest (or largest) item next.',
    'g.heap.why': 'Use it when you repeatedly need the current best of a changing set.',
    'g.recursion.def': 'A function that calls itself on a smaller version of the same problem.',
    'g.recursion.why': 'Needs a base case, or it runs forever and crashes with a stack overflow.',
    'g.memoization.def': 'Writing down answers you already worked out, so you never redo them.',
    'g.memoization.why': 'Usually the difference between a solution that takes seconds and one that takes years.',
    'g.dynamic-programming.def': 'Solving small pieces first and building bigger answers out of them.',
    'g.dynamic-programming.why': 'Recognisable when the same subproblem keeps reappearing.',
    'g.greedy.def': 'Always taking the best-looking option right now, never reconsidering.',
    'g.greedy.why': 'Fast when it works, silently wrong when it does not. Needs proof.',
    'g.two-pointers.def': 'Two markers moving through the data, usually from opposite ends.',
    'g.two-pointers.why': 'Turns a nested double loop into a single pass.',
    'g.sliding-window.def': 'A stretch of the array that grows at the front and shrinks at the back.',
    'g.sliding-window.why': 'The go-to for "best run of length k" or "shortest run that satisfies X".',
    'g.binary-search.def': 'Halving the search range each step by asking one yes/no question.',
    'g.binary-search.why': 'Needs sorted data, or a yes/no property that flips exactly once.',
    'g.prefix-sum.def': 'A precomputed running total, so any range sum becomes one subtraction.',
    'g.prefix-sum.why': 'Precompute once, then answer thousands of range queries instantly.',
    'g.bfs.def': 'Explore a graph level by level, nearest things first.',
    'g.bfs.why': 'Gives the shortest path when every step costs the same.',
    'g.dfs.def': 'Explore a graph by going as deep as possible before backing up.',
    'g.dfs.why': 'Natural to write recursively; watch the recursion depth on big inputs.',
    'g.backtracking.def': 'Try a choice, explore it, undo it, try the next one.',
    'g.backtracking.why': 'The pattern behind sudoku, n-queens, and generating combinations.',
    'g.time-complexity.def': 'A rough count of how the work grows as the input grows.',
    'g.time-complexity.why': 'O(n) means "doubling the input roughly doubles the work".',
    'g.space-complexity.def': 'How much extra memory you use beyond the input itself.',
    'g.space-complexity.why': 'Sometimes the real constraint, especially on competitive sites.',
    'g.constraints.def': 'The limits on the input size and values, listed in the problem.',
    'g.constraints.why': 'Read these first. They tell you which approaches are fast enough.',
    'g.modulo.def': 'The remainder after division. 7 mod 3 is 1.',
    'g.modulo.why': 'Problems ask for answers mod 1000000007 to keep numbers from overflowing.',
    'g.overflow.def': 'A number growing too big for the box holding it, wrapping to nonsense.',
    'g.overflow.why': 'In C++/Java use a 64-bit type. Python has no limit, so this never bites you.',
    'g.in-place.def': 'Changing the input directly instead of building a new copy.',
    'g.in-place.why': 'Usually requested to force O(1) extra space.',
    'g.stable-sort.def': 'A sort that keeps equal items in their original relative order.',
    'g.stable-sort.why': 'Matters when you sort by one field and want ties broken by an earlier sort.',
    'g.adjacency-list.def': 'How a graph is stored: for each node, the list of nodes it connects to.',
    'g.adjacency-list.why': 'A list is compact; a matrix is a full grid of yes/no.',
    'g.union-find.def': 'A structure that tracks which items are in the same group and merges groups fast.',
    'g.union-find.why': 'The standard tool for "are these two connected?" questions.',
    'g.trie.def': 'A tree of characters, so all words sharing a prefix share a path.',
    'g.trie.why': 'Autocomplete, in structure form.',
    'g.bitmask.def': 'Using the individual binary digits of a number as a row of on/off switches.',
    'g.bitmask.why': 'Lets you represent a subset of up to about 20 items as one integer.',
    'g.sentinel.def': 'A fake extra element at the edge so you do not need a special case for it.',
    'g.sentinel.why': 'Removes most of the null-checking pain in linked list problems.',
    'g.edge-case.def': 'An input at the boundary of what is allowed: empty, single item, all equal, maximum size.',
    'g.edge-case.why': 'Most failed submissions die here, not on the main logic.',
    'g.tle.def': 'Your code is correct but too slow for the time limit.',
    'g.tle.why': 'Do not debug the logic. Reduce the complexity.',
    'g.mle.def': 'Your code used more memory than allowed.',
    'g.mle.why': 'Usually an array sized off the wrong bound, or storing what you could recompute.',
    'g.wa.def': 'Your output did not match the expected output.',
    'g.wa.why': 'Find the smallest input that reproduces it before changing anything.',
    'g.rte.def': 'Your program crashed while running.',
    'g.rte.why': 'Usually an out-of-range index, a divide by zero, or recursion going too deep.',
    'g.stdin.def': 'How competitive sites feed input in and read your answer out.',
    'g.stdin.why': 'Codeforces reads from stdin; LeetCode hands you a function argument instead.',
    'g.lexicographic.def': 'Dictionary order: compare character by character from the left.',
    'g.lexicographic.why': '"apple" comes before "banana", and "Z" before "a" in ASCII.',
    'g.gcd.def': 'The biggest number that divides two numbers evenly.',
    'g.gcd.why': 'Computed instantly with the Euclidean algorithm.',
    'g.prime.def': 'A number divisible only by 1 and itself.',
    'g.prime.why': 'To find all primes up to n, use a sieve, not a divisibility test per number.',
    'g.monotonic.def': 'Only ever going one direction: never decreasing, or never increasing.',
    'g.monotonic.why': 'A monotonic stack answers "next greater element" in one pass.',
    'g.invariant.def': 'Something that stays true every time round the loop.',
    'g.invariant.why': 'Naming it out loud is the fastest way to find the bug in a loop.'
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
