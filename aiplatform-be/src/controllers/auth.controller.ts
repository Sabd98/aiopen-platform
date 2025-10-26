import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      // Log incoming body (use console.log to ensure it appears in container logs)
      try {
        console.log('Register incoming body:', JSON.stringify(req.body));
      } catch (e) {
        console.log('Register incoming body (non-serializable):', req.body);
      }

      // Coerce/sanitize input values to primitives to avoid Sequelize escaping errors
      const rawUsername = (req.body && req.body.username) ?? null;
      const rawEmail = (req.body && req.body.email) ?? null;
      const password = (req.body && req.body.password) ?? null;

      const username = typeof rawUsername === 'string' ? rawUsername : (rawUsername && typeof rawUsername === 'object' ? (rawUsername.username || rawUsername.value || '') : String(rawUsername ?? ''));
      const email = typeof rawEmail === 'string' ? rawEmail : (rawEmail && typeof rawEmail === 'object' ? (rawEmail.email || rawEmail.value || '') : String(rawEmail ?? ''));

      // Build where clause explicitly and log it for debugging
      const whereClause: any = {
        [Op.or]: [
          { email },
          { username },
        ],
      };
      console.log('Register where clause:', JSON.stringify(whereClause));

      // Check if user already exists
      const existingUser = await User.findOne({ where: whereClause } as any);

      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'Username or email already taken',
        });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
      });

      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user',
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }

      // Check password
      const isValidPassword = await user.checkPassword(password);

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      console.log('Login session set:', { userId: user.id, sessionId: req.sessionID });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to login',
      });
    }
  }

  // Logout user
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to logout',
          });
        }

        res.clearCookie('sessionId');
        res.json({
          success: true,
          message: 'Logout successful',
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout',
      });
    }
  }

  // Get current user
  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Not authenticated',
          message: 'User not found in session',
        });
      }

      res.json({
        success: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
        },
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get user info',
      });
    }
  }

  // Check authentication status
  static async checkAuth(req: Request, res: Response) {
    try {
      const isAuthenticated = !!req.session.userId;
      
      console.log('Auth check:', { 
        sessionId: req.sessionID, 
        userId: req.session.userId, 
        isAuthenticated,
        cookies: req.headers.cookie
      });
      
      res.json({
        isAuthenticated,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check authentication',
      });
    }
  }
}