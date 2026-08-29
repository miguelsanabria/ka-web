#!/usr/bin/env bash
set -euo pipefail
# Simple backup script for ka-web server data
# Usage:
#   ./backup.sh            # hace backup local en ~/backups/ka-web
#   REMOTE=df-data-01:/srv/backups/ka-web ./backup.sh

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${DATA_DIR:-$BASE_DIR/../data}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/ka-web}"
REMOTE="${REMOTE:-}" # ej: df-data-01:/path/to/backups/ka-web

mkdir -p "$BACKUP_DIR"
STAMP=$(date +%F_%H%M%S)

echo "[backup] data_dir=$DATA_DIR -> $BACKUP_DIR"

if [ -f "$DATA_DIR/rsvp.sqlite" ]; then
  cp "$DATA_DIR/rsvp.sqlite" "$BACKUP_DIR/rsvp.sqlite.$STAMP"
  echo "[backup] DB backed up: rsvp.sqlite.$STAMP"
else
  echo "[backup] warning: no rsvp.sqlite found at $DATA_DIR"
fi

if [ -d "$DATA_DIR/videos" ]; then
  mkdir -p "$BACKUP_DIR/videos"
  rsync -az --progress --delete "$DATA_DIR/videos/" "$BACKUP_DIR/videos/"
  echo "[backup] videos synced to $BACKUP_DIR/videos/"
fi

if [ -n "$REMOTE" ]; then
  echo "[backup] syncing to remote: $REMOTE"
  rsync -az --progress "$BACKUP_DIR/" "$REMOTE/"
  echo "[backup] remote sync complete"
fi

echo "[backup] done"
