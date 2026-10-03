import { execFile } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { VIDEO_MAX_SECONDS, VIDEO_MAX_PIXELS } from "./db.js";

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

const ALLOWED_EXT = [".mp4", ".mov", ".webm", ".m4v"];

// Límites de recursos del hijo. ffprobe y ffmpeg heredan los del contenedor,
// pero un archivo hostil puede pedir muchos hilos y vaciar la memoria que
// necesita el propio Node para seguir sirviendo el sitio.
const PROBE_TIMEOUT_MS = 30 * 1000;
const FFMPEG_THREADS = Number(process.env.FFMPEG_THREADS || 4);
const MAX_STREAMS = 20;

// Errores de validación: status 400 y mensaje pensado para el invitado, así que
// la ruta puede devolverlo tal cual. Cualquier otro error es interno y no se
// muestra (podría traer rutas del servidor o texto de ffmpeg).
function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function probe(input) {
  return new Promise((resolve, reject) => {
    execFile(
      FFPROBE,
      [
        "-v", "error",
        "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,duration",
        "-of", "json",
        input,
      ],
      { timeout: PROBE_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout) => (err ? reject(err) : resolve(JSON.parse(stdout)))
    );
  });
}

export async function validateVideoFile(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw validationError("Formato de video no permitido (mp4/mov/webm/m4v)");
  }

  const meta = await probe(file.path);
  const streams = meta.streams || [];
  if (streams.length > MAX_STREAMS) {
    throw validationError("El archivo tiene demasiadas pistas");
  }

  const video = streams.find((s) => s.codec_type === "video");
  if (!video) {
    throw validationError("El archivo no contiene video válido");
  }

  // Duración: se toma la del contenedor y, si falta, la del stream.
  const seconds = Number(meta.format?.duration ?? video.duration) || 0;
  if (seconds > VIDEO_MAX_SECONDS) {
    const mins = Math.round(VIDEO_MAX_SECONDS / 60);
    throw validationError(`Video demasiado largo (máximo ${mins} minutos)`);
  }

  // Resolución: lo que de verdad cuesta memoria al decodificar, no los bytes.
  const width = Number(video.width) || 0;
  const height = Number(video.height) || 0;
  if (width * height > VIDEO_MAX_PIXELS) {
    throw validationError(
      `Resolución demasiado alta (${width}x${height}). Graba el video a 1080p o menos.`
    );
  }

  return meta;
}

export function transcodeToMp4(input, output) {
  return new Promise((resolve, reject) => {
    execFile(
      FFMPEG,
      [
        "-nostdin", "-y", "-i", input,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac",
        // Acotar hilos y cola del muxer: con un archivo hostil, ffmpeg puede
        // pedir decenas de hilos y buffers sin límite.
        "-threads", String(FFMPEG_THREADS),
        "-filter_threads", "2",
        "-filter_complex_threads", "1",
        "-max_muxing_queue_size", "1024",
        "-movflags", "+faststart",
        output,
      ],
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