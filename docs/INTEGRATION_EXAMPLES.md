# Integration Examples

This document provides practical examples of integrating the LLM layer with different applications.

## Table of Contents

- [Electron Desktop Application](#electron-desktop-application)
- [Browser Extension](#browser-extension)
- [Node.js CLI Tool](#nodejs-cli-tool)
- [Express.js API Server](#expressjs-api-server)

## Electron Desktop Application

### Setup

```typescript
// main.ts - Electron main process
import {
  createLLMClient,
  getLLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry
} from '@scaling-memory/shared';

class LLMManager {
  private client: any = null;
  private provider: 'openai' | 'anthropic' = 'openai';

  async initialize(provider: 'openai' | 'anthropic') {
    const registry = getProviderRegistry();

    // Register both providers
    try {
      const openaiConfig = getLLMConfig('openai');
      registry.register('openai', new OpenAIAdapter(openaiConfig));
    } catch (error) {
      console.warn('OpenAI not configured:', error);
    }

    try {
      const anthropicConfig = getLLMConfig('anthropic');
      registry.register('anthropic', new AnthropicAdapter(anthropicConfig));
    } catch (error) {
      console.warn('Anthropic not configured:', error);
    }

    // Create client
    const config = getLLMConfig(provider);
    this.client = await createLLMClient(config);
    this.provider = provider;
  }

  async analyze(content: string): Promise<string> {
    if (!this.client) throw new Error('LLM not initialized');
    const response = await this.client.analyze(content, 'Provide analysis');
    return response.content;
  }

  async streamAnalyze(content: string, onChunk: (chunk: string) => void): Promise<string> {
    if (!this.client) throw new Error('LLM not initialized');
    return this.client.stream(
      [{ role: 'user', content }],
      onChunk
    ).then((res: any) => res.content);
  }
}

const llmManager = new LLMManager();

// IPC handler
ipcMain.handle('llm:analyze', async (event, content: string) => {
  try {
    return await llmManager.analyze(content);
  } catch (error) {
    throw new Error((error as Error).message);
  }
});

ipcMain.on('llm:stream', (event, content: string) => {
  llmManager.streamAnalyze(content, (chunk) => {
    event.reply('llm:chunk', chunk);
  })
    .then(() => event.reply('llm:complete'))
    .catch((error) => event.reply('llm:error', (error as Error).message));
});

// Initialize on app start
app.on('ready', async () => {
  await llmManager.initialize('openai');
  createWindow();
});
```

### Renderer Process

```typescript
// renderer.ts - Electron renderer process
const { ipcRenderer } = require('electron');

document.getElementById('analyze-btn')?.addEventListener('click', async () => {
  const content = document.getElementById('content-input')?.textContent;
  const resultDiv = document.getElementById('result');

  if (!resultDiv) return;

  try {
    resultDiv.textContent = 'Analyzing...';
    const result = await ipcRenderer.invoke('llm:analyze', content);
    resultDiv.textContent = result;
  } catch (error) {
    resultDiv.textContent = 'Error: ' + (error as Error).message;
  }
});

// Streaming example
document.getElementById('stream-btn')?.addEventListener('click', () => {
  const content = document.getElementById('content-input')?.textContent;
  const resultDiv = document.getElementById('result');

  if (!resultDiv) return;

  resultDiv.textContent = '';

  ipcRenderer.on('llm:chunk', (event, chunk: string) => {
    resultDiv.textContent += chunk;
  });

  ipcRenderer.on('llm:error', (event, error: string) => {
    resultDiv.textContent = 'Error: ' + error;
  });

  ipcRenderer.send('llm:stream', content);
});
```

## Browser Extension

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "LLM Content Analyzer",
  "version": "1.0",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["https://api.openai.com/*", "https://api.anthropic.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

### background.ts

```typescript
// background.ts - Service Worker
import {
  createLLMClient,
  getLLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry
} from '@scaling-memory/shared';

let client: any = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    if (request.action === 'initialize') {
      const registry = getProviderRegistry();

      const openaiConfig = getLLMConfig('openai');
      registry.register('openai', new OpenAIAdapter(openaiConfig));

      const config = getLLMConfig(request.provider || 'openai');
      client = await createLLMClient(config);

      sendResponse({ success: true });
    } else if (request.action === 'analyze' && client) {
      const response = await client.analyze(request.content, request.prompt);
      sendResponse({ success: true, result: response.content });
    }
  } catch (error) {
    sendResponse({ success: false, error: (error as Error).message });
  }
});
```

### content.ts

```typescript
// content.ts - Content Script
function createUI() {
  const button = document.createElement('button');
  button.id = 'llm-analyzer-btn';
  button.textContent = '🤖';
  button.style.cssText =
    'position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: #4CAF50; color: white; border: none; cursor: pointer; z-index: 10000;';

  button.addEventListener('click', async () => {
    const content = document.body.innerText.substring(0, 5000);

    chrome.runtime.sendMessage(
      { action: 'analyze', content, prompt: 'Summarize this content' },
      (response) => {
        if (response.success) {
          alert('Analysis:\n' + response.result);
        } else {
          alert('Error: ' + response.error);
        }
      }
    );
  });

  document.body.appendChild(button);
}

// Initialize extension
chrome.runtime.sendMessage({ action: 'initialize', provider: 'openai' }, () => {
  createUI();
});
```

## Node.js CLI Tool

```typescript
// cli.ts
import { createLLMClient, getLLMConfig } from '@scaling-memory/shared';
import * as fs from 'fs';

async function main() {
  const [, , command, ...args] = process.argv;

  if (command === 'analyze') {
    const filePath = args[0];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const prompt = args[1] || 'Provide analysis of this content';

    try {
      const config = getLLMConfig('openai');
      const client = await createLLMClient(config);

      console.log('Analyzing content...\n');

      await client.stream(
        [
          {
            role: 'user',
            content: `${prompt}\n\n${content}`
          }
        ],
        (chunk) => process.stdout.write(chunk)
      );

      console.log('\n\nDone!');
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  } else {
    console.log('Usage: npx ts-node cli.ts analyze <file-path> [prompt]');
  }
}

main();
```

## Express.js API Server

```typescript
// server.ts
import express from 'express';
import {
  createLLMClient,
  getLLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry
} from '@scaling-memory/shared';

const app = express();
app.use(express.json());

let clients: Map<string, any> = new Map();

// Initialize providers
app.get('/api/initialize', async (req, res) => {
  try {
    const registry = getProviderRegistry();

    const openaiConfig = getLLMConfig('openai');
    registry.register('openai', new OpenAIAdapter(openaiConfig));

    const anthropicConfig = getLLMConfig('anthropic');
    registry.register('anthropic', new AnthropicAdapter(anthropicConfig));

    clients.set('openai', await createLLMClient(openaiConfig));
    clients.set('anthropic', await createLLMClient(anthropicConfig));

    res.json({ success: true, providers: Array.from(clients.keys()) });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { content, prompt, provider = 'openai' } = req.body;

    const client = clients.get(provider);
    if (!client) {
      return res.status(400).json({ error: 'Provider not initialized' });
    }

    const response = await client.analyze(content, prompt);

    res.json({
      success: true,
      result: response.content,
      usage: response.usage
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Stream endpoint
app.post('/api/stream', async (req, res) => {
  try {
    const { content, prompt, provider = 'openai' } = req.body;

    const client = clients.get(provider);
    if (!client) {
      return res.status(400).json({ error: 'Provider not initialized' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let chunks = '';

    await client.stream(
      [{ role: 'user', content: `${prompt}\n\n${content}` }],
      (chunk) => {
        chunks += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );

    res.write(`data: ${JSON.stringify({ complete: true, fullContent: chunks })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  const health: Record<string, boolean> = {};

  for (const [provider, client] of clients) {
    try {
      health[provider] = await client.healthCheck();
    } catch {
      health[provider] = false;
    }
  }

  res.json({ status: 'ok', providers: health });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing Integration

### Mock Provider for Testing

```typescript
import { MockProviderAdapter } from '@scaling-memory/shared/llm/__tests__/mocks';
import { getProviderRegistry, setProviderRegistry, DefaultProviderRegistry } from '@scaling-memory/shared';

// In tests
beforeEach(() => {
  const registry = new DefaultProviderRegistry();
  const mockAdapter = new MockProviderAdapter('openai');
  registry.register('openai', mockAdapter);
  setProviderRegistry(registry);
});
```

## Performance Tips

1. **Reuse Clients**: Create clients once and reuse them
2. **Implement Caching**: Cache frequently analyzed content
3. **Use Streaming**: Stream responses for better UX
4. **Monitor Rate Limits**: Track API usage
5. **Error Handling**: Implement proper error recovery

## Security Considerations

1. **Protect API Keys**: Never expose in frontend
2. **Validate Input**: Sanitize content before sending
3. **Rate Limit Requests**: Prevent abuse
4. **Log Securely**: Don't log sensitive data
5. **Use HTTPS**: Encrypt data in transit

## Common Patterns

### Provider Fallback

```typescript
async function analyzeWithFallback(content: string): Promise<string> {
  try {
    const client = clients.get('openai');
    return (await client.analyze(content, 'Analyze')).content;
  } catch (error) {
    console.warn('OpenAI failed, trying Anthropic');
    const client = clients.get('anthropic');
    return (await client.analyze(content, 'Analyze')).content;
  }
}
```

### Batch Processing

```typescript
async function processBatch(items: string[], provider: string): Promise<string[]> {
  const client = clients.get(provider);
  const results = [];

  for (const item of items) {
    const response = await client.analyze(item, 'Analyze');
    results.push(response.content);
  }

  return results;
}
```

### Concurrent Requests

```typescript
async function analyzeConcurrent(
  items: string[],
  provider: string
): Promise<string[]> {
  const client = clients.get(provider);

  return Promise.all(
    items.map((item) => client.analyze(item, 'Analyze').then((r: any) => r.content))
  );
}
```

## Troubleshooting

See [PROVIDER_SETUP.md](./PROVIDER_SETUP.md) for common issues and solutions.
