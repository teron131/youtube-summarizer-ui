# Scripts Directory

This directory contains utility scripts for maintaining and updating the YouTube Summarizer project.

## Development Scripts

### `start.sh` (Root Directory)
Main development script for starting both frontend and backend services locally.

**Usage:**
```bash
# Normal start
./start.sh

# Force restart (stops existing services first)
./start.sh --force
```

**Features:**
- ✅ Checks for required dependencies (bun, uv)
- ✅ Creates Python virtual environment if needed
- ✅ Installs all dependencies automatically
- ✅ Starts both frontend (port 5173) and backend (port 8080)
- ✅ Provides service URLs and API documentation links
- ✅ Graceful shutdown with Ctrl+C
- ✅ Force restart option to stop existing services

**Prerequisites:**
- Bun (for frontend): `https://bun.sh/`
- UV (for Python): `https://docs.astral.sh/uv/getting-started/installation/`
- Environment variables in `.env` file

### `stop.sh` (Root Directory)
Script to stop all running services and clean up ports.

**Usage:**
```bash
./stop.sh
```

**Features:**
- ✅ Stops backend and frontend processes
- ✅ Cleans up PID files
- ✅ Kills any remaining processes on ports 5173 and 8080
- ✅ Provides clear status messages

## Available Scripts

### `update-example-data.js`
Updates the `src/services/example-data.ts` file with data from a specified YouTube URL.

**Usage:**
```bash
node scripts/update-example-data.js "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

**Prerequisites:**
- Backend server running on `localhost:8080`
- `GEMINI_API_KEY` environment variable set
- `APIFY_API_KEY` environment variable set

**What it does:**
1. Scrapes video information from the YouTube URL
2. Generates analysis using the current AI models
3. Updates the example data file with fresh content
4. Preserves the TypeScript structure for testing

### `update-example-data.sh`
Convenience script that updates example data with the AlphaFold video URL.

**Usage:**
```bash
./scripts/update-example-data.sh
```

**Automatic setup:**
- Uses predefined URL: `https://www.youtube.com/watch?v=P_fHJIYENdI`
- Checks if backend is running
- Validates environment variables
- Runs the update process

## Example Usage

```bash
# Update with a specific video
node scripts/update-example-data.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Or use the convenience script for AlphaFold
./scripts/update-example-data.sh
```

## Environment Variables

Make sure these are set in your `.env` file or exported:

```bash
GEMINI_API_KEY=your_gemini_api_key
APIFY_API_KEY=your_apify_api_key
BACKEND_URL=http://localhost:8080  # Optional, defaults to localhost:8080
```

## What Gets Updated

The script updates `src/services/example-data.ts` with:
- ✅ Fresh video metadata (title, author, duration, etc.)
- ✅ Updated transcript content
- ✅ New analysis results from current AI models
- ✅ Quality assessment data
- ✅ Processing logs and timestamps
- ✅ All TypeScript exports for testing compatibility

This ensures your test data stays current with the latest AI model capabilities.
