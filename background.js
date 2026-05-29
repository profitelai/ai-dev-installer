// Service worker — handles install triggers from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'INSTALL_REQUEST') {
    handleInstall(msg).then(sendResponse);
    return true; // keep message channel open for async
  }
});

async function handleInstall({ command, url, project, editor }) {
  const BRIDGE = 'http://localhost:9876';
  try {
    const r = await fetch(`${BRIDGE}/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, url, project, editor })
    });
    return await r.json();
  } catch {
    return { ok: false, error: 'Bridge offline' };
  }
}

// Open popup on browser action click (also handles keyboard shortcuts)
chrome.action.onClicked.addListener(() => {
  // Popup is defined in manifest — this only fires if popup is not set
});
