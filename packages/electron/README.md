# @ai-browsing/electron

Electron desktop application for AI browsing analysis. Provides a full-featured UI for analyzing web pages with LLM-powered insights.

## Features

- Desktop application using Electron and React
- Real-time analysis with progress indicators
- Session management and history
- Multiple LLM provider support with configuration
- Trade signal visualization
- Persistent session storage

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Development Mode

```bash
npm run dev
```

Watches for changes and recompiles automatically.

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
src/
├── main.ts              # Electron main process
├── preload.ts           # IPC preload script
└── renderer/
    ├── App.tsx          # Main app component
    ├── App.css
    ├── index.tsx        # React entry point
    ├── index.css
    ├── index.html
    └── components/
        ├── AnalysisPanel.tsx    # Content analysis UI
        ├── AnalysisPanel.css
        ├── SessionPanel.tsx     # Session management UI
        ├── SessionPanel.css
        ├── ProviderSettings.tsx # Provider configuration
        └── ProviderSettings.css
```

## Components

### Main App (`App.tsx`)

Root component managing app state and orchestrating features:
- Session creation and management
- Analysis execution
- Provider switching
- Settings modal

### Analysis Panel (`AnalysisPanel.tsx`)

UI for page analysis:
- URL, title, and content input fields
- Analyze button
- "Load Sample" button for testing
- Results display with summaries, insights, and signals
- Real-time progress indicators

### Session Panel (`SessionPanel.tsx`)

Session history management:
- List of all sessions
- Entry count per session
- Session selection
- Delete session button
- Recent entries preview

### Provider Settings (`ProviderSettings.tsx`)

Configuration modal:
- Provider selection (Local, OpenAI, Claude, Gemini)
- API key input fields
- MCP augmentation toggle
- Save/Cancel buttons

## IPC Handlers

The main process exposes these IPC handlers:

```typescript
// Analyze page content
ipcMain.handle('analyze-page', async (event, request) => { ... });

// Get session history
ipcMain.handle('get-session', async (event, sessionId) => { ... });

// List all sessions
ipcMain.handle('list-sessions', async () => { ... });

// Create new session
ipcMain.handle('create-session', async (event, sessionId, provider) => { ... });

// Clear session
ipcMain.handle('clear-session', async (event, sessionId) => { ... });

// Export session
ipcMain.handle('export-session', async (event, sessionId) => { ... });

// Get current session
ipcMain.handle('get-current-session', async () => { ... });
```

## Usage from Renderer

The preload script exposes a `window.browsing` API:

```typescript
// Analyze page
const result = await window.browsing.analyzePage({
  content: { url, title, content },
  provider: 'openai',
  sessionId: 'session_123'
});

// Get session
const session = await window.browsing.getSession('session_123');

// List sessions
const sessions = await window.browsing.listSessions();

// Create session
const session = await window.browsing.createSession('session_123', 'openai');

// Clear session
await window.browsing.clearSession('session_123');

// Export session
const json = await window.browsing.exportSession('session_123');

// Get current session
const current = await window.browsing.getCurrentSession();
```

## Configuration

### Build Configuration

The app can be configured for different environments:

```typescript
const isDev = process.env.NODE_ENV === 'development';
const startUrl = isDev
  ? 'http://localhost:3000'  // Dev server
  : `file://${path.join(__dirname, '../renderer/index.html')}`; // Built HTML
```

### Provider Settings Storage

Settings are stored in localStorage:
- `currentProvider`: Active LLM provider
- `apikey_openai`: OpenAI API key
- `apikey_claude`: Claude API key
- `apikey_gemini`: Gemini API key
- `enable_mcp`: MCP augmentation enabled flag

## Running the App

### Development

```bash
npm run dev
npm start  # In another terminal - starts Electron
```

### Building for Production

```bash
npm run build
# Package with electron-builder or similar
```

## Styling

Uses CSS with a modern color scheme:
- Primary gradient: #667eea → #764ba2
- Success: #28a745
- Warning: #ffc107
- Error: #dc3545
- Neutral: #e9ecef

## Performance

- React components are optimized with proper state management
- IPC messages are handled asynchronously
- CSS uses flexbox and grid for efficient layout
- Session data is cached in memory

## Future Enhancements

- Export analysis to PDF
- Integration with trading platforms
- Real-time notifications
- Custom analysis templates
- Performance metrics dashboard
- Advanced filtering in session history
