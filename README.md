# scaling-memory

A comprehensive MCP (Model Context Protocol) client implementation with TypeScript support, designed for use in both Electron applications and browser extensions.

## Features

- 🔌 **Connection Management** - Robust connection handling with automatic session lifecycle
- 🔐 **Multiple Authentication Types** - Support for Bearer, API Key, OAuth, and no-auth
- 🔄 **Automatic Reconnection** - Configurable retry logic with exponential backoff
- 📦 **Request/Response Serialization** - Built-in JSON serialization with type safety
- 📡 **Event-Driven Architecture** - Subscribe to connection, error, and reconnection events
- 📝 **Full TypeScript Support** - Complete type definitions for all APIs
- ⚙️ **Highly Configurable** - Flexible options for timeouts, retries, and logging

## Project Structure

```
scaling-memory/
├── packages/
│   └── shared/              # Core MCP client library
│       ├── src/
│       │   └── mcp/        # MCP client implementation
│       └── tests/          # Comprehensive test suite
├── examples/
│   ├── electron/           # Electron integration example
│   └── extension/          # Browser extension example
└── docs/
    └── MCP_CLIENT.md       # Detailed documentation
```

## Installation

### Install Dependencies

```bash
npm install
```

### Build All Packages

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Quick Start

```typescript
import { MCPClient, MCPServerConfig } from '@scaling-memory/shared';

// Create a client
const client = new MCPClient({
  defaultTimeout: 30000,
  autoReconnect: true
});

// Register a server
const config: MCPServerConfig = {
  id: 'my-service',
  name: 'My Service',
  endpoint: 'http://localhost:3000/mcp',
  auth: {
    type: 'bearer',
    credentials: { token: 'your-token' }
  }
};

client.registerServer(config);

// Connect and query
await client.connect('my-service');
const response = await client.query('my-service', 'getData', { param: 'value' });
console.log(response.data);
```

## Examples

### Electron Example

Demonstrates MCP client usage in an Electron application:

```bash
cd examples/electron
npm run build
node dist/mcp-demo.js
```

Features:
- Multiple service connections
- Error recovery demonstrations
- Connection state monitoring
- Mock query execution

### Browser Extension Example

Shows how to integrate MCP client in a browser extension:

```bash
cd examples/extension
npm run build
node dist/mcp-demo.js
```

Features:
- Content enhancement
- Translation service
- User preferences management
- Batch operations

## Documentation

Comprehensive documentation is available in [docs/MCP_CLIENT.md](docs/MCP_CLIENT.md), including:

- Complete API reference
- Authentication configuration
- Error handling strategies
- Best practices
- Troubleshooting guide

## Core Components

### MCPClient

The main client class that manages connections and queries to MCP servers.

```typescript
const client = new MCPClient(options);
```

### Configuration Management

Register and manage multiple MCP servers with different authentication methods.

```typescript
client.registerServer({
  id: 'service-1',
  name: 'Service 1',
  endpoint: 'https://api.example.com/mcp',
  auth: { type: 'apikey', credentials: { apiKey: 'key' } }
});
```

### Session Management

Automatic session lifecycle handling with connection state tracking.

```typescript
const session = client.getSession('service-1');
const state = client.getConnectionState('service-1');
```

### Event System

Subscribe to connection lifecycle events.

```typescript
client.on('connected', (event) => console.log('Connected:', event.serverId));
client.on('error', (event) => console.error('Error:', event.data));
```

## Authentication Types

- **None** - No authentication required
- **Bearer** - Bearer token authentication
- **API Key** - API key-based authentication
- **OAuth** - OAuth 2.0 client credentials

## Testing

The project includes comprehensive tests covering:

- ✅ Server registration and configuration
- ✅ Connection management and lifecycle
- ✅ Query execution and response handling
- ✅ Authentication methods
- ✅ Error handling and recovery
- ✅ Event system
- ✅ Session management

Run tests:

```bash
cd packages/shared
npm test
```

## Development

### Build Shared Package

```bash
cd packages/shared
npm run build
```

### Build Examples

```bash
cd examples/electron
npm run build

cd examples/extension
npm run build
```

### Clean Build Artifacts

```bash
npm run clean
```

## Configuration Options

### Client Options

```typescript
interface MCPClientOptions {
  defaultTimeout?: number;        // Default: 30000ms
  autoReconnect?: boolean;        // Default: true
  reconnectDelay?: number;        // Default: 5000ms
  maxReconnectAttempts?: number;  // Default: 3
  logger?: MCPLogger;             // Custom logger
}
```

### Server Configuration

```typescript
interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  auth?: MCPAuthConfig;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}
```

## Use Cases

### Electron Applications

- AI service integration
- Data synchronization
- Analytics tracking
- External API communication

### Browser Extensions

- Content enhancement
- Translation services
- User preference management
- Cross-origin API access

## Error Handling

The client provides robust error handling:

```typescript
try {
  const response = await client.query('service', 'method', params);
  if (!response.success) {
    console.error('Error:', response.error);
  }
} catch (error) {
  console.error('Connection failed:', error);
}
```

## Best Practices

1. **Use TypeScript types** for better IDE support
2. **Handle errors gracefully** with try-catch blocks
3. **Clean up connections** when done
4. **Use custom loggers** for better debugging
5. **Monitor connection states** regularly
6. **Secure credentials** using environment variables

## Contributing

Contributions are welcome! Please ensure:

- All tests pass (`npm test`)
- Code follows TypeScript best practices
- New features include tests and documentation
- Commits follow conventional commit format

## License

MIT

## Support

For issues, questions, or contributions, please refer to:
- [Documentation](docs/MCP_CLIENT.md)
- [Examples](examples/)
- [Tests](packages/shared/tests/)
