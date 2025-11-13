/**
 * Schedulable Tasks Interface
 * Defines contracts for task scheduling and execution with dependency inversion
 */

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Task execution mode
 */
export enum TaskExecutionMode {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
  RECURRING = 'recurring',
  DELAYED = 'delayed',
}

/**
 * Schedule configuration
 */
export interface ScheduleConfig {
  mode: TaskExecutionMode;
  startAt?: number;
  interval?: number;
  cron?: string;
  delay?: number;
  endAt?: number;
  maxExecutions?: number;
}

/**
 * Task context provided during execution
 */
export interface TaskContext {
  taskId: string;
  executionId: string;
  attemptNumber: number;
  scheduledAt: number;
  startedAt: number;
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
}

/**
 * Task execution result
 */
export interface TaskResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: TaskError;
  executionTimeMs: number;
  metadata?: Record<string, unknown>;
}

/**
 * Task error
 */
export interface TaskError {
  code: string;
  message: string;
  stack?: string;
  retryable: boolean;
}

/**
 * Task definition
 */
export interface Task<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  schedule: ScheduleConfig;
  input?: TInput;
  dependencies?: string[];
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  createdAt: number;
  updatedAt: number;
  lastExecutedAt?: number;
  nextExecutionAt?: number;
  executionCount: number;
  metadata?: Record<string, unknown>;
}

/**
 * Task execution handler interface
 */
export interface TaskHandler<TInput = unknown, TOutput = unknown> {
  execute(input: TInput, context: TaskContext): Promise<TOutput>;
  validate?(input: TInput): Promise<boolean>;
  onSuccess?(result: TaskResult<TOutput>, context: TaskContext): Promise<void>;
  onFailure?(error: TaskError, context: TaskContext): Promise<void>;
  onTimeout?(context: TaskContext): Promise<void>;
}

/**
 * Task scheduler interface
 */
export interface TaskScheduler {
  schedule<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    handler: TaskHandler<TInput, TOutput>
  ): Promise<string>;
  cancel(taskId: string): Promise<boolean>;
  pause(taskId: string): Promise<boolean>;
  resume(taskId: string): Promise<boolean>;
  reschedule(taskId: string, schedule: ScheduleConfig): Promise<boolean>;
  getTask(taskId: string): Promise<Task | undefined>;
  listTasks(filter?: TaskFilter): Promise<Task[]>;
  clearCompleted(): Promise<number>;
}

/**
 * Task filter options
 */
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  createdAfter?: number;
  createdBefore?: number;
  limit?: number;
  offset?: number;
}

/**
 * Task execution queue interface
 */
export interface TaskQueue {
  enqueue(task: Task): Promise<void>;
  dequeue(): Promise<Task | undefined>;
  peek(): Promise<Task | undefined>;
  size(): Promise<number>;
  clear(): Promise<void>;
}

/**
 * Task registry interface
 */
export interface TaskRegistry {
  register<TInput, TOutput>(
    taskType: string,
    handler: TaskHandler<TInput, TOutput>
  ): void;
  unregister(taskType: string): void;
  getHandler<TInput, TOutput>(
    taskType: string
  ): TaskHandler<TInput, TOutput> | undefined;
  listTaskTypes(): string[];
}

/**
 * Task executor interface
 */
export interface TaskExecutor {
  execute<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    handler: TaskHandler<TInput, TOutput>
  ): Promise<TaskResult<TOutput>>;
  executeAsync<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    handler: TaskHandler<TInput, TOutput>
  ): Promise<string>;
  getResult(executionId: string): Promise<TaskResult | undefined>;
}

/**
 * Task event types
 */
export enum TaskEventType {
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
}

/**
 * Task event
 */
export interface TaskEvent {
  type: TaskEventType;
  taskId: string;
  executionId?: string;
  timestamp: number;
  data?: unknown;
}

/**
 * Task event listener interface
 */
export interface TaskEventListener {
  onTaskEvent(event: TaskEvent): void | Promise<void>;
}

/**
 * Task monitoring interface
 */
export interface TaskMonitor {
  addEventListener(listener: TaskEventListener): void;
  removeEventListener(listener: TaskEventListener): void;
  getMetrics(taskId?: string): TaskMetrics;
  getExecutionHistory(taskId: string, limit?: number): Promise<TaskExecution[]>;
}

/**
 * Task metrics
 */
export interface TaskMetrics {
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTimeMs: number;
  successRate: number;
  lastUpdated: number;
}

/**
 * Task execution record
 */
export interface TaskExecution {
  executionId: string;
  taskId: string;
  status: TaskStatus;
  startedAt: number;
  completedAt?: number;
  executionTimeMs?: number;
  result?: TaskResult;
  attemptNumber: number;
}

/**
 * Dependency resolver interface
 */
export interface TaskDependencyResolver {
  resolveDependencies(taskId: string): Promise<string[]>;
  canExecute(taskId: string): Promise<boolean>;
  waitForDependencies(taskId: string, timeout?: number): Promise<boolean>;
}

/**
 * Task builder utility
 */
export class TaskBuilder<TInput = unknown, TOutput = unknown> {
  private task: Partial<Task<TInput, TOutput>> = {
    id: this.generateId(),
    priority: TaskPriority.NORMAL,
    status: TaskStatus.PENDING,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionCount: 0,
  };

  withName(name: string): this {
    this.task.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.task.description = description;
    return this;
  }

  withPriority(priority: TaskPriority): this {
    this.task.priority = priority;
    return this;
  }

  withSchedule(schedule: ScheduleConfig): this {
    this.task.schedule = schedule;
    return this;
  }

  withInput(input: TInput): this {
    this.task.input = input;
    return this;
  }

  withDependencies(dependencies: string[]): this {
    this.task.dependencies = dependencies;
    return this;
  }

  withTimeout(timeout: number): this {
    this.task.timeout = timeout;
    return this;
  }

  withRetry(maxRetries: number, retryDelay: number): this {
    this.task.maxRetries = maxRetries;
    this.task.retryDelay = retryDelay;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.task.metadata = { ...this.task.metadata, ...metadata };
    return this;
  }

  build(): Task<TInput, TOutput> {
    if (!this.task.name || !this.task.schedule) {
      throw new Error('Task name and schedule are required');
    }
    return this.task as Task<TInput, TOutput>;
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
