/**
 * Configuration management for LLM providers
 * Loads and validates configuration from environment variables
 */

import dotenv from 'dotenv';
import { LLMConfig, ProviderType, RateLimitConfig, RetryConfig } from '../llm/types';
import logger from '../logger';

dotenv.config();

/**
 * Get LLM configuration from environment variables
 * @throws Error if required environment variables are missing
 */
export function getLLMConfig(provider: ProviderType = 'openai'): LLMConfig {
  const config: LLMConfig = {
    provider,
    apiKey: getRequiredEnv(`${provider.toUpperCase()}_API_KEY`),
    model: getOptionalEnv(
      `${provider.toUpperCase()}_MODEL`,
      provider === 'openai' ? 'gpt-4' : 'claude-3-opus-20240229'
    ),
    maxTokens: parseInt(getOptionalEnv(`${provider.toUpperCase()}_MAX_TOKENS`, '2048'), 10),
    temperature: parseFloat(getOptionalEnv(`${provider.toUpperCase()}_TEMPERATURE`, '0.7')),
    topP: parseFloat(getOptionalEnv(`${provider.toUpperCase()}_TOP_P`, '1.0'))
  };

  if (provider === 'openai') {
    config.organizationId = getOptionalEnv('OPENAI_ORG_ID');
  }

  logger.info(`Loaded ${provider} configuration`, {
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  return config;
}

/**
 * Get rate limit configuration from environment
 */
export function getRateLimitConfig(): RateLimitConfig {
  return {
    requestsPerMinute: parseInt(getOptionalEnv('RATE_LIMIT_PER_MINUTE', '60'), 10),
    requestsPerHour: parseInt(getOptionalEnv('RATE_LIMIT_PER_HOUR', '3600'), 10),
    maxConcurrentRequests: parseInt(getOptionalEnv('MAX_CONCURRENT_REQUESTS', '10'), 10)
  };
}

/**
 * Get retry configuration from environment
 */
export function getRetryConfig(): RetryConfig {
  return {
    maxRetries: parseInt(getOptionalEnv('RETRY_MAX_RETRIES', '3'), 10),
    initialDelayMs: parseInt(getOptionalEnv('RETRY_INITIAL_DELAY_MS', '100'), 10),
    maxDelayMs: parseInt(getOptionalEnv('RETRY_MAX_DELAY_MS', '30000'), 10),
    backoffMultiplier: parseFloat(getOptionalEnv('RETRY_BACKOFF_MULTIPLIER', '2')),
    timeoutMs: parseInt(getOptionalEnv('RETRY_TIMEOUT_MS', '60000'), 10)
  };
}

/**
 * Get required environment variable or throw error
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable not found: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default fallback
 */
function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export { LLMConfig, ProviderType, RateLimitConfig, RetryConfig };
