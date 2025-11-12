# Development Guide

## Quick Start

### Install Dependencies

```bash
npm install
```

This installs dependencies for all packages using npm workspaces.

### Type Checking

```bash
npm run type-check
```

Each package has its own TypeScript configuration for strict type checking.

### Building

Build all packages:
```bash
npm run build
```

Build a specific package:
```bash
cd packages/core
npm run build
```

### Development Mode

Watch for file changes:
```bash
npm run dev
```

## Project Structure

### Core Package (`packages/core/`)

The shared analysis engine. No external dependencies except `axios` for HTTP requests.

**Key Files:**
- `src/types.ts` - All type definitions
- `src/normalizer.ts` - Content cleanup and chunking
- `src/llm-provider.ts` - LLM abstractions
- `src/analyzer.ts` - Analysis pipeline
- `src/session-storage.ts` - History management
- `src/index.ts` - Public API

### Electron Package (`packages/electron/`)

Desktop application using Electron and React.

**Key Files:**
- `src/main.ts` - Electron main process with IPC handlers
- `src/preload.ts` - Secure IPC bridge
- `src/renderer/App.tsx` - Main React component
- `src/renderer/components/` - UI components
- `src/global.d.ts` - Type declarations for core imports

### Extension Package (`packages/extension/`)

Browser extension for Chrome and Chromium browsers.

**Key Files:**
- `src/background.ts` - Service worker
- `src/content.ts` - Content script for page extraction
- `src/popup.tsx` - Popup UI
- `src/global.d.ts` - Type declarations for core imports
- `manifest.json` - Extension manifest

## Testing

### Core Library

```bash
cd packages/core

# Type check
npx tsc --noEmit

# Test with local provider
node -e "
const { BrowsingAnalysisSDK } = require('./dist/index.js');
const sdk = new BrowsingAnalysisSDK();
sdk.analyzePage({
  content: { url: 'https://example.com', title: 'Test', content: 'Sample content' },
  provider: 'local'
}).then(r => console.log(r));
"
```

### Electron

```bash
cd packages/electron

# Type check
npx tsc --noEmit

# (To run Electron, configure build scripts with electron CLI)
```

### Extension

```bash
cd packages/extension

# Type check
npx tsc --noEmit

# Build
npm run build

# Load in Chrome: chrome://extensions/ → Load unpacked → Select dist/
```

## Type Safety

All packages are configured with strict TypeScript settings:
- `strict: true` - Full strict mode
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused parameters
- `noImplicitReturns: true` - Explicit returns required
- `noFallthroughCasesInSwitch: true` - No fall-through switches

### Adding New Types

Add new types to `packages/core/src/types.ts` and update the global declaration files in `packages/electron/src/global.d.ts` and `packages/extension/src/global.d.ts`.

## Code Style

### Naming Conventions

- **Classes**: PascalCase (e.g., `ContentNormalizer`, `BrowsingAnalyzer`)
- **Functions**: camelCase (e.g., `normalizeContent`, `analyzeChunk`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CHUNK_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `AnalysisRequest`, `TradingSignal`)
- **Private methods**: Leading underscore (e.g., `_removeBoilerplate`)

### Component Patterns

**React Components:**
```typescript
interface Props {
  isLoading: boolean;
  onAnalyze: (data: any) => void;
  error: string | null;
}

const MyComponent: React.FC<Props> = ({ isLoading, onAnalyze, error }) => {
  // component code
};

export default MyComponent;
```

**Async Functions:**
```typescript
async function analyzeContent(content: string): Promise<AnalysisResult> {
  try {
    // implementation
  } catch (error) {
    throw new Error(`Analysis failed: ${error}`);
  }
}
```

## Common Tasks

### Adding a New LLM Provider

1. Create provider class in `packages/core/src/llm-provider.ts`
2. Extend `LLMProviderBase`
3. Implement `sendRequest()` method
4. Update `LLMProviderFactory.createProvider()`
5. Update type definitions

### Adding a New UI Component

1. Create component in `packages/electron/src/renderer/components/`
2. Write TypeScript with React.FC typing
3. Add corresponding CSS file
4. Import and use in parent component

### Adding Session Persistence

1. Create custom `StorageBackend` implementation
2. Use with SessionManager: `new SessionManager(customBackend)`
3. Implement: `save()`, `load()`, `remove()`, `list()`

### Debugging

**Electron:**
- Main process: Node.js debugger
- Renderer: Chrome DevTools (already integrated)
- IPC: Use `console.log()` in main and renderer processes

**Extension:**
- Background worker: `chrome://extensions/` → Details → Errors
- Content script: Page DevTools (F12)
- Popup: Right-click extension → Inspect popup

## Performance Tips

1. **Content Chunking**: Automatic for content > 10KB
2. **Session Caching**: Results cached in memory
3. **Lazy Loading**: Only load sessions when needed
4. **Type Checking**: Run locally before pushing
5. **Bundle Size**: Core ~20KB, Electron ~150KB, Extension ~80KB

## CI/CD Considerations

- TypeScript strict mode ensures code quality
- No external APIs called during type checking
- All async operations properly error-handled
- Mock provider available for testing without APIs

## Troubleshooting

### "Cannot find module '@ai-browsing/core'"

- Ensure core package is built: `cd packages/core && npm run build`
- Check tsconfig paths configuration
- Clear cache: `rm -rf node_modules/.vite` or similar

### TypeScript Errors in Editor

- Reload editor window
- Run `npm run type-check` to verify
- Check tsconfig includes/excludes

### Extension Not Loading

- Check manifest.json syntax
- Verify dist/ directory exists with built files
- Check console for errors: chrome://extensions/ → Details → Errors

### IPC Messages Not Working (Electron)

- Verify main process event listeners registered
- Check preload script context isolation
- Use developer tools to debug message flow
