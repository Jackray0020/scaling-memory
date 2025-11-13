import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, AIAnalysisRequest, AIAnalysisResponse } from '@scaling-memory/shared'

interface ElectronAPI {
  analyzeRequest: (request: AIAnalysisRequest) => Promise<AIAnalysisResponse>
}

const electronAPI: ElectronAPI = {
  analyzeRequest: (request: AIAnalysisRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.ANALYZE_REQUEST, request),
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
