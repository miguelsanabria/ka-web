"use client";

import { useEffect, useRef, useState } from "react";
import { ItineraryIcon } from "@/components/ItineraryIcon";
import { WEDDING } from "@/lib/data";

export default function Itinerary() {
  const [drawn, setDrawn] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Pintar la línea al montar
    const timer = setTimeout(() => setDrawn(true), 300);

    // Observer para medallones escalonados
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, Number(entry.target.id)]));
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -50px 0px" }
    );

    const container = containerRef.current;
    if (container) {
      const items = container.querySelectorAll("[data-item-id]");
      items.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  if (WEDDING.itinerary.length === 0) return null;

  return (
    <section id="itinerario" className="bg-linen py-28 sm:py-36">
      <div className="reveal mx-auto max-w-xl text-center">
        <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
          Itinerario
        </h2>
      </div>

      <div className="reveal relative mx-auto mt-16 max-w-xl" ref={containerRef}>
        {/* Hilo dorado */}
        <div className={`itinerary-line ${drawn ? "drawn" : ""}`} aria-hidden="true" />

        <div className="flex flex-col gap-10">
          {WEDDING.itinerary.map((item, i) => (
            <div
              key={item.label}
              id={`item-${i}`}
              data-item-id={i}
              className={`relative flex w-full items-center gap-6 ${
                i % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              {/* Punto central + medallón */}
              <div
                className={`itinerary-medallion ${mounted && !visibleItems.has(i) ? "" : "drawn"}`}
                style={{ top: "50%", left: "50%" }}
                aria-hidden="true"
              >
                <ItineraryIcon name={item.icon} />
              </div>

              {/* Línea del timeline (la vertical) - solo se ve el punto central */}
              <div
                className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-arena/50"
                aria-hidden="true"
              />

              {/* Contenido del evento */}
              <div
                className={`flex w-1/2 items-center gap-2 ${
                  i % 2 === 0 ? "justify-end pr-6 md:pr-10" : "justify-start pl-6 md:pl-10"
                }`}
              >
                <div className={i % 2 === 0 ? "text-right" : "text-left"}>
                  <p className="font-serif text-base leading-none text-bronze sm:text-xl md:text-2xl">
                    {WEDDING.itinerary[i].time}
                  </p>
                  <p className="mt-1 text-[11px] font-light leading-tight tracking-wide text-charcoal-soft sm:text-xs md:text-sm">
                    {WEDDING.itinerary[i].label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}