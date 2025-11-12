# Architecture Overview

## System Design

The AI Browsing Workflow is built as a monorepo with three coordinated packages:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├──────────────────────────┬──────────────────────────────────┤
│   Electron Desktop       │   Browser Extension              │
│   ├── Main Process       │   ├── Service Worker             │
│   ├── React UI           │   ├── Content Script             │
│   └── IPC Bridge         │   └── Popup UI                   │
├──────────────────────────┴──────────────────────────────────┤
│                      Core Engine (@ai-browsing/core)        │
├──────────────────────────────────────────────────────────────┤
│  BrowsingAnalysisSDK                                         │
│  ├── ContentNormalizer (Boilerplate Removal)                │
│  ├── ContentChunker (Large Doc Handling)                    │
│  ├── BrowsingAnalyzer (Analysis Pipeline)                  │
│  ├── LLMProviderFactory (Multi-Provider Support)           │
│  └── SessionManager (History & Storage)                    │
├──────────────────────────────────────────────────────────────┤
│                      LLM Provider Layer                      │
├──────┬────────────┬────────────┬─────────────────────────────┤
│OpenAI│  Claude    │   Gemini   │     Local (Mock)            │
├──────┴────────────┴────────────┴─────────────────────────────┤
│                      External APIs                           │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Content Capture Phase

```
User Action (Click Button)
    ↓
Extract Page Content
    ├─ URL
    ├─ Title
    ├─ HTML/Text
    └─ Metadata
    ↓
Normalize Content
    ├─ Remove Boilerplate
    ├─ Clean HTML
    ├─ Extract Text
    └─ Validate Length
    ↓
Check Size
    ├─ Small (<4KB): Direct Analysis
    └─ Large (>4KB): Chunk Content
```

### 2. Analysis Phase

```
Normalized Content
    ↓
Provider Factory
    ├─ Detect Provider
    ├─ Load Config
    └─ Create Instance
    ↓
Chunked Analysis (if needed)
    ├─ Process Chunk 1 → LLM
    ├─ Process Chunk 2 → LLM
    ├─ Process Chunk N → LLM
    └─ Aggregate Results
    ↓
Extract Signals
    ├─ Parse JSON Response
    ├─ Classify Sentiment
    └─ Calculate Confidence
    ↓
Session Storage
    ├─ Save Result
    ├─ Track History
    └─ Deduplicate
```

### 3. Display Phase

```
Analysis Result
    ↓
UI Rendering
    ├─ Summary Display
    ├─ Insights List
    ├─ Trading Signals
    └─ Metadata
    ↓
Session Management
    ├─ Show History
    ├─ Enable Export
    └─ Allow Deletion
```

## Component Architecture

### Core Package (`packages/core/src/`)

#### `types.ts` - Type System
- **PageContent**: Raw extracted content
- **NormalizedContent**: Cleaned and validated content
- **AnalysisRequest**: Request payload with provider config
- **AnalysisResult**: Complete analysis output
- **TradingSignal**: Individual signal with type/confidence
- **SessionHistory**: Persisted session data

#### `normalizer.ts` - Content Processing
- **ContentNormalizer**
  - Removes boilerplate elements
  - Cleans HTML tags
  - Validates content quality
  - Generates content hash for deduplication

- **ContentChunker**
  - Splits content into manageable chunks
  - Maintains overlap for context preservation
  - Recommends chunk size based on content length
  - Returns indexed chunks with offsets

#### `llm-provider.ts` - LLM Abstraction
- **LLMProviderBase** (Abstract)
  - Defines interface for all providers
  - Builds system prompts
  - Parses responses

- **OpenAIProvider**: Integrates with OpenAI API
- **ClaudeProvider**: Integrates with Anthropic API
- **GeminiProvider**: Integrates with Google API
- **LocalProvider**: Mock provider for testing

- **LLMProviderFactory**: Creates provider instances

#### `analyzer.ts` - Analysis Engine
- **BrowsingAnalyzer**
  - Orchestrates analysis pipeline
  - Handles chunk processing
  - Aggregates multi-chunk results
  - Extracts and normalizes signals
  - Generates unique session IDs

#### `session-storage.ts` - Persistence
- **StorageBackend** (Interface)
  - Abstract storage operations
  - Enables custom implementations

- **MemoryStorageBackend**
  - In-memory key-value storage
  - Fast access, session-scoped
  - Used by default

- **SessionManager**
  - Creates sessions
  - Manages entries
  - Exports/imports data
  - Queries by provider
  - Deduplicates content

#### `index.ts` - Public API
- **BrowsingAnalysisSDK**
  - Main entry point
  - Coordinates full pipeline
  - Provides high-level API

### Electron Package (`packages/electron/src/`)

#### `main.ts` - Main Process
- Manages application window
- Implements IPC handlers
- Manages SDK instance
- Returns results to renderer

#### `preload.ts` - IPC Bridge
- Secures context isolation
- Exposes `window.browsing` API
- Type-safe IPC communication

