# Privacy Policy — GitHub Installer Chrome Extension

**Last updated: July 2026**
**Contact: apps@danimaster.com**

---

## Overview

GitHub Installer is a Chrome extension that detects GitHub repositories, PyPI packages, and npm packages in your browser and installs them into Visual Studio Code in one click. This policy explains exactly what the extension accesses, why, and what it does with that information.

**Short version: We collect nothing. All data stays on your device.**

---

## Single Purpose

GitHub Installer has one purpose: to allow developers to install any GitHub repository or supported package into Visual Studio Code with one click, by automatically detecting the correct install command from the project README.

---

## Permissions Explained

### `activeTab`

The extension accesses the active tab only when you explicitly click the extension icon or press a keyboard shortcut. This grants temporary access to the current page so the extension can read the URL and detect whether you are on a supported site (GitHub, PyPI, or npm). The permission expires immediately after each use. No page content is read — only the URL.

### `tabs`

The extension uses the `tabs` API to read the URL of the current browser tab inside the extension popup. This is required to detect the repository or package you are viewing and generate the correct install command. Tab URLs are processed locally and never transmitted to any external server. The `tabs` permission is also used to open VS Code via a URI when the local bridge server is unavailable.

### `storage`

The extension uses Chrome's local storage to save your configured project folder paths so you do not need to re-enter them each time you open the extension. This data is stored only on your device and is never transmitted anywhere.

### `clipboardWrite`

When the local bridge server is offline, the extension copies the detected install command to your clipboard so you can paste it into your terminal manually. This only occurs after you explicitly click the copy button or install button.

### Host Permissions

The extension requests access to the following specific URLs only:

| URL | Why |
|-----|-----|
| `https://github.com/*` | Detect repository info; inject floating install button on repo pages |
| `https://pypi.org/*` | Detect package info; inject floating install button on package pages |
| `https://www.npmjs.com/*` | Detect package info; inject floating install button on package pages |
| `http://localhost:9876/*` | Communicate with the local bridge server running on your own machine |

No broader host access (`<all_urls>`) is requested or used.

### Remote Code

The extension does not download, execute, or evaluate any remotely hosted JavaScript. There is no use of `eval()`, `new Function()`, or dynamically loaded remote scripts. All executable code is included in the extension package submitted to the Chrome Web Store. Communication with `localhost:9876` exchanges only plain JSON data (install commands and status responses) — never executable code.

---

## Data We Access

| Data | Purpose | Stored? | Sent to third parties? |
|------|---------|---------|------------------------|
| Current tab URL | Detect supported page | No | No |
| GitHub README content | Find the correct install command | No (cached in memory during session only) | No |
| Project folder paths | Remember your preferences | Yes — local device only | No |
| Install commands | Execute the install | No | No — sent only to localhost |

---

## GitHub API

When you open the extension on a GitHub page, the extension fetches the project's public README file from the GitHub API (`api.github.com`) to detect the correct install command. This is the same data publicly visible to anyone on GitHub. No authentication is used. No personal data is sent to GitHub — only the public repository path.

---

## Local Bridge Server

The `bridge/server.py` component is a small Python HTTP server that runs entirely on your own computer at `localhost:9876`. It:

- Receives install commands from the extension
- Opens VS Code using AppleScript (macOS only)
- Runs the install command inside VS Code's integrated terminal
- Never connects to the internet or any external server

---

## Data Sharing

We do not sell, share, trade, or transfer any user data to third parties. Ever.

The only external network request made by this extension is to `api.github.com` to fetch public README files. No user-identifying information is included in these requests.

---

## Data Retention

The extension stores only your configured project folder paths in Chrome local storage. You can clear this at any time by right-clicking the extension icon → **Manage extension** → **Clear storage**.

---

## Children's Privacy

This extension is a developer tool intended for software developers. It is not directed at children under 13.

---

## Changes to This Policy

If this policy changes, the updated version will be published at this URL and the "Last updated" date above will be revised.

---

## Contact

Questions or concerns about this privacy policy:

- **Email:** apps@danimaster.com
- **GitHub:** https://github.com/profitelai/github-installer-chrome/issues
