#!/bin/bash

# Kaizen Backend Setup Script
# This script automates the backend setup process

echo "🚀 Kaizen Backend Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
print_step "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version) ✓"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_status "npm version: $(npm --version) ✓"

# Install dependencies
print_step "Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully ✓"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
print_step "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_status ".env file created from template"
    print_warning "Please update .env file with your Supabase credentials before starting the server"
else
    print_status ".env file exists ✓"
fi

# Create uploads directory if it doesn't exist
print_step "Creating uploads directory..."
if [ ! -d "uploads" ]; then
    mkdir uploads
    print_status "uploads directory created ✓"
else
    print_status "uploads directory exists ✓"
fi

# Build the project
print_step "Building TypeScript project..."
if npm run build; then
    print_status "Project built successfully ✓"
else
    print_error "Failed to build project"
    exit 1
fi

# Test the health endpoint (if server is not running)
print_step "Testing server startup..."
npm run dev &
SERVER_PID=$!
sleep 5

# Test health endpoint
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    print_status "Server health check passed ✓"
else
    print_warning "Server health check failed (this might be normal if .env is not configured)"
fi

# Stop test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Supabase credentials:"
echo "   - SUPABASE_URL=https://your-project.supabase.co"
echo "   - SUPABASE_ANON_KEY=your_supabase_anon_key"
echo "   - SUPABASE_SERVICE_KEY=your_supabase_service_role_key"
echo "   - JWT_SECRET=your_super_secret_jwt_key_here"
echo ""
echo "2. Set up your Supabase database schema:"
echo "   - Open Supabase Dashboard SQL Editor"
echo "   - Run database/schema.sql"
echo "   - Run database/sample-data.sql (optional)"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test the API:"
echo "   curl http://localhost:5001/api/health"
echo ""
echo "📖 For detailed instructions, see README.md"