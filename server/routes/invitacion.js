import { Router } from "express";
import { getInvitadoByToken } from "../db.js";
import { generateInvitation } from "../invitacion.js";

export const invitacionRouter = Router();

invitacionRouter.get("/:token", (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).send("Token requerido");

  const inv = getInvitadoByToken(token);
  if (!inv) return res.status(404).send("Invitación no encontrada");

  try {
    const siteUrl = process.env.SITE_URL || "https://karen-y-aldo.com";
    const imgBuffer = generateInvitation({
      nombre: inv.nombre,
      personas: inv.personas,
      token: inv.token,
      siteUrl,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(imgBuffer);
  } catch (err) {
    console.error("Error generando invitación:", err);
    res.status(500).send("Error generando imagen");
  }
});
