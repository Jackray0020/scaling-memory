# Scaling Memory - Electron App

A modern Electron + React + Vite application for macOS with IPC channel support for AI analysis requests.

## Features

- **Electron**: Cross-platform desktop application framework
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe development
- **electron-builder**: macOS (and other platform) builds
- **IPC Channels**: Communication between main process and renderer for AI analysis requests
- **Monorepo Integration**: Uses shared package for types and utilities

## Development

### Start Development Server

```bash
pnpm dev:electron
```

This will:
- Start the Vite dev server
- Launch the Electron application
- Open DevTools for debugging

### Type Checking

```bash
pnpm type-check
```

### Preview Build

```bash
pnpm preview
```

## Building

### Build for macOS

```bash
pnpm build:electron
```

This will:
- Build the React app with Vite
- Package the Electron app
- Create a macOS application bundle and DMG installer

The build artifacts will be in the `release/` directory.

## Project Structure

```
apps/electron/
├── src/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script with IPC API
│   ├── index.tsx        # React entry point
│   ├── App.tsx          # Main React component
│   ├── index.css        # Global styles
│   └── App.css          # Component styles
├── assets/              # Application icons and assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── electron-builder.yml # electron-builder configuration
└── package.json         # Package dependencies
```

## IPC Channels

### AI Analysis Request

Send an analysis request from the renderer process:

```typescript
const response = await window.electron.analyzeRequest({
  content: 'Text to analyze',
  analysisType: 'summary',
  metadata: {},
})
```

The main process will handle the request and return a response with the analysis result.

## macOS Build

The application is configured to build for macOS with:
- Native `.app` bundle
- DMG installer
- Code signing support (can be configured in electron-builder.yml)

To build for production:

```bash
pnpm build:electron
```

## Dependencies

- `electron`: Desktop application framework
- `react`: UI library
- `react-dom`: React DOM rendering
- `@scaling-memory/shared`: Shared types and utilities
- `vite`: Build tool
- `@vitejs/plugin-react`: React support for Vite
- `vite-plugin-electron`: Electron integration for Vite
- `electron-builder`: macOS and other platform builds

## Notes

- The application uses context isolation for security
- Preload script exposes only necessary IPC channels
- The shared package provides type definitions for IPC communication
