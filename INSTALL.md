# AI Dev Installer — Chrome Extension

## Quick setup (3 steps)

### Step 1 — Load the extension in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder:
   ```
   /Users/danimaster/Downloads/ai-avatar-projects/chrome-extension
   ```
5. The ⚡ icon appears in your toolbar

### Step 2 — Start the bridge server

The bridge lets the extension run install commands and open your editor.

```bash
bash /Users/danimaster/Downloads/ai-avatar-projects/chrome-extension/bridge/start.sh
```

Keep this terminal open. You'll see:
```
AI Dev Installer bridge — listening on http://localhost:9876
  cursor: /usr/local/bin/cursor   (or path)
  vscode: /usr/local/bin/code     (or path)
```

### Step 3 — Use it

1. Go to any GitHub repo, e.g. https://github.com/serengil/deepface
2. Click the ⚡ button in the toolbar (or the floating button on the page)
3. Select a **target project** from the dropdown
4. Click one of:
   - **📦 Install package** — runs `pip install …` in your project
   - **🤖 Install with AI** — opens Cursor/VS Code + copies an AI prompt
   - **📋 Copy AI prompt** — copies the prompt to clipboard

### Pinning the extension

Right-click the ⚡ icon → **Pin** so it's always visible.
