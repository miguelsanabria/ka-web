import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { spawn } from "node:child_process";
import { promises as fs, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  listRsvp,
  rsvpCounts,
  listVideos,
  getVideo,
  setVideoEstado,
  deleteVideo,
  listInvitados,
  insertInvitado,
  updateInvitadoEstado,
  getInvitado,
  invitadoCounts,
  deleteInvitado,
  updateInvitado,
  deleteRsvp,
  VIDEOS_DIR,
  ARCHIVE_DIR,
} from "../db.js";
import { insertMessage, listMessages, getMessage, updateMessageStatus } from "../db.js";
import { setSession, clearSession, getSession, requireAdmin } from "../auth.js";
import { rateLimit } from "../limiter.js";
import { sendTemplate, sendImageMessage, inviteComponents, getConfig } from "../whatsapp.js";
import { generateInvitation } from "../invitacion.js";
import { fileSizeMb } from "../ffmpeg.js";

export const adminRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function buildInviteCaption(nombre, personas, enlace) {
  const esIndividual = personas === 1;
  if (esIndividual) {
    return `Hola, ${nombre}. 🤍

Somos Karen & Aldo y con muchísima ilusión queremos compartir contigo nuestra invitación de boda. ✨

Nos encantaría que nos acompañaras a celebrar uno de los días más importantes de nuestra vida.

Hemos reservado 1 lugar especialmente para ti. 🤍

Te compartimos nuestra invitación, donde encontrarás todos los detalles de nuestro gran día.

¡Esperamos celebrar contigo! 🥂✨

Confirma tu asistencia aquí:
${enlace}

Con cariño,
K & A`;
  }
  return `Hola, ${nombre}. 🤍

Somos Karen & Aldo y nos llena de mucha ilusión compartir con ustedes nuestra invitación de boda. ✨

Nos encantaría que nos acompañaran a celebrar juntos uno de los días más importantes y especiales de nuestra vida.

Hemos reservado ${personas} lugares especialmente para ustedes. 🤍

¡Esperamos compartir este momento tan bonito y celebrar juntos! 🥂✨

Confirma su asistencia aquí:
${enlace}

Con mucho cariño,
K & A`;
}

function buildReminderCaption(nombre, personas, enlace) {
  const esIndividual = personas === 1;
  if (esIndividual) {
    return `Hola, ${nombre}. 🤍

Somos Karen & Aldo y queríamos recordarte que te esperamos con los brazos abiertos en nuestra boda.

Hemos reservado 1 lugar especialmente para ti. 🤍

Si aún no has confirmado, te invitamos a hacerlo para tener todo listo.

¡Esperamos celebrar contigo! 🥂✨

Confirma aquí:
${enlace}

Con cariño,
K & A`;
  }
  return `Hola, ${nombre}. 🤍

Somos Karen & Aldo y queríamos recordarles que los esperamos con los brazos abiertos en nuestra boda.

Hemos reservado ${personas} lugares especialmente para ustedes. 🤍

Si aún no han confirmado, les invitamos a hacerlo para tener todo listo.

¡Esperamos celebrar juntos! 🥂✨

Confirma su asistencia aquí:
${enlace}

Con mucho cariño,
K & A`;
}

adminRouter.post(
  "/login",
  rateLimit({ name: "login", windowMs: 60_000, max: 5 }),
  (req, res) => {
    const { password } = req.body || {};
    if (!password || !bcrypt.compareSync(password, ADMIN_HASH)) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    setSession(res, { admin: true });
    res.json({ ok: true });
  }
);

