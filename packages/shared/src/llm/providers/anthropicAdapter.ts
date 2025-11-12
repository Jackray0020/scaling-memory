/**
 * Anthropic Provider Adapter
 * Implements provider-specific logic for Anthropic Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  ProviderAdapter,
  LLMConfig,
  Message,
  LLMResponse,
  LLMRequestOptions,
  ProviderType
} from '../types';
import { RateLimiter } from '../rateLimiter';
import { RetryHandler } from '../retryHandler';
import logger from '../../logger';

export class AnthropicAdapter implements ProviderAdapter {
  private client: any;
  private config: LLMConfig;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;

  constructor(config: LLMConfig, rateLimiter?: RateLimiter, retryHandler?: RetryHandler) {
    this.config = config;
    this.rateLimiter = rateLimiter || new RateLimiter();
    this.retryHandler = retryHandler || new RetryHandler();

    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }

  getProviderName(): ProviderType {
    return 'anthropic';
  }

  async complete(
    messages: Message[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    return this.retryHandler.execute(async () => {
      await this.rateLimiter.waitForSlot();
      this.rateLimiter.recordRequest();

      try {
        logger.debug('Anthropic: Sending completion request', {
          model: this.config.model,
          messageCount: messages.length
        });

        // Extract system message if present
        const systemMessages = messages.filter((m) => m.role === 'system');
        const userMessages = messages.filter((m) => m.role !== 'system');

        const response = await this.client.messages.create({
          model: this.config.model,
          max_tokens: this.config.maxTokens || 2048,
          system: systemMessages.map((m) => m.content).join('\n') || undefined,
          messages: userMessages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        });

        const content = response.content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => (block.type === 'text' ? block.text : ''))
          .join('');

        logger.debug('Anthropic: Received response', {
          stopReason: response.stop_reason,
          tokenUsage: response.usage
        });

        return {
          content,
          model: response.model,
          provider: 'anthropic',
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens
          },
          finishReason: response.stop_reason,
          raw: response
        };
      } finally {
        this.rateLimiter.releaseRequest();
      }
    }, 'Anthropic completion');
  }

  async stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    return this.retryHandler.execute(async () => {
      await this.rateLimiter.waitForSlot();
      this.rateLimiter.recordRequest();

      try {
        logger.debug('Anthropic: Starting stream', {
          model: this.config.model,
          messageCount: messages.length
        });

        // Extract system message if present
        const systemMessages = messages.filter((m) => m.role === 'system');
        const userMessages = messages.filter((m) => m.role !== 'system');

        let fullContent = '';
        let finishReason = '';

        const stream = await this.client.messages.stream({
          model: this.config.model,
          max_tokens: this.config.maxTokens || 2048,
          system: systemMessages.map((m) => m.content).join('\n') || undefined,
          messages: userMessages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            fullContent += text;
            onChunk(text);
          }
          if (event.type === 'message_delta' && event.delta.stop_reason) {
            finishReason = event.delta.stop_reason;
          }
        }

        logger.debug('Anthropic: Stream completed', {
          contentLength: fullContent.length,
          finishReason
        });

        return {
          content: fullContent,
          model: this.config.model,
          provider: 'anthropic',
          finishReason,
          raw: { streamed: true }
        };
      } finally {
        this.rateLimiter.releaseRequest();
      }
    }, 'Anthropic stream');
  }

  async validateConfig(config: LLMConfig): Promise<boolean> {
    try {
      if (!config.apiKey) {
        throw new Error('Anthropic API key is required');
      }
      if (!config.model) {
        throw new Error('Anthropic model is required');
      }

      // Test API connection with a simple request
      await this.client.messages.create({
        model: config.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'ping'
          }
        ]
      });

      logger.info('Anthropic configuration validated successfully');
      return true;
    } catch (error) {
      logger.error('Anthropic configuration validation failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Anthropic SDK doesn't have a dedicated list method, so we'll do a quick test message
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'ok'
          }
        ]
      });

      logger.debug('Anthropic health check passed');
      return true;
    } catch (error) {
      logger.warn('Anthropic health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
