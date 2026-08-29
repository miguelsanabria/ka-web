"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/data";

type Status = "idle" | "sending" | "ok" | "error" | "used";

export default function RsvpForm({ dark = true }: { dark?: boolean }) {
  const [nombre, setNombre] = useState("");
  const [guests, setGuests] = useState("1");
  const [attending, setAttending] = useState<"si" | "no" | "">("");
  const [mensaje, setMensaje] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("t");
    if (t) {
      setToken(t);
      fetch(`/api/rsvp/prefill?t=${t}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && d.nombre) setNombre(d.nombre);
          if (d.ok && d.personas) setGuests(String(d.personas));
          if (!d.ok && d.error === "used") setStatus("used");
        })
        .catch(() => {});
    }
  }, []);

  const waMsg = encodeURIComponent(
    `Hola! Soy ${nombre || "…"}. Confirmo mi asistencia a la boda de Karen y Aldo el 07 de noviembre de 2026.\n\nAsistencia: ${
      attending === "si" ? "¡Sí, estaré ahí!" : attending === "no" ? "No podré asistir" : "…"
    }\nPersonas: ${guests}`
  );
  const waLink = `https://wa.me/${WEDDING.rsvp.whatsapp}?text=${waMsg}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !attending) return;
    setStatus("sending");
    setError("");
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          personas: guests,
          asistencia: attending,
          mensaje: mensaje.trim() || null,
          token,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error al confirmar");
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al confirmar");
      setStatus("error");
    }
  }

  const label = dark ? "text-cream/60" : "text-charcoal/60";
  const input = dark
    ? "border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus:border-gold"
    : "border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:border-bronze";

  if (status === "used") {
    return (
      <div className="rounded-2xl border border-red-400/50 bg-red-400/10 px-8 py-12 text-center">
        <p className="font-script text-4xl text-red-300">Enlace utilizado</p>
        <p className="mt-3 text-sm font-light text-cream/80">
          Este enlace ya fue utilizado para confirmar asistencia.
          <br />
          Si necesitas cambios, contacta directamente a los novios.
        </p>
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-gold/50 bg-gold/10 px-8 py-12 text-center">
        <p className="font-script text-4xl text-gold">Gracias</p>
        <p className="mt-3 text-sm font-light text-cream/80">
          Tu confirmación fue registrada. ¡Nos vemos el 07 de noviembre!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 text-left">
      <div>
        <label className={`mb-2 block text-[0.7rem] uppercase tracking-[0.2em] ${label}`}>
          Nombre completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className={`w-full rounded-xl border px-5 py-4 text-sm focus:outline-none ${input}`}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={`mb-2 block text-[0.7rem] uppercase tracking-[0.2em] ${label}`}>
            Personas
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={`w-full appearance-none rounded-xl border px-5 py-4 text-sm focus:outline-none ${input}`}
          >
            {["1", "2", "3", "4", "5", "6"].map((n) => (
              <option key={n} value={n} className="text-charcoal">
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`mb-2 block text-[0.7rem] uppercase tracking-[0.2em] ${label}`}>
            Asistiré
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAttending("si")}
              className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                attending === "si"
                  ? "border-gold bg-gold text-charcoal"
                  : "border-current/20 text-cream/70 hover:border-current/50"
              } ${!dark && attending !== "si" ? "border-charcoal/20 text-charcoal/70" : ""}`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setAttending("no")}
              className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                attending === "no"
                  ? "border-cream bg-cream text-charcoal"
                  : "border-current/20 text-cream/70 hover:border-current/50"
              } ${!dark && attending !== "no" ? "border-charcoal/20 text-charcoal/70" : ""}`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className={`mb-2 block text-[0.7rem] uppercase tracking-[0.2em] ${label}`}>
          Mensaje (opcional)
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Un mensaje para los novios…"
          className={`w-full resize-none rounded-xl border px-5 py-4 text-sm focus:outline-none ${input}`}
        />
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={!nombre.trim() || !attending || status === "sending"}
        className="mt-2 rounded-full bg-bronze px-9 py-4 text-xs uppercase tracking-[0.25em] text-cream transition-all duration-300 hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "sending" ? "Enviando…" : "Confirmar asistencia"}
      </button>

      <p className="text-center text-xs tracking-wide text-cream/50">
        ¿Prefieres por WhatsApp?{" "}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-gold underline-offset-2 hover:text-cream"
        >
          Enviar por WhatsApp
        </a>
      </p>
    </form>
  );
}