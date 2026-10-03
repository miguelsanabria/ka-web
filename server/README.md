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
  - `DATA_DIR` (ruta a `data/` con `rsvp.sqlite`, `videos/`, `hidden/`, `inbox/`)
  - `UPLOADS_ENABLED` (`false` cierra la subida de videos sin tocar el código)
  - `VIDEO_MAX_MB` (por defecto 200)
  - `VIDEO_MAX_SECONDS` (por defecto 600) — duración máxima; se comprueba con
    `ffprobe` antes de transcodificar, no solo por tamaño de archivo
  - `VIDEO_MAX_PIXELS` (por defecto 3840×2160 = 4K) — resolución máxima. Es el
    límite que importa: lo que tumba el contenedor api (2 GB) es decodificar,
    no el número de bytes
  - `FFMPEG_THREADS` (por defecto 4) — hilos del encoder

Videos ocultos

- `data/videos/` contiene solo lo visible en el muro, que es justo lo que nginx
  sirve por URL con `location ^~ /media/videos/`.
- Al ocultar un video, el panel lo **mueve** a `data/hidden/` antes de cambiar
  el estado en la base. Marcarlo en la base sin mover el archivo no ocultaría
  nada: la URL pública seguiría sirviéndolo.
- `data/hidden/` está montado en el contenedor web pero en una location
  `internal`: solo se sirve por redirect interno (`X-Accel-Redirect`) desde
  `GET /api/admin/videos/:id/stream`, que exige sesión de admin.
- Ojo: esa location necesita `^~`. Con un prefijo normal, el regex de estáticos
  (`\.(...|mp4|...)$`) captura el `.mp4` antes que ella y responde 404.
- El backup a B2 sincroniza `data/` entero, así que `hidden/` ya está cubierto.

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
