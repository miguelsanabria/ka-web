"use client";

import { useEffect, useState } from "react";

export default function AdminLogin({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "login" | "authed">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setState(d.admin ? "authed" : "login"))
      .catch(() => setState("login"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setState("authed");
    } else {
      const d = await r.json().catch(() => ({}));
      setError(d.error || "Error");
    }
  }

  if (state === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-charcoal text-cream">
        <p className="text-sm font-light text-cream/50">Cargando…</p>
      </main>
    );
  }

  if (state === "login") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-charcoal px-6 text-cream">
        <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-cream/15 bg-cream/5 p-8">
          <p className="font-script text-3xl text-gold">Área privada</p>
          <label className="mt-6 block text-[0.7rem] uppercase tracking-[0.2em] text-cream/60">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-cream/20 bg-cream/10 px-4 py-3 text-cream focus:border-gold focus:outline-none"
            autoFocus
          />
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-bronze px-8 py-3 text-xs uppercase tracking-[0.25em] text-cream hover:bg-bronze-dark"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}