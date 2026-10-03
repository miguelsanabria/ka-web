#!/bin/bash
# =====================================================================
# Deploy karen-y-aldo.com a df-web-01 (compila en Mac, sirve en df-web-01)
#
# Uso:
#   ./deploy.sh          # build + sync + rebuild docker
#   ./deploy.sh --web    # solo sincroniza y rebuild del contenedor web
#   ./deploy.sh --no-build  # salta npm run build (usa el out/ existente)
# =====================================================================
set -euo pipefail

# --- Configuración ---
PI_HOST="df-web-01"
PI_SSH_PORT="22"
PI_DIR="/srv/data/ka-web"
RSYNC="rsync -az --delete --itemize-changes"
EXCLUDES=(
  --exclude='.git'
  --exclude='node_modules'
  --exclude='.next'
  --exclude='server/node_modules'
  --exclude='data'
  --exclude='.env'
  --exclude='*.log'
  --exclude='.DS_Store'
  --exclude='tsconfig.tsbuildinfo'
)
WEB_ONLY=false
SKIP_BUILD=false

# --- Parámetros ---
for arg in "$@"; do
  case "$arg" in
    --web) WEB_ONLY=true ;;
    --no-build) SKIP_BUILD=true ;;
    *) echo "⚠️  Argumento desconocido: $arg" ;;
  esac
done

echo "🚀 Deploy karen-y-aldo.com → $PI_HOST"

# 1. Compilar en Mac
if [ "$SKIP_BUILD" = false ]; then
  echo ""
  echo "📦 1/4 Compilando en Mac (npm run build)..."
  ( cd "$(dirname "$0")" && npm run build )
else
  echo ""
  echo "📦 1/4 Omitiendo build (--no-build), usando out/ existente"
fi

# 2. Sincronizar código fuente (sin datos ni credenciales)
echo ""
echo "📤 2/4 Sincronizando a $PI_HOST..."
$RSYNC "${EXCLUDES[@]}" \
  -e "ssh -p $PI_SSH_PORT" \
  "$(dirname "$0")/" \
  "$PI_HOST:$PI_DIR/"

# 3. Rebuild docker (solo web, o web + api)
echo ""
echo "🛠️  3/4 Reconstruyendo contenedores..."
SSH="ssh -p $PI_SSH_PORT $PI_HOST"
if [ "$WEB_ONLY" = true ]; then
  echo "    (solo web)"
  $SSH "cd $PI_DIR && docker compose build web && docker compose up -d web"
else
  $SSH "cd $PI_DIR && docker compose build web api && docker compose up -d web api"
fi

# 4. Verificación
echo ""
echo "✅ 4/4 Verificando..."
$SSH "docker compose -f $PI_DIR/docker-compose.yml ps --format 'table {{.Name}}\t{{.Status}}'"
echo ""
echo "🔗 Sitio: https://karen-y-aldo.com"
echo "   (la caché DNS puede tardar unos segundos en refrescarse)"