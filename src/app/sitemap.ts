import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://karen-y-aldo.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/rsvp`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/grabar`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
