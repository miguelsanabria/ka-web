"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "closed" | "opening" | "rising" | "reading" | "fading" | "gone";

const OPENING_MS = 600;
const RISING_MS = 600;
const READ_MS = 1000;
const FADING_MS = 700;

export default function EnvelopeIntro() {
  const [phase, setPhase] = useState<Phase>("closed");
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      timersRef.current.push(window.setTimeout(() => setPhase("gone"), 120));
    } else {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") skip();
      };
      window.addEventListener("keydown", onKey);
      timersRef.current.push(
        window.setTimeout(() => {
          window.removeEventListener("keydown", onKey);
        }, OPENING_MS + RISING_MS + READ_MS + FADING_MS + 600)
      );
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "gone") document.body.style.overflow = "";
  }, [phase]);

  function open() {
    if (phase !== "closed") return;
    setPhase("opening");
    window.dispatchEvent(new CustomEvent("ka:music:start"));
    window.dispatchEvent(new CustomEvent("ka:envelope:open"));
    later(() => setPhase("rising"), OPENING_MS);
    later(() => setPhase("reading"), OPENING_MS + RISING_MS);
    later(() => setPhase("fading"), OPENING_MS + RISING_MS + READ_MS);
    later(() => {
      setPhase("gone");
      window.dispatchEvent(new CustomEvent("ka:envelope:done"));
    }, OPENING_MS + RISING_MS + READ_MS + FADING_MS);
  }

  function skip() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("gone");
  }

  if (phase === "gone") return null;

  return (
    <div
      className={`envelope-wrapper ${phase}`}
      onClick={phase === "closed" ? open : undefined}
    >
      <div className="paper-texture-overlay" aria-hidden="true" />

      <div className="envelope-shadow" aria-hidden="true" />

      <div className="envelope">
        {/* Sombra de la solapa */}
        <div className="flap-shadow" aria-hidden="true" />

        {/* CUERPO DEL SOBRE */}
        <div className="envelope-body">
          <div className="envelope-base" aria-hidden="true" />
          <div className="paper-texture" aria-hidden="true" />
          <div className="fold-lines" aria-hidden="true">
            <div className="fold-line fold-top" />
            <div className="fold-line fold-bottom" />
            <div className="fold-line fold-left" />
            <div className="fold-line fold-right" />
          </div>
          <div className="flap-shadow-on-body" aria-hidden="true" />
          <div className="edge-highlight top" aria-hidden="true" />
          <div className="edge-highlight left" aria-hidden="true" />
          <div className="edge-highlight right" aria-hidden="true" />
        </div>

        {/* SOLAPA DEL SOBRE */}
        <div className="flap">
          <div className="flap-inner">
            <div className="flap-thickness" aria-hidden="true" />
            <div className="flap-texture" aria-hidden="true" />
            <div className="flap-fold-line" aria-hidden="true" />
            <div className="flap-highlight" aria-hidden="true" />
            <div className="wax-seal">
              <img
                src="/media/envelope/sello-circle.webp"
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MENSAJE QUE SALE DEL SOBRE */}
      <div className="letter">
        <div className="letter-paper">
          <div className="letter-paper-texture" aria-hidden="true" />
          <div className="letter-folds" aria-hidden="true">
            <div className="letter-fold horizontal" />
            <div className="letter-fold vertical" />
          </div>
          <div className="letter-content">
            <p className="letter-kicker">Nos casamos</p>
            <h1 className="letter-title">
              Karen <span>&</span> Aldo
            </h1>
            <p className="letter-date">07 · 11 · 2026</p>
            <p className="letter-place">Tepatitlán de Morelos · Jalisco</p>
            <blockquote className="letter-quote">
              &ldquo;El amor nos lo explicó todo&rdquo;
              <cite>— San Juan Pablo II</cite>
            </blockquote>
          </div>
        </div>
        <div className="letter-shadow" aria-hidden="true" />
      </div>

      <p className="env-hint" aria-hidden="true">
        Abrir invitación
      </p>

      <button
        type="button"
        className="env-skip"
        onClick={skip}
        aria-label="Saltar introducción"
      >
        Saltar
      </button>
    </div>
  );
}