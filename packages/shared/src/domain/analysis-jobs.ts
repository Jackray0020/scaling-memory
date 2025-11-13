/**
 * Analysis job domain models
 * Represents background jobs for market analysis and processing
 */

/**
 * Job status enumeration
 */
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Job priority levels
 */
export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Types of analysis jobs
 */
export enum JobType {
  TECHNICAL_ANALYSIS = 'technical_analysis',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  PATTERN_RECOGNITION = 'pattern_recognition',
  BACKTESTING = 'backtesting',
  DATA_COLLECTION = 'data_collection',
  CUSTOM = 'custom',
}

/**
 * Base analysis job interface
 */
export interface AnalysisJob {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: JobError;
  progress?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Job error details
 */
export interface JobError {
  code: string;
  message: string;
  stack?: string;
  timestamp: number;
}

/**
 * Job execution context
 */
export interface JobContext {
  jobId: string;
  startTime: number;
  timeoutMs?: number;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Job result wrapper
 */
export interface JobResult<T = unknown> {
  jobId: string;
  status: JobStatus;
  data?: T;
  error?: JobError;
  executionTimeMs: number;
  timestamp: number;
}

/**
 * Technical analysis job parameters
 */
export interface TechnicalAnalysisParams {
  symbol: string;
  indicators: string[];
  timeframe: string;
  startDate?: number;
  endDate?: number;
}

/**
 * Sentiment analysis job parameters
 */
export interface SentimentAnalysisParams {
  sources: string[];
  keywords: string[];
  startDate: number;
  endDate: number;
  language?: string;
}

/**
 * Job queue message
 */
export interface JobMessage {
  job: AnalysisJob;
  queuedAt: number;
  attemptNumber: number;
}

/**
 * Serialization utilities for analysis jobs
 */
export const JobSerializer = {
  serializeJob(job: AnalysisJob): string {
    return JSON.stringify(job);
  },

  deserializeJob(data: string): AnalysisJob {
    const parsed = JSON.parse(data);
    return {
      id: String(parsed.id),
      type: parsed.type as JobType,
      status: parsed.status as JobStatus,
      priority: Number(parsed.priority) as JobPriority,
      createdAt: Number(parsed.createdAt),
      updatedAt: Number(parsed.updatedAt),
      startedAt: parsed.startedAt !== undefined ? Number(parsed.startedAt) : undefined,
      completedAt: parsed.completedAt !== undefined ? Number(parsed.completedAt) : undefined,
      parameters: parsed.parameters || {},
      result: parsed.result,
      error: parsed.error,
      progress: parsed.progress !== undefined ? Number(parsed.progress) : undefined,
      metadata: parsed.metadata,
    };
  },

  serializeJobResult<T>(result: JobResult<T>): string {
    return JSON.stringify(result);
  },

  deserializeJobResult<T = unknown>(data: string): JobResult<T> {
    const parsed = JSON.parse(data);
    return {
      jobId: String(parsed.jobId),
      status: parsed.status as JobStatus,
      data: parsed.data as T | undefined,
      error: parsed.error,
      executionTimeMs: Number(parsed.executionTimeMs),
      timestamp: Number(parsed.timestamp),
    };
  },
};

/**
 * Utility to create a new analysis job
 */
export function createAnalysisJob(
  type: JobType,
  parameters: Record<string, unknown>,
  options?: {
    priority?: JobPriority;
    metadata?: Record<string, unknown>;
  }
): AnalysisJob {
  const now = Date.now();
  return {
    id: `job_${now}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: JobStatus.PENDING,
    priority: options?.priority ?? JobPriority.NORMAL,
    createdAt: now,
    updatedAt: now,
    parameters,
    metadata: options?.metadata,
  };
}
