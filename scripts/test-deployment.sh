#!/bin/bash

# SWEAT24 Admin Panel Deployment Test Script
# This script tests the production deployment to ensure everything is working correctly

echo "🚀 SWEAT24 Admin Panel Deployment Testing"
echo "========================================="

# Check if API URL is provided
if [ -z "$1" ]; then
    API_URL="https://sweat93laravel.obs.com.gr"
    echo "Using default API URL: $API_URL"
else
    API_URL="$1"
    echo "Using provided API URL: $API_URL"
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

# Test authentication endpoint
test_auth() {
    echo -e "\n${YELLOW}Testing Authentication${NC}"
    echo "----------------------"
    
    # Test login endpoint exists
    test_endpoint "/api/v1/auth/login" "405" "Login endpoint (GET should return 405)"
    
    # Test login with valid credentials
    echo -n "Testing login with valid credentials... "
    response=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d '{"email":"admin@sweat24.gr","password":"password"}' \
        -w "\n%{http_code}")
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "200" ] && [[ "$body" == *"token"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        # Extract token for further tests
        # Check if jq is available
        if command -v jq &> /dev/null; then
            TOKEN=$(echo "$body" | jq -r '.token')
        else
            # Fallback to grep/sed if jq is not available
            TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        fi
        export TOKEN
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $status_code)"
        return 1
    fi
}

# Test protected endpoints
test_protected_endpoints() {
    echo -e "\n${YELLOW}Testing Protected Endpoints${NC}"
    echo "---------------------------"
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}No auth token available, skipping protected endpoint tests${NC}"
        return 1
    fi
    
    # Test various endpoints with authentication
    endpoints=(
        "/api/v1/users:200:Users endpoint"
        "/api/v1/classes:200:Classes endpoint"
        "/api/v1/packages:200:Packages endpoint"
        "/api/v1/instructors:200:Instructors endpoint"
        "/api/v1/bookings:200:Bookings endpoint"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint status desc <<< "$endpoint_info"
        
        echo -n "Testing $desc... "
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Accept: application/json" \
            "$API_URL$endpoint")
        
        if [ "$response" = "$status" ]; then
            echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        else
            echo -e "${RED}✗ FAIL${NC} (Expected: $status, Got: $response)"
        fi
    done
}

# Test CORS headers
test_cors() {
    echo -e "\n${YELLOW}Testing CORS Configuration${NC}"
    echo "--------------------------"
    
    echo -n "Testing CORS headers... "
    response=$(curl -s -I -X OPTIONS "$API_URL/api/v1/users" \
        -H "Origin: https://admin.sweat24.gr" \
        -H "Access-Control-Request-Method: GET")
    
    if [[ "$response" == *"Access-Control-Allow-Origin"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} (CORS headers present)"
    else
        echo -e "${RED}✗ FAIL${NC} (CORS headers missing)"
    fi
}

# Test database connectivity
test_database() {
    echo -e "\n${YELLOW}Testing Database Connectivity${NC}"
    echo "-----------------------------"
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}No auth token available, skipping database tests${NC}"
        return 1
    fi
    
    echo -n "Testing data retrieval... "
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/json" \
        "$API_URL/api/v1/users")
    
    if [[ "$response" == *"data"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} (Data retrieved successfully)"
    else
        echo -e "${RED}✗ FAIL${NC} (Failed to retrieve data)"
    fi
}

# Performance test
test_performance() {
    echo -e "\n${YELLOW}Testing Performance${NC}"
    echo "-------------------"
    
    echo -n "Testing API response time... "
    time=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/api/v1/auth/login" -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test","password":"test"}')
    
    # Convert to milliseconds
    time_ms=$(echo "$time * 1000" | bc)
    
    if (( $(echo "$time_ms < 1000" | bc -l) )); then
        echo -e "${GREEN}✓ PASS${NC} (${time_ms}ms)"
    else
        echo -e "${YELLOW}⚠ SLOW${NC} (${time_ms}ms)"
    fi
}

# Run all tests
echo -e "\nStarting deployment tests for: $API_URL\n"

test_auth
test_protected_endpoints
test_cors
test_database
test_performance

echo -e "\n========================================="
echo "Testing complete!"
echo -e "========================================="