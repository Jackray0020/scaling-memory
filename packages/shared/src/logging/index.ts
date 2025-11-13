/**
 * Logging utilities
 * Provides structured logging interface with dependency inversion
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

/**
 * Logger interface for dependency inversion
 */
export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void;
  child(context: string): Logger;
}

/**
 * Log formatter interface
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}

/**
 * Log transport interface
 */
export interface LogTransport {
  write(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
}

/**
 * JSON log formatter
 */
export class JsonLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const formatted = {
      timestamp: new Date(entry.timestamp).toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      context: entry.context,
      metadata: entry.metadata,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : undefined,
    };
    return JSON.stringify(formatted);
  }
}

/**
 * Text log formatter
 */
export class TextLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const context = entry.context ? `[${entry.context}] ` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    const error = entry.error ? `\n${entry.error.stack || entry.error.message}` : '';
    return `${timestamp} ${level} ${context}${entry.message}${metadata}${error}`;
  }
}

/**
 * Console log transport
 */
export class ConsoleLogTransport implements LogTransport {
  constructor(private formatter: LogFormatter) {}

  write(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }
}

/**
 * Base logger implementation
 */
export class BaseLogger implements Logger {
  constructor(
    private transports: LogTransport[],
    private minLevel: LogLevel = LogLevel.INFO,
    private context?: string
  ) {}

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message,
      context: this.context,
      metadata,
      error,
    };
    this.writeEntry(entry);
  }

  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.context,
      metadata,
    };
    this.writeEntry(entry);
  }

  child(context: string): Logger {
    const fullContext = this.context ? `${this.context}:${context}` : context;
    return new BaseLogger(this.transports, this.minLevel, fullContext);
  }

  private writeEntry(entry: LogEntry): void {
    for (const transport of this.transports) {
      transport.write(entry);
    }
  }
}

/**
 * No-op logger for testing or disabled logging
 */
export class NoopLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  log(): void {}
  child(): Logger {
    return this;
  }
}

/**
 * Logger factory
 */
export class LoggerFactory {
  static createConsoleLogger(
    options: {
      minLevel?: LogLevel;
      format?: 'json' | 'text';
    } = {}
  ): Logger {
    const formatter =
      options.format === 'json' ? new JsonLogFormatter() : new TextLogFormatter();
    const transport = new ConsoleLogTransport(formatter);
    return new BaseLogger([transport], options.minLevel ?? LogLevel.INFO);
  }

  static createNoopLogger(): Logger {
    return new NoopLogger();
  }
}
