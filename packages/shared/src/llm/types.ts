/**
 * LLM Layer Type Definitions
 * Defines interfaces and types for the multi-provider LLM abstraction
 */

export type ProviderType = 'openai' | 'anthropic';

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message interface for LLM interactions
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Configuration for LLM provider credentials and settings
 */
export interface LLMConfig {
  provider: ProviderType;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  organizationId?: string; // For OpenAI
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  maxConcurrentRequests?: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
}

/**
 * Streaming options
 */
export interface StreamOptions {
  enabled: boolean;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

/**
 * LLM request options
 */
export interface LLMRequestOptions {
  streaming?: StreamOptions;
  rateLimit?: RateLimitConfig;
  retry?: RetryConfig;
}

/**
 * Response from LLM provider
 */
export interface LLMResponse {
  content: string;
  model: string;
  provider: ProviderType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  raw?: unknown;
}

/**
 * Provider adapter interface
 */
export interface ProviderAdapter {
  /**
   * Send a completion request to the provider
   */
  complete(
    messages: Message[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse>;

  /**
   * Stream a completion from the provider
   */
  stream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: LLMRequestOptions
  ): Promise<LLMResponse>;

  /**
   * Validate provider configuration
   */
  validateConfig(config: LLMConfig): Promise<boolean>;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get provider name
   */
  getProviderName(): ProviderType;
}

/**
 * Provider registry for managing multiple providers
 */
export interface ProviderRegistry {
  /**
   * Register a provider adapter
   */
  register(providerType: ProviderType, adapter: ProviderAdapter): void;

  /**
   * Get a registered provider adapter
   */
  get(providerType: ProviderType): ProviderAdapter | null;

  /**
   * Check if a provider is registered
   */
  has(providerType: ProviderType): boolean;

  /**
   * Get all registered providers
   */
  getAll(): Map<ProviderType, ProviderAdapter>;

  /**
   * Unregister a provider
   */
  unregister(providerType: ProviderType): void;
}
