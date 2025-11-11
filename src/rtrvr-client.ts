import axios, { AxiosInstance } from 'axios';
import type { RtrvrAgentConfig, RtrvrAgentTask, RtrvrAgentResponse } from './types.js';

export class RtrvrClient {
  private client: AxiosInstance;
  private config: RtrvrAgentConfig;

  constructor(config: RtrvrAgentConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });
  }

  async executeTask(task: RtrvrAgentTask): Promise<RtrvrAgentResponse> {
    try {
      const response = await this.client.post('/agent/execute', {
        action: task.action,
        parameters: task.parameters,
        context: task.context,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error executing rtrvr.ai task:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async queryAgent(query: string): Promise<RtrvrAgentResponse> {
    try {
      const response = await this.client.post('/agent/query', {
        query,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error querying rtrvr.ai agent:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAgentStatus(): Promise<RtrvrAgentResponse> {
    try {
      const response = await this.client.get('/agent/status');

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error getting rtrvr.ai agent status:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async scheduleWebAction(
    action: string,
    parameters: Record<string, any>,
    scheduledTime: string
  ): Promise<RtrvrAgentResponse> {
    try {
      const response = await this.client.post('/agent/schedule', {
        action,
        parameters,
        scheduledTime,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error scheduling web action:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
