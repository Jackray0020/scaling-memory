/**
 * LLM Provider Interfaces
 * Defines contracts for different LLM provider implementations with dependency inversion
 */

/**
 * LLM model capabilities
 */
export interface ModelCapabilities {
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  supportsSystemMessages: boolean;
  maxTokens: number;
  maxContextWindow: number;
}

/**
 * LLM model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapabilities;
  pricing?: {
    inputTokenCost: number;
    outputTokenCost: number;
    currency: string;
  };
}

/**
 * Message role in a conversation
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function',
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}

/**
 * Function call definition
 */
export interface FunctionCall {
  name: string;
  arguments: string;
}

/**
 * Function definition for LLM
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Completion request options
 */
export interface CompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  functions?: FunctionDefinition[];
  stream?: boolean;
}

/**
 * Completion response
 */
export interface CompletionResponse {
  id: string;
  model: string;
  message: ChatMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'error';
}

/**
 * Streaming chunk
 */
export interface CompletionChunk {
  id: string;
  model: string;
  delta: {
    role?: MessageRole;
    content?: string;
    functionCall?: Partial<FunctionCall>;
  };
  finishReason?: 'stop' | 'length' | 'function_call' | 'content_filter';
}

/**
 * Embedding request options
 */
export interface EmbeddingOptions {
  model: string;
  input: string | string[];
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  model: string;
  embeddings: number[][];
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM provider interface
 */
export interface LlmProvider {
  readonly name: string;
  readonly baseUrl?: string;
  
  listModels(): Promise<ModelInfo[]>;
  getModel(modelId: string): Promise<ModelInfo>;
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  streamComplete(
    options: CompletionOptions,
    onChunk: (chunk: CompletionChunk) => void
  ): Promise<void>;
  createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse>;
  healthCheck(): Promise<boolean>;
}

/**
 * LLM provider configuration
 */
export interface LlmProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
}

/**
 * Provider factory interface
 */
export interface LlmProviderFactory {
  create(config: LlmProviderConfig): LlmProvider;
  supports(providerName: string): boolean;
}

/**
 * Multi-provider manager interface
 */
export interface LlmProviderManager {
  registerProvider(name: string, provider: LlmProvider): void;
  unregisterProvider(name: string): void;
  getProvider(name: string): LlmProvider | undefined;
  listProviders(): string[];
  selectProvider(criteria: ProviderSelectionCriteria): LlmProvider | undefined;
}

/**
 * Provider selection criteria
 */
export interface ProviderSelectionCriteria {
  capabilities?: Partial<ModelCapabilities>;
  maxCost?: number;
  preferredProviders?: string[];
  excludedProviders?: string[];
}

/**
 * Token counting utility interface
 */
export interface TokenCounter {
  count(text: string, model: string): number;
  countMessages(messages: ChatMessage[], model: string): number;
}

/**
 * LLM response cache interface
 */
export interface LlmResponseCache {
  get(key: string): Promise<CompletionResponse | undefined>;
  set(key: string, response: CompletionResponse, ttl?: number): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Rate limiter interface for LLM requests
 */
export interface LlmRateLimiter {
  acquire(provider: string, tokens: number): Promise<void>;
  release(provider: string, tokens: number): void;
  getRemaining(provider: string): number;
}

/**
 * LLM request context
 */
export interface LlmRequestContext {
  requestId: string;
  timestamp: number;
  provider: string;
  model: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * LLM metrics interface
 */
export interface LlmMetrics {
  recordRequest(context: LlmRequestContext, response: CompletionResponse): void;
  recordError(context: LlmRequestContext, error: Error): void;
  getMetrics(provider?: string): LlmProviderMetrics;
}

/**
 * Provider metrics
 */
export interface LlmProviderMetrics {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
  estimatedCost: number;
}
