import { Scheduler } from '../scheduler/Scheduler';
import { Database } from '../core/database';
import { BaseConnector } from '../connectors/BaseConnector';
import { FinancialData, JobConfig } from '../core/types';
import * as fs from 'fs';

class MockConnector extends BaseConnector {
  async fetch(): Promise<FinancialData[]> {
    return [
      {
        id: 'mock_1',
        source: 'mock',
        type: 'market',
        timestamp: new Date(),
        data: {
          symbol: 'MOCK',
          price: 100,
          change: 0,
          changePercent: 0,
        },
      },
    ];
  }
}

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let database: Database;
  const testDbPath = './test-scheduler.db';

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    database = new Database(testDbPath);
    scheduler = new Scheduler(database);
  });

  afterEach(() => {
    scheduler.stopAll();
    database.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should register connector', () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);
    
    expect(() => {
      scheduler.scheduleJob({
        id: 'test_job',
        name: 'Test Job',
        connectorName: 'MockConnector',
        schedule: '* * * * *',
        enabled: true,
      });
    }).not.toThrow();
  });

  test('should execute job successfully', async () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);

    const jobConfig: JobConfig = {
      id: 'test_job',
      name: 'Test Job',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: true,
    };

    const result = await scheduler.executeJob(jobConfig, connector);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.duration).toBeGreaterThan(0);
  });

  test('should save job result to database', async () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);

    const jobConfig: JobConfig = {
      id: 'test_job',
      name: 'Test Job',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: true,
    };

    await scheduler.executeJob(jobConfig, connector);

    const results = await database.getJobResults('test_job');
    expect(results).toHaveLength(1);
    expect(results[0].jobId).toBe('test_job');
    expect(results[0].success).toBe(true);
  });

  test('should not schedule disabled jobs', () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);

    scheduler.scheduleJob({
      id: 'disabled_job',
      name: 'Disabled Job',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: false,
    });

    const scheduledJobs = scheduler.getScheduledJobs();
    expect(scheduledJobs).not.toContain('disabled_job');
  });

  test('should unschedule job', () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);

    scheduler.scheduleJob({
      id: 'test_job',
      name: 'Test Job',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: true,
    });

    expect(scheduler.getScheduledJobs()).toContain('test_job');

    scheduler.unscheduleJob('test_job');

    expect(scheduler.getScheduledJobs()).not.toContain('test_job');
  });

  test('should stop all jobs', () => {
    const connector = new MockConnector({ name: 'MockConnector' });
    scheduler.registerConnector(connector);

    scheduler.scheduleJob({
      id: 'job_1',
      name: 'Job 1',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: true,
    });

    scheduler.scheduleJob({
      id: 'job_2',
      name: 'Job 2',
      connectorName: 'MockConnector',
      schedule: '* * * * *',
      enabled: true,
    });

    expect(scheduler.getScheduledJobs()).toHaveLength(2);

    scheduler.stopAll();

    expect(scheduler.getScheduledJobs()).toHaveLength(0);
  });
});
