/**
 * Retry Handler
 * Implements exponential backoff retry logic
 */

import { RetryConfig } from './types';
import logger from '../logger';

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: RetryConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      initialDelayMs: config.initialDelayMs || 100,
      maxDelayMs: config.maxDelayMs || 30000,
      backoffMultiplier: config.backoffMultiplier || 2,
      timeoutMs: config.timeoutMs || 60000
    };
  }

  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param context Context/name for logging
   * @returns Result of the function
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries!; attempt++) {
      try {
        logger.debug(`Attempt ${attempt + 1}/${this.config.maxRetries! + 1} for ${context}`);

        const result = await Promise.race([
          fn(),
          this.createTimeoutPromise<T>()
        ]);

        logger.debug(`${context} succeeded on attempt ${attempt + 1}`);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `${context} failed on attempt ${attempt + 1}: ${lastError.message}`,
          { attempt, maxRetries: this.config.maxRetries }
        );

        if (attempt < this.config.maxRetries!) {
          const delay = this.calculateDelay(attempt);
          logger.debug(`Waiting ${delay}ms before retry for ${context}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    logger.error(
      `${context} failed after ${this.config.maxRetries! + 1} attempts`,
      { lastError: lastError?.message }
    );
    throw lastError || new Error(`${context} failed after ${this.config.maxRetries! + 1} attempts`);
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.initialDelayMs! * Math.pow(this.config.backoffMultiplier!, attempt);
    const delay = Math.min(exponentialDelay, this.config.maxDelayMs!);
    // Add jitter (±10%)
    const jitter = delay * 0.1 * (Math.random() - 0.5) * 2;
    return Math.max(0, delay + jitter);
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    // Retryable error patterns
    const retryablePatterns = [
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',
      '429', // Rate limit
      '500', // Internal server error
      '502', // Bad gateway
      '503', // Service unavailable
      '504'  // Gateway timeout
    ];

    return retryablePatterns.some((pattern) => error.message.includes(pattern));
  }
}
