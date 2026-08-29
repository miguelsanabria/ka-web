import { execFile } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

const ALLOWED_EXT = [".mp4", ".mov", ".webm", ".m4v"];

function probe(input) {
  return new Promise((resolve, reject) => {
    execFile(FFPROBE, ["-v", "error", "-show_entries", "stream=codec_type,codec_name", "-of", "json", input], (err, stdout) => {
      if (err) return reject(err);
      resolve(JSON.parse(stdout));
    });
  });
}

export async function validateVideoFile(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error("Formato de video no permitido (mp4/mov/webm/m4v)");
  }
  const meta = await probe(file.path);
  const hasVideo = (meta.streams || []).some((s) => s.codec_type === "video");
  if (!hasVideo) {
    throw new Error("El archivo no contiene video válido");
  }
  return meta;
}

export function transcodeToMp4(input, output) {
  return new Promise((resolve, reject) => {
    execFile(
      FFMPEG,
      ["-y", "-i", input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", output],
      { timeout: 5 * 60 * 1000 },
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export function transcodeArchiveMp4(input, output) {
  return new Promise((resolve, reject) => {
    execFile(
      FFMPEG,
      ["-y", "-i", input, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", output],
      { timeout: 20 * 60 * 1000 },
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export function fileSizeMb(p) {
  return statSync(p).size / (1024 * 1024);
}