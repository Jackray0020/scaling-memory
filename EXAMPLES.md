# Usage Examples

## Core Library Examples

### Basic Page Analysis

```typescript
import { BrowsingAnalysisSDK } from '@ai-browsing/core';

const sdk = new BrowsingAnalysisSDK();

const result = await sdk.analyzePage({
  content: {
    url: 'https://finance.example.com/news/apple-earnings',
    title: 'Apple Earnings Beat Expectations',
    content: `
      Apple Inc. reported Q3 2024 earnings today, beating analyst expectations.
      Revenue reached $85.2 billion, up 12% year-over-year.
      The iPhone segment showed strong momentum with 18% growth.
      Services revenue grew 9%, contributing to overall profitability.
      Management guided for continued growth in the coming quarter.
    `
  },
  provider: 'local'
});

console.log('Summary:', result.summary);
console.log('Insights:', result.insights);
console.log('Trading Signals:', result.tradingSignals);
```

### Using Real LLM Providers

```typescript
// OpenAI
const result = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'openai',
  config: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  }
});

// Claude
const result = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'claude',
  config: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-opus-20240229',
    temperature: 0.7
  }
});

// Gemini
const result = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'gemini',
  config: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro'
  }
});
```

### Content Normalization

```typescript
import { ContentNormalizer, ContentChunker } from '@ai-browsing/core';

// Clean up HTML content
const normalized = ContentNormalizer.normalize({
  url: 'https://example.com/article',
  title: 'Full Article',
  html: `
    <html>
      <nav>Navigation menu</nav>
      <script>analytics()</script>
      <article>Main content here...</article>
      <aside>Sidebar ads</aside>
      <footer>Footer</footer>
    </html>
  `,
  text: 'Full text fallback'
});

// Validate content
if (ContentNormalizer.isValidContent(normalized)) {
  // Content is good for analysis
}

// Get content hash for deduplication
const hash = ContentNormalizer.getContentHash(normalized.content);
```

### Handling Long Documents

```typescript
const longDocument = `
  Very long content with many paragraphs...
  ${Array(1000).fill('paragraph').join('\n')}
`;

const chunks = ContentChunker.chunkContent(longDocument, 4000, 200);
console.log(`Split into ${chunks.length} chunks`);

// Get recommended chunk size
const size = ContentChunker.getRecommendedChunkSize(longDocument.length);
console.log(`Recommended chunk size: ${size}`);

// Analyze with chunking
const result = await sdk.analyzePage({
  content: {
    url: 'https://example.com/long-report',
    title: 'Long Report',
    content: longDocument
  },
  provider: 'openai'
});

console.log(`Analyzed ${result.chunkCount} chunks`);
```

### Session Management

```typescript
const manager = sdk.getSessionManager();

// Create session
const session = await manager.createSession('session_123', 'openai');

// Analyze and save to session
const result = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'openai',
  sessionId: 'session_123'
});

// List all analyses in session
const entries = await manager.listEntries('session_123');
console.log(`Session has ${entries.length} analyses`);

// Get specific session
const history = await manager.getSession('session_123');
console.log('Session created:', new Date(history!.createdAt));

// Export session to JSON
const json = await manager.exportSession('session_123');
fs.writeFileSync('session_backup.json', json);

// Import session
const imported = await manager.importSession(fs.readFileSync('session_backup.json', 'utf-8'));

// Clear session
await manager.clearSession('session_123');
```

### Multiple Sessions Across Providers

```typescript
// Create sessions for different providers
const openaiSession = await manager.createSession('session_openai_1', 'openai');
const claudeSession = await manager.createSession('session_claude_1', 'claude');

// Analyze with different providers
const openaiResult = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'openai',
  sessionId: 'session_openai_1'
});

const claudeResult = await sdk.analyzePage({
  content: { url, title, content },
  provider: 'claude',
  sessionId: 'session_claude_1'
});

// Compare results
console.log('OpenAI summary:', openaiResult.summary);
console.log('Claude summary:', claudeResult.summary);

// Get all sessions for a provider
const openaiSessions = await manager.getSessionsByProvider('openai');
console.log(`${openaiSessions.length} sessions with OpenAI`);
```

### Custom Storage Backend

```typescript
// Implement custom storage
class IndexedDBBackend implements StorageBackend {
  async save(key: string, data: any): Promise<void> {
    const db = await openIndexedDB();
    // implementation
  }
  
  async load(key: string): Promise<any> {
    const db = await openIndexedDB();
    // implementation
  }
  
  async remove(key: string): Promise<void> {
    const db = await openIndexedDB();
    // implementation
  }
  
  async list(pattern: string): Promise<string[]> {
    const db = await openIndexedDB();
    // implementation
  }
}

// Use custom backend
const backend = new IndexedDBBackend();
const sdk = new BrowsingAnalysisSDK(backend);
```

## Electron App Examples

### IPC Communication

