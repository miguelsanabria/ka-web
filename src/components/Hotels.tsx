import { Section, Eyebrow } from "@/components/Section";
import { WEDDING } from "@/lib/data";

export default function Hotels() {
  return (
    <Section id="hospedaje" className="bg-linen py-28 sm:py-36">
      <div className="reveal mx-auto max-w-2xl text-center">
        <Eyebrow>Dónde hospedarse</Eyebrow>
        <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
          Alojamiento
        </h2>
      </div>

      <div className="reveal mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
        {WEDDING.hotels.map((h) => (
          <div
            key={h.name}
            className="flex flex-col items-center rounded-2xl border border-arena/60 bg-cream p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(42,37,34,0.2)]"
          >
            <p className="font-serif text-xl font-medium text-charcoal">
              {h.name}
            </p>
            <p className="mt-1 text-sm font-light text-stone">{h.city}</p>
            {(h.code || h.url) && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {h.url && (
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-bronze/40 px-5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-bronze transition-all duration-300 hover:bg-bronze hover:text-cream"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Cómo llegar
                  </a>
                )}
                {h.code && (
                  <span className="rounded-full bg-charcoal px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-cream">
                    Código: {h.code}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