#### `renderer/` - UI Layer
- **App.tsx**: Root component, state management
- **AnalysisPanel.tsx**: Content input and results
- **SessionPanel.tsx**: Session history view
- **ProviderSettings.tsx**: Configuration modal

### Extension Package (`packages/extension/src/`)

#### `background.ts` - Service Worker
- Handles all IPC messages
- Manages SDK instance
- Routes analysis requests
- Returns results to popup/content

#### `content.ts` - Content Script
- Runs on every page
- Extracts page content
- Responds to extraction requests
- Injects data helper functions

#### `popup.tsx` - Popup UI
- Single-page popup interface
- Displays analysis results
- Session management
- Provider selection

## Key Design Patterns

### 1. Factory Pattern (LLM Providers)
```typescript
const provider = LLMProviderFactory.createProvider(config);
// Returns appropriate provider instance based on config.provider
```

### 2. Strategy Pattern (Content Processing)
```typescript
// Different strategies for different content sizes
if (content.length < CHUNK_SIZE) {
  // Direct analysis
} else {
  // Chunk and aggregate
}
```

### 3. Bridge Pattern (Storage)
```typescript
// Pluggable storage backends
const backend = new CustomBackend();
const manager = new SessionManager(backend);
```

### 4. Observer Pattern (IPC Communication)
```typescript
// Main process listens for messages
ipcMain.handle('analyze-page', handler);
// Renderer process sends request
window.browsing.analyzePage(request);
```

## Data Models

### AnalysisRequest → AnalysisResult Flow

```typescript
// INPUT
{
  content: {
    url: string,
    title: string,
    content: string
  },
  provider: 'openai' | 'claude' | 'gemini' | 'local',
  config?: LLMConfig,
  sessionId?: string
}

// PROCESSING
1. Normalize content (remove boilerplate)
2. Chunk if needed (content > 4KB)
3. For each chunk:
   - Send to LLM provider
   - Parse response
   - Extract signals
4. Aggregate results
5. Store in session

// OUTPUT
{
  sessionId: string,
  url: string,
  title: string,
  summary: string,
  insights: string[],
  tradingSignals: [{
    type: 'bullish' | 'bearish' | 'neutral',
    confidence: 0-1,
    description: string,
    indicators?: string[]
  }],
  timestamp: number,
  provider: string,
  chunkCount?: number,
  totalTokens?: number
}
```

## Performance Characteristics

### Time Complexity
- Normalization: O(n) where n = content length
- Chunking: O(n/chunk_size)
- Analysis: O(chunks) × LLM latency
- Storage: O(1) for individual operations

### Space Complexity
- Memory storage: O(sessions × entries × entry_size)
- Typical session: ~50KB
- Default keeps last 20 sessions: ~1MB

### Latency
- Content extraction: < 100ms
- Normalization: < 50ms per KB
- LLM analysis: 1-30s depending on provider
- Session storage: < 10ms

## Scalability Considerations

### Current Limits
- Max content: ~100KB before chunking is essential
- Max chunks: Limited by LLM context windows
- Max sessions: Limited by storage backend

### Growth Path
- Switch to persistent storage (IndexedDB, SQLite)
- Implement result caching with TTL
- Add batch analysis capabilities
- Implement result streaming
- Add WebWorker processing for large documents

## Security Considerations

### Electron
- Context isolation enabled
- No `nodeIntegration`
- Preload script validates messages
- No eval/innerHTML usage

### Extension
- Content Security Policy configured
- No inline scripts
- Minimal permissions requested
- Message validation in handlers

### API Keys
- Never logged
- Stored in localStorage (user responsibility)
- Environment variables for backend use
- Optional MCP augmentation

## Testing Strategy

### Unit Testing
- LLM provider mocking
- Content normalization validation
- Chunking algorithm verification
- Storage backend contracts

### Integration Testing
- Full pipeline with local provider
- Session creation and persistence
- Multi-chunk analysis aggregation
- Error handling and recovery

### E2E Testing
- Electron app with sample pages
- Extension popup interactions
- Cross-browser compatibility
- Storage persistence verification

## Deployment Architecture

### Development
```
npm install        # Install all packages
npm run build      # Build all packages
npm run dev        # Watch mode
npm run type-check # Type validation
```

### Electron Production
```
- Core library bundled with app
- Main + renderer process bundle
- Preload script isolated
- Assets in asar file
```

### Extension Distribution
```
- Core library bundled into extension
- Background worker as content script
- Popup bundled separately
- Manifest validation on upload
```

## Future Enhancements

### Short Term
- Keyboard shortcuts (Ctrl+Shift+A)
- Result export to PDF/CSV
- Result caching with TTL
- Batch analysis mode

### Medium Term
- Persistent storage with IndexedDB
- Sync across devices
- Advanced signal indicators
- Custom analysis templates

### Long Term
- Real-time streaming analysis
- WebRTC for peer analysis sharing
- Machine learning model fine-tuning
- Plugin system for custom analyzers
