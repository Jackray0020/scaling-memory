import sqlite3 from 'sqlite3';
import { FinancialData, JobResult } from './types';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './data.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS financial_data (
          id TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          type TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS job_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT NOT NULL,
          success INTEGER NOT NULL,
          data TEXT,
          error TEXT,
          timestamp INTEGER NOT NULL,
          duration INTEGER NOT NULL
        )
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_financial_data_timestamp 
        ON financial_data(timestamp DESC)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_financial_data_type 
        ON financial_data(type)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_job_results_job_id 
        ON job_results(job_id)
      `);
    });
  }

  async saveFinancialData(data: FinancialData): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO financial_data (id, source, type, timestamp, data)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        data.id,
        data.source,
        data.type,
        data.timestamp.getTime(),
        JSON.stringify(data.data),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );

      stmt.finalize();
    });
  }

  async saveJobResult(result: JobResult): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO job_results (job_id, success, data, error, timestamp, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        result.jobId,
        result.success ? 1 : 0,
        result.data ? JSON.stringify(result.data) : null,
        result.error || null,
        result.timestamp.getTime(),
        result.duration,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );

      stmt.finalize();
    });
  }

  async getFinancialData(
    type?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<FinancialData[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM financial_data';
      const params: any[] = [];

      if (type) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const data = rows.map((row) => ({
            id: row.id,
            source: row.source,
            type: row.type,
            timestamp: new Date(row.timestamp),
            data: JSON.parse(row.data),
          }));
          resolve(data);
        }
      });
    });
  }

  async getJobResults(jobId?: string, limit: number = 50): Promise<JobResult[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM job_results';
      const params: any[] = [];

      if (jobId) {
        query += ' WHERE job_id = ?';
        params.push(jobId);
      }

      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const results = rows.map((row) => ({
            jobId: row.job_id,
            success: row.success === 1,
            data: row.data ? JSON.parse(row.data) : undefined,
            error: row.error || undefined,
            timestamp: new Date(row.timestamp),
            duration: row.duration,
          }));
          resolve(results);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}
