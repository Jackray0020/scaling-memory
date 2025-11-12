/**
 * OpenAI Adapter Tests
 */

import { OpenAIAdapter } from '../providers/openaiAdapter';
import { LLMConfig } from '../types';
import { RateLimiter } from '../rateLimiter';
import { RetryHandler } from '../retryHandler';

// Mock OpenAI SDK
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1234567890,
          model: 'gpt-4',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'This is a mock response from OpenAI'
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        })
      }
    },
    models: {
      retrieve: jest.fn().mockResolvedValue({ id: 'gpt-4' }),
      list: jest.fn().mockResolvedValue({ data: [{ id: 'gpt-4' }] })
    }
  }));
});

describe('OpenAIAdapter', () => {
  const mockConfig: LLMConfig = {
    provider: 'openai',
    apiKey: 'sk-test-key',
    model: 'gpt-4',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 1.0
  };

  describe('initialization', () => {
    it('should initialize with config', () => {
      const adapter = new OpenAIAdapter(mockConfig);
      expect(adapter.getProviderName()).toBe('openai');
    });

    it('should initialize with rate limiter and retry handler', () => {
      const rateLimiter = new RateLimiter();
      const retryHandler = new RetryHandler();

      const adapter = new OpenAIAdapter(mockConfig, rateLimiter, retryHandler);
      expect(adapter).toBeDefined();
    });

    it('should create default rate limiter if not provided', () => {
      const adapter = new OpenAIAdapter(mockConfig);
      expect(adapter).toBeDefined();
    });

    it('should create default retry handler if not provided', () => {
      const adapter = new OpenAIAdapter(mockConfig);
      expect(adapter).toBeDefined();
    });
  });

  describe('getProviderName', () => {
    it('should return openai as provider name', () => {
      const adapter = new OpenAIAdapter(mockConfig);
      expect(adapter.getProviderName()).toBe('openai');
    });
  });

  describe('complete', () => {
    it('should send completion request with correct parameters', async () => {
      const adapter = new OpenAIAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'user', content: 'What is 2+2?' }
      ]);

      expect(response.content).toBe('This is a mock response from OpenAI');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4');
      expect(response.finishReason).toBe('stop');
      expect(response.usage?.totalTokens).toBe(30);
    });

    it('should handle multiple messages', async () => {
      const adapter = new OpenAIAdapter(mockConfig);

      const response = await adapter.complete([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
        { role: 'user', content: 'How are you?' }
      ]);

      expect(response.content).toBeDefined();
      expect(response.provider).toBe('openai');
    });

    it('should include usage information', async () => {
      const adapter = new OpenAIAdapter(mockConfig);

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
      // Mock streaming response
      const mockStream = (async function* () {
        yield {
          choices: [
            {
              delta: { content: 'Hello' },
              finish_reason: null
            }
          ]
        };
        yield {
          choices: [
            {
              delta: { content: ' ' },
              finish_reason: null
            }
          ]
        };
        yield {
          choices: [
            {
              delta: { content: 'World' },
              finish_reason: 'stop'
            }
          ]
        };
      })();

      jest
        .mocked(require('openai'))
        .mockImplementationOnce(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue(mockStream)
            }
          },
          models: {
            retrieve: jest.fn(),
            list: jest.fn()
          }
        }));

      const adapter = new OpenAIAdapter(mockConfig);
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
          choices: [
            {
              delta: { content: 'test' },
              finish_reason: 'stop'
            }
          ]
        };
      })();

      jest
        .mocked(require('openai'))
        .mockImplementationOnce(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue(mockStream)
            }
          },
          models: {
            retrieve: jest.fn(),
            list: jest.fn()
          }
        }));

      const adapter = new OpenAIAdapter(mockConfig);
      const onChunk = jest.fn();

      await adapter.stream([{ role: 'user', content: 'test' }], onChunk);

      expect(onChunk).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', async () => {
      const adapter = new OpenAIAdapter(mockConfig);
      const isValid = await adapter.validateConfig(mockConfig);
      expect(isValid).toBe(true);
    });

    it('should reject config without API key', async () => {
      const adapter = new OpenAIAdapter(mockConfig);
      const isValid = await adapter.validateConfig({
        ...mockConfig,
        apiKey: ''
      });
      expect(isValid).toBe(false);
    });

    it('should reject config without model', async () => {
      const adapter = new OpenAIAdapter(mockConfig);
      const isValid = await adapter.validateConfig({
        ...mockConfig,
        model: ''
      });
      expect(isValid).toBe(false);
    });

    it('should return false on API error', async () => {
      jest
        .mocked(require('openai'))
        .mockImplementationOnce(() => ({
          chat: {
            completions: {
              create: jest.fn()
            }
          },
          models: {
            retrieve: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }));

      const adapter = new OpenAIAdapter(mockConfig);
      const isValid = await adapter.validateConfig(mockConfig);
      expect(isValid).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      const adapter = new OpenAIAdapter(mockConfig);
      const health = await adapter.healthCheck();
      expect(health).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      jest
        .mocked(require('openai'))
        .mockImplementationOnce(() => ({
          chat: {
            completions: {
              create: jest.fn()
            }
          },
          models: {
            list: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }));

      const adapter = new OpenAIAdapter(mockConfig);
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

      // Record a request to fill the slot
      rateLimiter.recordRequest();

      const adapter = new OpenAIAdapter(mockConfig, rateLimiter);

      // This should wait for the slot, but we can't directly test the wait
      // so we'll just ensure it doesn't error
      const waitPromise = adapter.complete([
        { role: 'user', content: 'test' }
      ]);

      // Release the slot
      setTimeout(() => {
        rateLimiter.releaseRequest();
      }, 50);

      // Should eventually complete
      await expect(waitPromise).resolves.toBeDefined();
    });
  });
});
