/**
 * HTTP utilities
 * Provides HTTP client abstractions and utilities
 */

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

/**
 * HTTP status code ranges
 */
export enum HttpStatusRange {
  INFORMATIONAL = 100,
  SUCCESS = 200,
  REDIRECTION = 300,
  CLIENT_ERROR = 400,
  SERVER_ERROR = 500,
}

/**
 * Common HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * HTTP request configuration
 */
export interface HttpRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  config: HttpRequestConfig;
}

/**
 * HTTP error
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly response?: HttpResponse<unknown>
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  static isServerError(status: number): boolean {
    return status >= 500 && status < 600;
  }

  static isRetryable(status: number): boolean {
    return status === 429 || status >= 500;
  }
}

/**
 * HTTP client interface for dependency inversion
 */
export interface HttpClient {
  request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  get<T = unknown>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  post<T = unknown>(
    url: string,
    body?: unknown,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>>;
  put<T = unknown>(
    url: string,
    body?: unknown,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>>;
  patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: Partial<HttpRequestConfig>
  ): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
}

/**
 * Request interceptor interface
 */
export interface RequestInterceptor {
  onRequest(config: HttpRequestConfig): HttpRequestConfig | Promise<HttpRequestConfig>;
}

/**
 * Response interceptor interface
 */
export interface ResponseInterceptor {
  onResponse<T>(response: HttpResponse<T>): HttpResponse<T> | Promise<HttpResponse<T>>;
  onError?(error: HttpError): HttpError | Promise<HttpError>;
}

/**
 * Retry strategy interface
 */
export interface RetryStrategy {
  shouldRetry(error: HttpError, attemptNumber: number): boolean;
  getDelay(attemptNumber: number): number;
}

/**
 * Exponential backoff retry strategy
 */
export class ExponentialBackoffRetryStrategy implements RetryStrategy {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 30000
  ) {}

  shouldRetry(error: HttpError, attemptNumber: number): boolean {
    return attemptNumber < this.maxRetries && HttpError.isRetryable(error.status);
  }

  getDelay(attemptNumber: number): number {
    const delay = this.baseDelay * Math.pow(2, attemptNumber);
    return Math.min(delay, this.maxDelay);
  }
}

/**
 * Auth token interceptor
 */
export class AuthTokenInterceptor implements RequestInterceptor {
  constructor(
    private getToken: () => string | Promise<string>,
    private headerName: string = 'Authorization',
    private tokenPrefix: string = 'Bearer'
  ) {}

  async onRequest(config: HttpRequestConfig): Promise<HttpRequestConfig> {
    const token = await this.getToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        [this.headerName]: `${this.tokenPrefix} ${token}`,
      },
    };
  }
}

/**
 * Rate limiting interceptor
 */
export class RateLimitInterceptor implements RequestInterceptor {
  private lastRequestTime = 0;

  constructor(private minIntervalMs: number) {}

  async onRequest(config: HttpRequestConfig): Promise<HttpRequestConfig> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minIntervalMs) {
      await this.delay(this.minIntervalMs - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
    return config;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * URL builder utility
 */
export class UrlBuilder {
  private baseUrl: string;
  private pathSegments: string[] = [];
  private queryParams: Record<string, string> = {};

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  path(...segments: string[]): this {
    this.pathSegments.push(...segments.map((s) => s.replace(/^\/|\/$/g, '')));
    return this;
  }

  query(params: Record<string, string | number | boolean>): this {
    Object.entries(params).forEach(([key, value]) => {
      this.queryParams[key] = String(value);
    });
    return this;
  }

  build(): string {
    let url = this.baseUrl;
    if (this.pathSegments.length > 0) {
      url += '/' + this.pathSegments.join('/');
    }
    const queryString = new URLSearchParams(this.queryParams).toString();
    if (queryString) {
      url += '?' + queryString;
    }
    return url;
  }
}

/**
 * Content type helpers
 */
export const ContentType = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
} as const;

/**
 * Common header helpers
 */
export const Headers = {
  contentType(type: string): Record<string, string> {
    return { 'Content-Type': type };
  },

  accept(type: string): Record<string, string> {
    return { Accept: type };
  },

  authorization(token: string, type: string = 'Bearer'): Record<string, string> {
    return { Authorization: `${type} ${token}` };
  },

  custom(headers: Record<string, string>): Record<string, string> {
    return { ...headers };
  },
};
