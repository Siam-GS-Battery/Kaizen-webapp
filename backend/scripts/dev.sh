#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PORT=${PORT:-5001}

echo -e "${GREEN}🔧 Starting Kaizen Backend in Development Mode...${NC}"

# Function to check if port is in use and kill the process
check_and_kill_port() {
    local pids=$(lsof -ti:$PORT)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Port $PORT is in use by process(es): $pids${NC}"
        echo -e "${YELLOW}🔄 Killing existing processes...${NC}"
        
        for pid in $pids; do
            echo -e "${YELLOW}   Stopping process $pid...${NC}"
            kill -9 $pid 2>/dev/null
        done
        
        sleep 1
        echo -e "${GREEN}✅ Port $PORT freed.${NC}"
    else
        echo -e "${GREEN}✅ Port $PORT is available.${NC}"
    fi
}

# Check and free port
check_and_kill_port

# Start development server
echo -e "${GREEN}🚀 Starting development server on port $PORT...${NC}"
PORT=$PORT npx ts-node-dev --respawn --transpile-only src/server.ts