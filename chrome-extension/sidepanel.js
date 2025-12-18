const APP_ENTRY_PATH = 'app/index.html';

function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('v');
}

function buildAppUrl(videoId) {
  const baseUrl = chrome.runtime.getURL(APP_ENTRY_PATH);
  return videoId ? `${baseUrl}?v=${encodeURIComponent(videoId)}` : baseUrl;
}

const iframe = document.getElementById('app');
const openTabButton = document.getElementById('openTab');
const reloadButton = document.getElementById('reload');
const title = document.getElementById('title');
const hint = document.getElementById('hint');

const videoId = getVideoId();
const appUrl = buildAppUrl(videoId);

if (videoId) {
  title.textContent = `Summarizer • ${videoId}`;
}

iframe.src = appUrl;

openTabButton.addEventListener('click', () => {
  chrome.tabs.create({ url: appUrl });
});

reloadButton.addEventListener('click', () => {
  iframe.src = appUrl;
});

// If framing is blocked, the iframe will generally fail to load.
window.setTimeout(() => {
  try {
    const sameOriginAccessible = iframe.contentWindow && iframe.contentDocument;
    if (sameOriginAccessible) return;
  } catch {
    // Cross-origin is expected; still show the hint as a fallback.
  }
  hint.classList.remove('hidden');
}, 1500);
