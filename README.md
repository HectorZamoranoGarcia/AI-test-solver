# AI Test Solver (Gemini-Powered Chrome Extension)

**Discreet Chrome extension written in vanilla JavaScript that uses Google Gemini AI to solve multiple-choice tests on any webpage in real time.**

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Pro-8E75B2?style=for-the-badge&logo=google&logoColor=white)

## Description

AI Test Solver is a zero-footprint Chrome extension that injects a minimal, camouflaged UI onto any webpage. Upon interaction, it extracts the visible text, strips anti-AI sabotage patterns, and dispatches the sanitized content to Google Gemini via direct API call — returning only the correct answer letters for every multiple-choice question found on the page.

The architecture is entirely self-contained inside a single content script with no external dependencies, no backend, and no data collection. The user supplies their own Gemini API key, which is stored exclusively in `chrome.storage.sync`.

## Core Mechanics & Architecture

### 1. Content Script Engine (content.js)

The `content.js` file is the single source of truth for the entire extension. It is injected at `document_idle` into every page and handles UI rendering, DOM text extraction, state management, and direct communication with the Gemini API. The UI is built imperatively using vanilla DOM APIs and scoped under a `#qs-root` container to avoid CSS collisions with host pages.

### 2. Automatic Theme Detection

On injection, the script samples the computed background color of the document body and root element. It derives a luminance value using the standard perceptual formula (`0.299R + 0.587G + 0.114B`) to classify the page as light or dark, and applies the corresponding CSS class to `#qs-root`. A `MutationObserver` watches for dynamic theme changes via `class`, `data-theme`, and `data-bs-theme` attributes.

### 3. Gemini AI Bridge & Model Fallback Chain

The extension does not rely on a single model. On each query, it iterates through a priority-ordered list of Gemini models, falling back automatically on non-`2xx` responses:

```
gemini-2.5-pro → gemini-2.5-flash → gemini-2.5-flash-lite → gemini-2.0-flash → gemini-2.0-flash-lite
```

Each request uses `temperature: 0` and enforces a structured prompt that sandboxes the page content between `===INICIO_DATOS===` / `===FIN_DATOS===` markers, instructing the model to treat everything inside as untrusted data.

### 4. Anti-Prompt-Injection Sanitization

Before the page text reaches the model, `sanitizeInjections()` applies a battery of regular expressions to neutralize known prompt injection patterns embedded in exam pages — including role overrides, instruction forgetting commands, system message spoofing, and forced-answer directives. Matched fragments are replaced with the literal token `[FILTRADO]`.

### 5. Hide / Restore State Machine

The UI implements a three-state visibility system managed by an `isHidden` flag:

- **Visible:** main tick button, × dismiss button, and answer letters all rendered.
- **Hidden:** all elements removed from view; a near-invisible ✓ persists at the bottom-right edge (opacity `0.25`, no background) as the sole restore trigger.
- **Restore:** `isHidden` is cleared; cached answers re-render instantly without re-querying Gemini.

Answers are persisted in `cachedAnswers[]` for the lifetime of the page. Clicking the main tick while answers are displayed clears the cache and triggers a fresh query automatically.

### 6. Options Page & API Key Storage

The `options.html` / `options.js` pair provide a clean settings UI accessible via the extension's options entry point. The user pastes their Gemini API key into a password field; it is saved via `chrome.storage.sync.set()` and retrieved on each tick click via `chrome.storage.sync.get()`. The key never touches any server other than Google's Generative Language API.

## Repository Structure

```text
AI-test-solver/
├── content.js          # Content script: UI, text extraction, Gemini bridge, state machine
├── options.html        # Settings page — API key input UI
├── options.js          # API key read/write via chrome.storage.sync
├── background.js       # MV3 service worker (minimal)
├── manifest.json       # Extension manifest (Manifest V3)
├── .gitignore
└── README.md
```

## Technologies

* **Runtime:** Vanilla JavaScript (ES6+), no bundler, no dependencies
* **Extension API:** Chrome Manifest V3, `chrome.storage.sync`
* **AI Inference:** Google Gemini API (`generativelanguage.googleapis.com`)
* **Models:** gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash, gemini-2.0-flash-lite
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

### 4. Usage

```
- Navigate to any page with a multiple-choice test
- Click the faint ✓ button on the right edge of the screen
- Answer letters (A, B, C…) appear above the button, one per question
- Click × (just below the ✓) to hide the entire UI
- The near-invisible ✓ at the bottom-right restores it — cached answers reappear instantly
- Clicking the main ✓ again clears the cache and recalculates
```

## Author

**Héctor Zamorano García**

## Notes

* This project was developed for personal and educational use to explore Chrome extension architecture, prompt engineering, and real-time AI integration in browser environments.
* The extension requires an active internet connection to reach the Gemini API.
* No data is collected, stored externally, or transmitted to any party other than Google's Generative Language API using the user's own key.

## License

Standard MIT License.
