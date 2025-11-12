/**
 * LLM Client Tests
 */

import { LLMClient, createLLMClient, LLMConfig } from '../client';
import {
  getProviderRegistry,
  resetProviderRegistry,
  setProviderRegistry,
  DefaultProviderRegistry
} from '../registry';
import { MockProviderAdapter } from './mocks';

describe('LLMClient', () => {
  beforeEach(() => {
    resetProviderRegistry();
  });

  afterEach(() => {
    resetProviderRegistry();
  });

  const mockConfig: LLMConfig = {
    provider: 'openai',
    apiKey: 'test-key',
    model: 'gpt-4',
    maxTokens: 2048,
    temperature: 0.7
  };

  describe('initialization', () => {
    it('should initialize with valid config and registered provider', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      expect(client.getProvider()).toBe('openai');
      expect(client.getModel()).toBe('gpt-4');
      expect(client.getAdapter()).toBe(adapter);
    });

    it('should throw if provider not registered', async () => {
      const client = new LLMClient(mockConfig);

      await expect(client.initialize()).rejects.toThrow(
        'Provider "openai" is not registered'
      );
    });

    it('should throw if config validation fails', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      adapter.setShouldFail(true);
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);

      await expect(client.initialize()).rejects.toThrow(
        'Failed to validate openai configuration'
      );
    });

    it('should throw if not initialized before using complete', async () => {
      const client = new LLMClient(mockConfig);

      await expect(
        client.complete([{ role: 'user', content: 'test' }])
      ).rejects.toThrow('LLMClient not initialized');
    });

    it('should throw if not initialized before using stream', async () => {
      const client = new LLMClient(mockConfig);

      await expect(
        client.stream([{ role: 'user', content: 'test' }], () => {})
      ).rejects.toThrow('LLMClient not initialized');
    });
  });

  describe('complete', () => {
    it('should send completion request to adapter', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const response = await client.complete([
        { role: 'user', content: 'What is 2+2?' }
      ]);

      expect(response.provider).toBe('openai');
      expect(response.content).toBeDefined();
      expect(response.usage).toBeDefined();
      expect(adapter.getCallCount()).toBe(1);
    });

    it('should handle multiple messages', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const response = await client.complete([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' }
      ]);

      expect(response.provider).toBe('openai');
      expect(response.content).toBeDefined();
    });
  });

  describe('stream', () => {
    it('should stream completion from adapter', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const chunks: string[] = [];
      const response = await client.stream(
        [{ role: 'user', content: 'test' }],
        (chunk) => chunks.push(chunk)
      );

      expect(response.provider).toBe('openai');
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('').length).toBeGreaterThan(0);
    });

    it('should call onChunk callback for each chunk', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const onChunk = jest.fn();
      await client.stream([{ role: 'user', content: 'test' }], onChunk);

      expect(onChunk).toHaveBeenCalled();
    });
  });

  describe('analyze', () => {
    it('should analyze content with provided prompt', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const response = await client.analyze(
        'Some content to analyze',
        'Provide a summary of this content'
      );

      expect(response.provider).toBe('openai');
      expect(response.content).toContain('mock');
    });

    it('should include system and user messages in analyze', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const completeSpy = jest.spyOn(client, 'complete');

      await client.analyze('test content', 'test prompt');

      expect(completeSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.any(String)
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('test content')
          })
        ]),
        undefined
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true if adapter health check passes', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      const health = await client.healthCheck();
      expect(health).toBe(true);
    });

    it('should return false if adapter health check fails', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      // Now set shouldFail only for healthCheck
      adapter.setShouldFail(true);

      const health = await client.healthCheck();
      expect(health).toBe(false);
    });

    it('should return false if not initialized', async () => {
      const client = new LLMClient(mockConfig);
      const health = await client.healthCheck();
      expect(health).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return provider type', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      expect(client.getProvider()).toBe('openai');
    });

    it('should return model name', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      expect(client.getModel()).toBe('gpt-4');
    });

    it('should return adapter instance', async () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry.register('openai', adapter);
      setProviderRegistry(registry);

      const client = new LLMClient(mockConfig);
      await client.initialize();

      expect(client.getAdapter()).toBe(adapter);
    });
  });
});

describe('createLLMClient factory', () => {
  beforeEach(() => {
    resetProviderRegistry();
  });

  afterEach(() => {
    resetProviderRegistry();
  });

  it('should create and initialize client', async () => {
    const registry = new DefaultProviderRegistry();
    const adapter = new MockProviderAdapter('openai');
    registry.register('openai', adapter);
    setProviderRegistry(registry);

    const config: LLMConfig = {
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4'
    };

    const client = await createLLMClient(config);

    expect(client).toBeInstanceOf(LLMClient);
    expect(client.getProvider()).toBe('openai');
  });

  it('should throw if initialization fails', async () => {
    const config: LLMConfig = {
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4'
    };

    await expect(createLLMClient(config)).rejects.toThrow();
  });
});
