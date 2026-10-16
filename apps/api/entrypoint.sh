#!/bin/sh
set -e

echo "[Yaad API] Running database migrations with Drizzle..."
node dist/database/migrate.js

echo "[Yaad API] Starting NestJS server..."
exec node dist/main.js
