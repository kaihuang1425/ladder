/* Ladder - service worker.
   All provider network calls happen here. API keys never leave this context:
   the content script sends a request description, not a key. */

importScripts(
  '/src/shared/constants.js',
  '/src/shared/i18n.js',
  '/src/shared/locales/en.js',
  '/src/shared/locales/zh-TW.js',
  '/src/shared/locales/zh-CN.js',
  '/src/shared/locales/es.js',
  '/src/shared/providers.js',
  '/src/shared/prompts.js'
);

const L = self.Ladder;

/* ------------------------------------------------------------ SSE parsing */

/* Yield text deltas from a streaming response body. */
async function* streamDeltas(response, wire) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let cut;
    while ((cut = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, cut).replace(/\r$/, '');
      buffer = buffer.slice(cut + 1);
      if (!line.startsWith('data:')) continue;

      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let json;
      try { json = JSON.parse(payload); } catch (_) { continue; }

      if (wire === 'gemini') {
        const cands = json.candidates || [];
        for (const c of cands) {
          const parts = (c.content && c.content.parts) || [];
          for (const p of parts) if (p.text) yield p.text;
          if (c.finishReason && c.finishReason !== 'STOP' && c.finishReason !== 'MAX_TOKENS') {
            yield L.t('err.stoppedBy', { reason: c.finishReason });
          }
        }
      } else if (wire === 'anthropic') {
        if (json.type === 'content_block_delta' && json.delta && json.delta.text) {
          yield json.delta.text;
        } else if (json.type === 'error') {
          throw new Error((json.error && json.error.message) || 'Provider error');
        }
      } else {
        const choice = (json.choices || [])[0];
        if (!choice) continue;
        const delta = choice.delta || choice.message || {};
        if (typeof delta.content === 'string' && delta.content) yield delta.content;
        // some providers stream reasoning separately; ignore it for display
      }
    }
  }
}

/* Turn a failed response into something a beginner can act on. */
async function describeFailure(response, providerId) {
  let detail = '';
  try {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      detail = (json.error && (json.error.message || json.error.code)) ||
        json.message ||
        (Array.isArray(json) && json[0] && json[0].error && json[0].error.message) ||
        text.slice(0, 300);
    } catch (_) {
      detail = text.slice(0, 300);
    }
  } catch (_) { /* body already consumed or empty */ }

  const s = response.status;
  const p = L.PROVIDERS[providerId] || {};
  const vars = { status: s, detail: detail, provider: p.label || providerId };

  if (s === 401 || s === 403) return L.t('err.rejected', vars);
  if (s === 429) return L.t('err.rate', vars);
  if (s === 404) return L.t('err.model404', vars);
  if (s === 400) return L.t('err.bad400', vars);
  if (s >= 500) return L.t('err.server5xx', vars);
  return L.t('err.generic', vars);
}

/* --------------------------------------------------------------- streaming */

const activeControllers = new Map();

async function runStream(port, msg) {
  const requestId = msg.requestId;
  const settings = await L.getSettings();
  L.setLocale(L.resolveLocale(settings.locale));
  settings.replyLanguage = L.replyLanguage(L.getLocale());
  const keys = await L.getKeys();
  const providerId = msg.providerId || settings.provider;

  if (!providerId) {
    port.postMessage({
      type: 'error', requestId,
      error: L.t('err.noProvider'),
      needsSetup: true
    });
    return;
  }

  const provider = L.PROVIDERS[providerId];
  if (!provider) {
    port.postMessage({
      type: 'error', requestId, error: L.t('err.unknownProvider', { id: providerId })
    });
    return;
  }

  const key = keys[providerId] || '';
  if (!key && !provider.noKey) {
    port.postMessage({
      type: 'error', requestId,
      error: L.t('err.noKey', { provider: provider.label }),
      needsSetup: true
    });
    return;
  }

  // The panel sends intent (kind, level, problem, code). Prompts are assembled
  // here so the content script never carries the prompt library or the key.
  const messages = msg.messages ||
    L.buildMessages(Object.assign({}, msg.opts, { settings: settings }));

  let built;
  try {
    built = L.buildRequest({
      providerId: providerId,
      key: key,
      settings: settings,
      messages: messages,
      maxTokens: msg.maxTokens
    });
  } catch (e) {
    port.postMessage({ type: 'error', requestId, error: e.message, needsSetup: true });
    return;
  }

  const controller = new AbortController();
  activeControllers.set(requestId, controller);
  built.init.signal = controller.signal;

  const started = Date.now();
  let charCount = 0;

  try {
    const response = await fetch(built.url, built.init);
    if (!response.ok) {
      port.postMessage({
        type: 'error', requestId,
        error: await describeFailure(response, providerId),
        needsSetup: response.status === 401 || response.status === 403
      });
      return;
    }
    if (!response.body) {
      port.postMessage({ type: 'error', requestId, error: L.t('err.emptyBody') });
      return;
    }

    port.postMessage({ type: 'start', requestId });
    for await (const delta of streamDeltas(response, built.wire)) {
      charCount += delta.length;
      port.postMessage({ type: 'delta', requestId, delta: delta });
    }

    if (charCount === 0) {
      port.postMessage({
        type: 'error', requestId,
        error: L.t('err.blank')
      });
      return;
    }
    port.postMessage({ type: 'done', requestId, ms: Date.now() - started });
  } catch (e) {
    if (e.name === 'AbortError') {
      port.postMessage({ type: 'aborted', requestId });
      return;
    }
    let hint = e.message || String(e);
    if (/Failed to fetch|NetworkError|load failed/i.test(hint)) {
      hint = provider.local
        ? L.t('err.netLocal', { provider: provider.label })
        : L.t('err.net');
    }
    port.postMessage({ type: 'error', requestId, error: hint });
  } finally {
    activeControllers.delete(requestId);
  }
}

