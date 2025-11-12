# MCP Client Documentation

## Overview

The MCP (Model Context Protocol) Client is a TypeScript library for connecting to and interacting with MCP servers. It provides a robust, configuration-driven approach to managing multiple server connections with built-in authentication, session management, error recovery, and event handling.

## Features

- **Connection Management**: Connect to multiple MCP servers with automatic session lifecycle handling
- **Authentication**: Support for multiple authentication types (Bearer, API Key, OAuth, None)
- **Error Recovery**: Automatic reconnection with configurable retry logic
- **Request/Response Serialization**: Built-in JSON serialization with type safety
- **Event-Driven Architecture**: Subscribe to connection, disconnection, error, and reconnection events
- **TypeScript Support**: Full type definitions for all APIs
- **Configurable**: Flexible configuration for timeouts, retries, and logging

## Installation

```bash
npm install @scaling-memory/shared
```

## Quick Start

```typescript
import { MCPClient, MCPServerConfig } from '@scaling-memory/shared';

// Create a client instance
const client = new MCPClient({
  defaultTimeout: 30000,
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 3
});

// Register a server
const serverConfig: MCPServerConfig = {
  id: 'my-service',
  name: 'My Service',
  endpoint: 'http://localhost:3000/mcp',
  auth: {
    type: 'bearer',
    credentials: {
      token: 'your-auth-token'
    }
  }
};

client.registerServer(serverConfig);

// Connect to the server
await client.connect('my-service');

// Execute a query
const response = await client.query('my-service', 'getData', {
  param1: 'value1'
});

console.log(response.data);
```

## Core Concepts

### Server Configuration

Each MCP server requires a configuration object with the following properties:

```typescript
interface MCPServerConfig {
  id: string;              // Unique identifier for the server
  name: string;            // Human-readable name
  endpoint: string;        // Server URL
  auth?: MCPAuthConfig;    // Authentication configuration (optional)
  timeout?: number;        // Request timeout in ms (optional)
  retryAttempts?: number;  // Number of retry attempts (optional)
  retryDelay?: number;     // Delay between retries in ms (optional)
}
```

### Authentication Types

The MCP client supports four authentication types:

#### No Authentication

```typescript
auth: {
  type: 'none'
}
```

#### Bearer Token

```typescript
auth: {
  type: 'bearer',
  credentials: {
    token: 'your-bearer-token'
  }
}
```

#### API Key

```typescript
auth: {
  type: 'apikey',
  credentials: {
    apiKey: 'your-api-key'
  }
}
```

#### OAuth

```typescript
auth: {
  type: 'oauth',
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  }
}
```

## API Reference

### MCPClient

#### Constructor

```typescript
constructor(options?: MCPClientOptions)
```

Options:
- `defaultTimeout` (number): Default timeout for all requests in milliseconds (default: 30000)
- `autoReconnect` (boolean): Enable automatic reconnection (default: true)
- `reconnectDelay` (number): Delay between reconnection attempts in ms (default: 5000)
- `maxReconnectAttempts` (number): Maximum number of reconnection attempts (default: 3)
- `logger` (MCPLogger): Custom logger implementation

#### Methods

##### registerServer(config: MCPServerConfig): void

Register a new MCP server.

```typescript
client.registerServer({
  id: 'service-1',
  name: 'Service 1',
  endpoint: 'http://localhost:3001/mcp'
});
```

##### unregisterServer(serverId: string): boolean

Unregister an MCP server. Returns `true` if successful.

```typescript
const removed = client.unregisterServer('service-1');
```

##### connect(serverId: string): Promise<MCPSession>

Connect to a registered server. Returns the session information.

```typescript
const session = await client.connect('service-1');
console.log('Connected:', session.connected);
```

##### disconnect(serverId: string): Promise<void>

Disconnect from a server.

```typescript
await client.disconnect('service-1');
```

##### query<T>(serverId: string, method: string, params?: Record<string, unknown>, options?: MCPQueryOptions): Promise<MCPResponse<T>>

Execute a query on a connected server.

```typescript
const response = await client.query<{ users: User[] }>(
  'service-1',
  'getUsers',
  { limit: 10 },
  { timeout: 5000 }
);

console.log(response.data?.users);
```

##### getSession(serverId: string): MCPSession | undefined

Get the current session for a server.

```typescript
const session = client.getSession('service-1');
console.log('Last activity:', session?.lastActivity);
```

##### getConnectionState(serverId: string): MCPConnectionState

Get the current connection state.

```typescript
const state = client.getConnectionState('service-1');
// Returns: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'
```

##### getAllServers(): MCPServerConfig[]

Get all registered servers.

```typescript
const servers = client.getAllServers();
console.log(`${servers.length} servers registered`);
```

##### on(event: MCPEventType, handler: MCPEventHandler): void

Subscribe to events.

```typescript
client.on('connected', (event) => {
  console.log(`Connected to ${event.serverId}`);
});
```

##### off(event: MCPEventType, handler: MCPEventHandler): void

Unsubscribe from events.

```typescript
const handler = (event) => console.log(event);
client.on('disconnected', handler);
client.off('disconnected', handler);
```

## Event System

The MCP client emits events for important lifecycle changes:

### Event Types

- `connected`: Fired when successfully connected to a server
- `disconnected`: Fired when disconnected from a server
- `error`: Fired when an error occurs
- `reconnecting`: Fired when attempting to reconnect

### Example

```typescript
client.on('connected', (event: MCPEvent) => {
  console.log('Connected:', event.serverId, event.timestamp);
});

client.on('error', (event: MCPEvent) => {
  console.error('Error:', event.serverId, event.data);
});

client.on('reconnecting', (event: MCPEvent) => {
  console.log('Reconnecting:', event.serverId, event.data);
});
```

