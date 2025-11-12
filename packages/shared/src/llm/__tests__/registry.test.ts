/**
 * Provider Registry Tests
 */

import {
  DefaultProviderRegistry,
  getProviderRegistry,
  setProviderRegistry,
  resetProviderRegistry
} from '../registry';
import { MockProviderAdapter } from './mocks';

describe('Provider Registry', () => {
  beforeEach(() => {
    resetProviderRegistry();
  });

  afterEach(() => {
    resetProviderRegistry();
  });

  describe('DefaultProviderRegistry', () => {
    it('should register and retrieve providers', () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');

      registry.register('openai', adapter);

      expect(registry.get('openai')).toBe(adapter);
      expect(registry.has('openai')).toBe(true);
    });

    it('should return null for unregistered providers', () => {
      const registry = new DefaultProviderRegistry();

      expect(registry.get('openai')).toBeNull();
      expect(registry.has('openai')).toBe(false);
    });

    it('should unregister providers', () => {
      const registry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');

      registry.register('openai', adapter);
      expect(registry.has('openai')).toBe(true);

      registry.unregister('openai');
      expect(registry.has('openai')).toBe(false);
    });

    it('should get all registered providers', () => {
      const registry = new DefaultProviderRegistry();
      const openaiAdapter = new MockProviderAdapter('openai');
      const anthropicAdapter = new MockProviderAdapter('anthropic');

      registry.register('openai', openaiAdapter);
      registry.register('anthropic', anthropicAdapter);

      const all = registry.getAll();
      expect(all.size).toBe(2);
      expect(all.get('openai')).toBe(openaiAdapter);
      expect(all.get('anthropic')).toBe(anthropicAdapter);
    });

    it('should overwrite existing provider on re-registration', () => {
      const registry = new DefaultProviderRegistry();
      const adapter1 = new MockProviderAdapter('openai');
      const adapter2 = new MockProviderAdapter('openai');

      registry.register('openai', adapter1);
      registry.register('openai', adapter2);

      expect(registry.get('openai')).toBe(adapter2);
    });
  });

  describe('Global Registry', () => {
    it('should return same instance on multiple calls', () => {
      const registry1 = getProviderRegistry();
      const registry2 = getProviderRegistry();

      expect(registry1).toBe(registry2);
    });

    it('should allow setting custom registry', () => {
      const customRegistry = new DefaultProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      customRegistry.register('openai', adapter);

      setProviderRegistry(customRegistry);

      const registry = getProviderRegistry();
      expect(registry.get('openai')).toBe(adapter);
    });

    it('should reset to null and create new instance', () => {
      const registry1 = getProviderRegistry();
      const adapter = new MockProviderAdapter('openai');
      registry1.register('openai', adapter);

      resetProviderRegistry();

      const registry2 = getProviderRegistry();
      expect(registry2).not.toBe(registry1);
      expect(registry2.has('openai')).toBe(false);
    });
  });
});
