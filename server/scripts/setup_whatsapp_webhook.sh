#!/usr/bin/env bash
set -euo pipefail

# usage: ./setup_whatsapp_webhook.sh [SECRET]
# If SECRET is provided, it will be used; otherwise a random one is generated.

ENV_FILE=/mnt/data/ka-web/.env
BACKUP=${ENV_FILE}.bak.$(date +%s)
SECRET="${1-}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env file not found at $ENV_FILE" >&2
  exit 1
fi

if [ -z "$SECRET" ]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "ERROR: openssl not available; provide SECRET as first arg" >&2
    exit 1
  fi
  SECRET=$(openssl rand -base64 32)
fi

echo "Backing up $ENV_FILE -> $BACKUP"
cp "$ENV_FILE" "$BACKUP"

# Remove any existing META_APP_SECRET line and append new one
grep -v '^META_APP_SECRET=' "$BACKUP" > "$ENV_FILE"
printf 'META_APP_SECRET=%s\n' "$SECRET" >> "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "Wrote META_APP_SECRET into $ENV_FILE (permissions 600)"

echo "Restarting api service (docker compose)..."
if ! docker compose -f /mnt/data/ka-web/docker-compose.yml restart api; then
  echo "Warning: failed to restart api service with docker compose" >&2
fi

# Start cloudflared ephemeral tunnel
echo "Starting cloudflared tunnel (ephemeral) to /webhook/whatsapp..."
pkill -f "cloudflared.*webhook/whatsapp" || true
nohup cloudflared tunnel --url http://localhost:3000/webhook/whatsapp --no-autoupdate --loglevel info > /tmp/cloudflared_wa.log 2>&1 &

sleep 4
URL=$(grep -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' /tmp/cloudflared_wa.log | head -n1 || true)
if [ -z "$URL" ]; then
  echo "No public URL found yet. Check /tmp/cloudflared_wa.log for details. Showing last 50 lines:"
  tail -n 50 /tmp/cloudflared_wa.log || true
  echo "If cloudflared didn't produce a trycloudflare URL, try running 'cloudflared tunnel' manually or check the binary installation."
  exit 0
fi

echo "PUBLIC_URL=$URL"
echo "Callback URL: ${URL}/webhook/whatsapp"
echo "Verify token: karenyaldo_verif_2026"
echo "App secret (META_APP_SECRET): $SECRET"

# Helpful verification commands (for operator):
cat <<EOF

Next steps / checks you can run on the host:
  grep '^META_APP_SECRET=' $ENV_FILE || true
  ls -l $ENV_FILE
  tail -n 100 /tmp/cloudflared_wa.log
  # After adding the callback URL into Meta Dashboard subscribe to: messages, message_status

EOF
