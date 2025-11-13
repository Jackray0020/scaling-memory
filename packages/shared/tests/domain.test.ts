import { describe, it, expect } from 'vitest';
import {
  TimeInterval,
  DataSource,
  MarketDataSerializer,
  type Candle,
  type Tick,
  type MarketDataSnapshot,
  JobStatus,
  JobPriority,
  JobType,
  JobSerializer,
  createAnalysisJob,
  type AnalysisJob,
  type JobResult,
} from '../src/domain/index.js';

describe('Market Data Domain', () => {
  describe('Candle serialization', () => {
    it('should serialize and deserialize candle correctly', () => {
      const candle: Candle = {
        timestamp: Date.now(),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000,
        symbol: 'BTC/USD',
        interval: TimeInterval.HOUR_1,
      };

      const serialized = MarketDataSerializer.serializeCandle(candle);
      const deserialized = MarketDataSerializer.deserializeCandle(serialized);

      expect(deserialized).toEqual(candle);
      expect(deserialized.timestamp).toBe(candle.timestamp);
      expect(deserialized.open).toBe(candle.open);
      expect(deserialized.symbol).toBe(candle.symbol);
    });

    it('should handle numeric string conversion in deserialization', () => {
      const data = JSON.stringify({
        timestamp: '1234567890',
        open: '100.50',
        high: '110.25',
        low: '95.75',
        close: '105.00',
        volume: '1000.5',
        symbol: 'ETH/USD',
        interval: TimeInterval.MINUTE_5,
      });

      const candle = MarketDataSerializer.deserializeCandle(data);

      expect(typeof candle.timestamp).toBe('number');
      expect(typeof candle.open).toBe('number');
      expect(candle.open).toBe(100.50);
      expect(candle.volume).toBe(1000.5);
    });
  });

  describe('Tick serialization', () => {
    it('should serialize and deserialize tick correctly', () => {
      const tick: Tick = {
        timestamp: Date.now(),
        symbol: 'BTC/USD',
        price: 50000,
        volume: 0.5,
        source: DataSource.WEBSOCKET,
      };

      const serialized = MarketDataSerializer.serializeTick(tick);
      const deserialized = MarketDataSerializer.deserializeTick(serialized);

      expect(deserialized).toEqual(tick);
    });
  });

  describe('MarketDataSnapshot serialization', () => {
    it('should serialize and deserialize snapshot with all fields', () => {
      const snapshot: MarketDataSnapshot = {
        symbol: 'BTC/USD',
        timestamp: Date.now(),
        lastPrice: 50000,
        candles: [
          {
            timestamp: Date.now() - 3600000,
            open: 49000,
            high: 50500,
            low: 48500,
            close: 50000,
            volume: 100,
            symbol: 'BTC/USD',
            interval: TimeInterval.HOUR_1,
          },
        ],
        volume24h: 10000,
        priceChange24h: 5,
      };

      const serialized = MarketDataSerializer.serializeSnapshot(snapshot);
      const deserialized = MarketDataSerializer.deserializeSnapshot(serialized);

      expect(deserialized.symbol).toBe(snapshot.symbol);
      expect(deserialized.lastPrice).toBe(snapshot.lastPrice);
      expect(deserialized.candles).toHaveLength(1);
      expect(deserialized.volume24h).toBe(snapshot.volume24h);
    });

    it('should handle snapshot with minimal fields', () => {
      const snapshot: MarketDataSnapshot = {
        symbol: 'ETH/USD',
        timestamp: Date.now(),
        lastPrice: 3000,
      };

      const serialized = MarketDataSerializer.serializeSnapshot(snapshot);
      const deserialized = MarketDataSerializer.deserializeSnapshot(serialized);

      expect(deserialized.symbol).toBe(snapshot.symbol);
      expect(deserialized.candles).toBeUndefined();
      expect(deserialized.volume24h).toBeUndefined();
    });
  });
});

