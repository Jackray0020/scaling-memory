import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import FinancialDataIngestion from '../index';

let mainWindow: BrowserWindow | null = null;
let dataIngestion: FinancialDataIngestion | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
  
  dataIngestion = new FinancialDataIngestion('./data.db');
  dataIngestion.scheduleJobs();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (dataIngestion) {
      dataIngestion.shutdown();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-market-data', async (_, limit: number = 50) => {
  if (!dataIngestion) return [];
  return await dataIngestion.getMarketData(limit);
});

ipcMain.handle('get-news-data', async (_, limit: number = 50) => {
  if (!dataIngestion) return [];
  return await dataIngestion.getNewsData(limit);
});

ipcMain.handle('get-all-data', async (_, limit: number = 100) => {
  if (!dataIngestion) return [];
  return await dataIngestion.getAllData(limit);
});

ipcMain.handle('get-job-results', async (_, jobId?: string) => {
  if (!dataIngestion) return [];
  return await dataIngestion.getJobResults(jobId);
});

ipcMain.handle('get-scheduled-jobs', async () => {
  if (!dataIngestion) return [];
  return dataIngestion.getScheduler().getScheduledJobs();
});
