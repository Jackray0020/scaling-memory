# LLM Provider Setup Guide

This guide provides step-by-step instructions for setting up each supported LLM provider.

## Table of Contents

- [OpenAI Setup](#openai-setup)
- [Anthropic Setup](#anthropic-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## OpenAI Setup

### 1. Create OpenAI Account

1. Visit https://platform.openai.com/signup
2. Sign up or log in with your OpenAI account
3. Verify your email address

### 2. Generate API Key

1. Navigate to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (it will only be shown once)
4. Store it securely

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Specify model (default: gpt-4)
# Available models: gpt-4, gpt-4-32k, gpt-3.5-turbo, etc.
OPENAI_MODEL=gpt-4

# Optional: Maximum tokens to generate (default: 2048)
OPENAI_MAX_TOKENS=2048

# Optional: Temperature for response randomness (default: 0.7)
# Range: 0.0 (deterministic) to 2.0 (random)
OPENAI_TEMPERATURE=0.7

# Optional: Top P for nucleus sampling (default: 1.0)
OPENAI_TOP_P=1.0

# Optional: Organization ID for API billing
OPENAI_ORG_ID=org-xxxxxxxxxxxxx
```

### 4. Verify Installation

```bash
# Test the configuration
npm test -- openaiAdapter.test.ts
```

### 5. Monitor Costs

1. Go to https://platform.openai.com/account/billing/overview
2. Set usage limits to prevent unexpected charges
3. Monitor your API usage

### OpenAI Pricing

Pricing varies by model. Check https://openai.com/pricing for current rates:

- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-3.5-turbo: Much cheaper, suitable for high-volume use

## Anthropic Setup

### 1. Create Anthropic Account

1. Visit https://console.anthropic.com
2. Sign up or log in with your account
3. Verify your email address

### 2. Generate API Key

1. Navigate to https://console.anthropic.com/account/keys
2. Click "Create Key"
3. Copy the key securely
4. Store it in a safe location

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Optional: Specify model (default: claude-3-opus-20240229)
# Available models: claude-3-opus, claude-3-sonnet, claude-3-haiku
ANTHROPIC_MODEL=claude-3-opus-20240229

# Optional: Maximum tokens to generate (default: 2048)
ANTHROPIC_MAX_TOKENS=2048

# Optional: Temperature for response randomness (default: 0.7)
# Range: 0.0 (deterministic) to 1.0 (random)
ANTHROPIC_TEMPERATURE=0.7

# Optional: Top P for nucleus sampling (default: 1.0)
ANTHROPIC_TOP_P=1.0
```

### 4. Verify Installation

```bash
# Test the configuration
npm test -- anthropicAdapter.test.ts
```

### 5. Monitor Costs

1. Go to https://console.anthropic.com/account/billing
2. Check your usage and costs
3. Set alerts if needed

### Anthropic Pricing

Anthropic pricing varies by model. Check https://www.anthropic.com/pricing:

- Claude 3 Opus: Higher cost, most capable
- Claude 3 Sonnet: Balanced cost and performance
- Claude 3 Haiku: Lowest cost, fastest

## Shared Configuration

### Rate Limiting

Configure global rate limits:

```bash
# Maximum requests per minute (default: 60)
RATE_LIMIT_PER_MINUTE=100

# Maximum requests per hour (default: 3600)
RATE_LIMIT_PER_HOUR=5000

# Maximum concurrent requests (default: 10)
MAX_CONCURRENT_REQUESTS=20
```

### Retry Configuration

Configure retry behavior:

```bash
# Maximum retry attempts (default: 3)
RETRY_MAX_RETRIES=5

# Initial delay between retries in ms (default: 100)
RETRY_INITIAL_DELAY_MS=100

# Maximum delay between retries in ms (default: 30000)
RETRY_MAX_DELAY_MS=60000

# Exponential backoff multiplier (default: 2)
RETRY_BACKOFF_MULTIPLIER=2

# Request timeout in milliseconds (default: 60000)
RETRY_TIMEOUT_MS=60000
```

### Logging Configuration

```bash
# Log level: debug, info, warn, error (default: info)
LOG_LEVEL=debug

# Environment: development or production
NODE_ENV=development
```

## Verification

### Test Single Provider

```typescript
import { createLLMClient, getLLMConfig } from '@scaling-memory/shared';

async function testOpenAI() {
  const config = getLLMConfig('openai');
  const client = await createLLMClient(config);
  
  const response = await client.complete([
    { role: 'user', content: 'Say hello in one word' }
  ]);
  
  console.log('OpenAI Response:', response.content);
}

testOpenAI().catch(console.error);
```

### Test Both Providers

```typescript
import {
  createLLMClient,
  getLLMConfig,
  OpenAIAdapter,
  AnthropicAdapter,
  getProviderRegistry
} from '@scaling-memory/shared';

async function testBothProviders() {
  const registry = getProviderRegistry();
  
  // Register OpenAI
  const openaiConfig = getLLMConfig('openai');
  registry.register('openai', new OpenAIAdapter(openaiConfig));
  
  // Register Anthropic
  const anthropicConfig = getLLMConfig('anthropic');
  registry.register('anthropic', new AnthropicAdapter(anthropicConfig));
  
  // Test OpenAI
  const openaiClient = await createLLMClient(openaiConfig);
  const openaiResponse = await openaiClient.complete([
    { role: 'user', content: 'Say hello' }
  ]);
  console.log('OpenAI:', openaiResponse.content);
  
  // Test Anthropic
  const anthropicClient = await createLLMClient(anthropicConfig);
  const anthropicResponse = await anthropicClient.complete([
    { role: 'user', content: 'Say hello' }
  ]);
  console.log('Anthropic:', anthropicResponse.content);
}

testBothProviders().catch(console.error);
```

### Test Streaming

```typescript
import { createLLMClient, getLLMConfig } from '@scaling-memory/shared';

async function testStreaming() {
  const config = getLLMConfig('openai');
  const client = await createLLMClient(config);
  
  console.log('Streaming response:');
  await client.stream(
    [{ role: 'user', content: 'Write a short poem' }],
    (chunk) => process.stdout.write(chunk)
  );
  console.log('\nDone');
}

testStreaming().catch(console.error);
```

## Troubleshooting

### "Invalid API Key" Error

**Solution:**
1. Verify the API key is correct and not expired
2. Check that the environment variable name matches (case-sensitive)
3. Ensure the API key is in the `.env` file or environment variables

```bash
# Check OpenAI key
echo $OPENAI_API_KEY

# Check Anthropic key
echo $ANTHROPIC_API_KEY
```

### "Rate Limit Exceeded" Error

**Solution:**
1. Reduce the number of concurrent requests
2. Increase the rate limit intervals
3. Implement request queuing

```bash
# Increase rate limits
RATE_LIMIT_PER_MINUTE=30
MAX_CONCURRENT_REQUESTS=5
```

### "Timeout" Error

**Solution:**
1. Increase the timeout duration
2. Check network connectivity
3. Verify the provider is responding

```bash
RETRY_TIMEOUT_MS=120000
```

### "Network Error" Error

**Solution:**
1. Verify internet connectivity
2. Check if the provider's API is accessible
3. Check firewall/proxy settings

Test connectivity:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Provider Not Registered Error

**Solution:**
1. Make sure to register the provider before using it
2. Check the provider name is correct

```typescript
import { getProviderRegistry, OpenAIAdapter } from '@scaling-memory/shared';

const registry = getProviderRegistry();
registry.register('openai', new OpenAIAdapter(config));
// Now you can use it
```

### "Model Not Found" Error

**Solution:**
1. Verify the model name is correct
2. Check if the model is available in your region
3. Use the default model if uncertain

```bash
# List available OpenAI models
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### High Costs

**Solutions:**
1. Use a cheaper model
2. Reduce token limits
3. Implement caching for repeated requests
4. Set usage alerts

## Environment Variable Validation

The library validates configuration on initialization. Use this to catch errors early:

```typescript
import { LLMClient } from '@scaling-memory/shared';

try {
  const client = new LLMClient(config);
  await client.initialize();
  console.log('Configuration valid');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Security Considerations

1. **Never commit API keys** - Use `.env` and add to `.gitignore`
2. **Rotate keys periodically** - Update keys in provider console
3. **Use separate keys for development/production** - Isolate credentials
4. **Monitor API usage** - Watch for unusual activity
5. **Implement access controls** - Limit who can make API calls

## Next Steps

1. Set up your preferred provider(s)
2. Run the verification tests
3. Configure rate limiting based on your needs
4. Implement error handling for your use case
5. Start using the LLM layer in your application

For more information, see:
- [LLM Layer Documentation](./LLM_LAYER.md)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com)
