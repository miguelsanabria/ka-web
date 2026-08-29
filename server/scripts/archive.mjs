// Archivo post-boda: transcoda videos a MP4 de archivo, exporta RSVP/invitados y genera ZIP.
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import {
  DATA_DIR,
  VIDEOS_DIR,
  ARCHIVE_DIR,
  listVideos,
  listRsvp,
  listInvitados,
} from "../db.js";

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { ...opts, timeout: 20 * 60 * 1000 }, (err) =>
      err ? reject(err) : resolve()
    );
  });
}

function toCsv(rows) {
  return rows
    .map((r) =>
      Object.values(r)
        .map((v) => String(v ?? "").replace(/,/g, ";").replace(/\n/g, " "))
        .join(",")
    )
    .join("\n");
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.join(ARCHIVE_DIR, `archive-${stamp}`);
  await fs.mkdir(outDir, { recursive: true });

  const videos = listVideos();
  console.log(`Archivando ${videos.length} videos…`);
  for (const v of videos) {
    const src = path.join(VIDEOS_DIR, v.nombre_archivo);
    try {
      await fs.access(src);
    } catch {
      continue;
    }
    const dest = path.join(outDir, `video-${String(v.id).padStart(4, "0")}-${v.nombre_archivo}`);
    await run(FFMPEG, [
      "-y", "-i", src,
      "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
      "-c:a", "aac", dest,
    ]);
    console.log(`  ✓ ${v.nombre_archivo}`);
  }

  const csvRsvp = [
    "id,nombre,personas,asistencia,mensaje,invitado_id,creado_en",
    toCsv(listRsvp()),
  ].join("\n");
  const csvInv = [
    "id,nombre,whatsapp,personas,grupo,estado,ultimo_envio,creado_en",
    toCsv(listInvitados()),
  ].join("\n");
  await fs.writeFile(path.join(outDir, "rsvp.csv"), csvRsvp);
  await fs.writeFile(path.join(outDir, "invitados.csv"), csvInv);
  await fs.writeFile(path.join(outDir, "rsvp.json"), JSON.stringify(listRsvp(), null, 2));
  await fs.writeFile(path.join(outDir, "invitados.json"), JSON.stringify(listInvitados(), null, 2));

  const zipPath = path.join(ARCHIVE_DIR, `karen-aldo-boda-${stamp}.zip`);
  try {
    await run("zip", ["-r", "-q", zipPath, "."], { cwd: outDir });
    console.log(`ZIP: ${zipPath}`);
  } catch {
    console.log("zip no disponible; carpeta sin comprimir:", outDir);
  }

  console.log("Archivo completado:", outDir);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });