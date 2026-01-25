#!/usr/bin/env bash
# Enterprise Email Automation Platform - Quick Start Script
# This script starts both frontend and backend servers

echo "🚀 Starting Enterprise Email Automation Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo -e "${BLUE}System Check:${NC}"
echo "✓ Node version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Kill any existing processes
echo -e "${YELLOW}Cleaning up old processes...${NC}"
pkill -f "node BACKEND_server.js" 2>/dev/null || true
sleep 1

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
node BACKEND_server.js &
BACKEND_PID=$!
sleep 2

# Start frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${GREEN}✅ Both servers started!${NC}"
echo ""
echo -e "${BLUE}Access Information:${NC}"
echo "  Frontend:  ${GREEN}http://localhost:5173${NC}"
echo "  Backend:   ${GREEN}http://localhost:3001${NC}"
echo "  Login:     ${GREEN}admin@demo.com / admin123${NC}"
echo ""
echo -e "${YELLOW}Processes:${NC}"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

wait
