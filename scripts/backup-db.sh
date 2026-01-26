#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_FILE="${ENV_FILE:-$REPO_DIR/.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Set it in .env or export it before running." >&2
  exit 1
fi

BACKUP_ROOT="${BACKUP_ROOT:-/Users/msaharan/Library/Mobile Documents/com~apple~CloudDocs/dsaie-backups}"
KEEP_COUNT="${KEEP_COUNT:-30}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-}"

mkdir -p "$BACKUP_ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_ROOT/dsaie_${STAMP}.sql.gz"

DB_URL="${DATABASE_URL%%\?*}"

if [[ -n "$POSTGRES_CONTAINER" ]]; then
  docker exec -t "$POSTGRES_CONTAINER" pg_dump --dbname="$DB_URL" | gzip > "$BACKUP_FILE"
else
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "pg_dump not found. Install PostgreSQL client tools or set POSTGRES_CONTAINER." >&2
    exit 1
  fi
  pg_dump --dbname="$DB_URL" | gzip > "$BACKUP_FILE"
fi

if ls "$BACKUP_ROOT"/*.sql.gz >/dev/null 2>&1; then
  ls -1t "$BACKUP_ROOT"/*.sql.gz | tail -n +"$((KEEP_COUNT + 1))" | while read -r file; do
    rm -f "$file"
  done
fi

echo "Backup written to $BACKUP_FILE"
