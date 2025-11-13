# @scaling-memory/shared

Shared core utilities, domain models, and interfaces for the scaling-memory project.

## Overview

This package provides reusable TypeScript modules for:

- **Domain Models**: Market data structures and analysis job definitions
- **Configuration**: Type-safe configuration loading with environment variable support
- **Logging**: Structured logging with dependency inversion
- **HTTP Utilities**: HTTP client abstractions and utilities
- **Messaging**: Inter-app messaging contracts and protocols
- **Interfaces**: Contracts for MCP clients, LLM providers, and schedulable tasks

## Installation

```bash
npm install @scaling-memory/shared
```

## Usage

### Domain Models

```typescript
import {
  TimeInterval,
  DataSource,
  MarketDataSerializer,
  createAnalysisJob,
  JobType,
  JobPriority,
} from '@scaling-memory/shared/domain';

// Create market data
const candle = {
  timestamp: Date.now(),
  open: 50000,
  high: 51000,
  low: 49500,
  close: 50500,
  volume: 100,
  symbol: 'BTC/USD',
  interval: TimeInterval.HOUR_1,
};

// Serialize and deserialize
const serialized = MarketDataSerializer.serializeCandle(candle);
const deserialized = MarketDataSerializer.deserializeCandle(serialized);

// Create analysis jobs
const job = createAnalysisJob(
  JobType.TECHNICAL_ANALYSIS,
  { symbol: 'BTC/USD', indicators: ['RSI', 'MACD'] },
  { priority: JobPriority.HIGH }
);
```

### Configuration

```typescript
import {
  ConfigBuilder,
  Environment,
  EnvParser,
  MemoryConfigLoader,
} from '@scaling-memory/shared/config';

// Build configuration
const config = new ConfigBuilder()
  .withName('my-app')
  .withVersion('1.0.0')
  .withEnvironment(Environment.PRODUCTION)
  .withLogging({
    level: 'info',
    format: 'json',
    destination: 'console',
  })
  .build();

// Parse environment variables
const port = EnvParser.getNumber('PORT', 3000);
const debug = EnvParser.getBoolean('DEBUG', false);

// Use config loader
const loader = new MemoryConfigLoader(config);
const appName = loader.get('name');
```

### Logging

```typescript
import {
  LoggerFactory,
  LogLevel,
  BaseLogger,
} from '@scaling-memory/shared/logging';

// Create logger
const logger = LoggerFactory.createConsoleLogger({
  minLevel: LogLevel.INFO,
  format: 'json',
});

// Use logger
logger.info('Application started', { version: '1.0.0' });
logger.error('An error occurred', new Error('Something went wrong'));

// Create child logger with context
const moduleLogger = logger.child('database');
moduleLogger.debug('Connecting to database');
```

### HTTP Utilities

```typescript
import {
  HttpMethod,
  HttpStatus,
  Headers,
  UrlBuilder,
  ContentType,
} from '@scaling-memory/shared/http';

// Build URLs
const url = new UrlBuilder('https://api.example.com')
  .path('v1', 'users', '123')
  .query({ include: 'profile', format: 'json' })
  .build();
// Result: https://api.example.com/v1/users/123?include=profile&format=json

// Use header helpers
const headers = {
  ...Headers.contentType(ContentType.JSON),
  ...Headers.authorization('token123'),
};
```

### Messaging

```typescript
import {
  MessageBuilder,
  MessageType,
  MessagePriority,
  InMemoryMessageBus,
  Topics,
} from '@scaling-memory/shared/messaging';

// Build messages
const event = MessageBuilder.event(
  Topics.MARKET_DATA,
  { symbol: 'BTC/USD', price: 50000 },
  'market-service'
)
  .withPriority(MessagePriority.HIGH)
  .build();

// Use message bus
const bus = new InMemoryMessageBus();

bus.subscribe(Topics.MARKET_DATA, {
  handle: async (message) => {
    console.log('Received:', message.payload);
  },
  canHandle: (message) => message.type === MessageType.EVENT,
});

await bus.publish(event);
```

### Interfaces

#### MCP Client

```typescript
import {
  McpClient,
  McpConnectionState,
  type McpConnectionOptions,
} from '@scaling-memory/shared/interfaces';

// Implement MCP client using the interface
class MyMcpClient implements McpClient {
  async connect(options: McpConnectionOptions): Promise<void> {
    // Implementation
  }

  getState(): McpConnectionState {
    return McpConnectionState.CONNECTED;
  }

  // ... other methods
}
```

#### LLM Provider

```typescript
import {
  LlmProvider,
  MessageRole,
  type CompletionOptions,
} from '@scaling-memory/shared/interfaces';

// Implement LLM provider using the interface
class MyLlmProvider implements LlmProvider {
  readonly name = 'my-provider';

  async complete(options: CompletionOptions) {
    // Implementation
  }

  // ... other methods
}

// Use the provider
const options: CompletionOptions = {
  model: 'gpt-4',
  messages: [
    { role: MessageRole.SYSTEM, content: 'You are helpful.' },
    { role: MessageRole.USER, content: 'Hello!' },
  ],
  temperature: 0.7,
};
```

#### Schedulable Tasks

```typescript
import {
  TaskBuilder,
  TaskExecutionMode,
  TaskPriority,
  type TaskHandler,
  type TaskScheduler,
} from '@scaling-memory/shared/interfaces';

// Build a task
const task = new TaskBuilder()
  .withName('data-sync')
  .withPriority(TaskPriority.HIGH)
  .withSchedule({
    mode: TaskExecutionMode.RECURRING,
    interval: 3600000, // 1 hour
  })
  .withInput({ source: 'api' })
  .withTimeout(30000)
  .withRetry(3, 1000)
  .build();

// Implement task handler
const handler: TaskHandler<{ source: string }, { count: number }> = {
  async execute(input, context) {
    // Process task
    return { count: 100 };
  },
};

// Use with scheduler (implementation specific)
// scheduler.schedule(task, handler);
```

## Module Exports

The package provides the following module exports:

- `@scaling-memory/shared` - Main entry point, exports everything
- `@scaling-memory/shared/domain` - Domain models only
- `@scaling-memory/shared/config` - Configuration utilities
- `@scaling-memory/shared/logging` - Logging utilities
- `@scaling-memory/shared/http` - HTTP utilities
- `@scaling-memory/shared/messaging` - Messaging contracts
- `@scaling-memory/shared/interfaces` - Interface definitions

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Type Check

```bash
npm run typecheck
```

## Design Principles

### Dependency Inversion

All interfaces are designed with dependency inversion in mind, allowing applications to:

- Implement their own providers (MCP, LLM, etc.)
- Swap implementations without changing consuming code
- Mock dependencies easily for testing

### Type Safety

All modules provide strong TypeScript types with:

- Comprehensive type definitions
- Generic type parameters where appropriate
- Discriminated unions for type safety
- Exported type guards and utilities

### Serialization

Domain models include serialization utilities to ensure:

- Consistent data format across applications
- Type-safe deserialization with validation
- Support for JSON-based communication

### Framework Agnostic

All utilities are framework-agnostic and work in:

- Electron applications
- Browser extensions
- Node.js services
- Web applications

## License

MIT
