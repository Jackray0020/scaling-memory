export type DataType = 'market' | 'news';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  metadata?: Record<string, any>;
}

export interface NewsData {
  title: string;
  summary?: string;
  url: string;
  publishedAt: Date;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FinancialData {
  id: string;
  source: string;
  type: DataType;
  timestamp: Date;
  data: MarketData | NewsData;
}

export interface ConnectorConfig {
  name: string;
  endpoint?: string;
  apiKey?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rateLimit?: number;
  retryAttempts?: number;
  timeout?: number;
  [key: string]: any;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface JobConfig {
  id: string;
  name: string;
  connectorName: string;
  schedule: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface JobResult {
  jobId: string;
  success: boolean;
  data?: FinancialData[];
  error?: string;
  timestamp: Date;
  duration: number;
}
