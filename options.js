const input = document.getElementById('apiKey');
const status = document.getElementById('status');

chrome.storage.sync.get('geminiKey').then(({ geminiKey }) => {
  if (geminiKey) input.value = geminiKey;
});

document.getElementById('save').addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) {
    show('Please enter a valid API key.', false);
    return;
  }
  chrome.storage.sync.set({ geminiKey: key }).then(() => {
    show('Saved!', true);
  });
});

function show(msg, ok) {
  status.textContent = msg;
  status.className = ok ? 'ok' : 'err';
  if (ok) setTimeout(() => { status.textContent = ''; }, 3000);
}
