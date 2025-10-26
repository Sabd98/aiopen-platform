import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app.js';
import { testConnection, sequelize } from './db/index.js';
const PORT = process.env.PORT || 8080;

async function main() {
  await testConnection();
  // ensure models and associations are loaded before sync
  await import('./models/index.js');

  // dev/trial: sync models to DB.
  await sequelize.sync({ alter: true });
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
main().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});


