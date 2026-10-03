# PLAN · karen-y-aldo.com — Boda Karen & Aldo

> Fecha: 25 ago 2026 · Estado: implementado
> Documento técnico. La propuesta financiera está en `PLAN-FINANCIERO.md`.

## 1. Objetivo
Sitio de boda servido desde el homelab con:
- RSVP en SQLite (con envío de invitaciones por WhatsApp Business API y confirmación por enlace)
- Video guestbook para el iPad (cámara nativa + QR), convertido a MP4
- Muro público de videos en vivo
- Panel de administración con moderación, seguimiento de invitados y archivado post-boda
- Respaldo off-site en Backblaze B2

## 2. Arquitectura
```
karen-y-aldo.com (Cloudflare DNS)
   └─ Cloudflare Tunnel (cloudflared · sin abrir puertos)
        └─ df-edge-01 → Traefik → Host(karen-y-aldo.com) → web:80
             └─ df-apps-01 → docker-compose:
                  ├─ web     (Nginx: out/ estático + /media/videos + proxy /api)  ← único expuesto a Traefik
                  ├─ api     (Node 22 + ffmpeg: RSVP · admin · guestbook · WhatsApp)  ← red interna
                  ├─ backup  (rclone → Backblaze B2, cron diario)
                  └─ /data   (bind mount df-data-01, 400 GB)
                       ├─ rsvp.sqlite   ├─ videos/   ├─ inbox/   └─ archive/
```

## 3. Contenedores (Docker Compose)
- **`web`** — `nginx:alpine`: sirve `out/` (build estático), `client_max_body_size 200m`,
  sirve `/media/videos` (MP4 progresivo), proxya `/api` y `/webhook` → `api:3000`.
- **`api`** — `node:24-alpine` + `ffmpeg`: Express; SQLite con `node:sqlite` (integrado);
  recepción de uploads → `inbox/` → ffmpeg → `videos/`; auth, admin, rate limiting, webhook WhatsApp.
- **`backup`** — `rclone/rclone`: `rclone sync /data → r2://bucket/karen-aldo` vía cron diario.
- **Endurecimiento:** non-root, `read_only: true` + `tmpfs /tmp`, `cap_drop: ALL`,
  `no-new-privileges`, límites cpu/mem, secretos solo en `.env`.

## 4. Base de datos (SQLite, modo WAL + busy_timeout)
```sql
CREATE TABLE IF NOT EXISTS rsvp (
  id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, personas INTEGER DEFAULT 1,
  asistencia TEXT, mensaje TEXT, invitado_id INTEGER,
  creado_en TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY, nombre_archivo TEXT NOT NULL, nombre_original TEXT,
  tamaño INTEGER, estado TEXT DEFAULT 'visible', creado_en TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS invitados (
  id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, whatsapp TEXT NOT NULL,
  personas INTEGER DEFAULT 1, grupo TEXT, estado TEXT DEFAULT 'pendiente',
  ultimo_envio TEXT, creado_en TEXT DEFAULT (datetime('now'))
);
```

## 5. API
**Público**
- `POST /api/rsvp` → inserta en `rsvp`; si `invitado_id`/token coincide, marca `invitados.estado='confirmado'`.
- `GET /api/guestbook` → videos `estado='visible'`.
- `POST /api/guestbook` → multipart (máx `VIDEO_MAX_MB`=200, guardia de disco ≥1 GB, `ffprobe` valida) → `inbox/` → ffmpeg → `videos/video-<ts>.mp4` → fila.
- `/media/videos/<archivo>` → servido por Nginx.

**Admin (cookie httpOnly firmada con `SECRET`)**
- `POST /api/admin/login|logout` · `GET /api/admin/me`
- `GET /api/admin/rsvp` (lista+conteo) · `GET/PATCH/DELETE /api/admin/videos` (aprobar/ocultar/eliminar)
- `GET/POST /api/admin/invitados` · `POST /api/admin/invitados/import` (CSV)
- `POST /api/admin/send-invites` (WhatsApp por lotes) · `POST /api/admin/reminders` (follow-up)
- `POST /api/admin/archive` · `GET /api/admin/archive`

