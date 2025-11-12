# @ai-browsing/core

Core analysis engine for AI-powered browsing analysis. Provides shared functionality for both Electron desktop application and browser extension.

## API Overview

### BrowsingAnalysisSDK

Main entry point for the analysis pipeline.

```typescript
const sdk = new BrowsingAnalysisSDK(storageBackend);

// Analyze a page
const result = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'openai',
  sessionId: 'session_123'
});
```

### ContentNormalizer

Removes boilerplate from HTML content.

```typescript
const normalized = ContentNormalizer.normalize({
  url: 'https://example.com',
  title: 'Page',
  html: '<html>...</html>',
  text: 'Plain text'
});

// Validate content
if (ContentNormalizer.isValidContent(normalized)) {
  // Process further
}

// Get hash for deduplication
const hash = ContentNormalizer.getContentHash(normalized.content);
```

### ContentChunker

Splits long documents into manageable chunks.

```typescript
const chunks = ContentChunker.chunkContent(longText, 4000, 200);

// Get recommended chunk size
const size = ContentChunker.getRecommendedChunkSize(contentLength);
```

### LLMProviderFactory

Creates provider instances dynamically.

```typescript
const provider = LLMProviderFactory.createProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
});

const response = await provider.sendRequest('Analyze this content...');
```

### SessionManager

Manages analysis history and sessions.

```typescript
const manager = sdk.getSessionManager();

// Create session
const session = await manager.createSession('session_123', 'openai');

// Add result
const entry = await manager.addToSession('session_123', analysisResult);

// Get session
const history = await manager.getSession('session_123');

// List all sessions
const sessions = await manager.listSessions();

// Export/Import
const json = await manager.exportSession('session_123');
await manager.importSession(jsonString);

// Clear
await manager.clearSession('session_123');
```

### BrowsingAnalyzer

Performs the actual analysis.

```typescript
const result = await BrowsingAnalyzer.analyze({
  content: normalizedContent,
  provider: 'openai',
  config: { temperature: 0.7 },
  sessionId: 'session_123'
});

// Result contains:
// - summary: text summary
// - insights: array of key insights
// - tradingSignals: array of {type, confidence, description}
// - timestamp: analysis time
// - chunkCount: number of chunks processed
```

## Type System

### Core Types

```typescript
// Page content
interface PageContent {
  url: string;
  title: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
}

// Normalized content
interface NormalizedContent {
  url: string;
  title: string;
  content: string;
  chunks?: ContentChunk[];
  metadata?: Record<string, unknown>;
}

// Content chunk
interface ContentChunk {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
}

// LLM Config
interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Analysis request
interface AnalysisRequest {
  content: NormalizedContent;
  provider: LLMProvider;
  config?: Partial<LLMConfig>;
  enableMCP?: boolean;
  sessionId?: string;
}

// Analysis result
interface AnalysisResult {
  sessionId: string;
  url: string;
  title: string;
  summary: string;
  insights: string[];
  tradingSignals?: TradingSignal[];
  timestamp: number;
  provider: LLMProvider;
  chunkCount?: number;
  totalTokens?: number;
}

// Trading signal
interface TradingSignal {
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  indicators?: string[];
}

// Session
interface SessionHistory {
  sessionId: string;
  entries: SessionEntry[];
  createdAt: number;
  updatedAt: number;
  provider: LLMProvider;
}
```

## Storage Backend

Implement custom storage by extending `StorageBackend`:

```typescript
interface StorageBackend {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  list(pattern: string): Promise<string[]>;
}
```

### Built-in Backends

- **MemoryStorageBackend**: In-memory storage (default)
- Custom backends can use IndexedDB, localStorage, or file system

## Supported LLM Providers

### OpenAI
```typescript
{
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4', // or gpt-3.5-turbo
  temperature: 0.7,
  maxTokens: 1000
}
```

### Claude (Anthropic)
```typescript
{
  provider: 'claude',
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 1000
}
```

### Gemini (Google)
```typescript
{
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 1000
}
```

### Local (Mock)
```typescript
{
  provider: 'local'
  // No API key needed
}
```

## Examples

### Basic Usage

```typescript
import { BrowsingAnalysisSDK } from '@ai-browsing/core';

const sdk = new BrowsingAnalysisSDK();

const result = await sdk.analyzePage({
  content: {
    url: 'https://example.com/news',
    title: 'Trading Update',
    content: 'Apple reported strong earnings...'
  },
  provider: 'local' // Use 'openai' with proper API key
});

console.log('Summary:', result.summary);
console.log('Insights:', result.insights);
console.log('Signals:', result.tradingSignals);
```

### Advanced Configuration

```typescript
const result = await sdk.analyzePage({
  content: normalizedContent,
  provider: 'openai',
  config: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2000
  },
  enableMCP: true,
  sessionId: 'session_' + Date.now()
});

// View session history
const sessionManager = sdk.getSessionManager();
const session = await sessionManager.getSession(result.sessionId);
console.log('Total analyses:', session.entries.length);
```

### Long Document Analysis

```typescript
const longContent = `
  Very long trading analysis with thousands of words...
  The automatic chunking will split this appropriately
`;

const result = await sdk.analyzePage({
  content: {
    url: 'https://example.com/long-report',
    title: 'Full Trading Report',
    content: longContent
  },
  provider: 'openai'
});

console.log(`Processed ${result.chunkCount} chunks`);
```

## Error Handling

```typescript
try {
  const result = await sdk.analyzePage(request);
} catch (error) {
  if (error instanceof Error) {
    console.error('Analysis failed:', error.message);
  }
}
```

## Performance Considerations

- Default chunk size: 4000 characters
- Default overlap: 200 characters
- Adjustable based on content length
- Concurrent chunk processing
- Built-in result caching via sessions
