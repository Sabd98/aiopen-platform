import type { Request, RequestHandler } from 'express';
import { z } from 'zod';

// Auth validation schemas
const extractString = (val: unknown) => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    // @ts-ignore
    if (typeof val.email === 'string') return val.email;
    // @ts-ignore
    if (typeof val.username === 'string') return val.username;
    // @ts-ignore
    if (typeof val.value === 'string') return val.value;
  }
  return val;
};

const registerSchema = z.object({
  username: z.preprocess(extractString, z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters')),
  email: z.preprocess(extractString, z.string().email('Invalid email address')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
});

const loginSchema = z.object({
  email: z.preprocess(extractString, z.string().email('Invalid email address')),
  password: z.string().min(1, 'Password is required'),
});

// Minimal, inline safeParse shape — keeps this file independent of Zod's
export function validateBody<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: unknown } }
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = typeof (result.error as any)?.flatten === 'function'
        ? (result.error as any).flatten()
        : result.error;
      return res.status(400).json({ error: 'Invalid request', details });
    }
    // Narrow the body for downstream handlers
    (req as Request<any, any, T>).body = result.data;
    return next();
  };
}

export const validateAuth = {
  register: validateBody(registerSchema),
  login: validateBody(loginSchema),
};
