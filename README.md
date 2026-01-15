# YouTube Summarizer UI

![YouTube Summarizer UI](ui.png)

A modern, full-stack application that transforms YouTube videos into concise, AI-powered summaries with transcripts. Built with React, TypeScript, Tailwind CSS, and FastAPI.

## 🔗 Demo

https://teron131.github.io/youtube-summarizer-ui

## 🚀 Features

- **YouTube Video Processing**: Extract video information and transcripts using ScrapeCreators API
- **AI Transcription**: Fallback audio transcription using FAL AI's Whisper service
- **Smart Summarization**: AI-powered summaries using OpenRouter (Grok, Gemini, Claude) with quality self-checking
- **Real-time Processing**: Live progress updates and detailed logging
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS and shadcn/ui
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **React Query** for API state management

### Backend
- **FastAPI** for high-performance API
- **ScrapeCreators API** for YouTube video metadata and transcript extraction
- **yt-dlp** for fallback video processing
- **FAL AI** for audio transcription (fallback)
- **OpenRouter** for unified LLM access (Grok, Gemini, Claude)
- **LangChain & LangGraph** for AI workflow orchestration
- **Pydub** for audio optimization
- **OpenCC** for Chinese text conversion

## 📋 Prerequisites

- **Node.js** 18+ and npm/bun
- **Python** 3.8+
- **API Keys** (at least one required):
  - **ScrapeCreators API key** ([Get here](https://scrapecreators.com/)) - For video scraping
  - **OpenRouter API key** ([Get here](https://openrouter.ai/)) - For AI models (Grok, Claude, etc.)
  - **OR** Google Gemini API key ([Get here](https://ai.google.dev/)) - Alternative for AI analysis
  - FAL AI API key ([Get here](https://fal.ai/)) - Optional, for audio transcription fallback

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd youtube-summarizer-ui

# Install frontend dependencies
bun install

# Install Python dependencies
cd youtube-summarizer
uv sync
cd ..
```

### 2. Environment Configuration

Copy the example environment file and add your API keys:

```bash
cp youtube-summarizer/.env_example youtube-summarizer/.env
```

Edit `youtube-summarizer/.env` with your API keys:

```env
# Required
SCRAPECREATORS_API_KEY=your_scrapecreators_api_key_here

# AI Models (at least one required)
OPENROUTER_API_KEY=your_openrouter_api_key_here
# OR
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
FAL_KEY=your_fal_api_key_here
```

### 3. Run the Application

#### Option A: Full Stack (Recommended)
Run both frontend and backend simultaneously:

```bash
./start.sh
```

This starts:
- Backend API at `http://localhost:8001`
- Frontend UI at `http://localhost:5173`
- API Docs at `http://localhost:8001/docs`

#### Option B: Individual Services

**Backend only:**
```bash
cd youtube-summarizer
uv run python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend only:**
```bash
bun run dev
```

#### Option C: Stop All Services
```bash
./stop.sh
```



#### Option B: Individual Services

**Backend only:**
```bash
npm run backend:dev
```

**Frontend only:**
```bash
npm run frontend:dev
```

### 4. Usage

1. Open `http://localhost:5173` in your browser
2. Paste a YouTube URL (e.g., `https://youtube.com/watch?v=VIDEO_ID`)
3. Click "Summarize Video"
4. Watch real-time processing logs
5. Review the generated transcript and AI summary

## 🚀 Railway Deployment

### Frontend Service
- **Location**: Root directory (`railway.toml`)
- **Builder**: Nixpacks (auto-detects React/Vite)
- **Start Command**: `npx serve -s dist -l $PORT`
- **Health Check**: `/` (root path)

### Backend Service  
- **Location**: `youtube-summarizer/railway.toml`
- **Builder**: Nixpacks (auto-detects Python/FastAPI)
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/docs` (FastAPI docs)

### Deployment Steps
1. **Frontend**: Deploy from root directory (auto-detects React/Vite)
2. **Backend**: Deploy from `youtube-summarizer/` directory (auto-detects Python/FastAPI)
3. **Environment Variables**: Set in Railway dashboard:
   - `GEMINI_API_KEY=your_actual_key`
   - `FAL_KEY=your_actual_key`
4. **Access**: Your app will be available at the Railway-provided domain

## 🔧 Dependencies

### Required Tools
- **Bun**: Node.js package manager for frontend
- **UV**: Python package manager for backend

### Installation
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 📁 Project Structure

```
youtube-summarizer-ui/
├── railway.toml              # Frontend Railway config
├── start.sh                  # Local development start script
├── stop.sh                   # Local development stop script
├── package.json              # Frontend dependencies
├── bun.lock                  # Frontend lockfile
├── src/                      # Frontend source code
├── dist/                     # Frontend build output
├── vite.config.ts            # Vite configuration
└── youtube-summarizer/       # Backend service
    ├── railway.toml          # Backend Railway config
    ├── pyproject.toml        # Backend dependencies
    ├── uv.lock               # Backend lockfile
    ├── app.py                # FastAPI application
    └── youtube_summarizer/   # Backend source code
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Video Information
```http
POST /api/video-info
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=VIDEO_ID"
}
```

### Process Video
```http
POST /api/process
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "generate_summary": true
}
```

## 🔧 Development

### Frontend Development
```bash
bun run dev            # Start frontend development server
bun run build          # Build for production
bun run preview        # Preview production build
bun run lint           # Lint code
```

### Backend Development
```bash
cd youtube-summarizer
uv run python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

## ⚙️ Configuration

### Supported YouTube URL Formats
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`

### Processing Flow
1. **Video Info Extraction**: Extract metadata using yt-dlp
2. **Caption Check**: Look for existing subtitles (Chinese/English)
3. **Audio Download**: Download optimized audio if no captions found
4. **Transcription**: Generate transcript using FAL AI Whisper
5. **Summarization**: Create AI summary using Google Gemini
6. **Result Display**: Show video info, transcript, and summary

## 🛠️ Troubleshooting

### Local Development Issues

**Backend not starting:**
- Ensure Python dependencies are installed: `cd youtube-summarizer && uv sync`
- Check if port 8001 is available
- Verify API keys in `youtube-summarizer/.env` file

**Frontend not connecting to backend:**
- Ensure backend is running on port 8001
- Check Vite proxy configuration in `vite.config.ts`
- Verify CORS settings in backend

**Video processing fails:**
- Check YouTube URL format
- Verify FAL_KEY and GEMINI_API_KEY are valid
- Some videos may have restricted access

### Deployment Troubleshooting

**Build fails:**
- Check that Railway configs are correct
- Verify `pyproject.toml` and `package.json` are valid
- Review Railway build logs

**App starts but frontend doesn't load:**
- Ensure `bun run build` completed successfully
- Check that `dist/` directory exists
- Verify static file serving configuration

**API not working:**
- Check Railway environment variables are set
- Verify backend health at `https://your-domain.railway.app/docs`
- Review Railway deployment logs
