// Shared types and utilities for scaling-memory

export interface AIAnalysisRequest {
  content: string;
  analysisType: 'summary' | 'keywords' | 'sentiment' | 'custom';
  metadata?: Record<string, unknown>;
}

export interface AIAnalysisResponse {
  result: unknown;
  error?: string;
  timestamp: number;
}

export const IPC_CHANNELS = {
  ANALYZE_REQUEST: 'ai:analyze:request',
  ANALYZE_RESPONSE: 'ai:analyze:response',
} as const;
