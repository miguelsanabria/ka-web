"use client";

import { useEffect, useState } from "react";
import GuestbookWall from "@/components/GuestbookWall";
import VideoQr from "@/components/VideoQr";
import { videosVisible } from "@/lib/videos-release";

export default function VideosSection() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Publica el 7 de noviembre a las 16:00 hrs; ?preview=videos la muestra antes para pruebas.
    if (videosVisible()) setActive(true);
  }, []);

  if (!active) return null;

  return (
    <section id="videos" className="bg-linen py-28 text-center sm:py-36">
      <div className="reveal mx-auto max-w-3xl px-6">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-bronze">
          Videos de nuestros invitados
        </p>
        <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
          Dedícale un momento
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-charcoal-soft">
          Graba un video desde{" "}
          <a href="/grabar" className="font-medium text-bronze underline underline-offset-4">
            /grabar
          </a>{" "}
          en el iPad o escanea el QR desde tu celular. Los nuevos aparecen aquí solos.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 px-6 sm:grid-cols-[220px_1fr]">
        <VideoQr />
        <GuestbookWall />
      </div>
    </section>
  );
}