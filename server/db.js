import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export function generateToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
export const VIDEOS_DIR = path.join(DATA_DIR, "videos");
export const INBOX_DIR = path.join(DATA_DIR, "inbox");
export const ARCHIVE_DIR = path.join(DATA_DIR, "archive");
// Los videos que el admin oculta se mueven aquí. No pueden quedarse en
// VIDEOS_DIR porque nginx sirve ese directorio por URL sin mirar la base de
// datos: mientras el archivo esté ahí, "oculto" no significaría nada.
export const HIDDEN_DIR = path.join(DATA_DIR, "hidden");
export const DB_PATH = path.join(DATA_DIR, "rsvp.sqlite");

export const UPLOADS_ENABLED = (process.env.UPLOADS_ENABLED ?? "true") === "true";
export const VIDEO_MAX_MB = Number(process.env.VIDEO_MAX_MB || 200);
export const MIN_DISK_MB = Number(process.env.MIN_DISK_MB || 1024);
// Tope de duración y de resolución de lo que se acepta subir. Sin esto, un
// video enorme puede agotar la memoria del contenedor api (2 GB), tumbarlo y
// reiniciarlo: el OOM de ffmpeg mata el proceso Node que sirve el sitio.
export const VIDEO_MAX_SECONDS = Number(process.env.VIDEO_MAX_SECONDS || 600);
export const VIDEO_MAX_PIXELS = Number(process.env.VIDEO_MAX_PIXELS || 3840 * 2160);

