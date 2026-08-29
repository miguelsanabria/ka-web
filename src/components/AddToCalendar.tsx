"use client";

import { buildICS, googleCalendarUrl } from "@/lib/calendar";

export default function AddToCalendar() {
  function downloadICS() {
    const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "karen-y-aldo-2026-11-07.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <div className="reveal mx-auto mt-10 flex flex-wrap justify-center gap-3">
      <button
        onClick={downloadICS}
        className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream backdrop-blur transition-colors hover:bg-cream hover:text-charcoal"
      >
        <span aria-hidden>📅</span> Agregar a calendario (.ics)
      </button>
      <a
        href={googleCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-gold backdrop-blur transition-colors hover:bg-gold hover:text-charcoal"
      >
        <span aria-hidden>🗓️</span> Google Calendar
      </a>
    </div>
  );
}
