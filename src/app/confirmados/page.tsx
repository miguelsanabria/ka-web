"use client";

import { useEffect, useState } from "react";
import AdminLogin from "@/components/AdminLogin";

type RsvpRow = {
  id: number;
  nombre: string;
  personas: number;
  asistencia: string;
  mensaje: string | null;
  creado_en: string;
};

export default function ConfirmadosPage() {
  return (
    <AdminLogin>
      <ConfirmadosList />
    </AdminLogin>
  );
}

function ConfirmadosList() {
  const [rsvp, setRsvp] = useState<RsvpRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/rsvp")
      .then((r) => r.json())
      .then((d) => {
        setRsvp(d.rsvp);
        setCounts(d.counts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-cream py-14 text-charcoal">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="font-serif text-4xl font-medium">Confirmaciones</h1>

        {counts && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Confirmaron (Sí)" value={counts.si ?? 0} />
            <Stat label="Personas" value={counts.personas_si ?? 0} />
            <Stat label="No asisten" value={counts.no ?? 0} />
            <Stat label="Total registros" value={counts.total ?? 0} />
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-stone">Cargando…</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-arena/60 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-arena/60 text-[0.7rem] uppercase tracking-[0.15em] text-stone">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Personas</th>
                  <th className="px-5 py-3">Asiste</th>
                  <th className="px-5 py-3">Mensaje</th>
                  <th className="px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rsvp.map((r) => (
                  <tr key={r.id} className="border-b border-arena/30">
                    <td className="px-5 py-3 font-medium">{r.nombre}</td>
                    <td className="px-5 py-3">{r.personas}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          r.asistencia === "si"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {r.asistencia === "si" ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-stone">
                      {r.mensaje || "—"}
                    </td>
                    <td className="px-5 py-3 text-stone">{r.creado_en}</td>
                  </tr>
                ))}
                {rsvp.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-stone">
                      Aún no hay confirmaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-arena/60 bg-white p-5 text-center">
      <p className="font-serif text-3xl text-bronze">{value}</p>
      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.15em] text-stone">{label}</p>
    </div>
  );
}