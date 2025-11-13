# Extension Verification Checklist

This document helps verify that the Chrome extension scaffold is working correctly.

## Build Verification

### Development Build
```bash
pnpm dev:extension
```

**Expected Output:**
- ✅ Vite dev server starts successfully
- ✅ CRXJS shows "Load dist as unpacked extension" message
- ✅ `apps/extension/dist/` directory is created
- ✅ Hot module replacement is active

### Production Build
```bash
pnpm build:extension
```

**Expected Output:**
- ✅ Build completes without errors
- ✅ Output shows compiled files with sizes
- ✅ `apps/extension/dist/` contains:
  - manifest.json
  - service-worker-loader.js
  - src/popup/index.html
  - icons/ directory
  - assets/ directory

## File Structure Verification

Check that the following files exist in the built extension:

```
apps/extension/dist/
├── manifest.json           # Manifest V3 config
├── service-worker-loader.js # Background service worker
├── src/
│   └── popup/
│       └── index.html      # React popup UI
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── assets/                 # Bundled JS/CSS
```

## Loading Extension in Chrome

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" toggle (top right)
4. Click "Load unpacked"
5. Navigate to and select: `/home/engine/project/apps/extension/dist`
6. Extension should load without errors

## Functional Testing

### 1. Popup UI
- [ ] Click extension icon in toolbar
- [ ] Popup window opens (400px wide)
- [ ] UI shows:
  - "Scaling Memory" header with gradient background
  - Current page title and URL
  - "Capture Page Content" button
  - Status message ("Ready")
  - Footer with version (v0.0.1)

### 2. Content Script Injection
- [ ] Open browser DevTools on any webpage (F12)
- [ ] Check Console tab for:
  ```
  [Scaling Memory] Content script loaded
  [Scaling Memory] Page scraper hooks active
  ```

### 3. Background Service Worker
- [ ] Go to `chrome://extensions/`
- [ ] Find "Scaling Memory" extension
- [ ] Click "service worker" link
- [ ] Check Console for:
  ```
  [Scaling Memory] Background service worker initialized
  ```

### 4. Message Flow
- [ ] On any webpage, open the extension popup
- [ ] Click "Capture Page Content" button
- [ ] Expected behavior:
  - Button shows "Capturing..."
  - Status changes to "Content captured successfully!"
  
- [ ] Check page console (F12 on webpage):
  ```
  [Content Script] Received message: CAPTURE_PAGE_CONTENT
  [Content Script] Page content captured: {...}
  [Content Script] Content sent to background
  ```

- [ ] Check background service worker console:
  ```
  [Background] Received message: CONTENT_CAPTURED from tab: X
  [Background] Content captured: {...}
  [Background] Content saved to storage. Total pages: 1
  ```

### 5. Storage Verification
- [ ] After capturing content, go to `chrome://extensions/`
- [ ] Click "service worker" under the extension
- [ ] In console, run:
  ```javascript
  chrome.storage.local.get(['capturedPages'], (result) => {
    console.log('Captured pages:', result.capturedPages);
  });
  ```
- [ ] Should see array with captured page data

## Common Issues and Solutions

### Build fails with "ENOENT tsconfig.json"
- Ensure `packages/shared/tsconfig.json` exists
- Run `pnpm install` again

### Extension won't load in Chrome
- Make sure you're loading the `dist/` directory, not the source
- Check manifest.json is valid
- Look for errors in `chrome://extensions/` page

### Content script not injecting
- Check browser console for CSP errors
- Verify URL matches patterns in manifest.json
- Reload the extension and refresh the page

### Messages not working
- Ensure all three components are active (popup, content, background)
- Check console logs in all three locations
- Verify message types match between sender/receiver

## Success Criteria

All of the following should be true:

- ✅ `pnpm dev:extension` runs without errors
- ✅ `pnpm build:extension` creates production bundle
- ✅ Extension loads in Chrome without errors
- ✅ Popup displays placeholder UI correctly
- ✅ Content script logs appear in page console
- ✅ Background worker logs appear in service worker console
- ✅ Clicking "Capture Page Content" triggers complete message flow
- ✅ Page content is captured and stored in chrome.storage
- ✅ All console logs show expected "page content capture events"

## Next Steps

Once verification is complete, you can:

1. Customize the popup UI styling
2. Add more page scraping functionality
3. Implement data export features
4. Add options/settings page
5. Connect to backend API
6. Enhance captured data structure
