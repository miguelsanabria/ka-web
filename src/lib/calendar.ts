import { WEDDING } from "./data";

function icsEscape(s: string) {
  return s.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n");
}

function formatDateICS(date: Date) {
  // UTC format YYYYMMDDTHHmmssZ
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildICS() {
  // Ceremonia 16:00 America/Mexico_City (UTC-6). Export as UTC 22:00Z.
  const start = new Date("2026-11-07T22:00:00Z");
  const end = new Date("2026-11-08T04:00:00Z");
  const uid = `karen-aldo-2026-11-07@karen-y-aldo.com`;
  const dtstamp = formatDateICS(new Date());
  const summary = icsEscape("Boda de Karen & Aldo");
  const location = icsEscape(
    `${WEDDING.ceremony.place}, ${WEDDING.ceremony.city} · Recepción: ${WEDDING.reception.place}, ${WEDDING.reception.city}`
  );
  const description = icsEscape(
    `Ceremonia ${WEDDING.ceremony.time} en ${WEDDING.ceremony.place} · Recepción ${WEDDING.reception.time} en ${WEDDING.reception.place}. ¡Nos vemos el ${WEDDING.date}! — karen-y-aldo.com`
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//karen-y-aldo.com//Boda K&A//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatDateICS(start)}`,
    `DTEND:${formatDateICS(end)}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    `URL:${process.env.NEXT_PUBLIC_SITE_URL || "https://karen-y-aldo.com"}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl() {
  // Google Calendar template link
  const start = "20261107T220000Z";
  const end = "20261108T040000Z";
  const title = encodeURIComponent("Boda de Karen & Aldo");
  const details = encodeURIComponent(
    `Ceremonia ${WEDDING.ceremony.time} — ${WEDDING.ceremony.place} (${WEDDING.ceremony.city})\nRecepción ${WEDDING.reception.time} — ${WEDDING.reception.place} (${WEDDING.reception.city})\n\nkaren-y-aldo.com`
  );
  const location = encodeURIComponent(
    `${WEDDING.ceremony.place}, ${WEDDING.ceremony.city}`
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
