/**
 * Retry Handler Tests
 */

import { RetryHandler } from '../retryHandler';

describe('RetryHandler', () => {
  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const handler = new RetryHandler();
      expect(handler).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const handler = new RetryHandler({
        maxRetries: 5,
        initialDelayMs: 50,
        maxDelayMs: 10000
      });
      expect(handler).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute function successfully', async () => {
      const handler = new RetryHandler();
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await handler.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const handler = new RetryHandler({
        maxRetries: 3,
        initialDelayMs: 10,
        maxDelayMs: 100
      });

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce('success');

      const result = await handler.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const handler = new RetryHandler({
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100
      });

      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(handler.execute(mockFn)).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should include context in error messages', async () => {
      const handler = new RetryHandler({
        maxRetries: 1,
        initialDelayMs: 10
      });

      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(handler.execute(mockFn, 'test operation')).rejects.toThrow();
      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle timeout correctly', async () => {
      const handler = new RetryHandler({
        maxRetries: 0,
        timeoutMs: 50
      });

      const mockFn = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('success'), 200);
          })
      );

      await expect(handler.execute(mockFn)).rejects.toThrow('timeout');
    });

    it('should apply exponential backoff', async () => {
      const handler = new RetryHandler({
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2
      });

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await handler.execute(mockFn);
      const duration = Date.now() - startTime;

      // With backoff: ~10ms + ~20ms + some jitter
      expect(duration).toBeGreaterThanOrEqual(20);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable connection errors', () => {
      const error1 = new Error('ECONNRESET');
      const error2 = new Error('ENOTFOUND');
      const error3 = new Error('ETIMEDOUT');

      expect(RetryHandler.isRetryableError(error1)).toBe(true);
      expect(RetryHandler.isRetryableError(error2)).toBe(true);
      expect(RetryHandler.isRetryableError(error3)).toBe(true);
    });

    it('should identify retryable HTTP status errors', () => {
      const error429 = new Error('429 Too Many Requests');
      const error500 = new Error('500 Internal Server Error');
      const error503 = new Error('503 Service Unavailable');

      expect(RetryHandler.isRetryableError(error429)).toBe(true);
      expect(RetryHandler.isRetryableError(error500)).toBe(true);
      expect(RetryHandler.isRetryableError(error503)).toBe(true);
    });

    it('should not identify non-retryable errors', () => {
      const error400 = new Error('400 Bad Request');
      const error401 = new Error('401 Unauthorized');
      const errorOther = new Error('Some other error');

      expect(RetryHandler.isRetryableError(error400)).toBe(false);
      expect(RetryHandler.isRetryableError(error401)).toBe(false);
      expect(RetryHandler.isRetryableError(errorOther)).toBe(false);
    });

    it('should handle non-Error types', () => {
      expect(RetryHandler.isRetryableError('string')).toBe(false);
      expect(RetryHandler.isRetryableError(123)).toBe(false);
      expect(RetryHandler.isRetryableError(null)).toBe(false);
      expect(RetryHandler.isRetryableError(undefined)).toBe(false);
    });
  });
});
