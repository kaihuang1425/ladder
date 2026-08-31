# Chrome Web Store submission copy for Ladder

Use this file as the source of truth when filling the Chrome Web Store Developer Dashboard.

## Product details

**Name**

Ladder — coding practice coach

**Primary category**

Education

**Language**

English (add localized listing copy later for Traditional Chinese, Simplified Chinese, and Spanish if desired)

**Detailed description**

Ladder is a side-by-side coding-practice coach for LeetCode, Codeforces, AtCoder and other programming-problem sites. Instead of immediately showing a full answer, it helps you climb through five levels of assistance so you can get unstuck without skipping the learning.

Start with a plain-English explanation of the problem, then reveal observations, the underlying approach, pseudocode, and finally a full solution only when you decide you need it.

Key features:

- Five progressive hint levels designed to avoid premature spoilers.
- Beginner mode that explains unfamiliar terms instead of assuming prior knowledge.
- Offline glossary support for common data-structure and algorithm vocabulary.
- Code review, debugging guidance, optimization suggestions, and step-by-step traces.
- Notes, progress tracking, and spaced-repetition review reminders stored locally in Chrome.
- Support for LeetCode, Codeforces, AtCoder, HackerRank, CodeChef, CSES, Kattis, SPOJ, Exercism, HackerEarth, and user-invoked use on other pages.
- English, Traditional Chinese, Simplified Chinese, and Spanish interfaces.
- Bring your own AI provider key, use a compatible endpoint, or run a local model with Ollama.

Privacy is intentionally simple: Ladder has no developer-operated server, account system, analytics, advertising, or telemetry. API keys, settings, notes, and progress stay in your Chrome profile. When you explicitly request an AI-powered hint or review, the problem content and any code you choose to include are sent directly from your browser to the AI provider you configured. See the privacy policy for full details.

## Privacy practices

**Single purpose description**

Ladder helps users learn from coding-practice problems by providing progressive hints, explanations, code-review guidance, notes, and spaced-repetition review beside the problem page.

**storage justification**

Required to save the user's provider settings and API keys, language/theme preferences, per-problem notes, solved status, review schedule, and progress locally in the user's Chrome profile.

**activeTab justification**

Used only when the user explicitly invokes Ladder on the current tab, allowing the extension to interact with that page without requesting permanent access to every website.

**scripting justification**

Used to inject Ladder's packaged content scripts into the current active tab when the user explicitly opens Ladder on a page that is not one of the pre-declared coding-practice sites.

**Host-permission justification for coding-practice sites**

The declared content-script site patterns are required so Ladder can read the coding problem currently displayed and render the coaching panel beside it. Ladder does not use this access for advertising, tracking, or unrelated browsing analytics.

**Host-permission justification for AI provider APIs**

Required so the extension service worker can send user-requested hint/review requests directly to the AI provider selected by the user. The developer does not proxy or receive these requests.

**Optional host-permission justification**

Optional HTTPS host access is requested only when a user explicitly configures a custom OpenAI-compatible endpoint. Chrome prompts for the specific origin entered by the user. It is not granted by default.

**Remote code**

Select: **No, I am not using remote code.**

Ladder sends data to AI APIs and renders the returned text, but it does not download or execute JavaScript, WebAssembly, or other executable logic from those services. Extension logic is packaged with the extension.

**Data-use disclosure guidance**

Disclose all categories shown by the dashboard that match Ladder's behavior. At minimum, treat these as handled data:

- Authentication information: provider API keys entered by the user.
- Website content/resources: coding-problem text and related page content read to provide coaching.
- User-provided or user-generated content: code, notes, and other text the user enters into Ladder.
- Browsing activity/site information if the dashboard category encompasses the URL or domain of the current coding-practice page used by the extension.

Be conservative: if a dashboard category reasonably describes data Ladder reads or processes, disclose it even when that data is stored only locally.

Certify the Limited Use statements only if the submitted build continues to match the privacy policy and current behavior.

**Privacy policy URL after this file is merged**

https://github.com/kaihuang1425/ladder/blob/main/PRIVACY.md

## Distribution

Recommended first submission: **Unlisted** or **Private / trusted testers** if you want to verify the installed Web Store build before a public launch. All visibility modes are still reviewed under the same policies.

When ready, switch to **Public** for discovery in the Chrome Web Store.

## Store assets

Required or strongly expected by the current Chrome Web Store listing flow:

- 128×128 extension icon.
- At least one screenshot at 1280×800 or 640×400; use up to five.
- Small promotional tile at 440×280.
- Marquee promotional image at 1400×560 is optional.

Recommended screenshot story:

1. Five-rung hint ladder beside a LeetCode problem.
2. Beginner-friendly Learn/glossary view.
3. Code review / debug / optimize / trace tools.
4. Spoiler-protected full solution reveal.
5. Ladder beside a Codeforces problem to show multi-site support.

## Before pressing Submit for review

- Confirm Google-account 2-Step Verification is enabled.
- Confirm the Chrome Web Store developer account is registered and its contact email is verified.
- Upload the ZIP with `manifest.json` at the ZIP root.
- Re-test the exact uploaded build locally before submission.
- Confirm every permission in the dashboard has a matching justification above.
- Confirm the privacy disclosures match the actual submitted build.
- Confirm no API keys, secrets, private test data, or signing keys are included in the ZIP.
- Confirm the listing screenshots show current functionality.
