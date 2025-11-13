# Scaling Memory - Chrome Extension

A Chrome extension (Manifest V3) for capturing and scaling your web browsing memory with React-powered UI.

## Features

- 🎨 React-powered popup UI
- 📝 Content script for page scraping
- ⚡ Background service worker for message handling
- 💾 Chrome storage integration
- 🔄 Real-time messaging between components

## Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# From the project root
pnpm install
```

### Running in Development Mode

```bash
# From the project root
pnpm dev:extension

# Or from this directory
pnpm dev
```

This will start Vite in watch mode and build the extension with hot module replacement.

### Building for Production

```bash
# From the project root
pnpm build:extension

# Or from this directory
pnpm build
```

The production bundle will be output to the `dist/` directory.

## Loading the Extension in Chrome

### Development Mode

1. Run `pnpm dev:extension` to start the development server
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `apps/extension/dist` directory
6. The extension should now appear in your extensions list

### Production Build

1. Run `pnpm build:extension` to create production bundle
2. Follow steps 2-6 from Development Mode above

## Usage

1. Click the extension icon in your Chrome toolbar
2. The popup will display the current page information
3. Click "Capture Page Content" to capture the current page
4. Check the console logs to see the capture events:
   - Content script logs: Open DevTools on the page
   - Background script logs: Go to `chrome://extensions/`, click "service worker" under the extension
   - Popup logs: Right-click popup and select "Inspect"

## Architecture

```
apps/extension/
├── src/
│   ├── popup/           # React popup UI
│   │   ├── App.tsx      # Main popup component
│   │   ├── index.tsx    # React entry point
│   │   ├── index.html   # Popup HTML
│   │   └── index.css    # Popup styles
│   ├── content/         # Content script
│   │   └── index.ts     # Page scraper and message handler
│   ├── background/      # Background service worker
│   │   └── index.ts     # Message router and storage handler
│   └── shared/          # Shared utilities (if needed)
├── public/
│   └── icons/           # Extension icons
├── manifest.json        # Manifest V3 configuration
├── vite.config.ts       # Vite + CRXJS configuration
└── package.json
```

## Messaging Flow

1. **Popup → Content Script**: User clicks "Capture Page Content"
   - Popup sends `CAPTURE_PAGE_CONTENT` message to content script
   
2. **Content Script → Background**: Content script extracts page data
   - Sends `CONTENT_CAPTURED` message to background with page content
   
3. **Background**: Stores captured content
   - Saves to `chrome.storage.local`
   - Logs capture event

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Extension Plugin**: @crxjs/vite-plugin
- **Chrome API**: Manifest V3
- **Package Manager**: pnpm (workspace)

## Shared Package

The extension uses `@scaling-memory/shared` package for:
- Type definitions (`MessageType`, `PageContent`, `PageInfo`)
- Messaging utilities
- API stubs for future backend integration

## Console Output

When the extension is working correctly, you should see:

**Content Script (page console)**:
```
[Scaling Memory] Content script loaded
[Scaling Memory] Page scraper hooks active
[Content Script] Received message: CAPTURE_PAGE_CONTENT
[Content Script] Page content captured: {...}
```

**Background Script (service worker console)**:
```
[Scaling Memory] Background service worker initialized
[Background] Content captured: {...}
[Background] Content saved to storage
```

## Troubleshooting

### Extension not loading
- Make sure you've run `pnpm dev:extension` or `pnpm build:extension` first
- Check that the `dist/` directory exists
- Verify manifest.json is valid

### Content script not injecting
- Check that the page URL matches the patterns in manifest.json
- Look for errors in the page console
- Verify permissions in manifest.json

### Messages not being received
- Check all three consoles (popup, content, background)
- Ensure the message types match between sender and receiver
- Verify the messaging flow in the code

## Future Enhancements

- [ ] Options page for configuration
- [ ] History view of captured pages
- [ ] Search and filter functionality
- [ ] Export captured data
- [ ] Backend API integration
- [ ] Advanced scraping options
