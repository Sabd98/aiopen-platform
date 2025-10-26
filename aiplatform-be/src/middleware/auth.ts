import { Request, Response, NextFunction } from 'express';
import { User } from '../models/index.js';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('requireAuth middleware:', {
      sessionId: req.sessionID,
      userId: req.session.userId,
      cookies: req.headers.cookie
    });

    if (!req.session.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource',
      });
    }

    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication check failed',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.userId) {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] },
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); 
  }
};