**WhatsApp (Meta Cloud API)**
- `GET /webhook/whatsapp` (verificación) · `POST /webhook/whatsapp` (entrada + status; firma `X-Hub-Signature-256`).

**Middleware:** auth, rate limiting por IP (`trust proxy`, Express `trust proxy=1`), sanitización, límite de subidas.

## 6. Frontend (Next.js estático)
- `/` — sitio + muro "Videos de nuestros invitados" (masonry `<video playsInline preload="metadata">`, auto-refresh 10 s) + sección RSVP.
- `/rsvp?i=<id>&t=<token>` — formulario pre-llenado (nombre/personas) → `POST /api/rsvp`.
- `/grabar` — cámara nativa (`<input capture>`), grabado in-browser opcional, QR hacia `/grabar`, guía 4–5 min / 200 MB.
- `/confirmados` (login) — tabla + conteo de RSVP.
- `/admin` (login) — moderar videos, RSVP, invitados/WhatsApp, archivado.

## 7. Pipeline de video
`upload → inbox/ → ffmpeg -i <mov|webm|mp4> -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart → videos/video-<ts>.mp4 → fila` · cola de 1 a la vez.

## 8. Seguridad
Non-root · Nginx único punto expuesto · ffmpeg aislado del proxy · rate limiting ·
sanitización + `ffprobe` · guardia de disco · `.env` con `ADMIN_PASSWORD` (bcrypt) y `SECRET` ·
firma de webhook · respaldo Backblaze B2.

## 9. Archivado post-boda
`server/scripts/archive.mjs` (botón en `/admin` o `docker exec`): transcoda todo a MP4 de archivo
(CRF 18) → `/data/archive/`, exporta RSVP/CSV y `invitados`/CSV, genera ZIP.
`UPLOADS_ENABLED=false` detiene subidas sin borrar el muro.

## 10. Deploy
1. Comprar `karen-y-aldo.com` + cuenta Cloudflare. 2. `npm run build` → `out/`.
3. Repo al homelab. 4. Crear `.env` (ver `.env.example`). 5. `docker compose up -d --build` en `df-apps-01`.
6. Traefik en `df-edge-01`: router Host(`karen-y-aldo.com`) → `web:80` (red compartida).
7. Cloudflare Tunnel en `df-edge-01` apuntando a Traefik; DNS.
8. Probar: RSVP, iPad en `/grabar`, muro, admin, WhatsApp webhook.

## 11. Estructura del repo
```
ka-web/
├── PLAN.md · PLAN-FINANCIERO.md
├── src/            (Next.js estático)
│   ├── app/{rsvp,grabar,confirmados,admin}/page.tsx
│   └── components/ (RsvpForm, GuestbookWall, …)
├── server/         (Express + SQLite + ffmpeg + WhatsApp)
│   ├── app.js · db.js · auth.js · limiter.js · ffmpeg.js · whatsapp.js · routes/*.js
│   └── scripts/archive.mjs
├── docker/api.Dockerfile · docker/web/Dockerfile · docker/web/nginx.conf
├── docker-compose.yml
└── .env.example
```

## 12. Pendientes del usuario
- Comprar dominio `karen-y-aldo.com` y crear cuenta Cloudflare.
- Crear túnel (Cloudflare Zero Trust) y token de `cloudflared`.
- Número WhatsApp Business + `WHATSAPP_PHONE_ID`/`WHATSAPP_TOKEN` + aprobar template en Meta.
- Definir `ADMIN_PASSWORD` y `SECRET`.
- Número WhatsApp real para el RSVP secundario (en `src/lib/data.ts`).
- Montaje de `df-data-01` (400 GB) y red de Traefik.