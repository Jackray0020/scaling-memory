import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TaskScheduler } from './scheduler.js';
import { RtrvrClient } from './rtrvr-client.js';
import { CreateTaskSchema, UpdateTaskSchema, Task } from './types.js';
import { randomUUID } from 'crypto';

const RTRVR_API_URL = process.env.RTRVR_API_URL || 'https://api.rtrvr.ai';
const RTRVR_API_KEY = process.env.RTRVR_API_KEY;

const rtrvrClient = new RtrvrClient({
  baseUrl: RTRVR_API_URL,
  apiKey: RTRVR_API_KEY,
  timeout: 30000,
});

const scheduler = new TaskScheduler(rtrvrClient);

const server = new Server(
  {
    name: 'mcp-time-schedule-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'create_scheduled_task',
    description:
      'Create a new scheduled task that will be executed by the rtrvr.ai web agent at the specified time',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the task',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the task',
        },
        scheduledTime: {
          type: 'string',
          description: 'ISO 8601 formatted date-time string for when to execute the task',
        },
        cronExpression: {
          type: 'string',
          description: 'Cron expression for recurring tasks (e.g., "0 9 * * *" for daily at 9 AM)',
        },
        recurring: {
          type: 'boolean',
          description: 'Whether this is a recurring task',
          default: false,
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata and parameters for the rtrvr.ai agent',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List all scheduled tasks',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
          description: 'Filter tasks by status',
        },
      },
    },
  },
  {
    name: 'get_task',
    description: 'Get details of a specific task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        scheduledTime: {
          type: 'string',
          description: 'New scheduled time (ISO 8601 format)',
        },
        cronExpression: {
          type: 'string',
          description: 'New cron expression',
        },
        status: {
          type: 'string',
          enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
          description: 'New status',
        },
        recurring: {
          type: 'boolean',
          description: 'Whether this is a recurring task',
        },
        metadata: {
          type: 'object',
          description: 'Updated metadata',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'execute_task',
    description: 'Manually execute a task immediately',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'cancel_task',
    description: 'Cancel a scheduled task',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_upcoming_tasks',
    description: 'Get upcoming scheduled tasks',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of tasks to return',
          default: 10,
        },
      },
    },
  },
  {
    name: 'rtrvr_query_agent',
    description: 'Query the rtrvr.ai web agent directly',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query to send to the rtrvr.ai agent',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'rtrvr_get_status',
    description: 'Get the current status of the rtrvr.ai web agent',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'rtrvr_schedule_web_action',
    description: 'Schedule a web action to be executed by rtrvr.ai at a specific time',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          description: 'The web action to perform',
        },
        parameters: {
          type: 'object',
          description: 'Parameters for the web action',
        },
        scheduledTime: {
          type: 'string',
          description: 'ISO 8601 formatted date-time string',
        },
      },
      required: ['action', 'parameters', 'scheduledTime'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_scheduled_task': {
        const validated = CreateTaskSchema.parse(args);
        const task: Task = {
          id: randomUUID(),
          title: validated.title,
          description: validated.description,
          scheduledTime: validated.scheduledTime,
          cronExpression: validated.cronExpression,
          recurring: validated.recurring,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: validated.metadata,
        };

        const createdTask = scheduler.createTask(task);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(createdTask, null, 2),
            },
          ],
        };
      }

      case 'list_tasks': {
        const tasks = args?.status
          ? scheduler.getTasksByStatus(args.status as Task['status'])
          : scheduler.getAllTasks();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      }

      case 'get_task': {
        if (!args?.id) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task ID is required' }),
              },
            ],
            isError: true,
          };
        }
        const task = scheduler.getTask(args.id as string);
        if (!task) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task not found' }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      }

      case 'update_task': {
        const validated = UpdateTaskSchema.parse(args);
        const { id, ...updates } = validated;
        const updatedTask = scheduler.updateTask(id, updates);

        if (!updatedTask) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task not found' }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updatedTask, null, 2),
            },
          ],
        };
      }

      case 'delete_task': {
        if (!args?.id) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task ID is required' }),
              },
            ],
            isError: true,
          };
        }
        const deleted = scheduler.deleteTask(args.id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: deleted }),
            },
          ],
        };
      }

      case 'execute_task': {
        if (!args?.id) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task ID is required' }),
              },
            ],
            isError: true,
          };
        }
        await scheduler.executeTask(args.id as string);
        const task = scheduler.getTask(args.id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      }

      case 'cancel_task': {
        if (!args?.id) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Task ID is required' }),
              },
            ],
            isError: true,
          };
        }
        const cancelled = scheduler.cancelTask(args.id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: cancelled }),
            },
          ],
        };
      }

      case 'get_upcoming_tasks': {
        const limit = args?.limit || 10;
        const tasks = scheduler.getUpcomingTasks(limit as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      }

      case 'rtrvr_query_agent': {
        if (!args?.query) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Query is required' }),
              },
            ],
            isError: true,
          };
        }
        const result = await rtrvrClient.queryAgent(args.query as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'rtrvr_get_status': {
        const result = await rtrvrClient.getAgentStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'rtrvr_schedule_web_action': {
        if (!args?.action || !args?.parameters || !args?.scheduledTime) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'action, parameters, and scheduledTime are required',
                }),
              },
            ],
            isError: true,
          };
        }
        const result = await rtrvrClient.scheduleWebAction(
          args.action as string,
          args.parameters as Record<string, any>,
          args.scheduledTime as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Time Schedule Server with rtrvr.ai integration started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
