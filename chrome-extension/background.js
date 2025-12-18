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

function buildSidePanelPath(videoId) {
  return videoId ? `sidepanel.html?v=${encodeURIComponent(videoId)}` : 'sidepanel.html';
}

async function setSidePanelForTab(tabId, url) {
  try {
    const videoId = extractVideoId(url);
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: Boolean(videoId),
      path: buildSidePanelPath(videoId),
    });
  } catch {
    // Ignore; side panel API may be unavailable in older Chromium builds.
  }
}

async function openSidePanelForTab(tabId, url) {
  const videoId = extractVideoId(url);
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: Boolean(videoId),
      path: buildSidePanelPath(videoId),
    });

    if (videoId) {
      await chrome.sidePanel.open({ tabId });
    }
  } catch {
    // Ignore; side panel API may be unavailable in older Chromium builds.
  }
}

// Listen for tab updates to show/hide the extension icon
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (isValidYouTubeVideoUrl(tab.url)) {
      chrome.action.enable(tabId);
      setSidePanelForTab(tabId, tab.url);
    } else {
      chrome.action.disable(tabId);
      setSidePanelForTab(tabId, '');
    }
  }
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id || !tab.url) return;
  openSidePanelForTab(tab.id, tab.url);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== 'OPEN_SIDEPANEL') return;
  const tabId = sender?.tab?.id;
  const url = sender?.tab?.url;
  if (!tabId || !url) return;
  openSidePanelForTab(tabId, url);
});

// Initialize on install - disable by default
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
});
