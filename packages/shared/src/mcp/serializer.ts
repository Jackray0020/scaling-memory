import { MCPRequest, MCPResponse, MCPError } from './types';

export class MCPSerializer {
  serializeRequest(method: string, params?: Record<string, unknown>): string {
    const request: MCPRequest = {
      id: this.generateRequestId(),
      method,
      params: params || {},
      timestamp: new Date()
    };

    return JSON.stringify(request);
  }

  deserializeResponse<T = unknown>(data: string): MCPResponse<T> {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.id) {
        throw new Error('Response missing id field');
      }

      const response: MCPResponse<T> = {
        id: parsed.id,
        success: parsed.success !== false,
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date()
      };

      if (parsed.data !== undefined) {
        response.data = parsed.data;
      }

      if (parsed.error) {
        response.error = this.parseError(parsed.error);
        response.success = false;
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to deserialize response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  parseRequest(data: string): MCPRequest {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.id || !parsed.method) {
        throw new Error('Request missing required fields (id, method)');
      }

      return {
        id: parsed.id,
        method: parsed.method,
        params: parsed.params || {},
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date()
      };
    } catch (error) {
      throw new Error(`Failed to parse request: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  serializeResponse<T = unknown>(id: string, data?: T, error?: MCPError): string {
    const response: MCPResponse<T> = {
      id,
      success: !error,
      timestamp: new Date()
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (error) {
      response.error = error;
    }

    return JSON.stringify(response);
  }

  createError(code: string, message: string, details?: Record<string, unknown>): MCPError {
    return {
      code,
      message,
      details,
      stack: new Error().stack
    };
  }

  private parseError(error: unknown): MCPError {
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      return {
        code: typeof err.code === 'string' ? err.code : 'UNKNOWN_ERROR',
        message: typeof err.message === 'string' ? err.message : 'Unknown error',
        details: typeof err.details === 'object' ? err.details as Record<string, unknown> : undefined,
        stack: typeof err.stack === 'string' ? err.stack : undefined
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error)
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
