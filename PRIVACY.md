# Ladder Privacy Policy

Effective: 31 August 2026

Ladder is a browser extension that provides progressive coding-practice hints and code-review help beside supported programming-problem websites.

## Summary

Ladder has no developer-operated server, no Ladder account system, no advertising, no analytics, and no telemetry. API keys, settings, notes, and progress are stored in the user's Chrome profile with `chrome.storage.local`.

When a user explicitly asks Ladder for an AI-generated hint, explanation, trace, optimization suggestion, or code review, Ladder sends only the information needed for that request directly from the user's browser to the AI provider or compatible endpoint the user configured.

## Data Ladder handles

Ladder may handle the following data on the user's device:

- API keys or credentials that the user enters for an AI provider.
- Settings such as selected provider, model, language, theme, and hint preferences.
- Notes, solved-problem state, review schedule, and progress data created by the user.
- The coding-problem title, statement, examples, metadata, and other relevant problem-page content needed to provide the extension's user-facing coaching features.
- Code or other text the user enters into Ladder when the relevant feature is used. If the user disables code sending, Ladder does not include that code in AI requests.
- The origin of a custom AI endpoint when the user explicitly configures one and grants Chrome permission for it.

Ladder does not collect this information into a database controlled by the developer.

## How data is used

Data is used only to provide Ladder's single purpose: helping the user learn from coding-practice problems through progressive hints, explanations, reviews, traces, notes, and spaced repetition.

Problem content and user-provided code are processed locally unless the user requests an AI-powered feature. For an AI-powered request, the relevant content is sent directly to the provider selected by the user so that provider can generate the requested response.

## Storage and retention

API keys, settings, notes, and progress are stored locally in the user's Chrome browser profile. They remain there until the user changes or deletes them, clears extension storage, or removes the extension.

Ladder does not retain a server-side copy because Ladder does not operate a server that receives this data.

If data is sent to a third-party AI provider, that provider's own privacy policy, retention rules, and account settings apply to the copy it receives.

## Third parties and data sharing

Ladder does not sell user data and does not share user data for advertising, profiling, or data-broker purposes.

When the user chooses an AI provider and requests an AI-powered feature, Ladder may send the request directly to that provider. Supported providers include Google Gemini, Groq, OpenRouter, Cerebras, Mistral, OpenAI, Anthropic, DeepSeek, xAI, Together AI, Ollama, and user-configured OpenAI-compatible endpoints.

The user's API key is sent only to the provider or endpoint for which the user supplied it, for authentication of that request. The Ladder developer does not receive the key.

For a user-configured custom endpoint, the user controls the destination and should review that endpoint's privacy and security practices before using it.

## Website content and browsing activity

Ladder reads relevant coding-problem content on supported sites so it can show its coaching interface and prepare the user-requested hint or review. On another page, Ladder can run only after the user explicitly invokes it and Chrome grants the necessary temporary or optional access.

Ladder does not use browsing activity for advertising, tracking, unrelated analytics, or any purpose outside Ladder's coding-practice functionality.

## Security

Remote AI-provider requests must use HTTPS. Plain HTTP is permitted only for loopback endpoints on the user's own computer, such as `localhost` or `127.0.0.1`, for local-model software such as Ollama.

API keys are kept in extension storage and network requests are made by the extension service worker; page content scripts do not receive the stored API key.

Exported progress files intentionally exclude API keys.

## User control and deletion

Users can change or remove provider keys and settings in Ladder's options page. Removing the extension or clearing its local extension storage deletes Ladder's locally stored data from that Chrome profile.

Users should contact the selected AI provider regarding deletion of any data retained by that provider.

## Chrome Web Store Limited Use disclosure

Ladder's use of information received from Chrome APIs complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. Ladder uses user data only to provide or improve its disclosed coding-practice coaching functionality, does not use or transfer it for personalized advertising, and does not allow humans to read user data except where required by law or necessary for security and permitted by the policy.

## Contact

For privacy questions, bug reports, or support, open an issue in the Ladder GitHub repository: https://github.com/kaihuang1425/ladder/issues
