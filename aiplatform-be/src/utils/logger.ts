import morgan from 'morgan';

// Simple console logger used across the app
export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

// Morgan stream that forwards access logs into our logger.info
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export a preconfigured morgan middleware for request logging
export const requestLogger = morgan('dev', { stream });
