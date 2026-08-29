import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Karen & Aldo — Boda 07·11·2026",
    short_name: "Karen & Aldo",
    description:
      "Boda de Karen & Aldo · 07 de noviembre de 2026 · Tepatitlán de Morelos, Jalisco",
    start_url: "/",
    display: "standalone",
    background_color: "#f1ede3",
    theme_color: "#383a2d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/media/fotos/IMG_7738.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
  };
}
