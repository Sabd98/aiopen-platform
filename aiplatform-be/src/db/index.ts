// DB Init
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, 
  define: {
    timestamps: true, 
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection OK');
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
    throw err;
  }
}
