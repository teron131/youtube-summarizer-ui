# Railway Two-Service Deployment - Step by Step Guide

## 🚀 Backend Service Setup

### 1. Create Backend Service
1. **Create new Railway service** from your GitHub repository
2. **Copy the backend nixpacks file:**
   ```bash
   cp nixpacks.backend.toml nixpacks.toml
   cp .railwayignore.backend .railwayignore
   ```
3. **Set environment variables:**
   ```
   GEMINI_API_KEY=your_actual_gemini_key
   FAL_KEY=your_actual_fal_key
   ALLOWED_ORIGINS=*
   ```
4. **Deploy** - Railway will auto-use `nixpacks.toml`

## 🎨 Frontend Service Setup

### 1. Create Frontend Service
1. **Add another service** to the same Railway project
2. **Copy the frontend nixpacks file:**
   ```bash
   cp nixpacks.frontend.toml nixpacks.toml
   cp .railwayignore.frontend .railwayignore
   ```
3. **Set environment variable:**
   ```
   VITE_API_BASE_URL=https://your-backend-domain.up.railway.app
   ```
4. **Deploy** - Railway will auto-use `nixpacks.toml`

## 🔧 Alternative: Use Railway's Auto-Detection

### Backend Service (Simpler)
1. **Create service** from GitHub
2. **Copy `.railwayignore.backend` to `.railwayignore`**
3. **Delete `nixpacks.toml`** - let Railway auto-detect Python
4. **Set environment variables**
5. **Deploy** - Railway will detect Python and use standard build

### Frontend Service (Simpler)
1. **Create service** from GitHub
2. **Copy `.railwayignore.frontend` to `.railwayignore`**
3. **Delete `nixpacks.toml`** - let Railway auto-detect Node.js
4. **Set `VITE_API_BASE_URL`**
5. **Deploy** - Railway will detect Node.js and run `npm run build`

## 🎯 Quick Commands

**For Backend Deployment:**
```bash
# Copy files for backend
cp .railwayignore.backend .railwayignore
# Option 1: Use custom nixpacks
cp nixpacks.backend.toml nixpacks.toml
# Option 2: Use auto-detection (delete nixpacks.toml)
rm nixpacks.toml
```

**For Frontend Deployment:**
```bash
# Copy files for frontend
cp .railwayignore.frontend .railwayignore
# Option 1: Use custom nixpacks
cp nixpacks.frontend.toml nixpacks.toml
# Option 2: Use auto-detection (delete nixpacks.toml)
rm nixpacks.toml
```

## 💡 Recommendation

**Use Auto-Detection (Simpler):**
- Railway's auto-detection is very reliable
- No custom nixpacks configuration needed
- Just use the `.railwayignore` files to separate concerns