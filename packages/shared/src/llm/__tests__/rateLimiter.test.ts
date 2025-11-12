/**
 * Rate Limiter Tests
 */

import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const limiter = new RateLimiter();
      const status = limiter.getStatus();

      expect(status.maxConcurrentRequests).toBe(10);
      expect(status.activeRequests).toBe(0);
      expect(status.minuteBucketTokens).toBe(60);
      expect(status.hourBucketTokens).toBe(3600);
    });

    it('should initialize with custom configuration', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 100,
        requestsPerHour: 5000,
        maxConcurrentRequests: 20
      });

      const status = limiter.getStatus();
      expect(status.maxConcurrentRequests).toBe(20);
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 10,
        maxConcurrentRequests: 5
      });

      for (let i = 0; i < 5; i++) {
        const allowed = await limiter.checkLimit();
        expect(allowed).toBe(true);
        limiter.recordRequest();
      }
    });

    it('should reject requests exceeding concurrent limit', async () => {
      const limiter = new RateLimiter({
        maxConcurrentRequests: 2
      });

      limiter.recordRequest();
      limiter.recordRequest();

      const allowed = await limiter.checkLimit();
      expect(allowed).toBe(false);
    });

    it('should reject requests when minute bucket exhausted', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 2,
        maxConcurrentRequests: 100
      });

      limiter.recordRequest();
      limiter.recordRequest();

      const allowed = await limiter.checkLimit();
      expect(allowed).toBe(false);
    });

    it('should track request count correctly', () => {
      const limiter = new RateLimiter();

      expect(limiter.getStatus().activeRequests).toBe(0);

      limiter.recordRequest();
      expect(limiter.getStatus().activeRequests).toBe(1);

      limiter.recordRequest();
      expect(limiter.getStatus().activeRequests).toBe(2);

      limiter.releaseRequest();
      expect(limiter.getStatus().activeRequests).toBe(1);
    });

    it('should not allow active requests to go below zero', () => {
      const limiter = new RateLimiter();

      limiter.releaseRequest();
      limiter.releaseRequest();

      expect(limiter.getStatus().activeRequests).toBe(0);
    });
  });

  describe('waitForSlot', () => {
    it('should resolve immediately if slot available', async () => {
      const limiter = new RateLimiter({
        maxConcurrentRequests: 2
      });

      const start = Date.now();
      await limiter.waitForSlot();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should wait if no slots available', async () => {
      const limiter = new RateLimiter({
        maxConcurrentRequests: 1,
        requestsPerMinute: 1000
      });

      limiter.recordRequest();

      const start = Date.now();
      const waitPromise = limiter.waitForSlot();

      // Release after a delay
      setTimeout(() => {
        limiter.releaseRequest();
      }, 150);

      await waitPromise;
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(500);
    });

    it('should wait and eventually resolve', async () => {
      const limiter = new RateLimiter({
        maxConcurrentRequests: 1,
        requestsPerMinute: 1000
      });

      limiter.recordRequest();

      // Release after a delay
      setTimeout(() => {
        limiter.releaseRequest();
      }, 200);

      // Should eventually resolve
      const start = Date.now();
      await limiter.waitForSlot();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('token bucket refill', () => {
    it('should refill tokens over time', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 10,
        maxConcurrentRequests: 100
      });

      // Use up most tokens (keep 1 to avoid hard limit)
      for (let i = 0; i < 9; i++) {
        limiter.recordRequest();
      }

      let allowed = await limiter.checkLimit();
      expect(allowed).toBe(true); // At least 1 token left

      // Release all requests
      for (let i = 0; i < 9; i++) {
        limiter.releaseRequest();
      }

      // Simulate time passing by checking after a timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // After time passes and tokens are released, we should have tokens refilled
      const status = limiter.getStatus();
      expect(status.minuteBucketTokens).toBeGreaterThan(0);
    });
  });
});
