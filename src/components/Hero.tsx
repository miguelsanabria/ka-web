"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/data";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onEnvelopeDone = () => {
      setRevealed(true);
    };

    window.addEventListener("ka:envelope:done", onEnvelopeDone);
    return () => window.removeEventListener("ka:envelope:done", onEnvelopeDone);
  }, []);

  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <video
          className={`h-full w-full object-cover hero-zoom ${revealed ? "hero-revealed" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          poster="/media/videos/Karen-y-Aldo-poster.jpg"
          preload="metadata"
        >
          <source
            src="/media/videos/Karen-y-Aldo-1080.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/35 to-charcoal/75" />
      </div>

      <div className={`relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center px-6 pt-[16vh] text-center text-cream sm:pt-[18vh] ${revealed ? "hero-revealed" : ""}`}>
        <p className="animate-fade-up text-[0.7rem] uppercase tracking-[0.4em] text-cream/90">
          Nos casamos
        </p>

        <h1
          className="animate-fade-up mt-5 font-serif text-5xl font-medium leading-none tracking-tight sm:text-8xl"
          style={{ animationDelay: "0.15s" }}
        >
          Karen <span className="font-script text-4xl text-gold sm:text-7xl">&</span> Aldo
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 text-center text-cream">
        <p
          className="animate-fade-up text-sm uppercase tracking-[0.35em] text-cream/90"
          style={{ animationDelay: "0.3s" }}
        >
          {WEDDING.dateShort}
        </p>
        <p
          className="animate-fade-up text-base font-light text-cream/80"
          style={{ animationDelay: "0.4s" }}
        >
          Tepatitlán de Morelos · Jalisco
        </p>
      </div>
    </section>
  );
}