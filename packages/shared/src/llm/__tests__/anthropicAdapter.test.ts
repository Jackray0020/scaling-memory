/**
 * Anthropic Adapter Tests
 */

import { AnthropicAdapter } from '../providers/anthropicAdapter';
import { LLMConfig } from '../types';
import { RateLimiter } from '../rateLimiter';
import { RetryHandler } from '../retryHandler';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'This is a mock response from Anthropic'
          }
        ],
        model: 'claude-3-opus-20240229',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 20
        }
      }),
      stream: jest.fn().mockResolvedValue((async function* () {})())
    }
  }));
});

describe('AnthropicAdapter', () => {
  const mockConfig: LLMConfig = {
    provider: 'anthropic',
    apiKey: 'sk-ant-test-key',
    model: 'claude-3-opus-20240229',
    maxTokens: 2048,
    temperature: 0.7
  };

  describe('initialization', () => {
    it('should initialize with config', () => {
      const adapter = new AnthropicAdapter(mockConfig);
      expect(adapter.getProviderName()).toBe('anthropic');
    });

    it('should initialize with rate limiter and retry handler', () => {
      const rateLimiter = new RateLimiter();
      const retryHandler = new RetryHandler();

      const adapter = new AnthropicAdapter(mockConfig, rateLimiter, retryHandler);
      expect(adapter).toBeDefined();
    });

    it('should create default rate limiter if not provided', () => {
      const adapter = new AnthropicAdapter(mockConfig);
      expect(adapter).toBeDefined();
    });

    it('should create default retry handler if not provided', () => {
      const adapter = new AnthropicAdapter(mockConfig);
      expect(adapter).toBeDefined();
    });
  });

  describe('getProviderName', () => {
    it('should return anthropic as provider name', () => {
      const adapter = new AnthropicAdapter(mockConfig);
      expect(adapter.getProviderName()).toBe('anthropic');
    });
  });

  describe('complete', () => {
    it('should send completion request with correct parameters', async () => {
      const adapter = new AnthropicAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'user', content: 'What is 2+2?' }
      ]);

      expect(response.content).toBe('This is a mock response from Anthropic');
      expect(response.provider).toBe('anthropic');
      expect(response.model).toBe('claude-3-opus-20240229');
      expect(response.finishReason).toBe('end_turn');
      expect(response.usage?.totalTokens).toBe(30);
    });

    it('should handle system messages separately', async () => {
      const adapter = new AnthropicAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' }
      ]);

      expect(response.content).toBeDefined();
      expect(response.provider).toBe('anthropic');
    });

    it('should handle multiple user/assistant messages', async () => {
      const adapter = new AnthropicAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
        { role: 'user', content: 'How are you?' }
      ]);

      expect(response.content).toBeDefined();
    });

    it('should include usage information', async () => {
      const adapter = new AnthropicAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'user', content: 'test' }
      ]);

      expect(response.usage).toBeDefined();
      expect(response.usage?.promptTokens).toBe(10);
      expect(response.usage?.completionTokens).toBe(20);
      expect(response.usage?.totalTokens).toBe(30);
    });
  });

  describe('stream', () => {
    it('should stream response content', async () => {
      const mockStream = (async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' }
        };
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: ' World' }
        };
        yield {
          type: 'message_delta',
          delta: { stop_reason: 'end_turn' }
        };
      })();

      jest
        .mocked(require('@anthropic-ai/sdk'))
        .mockImplementationOnce(() => ({
          messages: {
            create: jest.fn(),
            stream: jest.fn().mockResolvedValue(mockStream)
          }
        }));

      const adapter = new AnthropicAdapter(mockConfig);
      const chunks: string[] = [];

      const response = await adapter.stream(
        [{ role: 'user', content: 'test' }],
        (chunk) => chunks.push(chunk)
      );

      expect(response.content).toBe('Hello World');
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should call onChunk callback', async () => {
      const mockStream = (async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'test' }
        };
        yield {
          type: 'message_delta',
          delta: { stop_reason: 'end_turn' }
        };
      })();

      jest
        .mocked(require('@anthropic-ai/sdk'))
        .mockImplementationOnce(() => ({
          messages: {
            create: jest.fn(),
            stream: jest.fn().mockResolvedValue(mockStream)
          }
        }));

      const adapter = new AnthropicAdapter(mockConfig);
      const onChunk = jest.fn();

      await adapter.stream([{ role: 'user', content: 'test' }], onChunk);

      expect(onChunk).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', async () => {
      const adapter = new AnthropicAdapter(mockConfig);
      const isValid = await adapter.validateConfig(mockConfig);
      expect(isValid).toBe(true);
    });

    it('should reject config without API key', async () => {
      const adapter = new AnthropicAdapter(mockConfig);
      const isValid = await adapter.validateConfig({
        ...mockConfig,
        apiKey: ''
      });
      expect(isValid).toBe(false);
    });

    it('should reject config without model', async () => {
      const adapter = new AnthropicAdapter(mockConfig);
      const isValid = await adapter.validateConfig({
        ...mockConfig,
        model: ''
      });
      expect(isValid).toBe(false);
    });

    it('should return false on API error', async () => {
      jest
        .mocked(require('@anthropic-ai/sdk'))
        .mockImplementationOnce(() => ({
          messages: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
            stream: jest.fn()
          }
        }));

      const adapter = new AnthropicAdapter(mockConfig);
      const isValid = await adapter.validateConfig(mockConfig);
      expect(isValid).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      const adapter = new AnthropicAdapter(mockConfig);
      const health = await adapter.healthCheck();
      expect(health).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      jest
        .mocked(require('@anthropic-ai/sdk'))
        .mockImplementationOnce(() => ({
          messages: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
            stream: jest.fn()
          }
        }));

      const adapter = new AnthropicAdapter(mockConfig);
      const health = await adapter.healthCheck();
      expect(health).toBe(false);
    });
  });

  describe('rate limiting integration', () => {
    it('should wait for rate limit slot before making request', async () => {
      const rateLimiter = new RateLimiter({
        maxConcurrentRequests: 1,
        requestsPerMinute: 100
      });

      rateLimiter.recordRequest();

      const adapter = new AnthropicAdapter(mockConfig, rateLimiter);

      const waitPromise = adapter.complete([
        { role: 'user', content: 'test' }
      ]);

      setTimeout(() => {
        rateLimiter.releaseRequest();
      }, 50);

      await expect(waitPromise).resolves.toBeDefined();
    });
  });
});
