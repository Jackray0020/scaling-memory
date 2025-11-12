/**
 * Centralized logging configuration
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

export default logger;