/* ------------------------------------------------------------ port routing */

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== 'ladder') return;

  port.onMessage.addListener(function (msg) {
    if (!msg || !msg.type) return;

    if (msg.type === 'stream') {
      runStream(port, msg).catch(function (e) {
        try {
          port.postMessage({ type: 'error', requestId: msg.requestId, error: String(e) });
        } catch (_) { /* port closed */ }
      });
      return;
    }

    if (msg.type === 'abort') {
      const c = activeControllers.get(msg.requestId);
      if (c) c.abort();
      return;
    }
  });

  port.onDisconnect.addListener(function () {
    for (const c of activeControllers.values()) c.abort();
    activeControllers.clear();
  });
});

/* --------------------------------------------------- one-shot message API */

async function testKey(providerId, key, overrides) {
  const settings = Object.assign(await L.getSettings(), overrides || {});
  L.setLocale(L.resolveLocale(settings.locale));
  const provider = L.PROVIDERS[providerId];
  if (!provider) return { ok: false, error: L.t('err.unknownProvider', { id: providerId }) };

  let probe;
  try {
    probe = L.buildProbe({ providerId: providerId, key: key, settings: settings });
  } catch (e) {
    return { ok: false, error: e.message };
  }

  try {
    const res = await fetch(probe.url, probe.init);
    if (!res.ok) {
      return { ok: false, error: await describeFailure(res, providerId) };
    }
    const json = await res.json().catch(function () { return null; });
    const models = L.parseModelList(providerId, json);
    return { ok: true, models: models };
  } catch (e) {
    const local = provider.local || providerId === 'custom';
    return {
      ok: false,
      error: local ? L.t('err.probeLocal') : L.t('err.probeNet', { detail: e.message || e })
    };
  }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || !msg.type) return;

  if (msg.type === 'testKey') {
    testKey(msg.providerId, msg.key, msg.overrides).then(sendResponse);
    return true;
  }

  if (msg.type === 'buildMessages') {
    L.getSettings().then(function (settings) {
      sendResponse({
        messages: L.buildMessages(Object.assign({}, msg.opts, { settings: settings }))
      });
    });
    return true;
  }

  if (msg.type === 'requestHostPermission') {
    chrome.permissions.request({ origins: msg.origins }, function (granted) {
      sendResponse({ granted: !!granted });
    });
    return true;
  }

  if (msg.type === 'openOptions') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }

  if (msg.type === 'togglePanelInTab') {
    injectAndToggle(msg.tabId).then(sendResponse);
    return true;
  }
});

/* --------------------------------------------------------------- commands */

async function injectAndToggle(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'ladder:toggle' });
    return { ok: true };
  } catch (_) {
    // Not injected on this page yet (an unsupported site the user force-opened).
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [
          'src/shared/constants.js',
          'src/shared/markdown.js',
          'src/shared/glossary.js',
          'src/content/adapters.js',
          'src/content/panel.js'
        ]
      });
      await chrome.tabs.sendMessage(tabId, { type: 'ladder:toggle' });
      return { ok: true, injected: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

chrome.commands.onCommand.addListener(async function (command) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  if (command === 'toggle-panel') {
    await injectAndToggle(tab.id);
  } else if (command === 'next-hint') {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'ladder:next-hint' });
    } catch (_) {
      await injectAndToggle(tab.id);
    }
  }
});

chrome.runtime.onInstalled.addListener(async function (details) {
  const settings = await L.getSettings();
  await chrome.storage.local.set({ settings: settings });
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});