adminRouter.post("/logout", (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

adminRouter.get("/me", (req, res) => {
  const s = getSession(req);
  res.json({ ok: true, admin: Boolean(s && s.admin) });
});

adminRouter.use(requireAdmin);

adminRouter.get("/rsvp", (req, res) => {
  res.json({ ok: true, rsvp: listRsvp(), counts: rsvpCounts() });
});

adminRouter.get("/videos", (req, res) => {
  res.json({ ok: true, videos: listVideos() });
});

adminRouter.patch("/videos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  if (!["visible", "oculto"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }
  if (!getVideo(id)) return res.status(404).json({ error: "No existe" });
  setVideoEstado(id, estado);
  res.json({ ok: true });
});

adminRouter.delete("/videos/:id", (req, res) => {
  const id = Number(req.params.id);
  const v = getVideo(id);
  if (!v) return res.status(404).json({ error: "No existe" });
  const p = path.join(VIDEOS_DIR, v.nombre_archivo);
  if (existsSync(p)) fs.unlink(p).catch(() => {});
  deleteVideo(id);
  res.json({ ok: true });
});

adminRouter.get("/invitados", (req, res) => {
  res.json({ ok: true, invitados: listInvitados(), counts: invitadoCounts() });
});

adminRouter.delete("/invitados/:id", (req, res) => {
  const id = Number(req.params.id);
  const inv = getInvitado(id);
  if (!inv) return res.status(404).json({ error: "No existe" });
  deleteInvitado(id);
  res.json({ ok: true });
});

adminRouter.patch("/invitados/:id", (req, res) => {
  const id = Number(req.params.id);
  const inv = getInvitado(id);
  if (!inv) return res.status(404).json({ error: "No existe" });
  const { nombre, whatsapp, personas, grupo, estado } = req.body || {};
  const patch = {};
  if (nombre !== undefined) {
    const n = String(nombre).trim();
    if (!n || n.length > 120) return res.status(400).json({ error: "Nombre inválido" });
    patch.nombre = n;
  }
  if (whatsapp !== undefined) {
    const wa = String(whatsapp).replace(/\D/g, "");
    if (wa.length < 10) return res.status(400).json({ error: "WhatsApp inválido" });
    patch.whatsapp = wa;
  }
  if (personas !== undefined) {
    const p = Math.min(8, Math.max(1, parseInt(personas, 10) || 1));
    patch.personas = p;
  }
  if (grupo !== undefined) patch.grupo = grupo ? String(grupo).trim() : null;
  if (estado !== undefined) {
    if (!["pendiente", "enviado", "confirmado", "no_asiste"].includes(estado))
      return res.status(400).json({ error: "Estado inválido" });
    patch.estado = estado;
  }
  updateInvitado(id, patch);
  res.json({ ok: true, invitado: getInvitado(id) });
});

adminRouter.get("/invitados/export", (req, res) => {
  const rows = listInvitados();
  const header = "id,nombre,whatsapp,personas,grupo,estado,token,ultimo_envio,creado_en\n";
  const csv = header + rows.map((r) => [
    r.id,
    `"${String(r.nombre).replace(/"/g, '""')}"`,
    r.whatsapp,
    r.personas,
    r.grupo ? `"${String(r.grupo).replace(/"/g, '""')}"` : "",
    r.estado,
    r.token,
    r.ultimo_envio || "",
    r.creado_en || "",
  ].join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="invitados.csv"');
  res.send(csv);
});

adminRouter.get("/rsvp/export", (req, res) => {
  const rows = listRsvp();
  const header = "id,nombre,personas,asistencia,mensaje,invitado_id,creado_en\n";
  const csv = header + rows.map((r) => [
    r.id,
    `"${String(r.nombre).replace(/"/g, '""')}"`,
    r.personas,
    r.asistencia,
    r.mensaje ? `"${String(r.mensaje).replace(/"/g, '""')}"` : "",
    r.invitado_id ?? "",
    r.creado_en || "",
  ].join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="rsvp.csv"');
  res.send(csv);
});

adminRouter.delete("/rsvp/:id", (req, res) => {
  const id = Number(req.params.id);
  deleteRsvp(id);
  res.json({ ok: true });
});

adminRouter.get("/invitacion-preview/:token", (req, res) => {
  const { token } = req.params;
  const inv = listInvitados().find((i) => i.token === token);
  if (!inv) return res.status(404).json({ error: "No encontrado" });
  try {
    const site = process.env.SITE_URL || "https://karenyaldo.com";
    const imgBuffer = generateInvitation({
      nombre: inv.nombre,
      personas: inv.personas,
      token: inv.token,
      siteUrl: site,
    });
    res.setHeader("Content-Type", "image/png");
    res.send(imgBuffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

adminRouter.post("/invitados/import", (req, res) => {
  csvUpload.single("csv")(req, res, (err) => {
    if (err) return res.status(400).json({ error: "CSV inválido" });
    const text = req.file?.buffer?.toString("utf8") || "";
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) return res.status(400).json({ error: "CSV vacío" });
    let imported = 0;
    for (const line of lines) {
      const cols = line.split(",").map((c) => c.trim());
      const [nombre, whatsapp, personasRaw, grupo] = cols;
      if (!nombre || !whatsapp) continue;
      const wa = whatsapp.replace(/\D/g, "");
      if (wa.length < 10) continue;
      insertInvitado({
        nombre,
        whatsapp: wa,
        personas: parseInt(personasRaw, 10) || 1,
        grupo: grupo || null,
      });
      imported += 1;
    }
    res.json({ ok: true, imported });
  });
});

adminRouter.post(
  "/send-invites",
  rateLimit({ name: "sendinv", windowMs: 60_000, max: 3 }),
  async (req, res) => {
    const cfg = getConfig();
    if (!cfg.enabled) {
      return res.status(400).json({ error: "WhatsApp no configurado" });
    }
    const site = process.env.SITE_URL || "https://karenyaldo.com";
    const pendientes = listInvitados().filter((i) => i.estado === "pendiente");
    let sent = 0;
    const errors = [];
    for (const inv of pendientes) {
      const enlace = `${site}/rsvp?t=${inv.token}`;
      // Registrar intento
      const caption = buildInviteCaption(inv.nombre, inv.personas, enlace);
      const msgId = insertMessage({
        to_number: inv.whatsapp,
        tipo: "image",
        contenido: caption,
        template: null,
        status: "pending",
        invitado_id: inv.id,
      });
      try {
        const imgBuffer = generateInvitation({
          nombre: inv.nombre,
          personas: inv.personas,
          token: inv.token,
          siteUrl: site,
        });
        const data = await sendImageMessage({
          to: inv.whatsapp,
          imageBuffer: imgBuffer,
          caption,
        });
        const waId = (data?.messages && data.messages[0] && data.messages[0].id) || data?.id || null;
        updateMessageStatus(msgId, { status: "sent", wa_id: waId, error: null });
        updateInvitadoEstado(inv.id, "enviado");
        sent += 1;
      } catch (e) {
        updateMessageStatus(msgId, { status: "error", wa_id: null, error: e.message });
        errors.push({ id: inv.id, nombre: inv.nombre, error: e.message });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    res.json({ ok: true, sent, errors });
  }
);

adminRouter.post("/reminders", async (req, res) => {
  const cfg = getConfig();
  if (!cfg.enabled) return res.status(400).json({ error: "WhatsApp no configurado" });
  const site = process.env.SITE_URL || "https://karenyaldo.com";
  const target = listInvitados().filter(
    (i) => ["pendiente", "enviado"].includes(i.estado)
  );
  let sent = 0;
  const errors = [];
  for (const inv of target) {
    const enlace = `${site}/rsvp?t=${inv.token}`;
    const caption = buildReminderCaption(inv.nombre, inv.personas, enlace);
    const msgId = insertMessage({
      to_number: inv.whatsapp,
      tipo: "image",
      contenido: caption,
      template: null,
      status: "pending",
      invitado_id: inv.id,
    });
    try {
      const imgBuffer = generateInvitation({
        nombre: inv.nombre,
        personas: inv.personas,
        token: inv.token,
        siteUrl: site,
      });
      const data = await sendImageMessage({
        to: inv.whatsapp,
        imageBuffer: imgBuffer,
        caption,
      });
      const waId = (data?.messages && data.messages[0] && data.messages[0].id) || data?.id || null;
      updateMessageStatus(msgId, { status: "sent", wa_id: waId, error: null });
      updateInvitadoEstado(inv.id, "enviado");
      sent += 1;
    } catch (e) {
      updateMessageStatus(msgId, { status: "error", wa_id: null, error: e.message });
      errors.push({ id: inv.id, error: e.message });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  res.json({ ok: true, sent, errors });
});

// Mensajes: listar, reenviar y enviar uno
adminRouter.get("/messages", (req, res) => {
  res.json({ ok: true, messages: listMessages() });
});

adminRouter.post("/messages/send/:invitadoId", async (req, res) => {
  const id = Number(req.params.invitadoId);
  const inv = getInvitado(id);
  if (!inv) return res.status(404).json({ error: "Invitado no encontrado" });
  const site = process.env.SITE_URL || "https://karenyaldo.com";
  const enlace = `${site}/rsvp?t=${inv.token}`;
  const caption = buildInviteCaption(inv.nombre, inv.personas, enlace);
  const msgId = insertMessage({ to_number: inv.whatsapp, tipo: "image", contenido: caption, template: null, status: "pending", invitado_id: inv.id });
  try {
    const imgBuffer = generateInvitation({ nombre: inv.nombre, personas: inv.personas, token: inv.token, siteUrl: site });
    const data = await sendImageMessage({ to: inv.whatsapp, imageBuffer: imgBuffer, caption });
    const waId = (data?.messages && data.messages[0] && data.messages[0].id) || data?.id || null;
    updateMessageStatus(msgId, { status: "sent", wa_id: waId, error: null });
    updateInvitadoEstado(inv.id, "enviado");
    return res.json({ ok: true, msgId, waId });
  } catch (e) {
    updateMessageStatus(msgId, { status: "error", wa_id: null, error: e.message });
    return res.status(500).json({ ok: false, error: e.message });
  }
});

adminRouter.post("/messages/:id/resend", async (req, res) => {
  const id = Number(req.params.id);
  const msg = getMessage(id);
  if (!msg) return res.status(404).json({ error: "Mensaje no encontrado" });
  const inv = msg.invitado_id ? getInvitado(msg.invitado_id) : null;
  if (!inv) return res.status(404).json({ error: "Invitado asociado no encontrado" });
  const site = process.env.SITE_URL || "https://karenyaldo.com";
  const enlace = `${site}/rsvp?t=${inv.token}`;
  const caption = msg.contenido || buildInviteCaption(inv.nombre, inv.personas, enlace);
  const newMsgId = insertMessage({ to_number: inv.whatsapp, tipo: msg.tipo, contenido: caption, template: msg.template, status: "pending", invitado_id: inv.id });
  try {
    const imgBuffer = generateInvitation({ nombre: inv.nombre, personas: inv.personas, token: inv.token, siteUrl: site });
    const data = await sendImageMessage({ to: inv.whatsapp, imageBuffer: imgBuffer, caption });
    const waId = (data?.messages && data.messages[0] && data.messages[0].id) || data?.id || null;
    updateMessageStatus(newMsgId, { status: "sent", wa_id: waId, error: null });
    updateInvitadoEstado(inv.id, "enviado");
    res.json({ ok: true, newMsgId, waId });
  } catch (e) {
    updateMessageStatus(newMsgId, { status: "error", wa_id: null, error: e.message });
    res.status(500).json({ ok: false, error: e.message });
  }
});

adminRouter.post("/archive", (req, res) => {
  const script = path.resolve(process.cwd(), "scripts", "archive.mjs");
  if (!existsSync(script)) {
    return res.status(500).json({ error: "Script de archivo no encontrado" });
  }
  const child = spawn(process.execPath, [script], {
    env: process.env,
    stdio: "ignore",
    detached: true,
  });
  child.unref();
  res.json({ ok: true, started: true });
});

adminRouter.get("/archive", (req, res) => {
  let files = [];
  if (existsSync(ARCHIVE_DIR)) {
    files = readdirSync(ARCHIVE_DIR)
      .filter((f) => f.endsWith(".zip"))
      .map((f) => {
        const s = statSync(path.join(ARCHIVE_DIR, f));
        return {
          archivo: f,
          tamaño: s.size,
          tamaño_mb: Number(fileSizeMb(path.join(ARCHIVE_DIR, f)).toFixed(1)),
          modificado: s.mtime.toISOString(),
        };
      });
  }
  res.json({ ok: true, files });
});