/**
 * Configuration loading utilities
 * Provides type-safe configuration management with environment variable support
 */

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Base configuration interface
 */
export interface BaseConfig {
  environment: Environment;
  version: string;
  name: string;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  maxConnections?: number;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  apiKey?: string;
}

/**
 * Logging configuration
 */
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destination: 'console' | 'file' | 'both';
  filePath?: string;
}

/**
 * Application configuration
 */
export interface AppConfig extends BaseConfig {
  database?: DatabaseConfig;
  api?: ApiConfig;
  logging: LogConfig;
  features?: Record<string, boolean>;
  custom?: Record<string, unknown>;
}

/**
 * Configuration loader interface
 */
export interface ConfigLoader<T = AppConfig> {
  load(): T;
  reload(): T;
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  validate(): boolean;
}

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<AppConfig> = {
  environment: Environment.DEVELOPMENT,
  logging: {
    level: 'info',
    format: 'text',
    destination: 'console',
  },
};

/**
 * Environment variable parser with type coercion
 */
export class EnvParser {
  static getString(key: string, defaultValue?: string): string | undefined {
    return process.env[key] ?? defaultValue;
  }

  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new ConfigValidationError(
        `Environment variable ${key} must be a number`,
        key,
        value
      );
    }
    return parsed;
  }

  static getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    throw new ConfigValidationError(
      `Environment variable ${key} must be a boolean`,
      key,
      value
    );
  }

  static getEnum<T extends string>(
    key: string,
    allowedValues: readonly T[],
    defaultValue?: T
  ): T | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    if (!allowedValues.includes(value as T)) {
      throw new ConfigValidationError(
        `Environment variable ${key} must be one of: ${allowedValues.join(', ')}`,
        key,
        value
      );
    }
    return value as T;
  }

  static getJson<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new ConfigValidationError(
        `Environment variable ${key} must be valid JSON`,
        key,
        value
      );
    }
  }
}

/**
 * Simple in-memory configuration implementation
 */
export class MemoryConfigLoader<T extends BaseConfig = AppConfig> implements ConfigLoader<T> {
  private config: T;

  constructor(initialConfig: T) {
    this.config = { ...initialConfig };
  }

  load(): T {
    return { ...this.config };
  }

  reload(): T {
    return this.load();
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.config[key] = value;
  }

  validate(): boolean {
    if (!this.config.name || !this.config.version) {
      return false;
    }
    return true;
  }
}

/**
 * Configuration builder with fluent API
 */
export class ConfigBuilder {
  private config: Partial<AppConfig> = { ...DEFAULT_CONFIG };

  withEnvironment(env: Environment): this {
    this.config.environment = env;
    return this;
  }

  withName(name: string): this {
    this.config.name = name;
    return this;
  }

  withVersion(version: string): this {
    this.config.version = version;
    return this;
  }

  withLogging(logging: LogConfig): this {
    this.config.logging = logging;
    return this;
  }

  withDatabase(database: DatabaseConfig): this {
    this.config.database = database;
    return this;
  }

  withApi(api: ApiConfig): this {
    this.config.api = api;
    return this;
  }

  withFeatures(features: Record<string, boolean>): this {
    this.config.features = features;
    return this;
  }

  withCustom(custom: Record<string, unknown>): this {
    this.config.custom = custom;
    return this;
  }

  build(): AppConfig {
    if (!this.config.name || !this.config.version || !this.config.environment) {
      throw new ConfigValidationError('Name, version, and environment are required');
    }
    return this.config as AppConfig;
  }
}
