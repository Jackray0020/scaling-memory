# Development Guide

This guide provides detailed information for developing the Scaling Memory Chrome extension.

## Project Overview

This is a monorepo using pnpm workspaces with the following structure:

```
scaling-memory/
├── apps/
│   └── extension/         # Chrome Extension (MV3)
├── packages/
│   └── shared/            # Shared types and utilities
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm workspace definition
```

## Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Browser**: Chrome/Edge (Chromium-based)

## Installation

```bash
# Clone repository
git clone <repo-url>
cd scaling-memory

# Install dependencies
pnpm install
```

## Development Workflow

### Starting Development Server

```bash
# From project root
pnpm dev:extension

# Or from apps/extension directory
cd apps/extension
pnpm dev
```

This starts Vite with:
- Hot Module Replacement (HMR)
- Fast refresh for React
- Watch mode for file changes
- CRXJS extension development mode

### Loading in Browser

1. Run `pnpm dev:extension`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `apps/extension/dist`
6. Extension loads with live reload

### Making Changes

**Popup UI (React)**
- Edit files in `apps/extension/src/popup/`
- Changes auto-reload via HMR
- Check popup DevTools for errors

**Content Script**
- Edit `apps/extension/src/content/index.ts`
- Reload extension after changes
- Refresh webpage to see updates
- Check page console for logs

**Background Service Worker**
- Edit `apps/extension/src/background/index.ts`
- Reload extension after changes
- Click "service worker" in extensions page to see logs

**Shared Package**
- Edit files in `packages/shared/src/`
- Both content and background can import these
- Changes require extension reload

## Building for Production

```bash
# From project root
pnpm build:extension

# Or from apps/extension
cd apps/extension
pnpm build
```

Output: `apps/extension/dist/` (optimized bundle)

## Project Structure Details

### Extension App (`apps/extension/`)

```
apps/extension/
├── src/
│   ├── popup/              # React popup UI
│   │   ├── App.tsx         # Main component
│   │   ├── index.tsx       # React entry point
│   │   ├── index.html      # HTML template
│   │   └── index.css       # Styles
│   ├── content/            # Content script
│   │   └── index.ts        # Page interaction logic
│   ├── background/         # Service worker
│   │   └── index.ts        # Background tasks
│   └── shared/             # Extension-specific utilities
├── public/
│   └── icons/              # Extension icons
├── manifest.json           # Chrome extension manifest
├── vite.config.ts          # Vite + CRXJS config
├── tsconfig.json           # TypeScript config
└── package.json
```

### Shared Package (`packages/shared/`)

```
packages/shared/
├── src/
│   ├── types.ts            # Shared TypeScript types
│   ├── messaging.ts        # Message utilities
│   └── index.ts            # Public API
├── tsconfig.json
└── package.json
```

## Tech Stack

### Build Tools
- **Vite**: Fast build tool with HMR
- **CRXJS**: Vite plugin for Chrome extensions
- **TypeScript**: Type safety
- **pnpm**: Fast, efficient package manager

### Frontend
- **React 18**: UI framework
- **React DOM**: DOM rendering

### Chrome APIs
- **chrome.runtime**: Messaging
- **chrome.tabs**: Tab management
- **chrome.storage**: Data persistence
- **chrome.scripting**: Dynamic injection

## Messaging Architecture

The extension uses Chrome's message passing API:

### Message Flow

```
┌──────────┐      Message      ┌──────────────┐
│  Popup   │ ───────────────→  │   Content    │
│  (React) │                    │   Script     │
└──────────┘                    └──────────────┘
     │                                │
     │                                │
     │         Message                │
     └─────────────→  ┌────────────┐ │
                      │ Background │←┘
                      │  Service   │
                      │  Worker    │
                      └────────────┘
                            │
                            ↓
                     chrome.storage
```

### Message Types

Defined in `packages/shared/src/types.ts`:

- `CAPTURE_PAGE_CONTENT`: Trigger content capture
- `CONTENT_CAPTURED`: Send captured data to background
- `GET_PAGE_INFO`: Request current page info
- `PAGE_INFO_RESPONSE`: Return page info

### Sending Messages

**From Popup to Content Script:**
```typescript
import { sendMessageToTab, createMessage, MessageType } from '@scaling-memory/shared';

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
await sendMessageToTab(tab.id, createMessage(MessageType.CAPTURE_PAGE_CONTENT));
```

**From Content to Background:**
```typescript
import { sendMessageToBackground, createMessage, MessageType } from '@scaling-memory/shared';

await sendMessageToBackground(
  createMessage(MessageType.CONTENT_CAPTURED, pageData)
);
```