describe('Analysis Jobs Domain', () => {
  describe('Job creation', () => {
    it('should create analysis job with default values', () => {
      const params = { symbol: 'BTC/USD', indicators: ['RSI', 'MACD'] };
      const job = createAnalysisJob(JobType.TECHNICAL_ANALYSIS, params);

      expect(job.id).toBeDefined();
      expect(job.type).toBe(JobType.TECHNICAL_ANALYSIS);
      expect(job.status).toBe(JobStatus.PENDING);
      expect(job.priority).toBe(JobPriority.NORMAL);
      expect(job.parameters).toEqual(params);
      expect(job.createdAt).toBeDefined();
    });

    it('should create job with custom priority and metadata', () => {
      const params = { keywords: ['bitcoin'] };
      const job = createAnalysisJob(JobType.SENTIMENT_ANALYSIS, params, {
        priority: JobPriority.HIGH,
        metadata: { source: 'user-request' },
      });

      expect(job.priority).toBe(JobPriority.HIGH);
      expect(job.metadata).toEqual({ source: 'user-request' });
    });

    it('should generate unique job IDs', () => {
      const job1 = createAnalysisJob(JobType.DATA_COLLECTION, {});
      const job2 = createAnalysisJob(JobType.DATA_COLLECTION, {});

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('Job serialization', () => {
    it('should serialize and deserialize job correctly', () => {
      const job: AnalysisJob = {
        id: 'job_123',
        type: JobType.BACKTESTING,
        status: JobStatus.RUNNING,
        priority: JobPriority.HIGH,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: Date.now(),
        parameters: { strategy: 'momentum' },
        progress: 50,
      };

      const serialized = JobSerializer.serializeJob(job);
      const deserialized = JobSerializer.deserializeJob(serialized);

      expect(deserialized.id).toBe(job.id);
      expect(deserialized.type).toBe(job.type);
      expect(deserialized.status).toBe(job.status);
      expect(deserialized.priority).toBe(job.priority);
      expect(deserialized.progress).toBe(job.progress);
    });

    it('should handle optional fields in deserialization', () => {
      const data = JSON.stringify({
        id: 'job_456',
        type: JobType.CUSTOM,
        status: JobStatus.COMPLETED,
        priority: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        parameters: {},
      });

      const job = JobSerializer.deserializeJob(data);

      expect(job.startedAt).toBeUndefined();
      expect(job.completedAt).toBeUndefined();
      expect(job.error).toBeUndefined();
    });
  });

  describe('JobResult serialization', () => {
    it('should serialize and deserialize job result', () => {
      const result: JobResult<{ score: number }> = {
        jobId: 'job_789',
        status: JobStatus.COMPLETED,
        data: { score: 85 },
        executionTimeMs: 1500,
        timestamp: Date.now(),
      };

      const serialized = JobSerializer.serializeJobResult(result);
      const deserialized = JobSerializer.deserializeJobResult<{ score: number }>(serialized);

      expect(deserialized.jobId).toBe(result.jobId);
      expect(deserialized.status).toBe(result.status);
      expect(deserialized.data?.score).toBe(85);
      expect(deserialized.executionTimeMs).toBe(result.executionTimeMs);
    });

    it('should handle error in job result', () => {
      const result: JobResult = {
        jobId: 'job_error',
        status: JobStatus.FAILED,
        error: {
          code: 'TIMEOUT',
          message: 'Job execution timed out',
          timestamp: Date.now(),
        },
        executionTimeMs: 5000,
        timestamp: Date.now(),
      };

      const serialized = JobSerializer.serializeJobResult(result);
      const deserialized = JobSerializer.deserializeJobResult(serialized);

      expect(deserialized.status).toBe(JobStatus.FAILED);
      expect(deserialized.error?.code).toBe('TIMEOUT');
      expect(deserialized.data).toBeUndefined();
    });
  });
});
