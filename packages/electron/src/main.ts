import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import {
  BrowsingAnalysisSDK,
  MemoryStorageBackend,
  AnalysisRequest,
} from '@ai-browsing/core';

let mainWindow: BrowserWindow | null = null;
const sdk = new BrowsingAnalysisSDK(new MemoryStorageBackend());

/**
 * Create Electron window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App lifecycle
 */
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC Handlers for analysis operations
 */

// Analyze page content
ipcMain.handle('analyze-page', async (event, request: AnalysisRequest) => {
  try {
    const result = await sdk.analyzePage(request);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Get session history
ipcMain.handle('get-session', async (event, sessionId: string) => {
  try {
    const session = await sdk.getSessionManager().getSession(sessionId);
    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// List all sessions
ipcMain.handle('list-sessions', async () => {
  try {
    const sessions = await sdk.getSessionManager().listSessions();
    return { success: true, data: sessions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Create new session
ipcMain.handle(
  'create-session',
  async (event, sessionId: string, provider: string) => {
    try {
      const session = await sdk.getSessionManager().createSession(sessionId, provider as any);
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

// Clear session
ipcMain.handle('clear-session', async (event, sessionId: string) => {
  try {
    await sdk.getSessionManager().clearSession(sessionId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Export session
ipcMain.handle('export-session', async (event, sessionId: string) => {
  try {
    const json = await sdk.getSessionManager().exportSession(sessionId);
    return { success: true, data: json };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Get current session ID
ipcMain.handle('get-current-session', async () => {
  try {
    const sessionId = sdk.getSessionManager().getCurrentSessionId();
    return { success: true, data: sessionId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});
