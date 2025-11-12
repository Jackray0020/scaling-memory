# Scaling Memory

## Multi-Provider LLM Abstraction Layer

A TypeScript-based, production-ready LLM abstraction layer providing a unified interface for interacting with multiple Large Language Model providers.

### Features

- 🔌 **Multi-Provider Support**: OpenAI and Anthropic out of the box with extensible registry
- 🚦 **Rate Limiting**: Token bucket algorithm with per-minute and per-hour limits
- 🔄 **Retry Logic**: Exponential backoff with jitter for handling transient failures
- 🌊 **Streaming**: Native streaming support for long-running requests
- 🔐 **Secure Configuration**: Environment variable-based configuration with validation
- 📝 **Comprehensive Logging**: Structured logging via Pino
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🧪 **Well-Tested**: Comprehensive unit tests with mocked responses

### Quick Start

#### Installation

```bash
npm install @scaling-memory/shared
```

#### Basic Usage

```typescript
import { createLLMClient, getLLMConfig } from '@scaling-memory/shared';

// Configure with environment variables
const config = getLLMConfig('openai');

// Create and initialize client
const client = await createLLMClient(config);

// Send completion request
const response = await client.complete([
  { role: 'user', content: 'What is 2+2?' }
]);

console.log(response.content); // "2 + 2 = 4"
```

#### Streaming Support

```typescript
await client.stream(
  [{ role: 'user', content: 'Write a poem' }],
  (chunk) => process.stdout.write(chunk)
);
```

### Supported Providers

- **OpenAI**: GPT-4, GPT-3.5-Turbo, and other models
- **Anthropic**: Claude 3 Opus, Sonnet, and Haiku

### Documentation

- [LLM Layer Documentation](./docs/LLM_LAYER.md) - Complete API reference and advanced usage
- [Provider Setup Guide](./docs/PROVIDER_SETUP.md) - Step-by-step provider configuration

### Project Structure

```
├── packages/
│   └── shared/          # Core LLM layer
│       ├── src/
│       │   ├── llm/           # LLM abstraction layer
│       │   │   ├── types.ts    # Type definitions
│       │   │   ├── client.ts   # LLM client
│       │   │   ├── registry.ts # Provider registry
│       │   │   ├── rateLimiter.ts
│       │   │   ├── retryHandler.ts
│       │   │   ├── providers/
│       │   │   │   ├── openaiAdapter.ts
│       │   │   │   └── anthropicAdapter.ts
│       │   │   └── __tests__/  # Tests and mocks
│       │   ├── config/   # Configuration management
│       │   └── logger/   # Logging setup
│       └── tests/       # Integration tests
├── examples/
│   ├── electron/       # Electron integration example
│   └── extension/      # Browser extension example
└── docs/
    ├── LLM_LAYER.md    # Full documentation
    └── PROVIDER_SETUP.md # Provider setup guide
```

### Environment Configuration

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2048
OPENAI_TEMPERATURE=0.7

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
ANTHROPIC_MAX_TOKENS=2048

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=3600
MAX_CONCURRENT_REQUESTS=10

# Retry Configuration
RETRY_MAX_RETRIES=3
RETRY_INITIAL_DELAY_MS=100
RETRY_MAX_DELAY_MS=30000
```

### Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Watch mode
npm run build --workspaces -- --watch
```

### Testing

The library includes comprehensive unit tests with mocked responses:

```bash
npm test

# Test specific provider
npm test -- openaiAdapter.test.ts
npm test -- anthropicAdapter.test.ts
```

### Usage Examples

#### Analyzing Content

```typescript
const response = await client.analyze(
  'Some content to analyze...',
  'Provide a summary'
);
console.log(response.content);
```

#### Switching Providers

```typescript
// Use same interface with different provider
const anthropicClient = await createLLMClient(getLLMConfig('anthropic'));
const response = await anthropicClient.complete(messages);
```

#### Health Checks

```typescript
const isHealthy = await client.healthCheck();
console.log('Provider status:', isHealthy);
```

### Integration Examples

- [Electron Desktop App](./examples/electron/src/llm-analyzer.ts)
- [Browser Extension](./examples/extension/src/content-analyzer.ts)

### Architecture

The LLM layer follows clean architecture principles with:

- **Provider Adapter Pattern**: Each provider implements a common interface
- **Registry Pattern**: Dynamic provider registration and lookup
- **Decorator Pattern**: Rate limiting and retry logic wrap provider calls
- **Strategy Pattern**: Different retry and rate-limiting strategies

### Security

- API keys stored in environment variables (never in code)
- Automatic request sanitization
- Rate limiting prevents abuse
- Timeout protection against hanging requests
- Comprehensive error handling

### Performance

- Token bucket rate limiting prevents API throttling
- Exponential backoff with jitter optimizes retry behavior
- Concurrent request limits prevent resource exhaustion
- Streaming support reduces latency for long responses
- Structured logging for observability

### Error Handling

Automatic retry on transient errors:
- Connection errors (ECONNRESET, ENOTFOUND)
- Rate limit errors (429)
- Server errors (500, 502, 503, 504)

Manual handling for permanent errors:
- Authentication errors (401, 403)
- Bad requests (400)
- Not found (404)

### Contributing

When adding new providers:

1. Implement the `ProviderAdapter` interface
2. Add comprehensive unit tests
3. Document setup instructions
4. Update examples if applicable

### License

MIT

### Support

For issues, questions, or suggestions:

1. Check [LLM Layer Documentation](./docs/LLM_LAYER.md)
2. Review [Provider Setup Guide](./docs/PROVIDER_SETUP.md)
3. See [examples/](./examples/) directory