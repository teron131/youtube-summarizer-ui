#!/bin/bash

# YouTube Summarizer - Stop Services Script

echo "🛑 Stopping YouTube Summarizer services..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
echo "🧹 Cleaning up port usage..."

# Kill processes on backend port
if lsof -ti:8001 >/dev/null 2>&1; then
    lsof -ti:8001 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Port 8001 cleared${NC}"
fi

# Kill processes on frontend port
if lsof -ti:5173 >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Port 5173 cleared${NC}"
fi

echo -e "${GREEN}🎉 All services stopped and ports cleared${NC}"
