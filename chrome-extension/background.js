// Validate if URL is a YouTube video page (not Shorts, Home, etc)
// Matches backend utils.py:is_youtube_url() patterns
function isValidYouTubeVideoUrl(url) {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
}

// Listen for tab updates to show/hide the extension icon
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (isValidYouTubeVideoUrl(tab.url)) {
      chrome.action.enable(tabId);
    } else {
      chrome.action.disable(tabId);
    }
  }
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && isValidYouTubeVideoUrl(tab.url)) {
    const targetUrl = `https://youtube-summarizer-ui-teron131.up.railway.app/?url=${encodeURIComponent(tab.url)}`;
    chrome.tabs.create({ url: targetUrl });
  }
});

// Initialize on install - disable by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
});

