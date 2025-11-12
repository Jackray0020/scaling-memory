import cron from 'node-cron';
import { BaseConnector } from '../connectors/BaseConnector';
import { Database } from '../core/database';
import { JobConfig, JobResult, FinancialData } from '../core/types';

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask>;
  private connectors: Map<string, BaseConnector>;
  private database: Database;

  constructor(database: Database) {
    this.jobs = new Map();
    this.connectors = new Map();
    this.database = database;
  }

  registerConnector(connector: BaseConnector): void {
    this.connectors.set(connector.getName(), connector);
  }

  scheduleJob(jobConfig: JobConfig): void {
    if (this.jobs.has(jobConfig.id)) {
      console.warn(`Job ${jobConfig.id} already scheduled`);
      return;
    }

    if (!jobConfig.enabled) {
      console.log(`Job ${jobConfig.id} is disabled`);
      return;
    }

    const connector = this.connectors.get(jobConfig.connectorName);
    if (!connector) {
      throw new Error(`Connector ${jobConfig.connectorName} not found`);
    }

    const task = cron.schedule(jobConfig.schedule, async () => {
      await this.executeJob(jobConfig, connector);
    });

    this.jobs.set(jobConfig.id, task);
    console.log(`Job ${jobConfig.id} scheduled: ${jobConfig.schedule}`);
  }

  async executeJob(jobConfig: JobConfig, connector: BaseConnector): Promise<JobResult> {
    const startTime = Date.now();
    console.log(`Executing job: ${jobConfig.id}`);

    try {
      const data = await connector.fetch();

      for (const item of data) {
        await this.database.saveFinancialData(item);
      }

      const duration = Date.now() - startTime;
      const result: JobResult = {
        jobId: jobConfig.id,
        success: true,
        data,
        timestamp: new Date(),
        duration,
      };

      await this.database.saveJobResult(result);
      console.log(`Job ${jobConfig.id} completed: ${data.length} items in ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: JobResult = {
        jobId: jobConfig.id,
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        duration,
      };

      await this.database.saveJobResult(result);
      console.error(`Job ${jobConfig.id} failed:`, errorMessage);

      return result;
    }
  }

  async executeJobNow(jobId: string): Promise<JobResult> {
    const jobConfig = Array.from(this.jobs.keys()).find(id => id === jobId);
    if (!jobConfig) {
      throw new Error(`Job ${jobId} not found`);
    }

    const connector = this.connectors.get(jobId.split('_')[0]);
    if (!connector) {
      throw new Error(`Connector for job ${jobId} not found`);
    }

    return await this.executeJob({ id: jobId } as JobConfig, connector);
  }

  unscheduleJob(jobId: string): void {
    const task = this.jobs.get(jobId);
    if (task) {
      task.stop();
      this.jobs.delete(jobId);
      console.log(`Job ${jobId} unscheduled`);
    }
  }

  stopAll(): void {
    this.jobs.forEach((task, jobId) => {
      task.stop();
      console.log(`Job ${jobId} stopped`);
    });
    this.jobs.clear();
  }

  getScheduledJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}
