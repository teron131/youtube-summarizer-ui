# YouTube Summarizer UI

A modern, full-stack application that transforms YouTube videos into concise, AI-powered summaries with transcripts. Built with React, TypeScript, Tailwind CSS, and FastAPI.

## 🚀 Features

- **YouTube Video Processing**: Extract video information, audio, and existing captions
- **AI Transcription**: High-quality audio transcription using FAL AI's Whisper service
- **Smart Summarization**: AI-powered summaries using Google's Gemini API
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
- **yt-dlp** for YouTube video processing
- **FAL AI** for audio transcription
- **Google Gemini** for AI summarization
- **Pydub** for audio optimization
- **OpenCC** for Chinese text conversion

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **API Keys**:
  - FAL AI API key ([Get here](https://fal.ai/))
  - Google Gemini API key ([Get here](https://ai.google.dev/))

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd youtube-summarizer-ui

# Install frontend dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
# OR using uv (recommended)
uv sync
```

### 2. Environment Configuration

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
FAL_KEY=your_fal_api_key_here

# Local Development
VITE_API_BASE_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Run the Application

#### Option A: Full Stack (Recommended)
Run both frontend and backend simultaneously:

```bash
npm run dev
```

This starts:
- Backend API at `http://localhost:8080`
- Frontend UI at `http://localhost:5173`

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

## 📋 Deployment Quick Reference

### Local Development Setup
1. Copy `.env.example` to `.env`
2. Fill in your API keys (`GEMINI_API_KEY`, `FAL_KEY`)
3. Keep `VITE_API_BASE_URL=http://localhost:8080`
4. Run: `npm run dev`

### Railway Single-Service Deployment
1. Set environment variables in Railway dashboard:
   - `GEMINI_API_KEY=your_actual_key`
   - `FAL_KEY=your_actual_key`  
   - `ALLOWED_ORIGINS=*`
2. Railway automatically sets `PORT`
3. Deploy from main directory - Railway handles both frontend build and backend
4. Access your app at the Railway-provided domain

## 📁 Project Structure

```
youtube-summarizer-ui/
├── app.py                  # Main FastAPI application (for Railway)
├── backend/                # Python backend modules
│   ├── youtube_loader.py   # YouTube video processing
│   ├── transcriber.py      # Audio transcription service
│   ├── summarizer.py       # AI summarization service
│   └── utils.py            # Utility functions
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/           # API service layer
│   ├── pages/              # Page components
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── railway.json           # Railway deployment config
└── package.json           # Frontend dependencies
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
npm run frontend:dev    # Start frontend only
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Lint code
```

### Backend Development
```bash
npm run backend:dev     # Start backend with auto-reload
npm run backend:test    # Test backend health
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
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Check if port 8080 is available
- Verify API keys in `.env` file

**Frontend not connecting to backend:**
- Ensure backend is running on port 8080
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in backend

**Video processing fails:**
- Check YouTube URL format
- Verify FAL_KEY and GEMINI_API_KEY are valid
- Some videos may have restricted access

### Deployment Troubleshooting

**Build fails:**
- Check that `nixpacks.toml` has correct package versions
- Verify `requirements.txt` and `package.json` are valid
- Review Railway build logs

**App starts but frontend doesn't load:**
- Ensure `npm run build` completed successfully
- Check that `dist/` directory exists
- Verify static file serving in `app.py`

**API not working:**
- Check Railway environment variables are set
- Verify backend health at `https://your-domain.railway.app/api/health`
- Review Railway deployment logs

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation
