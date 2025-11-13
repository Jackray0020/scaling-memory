# Quick Start Guide

Get the Scaling Memory Chrome extension up and running in 5 minutes.

## Prerequisites

Ensure you have installed:
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

```bash
# Check versions
node --version
pnpm --version

# Install pnpm if needed
npm install -g pnpm
```

## Installation

```bash
# 1. Navigate to project
cd /home/engine/project

# 2. Install dependencies
pnpm install
```

## Development

### Option 1: Development Mode (Recommended for development)

```bash
# Start development server
pnpm dev:extension
```

**Output:**
```
VITE v5.4.21  ready in 1210 ms

B R O W S E R
E X T E N S I O N
T O O L S

➜  CRXJS: Load dist as unpacked extension
```

✅ Extension builds to `apps/extension/dist/` with hot reload

### Option 2: Production Build

```bash
# Build for production
pnpm build:extension
```

**Output:**
```
✓ built in 1.10s
```

✅ Optimized extension created in `apps/extension/dist/`

## Load Extension in Chrome

### Step 1: Open Extensions Page
- Open Chrome browser
- Navigate to: `chrome://extensions/`
- Or: Menu → Extensions → Manage Extensions

### Step 2: Enable Developer Mode
- Toggle **"Developer mode"** switch (top right corner)

### Step 3: Load Extension
- Click **"Load unpacked"** button
- Navigate to: `/home/engine/project/apps/extension/dist`
- Click **"Select Folder"**

### Step 4: Verify Installation
- ✅ "Scaling Memory" appears in extensions list
- ✅ Extension icon visible in Chrome toolbar
- ✅ No error messages

## Using the Extension

### 1. Open the Popup

Click the extension icon in Chrome toolbar

**You should see:**
- Header: "Scaling Memory"
- Current page title and URL
- "Capture Page Content" button
- Status: "Ready"

### 2. Capture Page Content

1. Navigate to any webpage
2. Click extension icon
3. Click **"Capture Page Content"** button

**Expected behavior:**
- Button text changes to "Capturing..."
- Status updates to "Content captured successfully!"

### 3. Verify Logging

#### Check Page Console (Content Script)

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for:
   ```
   [Scaling Memory] Content script loaded
   [Scaling Memory] Page scraper hooks active
   [Content Script] Received message: CAPTURE_PAGE_CONTENT
   [Content Script] Page content captured: {...}
   ```

#### Check Background Console (Service Worker)

1. Go to `chrome://extensions/`
2. Find "Scaling Memory"
3. Click **"service worker"** link
4. Look for:
   ```
   [Scaling Memory] Background service worker initialized
   [Background] Content captured: {...}
   [Background] Content saved to storage. Total pages: 1
   ```

#### Check Popup Console (Optional)

1. Click extension icon
2. Right-click popup window
3. Select **"Inspect"**
4. DevTools opens for popup

## Verify Storage

In the service worker console, run:

```javascript
chrome.storage.local.get(['capturedPages'], (result) => {
  console.log('Captured pages:', result.capturedPages);
});
```

You should see array with captured page data.

## Reload After Changes

### During Development (with `pnpm dev:extension`):

- **Popup changes**: Auto-reload via HMR ✨
- **Content/Background changes**: 
  1. Go to `chrome://extensions/`
  2. Click reload icon on extension
  3. Refresh webpage

### After Production Build:

1. Run `pnpm build:extension`
2. Go to `chrome://extensions/`
3. Click reload icon on extension

## Troubleshooting

### Extension Won't Load

**Error:** "Manifest file is invalid"
- ✅ Ensure you selected the `dist/` folder, not source
- ✅ Run `pnpm build:extension` first

**Error:** "Could not load extension"
- ✅ Check for errors in `chrome://extensions/`
- ✅ Clear dist and rebuild: `rm -rf apps/extension/dist && pnpm build:extension`

### Content Script Not Working

**No console logs appear:**
- ✅ Refresh the webpage after loading extension
- ✅ Check URL matches patterns (should work on all pages)
- ✅ Look for errors in page console

### Messages Not Sending

**Button click does nothing:**
- ✅ Check popup console for errors (right-click popup → Inspect)
- ✅ Verify content script is injected (check page console)
- ✅ Ensure service worker is running (check `chrome://extensions/`)

### Build Fails

**Error:** "Command not found"
```bash
# Reinstall dependencies
pnpm install --force
```

**Error:** "Cannot find module"
```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## File Locations

- **Extension source**: `apps/extension/src/`
- **Built extension**: `apps/extension/dist/`
- **Shared types**: `packages/shared/src/`
- **Documentation**: `README.md`, `DEVELOPMENT.md`

## Common Commands

```bash
# Install
pnpm install

# Dev mode (watch)
pnpm dev:extension

# Production build
pnpm build:extension

# Clean build
rm -rf apps/extension/dist

# Clean everything
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## Next Steps

Now that your extension is running:

1. 📖 Read [DEVELOPMENT.md](DEVELOPMENT.md) for detailed dev guide
2. ✅ Check [VERIFICATION.md](VERIFICATION.md) for full test checklist
3. 🎨 Customize the popup UI in `apps/extension/src/popup/`
4. 📝 Enhance page scraping in `apps/extension/src/content/`
5. 🔧 Add features to background worker

## Support

- **Documentation**: See `README.md` and `DEVELOPMENT.md`
- **Testing Guide**: See `VERIFICATION.md`
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/

---

**Success!** 🎉 Your extension is now running. Start capturing web page content!
