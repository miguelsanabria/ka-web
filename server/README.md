# ka-web/server — Operaciones rápidas

Comandos rápidos

- Instalar dependencias:

  cd ka-web/server
  npm install

- Iniciar en desarrollo / local:

  npm start

- Variables útiles:

  - `PORT` (por defecto 3000)
  - `OUT_DIR` (ruta a archivos estáticos, p. ej. ../out)
  - `DATA_DIR` (ruta a `data/` con `rsvp.sqlite` y `videos/`)

Backups y mantenimiento

- Hacer backup de la DB SQLite:

  mkdir -p ~/backups/ka-web
  cp data/rsvp.sqlite ~/backups/ka-web/rsvp.sqlite.$(date +%F_%H%M)

- Sincronizar `data/` a un host de backups (ej. `df-data-01`):

  rsync -az --progress data/ df-data-01:/path/to/backups/ka-web/data/

Script de backup incluido

- `scripts/backup.sh` — copia `data/rsvp.sqlite` a `~/backups/ka-web` y sincroniza `data/videos`.
  - Uso local:

    cd ka-web/server
    ./scripts/backup.sh

  - Sincronizar a remoto:

    cd ka-web/server
    REMOTE=df-data-01:/srv/backups/ka-web ./scripts/backup.sh

Logs y diagnóstico

- Ver logs del servicio cuando esté en Docker (en el host remoto):

  docker compose logs -f api

- Probar endpoint de health:

  curl http://localhost:3000/api/health

Consideraciones de seguridad

- No guardar secretos en el repositorio. Mantener `.env` en el host y asegurarlo con permisos restrictivos.

Soporte y contactos

- Operaciones en DataFarm: acceso SSH a `df-web-01`, `df-edge-01`, `df-data-01`, `df-mgmt-01`.
