"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const start = () => {
      audioRef.current?.play().catch(() => {});
      setPlaying(true);
    };
    window.addEventListener("ka:music:start", start);
    return () => window.removeEventListener("ka:music:start", start);
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/media/audio/karen-aldo.m4a" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Reproducir música"}
        className={`music-toggle ${playing ? "playing" : ""}`}
      >
        <span className="music-toggle-icon" aria-hidden>
          {playing ? "⏸" : "♪"}
        </span>
        <span className="music-toggle-label">{playing ? "Pausa" : "Música"}</span>
      </button>
    </>
  );
}