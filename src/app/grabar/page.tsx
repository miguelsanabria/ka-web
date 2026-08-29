"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type Mode = "idle" | "native" | "browser" | "uploading" | "done" | "error";

export default function GrabarPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [qr, setQr] = useState<string>("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = window.location.origin + window.location.pathname;
    QRCode.toDataURL(url, { margin: 1, width: 260, color: { dark: "#383a2d", light: "#f8f4ec" } })
      .then(setQr)
      .catch(() => {});
  }, []);

  async function startBrowser() {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      setMode("browser");
      await new Promise((r) => setTimeout(r, 100));
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      setError("No se pudo acceder a la cámara. Usa la cámara nativa del iPad.");
      setMode("native");
    }
  }

  function startRecording() {
    if (!stream) return;
    const rec = new MediaRecorder(stream, { mimeType: "video/mp4;codecs=avc1" });
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => uploadBlob(new Blob(chunksRef.current, { type: "video/webm" }));
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function cleanup() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  async function uploadBlob(blob: Blob) {
    setMode("uploading");
    setProgress(0);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/guestbook");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status === 201 ? resolve() : reject(new Error(xhr.responseText)));
        xhr.onerror = () => reject(new Error("Error de red"));
        const fd = new FormData();
        fd.append("video", blob, `grabacion-${Date.now()}.webm`);
        xhr.send(fd);
      });
      cleanup();
      setMode("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
      setMode("error");
    }
  }

  async function onNativeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMode("uploading");
    setProgress(0);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/guestbook");
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status === 201 ? resolve() : reject(new Error(xhr.responseText)));
        xhr.onerror = () => reject(new Error("Error de red"));
        const fd = new FormData();
        fd.append("video", f, f.name);
        xhr.send(fd);
      });
      setMode("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
      setMode("error");
    }
  }

  useEffect(() => () => cleanup(), []);

  if (mode === "done") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-charcoal px-6 text-cream">
        <div className="max-w-md text-center">
          <p className="font-script text-5xl text-gold">¡Gracias!</p>
          <p className="mt-4 text-sm font-light text-cream/75">
            Tu video se subió y ya está en camino al muro. Comparte la alegría.
          </p>
          <button
            onClick={() => {
              setMode("idle");
              setError("");
              setProgress(0);
            }}
            className="mt-8 rounded-full border border-cream/40 px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-cream hover:text-charcoal"
          >
            Grabar otro
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal py-14 text-cream">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="font-script text-3xl text-gold">Karen & Aldo</p>
        <h1 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">Deja tu video</h1>
        <p className="mt-4 text-sm font-light text-cream/70">
          Graba un mensaje de felicitación (~2–5 min). Aparecerá en el muro de la página.
        </p>

        {mode === "uploading" && (
          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-cream/20 bg-cream/10 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-cream/70">Subiendo… {progress}%</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-cream/20">
              <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {mode === "error" && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-red-400/40 bg-red-400/10 px-5 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {mode !== "uploading" && (
          <div className="mx-auto mt-10 grid max-w-lg gap-6 sm:grid-cols-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border border-gold/60 bg-gold/10 px-6 py-10 transition-colors hover:bg-gold/20"
            >
              <span className="block text-4xl">📷</span>
              <span className="mt-3 block text-xs uppercase tracking-[0.2em]">
                Grabar con cámara
              </span>
              <span className="mt-1 block text-[0.7rem] font-light text-cream/60">
                Abre la cámara del iPad
              </span>
            </button>
            <button
              onClick={startBrowser}
              className="rounded-2xl border border-cream/30 px-6 py-10 transition-colors hover:bg-cream/10"
            >
              <span className="block text-4xl">🎥</span>
              <span className="mt-3 block text-xs uppercase tracking-[0.2em]">
                Grabar aquí
              </span>
              <span className="mt-1 block text-[0.7rem] font-light text-cream/60">
                En el navegador
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={onNativeFile}
            />
          </div>
        )}

        {mode === "browser" && (
          <div className="mx-auto mt-8 max-w-md">
            <video ref={videoRef} playsInline muted className="aspect-video w-full rounded-2xl bg-black" />
            <div className="mt-4 flex justify-center gap-4">
              {recording ? (
                <button
                  onClick={stopRecording}
                  className="rounded-full bg-red-500 px-8 py-3 text-xs uppercase tracking-[0.25em] text-white"
                >
                  Detener y subir
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="rounded-full bg-gold px-8 py-3 text-xs uppercase tracking-[0.25em] text-charcoal"
                >
                  Grabar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-14 max-w-[280px] rounded-2xl bg-cream p-4">
          {qr ? (
            <img src={qr} alt="QR para grabar desde tu celular" className="w-full" />
          ) : (
            <div className="h-[260px] w-full animate-pulse bg-sand/50" />
          )}
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-charcoal">
            Escanea y graba desde tu celular
          </p>
        </div>
      </div>
    </main>
  );
}