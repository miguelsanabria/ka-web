"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown({ target }: { target: string }) {
  const [time, setTime] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    const update = () => setTime(getRemaining(new Date(target).getTime()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!time) {
    return (
      <div className="flex items-baseline justify-center gap-5 sm:gap-9">
        {[["00", "Días"], ["00", "Horas"], ["00", "Min"], ["00", "Seg"]].map(
          ([value, label], i) => (
            <div key={label} className="flex items-baseline gap-5 sm:gap-9">
              {i > 0 && (
                <span className="pb-6 text-2xl text-bronze" aria-hidden>
                  :
                </span>
              )}
              <div className="flex flex-col items-center">
                <span className="font-serif text-5xl font-medium text-charcoal tabular-nums sm:text-6xl">
                  {value}
                </span>
                <span className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-stone">
                  {label}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  const units: [number, string][] = [
    [time.d, "Días"],
    [time.h, "Horas"],
    [time.m, "Min"],
    [time.s, "Seg"],
  ];

  return (
    <div className="flex items-baseline justify-center gap-5 sm:gap-9">
      {units.map(([value, label], i) => (
        <div key={label} className="flex items-baseline gap-5 sm:gap-9">
          {i > 0 && (
            <span className="pb-6 text-2xl text-bronze" aria-hidden>
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span className="font-serif text-5xl font-medium text-charcoal tabular-nums sm:text-6xl">
              {String(value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-stone">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}