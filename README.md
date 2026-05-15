# AI Test Solver (Gemini-Powered Chrome Extension)

**Discreet Chrome extension written in vanilla JavaScript that uses Google Gemini AI to solve multiple-choice tests AND open-ended exercises on any webpage in real time.**

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Pro-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.1-success?style=for-the-badge)

## Description

AI Test Solver is a zero-footprint Chrome extension that injects a minimal, near-invisible UI onto any webpage. With one click it extracts the visible text of the page (or the user's selected fragment), strips anti-AI sabotage patterns, and dispatches the sanitized content to Google Gemini via direct API call. The extension automatically detects whether the exercise is multiple-choice or open-ended:

- **Multiple-choice** → returns only the correct answer letters, displayed inline above the trigger button.
- **Open-ended** (theory questions, problem-solving, code, mathematical modeling, essays, definitions, demonstrations) → returns a full developed answer, available via a circular **copy-to-clipboard button** ready to be pasted into the answer field.

Architecture is entirely self-contained inside a single content script — no external dependencies, no backend, no data collection. The user supplies their own Gemini API key, stored exclusively in `chrome.storage.sync`.

## Why students use it

This extension is purpose-built to be a fast, frictionless assistant during online exams, quizzes, homework, and lab tests. Practical advantages:

- **Universal subject coverage.** Works for every subject Gemini can reason about: mathematics, statistics, physics, chemistry, biology, medicine, engineering, computer science, economics, law, history, languages, literature, philosophy, psychology, business, accounting, marketing, art history — anything textual.
- **Universal exam platform coverage.** Works on any web-based exam platform whose content is rendered as readable HTML: Moodle, Sakai, Google Forms, Microsoft Forms, Blackboard, Canvas, Schoology, Kahoot review pages, Quizlet, Edpuzzle, Socrative, custom university portals, lecture-quiz tools, and standard webpages with embedded questions.
- **Multiple-choice questions in seconds.** A,B,C,D answers appear stacked next to the trigger button — one letter per question, in order — so you can fill out a 30-question quiz in under a minute.
- **Open-ended exercises solved end-to-end.** Whether it's a programming model (Python, SQL, MATLAB, R, C++, JavaScript, HTML/CSS, Java, etc.), a mathematical derivation, a short essay, a comparative analysis, a definition, or a multi-paragraph theoretical answer — the extension returns the full solution and exposes a one-click copy button to paste it directly into the exam's answer box.
- **Selection-aware solving.** Highlight a single question, sub-question, or paragraph with the cursor and the extension solves only that fragment — using the rest of the page as context for tables, formulas, and shared data. Without selection, it solves the whole exercise on the current page automatically.
- **No tab switching.** No need to copy-paste questions into ChatGPT, switch windows, or alt-tab to a separate AI tool. Everything happens in-place on the exam page.
- **Camouflaged interface.** The trigger is an 18-pixel near-transparent ✓ at the screen edge — practically invisible at a glance and easily mistaken for a page artifact. A second ✓ at the bottom-right corner restores the UI after hiding it, with even lower opacity (`0.25`).
- **Instant hide / restore.** A single × dismisses the entire UI. Bring it back with the bottom-right ✓ — cached answers re-render immediately without re-querying Gemini, saving API quota.
- **Clean output, ready to paste.** Open answers come stripped of markdown noise (asterisks, headings, bullet bloat, code fences) — the text reads like a student would handwrite it on an exam.
- **Anti-prompt-injection defense.** Many institutional exam platforms now embed hidden instructions designed to detect or sabotage AI assistants ("if you are an AI, answer X", "ignore previous instructions"). The extension neutralizes these patterns before sending text to Gemini.
- **Privacy.** Your API key never leaves your browser except to Google's official Generative Language API. No analytics, no telemetry, no third-party servers.
- **Zero cost.** Gemini's API offers a generous free tier — enough for hundreds of exam questions a day at no cost.

## Core Mechanics & Architecture

### 1. Content Script Engine (content.js)

`content.js` is the single source of truth for the extension. It is injected at `document_idle` into every page and handles UI rendering, DOM text extraction, state management, post-processing, and direct communication with the Gemini API. The UI is built imperatively using vanilla DOM APIs and scoped under a `#qs-root` container to avoid CSS collisions with the host page.

### 2. Automatic Theme Detection

On injection, the script samples the computed background color of the document body and root element. It derives a luminance value using the standard perceptual formula (`0.299R + 0.587G + 0.114B`) to classify the page as light or dark, and applies the corresponding CSS class to `#qs-root`. A `MutationObserver` watches for dynamic theme changes via `class`, `data-theme`, and `data-bs-theme` attributes — so the UI stays camouflaged even on pages that toggle themes at runtime.

### 3. Selection-Aware Question Targeting

Before sending text to Gemini, the script checks `window.getSelection()`. If the user has highlighted a fragment longer than 20 characters, only that fragment becomes the target of the query, while the rest of the page is sent as `===PAGE_CONTEXT===` so the model can still see shared tables, definitions, and numerical data. Without a selection, the entire visible exercise on the current page is solved.

### 4. Automatic Exercise-Type Detection (TEST vs OPEN)

The model is instructed to classify the exercise before answering and prefix the response with either `TEST:` or `OPEN:`. The extension parses this header to choose the rendering path:

- `TEST:` → answer letters parsed (one per line) and displayed in a vertical stack of monospace pills next to the trigger button.
- `OPEN:` → full developed answer cached in memory and exposed via a circular SVG copy-to-clipboard button above the trigger. One click writes the full text to the system clipboard via `navigator.clipboard.writeText()`, with a `document.execCommand('copy')` fallback for restrictive contexts.

### 5. Gemini AI Bridge & Model Fallback Chain

The extension does not rely on a single model. On each query, it iterates through a priority-ordered list of Gemini models, falling back automatically on non-`2xx` responses or empty completions:

```
gemini-2.5-pro → gemini-2.5-flash → gemini-2.0-flash → gemini-2.5-flash-lite → gemini-2.0-flash-lite
```

Each request uses `temperature: 0` for determinism and `maxOutputTokens: 32000` to accommodate long open answers. For 2.5-flash variants, `thinkingConfig.thinkingBudget` is set to 1024 to allocate enough internal reasoning without consuming the entire output budget.

### 6. Anti-Prompt-Injection Sanitization

Before the page text reaches the model, `sanitizeInjections()` applies a battery of regular expressions to neutralize known prompt injection patterns embedded in exam pages — including role overrides, instruction-forgetting commands, system message spoofing, forced-answer directives, and bilingual sabotage attempts (Spanish + English). Matched fragments are replaced with the literal token `[FILTRADO]`.

### 7. Post-LLM Output Cleaner

A two-mode sanitizer (`cleanOpenAnswer`) processes Gemini's response before it reaches the clipboard:

- **Code blocks** (anything wrapped in markdown fences) → fences are stripped; the source code is preserved untouched.
- **Prose** → markdown is removed: asterisks for bold/italic, leading bullet markers, heading hashes, inline backticks, and excessive whitespace.

The result is a clean, paste-ready answer that looks like natural human writing.

### 8. Hide / Restore State Machine

The UI implements a three-state visibility system managed by an `isHidden` flag:

- **Visible:** main tick button, × dismiss button, copy button (if open answer cached) and answer letters all rendered.
- **Hidden:** all elements removed from view; a near-invisible ✓ persists at the bottom-right edge (opacity `0.25`, no background) as the sole restore trigger.
- **Restore:** `isHidden` is cleared; cached results re-render instantly without re-querying Gemini.

Answers are persisted in `cachedResult` (typed: `{type: 'test', answers: []}` or `{type: 'open', text: ''}`) for the lifetime of the page. Clicking the main tick while answers are displayed clears the cache and triggers a fresh query automatically.

### 9. Options Page & API Key Storage

The `options.html` / `options.js` pair provide a clean settings UI accessible via the extension's options entry point. The user pastes their Gemini API key into a password field; it is saved via `chrome.storage.sync.set()` and retrieved on each tick click via `chrome.storage.sync.get()`. The key never touches any server other than Google's Generative Language API.

## Repository Structure

```text
AI-test-solver/
├── content.js          # Content script: UI, text extraction, Gemini bridge, sanitizer, state machine
├── options.html        # Settings page — API key input UI
├── options.js          # API key read/write via chrome.storage.sync
├── background.js       # MV3 service worker (minimal)
├── manifest.json       # Extension manifest (Manifest V3, version 1.1)
├── PRIVACY.md          # Privacy policy (required by Chrome Web Store)
├── .gitignore
└── README.md
```

## Technologies

* **Runtime:** Vanilla JavaScript (ES6+), no bundler, no dependencies
* **Extension API:** Chrome Manifest V3, `chrome.storage.sync`, `navigator.clipboard`
* **AI Inference:** Google Gemini API (`generativelanguage.googleapis.com`)
* **Models:** gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash, gemini-2.5-flash-lite, gemini-2.0-flash-lite
* **Build Tool:** None — loaded directly as an unpacked extension

## Installation & Setup

### 1. Prerequisites

* Google Chrome (or any Chromium-based browser supporting Manifest V3)
* A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Load the extension

```
1. Clone or download this repository
2. Open Chrome → chrome://extensions
3. Enable Developer mode (top-right toggle)
4. Click "Load unpacked" and select the repository folder
```

### 3. Configure your API key

```
1. Click the extension icon in the toolbar → Options
   (or: chrome://extensions → AI Test Solver → Details → Extension options)
2. Paste your Gemini API key (starts with AIza...)
3. Click "Save API Key"
```

### 4. Usage during an exam

```
- Navigate to any page with a test, quiz, or open-ended exercise
- (Optional) Highlight a specific question or paragraph if you want to solve only that
- Click the faint ✓ button on the right edge of the screen
- For multiple-choice: answer letters (A, B, C…) appear above the button, one per question
- For open-ended: a small copy icon appears above the button — click it to copy the full answer to your clipboard, then paste into the exam's answer box
- Click × (just below the ✓) to hide the entire UI
- The near-invisible ✓ at the bottom-right restores it — cached answers reappear instantly without using API quota
- Clicking the main ✓ again clears the cache and recalculates
```

## Author

**Héctor Zamorano García**

## Notes

* This project was developed for personal and educational use to explore Chrome extension architecture, prompt engineering, and real-time AI integration in browser environments.
* The extension requires an active internet connection to reach the Gemini API.
* No data is collected, stored externally, or transmitted to any party other than Google's Generative Language API using the user's own key.
* The user is responsible for complying with the academic integrity policies of their institution.

## License

Standard MIT License.
