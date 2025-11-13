# @scaling-memory/shared

Shared types, interfaces, and utilities for the scaling-memory monorepo.

## Exports

### Types

- `AIAnalysisRequest`: Request structure for AI analysis
- `AIAnalysisResponse`: Response structure for AI analysis

### Constants

- `IPC_CHANNELS`: Object containing IPC channel names

## Usage

```typescript
import { AIAnalysisRequest, AIAnalysisResponse, IPC_CHANNELS } from '@scaling-memory/shared'
```

## Interfaces

### AIAnalysisRequest

```typescript
interface AIAnalysisRequest {
  content: string
  analysisType: 'summary' | 'keywords' | 'sentiment' | 'custom'
  metadata?: Record<string, unknown>
}
```

### AIAnalysisResponse

```typescript
interface AIAnalysisResponse {
  result: unknown
  error?: string
  timestamp: number
}
```

## IPC Channels

```typescript
const IPC_CHANNELS = {
  ANALYZE_REQUEST: 'ai:analyze:request',
  ANALYZE_RESPONSE: 'ai:analyze:response',
}
```
