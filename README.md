# GitHub Installer for Chrome

**Install any GitHub repository into VS Code in one click.**

Browse GitHub, find a project you want, click the extension — it reads the README, detects the correct install command, opens VS Code, and runs it in the integrated terminal. No copy-pasting. No switching windows. No guessing.

---

## The Problem It Solves

Every GitHub project installs differently:

```bash
brew install --cask some-tool        # some projects
pip3 install git+https://github.com/...  # Python projects
npm install -g some-package          # Node projects
cargo install some-crate             # Rust projects
```

Normally you open the README, find the install section, copy the command, open VS Code, open a terminal, paste it. That's 6 steps every time.

**This extension makes it one click.**

---

## Demo

1. You're on `github.com/anything`
2. Click the ⚡ icon in Chrome
3. The extension fetches the README and finds the real install command
4. You see it with a green **"from README"** badge — not a guess
5. Click **⚡ Install** — VS Code opens, a terminal appears, the command runs

---

## Smart Install Detection

The extension reads the project README and scans for install commands in priority order:

| Priority | Manager | Example |
|----------|---------|---------|
| 1 | Homebrew | `brew install --cask myapp` |
| 2 | pipx | `pipx install mytool` |
| 3 | pip | `pip3 install mypackage` |
| 4 | npm | `npm install -g mypackage` |
| 5 | yarn | `yarn global add mypackage` |
| 6 | cargo | `cargo install mycrate` |
| 7 | go | `go install github.com/...` |
| 8 | gem | `gem install mygem` |
| 9 | curl | `curl ... \| bash` |
| 10 | apt | `sudo apt install mypkg` |

If multiple methods are found, you get a dropdown to pick. Falls back to `pip3 install git+<url>` only when the README has no install instructions.

---

## Setup

### Requirements

- macOS
- Python 3.8+
- VS Code installed
- Chrome

### 1 — Load the extension in Chrome

```
chrome://extensions → Developer mode ON → Load unpacked → select this folder
```

Pin the ⚡ icon to your toolbar.

### 2 — Start the bridge server

```bash
python3 bridge/server.py
```

Keep it running. You'll see:

```
AI Dev Installer bridge — http://localhost:9876
  pip:    pip3
  vscode: /Applications/Visual Studio Code.app/...
```

### 3 — Grant Accessibility permission (one-time)

The bridge uses AppleScript to open VS Code's integrated terminal.

**System Settings → Privacy & Security → Accessibility → enable your Terminal app**

You'll be prompted automatically the first time you install something.

---

## Using It

Open any of these pages in Chrome and click the ⚡ icon:

- **GitHub repo** — `github.com/owner/repo` — reads the README
- **PyPI package** — `pypi.org/project/name` — uses pip3
- **npm package** — `npmjs.com/package/name` — uses npm

**Keyboard shortcuts:**
- `⌘⇧V` — Install → VS Code
- `⌘⇧C` — Copy install command to clipboard

---

## How It Works

```
Chrome Extension          Bridge Server (localhost:9876)       Your Machine
─────────────────         ──────────────────────────────       ────────────
You click Install    →    /smart-detect                  →    GitHub API
                     ←    Returns real install command   ←    (README parsed)
                     →    /install                       →    AppleScript
                                                         →    VS Code opens
                                                         →    Terminal opens
                                                         →    Command runs ✓
```

The bridge is a small Python HTTP server that runs locally. The Chrome extension never sends your data anywhere — it talks only to `localhost:9876` and the GitHub API (to read public READMEs).

---

## Files

```
github-installer-chrome/
├── manifest.json        Chrome extension manifest (v3)
├── popup.html           Extension popup UI
├── popup.js             Detection logic + install flow
├── content.js           Floating ⚡ button on GitHub pages
├── background.js        Service worker (keyboard shortcuts)
├── icons/               Extension icons
└── bridge/
    ├── server.py        Local HTTP server — smart detect + VS Code control
    └── start.sh         Convenience start script
```

---

## Version History

| Version | What changed |
|---------|-------------|
| 1.2.0 | Smart README detection. Installs run inside VS Code integrated terminal. |
| 1.1.0 | One-click install, keyboard shortcuts, better editor detection |
| 1.0.0 | Initial release |

---

## License

MIT
