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

BACKUP_FILE=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: scripts/restore-backup.sh [--dry-run] /path/to/dsaie_YYYYMMDD_HHMMSS.tar.gz" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-}"
UPLOADS_DIR="${UPLOADS_DIR:-$REPO_DIR/public/uploads}"

TMP_DIR="$(mktemp -d)"
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

DB_DUMP_PATH="$TMP_DIR/db.sql"
if [[ ! -f "$DB_DUMP_PATH" ]]; then
  echo "db.sql not found in backup." >&2
  rm -rf "$TMP_DIR"
  exit 1
fi

DB_URL="${DATABASE_URL%%\?*}"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run enabled. Would restore:"
  echo "- Database: $DB_URL"
  echo "- Uploads: $UPLOADS_DIR"
  echo "- Backup file: $BACKUP_FILE"
  rm -rf "$TMP_DIR"
  exit 0
fi

echo "About to restore database to:"
echo "  $DB_URL"
echo "This will overwrite data in the target database."
read -r -p "Type RESTORE to continue: " CONFIRM
if [[ "$CONFIRM" != "RESTORE" ]]; then
  echo "Restore cancelled."
  rm -rf "$TMP_DIR"
  exit 1
fi

if [[ -n "$POSTGRES_CONTAINER" ]]; then
  docker exec -i "$POSTGRES_CONTAINER" psql --dbname="$DB_URL" < "$DB_DUMP_PATH"
else
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql not found. Install PostgreSQL client tools or set POSTGRES_CONTAINER." >&2
    rm -rf "$TMP_DIR"
    exit 1
  fi
  psql --dbname="$DB_URL" < "$DB_DUMP_PATH"
fi

if [[ -d "$TMP_DIR/uploads" ]]; then
  mkdir -p "$UPLOADS_DIR"
  cp -R "$TMP_DIR/uploads"/. "$UPLOADS_DIR"
fi

rm -rf "$TMP_DIR"

echo "Restore complete."
