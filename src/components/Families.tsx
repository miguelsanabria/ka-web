"use client";

import { useState } from "react";
import { Section, Eyebrow } from "@/components/Section";
import { WEDDING } from "@/lib/data";

export default function Families() {
  const [active, setActive] = useState(0);
  const current = WEDDING.godparents[active];

  return (
    <Section id="padrinos" className="bg-linen py-28 sm:py-36">
      <div className="reveal mx-auto max-w-2xl text-center">
        <Eyebrow>Con la bendición de Dios</Eyebrow>
      </div>

      <div className="reveal mt-6 flex justify-center" aria-hidden="true">
        <svg
          viewBox="0 0 48 28"
          width="48"
          height="28"
          fill="none"
          stroke="currentColor"
          className="text-gold"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="14" r="10" />
          <circle cx="30" cy="14" r="10" />
        </svg>
      </div>

      <div className="reveal mt-8 text-center">
        <p className="font-serif text-2xl text-charcoal sm:text-3xl">
          Nuestros padres
        </p>
      </div>

      <div className="reveal mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-arena/60 bg-cream p-10 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-bronze">
            Papás de la novia
          </p>
          <p className="mt-4 font-serif text-xl leading-relaxed text-charcoal">
            {WEDDING.parents.novia[0]}
          </p>
          <p className="font-serif text-xl leading-relaxed text-charcoal">
            {WEDDING.parents.novia[1]}
          </p>
        </div>
        <div className="rounded-2xl border border-arena/60 bg-cream p-10 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-bronze">
            Papás del novio
          </p>
          <p className="mt-4 font-serif text-xl leading-relaxed text-charcoal">
            {WEDDING.parents.novio[0]}
          </p>
          <p className="font-serif text-xl leading-relaxed text-charcoal">
            {WEDDING.parents.novio[1]}
          </p>
        </div>
      </div>

      <div className="reveal mt-10 text-center">
        <p className="mt-6 font-serif text-2xl text-charcoal sm:text-3xl">
          Y nuestros padrinos
        </p>
      </div>

      <div className="reveal mx-auto mt-8 max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2">
          {WEDDING.godparents.map((g, i) => (
            <button
              key={g.role}
              onClick={() => setActive(i)}
              className={`rounded-full border px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.15em] transition-all duration-300 ${
                active === i
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/20 text-charcoal-soft hover:border-charcoal/50"
              }`}
            >
              {g.role}
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-cream p-10 text-center shadow-[0_20px_50px_-20px_rgba(42,37,34,0.15)]">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-bronze">
            Padrinos de {current.role}
          </p>
          <p className="mt-5 font-serif text-2xl text-charcoal">{current.couple[0]}</p>
          <span className="my-2 block font-script text-2xl text-gold">y</span>
          <p className="font-serif text-2xl text-charcoal">{current.couple[1]}</p>
        </div>
      </div>
    </Section>
  );
}
