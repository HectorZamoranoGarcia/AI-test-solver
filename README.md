# AI Test Solver

A minimal Chrome extension that solves multiple-choice tests on any webpage using Google Gemini AI. Bring your own free API key — nothing is stored on any server.

## How it works

A small, discreet button appears on the right side of every page. Click it and the extension reads the visible text, sends it to Gemini, and displays the answer letters (A, B, C…) for each question it finds — all in under a second.

## Features

- Works on any website
- Uses Gemini models in order from best to fastest fallback: `gemini-2.5-pro` → `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash` → `gemini-2.0-flash-lite`
- Auto-detects light/dark page theme
- **Hide / restore UI** — press × to make everything invisible; a faint ✓ at the bottom right brings it back
- Cached answers restore instantly without re-querying Gemini
- Clicking the tick again clears and recalculates
- Anti-prompt-injection filtering on page text
- Your API key is stored locally in Chrome — never leaves your browser except to call Google's API directly

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the repository folder
5. Click the extension icon → **Options**, paste your Gemini API key and save

## Getting a free Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API key**
4. Copy and paste it into the extension's Options page

The free tier is generous enough for casual use.

## Usage

- Navigate to any page with a multiple-choice test
- Click the small **✓** button on the right edge of the screen
- Answer letters appear above the button, numbered by question order
- Click **×** (just below the ✓) to hide the UI completely
- A faint **✓** at the bottom right restores everything — cached answers reappear instantly
- Clicking the main **✓** again when answers are shown clears them and recalculates

## Privacy

- No account, no backend, no tracking
- Your API key is saved in `chrome.storage.sync` (local to your browser)
- Page text is sent directly to Google's Gemini API and nowhere else

## License

MIT
