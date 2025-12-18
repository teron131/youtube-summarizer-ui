# YouTube Summarizer Chrome Extension

Extension to send YouTube videos to your summarizer app with **two ways to use it**:
1. **Side panel** - Open the summarizer inside Chrome’s side panel
2. **YouTube UI button** - "Summarize" button directly on YouTube video pages (opens side panel)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Download the latest `youtube-summarizer-extension.zip` from this repo’s GitHub Releases and unzip it
5. Click **Load unpacked** and select the unzipped folder (it contains `manifest.json`)
6. The extension will be active on YouTube pages

## Features

### 🎯 Two Ways to Summarize

#### Option 1: Side Panel (Recommended)
1. Navigate to a YouTube video
2. Extension icon in toolbar becomes enabled (colored)
3. Click the toolbar icon
4. Side panel opens with the summarizer app

#### Option 2: YouTube UI Button (Recommended)
1. Navigate to a YouTube video
2. Look for the **"Summarize"** button left of the like/dislike buttons
3. Click the "Summarize" button
4. Side panel opens with the summarizer app

Both methods:
- Extract the video ID from the URL
- Open the app with `?v=VIDEO_ID` parameter (inside the side panel)
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
- **Side panel blank:** Re-open the side panel and check the extension page console for errors
- **Backend not reachable:** The extension is built with a fixed backend URL; download the correct release build (or ask the maintainer to rebuild with the right `VITE_API_BASE_URL`)
- **Video ID not extracted:** Check that you're on a valid YouTube video page (not Shorts/Home)

## How It Works

### Side Panel (background.js + sidepanel.html)
1. Listens for tab navigation to YouTube pages
2. Enables/disables toolbar icon based on URL validity
3. On click, extracts video ID and opens Chrome’s side panel for that tab

### YouTube UI Button (content.js)
1. Content script injects "Summarize" button into YouTube's DOM
2. Positioned left of like/dislike buttons
3. Styled to match YouTube's design (light/dark modes)
4. Handles YouTube's SPA navigation with MutationObserver

### Both Methods
1. Extract video ID from URL (supports `watch?v=` and `youtu.be/` formats)
2. Load the locally-built app inside the extension at `chrome-extension://.../app/index.html?v=VIDEO_ID`
3. Frontend reconstructs as: `https://youtu.be/VIDEO_ID`
4. Clean URL is passed to the summarizer backend

## Files

- `manifest.json` - Extension configuration with content scripts
- `background.js` - Service worker for enabling + opening the side panel
- `sidepanel.html` - Side panel wrapper UI
- `sidepanel.js` - Side panel logic (loads the app + fallback to open tab)
- `content.js` - Content script for YouTube UI button injection (opens side panel)
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

## Sharing With Non-Technical Users

Download `youtube-summarizer-extension.zip` from GitHub Releases and follow the Installation steps above.

If you want true one-click installs (no Developer mode), publish to the Chrome Web Store.

## Maintainers: Building Releases

- Workflow: `.github/workflows/extension-release.yml` (runs on GitHub Release publish)
- Configure backend URL: set repository variable `VITE_API_BASE_URL` (or use workflow dispatch input)
