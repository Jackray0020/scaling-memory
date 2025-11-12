# LLM Layer Documentation

## Overview

The LLM Layer provides a unified, multi-provider abstraction for interacting with Large Language Models (LLMs). It supports OpenAI and Anthropic out of the box, with an extensible provider registry for adding additional providers.

## Features

- **Multi-Provider Support**: Abstract interface for OpenAI and Anthropic with easy provider switching
- **Provider Registry**: Extensible registry pattern for adding new providers
- **Rate Limiting**: Token bucket algorithm implementation with per-minute and per-hour limits
- **Retry Logic**: Exponential backoff with jitter for handling transient failures
- **Streaming Support**: Native support for streaming responses from both providers
- **Secure Credential Loading**: Environment variable-based configuration with dotenv support
- **Comprehensive Logging**: Integrated logging via Pino for debugging and monitoring
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Architecture

### Core Components

1. **LLMClient**: Main entry point providing a unified interface for all providers
2. **ProviderAdapter**: Abstract interface implemented by each provider
3. **ProviderRegistry**: Registry for managing provider adapters
4. **RateLimiter**: Token bucket implementation for rate limiting
5. **RetryHandler**: Exponential backoff retry logic

### Providers

- **OpenAIAdapter**: Implements the provider interface for OpenAI API
- **AnthropicAdapter**: Implements the provider interface for Anthropic Claude API

## Installation

```bash
npm install @scaling-memory/shared
```

## Configuration

Configuration is loaded from environment variables using dotenv.

### Environment Variables

#### General Configuration

```bash
# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Node environment
NODE_ENV=production
```

#### OpenAI Configuration

```bash
# Required: OpenAI API key
OPENAI_API_KEY=sk-...

# Optional: Model name (default: gpt-4)
OPENAI_MODEL=gpt-4-turbo

# Optional: Maximum tokens (default: 2048)
OPENAI_MAX_TOKENS=4096

# Optional: Temperature (default: 0.7)
OPENAI_TEMPERATURE=0.7

# Optional: Top P (default: 1.0)
OPENAI_TOP_P=1.0

# Optional: Organization ID
OPENAI_ORG_ID=org-...
```

#### Anthropic Configuration

```bash
# Required: Anthropic API key
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Model name (default: claude-3-opus-20240229)
ANTHROPIC_MODEL=claude-3-opus-20240229

# Optional: Maximum tokens (default: 2048)
ANTHROPIC_MAX_TOKENS=4096

# Optional: Temperature (default: 0.7)
ANTHROPIC_TEMPERATURE=0.7

# Optional: Top P (default: 1.0)
ANTHROPIC_TOP_P=1.0
```

#### Rate Limiting Configuration

```bash
# Requests per minute (default: 60)
RATE_LIMIT_PER_MINUTE=100

# Requests per hour (default: 3600)
RATE_LIMIT_PER_HOUR=5000

# Maximum concurrent requests (default: 10)
MAX_CONCURRENT_REQUESTS=20
```

#### Retry Configuration

```bash
# Maximum number of retries (default: 3)
RETRY_MAX_RETRIES=5

# Initial delay in milliseconds (default: 100)
RETRY_INITIAL_DELAY_MS=100

# Maximum delay in milliseconds (default: 30000)
RETRY_MAX_DELAY_MS=60000

# Backoff multiplier (default: 2)
RETRY_BACKOFF_MULTIPLIER=2

# Request timeout in milliseconds (default: 60000)
RETRY_TIMEOUT_MS=120000
```

## Usage

### Basic Setup

```typescript
import {
  LLMClient,
  createLLMClient,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry,
  getLLMConfig,
} from '@scaling-memory/shared';

// Register providers
const registry = getProviderRegistry();
const openaiConfig = getLLMConfig('openai');
registry.register('openai', new OpenAIAdapter(openaiConfig));

// Create and initialize client
const config = getLLMConfig('openai');
const client = await createLLMClient(config);
```

### Sending Completions

```typescript
const response = await client.complete([
  {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  {
    role: 'user',
    content: 'What is the capital of France?'
  }
]);

console.log(response.content); // "The capital of France is Paris."
console.log(response.usage);   // { promptTokens: 15, completionTokens: 10, totalTokens: 25 }
```

### Streaming Responses

```typescript
const chunks: string[] = [];

const response = await client.stream(
  [
    {
      role: 'user',
      content: 'Write a short poem about nature.'
    }
  ],
  (chunk) => {
    chunks.push(chunk);
    process.stdout.write(chunk);
  }
);

console.log('\nFull content:', response.content);
```

### Analyzing Content

```typescript
const response = await client.analyze(
  'Some content to analyze...',
  'Provide a summary of this content and identify key themes.'
);

console.log('Analysis:', response.content);
```

### Switching Providers

```typescript
// Create client with Anthropic
const anthropicConfig = getLLMConfig('anthropic');
registry.register('anthropic', new AnthropicAdapter(anthropicConfig));

const anthropicClient = await createLLMClient(anthropicConfig);

// Now you can use the same interface with a different provider
const response = await anthropicClient.complete(messages);
```

### Health Checks

