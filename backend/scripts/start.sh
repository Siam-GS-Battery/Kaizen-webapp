#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PORT=${PORT:-5001}
MAX_RETRIES=3

echo -e "${GREEN}🚀 Starting Kaizen Backend Server...${NC}"

# Function to check if port is in use
check_port() {
    lsof -ti:$PORT
}

# Function to kill process using the port
kill_port_process() {
    local pids=$(check_port)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Port $PORT is already in use by process(es): $pids${NC}"
        echo -e "${YELLOW}🔄 Attempting to free port $PORT...${NC}"
        
        for pid in $pids; do
            echo -e "${YELLOW}   Killing process $pid...${NC}"
            kill -9 $pid 2>/dev/null
        done
        
        sleep 2
        
        # Check if port is still in use
        local remaining_pids=$(check_port)
        if [ ! -z "$remaining_pids" ]; then
            echo -e "${RED}❌ Failed to free port $PORT. Process(es) $remaining_pids still running.${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Port $PORT freed successfully.${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ Port $PORT is available.${NC}"
        return 0
    fi
}

# Function to find alternative port
find_alternative_port() {
    local base_port=$PORT
    for i in {1..10}; do
        local test_port=$((base_port + i))
        if [ -z "$(lsof -ti:$test_port)" ]; then
            echo $test_port
            return 0
        fi
    done
    return 1
}

# Main execution
attempt=1
while [ $attempt -le $MAX_RETRIES ]; do
    echo -e "${GREEN}📡 Attempt $attempt/$MAX_RETRIES${NC}"
    
    if kill_port_process; then
        echo -e "${GREEN}🎯 Starting server on port $PORT...${NC}"
        
        if [ -f "dist/server.js" ]; then
            PORT=$PORT node dist/server.js
        else
            echo -e "${RED}❌ dist/server.js not found. Please build the project first with 'npm run build'${NC}"
            exit 1
        fi
        
        exit 0
    else
        echo -e "${YELLOW}🔍 Looking for alternative port...${NC}"
        alternative_port=$(find_alternative_port)
        
        if [ $? -eq 0 ]; then
            echo -e "${YELLOW}🔄 Using alternative port: $alternative_port${NC}"
            PORT=$alternative_port node dist/server.js
            exit 0
        else
            echo -e "${RED}❌ No alternative port found.${NC}"
        fi
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -le $MAX_RETRIES ]; then
        echo -e "${YELLOW}⏳ Waiting 3 seconds before retry...${NC}"
        sleep 3
    fi
done

echo -e "${RED}❌ Failed to start server after $MAX_RETRIES attempts.${NC}"
echo -e "${RED}   Please manually check and free port $PORT or use a different port.${NC}"
exit 1