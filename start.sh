#!/bin/bash

# YouTube Summarizer - Local Development Startup Script
# This script clears ports and starts both backend and frontend services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8080
FRONTEND_PORT=5173

echo -e "${BLUE}🚀 YouTube Summarizer - Starting Local Development Environment${NC}"
echo "=================================================="

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Checking for processes on port $port ($service_name)...${NC}"
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${RED}⚠️  Found existing processes on port $port. Terminating...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✅ Port $port cleared${NC}"
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
    fi
}

# Function to check if required files exist
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if [ ! -f "app.py" ]; then
        echo -e "${RED}❌ app.py not found in current directory${NC}"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found in current directory${NC}"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Copy .env.example to .env and configure your API keys${NC}"
        echo -e "${BLUE}💡 Run: cp .env.example .env${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All required files found${NC}"
}

# Function to install dependencies if needed
install_dependencies() {
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    # Check Python dependencies
    if [ ! -d ".venv" ] && [ ! -f "requirements.txt" ]; then
        echo -e "${YELLOW}⚠️  No Python virtual environment or requirements.txt found${NC}"
        echo -e "${BLUE}💡 Please install Python dependencies first${NC}"
    fi
    
    # Check Node dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}✅ Dependencies check complete${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🐍 Starting Backend (FastAPI) on port $BACKEND_PORT...${NC}"
    python -m uvicorn app:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Starting Frontend (Vite) on port $FRONTEND_PORT...${NC}"
    npm run frontend:dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}🔴 Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}🔴 Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    kill_port $BACKEND_PORT "Backend cleanup"
    kill_port $FRONTEND_PORT "Frontend cleanup"
    
    echo -e "${GREEN}✅ Cleanup complete. Goodbye!${NC}"
    exit 0
}

# Function to wait for services to be ready
wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
    
    # Wait for backend
    local backend_ready=false
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
            backend_ready=true
            break
        fi
        sleep 1
    done
    
    if [ "$backend_ready" = true ]; then
        echo -e "${GREEN}✅ Backend is ready at http://localhost:$BACKEND_PORT${NC}"
        echo -e "${BLUE}📊 API Health: http://localhost:$BACKEND_PORT/api/health${NC}"
    else
        echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
    fi
    
    # Wait a bit more for frontend
    sleep 3
    echo -e "${GREEN}✅ Frontend should be ready at http://localhost:$FRONTEND_PORT${NC}"
}

# Function to display running services
show_services() {
    echo ""
    echo "=================================================="
    echo -e "${GREEN}🎉 YouTube Summarizer Development Environment Ready!${NC}"
    echo "=================================================="
    echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:$FRONTEND_PORT"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:$BACKEND_PORT"
    echo -e "${BLUE}📊 Health Check:${NC} http://localhost:$BACKEND_PORT/api/health"
    echo "=================================================="
    echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
    echo ""
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Main execution
echo -e "${BLUE}Starting YouTube Summarizer...${NC}"

check_requirements
install_dependencies

# Clear ports before starting
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start services
start_backend
sleep 2  # Give backend a moment to start
start_frontend

# Wait for services to be ready
wait_for_services

# Show service information
show_services

# Keep script running and wait for user interrupt
wait