```typescript
const isHealthy = await client.healthCheck();
console.log('Provider health:', isHealthy);
```

## Advanced Usage

### Custom Rate Limiting

```typescript
import { RateLimiter } from '@scaling-memory/shared';

const rateLimiter = new RateLimiter({
  requestsPerMinute: 50,
  requestsPerHour: 2000,
  maxConcurrentRequests: 5
});

const adapter = new OpenAIAdapter(config, rateLimiter);
```

### Custom Retry Configuration

```typescript
import { RetryHandler } from '@scaling-memory/shared';

const retryHandler = new RetryHandler({
  maxRetries: 5,
  initialDelayMs: 200,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  timeoutMs: 120000
});

const adapter = new OpenAIAdapter(config, undefined, retryHandler);
```

### Checking Rate Limit Status

```typescript
const rateLimiter = new RateLimiter();
const status = rateLimiter.getStatus();
console.log('Active requests:', status.activeRequests);
console.log('Minute tokens:', status.minuteBucketTokens);
console.log('Hour tokens:', status.hourBucketTokens);
```

## Extending with Custom Providers

To add a new provider:

1. Implement the `ProviderAdapter` interface
2. Register it with the provider registry
3. Use it like any other provider

```typescript
import { ProviderAdapter, LLMConfig, Message, LLMResponse } from '@scaling-memory/shared';

class CustomProviderAdapter implements ProviderAdapter {
  constructor(private config: LLMConfig) {}

  async complete(messages: Message[]): Promise<LLMResponse> {
    // Implementation
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse> {
    // Implementation
  }

  async validateConfig(config: LLMConfig): Promise<boolean> {
    // Validation logic
  }

  async healthCheck(): Promise<boolean> {
    // Health check logic
  }

  getProviderName() {
    return 'custom';
  }
}

// Register and use
registry.register('custom', new CustomProviderAdapter(customConfig));
```

## Error Handling

### Retryable Errors

The retry handler automatically retries on common transient errors:
- Connection errors (ECONNRESET, ENOTFOUND, ETIMEDOUT)
- HTTP 5xx errors (500, 502, 503, 504)
- Rate limit errors (429)

### Non-Retryable Errors

Some errors should not be retried:
- Authentication errors (401, 403)
- Bad requests (400)
- Not found errors (404)

### Custom Error Handling

```typescript
try {
  const response = await client.complete(messages);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    
    // Check if error is retryable
    if (RetryHandler.isRetryableError(error)) {
      console.log('This error could be retried');
    }
  }
}
```

## Logging

The LLM layer uses Pino for structured logging. Configure logging via environment variables:

```bash
# Set log level
LOG_LEVEL=debug

# Development logging is pretty-printed
NODE_ENV=development
```

Example log output:
```json
{"level":"debug","msg":"OpenAI: Sending completion request","model":"gpt-4","messageCount":2}
{"level":"info","msg":"Registered provider: openai"}
```

## Testing

The package includes comprehensive unit tests with mocked responses. All provider adapters and core components are tested:

```bash
npm test
```

Mock provider for testing without making actual API calls:

```typescript
import { MockProviderAdapter } from '@scaling-memory/shared/llm/__tests__/mocks';

const mockAdapter = new MockProviderAdapter('openai');
registry.register('openai', mockAdapter);

// Use in tests without consuming API quota
```

## Performance Considerations

1. **Rate Limiting**: Adjust rate limits based on your API tier
2. **Retry Strategy**: Balance between reliability and latency
3. **Streaming**: Use streaming for long-running requests to reduce latency
4. **Token Usage**: Monitor token usage to manage costs
5. **Concurrent Requests**: Set `maxConcurrentRequests` based on API limits

## Security Best Practices

1. **API Keys**: Never commit API keys to version control
   - Use `.env` files with `.gitignore`
   - Use environment variables in production
   - Rotate keys regularly

2. **Sensitive Data**: Be careful with what you send to LLMs
   - Review prompts for sensitive information
   - Implement access controls

3. **Rate Limiting**: Protect against abuse
   - Set appropriate rate limits
   - Monitor for unusual patterns

4. **Error Messages**: Don't expose sensitive information in errors
   - Log errors securely
   - Return generic error messages to clients

## Troubleshooting

### "Provider not registered" Error

```typescript
// Make sure to register the provider before creating the client
const registry = getProviderRegistry();
registry.register('openai', new OpenAIAdapter(config));

const client = await createLLMClient(config);
```

### Rate Limiting Issues

```typescript
// Check rate limit status
const status = rateLimiter.getStatus();
if (status.minuteBucketTokens === 0) {
  console.log('Rate limit exhausted for this minute');
}
```

### Timeout Errors

```bash
# Increase timeout
RETRY_TIMEOUT_MS=120000
```

### Authentication Errors

```bash
# Verify API key
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Check .env file is being loaded
NODE_ENV=development npm test
```

## Examples

See the `examples/` directory for complete working examples:

- Electron integration
- Extension integration
- Batch processing
- Error handling
- Custom provider implementation

## Contributing

When adding new providers or features:

1. Implement the `ProviderAdapter` interface
2. Add comprehensive unit tests
3. Update documentation
4. Add examples if applicable

## License

MIT
