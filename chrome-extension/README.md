# YouTube Summarizer Chrome Extension

Extension to send YouTube videos to your summarizer app with **two ways to use it**:
1. **Toolbar button** - Click extension icon in Chrome toolbar
2. **YouTube UI button** - "Summarize" button directly on YouTube video pages

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension/` directory
5. The extension will be active on YouTube pages

## Features

### 🎯 Two Ways to Summarize

#### Option 1: Toolbar Button (Page Action)
1. Navigate to a YouTube video
2. Extension icon in toolbar becomes enabled (colored)
3. Click the toolbar icon
4. New tab opens with the summarizer app

#### Option 2: YouTube UI Button (Recommended)
1. Navigate to a YouTube video
2. Look for the **"Summarize"** button left of the like/dislike buttons
3. Click the "Summarize" button
4. New tab opens with the summarizer app

Both methods:
- Extract the video ID from the URL
- Open the app with `?v=VIDEO_ID` parameter
- Work with both light and dark YouTube themes

## Testing

**Should ENABLE (icon becomes active):**
- ✅ `https://youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ `https://www.youtube.com/watch?v=jNQXAC9IVRw`
- ✅ `https://youtu.be/9bZkp7q19f0`

**Should STAY DISABLED (icon stays grayed):**
- ❌ `https://youtube.com/` (Home)
- ❌ `https://youtube.com/shorts/abc123` (Shorts)
- ❌ `https://youtube.com/feed/history` (History)
- ❌ `https://youtube.com/feed/trending` (Trending)

## Troubleshooting

- **Icon always grayed out:** Check permissions in `chrome://extensions/`
- **Click does nothing:** Check browser console for errors
- **Railway app doesn't load:** Verify the URL format in background.js
- **Video ID not extracted:** Check that you're on a valid YouTube video page (not Shorts/Home)

## How It Works

### Toolbar Button (background.js)
1. Listens for tab navigation to YouTube pages
2. Enables/disables toolbar icon based on URL validity
3. On click, extracts video ID and opens app

### YouTube UI Button (content.js)
1. Content script injects "Summarize" button into YouTube's DOM
2. Positioned left of like/dislike buttons
3. Styled to match YouTube's design (light/dark modes)
4. Handles YouTube's SPA navigation with MutationObserver

### Both Methods
1. Extract video ID from URL (supports `watch?v=` and `youtu.be/` formats)
2. Open Railway app: `https://youtube-summarizer-ui-teron131.up.railway.app?v=VIDEO_ID`
3. Frontend reconstructs as: `https://youtu.be/VIDEO_ID`
4. Clean URL is passed to the summarizer backend

## Files

- `manifest.json` - Extension configuration with content scripts
- `background.js` - Service worker for toolbar button (page action)
- `content.js` - Content script for YouTube UI button injection
- `content.css` - Styling for injected button (light/dark modes)
- `icon-*.png` - Extension icons (16x16, 48x48, 128x128)
- `youtube-icon-transparent.svg` - Source SVG icon

## Important Notes

**After updating the extension:**
1. Go to `chrome://extensions/`
2. Find "YouTube Summarizer"
3. Click the **reload icon** (circular arrow)
4. Refresh any open YouTube tabs to see the UI button

## Development

The icon was created from the YouTube logo with:
- Black YouTube rounded rectangle shape
- White play triangle in the middle
- Transparent background

To regenerate icons from SVG:
```bash
convert -background none youtube-icon-transparent.svg -resize 16x16 icon-16.png
convert -background none youtube-icon-transparent.svg -resize 48x48 icon-48.png
convert -background none youtube-icon-transparent.svg -resize 128x128 icon-128.png
```

