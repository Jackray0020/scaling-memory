import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  scheduledTime: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  cronExpression: z.string().optional(),
  recurring: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scheduledTime: z.string().optional(),
  cronExpression: z.string().optional(),
  recurring: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  scheduledTime: z.string().optional(),
  cronExpression: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  recurring: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

export interface RtrvrAgentConfig {
  apiKey?: string;
  baseUrl: string;
  timeout?: number;
}

export interface RtrvrAgentTask {
  action: string;
  parameters: Record<string, any>;
  context?: string;
}

export interface RtrvrAgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}
