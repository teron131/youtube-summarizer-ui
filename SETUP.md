# YouTube Summarizer - Setup Guide

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

## 🏠 Local Development

### Quick Start
```bash
# Start both services
./start.sh

# Stop all services
./stop.sh
```

### Manual Start
```bash
# Backend (Port 8001)
cd youtube-summarizer
uv sync
uv run python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload

# Frontend (Port 5173) - in another terminal
bun install
bun run dev
```

### Ports
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## ⚙️ Configuration

### Frontend (Vite)
- API proxy configured to `localhost:8001`
- Builds to `dist/` folder
- Uses Bun for package management

### Backend (FastAPI)
- Uses UV for Python package management
- CORS enabled for frontend communication
- Environment variables loaded from `.env`

## 🔧 Dependencies

### Required Tools
- **Bun**: Node.js package manager
- **UV**: Python package manager

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
└── youtube-summarizer/       # Backend service
    ├── railway.toml          # Backend Railway config
    ├── pyproject.toml        # Backend dependencies
    ├── uv.lock               # Backend lockfile
    ├── app.py                # FastAPI application
    └── youtube_summarizer/   # Backend source code
```
