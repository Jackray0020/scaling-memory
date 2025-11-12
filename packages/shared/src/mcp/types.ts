export interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  auth?: MCPAuthConfig;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface MCPAuthConfig {
  type: 'none' | 'bearer' | 'apikey' | 'oauth';
  credentials?: {
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

export interface MCPSession {
  id: string;
  serverId: string;
  connected: boolean;
  connectedAt?: Date;
  lastActivity?: Date;
  metadata?: Record<string, unknown>;
}

export interface MCPRequest {
  id: string;
  method: string;
  params?: Record<string, unknown>;
  timestamp: Date;
}

export interface MCPResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: MCPError;
  timestamp: Date;
}

export interface MCPError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export enum MCPConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

export interface MCPClientOptions {
  defaultTimeout?: number;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  logger?: MCPLogger;
}

export interface MCPLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface MCPQueryOptions {
  timeout?: number;
  retry?: boolean;
  metadata?: Record<string, unknown>;
}

export type MCPEventType = 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface MCPEvent {
  type: MCPEventType;
  serverId: string;
  timestamp: Date;
  data?: unknown;
}

export type MCPEventHandler = (event: MCPEvent) => void;
