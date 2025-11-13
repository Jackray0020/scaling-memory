# Scaling Memory

A monorepo containing an Electron-based macOS desktop application with AI analysis capabilities using Chromium-based webview (Electron + React/Vite), shared utilities, and IPC channels for communicating between processes.

## Project Structure

```
scaling-memory/
├── apps/
│   └── electron/           # Electron desktop application
├── packages/
│   └── shared/            # Shared types and utilities
├── package.json           # Root monorepo package
├── pnpm-workspace.yaml    # PNPM workspace configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ (bundled with pnpm)
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install
```

## Available Scripts

### Development

Start the Electron application in development mode:

```bash
pnpm dev:electron
```

This will:
- Start the Vite development server
- Launch the Electron application
- Open DevTools for debugging

### Building

Build the application and assets:

```bash
pnpm build:electron
```

Build for macOS specifically (requires macOS):

```bash
pnpm build:electron:macos
```

## Project Details

### `@scaling-memory/shared`

Shared package containing:
- Type definitions for AI analysis requests/responses
- IPC channel constants
- Utilities for inter-process communication

### `@scaling-memory/electron`

Electron application with:
- React 18 UI with Vite
- TypeScript for type safety
- Electron main process with window management and menu
- Preload script with secure IPC bridges
- electron-builder for macOS packaging
- Sample UI placeholder with demo features

## Architecture

### Main Components

1. **Main Process** (`src/main.ts`):
   - Window management
   - Menu creation
   - IPC handlers for AI analysis requests
   - Application lifecycle management

2. **Preload Script** (`src/preload.ts`):
   - Secure context bridge
   - Exposes safe IPC methods to renderer

3. **React App** (`src/index.tsx`, `src/App.tsx`):
   - Main UI component
   - Sample features and styling
   - Calls AI analysis via IPC

### IPC Channels

- `ai:analyze:request` - Send analysis requests from renderer to main process
- `ai:analyze:response` - Response from main process

## Development

### Type Checking

```bash
pnpm --filter @scaling-memory/electron type-check
```

### File Structure

```
apps/electron/
├── src/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script
│   ├── index.tsx        # React entry point
│   ├── App.tsx          # Main React component
│   ├── index.css        # Global styles
│   └── App.css          # Component styles
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── electron-builder.yml # electron-builder configuration
└── package.json         # Package dependencies
```

## macOS Build

The application is configured to build for macOS with:
- Native `.app` bundle
- DMG installer
- Code signing support (configurable)

To build for production macOS:

```bash
pnpm build:electron:macos
```

Build artifacts will be created in `apps/electron/dist/`.

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **electron-builder**: Native packaging for macOS
- **pnpm**: Fast, disk space efficient package manager

## Security

- Context isolation enabled
- Node integration disabled
- Preload script validates IPC messages
- Secure IPC bridge for renderer to main communication

## Future Enhancements

- Implement actual AI analysis service integration
- Add more IPC channels for additional features
- Expand shared package with more utilities
- Add build variants for Windows and Linux
- Implement auto-updates

## Contributing

When making changes:
1. Ensure all TypeScript compiles without errors
2. Follow existing code style and conventions
3. Update tests if applicable
4. Use conventional commits for commit messages