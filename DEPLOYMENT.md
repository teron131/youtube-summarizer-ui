# Deployment Guide - Split Frontend/Backend

This guide shows how to deploy the YouTube Summarizer as separate frontend and backend services.

## Why Split Deployments?

- **Simpler builds** - Each service has focused dependencies
- **Independent scaling** - Scale frontend and backend separately  
- **Easier debugging** - Isolate build and runtime issues
- **Better resource utilization** - Frontend can use CDN, backend needs compute

## Backend Deployment (Railway)

### 1. Create Backend Service
```bash
# In Railway dashboard, create new service from GitHub repo
# Set custom nixpacks config: nixpacks.backend.toml
# Use .railwayignore.backend to exclude frontend files
```

### 2. Configure Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key_here
FAL_KEY=your_fal_api_key_here
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app,http://localhost:5173
FRONTEND_URL=https://your-frontend-domain.railway.app
HOST=0.0.0.0
PORT=$PORT
```

### 3. Deploy Backend
- Deploy will use [`nixpacks.backend.toml`](nixpacks.backend.toml)
- Fixed UV installation issue by combining commands
- Backend will be available at: `https://your-backend-domain.railway.app`

## Frontend Deployment (Railway/Vercel)

### Option A: Railway Frontend

### 1. Create Frontend Service
```bash
# In Railway dashboard, create new service from same GitHub repo
# Set custom nixpacks config: nixpacks.frontend.toml  
# Use .railwayignore.frontend to exclude backend files
```

### 2. Configure Environment Variables
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

### Option B: Vercel Frontend (Recommended)

### 1. Connect to Vercel
```bash
npm i -g vercel
vercel --prod
```

### 2. Configure Environment Variables in Vercel Dashboard
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

## Local Development

Backend only:
```bash
uv sync
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8080
```

Frontend only:
```bash
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run frontend:dev
```

Both together:
```bash
npm run dev  # Uses concurrently to run both
```

## Troubleshooting

### Backend Issues
- Check Railway logs for UV installation errors
- Verify `~/.cargo/env` is sourced in same command
- Ensure environment variables are set

### Frontend Issues  
- Check `VITE_API_BASE_URL` points to correct backend
- Verify CORS is configured correctly in backend
- Test API endpoints directly: `https://your-backend.railway.app/api/health`

### CORS Issues
- Add your frontend domain to `ALLOWED_ORIGINS`
- Backend now accepts `*.railway.app`, `*.vercel.app`, `*.netlify.app`
- For custom domains, add to `FRONTEND_URL` environment variable

## Files Created

- [`nixpacks.backend.toml`](nixpacks.backend.toml) - Backend-only build config
- [`nixpacks.frontend.toml`](nixpacks.frontend.toml) - Frontend-only build config  
- [`.railwayignore.backend`](.railwayignore.backend) - Exclude frontend files from backend
- [`.railwayignore.frontend`](.railwayignore.frontend) - Exclude backend files from frontend
- Updated [`app.py`](app.py) - Enhanced CORS for production
- Updated [`.env.example`](.env.example) - Environment variable documentation