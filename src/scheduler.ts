import cron from 'node-cron';
import type { Task } from './types.js';
import type { RtrvrClient } from './rtrvr-client.js';

export class TaskScheduler {
  private tasks: Map<string, Task>;
  private cronJobs: Map<string, cron.ScheduledTask>;
  private rtrvrClient: RtrvrClient;

  constructor(rtrvrClient: RtrvrClient) {
    this.tasks = new Map();
    this.cronJobs = new Map();
    this.rtrvrClient = rtrvrClient;
  }

  createTask(task: Task): Task {
    this.tasks.set(task.id, task);

    if (task.recurring && task.cronExpression) {
      this.scheduleRecurringTask(task);
    } else if (task.scheduledTime) {
      this.scheduleOneTimeTask(task);
    }

    return task;
  }

  private scheduleRecurringTask(task: Task): void {
    if (!task.cronExpression || !cron.validate(task.cronExpression)) {
      console.error(`Invalid cron expression for task ${task.id}: ${task.cronExpression}`);
      return;
    }

    const job = cron.schedule(task.cronExpression, async () => {
      await this.executeTask(task.id);
    });

    this.cronJobs.set(task.id, job);
    console.log(`Scheduled recurring task ${task.id} with cron: ${task.cronExpression}`);
  }

  private scheduleOneTimeTask(task: Task): void {
    if (!task.scheduledTime) return;

    const scheduledDate = new Date(task.scheduledTime);
    const now = new Date();
    const delay = scheduledDate.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        await this.executeTask(task.id);
      }, delay);
      console.log(`Scheduled one-time task ${task.id} for ${scheduledDate.toISOString()}`);
    } else {
      console.log(`Task ${task.id} scheduled time has passed, executing immediately`);
      this.executeTask(task.id);
    }
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`Task ${taskId} not found`);
      return;
    }

    console.log(`Executing task ${taskId}: ${task.title}`);
    task.status = 'running';
    task.updatedAt = new Date().toISOString();

    try {
      const result = await this.rtrvrClient.executeTask({
        action: task.title,
        parameters: task.metadata || {},
        context: task.description,
      });

      if (result.success) {
        task.status = 'completed';
        console.log(`Task ${taskId} completed successfully`);
      } else {
        task.status = 'failed';
        console.error(`Task ${taskId} failed:`, result.error);
      }
    } catch (error: any) {
      task.status = 'failed';
      console.error(`Error executing task ${taskId}:`, error.message);
    }

    task.updatedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      ...updates,
      id: task.id,
      updatedAt: new Date().toISOString(),
    };

    if (task.cronExpression !== updatedTask.cronExpression && updatedTask.recurring) {
      this.cancelTask(taskId);
      this.tasks.set(taskId, updatedTask);
      this.scheduleRecurringTask(updatedTask);
    } else {
      this.tasks.set(taskId, updatedTask);
    }

    return updatedTask;
  }

  cancelTask(taskId: string): boolean {
    const job = this.cronJobs.get(taskId);
    if (job) {
      job.stop();
      this.cronJobs.delete(taskId);
    }

    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      this.tasks.set(taskId, task);
      return true;
    }

    return false;
  }

  deleteTask(taskId: string): boolean {
    this.cancelTask(taskId);
    return this.tasks.delete(taskId);
  }

  getTasksByStatus(status: Task['status']): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status);
  }

  getUpcomingTasks(limit: number = 10): Task[] {
    const now = new Date();
    return Array.from(this.tasks.values())
      .filter((task) => task.scheduledTime && new Date(task.scheduledTime) > now)
      .sort((a, b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime())
      .slice(0, limit);
  }
}
