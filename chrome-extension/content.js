// Extract video ID from YouTube URL
function extractVideoId(url) {
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
    return;
  }

  // Wait for the actions menu to be available
  const actionsMenu = document.querySelector('#top-level-buttons-computed');
  if (!actionsMenu) {
    console.log('[YT Summarizer] Actions menu not found, retrying...');
    return;
  }

  console.log('[YT Summarizer] Creating summarize button');

  // Create button container (matches YouTube's button structure)
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'yt-summarizer-btn';
  buttonContainer.className = 'yt-summarizer-container';
  
  // Set style directly to ensure proper display
  buttonContainer.style.display = 'inline-flex';
  buttonContainer.style.alignItems = 'center';

  // Create button with YouTube's style classes
  buttonContainer.innerHTML = `
    <button class="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m" 
            aria-label="Summarize this video"
            title="Summarize this video"
            style="display: inline-flex; align-items: center;">
      <div class="yt-spec-button-shape-next__button-text-content">
        <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        <span style="margin-left: 6px;">Summarize</span>
      </div>
    </button>
  `;

  // Add click handler
  const button = buttonContainer.querySelector('button');
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentUrl = window.location.href;
    const videoId = extractVideoId(currentUrl);
    
    console.log('[YT Summarizer] Button clicked, video ID:', videoId);
    
    if (videoId) {
      const targetUrl = `https://youtube-summarizer-ui-teron131.up.railway.app?v=${videoId}`;
      console.log('[YT Summarizer] Opening:', targetUrl);
      window.open(targetUrl, '_blank');
    }
  });

  // Insert before the first button (like button)
  actionsMenu.insertBefore(buttonContainer, actionsMenu.firstChild);
  console.log('[YT Summarizer] Button inserted successfully');
}

// Initialize and observe for YouTube's dynamic page updates
function init() {
  const videoId = extractVideoId(window.location.href);
  if (!videoId) {
    console.log('[YT Summarizer] Not a video page, skipping');
    return;
  }

  console.log('[YT Summarizer] Initializing on video page');

  // Initial injection with retry
  let retryCount = 0;
  const maxRetries = 10;
  const retryInterval = setInterval(() => {
    if (document.getElementById('yt-summarizer-btn')) {
      console.log('[YT Summarizer] Button already exists');
      clearInterval(retryInterval);
      return;
    }
    
    if (document.querySelector('#top-level-buttons-computed')) {
      createSummarizeButton();
      clearInterval(retryInterval);
    } else {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.log('[YT Summarizer] Max retries reached, giving up');
        clearInterval(retryInterval);
      }
    }
  }, 500);

  // YouTube is a SPA, so we need to observe navigation changes
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const videoId = extractVideoId(currentUrl);
      if (videoId) {
        console.log('[YT Summarizer] Navigation detected, recreating button');
        // Remove old button if it exists
        const oldButton = document.getElementById('yt-summarizer-btn');
        if (oldButton) {
          oldButton.remove();
        }
        // Wait a bit for YouTube to load the new page
        setTimeout(createSummarizeButton, 1000);
      }
    }
  });

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

