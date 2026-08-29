"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminLogin from "@/components/AdminLogin";

type Tab = "videos" | "invitados" | "archivo" | "preview" | "mensajes";

type VideoRow = {
  id: number;
  nombre_archivo: string;
  nombre_original: string;
  tamaño: number;
  estado: string;
  creado_en: string;
};

type Invitado = {
  id: number;
  nombre: string;
  whatsapp: string;
  personas: number;
  grupo: string | null;
  estado: string;
  token: string;
  rsvp_used: number;
  ultimo_envio: string | null;
};

export default function AdminPage() {
  return (
    <AdminLogin>
      <Admin />
    </AdminLogin>
  );
}

function Admin() {
  const [tab, setTab] = useState<Tab>("videos");
  const [invitados, setInvitados] = useState<Invitado[]>([]);

  useEffect(() => {
    fetch("/api/admin/invitados")
      .then((r) => r.json())
      .then((d) => setInvitados(d.invitados || []))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-cream py-12 text-charcoal">
      <div className="mx-auto max-w-5xl px-6">
        <header className="flex items-center justify-between">
          <h1 className="font-serif text-4xl font-medium">Panel</h1>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-stone hover:text-bronze"
          >
            Ver sitio →
          </Link>
        </header>

        <div className="mt-6 flex gap-2">
          {(
            [
              ["videos", "Videos"],
              ["invitados", "Invitados"],
              ["mensajes", "Mensajes"],
              ["archivo", "Archivo"],
              ["preview", "Vista Previa"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                tab === t ? "bg-charcoal text-cream" : "bg-white text-charcoal-soft hover:bg-arena/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "videos" && <VideosTab />}
          {tab === "invitados" && <InvitadosTab />}
          {tab === "mensajes" && <MensajesTab />}
          {tab === "archivo" && <ArchivoTab />}
          {tab === "preview" && <PreviewTab invitados={invitados} />}
        </div>
      </div>
    </main>
  );
}

function MensajesTab() {
  type Msg = {
    id: number;
    to_number: string;
    tipo: string | null;
    contenido: string | null;
    template: string | null;
    status: string;
    wa_id: string | null;
    error: string | null;
    invitado_id: number | null;
    creado_en: string;
  };

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await fetch("/api/admin/messages").then((r) => r.json());
      setMsgs(d.messages || []);
    } catch (e) {
      setMsgs([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resend(id: number) {
    if (!confirm("Reenviar este mensaje?")) return;
    await fetch(`/api/admin/messages/${id}/resend`, { method: "POST" })
      .then((r) => r.json())
      .then(() => load())
      .catch(() => load());
  }

  return (
    <div>
      <p className="text-sm text-stone">{loading ? "Cargando…" : `${msgs.length} mensajes`}</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-arena/60 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-arena/60 text-[0.7rem] uppercase tracking-[0.15em] text-stone">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Para</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Contenido</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {msgs.map((m) => (
              <tr key={m.id} className="border-b border-arena/30">
                <td className="px-4 py-2.5">{m.id}</td>
                <td className="px-4 py-2.5">{m.to_number}</td>
                <td className="px-4 py-2.5">{m.tipo || "-"}</td>
                <td className="px-4 py-2.5">{(m.contenido || "").slice(0, 80)}</td>
                <td className="px-4 py-2.5">{m.status}</td>
                <td className="px-4 py-2.5">{m.creado_en}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => resend(m.id)} className="rounded-full bg-charcoal px-3 py-1 text-xs text-cream">Reenviar</button>
                  </div>
                </td>
              </tr>
            ))}
            {msgs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone">No hay mensajes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VideosTab() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/admin/videos").then((r) => r.json());
    setVideos(d.videos);
  }
  useEffect(() => {
    load();
  }, []);

  async function setEstado(id: number, estado: string) {
    await fetch(`/api/admin/videos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    load();
  }

  async function borrar(id: number) {
    if (!confirm("¿Eliminar este video?")) return;
    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <p className="text-sm text-stone">
        {videos.length} videos ·{" "}
        <span className="text-xs">{msg}</span>
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-arena/60 bg-white">
            <video
              src={`/media/videos/${encodeURIComponent(v.nombre_archivo)}`}
              preload="metadata"
              controls
              playsInline
              className="aspect-video w-full bg-black"
            />
            <div className="p-4">
              <p className="truncate text-sm font-medium">{v.nombre_original}</p>
              <p className="text-xs text-stone">
                {(v.tamaño / 1024 / 1024).toFixed(1)} MB · {v.creado_en}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setEstado(v.id, v.estado === "visible" ? "oculto" : "visible")}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    v.estado === "visible"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {v.estado === "visible" ? "Visible" : "Oculto"}
                </button>
                <button
                  onClick={() => borrar(v.id)}
                  className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-600 hover:bg-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <p className="col-span-full py-10 text-center text-stone">Aún no hay videos.</p>
        )}
      </div>
    </div>
  );
}

function InvitadosTab() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const d = await fetch("/api/admin/invitados").then((r) => r.json());
    setInvitados(d.invitados);
    setCounts(d.counts);
  }
  useEffect(() => {
    load();
  }, []);

  async function importCsv(file: File) {
    const fd = new FormData();
    fd.append("csv", file);
    const d = await fetch("/api/admin/invitados/import", { method: "POST", body: fd }).then((r) => r.json());
    setMsg(`Importados: ${d.imported}`);
    load();
  }

  async function sendInvites() {
    if (!confirm("¿Enviar invitaciones por WhatsApp a los pendientes?")) return;
    setBusy(true);
    setMsg("Enviando…");
    const d = await fetch("/api/admin/send-invites", { method: "POST" }).then((r) => r.json());
    setMsg(`Enviados: ${d.sent} · errores: ${(d.errors || []).length}`);
    setBusy(false);
    load();
  }

  async function reminders() {
    if (!confirm("¿Enviar recordatorios a los que no han respondido?")) return;
    setBusy(true);
    setMsg("Enviando…");
    const d = await fetch("/api/admin/reminders", { method: "POST" }).then((r) => r.json());
    setMsg(`Recordatorios: ${d.sent} · errores: ${(d.errors || []).length}`);
    setBusy(false);
    load();
  }

  async function copyLink(inv: Invitado) {
    const url = `${window.location.origin}/rsvp?t=${inv.token}`;
    await navigator.clipboard.writeText(url);
    setMsg(`Enlace copiado: ${inv.nombre}`);
    setTimeout(() => setMsg(""), 2500);
  }

  async function sendOne(inv: Invitado) {
    if (!confirm(`¿Enviar invitación a ${inv.nombre} por WhatsApp?`)) return;
    setBusy(true);
    const r = await fetch(`/api/admin/messages/send/${inv.id}`, { method: "POST" });
    const d = await r.json();
    setMsg(d.ok ? `Enviado a ${inv.nombre}` : `Error: ${d.error}`);
    setBusy(false);
    load();
  }

  async function remove(inv: Invitado) {
    if (!confirm(`¿Eliminar a ${inv.nombre}?`)) return;
    await fetch(`/api/admin/invitados/${inv.id}`, { method: "DELETE" });
    load();
  }

  const filtered = invitados.filter((i) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return i.nombre.toLowerCase().includes(s) || i.whatsapp.includes(s) || (i.grupo && i.grupo.toLowerCase().includes(s));
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-full bg-charcoal px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-cream"
        >
          Importar CSV
        </button>
        <button
          onClick={sendInvites}
          disabled={busy}
          className="rounded-full bg-bronze px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-cream hover:bg-bronze-dark disabled:opacity-50"
        >
          Enviar invitaciones
        </button>
        <button
          onClick={reminders}
          disabled={busy}
          className="rounded-full border border-charcoal/30 px-5 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-charcoal hover:text-cream"
        >
          Recordatorios
        </button>
        <a
          href="/api/admin/invitados/export"
          className="rounded-full border border-bronze/40 bg-white px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-bronze hover:bg-bronze hover:text-white"
        >
          Exportar CSV invitados
        </a>
        <a
          href="/api/admin/rsvp/export"
          className="rounded-full border border-bronze/40 bg-white px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-bronze hover:bg-bronze hover:text-white"
        >
          Exportar CSV RSVP
        </a>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
        />
        <span className="text-xs text-stone">
          CSV: nombre,whatsapp,personas,grupo
        </span>
      </div>
      {msg && <p className="mt-3 text-sm text-bronze">{msg}</p>}
      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, WhatsApp o grupo…"
          className="w-full rounded-xl border border-arena/60 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-stone/60 focus:border-bronze"
        />
        <p className="mt-2 text-xs text-stone">{filtered.length} de {invitados.length} invitados</p>
      </div>

      {counts && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["total", counts.total],
            ["personas", counts.personas],
            ["pendientes", counts.pendientes],
            ["enviados", counts.enviados],
            ["confirmados", counts.confirmados],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-arena/60 bg-white p-3 text-center">
              <p className="font-serif text-2xl text-bronze">{v}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-stone">{l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-arena/60 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-arena/60 text-[0.7rem] uppercase tracking-[0.15em] text-stone">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Personas</th>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3">Envío</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-arena/30">
                <td className="px-4 py-2.5 font-medium">{i.nombre}</td>
                <td className="px-4 py-2.5">{i.whatsapp}</td>
                <td className="px-4 py-2.5">{i.personas}</td>
                <td className="px-4 py-2.5 text-stone">{i.grupo || "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      i.estado === "confirmado"
                        ? "bg-green-100 text-green-700"
                        : i.estado === "no_asiste"
                          ? "bg-red-100 text-red-600"
                          : i.estado === "enviado"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {i.estado}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {i.rsvp_used ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Usado</span>
                  ) : (
                    <span className="text-xs text-stone">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-stone">{i.ultimo_envio || "—"}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => copyLink(i)} title="Copiar enlace RSVP" className="rounded-full border border-arena/60 px-2.5 py-1 text-[0.65rem] uppercase tracking-wide hover:bg-arena/20">Link</button>
                    <button onClick={() => sendOne(i)} disabled={busy} title="Enviar por WhatsApp" className="rounded-full bg-bronze px-2.5 py-1 text-[0.65rem] uppercase tracking-wide text-white hover:bg-bronze-dark disabled:opacity-40">Enviar</button>
                    <button onClick={() => remove(i)} title="Eliminar" className="rounded-full bg-red-50 px-2.5 py-1 text-[0.65rem] uppercase tracking-wide text-red-600 hover:bg-red-100">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone">
                  {invitados.length === 0 ? "Importa la lista de invitados (CSV) para poder enviar invitaciones." : "Sin resultados para la búsqueda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArchivoTab() {
  const [files, setFiles] = useState<{ archivo: string; tamaño_mb: number; modificado: string }[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/admin/archive").then((r) => r.json());
    setFiles(d.files);
  }
  useEffect(() => {
    load();
  }, []);

  async function generar() {
    if (!confirm("¿Generar archivo post-boda? (puede tardar)")) return;
    const d = await fetch("/api/admin/archive", { method: "POST" }).then((r) => r.json());
    setMsg(d.ok ? "Archivado en proceso…" : "Error");
    setTimeout(load, 3000);
  }

  return (
    <div>
      <button
        onClick={generar}
        className="rounded-full bg-charcoal px-6 py-3 text-xs uppercase tracking-[0.15em] text-cream"
      >
        Generar archivo (ZIP)
      </button>
      {msg && <p className="mt-3 text-sm text-bronze">{msg}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {files.map((f) => (
          <div key={f.archivo} className="rounded-xl border border-arena/60 bg-white p-4">
            <p className="truncate text-sm font-medium">{f.archivo}</p>
            <p className="text-xs text-stone">
              {f.tamaño_mb} MB · {new Date(f.modificado).toLocaleString()}
            </p>
          </div>
        ))}
        {files.length === 0 && (
          <p className="col-span-full py-8 text-center text-stone">
            Aún no hay archivos generados.
          </p>
        )}
      </div>
    </div>
  );
}

function PreviewTab({ invitados }: { invitados: Invitado[] }) {
  const [selected, setSelected] = useState<Invitado | null>(null);
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (selected?.token) {
      setImgSrc(`/api/invitacion/${selected.token}?_=${Date.now()}`);
    }
  }, [selected]);

  async function copyRsvp() {
    if (!selected) return;
    const url = `${window.location.origin}/rsvp?t=${selected.token}`;
    await navigator.clipboard.writeText(url);
    alert("Enlace copiado: " + url);
  }

  return (
    <div>
      <p className="text-sm text-stone mb-4">
        Selecciona un invitado para ver cómo se verá su imagen de invitación personalizada (ahora con QR a /rsvp).
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {invitados.map((inv) => (
          <button
            key={inv.id}
            onClick={() => setSelected(inv)}
            className={`rounded-full px-4 py-2 text-xs transition-colors ${
              selected?.id === inv.id
                ? "bg-bronze text-cream"
                : "bg-white text-charcoal border border-arena/60 hover:bg-arena/30"
            }`}
          >
            {inv.nombre}
          </button>
        ))}
        {invitados.length === 0 && (
          <p className="text-stone text-sm">No hay invitados cargados aún.</p>
        )}
      </div>
      {selected && (
        <div className="rounded-2xl border border-arena/60 bg-white p-6">
          <p className="text-sm font-medium mb-2">
            {selected.nombre} — {selected.personas} boleto{selected.personas !== 1 ? "s" : ""} · token {selected.token.slice(0, 10)}…
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={copyRsvp} className="rounded-full border border-charcoal/20 px-4 py-1.5 text-xs hover:bg-charcoal hover:text-white">Copiar enlace RSVP</button>
            <a href={imgSrc} download={`invitacion-${selected.nombre.replace(/\s+/g, "-")}.png`} className="rounded-full bg-bronze px-4 py-1.5 text-xs text-white hover:bg-bronze-dark">Descargar PNG</a>
            <a href={`/rsvp?t=${selected.token}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-bronze/40 px-4 py-1.5 text-xs text-bronze hover:bg-bronze hover:text-white">Abrir RSVP →</a>
          </div>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={`Invitación de ${selected.nombre}`}
              className="mx-auto max-w-md rounded-xl shadow-lg"
            />
          ) : (
            <div className="h-96 animate-pulse bg-sand/30 rounded-xl" />
          )}
        </div>
      )}
    </div>
  );
}