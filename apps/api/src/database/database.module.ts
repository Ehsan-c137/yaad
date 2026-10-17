import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

@Module({
  imports: [
    DrizzleModule.forRoot({
      drizzle,
      schema,
      connection:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgrespassword@localhost:5432/yaad',
    }),
  ],
  exports: [DrizzleModule],
})
export class DatabaseModule {}
