/**
 * LLM Client
 * Main interface for interacting with LLM providers
 * Provides a unified API for both streaming and non-streaming completions
 */

import {
  ProviderType,
  LLMConfig,
  Message,
  LLMResponse,
  LLMRequestOptions,
  ProviderAdapter
} from './types';
import { getProviderRegistry } from './registry';
import { RateLimitConfig, RetryConfig } from './types';
import logger from '../logger';

export class LLMClient {
  private config: LLMConfig;
  private adapter: ProviderAdapter | null = null;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Initialize the client with the specified provider
   */
  async initialize(): Promise<void> {
    const registry = getProviderRegistry();
    const adapter = registry.get(this.config.provider);

    if (!adapter) {
      throw new Error(
        `Provider "${this.config.provider}" is not registered. ` +
        `Available providers: ${Array.from(registry.getAll().keys()).join(', ')}`
      );
    }

    // Validate configuration
    const isValid = await adapter.validateConfig(this.config);
    if (!isValid) {
      throw new Error(`Failed to validate ${this.config.provider} configuration`);
    }

    this.adapter = adapter;
    logger.info(`LLMClient initialized with ${this.config.provider} provider`);
  }

  /**
   * Send a completion request
   */
  async complete(
    messages: Message[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    if (!this.adapter) {
      throw new Error('LLMClient not initialized. Call initialize() first.');
    }

    logger.debug('LLMClient: Sending completion request', {
      provider: this.config.provider,
      messageCount: messages.length
    });

    return this.adapter.complete(messages, options);
  }

  /**
   * Stream a completion
   */
  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    if (!this.adapter) {
      throw new Error('LLMClient not initialized. Call initialize() first.');
    }

    logger.debug('LLMClient: Starting stream', {
      provider: this.config.provider,
      messageCount: messages.length
    });

    return this.adapter.stream(messages, onChunk, options);
  }

  /**
   * Analyze text content using the LLM
   * Convenience method for common analysis tasks
   */
  async analyze(
    content: string,
    analysisPrompt: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for analyzing content.'
      },
      {
        role: 'user',
        content: `Please analyze the following content:\n\n${content}\n\nTask: ${analysisPrompt}`
      }
    ];

    return this.complete(messages, options);
  }

  /**
   * Get health status of the provider
   */
  async healthCheck(): Promise<boolean> {
    if (!this.adapter) {
      return false;
    }

    return this.adapter.healthCheck();
  }

  /**
   * Get current provider
   */
  getProvider(): ProviderType {
    return this.config.provider;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Get adapter (for advanced use cases)
   */
  getAdapter(): ProviderAdapter | null {
    return this.adapter;
  }
}

/**
 * Factory function to create and initialize LLM client
 */
export async function createLLMClient(config: LLMConfig): Promise<LLMClient> {
  const client = new LLMClient(config);
  await client.initialize();
  return client;
}

export { LLMConfig, ProviderType, Message, LLMResponse, LLMRequestOptions };
