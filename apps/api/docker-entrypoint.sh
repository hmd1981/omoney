#!/usr/bin/env sh
set -eu

PRISMA_CLI="$(find /app/node_modules/.pnpm -path '*/node_modules/prisma/build/index.js' | head -n 1)"
TSX_CLI="$(find /app/node_modules/.pnpm -path '*/node_modules/tsx/dist/cli.mjs' | head -n 1)"

attempt=0
until node "$PRISMA_CLI" migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 10 ]; then
    echo "database initialization failed after $attempt attempts" >&2
    exit 1
  fi
  sleep 5
done

if [ "${RUN_SEED_ON_STARTUP:-false}" = "true" ]; then
  node "$TSX_CLI" prisma/seed.ts
fi

exec node dist/src/main.js
