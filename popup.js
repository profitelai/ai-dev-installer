const BRIDGE = 'http://localhost:9876';

// ── Package detection ────────────────────────────────────────────────────────
function detect(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    const p = u.pathname.split('/').filter(Boolean);

    if (h === 'github.com' && p.length >= 2) {
      const repo = `${p[0]}/${p[1]}`;
      const clean = url.split('?')[0].split('#')[0];
      return {
        type:'github', badge:'bg', badgeText:'GitHub',
        name: repo,
        cmd: `pip install git+${clean}`,
        aiPrompt:`Install ${clean} — detect pip/npm/cargo and run the right command. Add to requirements/package.json. Show a usage example.`,
        url
      };
    }
    if (h === 'pypi.org' && p[0] === 'project' && p[1]) {
      return {
        type:'pip', badge:'bp', badgeText:'pip',
        name: p[1],
        cmd: `pip install ${p[1]}`,
        aiPrompt:`pip install ${p[1]} — add to requirements.txt and show a quick usage snippet.`,
        url
      };
    }
    if ((h === 'npmjs.com'||h==='www.npmjs.com') && p[0]==='package' && p[1]) {
      return {
        type:'npm', badge:'bn', badgeText:'npm',
        name: p[1],
        cmd: `npm install ${p[1]}`,
        aiPrompt:`npm install ${p[1]} — add to package.json and show usage.`,
        url
      };
    }
    return {
      type:'url', badge:'bu', badgeText:'URL',
      name: h, cmd:`# ${url}`,
      aiPrompt:`Help me use: ${url}`, url
    };
  } catch {
    return {type:'url',badge:'bu',badgeText:'URL',name:'—',cmd:'—',aiPrompt:'',url:''};
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function setStatus(ico, txt) {
  document.getElementById('status-ico').textContent = ico;
  document.getElementById('status-txt').textContent = txt;
}
function setBridge(ok) {
  const dot = document.getElementById('bdot');
  const lbl = document.getElementById('blbl');
  if (ok) { dot.className='dot g'; lbl.textContent='Bridge online — VS Code ready'; }
  else     { dot.className='dot r'; lbl.textContent='Bridge offline — clipboard fallback'; }
}
async function clip(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

// ── Bridge calls ─────────────────────────────────────────────────────────────
async function bridgeInstall(cmd, project) {
  const r = await fetch(`${BRIDGE}/install`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({command:cmd, project}),
    signal: AbortSignal.timeout(4000)
  });
  return r.json();
}
async function bridgeOpenVSCode(project) {
  const r = await fetch(`${BRIDGE}/open-editor`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({editor:'vscode', project}),
    signal: AbortSignal.timeout(4000)
  });
  return r.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Get current tab URL
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const pkg = detect(tab?.url || '');

  // 2. Populate UI
  const badgeEl = document.getElementById('pkg-badge');
  badgeEl.className = `badge ${pkg.badge}`;
  badgeEl.textContent = pkg.badgeText;
  document.getElementById('pkg-name').textContent  = pkg.name;
  document.getElementById('cmd-text').textContent  = pkg.cmd;

  // 3. Check bridge
  let bridgeOk = false;
  try {
    const s = await fetch(`${BRIDGE}/status`,{signal:AbortSignal.timeout(1500)});
    bridgeOk = s.ok;
  } catch {}
  setBridge(bridgeOk);

  // 4. Load saved projects
  const { projects=[], lastProject='' } = await chrome.storage.local.get(['projects','lastProject']);
  const sel = document.getElementById('proj-sel');
  projects.forEach(p => {
    const o = document.createElement('option');
    o.value=p.path; o.textContent=p.name;
    sel.insertBefore(o, sel.querySelector('[value="__add__"]'));
  });
  if (lastProject) sel.value = lastProject;

  sel.addEventListener('change', async () => {
    if (sel.value === '__add__') {
      const path = prompt('Full project path:');
      const name = prompt('Display name:');
      if (path && name) {
        const all = (await chrome.storage.local.get('projects')).projects || [];
        all.push({path,name});
        await chrome.storage.local.set({projects:all});
        const o=document.createElement('option');
        o.value=path;o.textContent=name;
        sel.insertBefore(o,sel.querySelector('[value="__add__"]'));
        sel.value=path;
      } else sel.value='';
    }
    if (sel.value) chrome.storage.local.set({lastProject:sel.value});
  });

  // ── Copy command ──────────────────────────────────────────────────────────
  document.getElementById('copy-cmd').addEventListener('click', async () => {
    await clip(pkg.cmd);
    document.getElementById('copy-cmd').textContent='✓';
    setTimeout(()=>{document.getElementById('copy-cmd').textContent='⎘';},1500);
  });

  // ── ONE-CLICK: Install + Open VS Code ─────────────────────────────────────
  document.getElementById('btn-one-click').addEventListener('click', async () => {
    const project = sel.value;
    const btn = document.getElementById('btn-one-click');
    btn.textContent='⏳ Working…';
    btn.disabled=true;

    if (bridgeOk && pkg.cmd !== '—') {
      // Step 1: run install via bridge
      try {
        setStatus('🔧','Installing…');
        if (!pkg.cmd.startsWith('#')) await bridgeInstall(pkg.cmd, project);
        setStatus('📂','Opening VS Code…');
        await bridgeOpenVSCode(project);
        setStatus('✅',`Done — ${pkg.name} installing in VS Code`);
        btn.textContent='✅ Done!';
        btn.style.background='#238636';
      } catch(e) {
        setStatus('⚠️','Bridge error — using fallback');
        await clip(pkg.cmd);
        chrome.tabs.create({url:`vscode://file/${encodeURIComponent(project||'')}`});
        setStatus('📋','Command copied — paste in VS Code terminal');
        btn.textContent='📋 Copied!';
      }
    } else {
      // Fallback: clipboard + URI
      await clip(pkg.cmd);
      const uri = project ? `vscode://file/${encodeURIComponent(project)}` : 'vscode://';
      chrome.tabs.create({url: uri});
      setStatus('📋','Copied command — paste in VS Code terminal');
      btn.textContent='📋 Copied!';
    }

    setTimeout(()=>{
      btn.textContent='⚡ Install & Open VS Code';
      btn.disabled=false;
      btn.style.background='';
    },3000);
  });

  // ── Just open VS Code ─────────────────────────────────────────────────────
  document.getElementById('btn-vscode-only').addEventListener('click', async () => {
    const project = sel.value;
    setStatus('📂','Opening VS Code…');
    if (bridgeOk) {
      try { await bridgeOpenVSCode(project); setStatus('✅','VS Code opened!'); return; }
      catch {}
    }
    const uri = project ? `vscode://file/${encodeURIComponent(project)}` : 'vscode://';
    chrome.tabs.create({url: uri});
    setStatus('✅','VS Code opened via URI');
  });

  // ── Copy all ──────────────────────────────────────────────────────────────
  document.getElementById('btn-copy-all').addEventListener('click', async () => {
    const full = `${pkg.cmd}\n\n# AI prompt:\n# ${pkg.aiPrompt}`;
    await clip(full);
    setStatus('📋','Install command + AI prompt copied!');
    setTimeout(()=>setStatus('🟡','Ready'),3000);
  });

  setStatus('🟡','Ready');
});
