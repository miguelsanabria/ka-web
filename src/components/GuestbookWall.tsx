"use client";

import { useEffect, useState } from "react";

type Video = { id: number; url: string; tamaño: number; creado_en: string };

export default function GuestbookWall() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const r = await fetch("/api/guestbook");
        const d = await r.json();
        if (!stop && d.ok) setVideos(d.videos);
      } catch {
        // API no disponible (preview estático); se reintenta
      } finally {
        if (!stop) setLoaded(true);
      }
    }
    load();
    const id = setInterval(load, 10_000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-2xl bg-arena/30" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-dashed border-bronze/40 bg-white/60 px-8 py-14 text-center">
          <p className="font-script text-3xl text-bronze">Aún no hay videos</p>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-charcoal-soft">
            Sé el primero: graba desde{" "}
            <a href="/grabar" className="font-medium text-bronze underline underline-offset-4">
              /grabar
            </a>{" "}
            o escanea el QR. Los nuevos aparecen aquí solos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>div]:mb-4">
        {videos.map((v) => (
          <div key={v.id} className="break-inside-avoid overflow-hidden rounded-2xl bg-white ring-1 ring-arena/50">
            <video
              src={v.url}
              preload="metadata"
              controls
              playsInline
              className="aspect-video w-full bg-black object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}