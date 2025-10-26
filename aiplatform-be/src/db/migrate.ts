#!/usr/bin/env node
import { sequelize } from './index.js';
import { Sequelize as SequelizeLib } from 'sequelize';
import { readdirSync } from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

// Resolve directories robustly across platforms (Windows file URLs can include a leading slash)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, 'migrations');
const seedersDir = path.resolve(__dirname, 'seeders');

async function runMigrations(direction: 'up' | 'down') {
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js')).sort();
  for (const file of files) {
      const mod = await import(pathToFileURL(path.join(migrationsDir, file)).href);
    if (typeof mod[direction] === 'function') {
      console.log(`${direction} -> ${file}`);
  // Pass the Sequelize library (class) as the second argument so migrations
  // can reference DataTypes via the provided SequelizeLib parameter.
  await mod[direction](sequelize.getQueryInterface(), SequelizeLib);
    }
  }
}

async function runSeeders(direction: 'up' | 'down') {
  const files = readdirSync(seedersDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js')).sort();
  for (const file of files) {
      const mod = await import(pathToFileURL(path.join(seedersDir, file)).href);
    if (typeof mod[direction] === 'function') {
      console.log(`${direction} -> ${file}`);
  // @ts-ignore
  await mod[direction](sequelize.getQueryInterface(), SequelizeLib);
    }
  }
}

async function main() {
  const cmd = process.argv[2] || 'up';
  try {
    await sequelize.authenticate();
    if (cmd === 'up' || cmd === 'down') {
      await runMigrations(cmd as any);
    } else if (cmd === 'seed:up' || cmd === 'seed:down') {
      await runSeeders(cmd === 'seed:up' ? 'up' : 'down');
    } else {
      console.error('Unknown command', cmd);
      process.exit(1);
    }
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  main();
}
