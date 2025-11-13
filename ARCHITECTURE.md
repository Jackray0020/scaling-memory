# Scaling Memory Architecture

## Overview

This monorepo contains the shared core packages and application scaffolds for the scaling-memory project. The architecture follows a modular design with clear separation of concerns and dependency inversion principles.

## Repository Structure

```
scaling-memory/
├── packages/
│   ├── shared/              # Core shared package
│   │   ├── src/
│   │   │   ├── domain/      # Domain models (market data, analysis jobs)
│   │   │   ├── config/      # Configuration loading utilities
│   │   │   ├── logging/     # Logging abstractions
│   │   │   ├── http/        # HTTP client utilities
│   │   │   ├── messaging/   # Inter-app messaging contracts
│   │   │   └── interfaces/  # Interface definitions (MCP, LLM, tasks)
│   │   ├── tests/           # Unit tests
│   │   └── dist/            # Build output
│   ├── electron-app/        # Electron application scaffold
│   │   └── src/
│   └── extension-app/       # Browser extension scaffold
│       └── src/
├── package.json             # Root workspace configuration
└── tsconfig.json            # Root TypeScript configuration
```

## Core Packages

### @scaling-memory/shared

The shared package is the foundation of the monorepo, providing reusable TypeScript modules that can be consumed by any application without duplication.

#### Modules

1. **Domain Models** (`domain/`)
   - Market data structures (Candle, Tick, OrderBook, Trade, MarketDataSnapshot)
   - Analysis job definitions (AnalysisJob, JobResult, JobContext)
   - Serialization utilities for type-safe data transfer
   - Time intervals, data sources, job types, and status enumerations

2. **Configuration** (`config/`)
   - Type-safe configuration loading
   - Environment variable parsing with validation
   - Configuration builders and loaders
   - Support for multiple environments (development, production, test)

3. **Logging** (`logging/`)
   - Structured logging interface
   - Multiple formatters (JSON, text)
   - Console transport implementation
   - Logger factory with dependency inversion
   - Support for contextual child loggers

4. **HTTP Utilities** (`http/`)
   - HTTP client interface for dependency inversion
   - Request/response types
   - Interceptor patterns (auth, rate limiting)
   - URL builder utility
   - Retry strategies with exponential backoff
   - Content type and header helpers

5. **Messaging** (`messaging/`)
   - Inter-app messaging contracts
   - Message types (request, response, event, command, notification)
   - Message bus interface
   - Topic-based and type-based filtering
   - Message builder with fluent API
   - In-memory message bus for testing

6. **Interfaces** (`interfaces/`)
   - **MCP Client**: Model Context Protocol client interface
   - **LLM Providers**: Large Language Model provider abstractions
   - **Schedulable Tasks**: Task scheduling and execution contracts
   - All interfaces designed for dependency inversion

## Design Principles

### 1. Dependency Inversion

All major components are defined as interfaces, allowing applications to:
- Provide their own implementations
- Easily mock dependencies for testing
- Swap implementations without affecting consumers

Example:
```typescript
// Interface definition in shared package
interface LlmProvider {
  complete(options: CompletionOptions): Promise<CompletionResponse>;
}

// Application-specific implementation
class OpenAiProvider implements LlmProvider {
  async complete(options: CompletionOptions) {
    // Implementation using OpenAI API
  }
}
```

### 2. Type Safety

- Comprehensive TypeScript types for all data structures
- Generic type parameters for flexible, type-safe APIs
- Discriminated unions for runtime type safety
- Exported serialization utilities with validation

### 3. Framework Agnostic

The shared package has no framework-specific dependencies and works in:
- Electron applications (Node.js environment)
- Browser extensions (browser environment)
- Web applications
- Node.js services

### 4. Modular Exports

The package provides both a main entry point and granular module exports:
```typescript
import { ... } from '@scaling-memory/shared';           // Everything
import { ... } from '@scaling-memory/shared/domain';    // Domain only
import { ... } from '@scaling-memory/shared/logging';   // Logging only
```

## Application Scaffolds

### Electron App (`@scaling-memory/electron-app`)

Demonstrates consumption of the shared package in an Electron context:
- Configuration initialization
- Structured logging
- Market data processing
- Analysis job creation
- Background task scheduling
- Message bus usage

### Extension App (`@scaling-memory/extension-app`)

Demonstrates consumption of the shared package in a browser extension context:
- JSON logging format
- API configuration
- Market data snapshots
- Sentiment analysis jobs
- HTTP utilities
- LLM provider interfaces

## Development Workflow

### Building

Build all packages:
```bash
npm run build
```

Build specific package:
```bash
cd packages/shared && npm run build
```

### Testing

Run all tests:
```bash
npm test
```

Run tests for specific package:
```bash
cd packages/shared && npm test
```

### Type Checking

Type check all packages:
```bash
npm run typecheck
```

## Serialization Strategy

All domain models include serialization utilities to ensure:
- Consistent JSON representation across applications
- Type coercion during deserialization (strings → numbers)
- Optional field handling
- Extensibility for future versions

Example:
```typescript
const candle: Candle = { /* ... */ };
const json = MarketDataSerializer.serializeCandle(candle);
const restored = MarketDataSerializer.deserializeCandle(json);
```

## Testing Strategy

Tests are organized by module and validate:
- **Type Contracts**: Ensure TypeScript types are enforced
- **Serialization**: Round-trip serialization/deserialization
- **Builders**: Fluent API construction
- **Utilities**: Helper functions and transformations
- **Interfaces**: Contract compliance

Current test coverage: 75 passing tests across 4 test files.

## Future Extensibility

The architecture supports future additions:
- Additional domain models
- New interface definitions
- Additional utility modules
- Plugin/provider implementations
- Cross-app communication protocols

## Benefits

1. **Code Reuse**: Single source of truth for domain models and utilities
2. **Type Safety**: Strong TypeScript types prevent runtime errors
3. **Consistency**: Shared interfaces ensure consistent behavior
4. **Testability**: Dependency inversion enables easy mocking
5. **Maintainability**: Centralized changes propagate to all apps
6. **Flexibility**: Framework-agnostic design supports any platform

## Contributing

When adding new features to the shared package:

1. Define interfaces in `interfaces/` for dependency inversion
2. Implement utilities in the appropriate module
3. Add serialization support for domain models
4. Write comprehensive unit tests
5. Update module exports in `index.ts`
6. Document the API in the README
7. Verify consumption in both app scaffolds
