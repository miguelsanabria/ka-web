"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#ceremonia", label: "Ceremonia" },
  { href: "#recepcion", label: "Recepción" },
  { href: "#itinerario", label: "Itinerario" },
  { href: "#regalos", label: "Regalos" },
  { href: "#videos", label: "Videos" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const showVideos = new Date() >= new Date("2026-11-07T00:00:00");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md shadow-[0_1px_0_rgba(42,37,34,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#inicio"
          className="font-script text-2xl text-charcoal"
          onClick={() => setOpen(false)}
        >
          Karen <span className="text-bronze">&</span> Aldo
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links
            .filter((l) => (l.href !== "#videos" ? true : showVideos))
            .map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal-soft transition-colors hover:text-bronze"
              >
                {l.label}
              </a>
            ))}
        </div>

        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
        >
          <span className="h-px w-6 bg-charcoal" />
          <span className="h-px w-6 bg-charcoal" />
          <span className="h-px w-6 bg-charcoal" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-charcoal/10 bg-cream px-6 py-6 md:hidden">
            <div className="flex flex-col gap-5">
            {links
              .filter((l) => (l.href !== "#videos" ? true : showVideos))
              .map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm uppercase tracking-[0.2em] text-charcoal-soft"
                >
                  {l.label}
                </a>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
