/**
 * OpenAI Provider Adapter
 * Implements provider-specific logic for OpenAI API
 */

import OpenAI from 'openai';
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

export class OpenAIAdapter implements ProviderAdapter {
  private client: OpenAI;
  private config: LLMConfig;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;

  constructor(config: LLMConfig, rateLimiter?: RateLimiter, retryHandler?: RetryHandler) {
    this.config = config;
    this.rateLimiter = rateLimiter || new RateLimiter();
    this.retryHandler = retryHandler || new RetryHandler();

    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId
    });
  }

  getProviderName(): ProviderType {
    return 'openai';
  }

  async complete(
    messages: Message[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    return this.retryHandler.execute(async () => {
      await this.rateLimiter.waitForSlot();
      this.rateLimiter.recordRequest();

      try {
        logger.debug('OpenAI: Sending completion request', {
          model: this.config.model,
          messageCount: messages.length
        });

        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP
        });

        const choice = response.choices[0];
        const content = choice.message.content || '';

        logger.debug('OpenAI: Received response', {
          finishReason: choice.finish_reason,
          tokenUsage: response.usage
        });

        return {
          content,
          model: response.model,
          provider: 'openai',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0
          },
          finishReason: choice.finish_reason,
          raw: response
        };
      } finally {
        this.rateLimiter.releaseRequest();
      }
    }, 'OpenAI completion');
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
        logger.debug('OpenAI: Starting stream', {
          model: this.config.model,
          messageCount: messages.length
        });

        let fullContent = '';
        let totalTokens = 0;
        let finishReason = '';

        const stream = await this.client.chat.completions.create({
          model: this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          stream: true
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onChunk(delta);
          }
          if (chunk.choices[0]?.finish_reason) {
            finishReason = chunk.choices[0].finish_reason;
          }
        }

        logger.debug('OpenAI: Stream completed', {
          contentLength: fullContent.length,
          finishReason
        });

        return {
          content: fullContent,
          model: this.config.model,
          provider: 'openai',
          finishReason,
          raw: { streamed: true }
        };
      } finally {
        this.rateLimiter.releaseRequest();
      }
    }, 'OpenAI stream');
  }

  async validateConfig(config: LLMConfig): Promise<boolean> {
    try {
      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      if (!config.model) {
        throw new Error('OpenAI model is required');
      }

      // Test API connection with a simple request
      await this.client.models.retrieve(config.model);
      logger.info('OpenAI configuration validated successfully');
      return true;
    } catch (error) {
      logger.error('OpenAI configuration validation failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      logger.debug('OpenAI health check passed');
      return true;
    } catch (error) {
      logger.warn('OpenAI health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
