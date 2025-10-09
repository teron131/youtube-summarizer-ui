// Configuration
const SUMMARIZER_URL = 'https://youtube-summarizer-ui-teron131.up.railway.app';
const DEBUG = false; // Set to true for console logs

// Utility: Conditional logging
const log = (...args) => DEBUG && console.log('[YT Summarizer]', ...args);

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

// Create and inject the Summarize button
function createSummarizeButton() {
  // Check if button already exists
  if (document.getElementById('yt-summarizer-btn')) {
    return false;
  }

  // Wait for the subscribe button container to be available
  const subscribeRenderer = document.querySelector('#owner ytd-subscribe-button-renderer');
  if (!subscribeRenderer) {
    log('Subscribe button not found');
    return false;
  }

  // Find the proper container for insertion
  const subscribeWrapper = subscribeRenderer.closest('#subscribe-button') || subscribeRenderer.parentElement;
  const bottomRow = subscribeWrapper?.parentElement;

  if (!bottomRow) {
    log('Bottom row container not found');
    return false;
  }

  log('Creating summarize button');

  // Create button container (matches YouTube's button structure)
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'yt-summarizer-btn';
  buttonContainer.className = 'yt-summarizer-container style-scope ytd-video-owner-renderer';

  // Create button with YouTube's style classes
  buttonContainer.innerHTML = `
    <button class="yt-spec-button-shape-next yt-spec-button-shape-next--filled yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m" 
            aria-label="Summarize this video"
            title="Summarize this video">
      <div class="yt-spec-button-shape-next__button-text-content">
        <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        <span>Summarize</span>
      </div>
    </button>
  `;

  // Add click handler
  const button = buttonContainer.querySelector('button');
  button?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const videoId = extractVideoId(window.location.href);
    log('Button clicked, video ID:', videoId);
    
    if (videoId) {
      const targetUrl = `${SUMMARIZER_URL}?v=${videoId}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  });

  // Insert after the subscribe button wrapper
  bottomRow.insertBefore(buttonContainer, subscribeWrapper.nextSibling);
  log('Button inserted successfully');
  return true;
}

// Initialize and observe for YouTube's dynamic page updates
function init() {
  const videoId = extractVideoId(window.location.href);
  if (!videoId) {
    log('Not a video page, skipping');
    return;
  }

  log('Initializing on video page');

  // Initial injection with retry mechanism
  let retryCount = 0;
  const MAX_RETRIES = 10;
  const RETRY_INTERVAL = 500;
  
  const retryInterval = setInterval(() => {
    // Stop if button exists
    if (document.getElementById('yt-summarizer-btn')) {
      clearInterval(retryInterval);
      return;
    }
    
    // Try to create button
    if (createSummarizeButton()) {
      clearInterval(retryInterval);
      return;
    }
    
    // Give up after max retries
    retryCount++;
    if (retryCount >= MAX_RETRIES) {
      log('Max retries reached, giving up');
      clearInterval(retryInterval);
    }
  }, RETRY_INTERVAL);

  // YouTube is a SPA, observe navigation changes
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    
    // Detect URL change
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const newVideoId = extractVideoId(currentUrl);
      
      if (newVideoId) {
        log('Navigation detected, recreating button');
        
        // Remove old button
        const oldButton = document.getElementById('yt-summarizer-btn');
        oldButton?.remove();
        
        // Wait for YouTube to render new page, then inject button
        setTimeout(createSummarizeButton, 1000);
      }
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

