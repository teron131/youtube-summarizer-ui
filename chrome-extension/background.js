// Configuration
const SUMMARIZER_URL = 'https://youtube-summarizer-ui-teron131.up.railway.app';

// Extract video ID from YouTube URL
function extractVideoId(url) {
  if (!url) return null;
  
  // Pattern for youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Pattern for youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return shortMatch[1];
  
  return null;
}

// Validate if URL is a YouTube video page (not Shorts, Home, etc)
function isValidYouTubeVideoUrl(url) {
  return extractVideoId(url) !== null;
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
  if (!tab.url) return;
  
  const videoId = extractVideoId(tab.url);
  if (videoId) {
    const targetUrl = `${SUMMARIZER_URL}?v=${videoId}`;
    chrome.tabs.create({ url: targetUrl });
  }
});

// Initialize on install - disable by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
});

