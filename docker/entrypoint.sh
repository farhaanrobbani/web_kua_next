#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "[entrypoint] prisma migrate deploy"
  prisma migrate deploy
fi

exec node server.js
