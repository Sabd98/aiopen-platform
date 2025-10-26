import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import conversationRouter from './routes/conversation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './utils/logger.js';
import { sessionConfig } from './middleware/session.js';

export function createApp() {
  const app = express();
  
  
  // CORS configuration - important for credentials
    const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

    app.use(cors({
      origin: (origin, callback) => {
        // If no origin (like curl, server-to-server), allow it
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    }));
  
  app.use(bodyParser.json());
  app.use(requestLogger);
  
  // Session middleware
  app.use(session(sessionConfig));

  // routes
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/conversations', conversationRouter);

  // error handler (must be last)
  app.use(errorHandler);

  return app;
}
