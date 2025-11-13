# scaling-memory

A Chrome extension for capturing and scaling your web browsing memory.

## Project Structure

```
scaling-memory/
├── apps/
│   └── extension/       # Chrome Extension (Manifest V3)
└── packages/
    └── shared/          # Shared types and utilities
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run extension in development mode with hot reload
pnpm dev:extension
```

### Build

```bash
# Build extension for production
pnpm build:extension
```

## Extension Features

- 🎨 React-powered popup UI
- 📝 Content script for page scraping
- ⚡ Background service worker
- 💾 Chrome storage integration
- 🔄 Real-time messaging between components

## Loading the Extension

1. Run `pnpm dev:extension` or `pnpm build:extension`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `apps/extension/dist`

## Documentation

For detailed extension documentation, see [apps/extension/README.md](apps/extension/README.md)

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5 with CRXJS plugin
- **Chrome API**: Manifest V3
- **Package Manager**: pnpm workspaces

## License

MIT
