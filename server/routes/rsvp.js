import { Router } from "express";
import { insertRsvp, getInvitadoByToken, markRsvpUsed } from "../db.js";
import { rateLimit } from "../limiter.js";

export const rsvpRouter = Router();

rsvpRouter.get("/prefill", (req, res) => {
  const token = String(req.query.t || "");
  if (!token) return res.json({ ok: false });
  const inv = getInvitadoByToken(token);
  if (!inv) return res.json({ ok: false, error: "Invitación no válida" });
  if (inv.rsvp_used) return res.json({ ok: false, error: "used", message: "Este enlace ya fue utilizado. Si necesitas cambios, contacta a los novios." });
  res.json({ ok: true, nombre: inv.nombre, personas: inv.personas });
});

rsvpRouter.post(
  "/",
  rateLimit({ name: "rsvp", windowMs: 60_000, max: 10 }),
  (req, res) => {
    const { nombre, personas, asistencia, mensaje, token } = req.body || {};
    const name = String(nombre || "").trim();
    const nPersonas = Math.min(8, Math.max(1, parseInt(personas, 10) || 1));
    const attending = asistencia === "si" || asistencia === "no" ? asistencia : "si";

    if (!name || name.length > 120) {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    if (mensaje && String(mensaje).length > 500) {
      return res.status(400).json({ error: "Mensaje demasiado largo" });
    }

    let invId = null;
    const tokenStr = String(token || "");
    if (tokenStr) {
      const inv = getInvitadoByToken(tokenStr);
      if (!inv) {
        return res.status(403).json({ error: "Invitación no válida" });
      }
      if (inv.rsvp_used) {
        return res.status(403).json({ error: "Este enlace ya fue utilizado" });
      }
      invId = inv.id;
    }

    const id = insertRsvp({
      nombre: name,
      personas: nPersonas,
      asistencia: attending,
      mensaje: mensaje ? String(mensaje).slice(0, 500) : null,
      invitado_id: invId,
    });

    if (invId) {
      markRsvpUsed(invId);
    }

    res.status(201).json({
      ok: true,
      id,
      invitado_id: invId,
      asistencia: attending,
    });
  }
);