# AI Dev Installer — Chrome Extension

## Quick setup (3 steps)

### Step 1 — Load the extension in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder:
   ```
   /Users/danimaster/Desktop/ai-dev-installer
   ```
5. The ⚡ icon appears in your toolbar

### Step 2 — Start the bridge server

The bridge runs on port 9876 and handles install commands, README detection, and opening VS Code.

```bash
python3 /Users/danimaster/Desktop/ai-dev-installer/bridge/server.py
```

Keep this terminal open. You'll see:
```
AI Dev Installer bridge — http://localhost:9876
  pip:    pip3
  vscode: /Applications/Visual Studio Code.app/...
```

### Step 3 — Use it

1. Go to any GitHub repo, PyPI package, or npm package page
2. Click the ⚡ icon in the Chrome toolbar
3. The extension reads the README and auto-detects the real install command
   - Shows `brew install`, `pip3 install`, `npm install`, `cargo install`, etc. — whatever the project actually uses
   - Green **"from README"** badge confirms it was detected, not guessed
4. Pick a target project folder (optional) or leave blank to install globally
5. Click **⚡ Install & Open VS Code** — a Terminal window opens showing the live install

### How smart detection works

- Fetches the GitHub README via the GitHub API
- Searches code blocks for install commands in priority order:
  `brew` → `pipx` → `pip` → `npm` → `yarn` → `cargo` → `go` → `gem` → `curl` → `apt`
- If multiple methods are found, shows a dropdown to pick one
- Falls back to `pip3 install git+<url>` only when nothing is found

### Pinning the extension

Right-click the ⚡ icon → **Pin** so it's always visible.
