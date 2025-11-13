#!/bin/bash

echo "========================================"
echo "Testing Scaling Memory Extension Build"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1. Checking project structure..."
echo "-----------------------------------"
check_file "package.json"
check_file "pnpm-workspace.yaml"
check_file "tsconfig.json"
check_file ".gitignore"
check_dir "apps/extension"
check_dir "packages/shared"
echo ""

echo "2. Checking extension files..."
echo "-----------------------------------"
check_file "apps/extension/package.json"
check_file "apps/extension/manifest.json"
check_file "apps/extension/vite.config.ts"
check_file "apps/extension/tsconfig.json"
echo ""

echo "3. Checking source files..."
echo "-----------------------------------"
check_file "apps/extension/src/popup/App.tsx"
check_file "apps/extension/src/popup/index.tsx"
check_file "apps/extension/src/popup/index.html"
check_file "apps/extension/src/popup/index.css"
check_file "apps/extension/src/content/index.ts"
check_file "apps/extension/src/background/index.ts"
echo ""

echo "4. Checking shared package..."
echo "-----------------------------------"
check_file "packages/shared/package.json"
check_file "packages/shared/tsconfig.json"
check_file "packages/shared/src/types.ts"
check_file "packages/shared/src/messaging.ts"
check_file "packages/shared/src/index.ts"
echo ""

echo "5. Checking documentation..."
echo "-----------------------------------"
check_file "README.md"
check_file "apps/extension/README.md"
check_file "DEVELOPMENT.md"
check_file "VERIFICATION.md"
check_file "ACCEPTANCE_CRITERIA.md"
check_file "QUICKSTART.md"
echo ""

echo "6. Testing production build..."
echo "-----------------------------------"
echo "Cleaning previous build..."
rm -rf apps/extension/dist

echo "Running: pnpm build:extension"
if pnpm build:extension > /tmp/build-output.txt 2>&1; then
    echo -e "${GREEN}✓${NC} Build completed successfully"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Build failed"
    cat /tmp/build-output.txt
    ((TESTS_FAILED++))
fi
echo ""

echo "7. Checking build output..."
echo "-----------------------------------"
check_dir "apps/extension/dist"
check_file "apps/extension/dist/manifest.json"
check_file "apps/extension/dist/service-worker-loader.js"
check_file "apps/extension/dist/src/popup/index.html"
check_dir "apps/extension/dist/icons"
check_file "apps/extension/dist/icons/icon16.png"
check_file "apps/extension/dist/icons/icon32.png"
check_file "apps/extension/dist/icons/icon48.png"
check_file "apps/extension/dist/icons/icon128.png"
check_dir "apps/extension/dist/assets"
echo ""

echo "8. Validating manifest.json..."
echo "-----------------------------------"
if [ -f "apps/extension/dist/manifest.json" ]; then
    if grep -q '"manifest_version": 3' apps/extension/dist/manifest.json; then
        echo -e "${GREEN}✓${NC} Manifest V3 detected"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Not Manifest V3"
        ((TESTS_FAILED++))
    fi
    
    if grep -q '"name": "Scaling Memory"' apps/extension/dist/manifest.json; then
        echo -e "${GREEN}✓${NC} Extension name correct"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Extension name incorrect"
        ((TESTS_FAILED++))
    fi
fi
echo ""

echo "========================================"
echo "Test Results"
echo "========================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo ""
    echo "Status: FAILED"
    exit 1
else
    echo -e "Tests Failed: 0"
    echo ""
    echo -e "${GREEN}Status: ALL TESTS PASSED ✓${NC}"
    echo ""
    echo "Extension is ready to load in Chrome!"
    echo "Location: apps/extension/dist/"
    exit 0
fi
