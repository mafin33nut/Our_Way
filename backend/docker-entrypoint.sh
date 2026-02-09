#!/usr/bin/env sh
set -e

if [ "${SKIP_MIGRATIONS:-0}" != "1" ]; then
  if [ "${RESET_DB:-0}" = "1" ]; then
    python /app/scripts/reset_db.py
  fi
  python /app/scripts/fix_migration_history.py
  python manage.py migrate --noinput
fi

if [ "${SKIP_COLLECTSTATIC:-0}" != "1" ]; then
  python manage.py collectstatic --noinput
fi

exec "$@"
