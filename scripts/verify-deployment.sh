#!/bin/bash

# Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh

echo "🚀 Starting deployment verification..."
echo "======================================"

# Configuration
DEPLOY_URL="https://platform-docs-public-iota.vercel.app"
LECHAT_API="${DEPLOY_URL}/api/lechat"
HEALTH_API="${DEPLOY_URL}/api/health"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test URL
test_url() {
    local url=$1
    local name=$2
    
    if curl -s --head --request GET "$url" | grep -q "200 OK"; then
        echo -e "${GREEN}✅ ${name}: Accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name}: Not accessible${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local url=$1
    local name=$2
    
    if curl -s --head --request POST "$url" | grep -qE "200|401|403"; then
        echo -e "${GREEN}✅ ${name}: Responding${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name}: Not responding${NC}"
        return 1
    fi
}

echo ""
echo "🌐 URL Verification"
echo "------------------"
test_url "$DEPLOY_URL" "Homepage"
test_url "${DEPLOY_URL}/favicon.ico" "Favicon"
test_url "${DEPLOY_URL}/_next/static/chunks/main-*.js" "Main JS Bundle"

echo ""
echo "🤖 API Verification"
echo "------------------"
test_api "$LECHAT_API" "LeChat API"
test_api "$HEALTH_API" "Health API"

echo ""
echo "📦 Asset Verification"
echo "------------------"
# Test if we can find the LeChat bundle
if curl -s "${DEPLOY_URL}/_next/static/chunks/main-*.js" | grep -q "LeChat"; then
    echo -e "${GREEN}✅ LeChat bundle: Found${NC}"
else
    echo -e "${YELLOW}⚠️  LeChat bundle: Not found in main bundle${NC}"
fi

echo ""
echo "🎉 Verification Summary"
echo "======================"
echo "All basic checks completed!"
echo ""
echo "Next steps:"
echo "1. Test LeChat functionality manually in browser"
echo "2. Check browser console for any JavaScript errors"
echo "3. Verify API responses include proper authentication headers"
echo ""
echo "For detailed testing, run: npm run test:deployment"
