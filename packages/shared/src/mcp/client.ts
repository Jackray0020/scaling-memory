import {
  MCPServerConfig,
  MCPSession,
  MCPResponse,
  MCPClientOptions,
  MCPLogger,
  MCPConnectionState,
  MCPQueryOptions,
  MCPEventHandler,
  MCPEvent,
  MCPEventType
} from './types';
import { MCPConfigManager } from './config';
import { MCPSessionManager } from './session';
import { MCPSerializer } from './serializer';

export class MCPClient {
  private configManager: MCPConfigManager;
  private sessionManager: MCPSessionManager;
  private serializer: MCPSerializer;
  private options: Required<MCPClientOptions>;
  private eventHandlers: Map<MCPEventType, Set<MCPEventHandler>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  constructor(options: MCPClientOptions = {}) {
    this.configManager = new MCPConfigManager();
    this.sessionManager = new MCPSessionManager();
    this.serializer = new MCPSerializer();
    
    this.options = {
      defaultTimeout: options.defaultTimeout || 30000,
      autoReconnect: options.autoReconnect !== false,
      reconnectDelay: options.reconnectDelay || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 3,
      logger: options.logger || this.createDefaultLogger()
    };
  }

  registerServer(config: MCPServerConfig): void {
    this.configManager.registerServer(config);
    this.sessionManager.createSession(config.id);
    this.options.logger.info(`Server registered: ${config.id}`);
  }

  unregisterServer(serverId: string): boolean {
    const session = this.sessionManager.getSession(serverId);
    if (session?.connected) {
      this.disconnect(serverId).catch(err => {
        this.options.logger.error(`Error disconnecting server during unregister: ${err}`);
      });
    }

    this.sessionManager.destroySession(serverId);
    const result = this.configManager.unregisterServer(serverId);
    
    if (result) {
      this.options.logger.info(`Server unregistered: ${serverId}`);
    }
    
    return result;
  }

  async connect(serverId: string): Promise<MCPSession> {
    const config = this.configManager.getServer(serverId);
    if (!config) {
      throw new Error(`Server not found: ${serverId}`);
    }

    const session = this.sessionManager.getSession(serverId);
    if (!session) {
      throw new Error(`Session not found for server: ${serverId}`);
    }

    if (session.connected) {
      this.options.logger.debug(`Server already connected: ${serverId}`);
      return session;
    }

    this.sessionManager.setConnectionState(serverId, MCPConnectionState.CONNECTING);
    this.options.logger.info(`Connecting to server: ${serverId} at ${config.endpoint}`);

    try {
      await this.performConnection(config);
      
      this.sessionManager.markConnected(serverId);
      this.reconnectAttempts.delete(serverId);
      this.clearReconnectTimer(serverId);
      
      this.emitEvent({
        type: 'connected',
        serverId,
        timestamp: new Date()
      });

      this.options.logger.info(`Successfully connected to server: ${serverId}`);
      
      return this.sessionManager.getSession(serverId)!;
    } catch (error) {
      this.sessionManager.setConnectionState(serverId, MCPConnectionState.FAILED);
      this.options.logger.error(`Failed to connect to server ${serverId}: ${error}`);
      
      if (this.options.autoReconnect) {
        this.scheduleReconnect(serverId);
      }
      
      throw error;
    }
  }

  async disconnect(serverId: string): Promise<void> {
    const session = this.sessionManager.getSession(serverId);
    if (!session) {
      throw new Error(`Session not found for server: ${serverId}`);
    }

    if (!session.connected) {
      this.options.logger.debug(`Server already disconnected: ${serverId}`);
      return;
    }

    this.options.logger.info(`Disconnecting from server: ${serverId}`);
    this.clearReconnectTimer(serverId);

    try {
      await this.performDisconnection(serverId);
      this.sessionManager.markDisconnected(serverId);
      
      this.emitEvent({
        type: 'disconnected',
        serverId,
        timestamp: new Date()
      });

      this.options.logger.info(`Successfully disconnected from server: ${serverId}`);
    } catch (error) {
      this.options.logger.error(`Error during disconnect from ${serverId}: ${error}`);
      throw error;
    }
  }

