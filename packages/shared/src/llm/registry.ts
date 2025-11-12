/**
 * Provider Registry
 * Manages registration and retrieval of LLM provider adapters
 */

import { ProviderType, ProviderAdapter, ProviderRegistry } from './types';
import logger from '../logger';

/**
 * Default implementation of ProviderRegistry
 */
export class DefaultProviderRegistry implements ProviderRegistry {
  private providers: Map<ProviderType, ProviderAdapter> = new Map();

  register(providerType: ProviderType, adapter: ProviderAdapter): void {
    if (this.providers.has(providerType)) {
      logger.warn(`Provider ${providerType} is already registered, overwriting`);
    }
    this.providers.set(providerType, adapter);
    logger.info(`Registered provider: ${providerType}`);
  }

  get(providerType: ProviderType): ProviderAdapter | null {
    return this.providers.get(providerType) || null;
  }

  has(providerType: ProviderType): boolean {
    return this.providers.has(providerType);
  }

  getAll(): Map<ProviderType, ProviderAdapter> {
    return new Map(this.providers);
  }

  unregister(providerType: ProviderType): void {
    if (this.providers.delete(providerType)) {
      logger.info(`Unregistered provider: ${providerType}`);
    }
  }
}

/**
 * Global provider registry instance
 */
let globalRegistry: ProviderRegistry | null = null;

/**
 * Get or create global provider registry
 */
export function getProviderRegistry(): ProviderRegistry {
  if (!globalRegistry) {
    globalRegistry = new DefaultProviderRegistry();
  }
  return globalRegistry;
}

/**
 * Set global provider registry (useful for testing)
 */
export function setProviderRegistry(registry: ProviderRegistry): void {
  globalRegistry = registry;
}

/**
 * Reset global provider registry (useful for testing)
 */
export function resetProviderRegistry(): void {
  globalRegistry = null;
}

export { ProviderRegistry };
