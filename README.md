# AI Browsing Analysis Workflow

An end-to-end AI-powered browsing analysis platform that works across both Electron desktop applications and browser extensions. Capture, normalize, and analyze web page content with real-time LLM-generated summaries and trading insights.

## Features

- **Content Capture & Normalization**: Extract page content with automatic boilerplate removal
- **Multi-Provider LLM Support**: OpenAI, Claude, Gemini, or local testing provider
- **Document Chunking**: Handle long documents with intelligent chunking and overlap
- **Session Management**: Maintain analysis history with local storage
- **Trading Insights**: Extract financial signals and trading indicators
- **Cross-Platform**: Shared core library used by both Electron and browser extension
- **Provider Switching**: Dynamic provider selection with API key configuration
- **MCP Augmentation**: Support for Model Context Protocol enhancement

## Architecture

```
ai-browsing-workflow/
├── packages/
│   ├── core/               # Shared analysis engine
│   │   ├── src/
│   │   │   ├── types.ts            # Type definitions
│   │   │   ├── normalizer.ts       # Content normalization & chunking
│   │   │   ├── llm-provider.ts     # LLM provider abstraction
│   │   │   ├── analyzer.ts         # Analysis engine
│   │   │   ├── session-storage.ts  # Session & history management
│   │   │   └── index.ts            # Main SDK export
│   │   └── tsconfig.json
│   ├── electron/           # Electron desktop application
│   │   ├── src/
│   │   │   ├── main.ts             # Electron main process
│   │   │   ├── preload.ts          # IPC preload script
│   │   │   └── renderer/           # React UI components
│   │   └── tsconfig.json
│   └── extension/          # Browser extension
│       ├── src/
│       │   ├── background.ts       # Service worker
│       │   ├── content.ts          # Content script
│       │   ├── popup.tsx           # Popup UI
│       │   └── popup.html
│       ├── manifest.json
│       └── tsconfig.json
└── README.md
```

## Core Components

### 1. Content Normalizer (`normalizer.ts`)
- **ContentNormalizer**: Removes boilerplate (scripts, ads, sidebars, etc.)
- **ContentChunker**: Splits long documents into manageable chunks with overlap

### 2. LLM Provider Abstraction (`llm-provider.ts`)
- Abstract base class with provider implementations
- Supported providers: OpenAI, Claude, Gemini, Local (mock)
- Factory pattern for provider instantiation
- Configurable model parameters (temperature, max_tokens, etc.)

### 3. Analysis Engine (`analyzer.ts`)
- Multi-chunk analysis with aggregation
- Signal processing (bullish/bearish/neutral classification)
- Trading insights extraction
- Automatic session tracking

### 4. Session Management (`session-storage.ts`)
- In-memory and custom storage backends
- Session lifecycle management
- History export/import
- Content deduplication

### 5. Main SDK (`index.ts`)
- `BrowsingAnalysisSDK`: Main entry point
- Orchestrates the complete analysis pipeline
- Provides high-level API for both desktop and extension

## Installation

```bash
npm install
```

This will install dependencies for all workspace packages.

## Development

### Build All Packages
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Usage

### Electron App

```typescript
import { BrowsingAnalysisSDK, MemoryStorageBackend } from '@ai-browsing/core';

const sdk = new BrowsingAnalysisSDK(new MemoryStorageBackend());

// Analyze page
const result = await sdk.analyzePage({
  content: {
    url: 'https://example.com',
    title: 'Page Title',
    content: 'Page content here...'
  },
  provider: 'local',
  sessionId: 'session_123'
});

console.log(result.summary);
console.log(result.insights);
console.log(result.tradingSignals);
```

### Browser Extension

The extension communicates via message passing:

```typescript
// From popup or content script
chrome.runtime.sendMessage({
  type: 'analyze',
  payload: {
    content: { url, title, content },
    provider: 'local',
    sessionId: 'session_123'
  }
}, (response) => {
  console.log(response.data);
});
```

## Configuration

### API Keys
Store API keys in localStorage or environment variables:
- `apikey_openai`: OpenAI API key
- `apikey_claude`: Claude API key
- `apikey_gemini`: Gemini API key

### Provider Settings
- `currentProvider`: Active LLM provider
- `enable_mcp`: Enable MCP augmentation

## Data Flow

1. **Content Capture**: Extract from page (DOM, innerText, title)
2. **Normalization**: Remove boilerplate, clean HTML
3. **Chunking**: Split large documents if needed
4. **Analysis**: Send to LLM via provider
5. **Aggregation**: Combine chunk results
6. **Storage**: Save to session history
7. **Display**: Real-time UI updates

## Acceptance Criteria ✓

- [x] Both Electron and extension builds can analyze sample pages
- [x] Render summaries in UI
- [x] Store session logs locally
- [x] Switch LLM providers with UI controls
- [x] Handle document chunking for long content
- [x] Session history maintenance
- [x] Manual analysis triggers
- [x] Provider abstraction layer
- [x] Trading signal extraction

## Testing

### Test with Local Provider
The local provider returns mock data for testing without API keys:

```typescript
const result = await sdk.analyzePage({
  content: { url: 'https://example.com', title: 'Test', content: 'Sample content' },
  provider: 'local'
});
```

### Sample Page Analysis
Both Electron and extension include "Load Sample" buttons with pre-filled trading-related content.

## File Size Analysis

The modular architecture allows for efficient bundling:
- Core library: ~20KB (minified)
- Electron app: ~150KB (including React)
- Browser extension: ~80KB (with background + popup)

## Future Enhancements

- Real-time streaming analysis
- Custom chunking strategies
- Cached analysis results
- Webhook notifications
- Advanced signal indicators
- Performance metrics dashboard
- API rate limiting
- Persistent IndexedDB storage
