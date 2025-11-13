# scaling-memory

A monorepo architecture with shared TypeScript core modules for building scalable applications.

## Overview

This repository contains:
- **@scaling-memory/shared**: Core package with domain models, utilities, and interfaces
- **@scaling-memory/electron-app**: Electron application scaffold
- **@scaling-memory/extension-app**: Browser extension scaffold

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

## Features

### Shared Core Package

The `@scaling-memory/shared` package provides:

- **Domain Models**: Market data structures and analysis job definitions with serialization
- **Configuration**: Type-safe config loading with environment variable support
- **Logging**: Structured logging with multiple formats and transports
- **HTTP Utilities**: Client abstractions, interceptors, and retry strategies
- **Messaging**: Inter-app messaging contracts and message bus implementation
- **Interfaces**: Contracts for MCP clients, LLM providers, and schedulable tasks

### Key Design Principles

- **Dependency Inversion**: All major components defined as interfaces
- **Type Safety**: Comprehensive TypeScript types throughout
- **Framework Agnostic**: Works in Electron, browser extensions, and Node.js
- **Modular Exports**: Import exactly what you need
- **Well Tested**: 75+ unit tests validating contracts and serialization

## Package Structure

```
packages/
├── shared/              # Core shared utilities and interfaces
│   ├── src/
│   │   ├── domain/      # Market data and analysis job models
│   │   ├── config/      # Configuration management
│   │   ├── logging/     # Structured logging
│   │   ├── http/        # HTTP client utilities
│   │   ├── messaging/   # Inter-app messaging
│   │   └── interfaces/  # MCP, LLM, and task interfaces
│   └── tests/           # Comprehensive unit tests
├── electron-app/        # Electron application scaffold
└── extension-app/       # Browser extension scaffold
```

## Usage Examples

### Domain Models

```typescript
import { createAnalysisJob, JobType, JobPriority } from '@scaling-memory/shared/domain';

const job = createAnalysisJob(
  JobType.TECHNICAL_ANALYSIS,
  { symbol: 'BTC/USD', indicators: ['RSI', 'MACD'] },
  { priority: JobPriority.HIGH }
);
```

### Configuration

```typescript
import { ConfigBuilder, Environment } from '@scaling-memory/shared/config';

const config = new ConfigBuilder()
  .withName('my-app')
  .withVersion('1.0.0')
  .withEnvironment(Environment.PRODUCTION)
  .build();
```

### Logging

```typescript
import { LoggerFactory, LogLevel } from '@scaling-memory/shared/logging';

const logger = LoggerFactory.createConsoleLogger({ minLevel: LogLevel.INFO });
logger.info('Application started', { version: '1.0.0' });
```

### Messaging

```typescript
import { MessageBuilder, Topics } from '@scaling-memory/shared/messaging';

const event = MessageBuilder.event(Topics.MARKET_DATA, { price: 50000 }, 'source').build();
```

## Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [Shared Package README](./packages/shared/README.md)

## Testing

All packages include comprehensive tests:

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/shared && npm test

# Run tests in watch mode
cd packages/shared && npm run test:watch
```

## Building

```bash
# Build all packages
npm run build

# Build specific package
cd packages/shared && npm run build
```

## License

MIT