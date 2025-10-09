# YouTube Summarizer Chrome Extension

Simple extension to send YouTube videos to your summarizer app.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension/` directory
5. The extension icon will appear in your toolbar (grayed out by default)

## Usage

1. Navigate to a YouTube video (e.g., `https://youtube.com/watch?v=...`)
2. Extension icon becomes enabled (colored)
3. Click the icon
4. New tab opens with the summarizer app and video ID passed as `?v=VIDEO_ID`
5. The app constructs a clean YouTube URL: `https://youtu.be/VIDEO_ID`

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

1. Extension detects valid YouTube video pages (`youtube.com/watch?v=...` or `youtu.be/...`)
2. Extracts the video ID from the URL
3. Opens Railway app with clean parameter: `?v=VIDEO_ID` (no slash before `?`)
4. Frontend reconstructs as: `https://youtu.be/VIDEO_ID`
5. This clean URL is passed to the summarizer backend

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker logic
- `icon-*.png` - Extension icons (16x16, 48x48, 128x128)
- `youtube-icon-transparent.svg` - Source SVG icon

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