```typescript
// In renderer process
const result = await window.browsing.analyzePage({
  content: {
    url: 'https://example.com',
    title: 'Example Page',
    content: 'Page content...'
  },
  provider: 'local'
});

// Access result
console.log(result.data?.summary);
console.log(result.data?.insights);
```

### Session Management in Electron

```typescript
// Create new session
const session = await window.browsing.createSession(
  'session_' + Date.now(),
  'openai'
);

// List all sessions
const sessions = await window.browsing.listSessions();
sessions.forEach(s => {
  console.log(`Session: ${s.sessionId} (${s.entries.length} analyses)`);
});

// Get specific session
const history = await window.browsing.getSession(sessionId);

// Export session for backup
const json = await window.browsing.exportSession(sessionId);
```

### React Component Usage

```typescript
// Load sample page for testing
const loadSamplePage = () => {
  const pageContent = {
    url: 'https://example.com/trading-update',
    title: 'Trading Update',
    content: `
      Market Update: Tech stocks surged today on strong earnings reports.
      Apple beat expectations with 15% revenue growth.
      Microsoft announced new AI features for Office 365.
      Google reported strong cloud growth at 28% YoY.
      
      Sector Analysis:
      - Technology: Bullish sentiment
      - Financial Services: Mixed signals
      - Retail: Cautious outlook
      
      Analyst Recommendations:
      Multiple analysts upgraded tech stocks following the earnings.
      Average price target increase of 8% across the sector.
    `
  };
  
  onAnalyze(pageContent);
};
```

## Browser Extension Examples

### Content Extraction

```typescript
// In content script
function getPageContent() {
  return {
    url: window.location.href,
    title: document.title,
    html: document.documentElement.outerHTML,
    text: document.body.innerText
  };
}

// Send to background worker
chrome.runtime.sendMessage(
  { type: 'analyze', payload: getPageContent() },
  response => console.log(response)
);
```

### Background Worker Message Handling

```typescript
// In background.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'analyze') {
    sdk.analyzePage(request.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open
  }
});
```

### Popup UI Example

```typescript
// Click handler in popup
const handleAnalyze = async () => {
  setAnalyzing(true);
  
  try {
    // Get current page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Extract content
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'get-page-content'
    });
    
    // Analyze
    const analysis = await chrome.runtime.sendMessage({
      type: 'analyze',
      payload: {
        content: response.data,
        provider: 'openai',
        sessionId: 'session_' + Date.now()
      }
    });
    
    setResult(analysis.data);
  } finally {
    setAnalyzing(false);
  }
};
```

## Real-World Scenarios

### Stock News Analysis

```typescript
const analyzeStockNews = async (newsArticle: {
  url: string;
  title: string;
  content: string;
}) => {
  const result = await sdk.analyzePage({
    content: newsArticle,
    provider: 'openai',
    config: {
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.5 // More deterministic
    }
  });
  
  if (result.tradingSignals?.length) {
    result.tradingSignals.forEach(signal => {
      console.log(`${signal.type.toUpperCase()}: ${signal.description}`);
      console.log(`Confidence: ${Math.round(signal.confidence * 100)}%`);
    });
  }
};
```

### Financial Report Parsing

```typescript
const analyzeFinancialReport = async (reportPath: string) => {
  const content = fs.readFileSync(reportPath, 'utf-8');
  
  // Handle large reports with chunking
  const chunks = ContentChunker.chunkContent(content);
  
  const result = await sdk.analyzePage({
    content: {
      url: `file://${reportPath}`,
      title: 'Financial Report',
      content
    },
    provider: 'claude',
    config: {
      apiKey: process.env.CLAUDE_API_KEY,
      maxTokens: 2000
    }
  });
  
  return {
    summary: result.summary,
    keyInsights: result.insights,
    chunksAnalyzed: result.chunkCount,
    totalTokens: result.totalTokens
  };
};
```

### Batch Analysis

```typescript
const analyzeMultiplePages = async (urls: string[]) => {
  const manager = sdk.getSessionManager();
  const sessionId = 'batch_' + Date.now();
  
  await manager.createSession(sessionId, 'openai');
  
  const results = [];
  for (const url of urls) {
    const response = await fetch(url);
    const html = await response.text();
    
    const result = await sdk.analyzePage({
      content: {
        url,
        title: new URL(url).hostname,
        content: html
      },
      provider: 'openai',
      sessionId
    });
    
    results.push(result);
  }
  
  // Export complete session
  const json = await manager.exportSession(sessionId);
  fs.writeFileSync('batch_results.json', json);
  
  return results;
};
```

## Error Handling

```typescript
try {
  const result = await sdk.analyzePage({
    content: { url, title, content },
    provider: 'openai'
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      console.error('Missing or invalid API key');
    } else if (error.message.includes('rate limit')) {
      console.error('Rate limit exceeded, retry later');
    } else {
      console.error('Analysis failed:', error.message);
    }
  }
}
```
