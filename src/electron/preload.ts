import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getMarketData: (limit?: number) => ipcRenderer.invoke('get-market-data', limit),
  getNewsData: (limit?: number) => ipcRenderer.invoke('get-news-data', limit),
  getAllData: (limit?: number) => ipcRenderer.invoke('get-all-data', limit),
  getJobResults: (jobId?: string) => ipcRenderer.invoke('get-job-results', jobId),
  getScheduledJobs: () => ipcRenderer.invoke('get-scheduled-jobs'),
});

declare global {
  interface Window {
    api: {
      getMarketData: (limit?: number) => Promise<any[]>;
      getNewsData: (limit?: number) => Promise<any[]>;
      getAllData: (limit?: number) => Promise<any[]>;
      getJobResults: (jobId?: string) => Promise<any[]>;
      getScheduledJobs: () => Promise<string[]>;
    };
  }
}
