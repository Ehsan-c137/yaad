import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const currentDir = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const client = new pg.Client({
    connectionString:
      process.env.DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/yaad',
  });

  try {
    console.log('[Yaad API] Connecting to database...');
    await client.connect();

    const db = drizzle(client);
    const migrationsFolder = resolve(currentDir, 'migrations');

    console.log(`[Yaad API] Running migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });

    console.log('[Yaad API] Migrations completed successfully ✓');
  } catch (error) {
    console.error('[Yaad API] Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

await runMigrations();
