import { ConnectorConfig, FinancialData, CacheEntry } from '../core/types';

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  private cache: Map<string, CacheEntry<any>>;
  private lastRequestTime: number = 0;

  constructor(config: ConnectorConfig) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 300000,
      rateLimit: 1000,
      retryAttempts: 3,
      timeout: 10000,
      ...config,
    };
    this.cache = new Map();
  }

  abstract fetch(): Promise<FinancialData[]>;

  protected async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        return cached;
      }
    }

    await this.enforceRateLimit();

    const data = await this.retry(fetchFn);

    if (this.config.cacheEnabled) {
      this.setCache(key, data);
    }

    return data;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL || 300000,
    });
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = this.config.rateLimit || 1000;

    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  protected async retry<T>(
    fn: () => Promise<T>,
    attempts: number = this.config.retryAttempts || 3
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }
        await this.sleep(Math.pow(2, i) * 1000);
      }
    }
    throw new Error('Max retry attempts reached');
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected generateId(source: string, identifier: string): string {
    return `${source}_${identifier}_${Date.now()}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getName(): string {
    return this.config.name;
  }
}