## Error Handling

The client provides robust error handling with automatic retry logic:

```typescript
try {
  const response = await client.query('service-1', 'getData');
  if (!response.success) {
    console.error('Query failed:', response.error);
  }
} catch (error) {
  console.error('Connection error:', error);
}
```

### Error Recovery

The client automatically attempts to reconnect when connections fail:

```typescript
const client = new MCPClient({
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 3
});

client.on('reconnecting', (event) => {
  const { attempt, maxAttempts } = event.data as { attempt: number; maxAttempts: number };
  console.log(`Reconnecting: attempt ${attempt} of ${maxAttempts}`);
});
```

## Configuration Examples

### Basic Configuration

```typescript
const client = new MCPClient();

client.registerServer({
  id: 'simple-service',
  name: 'Simple Service',
  endpoint: 'http://localhost:3000/mcp'
});

await client.connect('simple-service');
```

### Advanced Configuration

```typescript
const client = new MCPClient({
  defaultTimeout: 60000,
  autoReconnect: true,
  reconnectDelay: 10000,
  maxReconnectAttempts: 5,
  logger: {
    debug: (msg, ...args) => console.debug('[MCP]', msg, ...args),
    info: (msg, ...args) => console.info('[MCP]', msg, ...args),
    warn: (msg, ...args) => console.warn('[MCP]', msg, ...args),
    error: (msg, ...args) => console.error('[MCP]', msg, ...args)
  }
});

client.registerServer({
  id: 'secure-service',
  name: 'Secure Service',
  endpoint: 'https://api.example.com/mcp',
  auth: {
    type: 'oauth',
    credentials: {
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET!
    }
  },
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000
});
```

### Multiple Servers

```typescript
const servers = [
  {
    id: 'service-1',
    name: 'Service 1',
    endpoint: 'http://localhost:3001/mcp',
    auth: { type: 'none' as const }
  },
  {
    id: 'service-2',
    name: 'Service 2',
    endpoint: 'http://localhost:3002/mcp',
    auth: {
      type: 'bearer' as const,
      credentials: { token: 'token-123' }
    }
  }
];

servers.forEach(config => client.registerServer(config));

await Promise.all(
  servers.map(server => client.connect(server.id))
);
```

## Best Practices

### 1. Use TypeScript Types

Leverage the full type system for better IDE support and type safety:

```typescript
import { MCPClient, MCPServerConfig, MCPResponse } from '@scaling-memory/shared';

interface UserData {
  id: string;
  name: string;
  email: string;
}

const response = await client.query<UserData[]>(
  'user-service',
  'getUsers'
);

if (response.success && response.data) {
  response.data.forEach(user => {
    console.log(user.email); // TypeScript knows this is a string
  });
}
```

### 2. Handle Errors Gracefully

Always handle both connection errors and query failures:

```typescript
try {
  await client.connect('service-1');
} catch (error) {
  console.error('Connection failed:', error);
  // Implement fallback logic
}

const response = await client.query('service-1', 'getData');
if (!response.success) {
  console.error('Query failed:', response.error?.message);
  // Handle error case
}
```

### 3. Clean Up Connections

Disconnect when no longer needed:

```typescript
// In cleanup/shutdown logic
const servers = client.getAllServers();
await Promise.all(
  servers.map(server => client.disconnect(server.id))
);
```

### 4. Use Custom Loggers

Integrate with your logging system:

```typescript
import { logger } from './my-logger';

const client = new MCPClient({
  logger: {
    debug: (msg, ...args) => logger.debug(msg, { args }),
    info: (msg, ...args) => logger.info(msg, { args }),
    warn: (msg, ...args) => logger.warn(msg, { args }),
    error: (msg, ...args) => logger.error(msg, { args })
  }
});
```

### 5. Monitor Connection States

Keep track of connection health:

```typescript
setInterval(() => {
  const servers = client.getAllServers();
  servers.forEach(server => {
    const state = client.getConnectionState(server.id);
    if (state === 'failed' || state === 'disconnected') {
      console.warn(`Server ${server.name} is ${state}`);
    }
  });
}, 60000); // Check every minute
```

## Environment Variables

For secure credential management:

```typescript
client.registerServer({
  id: 'prod-service',
  name: 'Production Service',
  endpoint: process.env.MCP_ENDPOINT || 'http://localhost:3000',
  auth: {
    type: 'bearer',
    credentials: {
      token: process.env.MCP_AUTH_TOKEN
    }
  }
});
```

## Testing

The library includes comprehensive tests. Run them with:

```bash
npm test
```

### Mocking in Tests

```typescript
import { MCPClient } from '@scaling-memory/shared';

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

const client = new MCPClient({ logger: mockLogger });

// Your test code
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.stringContaining('registered')
);
```

## Troubleshooting

### Connection Timeouts

If experiencing timeouts, increase the timeout value:

```typescript
client.registerServer({
  // ...
  timeout: 60000 // 60 seconds
});

// Or per-query:
await client.query('service-1', 'slowMethod', {}, { timeout: 60000 });
```

### Authentication Failures

Verify credentials and authentication type:

```typescript
// Enable debug logging
const client = new MCPClient({
  logger: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }
});
```

### Reconnection Issues

Adjust reconnection settings:

```typescript
const client = new MCPClient({
  autoReconnect: true,
  reconnectDelay: 10000, // Wait longer between attempts
  maxReconnectAttempts: 5 // Try more times
});
```

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code follows TypeScript best practices
- New features include tests and documentation

## License

MIT
