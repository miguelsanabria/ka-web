import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { promises as fs, statSync, existsSync } from "node:fs";
import path from "node:path";
import {
  VIDEOS_DIR,
  INBOX_DIR,
  UPLOADS_ENABLED,
  VIDEO_MAX_MB,
  MIN_DISK_MB,
  listVideos,
  insertVideo,
} from "../db.js";
import { validateVideoFile, transcodeToMp4, fileSizeMb } from "../ffmpeg.js";
import { rateLimit } from "../limiter.js";

export const guestbookRouter = Router();

function freeDiskMb() {
  try {
    const out = execFileSync("df", ["-m", VIDEOS_DIR]).toString();
    const line = out.trim().split("\n").pop();
    const cols = line.split(/\s+/);
    return Number(cols[3] || 0);
  } catch {
    return Infinity;
  }
}

guestbookRouter.get("/", (req, res) => {
  const videos = listVideos("visible").map((v) => ({
    id: v.id,
    url: `/media/videos/${encodeURIComponent(v.nombre_archivo)}`,
    tamaño: v.tamaño,
    creado_en: v.creado_en,
  }));
  res.json({ ok: true, videos });
});

const upload = multer({
  dest: INBOX_DIR,
  limits: { fileSize: VIDEO_MAX_MB * 1024 * 1024, files: 1 },
});

let transcodeQueue = Promise.resolve();

guestbookRouter.post(
  "/",
  rateLimit({ name: "upload", windowMs: 60_000, max: 3 }),
  (req, res) => {
    if (!UPLOADS_ENABLED) {
      return res.status(403).json({ error: "Subidas deshabilitadas" });
    }
    upload.single("video")(req, res, (err) => {
      if (err) {
        const msg = err.code === "LIMIT_FILE_SIZE"
          ? `Video demasiado grande (máx ${VIDEO_MAX_MB} MB)`
          : "Error de subida";
        return res.status(400).json({ error: msg });
      }
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No se recibió archivo" });
      }
      if (freeDiskMb() < MIN_DISK_MB) {
        fs.unlink(file.path).catch(() => {});
        return res.status(507).json({ error: "Almacenamiento casi lleno" });
      }

      const name = `video-${Date.now()}-${randomUUID().slice(0, 6)}.mp4`;
      const outPath = path.join(VIDEOS_DIR, name);

      validateVideoFile(file)
        .catch((e) => {
          fs.unlink(file.path).catch(() => {});
          // Los errores de validación (status 400) llevan un mensaje pensado
          // para el invitado ("video demasiado largo", etc.). Los de ffprobe no
          // lo tienen: ahí el detalle es técnico y no se muestra.
          throw e.status === 400 ? e : new Error("Video no válido o corrupto");
        })
        .then(() => {
          const job = transcodeQueue.then(() =>
            transcodeToMp4(file.path, outPath)
          );
          transcodeQueue = job;
          return job.then(() => {
            fs.unlink(file.path).catch(() => {});
            const size = existsSync(outPath) ? statSync(outPath).size : 0;
            const id = insertVideo({
              nombre_archivo: name,
              nombre_original: file.originalname || name,
              tamaño: size,
            });
            res.status(201).json({ ok: true, id, url: `/media/videos/${encodeURIComponent(name)}` });
          });
        })
        .catch((e) => {
          // Un transcodificado fallido deja un .mp4 a medio escribir que nginx
          // serviría igual. Se borra lo que se haya quedado.
          if (existsSync(file.path)) fs.unlink(file.path).catch(() => {});
          if (existsSync(outPath)) fs.unlink(outPath).catch(() => {});
          console.error("[upload]", e);
          const validation = e.status === 400;
          res.status(validation ? 400 : 500).json({
            error: validation ? e.message : "No se pudo procesar el video",
          });
        });
    });
  }
);