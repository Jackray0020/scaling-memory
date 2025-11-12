// Export types
export * from './types';

// Export normalizer
export { ContentNormalizer, ContentChunker } from './normalizer';

// Export LLM providers
export {
  LLMProviderBase,
  OpenAIProvider,
  ClaudeProvider,
  GeminiProvider,
  LocalProvider,
  LLMProviderFactory,
} from './llm-provider';

// Export analyzer
export { BrowsingAnalyzer } from './analyzer';

// Export session storage
export {
  SessionManager,
  MemoryStorageBackend,
  StorageBackend,
} from './session-storage';

/**
 * BrowsingAnalysisSDK: Main entry point for the AI browsing workflow
 */
export class BrowsingAnalysisSDK {
  private analyzer: typeof import('./analyzer').BrowsingAnalyzer;
  private sessionManager: import('./session-storage').SessionManager;
  private normalizer: typeof import('./normalizer').ContentNormalizer;

  constructor(storageBackend?: import('./session-storage').StorageBackend) {
    const { BrowsingAnalyzer } = require('./analyzer');
    const { SessionManager } = require('./session-storage');
    const { ContentNormalizer } = require('./normalizer');

    this.analyzer = BrowsingAnalyzer;
    this.sessionManager = new SessionManager(storageBackend);
    this.normalizer = ContentNormalizer;
  }

  /**
   * Get session manager
   */
  getSessionManager(): import('./session-storage').SessionManager {
    return this.sessionManager;
  }

  /**
   * Analyze page content with full pipeline
   */
  async analyzePage(request: import('./types').AnalysisRequest): Promise<import('./types').AnalysisResult> {
    // Normalize content
    const normalized = this.normalizer.normalize({
      url: request.content.url,
      title: request.content.title,
      html: request.content.content,
      text: request.content.content,
    });

    // Run analysis
    const result = await this.analyzer.analyze({
      ...request,
      content: normalized,
    });

    // Store in session if session ID provided
    if (result.sessionId) {
      try {
        await this.sessionManager.addToSession(result.sessionId, result);
      } catch (error) {
        // Session might not exist, create it
        if (error instanceof Error && error.message.includes('not found')) {
          await this.sessionManager.createSession(result.sessionId, result.provider);
          await this.sessionManager.addToSession(result.sessionId, result);
        }
      }
    }

    return result;
  }
}
