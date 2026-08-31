/* Ladder - provider registry.
   Every provider reduces to two things: how to build a streaming chat
   request, and which wire format the stream comes back in. */
(function (root) {
  'use strict';

  const NS = (root.Ladder = root.Ladder || {});

  /* Wire formats:
     'openai'    - SSE, choices[0].delta.content, terminated by [DONE]
     'gemini'    - SSE, candidates[0].content.parts[].text
     'anthropic' - SSE, content_block_delta events */

  const PROVIDERS = {
    gemini: {
      id: 'gemini',
      label: 'Google Gemini',
      free: true,
      keyUrl: 'https://aistudio.google.com/apikey',
      keyLooksLike: /^AIza[0-9A-Za-z_-]{20,}$/,
      wire: 'gemini',
      base: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.5-flash',
      models: [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash'
      ]
    },

    groq: {
      id: 'groq',
      label: 'Groq',
      free: true,
      keyUrl: 'https://console.groq.com/keys',
      keyLooksLike: /^gsk_[0-9A-Za-z]{20,}$/,
      wire: 'openai',
      base: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.3-70b-versatile',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen-2.5-coder-32b']
    },

    openrouter: {
      id: 'openrouter',
      label: 'OpenRouter',
      free: true,
      keyUrl: 'https://openrouter.ai/keys',
      keyLooksLike: /^sk-or-v1-[0-9a-f]{32,}$/,
      wire: 'openai',
      base: 'https://openrouter.ai/api/v1',
      defaultModel: 'google/gemini-2.5-flash',
      models: [
        'google/gemini-2.5-flash',
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct',
        'qwen/qwen-2.5-coder-32b-instruct',
        'anthropic/claude-sonnet-4.5',
        'openai/gpt-4.1-mini'
      ],
      extraHeaders: { 'X-Title': 'Ladder' }
    },

    cerebras: {
      id: 'cerebras',
      label: 'Cerebras',
      free: true,
      keyUrl: 'https://cloud.cerebras.ai',
      keyLooksLike: /^csk-[0-9a-z]{20,}$/,
      wire: 'openai',
      base: 'https://api.cerebras.ai/v1',
      defaultModel: 'llama-3.3-70b',
      models: ['llama-3.3-70b', 'qwen-3-coder-480b']
    },

    mistral: {
      id: 'mistral',
      label: 'Mistral',
      free: true,
      keyUrl: 'https://console.mistral.ai/api-keys',
      wire: 'openai',
      base: 'https://api.mistral.ai/v1',
      defaultModel: 'mistral-small-latest',
      models: ['mistral-small-latest', 'mistral-large-latest', 'codestral-latest']
    },

    openai: {
      id: 'openai',
      label: 'OpenAI',
      keyUrl: 'https://platform.openai.com/api-keys',
      keyLooksLike: /^sk-(?!ant-|or-)(proj-|svcacct-)?[0-9A-Za-z_-]{20,}$/,
      wire: 'openai',
      base: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4.1-mini',
      models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'o4-mini']
    },

    anthropic: {
      id: 'anthropic',
      label: 'Anthropic Claude',
      keyUrl: 'https://console.anthropic.com/settings/keys',
      keyLooksLike: /^sk-ant-[0-9A-Za-z_-]{20,}$/,
      wire: 'anthropic',
      base: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-sonnet-4-5',
      models: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5']
    },

    deepseek: {
      id: 'deepseek',
      label: 'DeepSeek',
      keyUrl: 'https://platform.deepseek.com/api_keys',
      keyLooksLike: /^sk-[0-9a-f]{32}$/,
      wire: 'openai',
      base: 'https://api.deepseek.com',
      defaultModel: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner']
    },

    xai: {
      id: 'xai',
      label: 'xAI Grok',
      keyUrl: 'https://console.x.ai',
      keyLooksLike: /^xai-[0-9A-Za-z]{20,}$/,
      wire: 'openai',
      base: 'https://api.x.ai/v1',
      defaultModel: 'grok-4-fast',
      models: ['grok-4-fast', 'grok-4']
    },

    together: {
      id: 'together',
      label: 'Together AI',
      keyUrl: 'https://api.together.xyz/settings/api-keys',
      wire: 'openai',
      base: 'https://api.together.xyz/v1',
      defaultModel: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      models: [
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'meta-llama/Llama-3.3-70B-Instruct-Turbo'
      ]
    },

    ollama: {
      id: 'ollama',
      label: 'Ollama (this computer)',
      free: true,
      local: true,
      noKey: true,
      keyUrl: 'https://ollama.com/download',
      wire: 'openai',
      base: 'http://localhost:11434/v1',
      defaultModel: 'qwen2.5-coder:7b',
      models: ['qwen2.5-coder:7b', 'llama3.1:8b', 'deepseek-coder-v2:16b']
    },

    custom: {
      id: 'custom',
      label: 'Custom (OpenAI-compatible)',
      wire: 'openai',
      base: '',
      defaultModel: '',
      models: [],
      configurable: true
    }
  };

  const ORDER = [
    'gemini', 'groq', 'openrouter', 'cerebras', 'mistral',
    'openai', 'anthropic', 'deepseek', 'xai', 'together',
    'ollama', 'custom'
  ];

  /* Detection order is by pattern specificity, not display order: several
     providers issue keys beginning "sk-", so the ones with a distinctive
     prefix or a fixed length have to be tested before the loose ones. */
  const DETECT_ORDER = [
    'gemini', 'groq', 'cerebras', 'xai',   // unique prefixes
    'openrouter', 'anthropic',             // sk-or-v1- / sk-ant-
    'deepseek',                            // sk- plus exactly 32 hex
    'openai'                               // the catch-all sk- shape
  ];

  /* Guess which provider a pasted key belongs to, so the user can paste
     a key without first knowing which box it goes in. */
  function detectProvider(key) {
    const k = String(key || '').trim();
    if (!k) return null;
    for (const id of DETECT_ORDER) {
      const p = PROVIDERS[id];
      if (p && p.keyLooksLike && p.keyLooksLike.test(k)) return id;
    }
    if (/^sk-or-/.test(k)) return 'openrouter';
    if (/^sk-ant/.test(k)) return 'anthropic';
    if (/^sk-/.test(k)) return 'openai';
    return null;
  }

  function baseFor(provider, settings) {
    if (provider.id === 'custom') {
      return String(settings.customBase || '').replace(/\/+$/, '');
    }
    if (provider.id === 'ollama' && settings.ollamaBase) {
      return String(settings.ollamaBase).replace(/\/+$/, '');
    }
    return provider.base;
  }

  function modelFor(provider, settings) {
    const chosen = settings.models && settings.models[provider.id];
    return chosen || provider.defaultModel || '';
  }

  /* Build a streaming chat request.
     messages: [{ role: 'system' | 'user' | 'assistant', content }] */
  function buildRequest(opts) {
    const { providerId, key, settings, messages } = opts;
    const maxTokens = opts.maxTokens || 4096;
    const p = PROVIDERS[providerId];
    if (!p) throw new Error('Unknown provider: ' + providerId);

    const base = baseFor(p, settings);
    if (!base) throw new Error(NS.t ? NS.t('err.noEndpoint') : 'No endpoint configured.');
    const model = modelFor(p, settings);
    if (!model) throw new Error(NS.t ? NS.t('err.noModel') : 'No model configured.');

    const temperature =
      typeof settings.temperature === 'number' ? settings.temperature : 0.4;
    const system = messages
      .filter(function (m) { return m.role === 'system'; })
      .map(function (m) { return m.content; })
      .join('\n\n');
    const turns = messages.filter(function (m) { return m.role !== 'system'; });

    if (p.wire === 'gemini') {
      const url = base + '/models/' + encodeURIComponent(model) +
        ':streamGenerateContent?alt=sse&key=' + encodeURIComponent(key);
      const body = {
        contents: turns.map(function (m) {
          return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          };
        }),
        generationConfig: { temperature: temperature, maxOutputTokens: maxTokens }
      };
      if (system) body.systemInstruction = { parts: [{ text: system }] };
      return {
        url: url,
        wire: 'gemini',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      };
    }

    if (p.wire === 'anthropic') {
      const body = {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        stream: true,
        messages: turns.map(function (m) {
          return { role: m.role, content: m.content };
        })
      };
      if (system) body.system = system;
      return {
        url: base + '/messages',
        wire: 'anthropic',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify(body)
        }
      };
    }

    // OpenAI-compatible
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      p.extraHeaders || {}
    );
    if (key) headers.Authorization = 'Bearer ' + key;
    return {
      url: base + '/chat/completions',
      wire: 'openai',
      init: {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: model,
          stream: true,
          temperature: temperature,
          max_tokens: maxTokens,
          messages: messages.map(function (m) {
            return { role: m.role, content: m.content };
          })
        })
      }
    };
  }

  /* A cheap GET used to verify a key actually works. */
  function buildProbe(opts) {
    const { providerId, key, settings } = opts;
    const p = PROVIDERS[providerId];
    const base = baseFor(p, settings);
    if (!base) throw new Error(NS.t ? NS.t('err.noEndpoint') : 'No endpoint configured.');

    if (p.wire === 'gemini') {
      return {
        url: base + '/models?key=' + encodeURIComponent(key),
        init: { method: 'GET' }
      };
    }
    if (p.wire === 'anthropic') {
      return {
        url: base + '/models',
        init: {
          method: 'GET',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        }
      };
    }
    const headers = Object.assign({}, p.extraHeaders || {});
    if (key) headers.Authorization = 'Bearer ' + key;
    return { url: base + '/models', init: { method: 'GET', headers: headers } };
  }

  /* Pull model ids out of whatever shape a provider returns. */
  function parseModelList(providerId, json) {
    if (!json) return [];
    const p = PROVIDERS[providerId];
    if (p && p.wire === 'gemini') {
      return (json.models || [])
        .filter(function (m) {
          return (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0;
        })
        .map(function (m) { return String(m.name || '').replace(/^models\//, ''); })
        .filter(Boolean);
    }
    const rows = json.data || json.models || [];
    return rows
      .map(function (m) { return m.id || m.name; })
      .filter(Boolean)
      .map(String);
  }

  /* Display strings come from the locale dictionaries, not the registry. */
  function providerTagline(id) {
    return NS.t ? NS.t('prov.' + id + '.tagline') : '';
  }
  function providerKeyHint(id) {
    return NS.t ? NS.t('prov.' + id + '.keyHint') : '';
  }

  Object.assign(NS, {
    PROVIDERS: PROVIDERS,
    PROVIDER_ORDER: ORDER,
    detectProvider: detectProvider,
    buildRequest: buildRequest,
    buildProbe: buildProbe,
    parseModelList: parseModelList,
    modelFor: modelFor,
    baseFor: baseFor,
    providerTagline: providerTagline,
    providerKeyHint: providerKeyHint
  });
})(typeof globalThis !== 'undefined' ? globalThis : self);
