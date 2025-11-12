import { BrowsingAnalysisSDK, MemoryStorageBackend } from '@ai-browsing/core';

const sdk = new BrowsingAnalysisSDK(new MemoryStorageBackend());

/**
 * Background service worker for extension
 */

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'analyze') {
    handleAnalyze(request.payload).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicate we'll respond asynchronously
  }

  if (request.type === 'get-session') {
    handleGetSession(request.sessionId).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.type === 'list-sessions') {
    handleListSessions().then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.type === 'create-session') {
    handleCreateSession(request.sessionId, request.provider).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.type === 'clear-session') {
    handleClearSession(request.sessionId).then(sendResponse).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

/**
 * Analyze page content
 */
async function handleAnalyze(payload: any) {
  try {
    const result = await sdk.analyzePage(payload);
    return { success: true, data: result };
  } catch (error) {
    throw error;
  }
}

/**
 * Get session
 */
async function handleGetSession(sessionId: string) {
  try {
    const session = await sdk.getSessionManager().getSession(sessionId);
    return { success: true, data: session };
  } catch (error) {
    throw error;
  }
}

/**
 * List sessions
 */
async function handleListSessions() {
  try {
    const sessions = await sdk.getSessionManager().listSessions();
    return { success: true, data: sessions };
  } catch (error) {
    throw error;
  }
}

/**
 * Create session
 */
async function handleCreateSession(sessionId: string, provider: string) {
  try {
    const session = await sdk.getSessionManager().createSession(sessionId, provider as any);
    return { success: true, data: session };
  } catch (error) {
    throw error;
  }
}

/**
 * Clear session
 */
async function handleClearSession(sessionId: string) {
  try {
    await sdk.getSessionManager().clearSession(sessionId);
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Handle install/update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});
