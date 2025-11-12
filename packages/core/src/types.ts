/**
 * Content capture and normalization types
 */
export interface PageContent {
  url: string;
  title: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface NormalizedContent {
  url: string;
  title: string;
  content: string;
  chunks?: ContentChunk[];
  metadata?: Record<string, unknown>;
}

export interface ContentChunk {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
}

/**
 * LLM Provider types
 */
export type LLMProvider = 'openai' | 'claude' | 'gemini' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model?: string;
}

/**
 * Analysis and insights types
 */
export interface AnalysisRequest {
  content: NormalizedContent;
  provider: LLMProvider;
  config?: Partial<LLMConfig>;
  enableMCP?: boolean;
  sessionId?: string;
}

export interface AnalysisResult {
  sessionId: string;
  url: string;
  title: string;
  summary: string;
  insights: string[];
  tradingSignals?: TradingSignal[];
  timestamp: number;
  provider: LLMProvider;
  chunkCount?: number;
  totalTokens?: number;
}

export interface TradingSignal {
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  indicators?: string[];
}

/**
 * Session and history types
 */
export interface SessionEntry {
  id: string;
  timestamp: number;
  url: string;
  title: string;
  summary: string;
  insights: string[];
  tradingSignals?: TradingSignal[];
  provider: LLMProvider;
  contentHash: string;
  chunkCount?: number;
}

export interface SessionHistory {
  sessionId: string;
  entries: SessionEntry[];
  createdAt: number;
  updatedAt: number;
  provider: LLMProvider;
}

/**
 * Trigger and control types
 */
export interface AnalysisTrigger {
  type: 'manual' | 'auto';
  condition?: string;
}

export interface ProviderSettings {
  currentProvider: LLMProvider;
  providers: Record<LLMProvider, Partial<LLMConfig>>;
  enableMCP: boolean;
}

/**
 * Error types
 */
export interface AnalysisError {
  code: string;
  message: string;
  details?: unknown;
}
