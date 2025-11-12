declare module '@ai-browsing/core' {
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

  export class ContentNormalizer {
    static normalize(content: PageContent): NormalizedContent;
    static isValidContent(content: NormalizedContent): boolean;
    static getContentHash(content: string): string;
  }

  export class ContentChunker {
    static chunkContent(content: string, maxChunkSize?: number, overlap?: number): ContentChunk[];
    static getRecommendedChunkSize(contentLength: number): number;
  }

  export class BrowsingAnalysisSDK {
    constructor(storageBackend?: StorageBackend);
    getSessionManager(): SessionManager;
    analyzePage(request: AnalysisRequest): Promise<AnalysisResult>;
  }

  export interface StorageBackend {
    save(key: string, data: any): Promise<void>;
    load(key: string): Promise<any>;
    remove(key: string): Promise<void>;
    list(pattern: string): Promise<string[]>;
  }

  export class MemoryStorageBackend implements StorageBackend {
    save(key: string, data: any): Promise<void>;
    load(key: string): Promise<any>;
    remove(key: string): Promise<void>;
    list(pattern: string): Promise<string[]>;
  }

  export class SessionManager {
    constructor(backend?: StorageBackend);
    createSession(sessionId: string, provider: LLMProvider, metadata?: Record<string, unknown>): Promise<SessionHistory>;
    getCurrentSessionId(): string | null;
    setCurrentSession(sessionId: string): void;
    addToSession(sessionId: string, result: AnalysisResult): Promise<SessionEntry>;
    getSession(sessionId: string): Promise<SessionHistory | undefined>;
    getEntry(entryId: string): Promise<SessionEntry | undefined>;
    listSessions(): Promise<SessionHistory[]>;
    listEntries(sessionId: string): Promise<SessionEntry[]>;
    clearSession(sessionId: string): Promise<void>;
    getSessionsByProvider(provider: LLMProvider): Promise<SessionHistory[]>;
    exportSession(sessionId: string): Promise<string>;
    importSession(jsonData: string): Promise<SessionHistory>;
  }
}
