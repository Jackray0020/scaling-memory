import { AnalysisResult, SessionEntry, SessionHistory, LLMProvider } from './types';
import { ContentNormalizer } from './normalizer';

/**
 * SessionStorage: Manages session history and local persistence
 */
export interface StorageBackend {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  list(pattern: string): Promise<string[]>;
}

export class MemoryStorageBackend implements StorageBackend {
  private store: Map<string, any> = new Map();

  async save(key: string, data: any): Promise<void> {
    this.store.set(key, JSON.parse(JSON.stringify(data)));
  }

  async load(key: string): Promise<any> {
    const data = this.store.get(key);
    return data ? JSON.parse(JSON.stringify(data)) : undefined;
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern);
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }
}

export class SessionManager {
  private backend: StorageBackend;
  private currentSessionId: string | null = null;

  constructor(backend?: StorageBackend) {
    this.backend = backend || new MemoryStorageBackend();
  }

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    provider: LLMProvider,
    metadata?: Record<string, unknown>
  ): Promise<SessionHistory> {
    const session: SessionHistory = {
      sessionId,
      entries: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider,
    };

    await this.backend.save(`session:${sessionId}`, session);
    this.currentSessionId = sessionId;
    return session;
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Set current session
   */
  setCurrentSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Add analysis result to session
   */
  async addToSession(
    sessionId: string,
    result: AnalysisResult
  ): Promise<SessionEntry> {
    const session = await this.backend.load(`session:${sessionId}`) as SessionHistory | undefined;
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const entry: SessionEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: result.timestamp,
      url: result.url,
      title: result.title,
      summary: result.summary,
      insights: result.insights,
      tradingSignals: result.tradingSignals,
      provider: result.provider,
      contentHash: ContentNormalizer.getContentHash(result.summary),
      chunkCount: result.chunkCount,
    };

    session.entries.push(entry);
    session.updatedAt = Date.now();
    await this.backend.save(`session:${sessionId}`, session);

    // Also save entry individually for quick access
    await this.backend.save(`entry:${entry.id}`, entry);

    return entry;
  }

  /**
   * Get session history
   */
  async getSession(sessionId: string): Promise<SessionHistory | undefined> {
    return this.backend.load(`session:${sessionId}`);
  }

  /**
   * Get session entry
   */
  async getEntry(entryId: string): Promise<SessionEntry | undefined> {
    return this.backend.load(`entry:${entryId}`);
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<SessionHistory[]> {
    const keys = await this.backend.list('session:.*');
    const sessions = await Promise.all(
      keys.map(key => this.backend.load(key))
    );
    return sessions.filter(s => s !== undefined);
  }

  /**
   * List all entries in a session
   */
  async listEntries(sessionId: string): Promise<SessionEntry[]> {
    const session = await this.getSession(sessionId);
    return session?.entries || [];
  }

  /**
   * Clear session
   */
  async clearSession(sessionId: string): Promise<void> {
    const session = await this.backend.load(`session:${sessionId}`) as SessionHistory | undefined;
    if (session) {
      for (const entry of session.entries) {
        await this.backend.remove(`entry:${entry.id}`);
      }
      await this.backend.remove(`session:${sessionId}`);
    }
  }

  /**
   * Get sessions by provider
   */
  async getSessionsByProvider(provider: LLMProvider): Promise<SessionHistory[]> {
    const sessions = await this.listSessions();
    return sessions.filter(s => s.provider === provider);
  }

  /**
   * Export session to JSON
   */
  async exportSession(sessionId: string): Promise<string> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return JSON.stringify(session, null, 2);
  }

  /**
   * Import session from JSON
   */
  async importSession(jsonData: string): Promise<SessionHistory> {
    const session: SessionHistory = JSON.parse(jsonData);
    await this.backend.save(`session:${session.sessionId}`, session);

    // Also save individual entries
    for (const entry of session.entries) {
      await this.backend.save(`entry:${entry.id}`, entry);
    }

    return session;
  }
}