  async query<T = unknown>(
    serverId: string,
    method: string,
    params?: Record<string, unknown>,
    options?: MCPQueryOptions
  ): Promise<MCPResponse<T>> {
    const session = this.sessionManager.getSession(serverId);
    if (!session) {
      throw new Error(`Session not found for server: ${serverId}`);
    }

    if (!session.connected) {
      throw new Error(`Server not connected: ${serverId}`);
    }

    const timeout = options?.timeout || this.options.defaultTimeout;
    const shouldRetry = options?.retry !== false;

    this.options.logger.debug(`Querying server ${serverId}: ${method}`, params);

    try {
      const response = await this.executeQuery<T>(serverId, method, params, timeout);
      this.sessionManager.updateLastActivity(serverId);
      
      if (!response.success) {
        this.options.logger.warn(`Query failed: ${method}`, response.error);
      }
      
      return response;
    } catch (error) {
      this.options.logger.error(`Query error for ${method}: ${error}`);
      
      if (shouldRetry && this.isRetryableError(error)) {
        this.options.logger.info(`Retrying query: ${method}`);
        return this.executeQuery<T>(serverId, method, params, timeout);
      }
      
      throw error;
    }
  }

  getSession(serverId: string): MCPSession | undefined {
    return this.sessionManager.getSession(serverId);
  }

  getConnectionState(serverId: string): MCPConnectionState {
    return this.sessionManager.getConnectionState(serverId);
  }

  getAllServers(): MCPServerConfig[] {
    return this.configManager.getAllServers();
  }

  on(event: MCPEventType, handler: MCPEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: MCPEventType, handler: MCPEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private async performConnection(config: MCPServerConfig): Promise<void> {
    const timeout = config.timeout || this.options.defaultTimeout;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);

      this.simulateConnection(config)
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private async performDisconnection(serverId: string): Promise<void> {
    await this.simulateDisconnection(serverId);
  }

  private async executeQuery<T>(
    serverId: string,
    method: string,
    params: Record<string, unknown> | undefined,
    timeout: number
  ): Promise<MCPResponse<T>> {
    const requestData = this.serializer.serializeRequest(method, params);
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeout}ms`));
      }, timeout);

      this.simulateQuery<T>(serverId, requestData)
        .then(responseData => {
          clearTimeout(timer);
          const response = this.serializer.deserializeResponse<T>(responseData);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private scheduleReconnect(serverId: string): void {
    const attempts = this.reconnectAttempts.get(serverId) || 0;
    
    if (attempts >= this.options.maxReconnectAttempts) {
      this.options.logger.warn(`Max reconnect attempts reached for server: ${serverId}`);
      return;
    }

    this.reconnectAttempts.set(serverId, attempts + 1);
    this.sessionManager.setConnectionState(serverId, MCPConnectionState.RECONNECTING);
    
    this.emitEvent({
      type: 'reconnecting',
      serverId,
      timestamp: new Date(),
      data: { attempt: attempts + 1, maxAttempts: this.options.maxReconnectAttempts }
    });

    const timer = setTimeout(() => {
      this.options.logger.info(`Attempting to reconnect to server: ${serverId} (attempt ${attempts + 1})`);
      this.connect(serverId).catch(err => {
        this.options.logger.error(`Reconnect failed: ${err}`);
      });
    }, this.options.reconnectDelay);

    this.reconnectTimers.set(serverId, timer);
  }

  private clearReconnectTimer(serverId: string): void {
    const timer = this.reconnectTimers.get(serverId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(serverId);
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('timeout') || message.includes('network') || message.includes('econnrefused');
    }
    return false;
  }

  private emitEvent(event: MCPEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          this.options.logger.error(`Error in event handler: ${error}`);
        }
      });
    }
  }

  private createDefaultLogger(): MCPLogger {
    return {
      debug: (...args) => console.debug('[MCP]', ...args),
      info: (...args) => console.info('[MCP]', ...args),
      warn: (...args) => console.warn('[MCP]', ...args),
      error: (...args) => console.error('[MCP]', ...args)
    };
  }

  private async simulateConnection(config: MCPServerConfig): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (Math.random() > 0.95) {
      throw new Error('Simulated connection failure');
    }
    
    this.options.logger.debug(`Simulated connection to ${config.endpoint} with auth: ${config.auth?.type || 'none'}`);
  }

  private async simulateDisconnection(serverId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    this.options.logger.debug(`Simulated disconnection from ${serverId}`);
  }

  private async simulateQuery<T>(serverId: string, requestData: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const request = this.serializer.parseRequest(requestData);
    
    const mockData: Record<string, unknown> = {
      message: 'Mock response',
      method: request.method,
      timestamp: new Date().toISOString()
    };
    
    return this.serializer.serializeResponse(request.id, mockData as T);
  }
}
