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

  if (videos.length === 0) return null;

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