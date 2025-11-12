import { contextBridge, ipcRenderer } from 'electron';
import { AnalysisRequest, AnalysisResult } from '@ai-browsing/core';

/**
 * Preload script for secure IPC communication
 */
contextBridge.exposeInMainWorld('browsing', {
  analyzePage: (request: AnalysisRequest) => ipcRenderer.invoke('analyze-page', request),
  getSession: (sessionId: string) => ipcRenderer.invoke('get-session', sessionId),
  listSessions: () => ipcRenderer.invoke('list-sessions'),
  createSession: (sessionId: string, provider: string) =>
    ipcRenderer.invoke('create-session', sessionId, provider),
  clearSession: (sessionId: string) => ipcRenderer.invoke('clear-session', sessionId),
  exportSession: (sessionId: string) => ipcRenderer.invoke('export-session', sessionId),
  getCurrentSession: () => ipcRenderer.invoke('get-current-session'),
});

// Type definitions for renderer process
declare global {
  interface Window {
    browsing: {
      analyzePage: (request: AnalysisRequest) => Promise<{ success: boolean; data?: AnalysisResult; error?: string }>;
      getSession: (sessionId: string) => Promise<any>;
      listSessions: () => Promise<any>;
      createSession: (sessionId: string, provider: string) => Promise<any>;
      clearSession: (sessionId: string) => Promise<any>;
      exportSession: (sessionId: string) => Promise<any>;
      getCurrentSession: () => Promise<any>;
    };
  }
}
