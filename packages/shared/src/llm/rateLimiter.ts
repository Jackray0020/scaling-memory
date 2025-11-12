/**
 * Rate Limiter
 * Implements token bucket algorithm for rate limiting
 */

import { RateLimitConfig } from './types';
import logger from '../logger';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private minuteBucket: TokenBucket;
  private hourBucket: TokenBucket;
  private activeRequests: number = 0;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      requestsPerMinute: config.requestsPerMinute || 60,
      requestsPerHour: config.requestsPerHour || 3600,
      maxConcurrentRequests: config.maxConcurrentRequests || 10
    };

    this.minuteBucket = {
      tokens: this.config.requestsPerMinute!,
      lastRefill: Date.now()
    };

    this.hourBucket = {
      tokens: this.config.requestsPerHour!,
      lastRefill: Date.now()
    };
  }

  /**
   * Check if a request can be made
   * Returns true if request is allowed, false otherwise
   */
  async checkLimit(): Promise<boolean> {
    if (this.activeRequests >= this.config.maxConcurrentRequests!) {
      logger.warn(`Rate limit: max concurrent requests reached (${this.activeRequests})`);
      return false;
    }

    this.refillBuckets();

    if (this.minuteBucket.tokens < 1) {
      logger.warn('Rate limit: minute bucket exhausted');
      return false;
    }

    if (this.hourBucket.tokens < 1) {
      logger.warn('Rate limit: hour bucket exhausted');
      return false;
    }

    return true;
  }

  /**
   * Record a request (should be called before making the request)
   */
  recordRequest(): void {
    this.activeRequests++;
    this.minuteBucket.tokens--;
    this.hourBucket.tokens--;
  }

  /**
   * Release a request (should be called after request completes)
   */
  releaseRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /**
   * Wait until a request can be made
   */
  async waitForSlot(): Promise<void> {
    const startTime = Date.now();
    const maxWaitTime = 60000; // 60 seconds

    while (!(await this.checkLimit())) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Rate limit: exceeded maximum wait time');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Refill buckets based on elapsed time
   */
  private refillBuckets(): void {
    const now = Date.now();

    // Refill minute bucket
    const minuteElapsed = (now - this.minuteBucket.lastRefill) / 60000;
    if (minuteElapsed > 0) {
      const tokensToAdd = minuteElapsed * this.config.requestsPerMinute!;
      this.minuteBucket.tokens = Math.min(
        this.config.requestsPerMinute!,
        this.minuteBucket.tokens + tokensToAdd
      );
      this.minuteBucket.lastRefill = now;
    }

    // Refill hour bucket
    const hourElapsed = (now - this.hourBucket.lastRefill) / 3600000;
    if (hourElapsed > 0) {
      const tokensToAdd = hourElapsed * this.config.requestsPerHour!;
      this.hourBucket.tokens = Math.min(
        this.config.requestsPerHour!,
        this.hourBucket.tokens + tokensToAdd
      );
      this.hourBucket.lastRefill = now;
    }
  }

  /**
   * Get current limits status
   */
  getStatus() {
    return {
      activeRequests: this.activeRequests,
      minuteBucketTokens: Math.floor(this.minuteBucket.tokens),
      hourBucketTokens: Math.floor(this.hourBucket.tokens),
      maxConcurrentRequests: this.config.maxConcurrentRequests
    };
  }
}
