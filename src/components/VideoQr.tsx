"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function VideoQr() {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/grabar`;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 260,
      color: { dark: "#383a2d", light: "#f8f4ec" },
    })
      .then(setQr)
      .catch(() => {});
  }, []);

  return (
    <aside className="mx-auto w-[200px] rounded-2xl bg-white p-4 shadow-[0_16px_40px_-20px_rgba(56,58,45,0.4)] ring-1 ring-arena/50 sm:sticky sm:top-24">
      {qr ? (
        <img src={qr} alt="QR para grabar tu video" className="w-full" />
      ) : (
        <div className="aspect-square w-full animate-pulse bg-sand/50" />
      )}
      <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.2em] text-charcoal-soft">
        Escanea y graba
      </p>
      <p className="text-center text-[0.6rem] uppercase tracking-[0.15em] text-stone">
        desde tu celular
      </p>
    </aside>
  );
}