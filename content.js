// Injected on GitHub / PyPI / npm pages
// Adds an "⚡ Install with AI" floating button

(function () {
  if (document.getElementById('ai-installer-btn')) return; // already injected

  const btn = document.createElement('button');
  btn.id = 'ai-installer-btn';
  btn.innerHTML = '⚡ Install with AI';
  btn.title = 'Send to VS Code / Cursor for AI-assisted install';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    // Just open the popup (extension action)
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    // Show quick feedback
    btn.innerHTML = '✓ Opening…';
    btn.style.background = '#238636';
    setTimeout(() => {
      btn.innerHTML = '⚡ Install with AI';
      btn.style.background = '';
    }, 2000);
  });
})();
