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

      validateVideoFile(file)
        .catch(() => {
          fs.unlink(file.path).catch(() => {});
          throw new Error("Video no válido");
        })
        .then(() => {
          const name = `video-${Date.now()}-${randomUUID().slice(0, 6)}.mp4`;
          const outPath = path.join(VIDEOS_DIR, name);
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
          if (existsSync(file.path)) fs.unlink(file.path).catch(() => {});
          res.status(400).json({ error: e.message || "Error procesando video" });
        });
    });
  }
);