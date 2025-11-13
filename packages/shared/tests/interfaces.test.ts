import { describe, it, expect } from 'vitest';
import {
  McpConnectionState,
  McpErrorCode,
  type McpClient,
  type McpCapabilities,
  MessageRole,
  type ChatMessage,
  type CompletionOptions,
  type LlmProvider,
  TaskStatus,
  TaskPriority,
  TaskExecutionMode,
  TaskBuilder,
  type Task,
  type ScheduleConfig,
} from '../src/interfaces/index.js';

describe('Interfaces Module', () => {
  describe('MCP Client Types', () => {
    it('should validate MCP connection states', () => {
      const states = [
        McpConnectionState.DISCONNECTED,
        McpConnectionState.CONNECTING,
        McpConnectionState.CONNECTED,
        McpConnectionState.RECONNECTING,
        McpConnectionState.ERROR,
      ];

      expect(states).toHaveLength(5);
      expect(McpConnectionState.CONNECTED).toBe('connected');
    });

    it('should validate MCP error codes', () => {
      expect(McpErrorCode.PARSE_ERROR).toBe(-32700);
      expect(McpErrorCode.INVALID_REQUEST).toBe(-32600);
      expect(McpErrorCode.METHOD_NOT_FOUND).toBe(-32601);
      expect(McpErrorCode.TIMEOUT).toBe(-32000);
    });

    it('should enforce MCP capabilities structure', () => {
      const capabilities: McpCapabilities = {
        supportsStreaming: true,
        supportsTools: true,
        supportsResources: false,
        maxMessageSize: 1024000,
        supportedVersions: ['1.0', '2.0'],
      };

      expect(capabilities.supportsStreaming).toBe(true);
      expect(capabilities.supportedVersions).toContain('2.0');
    });

    it('should type check MCP client interface', () => {
      const mockClient: Partial<McpClient> = {
        getState: () => McpConnectionState.CONNECTED,
        getCapabilities: () => ({
          supportsStreaming: true,
          supportsTools: true,
          supportsResources: true,
          supportedVersions: ['1.0'],
        }),
      };

      expect(mockClient.getState?.()).toBe(McpConnectionState.CONNECTED);
      expect(mockClient.getCapabilities?.().supportsTools).toBe(true);
    });
  });

  describe('LLM Provider Types', () => {
    it('should validate message roles', () => {
      const roles = [
        MessageRole.SYSTEM,
        MessageRole.USER,
        MessageRole.ASSISTANT,
        MessageRole.FUNCTION,
      ];

      expect(roles).toHaveLength(4);
      expect(MessageRole.USER).toBe('user');
    });

    it('should enforce chat message structure', () => {
      const systemMessage: ChatMessage = {
        role: MessageRole.SYSTEM,
        content: 'You are a helpful assistant.',
      };

      const userMessage: ChatMessage = {
        role: MessageRole.USER,
        content: 'Hello!',
      };

      const functionMessage: ChatMessage = {
        role: MessageRole.FUNCTION,
        content: JSON.stringify({ result: 'success' }),
        name: 'get_data',
      };

      expect(systemMessage.role).toBe(MessageRole.SYSTEM);
      expect(userMessage.role).toBe(MessageRole.USER);
      expect(functionMessage.name).toBe('get_data');
    });

    it('should type check completion options', () => {
      const options: CompletionOptions = {
        model: 'gpt-4',
        messages: [
          { role: MessageRole.USER, content: 'Test message' },
        ],
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        stream: false,
      };

      expect(options.model).toBe('gpt-4');
      expect(options.temperature).toBe(0.7);
      expect(options.messages).toHaveLength(1);
    });

    it('should type check LLM provider interface', () => {
      const mockProvider: Partial<LlmProvider> = {
        name: 'test-provider',
        healthCheck: async () => true,
      };

      expect(mockProvider.name).toBe('test-provider');
    });

    it('should enforce function definition structure', () => {
      const functionDef: CompletionOptions['functions'] = [
        {
          name: 'get_weather',
          description: 'Get current weather',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City name' },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      ];

      expect(functionDef[0].name).toBe('get_weather');
      expect(functionDef[0].parameters.required).toContain('location');
    });
  });

  describe('Schedulable Task Types', () => {
    it('should validate task statuses', () => {
      const statuses = [
        TaskStatus.PENDING,
        TaskStatus.SCHEDULED,
        TaskStatus.RUNNING,
        TaskStatus.COMPLETED,
        TaskStatus.FAILED,
        TaskStatus.CANCELLED,
        TaskStatus.PAUSED,
      ];

      expect(statuses).toHaveLength(7);
      expect(TaskStatus.RUNNING).toBe('running');
    });

    it('should validate task priorities', () => {
      expect(TaskPriority.LOW).toBe(0);
      expect(TaskPriority.NORMAL).toBe(1);
      expect(TaskPriority.HIGH).toBe(2);
      expect(TaskPriority.CRITICAL).toBe(3);
    });

    it('should enforce schedule config structure', () => {
      const immediateSchedule: ScheduleConfig = {
        mode: TaskExecutionMode.IMMEDIATE,
      };

      const recurringSchedule: ScheduleConfig = {
        mode: TaskExecutionMode.RECURRING,
        interval: 3600000,
        maxExecutions: 10,
      };

      const cronSchedule: ScheduleConfig = {
        mode: TaskExecutionMode.SCHEDULED,
        cron: '0 0 * * *',
        startAt: Date.now(),
      };

      expect(immediateSchedule.mode).toBe(TaskExecutionMode.IMMEDIATE);
      expect(recurringSchedule.interval).toBe(3600000);
      expect(cronSchedule.cron).toBe('0 0 * * *');
    });

    describe('TaskBuilder', () => {
      it('should build task with required fields', () => {
        const task = new TaskBuilder()
          .withName('test-task')
          .withSchedule({ mode: TaskExecutionMode.IMMEDIATE })
          .build();

        expect(task.id).toBeDefined();
        expect(task.name).toBe('test-task');
        expect(task.status).toBe(TaskStatus.PENDING);
        expect(task.priority).toBe(TaskPriority.NORMAL);
      });

      it('should build task with all options', () => {
        const task = new TaskBuilder<{ param: string }, { result: string }>()
          .withName('complex-task')
          .withDescription('A complex task')
          .withPriority(TaskPriority.HIGH)
          .withSchedule({
            mode: TaskExecutionMode.SCHEDULED,
            startAt: Date.now() + 60000,
          })
          .withInput({ param: 'value' })
          .withDependencies(['task-1', 'task-2'])
          .withTimeout(30000)
          .withRetry(3, 1000)
          .withMetadata({ source: 'api' })
          .build();

        expect(task.name).toBe('complex-task');
        expect(task.priority).toBe(TaskPriority.HIGH);
        expect(task.input?.param).toBe('value');
        expect(task.dependencies).toHaveLength(2);
        expect(task.timeout).toBe(30000);
        expect(task.maxRetries).toBe(3);
      });

      it('should throw error when required fields missing', () => {
        const builder = new TaskBuilder().withName('incomplete');
        expect(() => builder.build()).toThrow();
      });

      it('should generate unique task IDs', () => {
        const task1 = new TaskBuilder()
          .withName('task-1')
          .withSchedule({ mode: TaskExecutionMode.IMMEDIATE })
          .build();

        const task2 = new TaskBuilder()
          .withName('task-2')
          .withSchedule({ mode: TaskExecutionMode.IMMEDIATE })
          .build();

        expect(task1.id).not.toBe(task2.id);
      });

      it('should support fluent API', () => {
        const builder = new TaskBuilder()
          .withName('fluent-task')
          .withPriority(TaskPriority.LOW)
          .withSchedule({ mode: TaskExecutionMode.DELAYED, delay: 5000 })
          .withMetadata({ tag: 'test' });

        const task = builder.build();
        expect(task.metadata?.tag).toBe('test');
      });
    });

    it('should type check task interface', () => {
      const task: Task<{ symbol: string }, { price: number }> = {
        id: 'task_123',
        name: 'fetch-price',
        priority: TaskPriority.NORMAL,
        status: TaskStatus.PENDING,
        schedule: { mode: TaskExecutionMode.IMMEDIATE },
        input: { symbol: 'BTC/USD' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        executionCount: 0,
      };

      expect(task.input?.symbol).toBe('BTC/USD');
      expect(task.status).toBe(TaskStatus.PENDING);
    });

    it('should enforce task context structure', () => {
      const context = {
        taskId: 'task_123',
        executionId: 'exec_456',
        attemptNumber: 1,
        scheduledAt: Date.now() - 1000,
        startedAt: Date.now(),
        metadata: { retry: false },
      };

      expect(context.attemptNumber).toBe(1);
      expect(context.metadata?.retry).toBe(false);
    });
  });

  describe('Type Contract Validation', () => {
    it('should enforce dependency inversion through interfaces', () => {
      const testImplementation = <T extends { name: string }>(provider: T): string => {
        return provider.name;
      };

      const mockMcpClient = { name: 'mcp-client' };
      const mockLlmProvider = { name: 'llm-provider' };

      expect(testImplementation(mockMcpClient)).toBe('mcp-client');
      expect(testImplementation(mockLlmProvider)).toBe('llm-provider');
    });

    it('should support generic type parameters', () => {
      type GenericTask<T, R> = {
        input: T;
        process: (input: T) => Promise<R>;
      };

      const stringToNumber: GenericTask<string, number> = {
        input: '42',
        process: async (input) => parseInt(input, 10),
      };

      expect(stringToNumber.input).toBe('42');
    });
  });
});
