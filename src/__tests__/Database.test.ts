import { Database } from '../core/database';
import { FinancialData, JobResult } from '../core/types';
import * as fs from 'fs';

describe('Database', () => {
  let db: Database;
  const testDbPath = './test.db';

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should save and retrieve financial data', async () => {
    const data: FinancialData = {
      id: 'test_1',
      source: 'test',
      type: 'market',
      timestamp: new Date(),
      data: {
        symbol: 'TEST',
        price: 100,
        change: 5,
        changePercent: 5,
      },
    };

    await db.saveFinancialData(data);
    const retrieved = await db.getFinancialData('market', 10);

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('test_1');
    expect(retrieved[0].source).toBe('test');
  });

  test('should save and retrieve job results', async () => {
    const result: JobResult = {
      jobId: 'test_job',
      success: true,
      data: [],
      timestamp: new Date(),
      duration: 1000,
    };

    await db.saveJobResult(result);
    const retrieved = await db.getJobResults('test_job');

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].jobId).toBe('test_job');
    expect(retrieved[0].success).toBe(true);
    expect(retrieved[0].duration).toBe(1000);
  });

  test('should filter data by type', async () => {
    const marketData: FinancialData = {
      id: 'market_1',
      source: 'test',
      type: 'market',
      timestamp: new Date(),
      data: { symbol: 'TEST', price: 100, change: 0, changePercent: 0 },
    };

    const newsData: FinancialData = {
      id: 'news_1',
      source: 'test',
      type: 'news',
      timestamp: new Date(),
      data: {
        title: 'Test News',
        url: 'https://test.com',
        publishedAt: new Date(),
      },
    };

    await db.saveFinancialData(marketData);
    await db.saveFinancialData(newsData);

    const marketResults = await db.getFinancialData('market');
    const newsResults = await db.getFinancialData('news');

    expect(marketResults).toHaveLength(1);
    expect(newsResults).toHaveLength(1);
    expect(marketResults[0].type).toBe('market');
    expect(newsResults[0].type).toBe('news');
  });

  test('should respect limit and offset', async () => {
    for (let i = 0; i < 5; i++) {
      const data: FinancialData = {
        id: `test_${i}`,
        source: 'test',
        type: 'market',
        timestamp: new Date(),
        data: { symbol: 'TEST', price: 100, change: 0, changePercent: 0 },
      };
      await db.saveFinancialData(data);
    }

    const page1 = await db.getFinancialData(undefined, 2, 0);
    const page2 = await db.getFinancialData(undefined, 2, 2);

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(2);
    expect(page1[0].id).not.toBe(page2[0].id);
  });
});
