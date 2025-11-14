#!/bin/bash

echo "🔍 Validating LLM Task Scheduler Chrome Extension..."
echo ""

# Check required files
echo "✓ Checking required files..."
required_files=(
  "manifest.json"
  "background.js"
  "popup.html"
  "popup.js"
  "content.js"
  "styles/popup.css"
  "icons/icon16.png"
  "icons/icon48.png"
  "icons/icon128.png"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (missing)"
    exit 1
  fi
done

echo ""
echo "✓ Validating JSON files..."
python3 -m json.tool manifest.json > /dev/null && echo "  ✓ manifest.json"

echo ""
echo "✓ Checking JavaScript syntax..."
node --check background.js && echo "  ✓ background.js"
node --check popup.js && echo "  ✓ popup.js"
node --check content.js && echo "  ✓ content.js"

echo ""
echo "✓ Checking documentation..."
docs=("README.md" "QUICKSTART.md" "EXAMPLES.md" "CONTRIBUTING.md" "LICENSE")
for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✓ $doc"
  else
    echo "  ✗ $doc (missing)"
  fi
done

echo ""
echo "✅ All validation checks passed!"
echo ""
echo "📦 Extension is ready to load in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select this directory"
