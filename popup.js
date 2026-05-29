const BRIDGE = 'http://localhost:9876';

// ── Package detection from URL ──────────────────────────────────────────────

function detectPackage(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const parts = u.pathname.split('/').filter(Boolean);

    if (host === 'github.com' && parts.length >= 2) {
      const repo = `${parts[0]}/${parts[1]}`;
      const pkgName = parts[1];
      return {
        type: 'github', badge: 'badge-github',
        name: repo,
        cmd: `pip install git+${url.split('?')[0]}`,
        aiPrompt: `Install the GitHub repo ${url} into my project. Figure out if it's pip, npm, or cargo and run the right install command. Then open the README and summarize what it does.`,
        url
      };
    }
    if (host === 'pypi.org' && parts[0] === 'project' && parts[1]) {
      return {
        type: 'pip', badge: 'badge-pip',
        name: parts[1],
        cmd: `pip install ${parts[1]}`,
        aiPrompt: `Run: pip install ${parts[1]}\nThen check requirements.txt and add it there. Show me a quick usage example.`,
        url
      };
    }
    if ((host === 'npmjs.com' || host === 'www.npmjs.com') && parts[0] === 'package' && parts[1]) {
      return {
        type: 'npm', badge: 'badge-npm',
        name: parts[1],
        cmd: `npm install ${parts[1]}`,
        aiPrompt: `Run: npm install ${parts[1]}\nAdd it to package.json and show a quick usage snippet.`,
        url
      };
    }
    // Generic URL — try to guess package name from last path segment
    const last = parts[parts.length - 1] || host;
    return {
      type: 'url', badge: 'badge-url',
      name: last,
      cmd: `# ${url}`,
      aiPrompt: `Open this URL and help me install it: ${url}`,
      url
    };
  } catch {
    return { type: 'url', badge: 'badge-url', name: 'Unknown', cmd: '# no URL detected', aiPrompt: '', url };
  }
}

// ── Bridge status ────────────────────────────────────────────────────────────

async function checkBridge() {
  try {
    const r = await fetch(`${BRIDGE}/status`, { signal: AbortSignal.timeout(2000) });
    const data = await r.json();
    return data;
  } catch {
    return null;
  }
}

function setBridgeStatus(ok) {
  const dot   = document.getElementById('bridge-dot');
  const label = document.getElementById('bridge-label');
  if (ok === null) {
    dot.style.background = '#f85149';
    label.textContent = 'Bridge offline — clipboard fallback active';
  } else {
    dot.style.background = '#3fb950';
    label.textContent = `Bridge online · editor: ${ok.editor || 'auto'}`;
  }
}

// ── Editor preference ────────────────────────────────────────────────────────

let preferredEditor = 'cursor';

function setEditor(ed) {
  preferredEditor = ed;
  document.getElementById('btn-vscode').classList.toggle('active', ed === 'vscode');
  document.getElementById('btn-cursor').classList.toggle('active', ed === 'cursor');
  chrome.storage.local.set({ preferredEditor: ed });
}

// ── Status bar helper ────────────────────────────────────────────────────────

function status(msg, timeout = 0) {
  document.getElementById('status-text').textContent = msg;
  if (timeout) setTimeout(() => status('Ready'), timeout);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved editor preference
  const stored = await chrome.storage.local.get(['preferredEditor', 'projects']);
  if (stored.preferredEditor) setEditor(stored.preferredEditor);
  else setEditor('cursor');

  // Populate projects from storage
  const projects = stored.projects || [];
  const sel = document.getElementById('project-select');
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.path; opt.textContent = p.name;
    sel.insertBefore(opt, sel.querySelector('[value="custom"]'));
  });

  // Check bridge
  const bridge = await checkBridge();
  setBridgeStatus(bridge);

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pkg = detectPackage(tab?.url || '');

  // Update UI
  document.getElementById('pkg-badge').className = `pkg-type-badge ${pkg.badge}`;
  document.getElementById('pkg-badge').textContent = pkg.type;
  document.getElementById('pkg-name').textContent = pkg.name;
  document.getElementById('install-cmd').textContent = pkg.cmd;

  // Copy command button
  document.getElementById('copy-cmd').addEventListener('click', async () => {
    await copyToClipboard(pkg.cmd);
    document.getElementById('copy-cmd').textContent = '✓';
    setTimeout(() => { document.getElementById('copy-cmd').textContent = '⎘'; }, 1500);
  });

  // Editor buttons
  document.getElementById('btn-vscode').addEventListener('click', () => setEditor('vscode'));
  document.getElementById('btn-cursor').addEventListener('click', () => setEditor('cursor'));

  // Project select — handle "Add project"
  sel.addEventListener('change', async () => {
    if (sel.value === 'custom') {
      const path = prompt('Enter full project path:');
      const name = prompt('Project display name:');
      if (path && name) {
        const existing = (await chrome.storage.local.get('projects')).projects || [];
        existing.push({ path, name });
        await chrome.storage.local.set({ projects: existing });
        const opt = document.createElement('option');
        opt.value = path; opt.textContent = name;
        sel.insertBefore(opt, sel.querySelector('[value="custom"]'));
        sel.value = path;
      } else {
        sel.value = '';
      }
    }
  });

  // ── Install button ──────────────────────────────────────────────────────
  document.getElementById('btn-install').addEventListener('click', async () => {
    const project = sel.value;
    if (!project) { status('⚠️ Select a target project first', 3000); return; }

    status('📦 Sending to bridge server…');

    try {
      const r = await fetch(`${BRIDGE}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: pkg.cmd, project, url: pkg.url }),
        signal: AbortSignal.timeout(5000)
      });
      const data = await r.json();
      if (data.ok) {
        status(`✅ Running: ${pkg.cmd}`, 4000);
      } else {
        throw new Error(data.error);
      }
    } catch {
      // Fallback: copy to clipboard
      await copyToClipboard(pkg.cmd);
      status('📋 Copied! Paste in terminal (bridge offline)', 4000);
    }
  });

  // ── Install with AI ─────────────────────────────────────────────────────
  document.getElementById('btn-install-ai').addEventListener('click', async () => {
    const project = sel.value;

    try {
      const r = await fetch(`${BRIDGE}/install-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: pkg.cmd,
          prompt: pkg.aiPrompt,
          url: pkg.url,
          project,
          editor: preferredEditor
        }),
        signal: AbortSignal.timeout(5000)
      });
      const data = await r.json();
      if (data.ok) {
        status(`🤖 Opened in ${preferredEditor} with AI prompt!`, 4000);
      } else throw new Error(data.error);
    } catch {
      // Fallback: copy AI prompt + open editor via URI
      await copyToClipboard(pkg.aiPrompt);
      const uri = preferredEditor === 'cursor'
        ? (project ? `cursor://file/${encodeURIComponent(project)}` : 'cursor://')
        : (project ? `vscode://file/${encodeURIComponent(project)}` : 'vscode://');
      chrome.tabs.create({ url: uri });
      status('📋 AI prompt copied — paste it in the editor chat', 5000);
    }
  });

  // ── Copy AI prompt ──────────────────────────────────────────────────────
  document.getElementById('btn-copy-prompt').addEventListener('click', async () => {
    await copyToClipboard(pkg.aiPrompt);
    status('📋 AI prompt copied to clipboard!', 3000);
  });

  // Settings link
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
