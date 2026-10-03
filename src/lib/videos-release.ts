// Cuándo se publica la sección de videos del muro.
// Acordado: 7 de noviembre a las 16:00 hrs (hora local).
const RELEASE = new Date("2026-11-07T16:00:00");

/** ¿Ya pasó la fecha acordada de publicación? */
export function videosActive(): boolean {
  return new Date() >= RELEASE;
}

/**
 * Modo de prueba: `?preview=videos` en la URL activa la sección sin importar la fecha.
 * Sirve para ensayar el muro antes del 7 de noviembre.
 */
export function videosPreview(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "videos";
}

/** ¿La sección debe mostrarse? (publicada o en preview de prueba) */
export function videosVisible(): boolean {
  return videosActive() || videosPreview();
}