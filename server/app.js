import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { VIDEOS_DIR, DATA_DIR } from "./db.js";
import { rsvpRouter } from "./routes/rsvp.js";
import { guestbookRouter } from "./routes/guestbook.js";
import { adminRouter } from "./routes/admin.js";
import { invitacionRouter } from "./routes/invitacion.js";
import { verifyWebhook, verifySignature } from "./whatsapp.js";
import { rateLimit } from "./limiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.OUT_DIR || path.resolve(__dirname, "..", "out");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Seguridad: headers básicos
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.COOKIE_SECURE === "true") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  next();
});

// Log simple
app.use((req, res, next) => {
  const t = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - t;
    if (req.path.startsWith("/api") || req.path.startsWith("/webhook")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});

// Raw body para la firma del webhook
app.use(
  "/webhook/whatsapp",
  express.raw({ type: "*/*", limit: "2mb" })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Estáticos
const PAGES = ["rsvp", "grabar", "confirmados", "admin"];
if (existsSync(OUT_DIR)) {
  // Servir páginas .html directamente (preserva query strings, p. ej. /rsvp?i=&t=)
  app.get(PAGES.map((p) => `/${p}`), (req, res) => {
    const f = path.join(OUT_DIR, `${req.path.slice(1)}.html`);
    if (existsSync(f)) return res.sendFile(f);
    res.sendFile(path.join(OUT_DIR, "index.html"));
  });
  app.use(express.static(OUT_DIR));
}
app.use(
  "/media/videos",
  express.static(VIDEOS_DIR, {
    setHeaders(res) {
      res.setHeader("Accept-Ranges", "bytes");
    },
  })
);

// API
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/calendar.ics", (req, res) => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//karen-y-aldo.com//Boda K&A//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:karen-aldo-2026-11-07@karen-y-aldo.com",
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    "DTSTART:20261107T220000Z",
    "DTEND:20261108T040000Z",
    "SUMMARY:Boda de Karen & Aldo",
    "LOCATION:Santuario de San Tranquilino Ubiarco Robles\\, Tepatitlán de Morelos\\, Jalisco",
    "DESCRIPTION:Ceremonia 4:00 p.m. - Recepción 6:30 p.m. — karen-y-aldo.com",
    "URL:https://karen-y-aldo.com",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="karen-y-aldo-2026-11-07.ics"');
  res.send(ics);
});
app.use("/api/rsvp", rsvpRouter);
app.use("/api/guestbook", guestbookRouter);
app.use("/api/admin", adminRouter);
app.use("/api/invitacion", invitacionRouter);

// Webhook WhatsApp (Meta)
app.get("/webhook/whatsapp", (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (verifyWebhook(mode, token)) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post(
  "/webhook/whatsapp",
  rateLimit({ name: "wh", windowMs: 60_000, max: 300 }),
  (req, res) => {
    if (!verifySignature(req, req.body)) {
      return res.sendStatus(403);
    }
    res.sendStatus(200);
    // Aquí se procesarían mensajes entrantes / status (delivered/read).
    // Las confirmaciones se registran por el enlace del sitio (opción elegida).
  }
);

// Fallback SPA/estáticos para rutas de front
if (existsSync(OUT_DIR)) {
  app.get(/^\/(?!api|webhook|media).*/, (req, res) => {
    const f = path.join(OUT_DIR, req.path === "/" ? "index.html" : `${req.path}.html`);
    if (existsSync(f)) return res.sendFile(f);
    res.sendFile(path.join(OUT_DIR, "index.html"));
  });
}

app.use("/api", (req, res) => res.status(404).json({ error: "no encontrado" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "error interno" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`ka-server escuchando en :${PORT} · data=${DATA_DIR}`);
});