**Receiving Messages:**
```typescript
import { onMessage } from '@scaling-memory/shared';

onMessage((message, sender, sendResponse) => {
  switch (message.type) {
    case MessageType.CAPTURE_PAGE_CONTENT:
      // Handle message
      sendResponse({ success: true });
      break;
  }
});
```

## Chrome Storage

### Saving Data

```typescript
chrome.storage.local.set({ key: value }, () => {
  console.log('Data saved');
});
```

### Reading Data

```typescript
chrome.storage.local.get(['key'], (result) => {
  console.log('Data:', result.key);
});
```

### Current Implementation

Captured pages are stored as:
```typescript
{
  capturedPages: [
    {
      url: string,
      title: string,
      textContent: string,
      html: string,
      metadata: {...},
      capturedAt: number
    }
  ]
}
```

## Debugging

### Popup UI
1. Click extension icon
2. Right-click popup
3. Select "Inspect"
4. DevTools opens for popup

### Content Script
1. Open webpage
2. Press F12 for DevTools
3. Check Console tab
4. Look for `[Scaling Memory]` logs

### Background Service Worker
1. Go to `chrome://extensions/`
2. Find extension
3. Click "service worker" link
4. Service worker console opens

### Common Debug Commands

**Check storage:**
```javascript
chrome.storage.local.get(null, (data) => console.log(data));
```

**Clear storage:**
```javascript
chrome.storage.local.clear(() => console.log('Storage cleared'));
```

**Get active tab:**
```javascript
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  console.log('Active tab:', tabs[0]);
});
```

## Adding Features

### Adding a New Message Type

1. **Define type** in `packages/shared/src/types.ts`:
   ```typescript
   export enum MessageType {
     // ... existing
     NEW_MESSAGE_TYPE = 'NEW_MESSAGE_TYPE',
   }
   ```

2. **Handle in content script** (`apps/extension/src/content/index.ts`):
   ```typescript
   onMessage((message, sender, sendResponse) => {
     switch (message.type) {
       case MessageType.NEW_MESSAGE_TYPE:
         // Handle message
         break;
     }
   });
   ```

3. **Send from popup** (`apps/extension/src/popup/App.tsx`):
   ```typescript
   const handleAction = async () => {
     const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
     await sendMessageToTab(
       tab.id,
       createMessage(MessageType.NEW_MESSAGE_TYPE, data)
     );
   };
   ```

### Adding Popup UI Components

1. Create component in `apps/extension/src/popup/`
2. Import in `App.tsx`
3. Add styles to `index.css`
4. Changes auto-reload via HMR

### Modifying Page Scraping

Edit `apps/extension/src/content/index.ts`:

```typescript
function extractPageContent(): PageContent {
  // Add new extraction logic
  const newData = document.querySelector('.my-selector');
  
  return {
    // ... existing fields
    newField: newData?.textContent,
  };
}
```

Update types in `packages/shared/src/types.ts`.

## Performance Tips

1. **Minimize content script work**: Heavy processing → background
2. **Use chrome.storage carefully**: Limit writes, batch when possible
3. **Debounce user actions**: Avoid excessive message passing
4. **Lazy load components**: Use React.lazy for large components
5. **Optimize bundle size**: Check build output sizes

## Security Considerations

1. **Content Security Policy**: Manifest V3 enforces strict CSP
2. **No eval()**: Cannot use eval or Function constructor
3. **No remote code**: All code must be in extension package
4. **Sanitize content**: Be careful with innerHTML/dangerouslySetInnerHTML
5. **Permissions**: Request minimal permissions needed

## Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Content script injects on pages
- [ ] Messages flow correctly
- [ ] Storage works properly
- [ ] No console errors

### Testing on Different Pages
- Regular webpages (http/https)
- Chrome internal pages (chrome://)
- File URLs (file://)
- Different domains

## Troubleshooting

### Extension won't load
- Check manifest.json syntax
- Verify all referenced files exist
- Look for errors in chrome://extensions/

### Content script not working
- Check URL matches in manifest.json
- Verify script injection in DevTools → Sources
- Check for CSP violations

### Messages not sending
- Verify sender/receiver are both active
- Check message types match
- Look for async/await issues
- Ensure sendResponse is called

### Build fails
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear dist: `rm -rf apps/extension/dist`
- Check TypeScript errors
- Verify tsconfig.json files exist

## Useful Commands

```bash
# Install dependencies
pnpm install

# Dev mode
pnpm dev:extension

# Production build
pnpm build:extension

# Clean build artifacts
rm -rf apps/extension/dist

# Clean all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstall everything
pnpm install --force

# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update
```

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
