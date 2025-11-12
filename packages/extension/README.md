# @ai-browsing/extension

Browser extension for AI-powered browsing analysis. Works with Chromium-based browsers (Chrome, Edge, Brave, etc.).

## Features

- Analyze current page with a single click
- Popup UI with instant results
- Session management in extension storage
- Real-time trading signals
- Provider switching
- Lightweight and fast

## Installation

### Development

1. Build the extension:
```bash
npm run build
```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` directory

### Production

Package the `dist/` directory as a ZIP file for distribution.

## Project Structure

```
src/
├── background.ts     # Service worker - main extension logic
├── content.ts        # Content script - page interaction
├── popup.tsx         # Popup UI component
├── popup.html        # Popup HTML template
├── popup.css         # Popup styles
manifest.json         # Extension manifest
webpack.config.js     # Webpack configuration
```

## Components

### Background Service Worker (`background.ts`)

The main extension logic running in the background:
- Handles IPC messages from popup and content scripts
- Manages SDK instance
- Processes analysis requests
- Manages sessions

**Message types handled:**
- `analyze`: Analyze page content
- `get-session`: Retrieve session history
- `list-sessions`: List all sessions
- `create-session`: Create new session
- `clear-session`: Delete session

### Content Script (`content.ts`)

Runs on every page to extract content:
- Extracts page HTML, text, URL, and title
- Handles text selection extraction
- Responds to content extraction requests

**Message types handled:**
- `get-page-content`: Extract full page content
- `extract-selected`: Extract selected text

### Popup UI (`popup.tsx`)

Compact popup interface:
- Analyze Page button
- Settings toggle
- Real-time results display
- Session list with entry counts
- Provider selection dropdown

## Usage Flow

1. User clicks extension icon → Popup opens
2. User clicks "Analyze Page" button
3. Content script extracts page content
4. Background service worker runs analysis
5. Results displayed in popup UI
6. Session saved to storage
7. User can view previous sessions

## Manifest Configuration

Key permissions requested:
- `activeTab`: Access current tab
- `scripting`: Inject content script
- `storage`: Save session data
- `webRequest`: Monitor requests
- `<all_urls>`: Analyze any page

## API Communication

### From Popup to Background

```typescript
// Analyze current page
chrome.runtime.sendMessage({
  type: 'analyze',
  payload: {
    content: { url, title, content },
    provider: 'openai',
    sessionId: 'session_123'
  }
}, (response) => {
  console.log(response.data);
});
```

### From Popup to Content Script

```typescript
// Get page content
chrome.tabs.sendMessage(tabId, {
  type: 'get-page-content'
}, (response) => {
  console.log(response.data);
});
```

## Storage

Uses Chrome's storage API (via SDK's MemoryStorageBackend):
- Sessions stored in memory during extension runtime
- Can be upgraded to chrome.storage.local for persistence
- Supports export/import functionality

## Configuration

### Provider Settings

Settings are stored in extension storage:
- `currentProvider`: Active LLM provider
- `apikey_openai`: OpenAI API key
- `apikey_claude`: Claude API key
- `apikey_gemini`: Gemini API key
- `enable_mcp`: MCP augmentation flag

### Popup Size

```css
.popup {
  width: 400px;
  max-height: 600px;
}
```

## Security

- Content Security Policy: Restricts external scripts
- Context isolation: Popup runs in isolated context
- Message validation: All IPC messages validated
- No inline scripts: All scripts external
- Minimal permissions: Only required permissions requested

## Performance

- Lightweight popup (~50KB minified)
- Fast page extraction with content script
- Efficient message passing
- Smart caching with sessions
- Low CPU/memory footprint

## Building

### Development Build

```bash
npm run dev
```

Watches for changes and rebuilds automatically.

### Production Build

```bash
npm run build
```

Optimized build for distribution.

### Type Checking

```bash
npm run type-check
```

## Testing

### Test with Local Provider

1. Keep provider set to "local" (default)
2. Click "Analyze Page" on any website
3. See mock results appear

### Test with Real API

1. Set provider to "openai", "claude", or "gemini"
2. Configure API key in settings
3. Click "Analyze Page"
4. Real analysis results appear

## Debugging

### View Console Logs

1. Go to `chrome://extensions/`
2. Find "AI Browsing Analyzer"
3. Click "Details"
4. Click "Errors" or open DevTools

### Inspect Popup

1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup context

### Inspect Content Script

1. Open page DevTools (F12)
2. Messages from content script appear in console

## Chrome Web Store Submission

Requirements:
- Privacy policy
- Detailed description
- Screenshots (1280x800)
- Icons (128x128, 48x48, 16x16)
- Source code disclosure

## Future Enhancements

- Keyboard shortcuts (Ctrl+Shift+A)
- Right-click context menu
- Persistent IndexedDB storage
- Sync across devices
- Notifications for important signals
- History search and filtering
- Batch analysis mode
- Export to CSV/JSON
