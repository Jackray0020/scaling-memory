/**
 * MCP (Model Context Protocol) Client Interface
 * Defines the contract for MCP client implementations
 */

/**
 * MCP protocol version
 */
export type McpVersion = '1.0' | '2.0';

/**
 * MCP connection state
 */
export enum McpConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * MCP message types
 */
export enum McpMessageType {
  INITIALIZE = 'initialize',
  READY = 'ready',
  REQUEST = 'request',
  RESPONSE = 'response',
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

/**
 * MCP capabilities
 */
export interface McpCapabilities {
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsResources: boolean;
  maxMessageSize?: number;
  supportedVersions: McpVersion[];
}

/**
 * MCP connection options
 */
export interface McpConnectionOptions {
  endpoint: string;
  version: McpVersion;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

/**
 * MCP request
 */
export interface McpRequest {
  id: string;
  method: string;
  params?: Record<string, unknown>;
  timeout?: number;
}

/**
 * MCP response
 */
export interface McpResponse<T = unknown> {
  id: string;
  result?: T;
  error?: McpError;
}

/**
 * MCP error
 */
export interface McpError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * MCP notification
 */
export interface McpNotification {
  method: string;
  params?: Record<string, unknown>;
}

/**
 * MCP tool definition
 */
export interface McpTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: unknown) => Promise<unknown>;
}

/**
 * MCP resource definition
 */
export interface McpResource {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

/**
 * MCP client interface
 */
export interface McpClient {
  connect(options: McpConnectionOptions): Promise<void>;
  disconnect(): Promise<void>;
  getState(): McpConnectionState;
  getCapabilities(): McpCapabilities;
  send<T = unknown>(request: McpRequest): Promise<McpResponse<T>>;
  notify(notification: McpNotification): Promise<void>;
  registerTool(tool: McpTool): void;
  unregisterTool(name: string): void;
  listResources(): Promise<McpResource[]>;
  readResource(uri: string): Promise<unknown>;
  on(event: 'connected' | 'disconnected' | 'error' | 'notification', handler: Function): void;
  off(event: 'connected' | 'disconnected' | 'error' | 'notification', handler: Function): void;
}

/**
 * MCP client factory interface
 */
export interface McpClientFactory {
  create(options: McpConnectionOptions): McpClient;
}

/**
 * MCP error codes
 */
export enum McpErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  TIMEOUT = -32000,
  CONNECTION_ERROR = -32001,
  UNAUTHORIZED = -32002,
}

/**
 * MCP client configuration
 */
export interface McpClientConfig {
  connectionOptions: McpConnectionOptions;
  capabilities?: Partial<McpCapabilities>;
  tools?: McpTool[];
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}
