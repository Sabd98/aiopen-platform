import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);
  if (res.headersSent) return next(err);
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}
