#!/bin/bash

# YouTube Summarizer - Local Development Start Script
# This script starts both frontend and backend services locally
# Use --force to stop existing services before starting

set -e

# Check for force restart flag
FORCE_RESTART=false
if [ "$1" = "--force" ]; then
    FORCE_RESTART=true
fi

if [ "$FORCE_RESTART" = true ]; then
    echo "🔄 Force restarting YouTube Summarizer (Local Development)"
else
    echo "🚀 Starting YouTube Summarizer (Local Development)"
fi
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}📋 Checking dependencies...${NC}"

if ! command_exists "bun"; then
    echo -e "${RED}❌ Bun is not installed. Please install Bun first.${NC}"
    echo "   Visit: https://bun.sh/"
    exit 1
fi

if ! command_exists "uv"; then
    echo -e "${RED}❌ UV is not installed. Please install UV first.${NC}"
    echo "   Visit: https://docs.astral.sh/uv/getting-started/installation/"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies check passed${NC}"

# Function to stop existing services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping existing services...${NC}"

    # Stop backend
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill $BACKEND_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Backend stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend process not found${NC}"
        fi
        rm -f backend.pid
    else
        echo -e "${YELLOW}⚠️  No backend PID file found${NC}"
    fi

    # Stop frontend
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill $FRONTEND_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Frontend stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  Frontend process not found${NC}"
        fi
        rm -f frontend.pid
    else
        echo -e "${YELLOW}⚠️  No frontend PID file found${NC}"
    fi

    # Kill any remaining processes on our ports
    echo -e "${YELLOW}🧹 Cleaning up port usage...${NC}"

    # Kill processes on backend port
    if lsof -ti:$BACKEND_PORT >/dev/null 2>&1; then
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Port $BACKEND_PORT cleared${NC}"
    fi

    # Kill processes on frontend port
    if lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Port $FRONTEND_PORT cleared${NC}"
    fi

    echo -e "${GREEN}🎉 Existing services stopped and ports cleared${NC}"
    echo ""
}

# Check ports
FRONTEND_PORT=5173
BACKEND_PORT=8080

# Force stop existing services if requested
if [ "$FORCE_RESTART" = true ]; then
    stop_services
fi

if port_in_use $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $FRONTEND_PORT is already in use${NC}"
    echo "   Frontend will use the next available port"
fi

if port_in_use $BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $BACKEND_PORT is already in use${NC}"
    echo "   Backend will use the next available port"
fi

# Function to start backend
start_backend() {
    echo -e "${BLUE}🐍 Starting Backend (Python/FastAPI)...${NC}"
    cd youtube-summarizer
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
        uv venv
    fi
    
    # Install dependencies
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    uv sync
    
    # Start backend
    echo -e "${GREEN}🚀 Starting backend on port $BACKEND_PORT${NC}"
    uv run python -m uvicorn app:app --host 0.0.0.0 --port $BACKEND_PORT --reload &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Starting Frontend (React/Vite)...${NC}"
    
    # Install dependencies
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    bun install
    
    # Start frontend
    echo -e "${GREEN}🚀 Starting frontend on port $FRONTEND_PORT${NC}"
    bun run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm -f backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    echo -e "${GREEN}🎉 All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
sleep 3  # Give backend time to start

start_frontend
sleep 3  # Give frontend time to start

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${BLUE}🐍 Backend:${NC}  http://localhost:$BACKEND_PORT"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:$BACKEND_PORT/docs"
echo ""
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}💡 Use './start.sh --force' to force restart services${NC}"
echo ""

# Wait for user interrupt
wait
