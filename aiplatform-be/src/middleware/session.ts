import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import { sequelize } from '../db/index.js';

const SequelizeSessionStore = SequelizeStore(session.Store);

const sessionStore = new SequelizeSessionStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
});

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Only secure in production AND when HTTPS is available
    // For Docker development, we're still using HTTP so secure should be false
    secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Use 'lax' for better compatibility in Docker environment
    sameSite: 'lax' as const,
  },
  name: 'sessionId',
};

// Sync session store
sessionStore.sync();