for (const dir of [VIDEOS_DIR, INBOX_DIR, ARCHIVE_DIR, HIDDEN_DIR]) {
  mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(`
CREATE TABLE IF NOT EXISTS rsvp (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  personas INTEGER DEFAULT 1,
  asistencia TEXT,
  mensaje TEXT,
  invitado_id INTEGER,
  creado_en TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY,
  nombre_archivo TEXT NOT NULL,
  nombre_original TEXT,
  tamaño INTEGER,
  estado TEXT DEFAULT 'visible',
  creado_en TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS invitados (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  personas INTEGER DEFAULT 1,
  grupo TEXT,
  estado TEXT DEFAULT 'pendiente',
  token TEXT,
  rsvp_used INTEGER DEFAULT 0,
  ultimo_envio TEXT,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  to_number TEXT NOT NULL,
  tipo TEXT,
  contenido TEXT,
  template TEXT,
  status TEXT DEFAULT 'pending',
  wa_id TEXT,
  error TEXT,
  invitado_id INTEGER,
  creado_en TEXT DEFAULT (datetime('now'))
);
`);

// Migración: agregar columnas token y rsvp_used si no existen
const cols = db.prepare("PRAGMA table_info(invitados)").all().map((c) => c.name);
if (!cols.includes("token")) {
  db.exec("ALTER TABLE invitados ADD COLUMN token TEXT");
}
if (!cols.includes("rsvp_used")) {
  db.exec("ALTER TABLE invitados ADD COLUMN rsvp_used INTEGER DEFAULT 0");
}
// Asignar token a invitados existentes que no lo tengan
const sinToken = db.prepare("SELECT id FROM invitados WHERE token IS NULL").all();
for (const row of sinToken) {
  db.prepare("UPDATE invitados SET token = ? WHERE id = ?").run(generateToken(), row.id);
}

export function listRsvp() {
  return db
    .prepare("SELECT * FROM rsvp ORDER BY creado_en DESC, id DESC")
    .all();
}

export function insertRsvp({ nombre, personas, asistencia, mensaje, invitado_id }) {
  const info = db
    .prepare(
      "INSERT INTO rsvp (nombre, personas, asistencia, mensaje, invitado_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(nombre, personas, asistencia, mensaje ?? null, invitado_id ?? null);
  if (invitado_id) {
    db.prepare("UPDATE invitados SET estado = ? WHERE id = ?").run(
      asistencia === "no" ? "no_asiste" : "confirmado",
      invitado_id
    );
  }
  return Number(info.lastInsertRowid);
}

export function rsvpCounts() {
  const row = db
    .prepare(
      "SELECT COUNT(*) total, COALESCE(SUM(CASE WHEN asistencia='si' THEN personas ELSE 0 END),0) personas_si, SUM(CASE WHEN asistencia='si' THEN 1 ELSE 0 END) si, SUM(CASE WHEN asistencia='no' THEN 1 ELSE 0 END) no FROM rsvp"
    )
    .get();
  return row;
}

export function listVideos(estado) {
  if (estado) {
    return db
      .prepare("SELECT * FROM videos WHERE estado = ? ORDER BY id DESC")
      .all(estado);
  }
  return db.prepare("SELECT * FROM videos ORDER BY id DESC").all();
}

export function insertVideo({ nombre_archivo, nombre_original, tamaño, estado = "visible" }) {
  const info = db
    .prepare(
      "INSERT INTO videos (nombre_archivo, nombre_original, tamaño, estado) VALUES (?, ?, ?, ?)"
    )
    .run(nombre_archivo, nombre_original, tamaño, estado);
  return Number(info.lastInsertRowid);
}

export function setVideoEstado(id, estado) {
  return db.prepare("UPDATE videos SET estado = ? WHERE id = ?").run(estado, id);
}

export function getVideo(id) {
  return db.prepare("SELECT * FROM videos WHERE id = ?").get(id);
}

export function deleteVideo(id) {
  return db.prepare("DELETE FROM videos WHERE id = ?").run(id);
}

export function listInvitados() {
  return db.prepare("SELECT * FROM invitados ORDER BY id ASC").all();
}

export function insertInvitado({ nombre, whatsapp, personas, grupo }) {
  const token = generateToken();
  const info = db
    .prepare(
      "INSERT INTO invitados (nombre, whatsapp, personas, grupo, token) VALUES (?, ?, ?, ?, ?)"
    )
    .run(nombre, whatsapp, personas, grupo ?? null, token);
  return Number(info.lastInsertRowid);
}

export function updateInvitadoEstado(id, estado) {
  return db
    .prepare("UPDATE invitados SET estado = ?, ultimo_envio = datetime('now') WHERE id = ?")
    .run(estado, id);
}

export function getInvitado(id) {
  return db.prepare("SELECT * FROM invitados WHERE id = ?").get(id);
}

export function getInvitadoByToken(token) {
  return db.prepare("SELECT * FROM invitados WHERE token = ?").get(token);
}

export function markRsvpUsed(id) {
  db.prepare("UPDATE invitados SET rsvp_used = 1 WHERE id = ?").run(id);
}

export function deleteInvitado(id) {
  return db.prepare("DELETE FROM invitados WHERE id = ?").run(id);
}

export function updateInvitado(id, { nombre, whatsapp, personas, grupo, estado }) {
  const fields = [];
  const vals = [];
  if (nombre !== undefined) { fields.push("nombre = ?"); vals.push(nombre); }
  if (whatsapp !== undefined) { fields.push("whatsapp = ?"); vals.push(whatsapp); }
  if (personas !== undefined) { fields.push("personas = ?"); vals.push(personas); }
  if (grupo !== undefined) { fields.push("grupo = ?"); vals.push(grupo); }
  if (estado !== undefined) { fields.push("estado = ?"); vals.push(estado); }
  if (!fields.length) return null;
  vals.push(id);
  return db.prepare(`UPDATE invitados SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
}

export function deleteRsvp(id) {
  return db.prepare("DELETE FROM rsvp WHERE id = ?").run(id);
}

export function invitadoCounts() {
  const row = db
    .prepare(
      "SELECT COUNT(*) total, COALESCE(SUM(personas),0) personas, SUM(CASE WHEN estado='confirmado' THEN 1 ELSE 0 END) confirmados, SUM(CASE WHEN estado='pendiente' THEN 1 ELSE 0 END) pendientes, SUM(CASE WHEN estado='enviado' THEN 1 ELSE 0 END) enviados, SUM(CASE WHEN estado='no_asiste' THEN 1 ELSE 0 END) no_asiste FROM invitados"
    )
    .get();
  return row;
}

// Mensajes WhatsApp: registrar envíos y estados
export function insertMessage({ to_number, tipo, contenido, template, status = 'pending', wa_id = null, error = null, invitado_id = null }) {
  const info = db
    .prepare(
      'INSERT INTO messages (to_number, tipo, contenido, template, status, wa_id, error, invitado_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(to_number, tipo ?? null, contenido ?? null, template ?? null, status, wa_id, error, invitado_id);
  return Number(info.lastInsertRowid);
}

export function listMessages() {
  return db.prepare('SELECT * FROM messages ORDER BY creado_en DESC').all();
}

export function getMessage(id) {
  return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
}

export function updateMessageStatus(id, { status, wa_id = null, error = null }) {
  return db.prepare('UPDATE messages SET status = ?, wa_id = ?, error = ? WHERE id = ?').run(status, wa_id, error, id);
}