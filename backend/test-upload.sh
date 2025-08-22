#!/bin/bash

# Test script for Supabase Storage Integration
echo "🧪 Testing Supabase Storage Integration"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3001"
TOKEN=""  # You'll need to get this from login

# Function to print status
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Health Check
echo ""
print_info "Testing health endpoint..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$health_response" -eq 200 ]; then
    print_success "Health check passed"
else
    print_error "Health check failed (HTTP $health_response)"
    exit 1
fi

# Test 2: Database Connection
echo ""
print_info "Testing database connection..."
db_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/test-db")
if [ "$db_response" -eq 200 ]; then
    print_success "Database connection successful"
else
    print_error "Database connection failed (HTTP $db_response)"
fi

# Test 3: Login (get token)
echo ""
print_info "Testing login to get token..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"employeeId": "admin"}')

TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    print_success "Login successful, token obtained"
else
    print_error "Login failed or token not found"
    echo "Response: $login_response"
    exit 1
fi

# Test 4: API Endpoints Info
echo ""
print_info "Getting API endpoints info..."
endpoints_response=$(curl -s "$BASE_URL/api")
if echo "$endpoints_response" | grep -q "Supabase Storage"; then
    print_success "API info shows Supabase Storage integration"
else
    print_error "API info doesn't show Supabase Storage integration"
fi

# Test 5: Create a test project (for image upload)
echo ""
print_info "Creating test project for image upload..."
project_data='{
    "projectName": "Test Project for Image Upload",
    "employeeId": "admin",
    "department": "Admin",
    "fiveSGroupName": "Test Group",
    "projectArea": "Test Area",
    "projectStartDate": "2025-01-01",
    "projectEndDate": "2025-01-31",
    "problemsEncountered": "Test problem",
    "solutionApproach": "Test solution",
    "fiveSType": "ส1",
    "improvementTopic": "Cost",
    "formType": "genba"
}'

project_response=$(curl -s -X POST "$BASE_URL/api/tasklist" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$project_data")

PROJECT_ID=$(echo "$project_response" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$PROJECT_ID" ]; then
    print_success "Test project created with ID: $PROJECT_ID"
else
    print_error "Failed to create test project"
    echo "Response: $project_response"
fi

# Test 6: Upload Statistics (if admin)
echo ""
print_info "Getting storage statistics..."
stats_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/upload/stats" \
    -H "Authorization: Bearer $TOKEN")

if [ "$stats_response" -eq 200 ]; then
    print_success "Storage statistics endpoint accessible"
else
    print_info "Storage statistics not accessible (expected if not admin)"
fi

# Test 7: Get project images (should be empty)
if [ -n "$PROJECT_ID" ]; then
    echo ""
    print_info "Getting project images (should be empty)..."
    images_response=$(curl -s "$BASE_URL/api/upload/project/$PROJECT_ID/images" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$images_response" | grep -q '"success":true'; then
        print_success "Project images endpoint working"
        echo "Images: $images_response"
    else
        print_error "Failed to get project images"
        echo "Response: $images_response"
    fi
fi

echo ""
echo "🎯 Manual Testing Instructions:"
echo "==============================="
echo "1. To test image upload, create a test image file:"
echo "   echo 'Test image content' > test_image.txt"
echo "   # Or use a real image file"
echo ""
echo "2. Upload single image:"
echo "   curl -X POST $BASE_URL/api/upload/single \\"
echo "     -H \"Authorization: Bearer $TOKEN\" \\"
echo "     -F \"file=@test_image.jpg\" \\"
echo "     -F \"projectId=$PROJECT_ID\" \\"
echo "     -F \"imageType=before\""
echo ""
echo "3. Upload multiple images:"
echo "   curl -X POST $BASE_URL/api/upload/multiple \\"
echo "     -H \"Authorization: Bearer $TOKEN\" \\"
echo "     -F \"files=@before_image.jpg\" \\"
echo "     -F \"files=@after_image.jpg\" \\"
echo "     -F \"projectId=$PROJECT_ID\""
echo ""
echo "4. Get project images:"
echo "   curl -X GET $BASE_URL/api/upload/project/$PROJECT_ID/images \\"
echo "     -H \"Authorization: Bearer $TOKEN\""
echo ""
echo "5. Delete project image:"
echo "   curl -X DELETE $BASE_URL/api/upload/project/$PROJECT_ID/image/before \\"
echo "     -H \"Authorization: Bearer $TOKEN\""
echo ""
print_success "Test script completed!"
echo ""
echo "🔑 Your auth token: $TOKEN"
echo "📋 Test project ID: $PROJECT_ID"