import { sequelize } from './index.js';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
// import models to ensure they are registered with sequelize before sync()
import './models.js';

// WARNING: this script will DROP all tables in the current database (Postgres).
// It is gated behind the env var ALLOW_DB_RESET=true to avoid accidental run.

export async function resetAndMigrate() {
  if (process.env.ALLOW_DB_RESET !== 'true') {
    throw new Error(
      'ALLOW_DB_RESET not set to true. Set environment variable to allow DB reset.\n' +
        "Example: ALLOW_DB_RESET=true node --loader ts-node/esm src/db/resetAndMigrate.ts\n" +
        "Or run the script with the CLI flag '--force' (not recommended for production)."
    );
  }

  const dialect = sequelize.getDialect();
  if (dialect !== 'postgres') {
    throw new Error('resetAndMigrate currently supports Postgres only');
  }

  logger.warn('Dropping public schema and recreating (all data will be lost)');
  try {
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    // sync models to recreate tables
    await sequelize.sync({ force: true });
    logger.info('DB reset complete and models synced');
  } catch (err) {
    logger.error('resetAndMigrate failed', err);
    throw err;
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  // allow a CLI safety-override: --force or -f will set ALLOW_DB_RESET for this run
  const args = process.argv.slice(2);
  if (args.includes('--force') || args.includes('-f')) {
    logger.warn("--force passed on CLI; setting ALLOW_DB_RESET=true for this run (use with caution)");
    process.env.ALLOW_DB_RESET = 'true';
  }

  (async () => {
    try {
      await resetAndMigrate();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
