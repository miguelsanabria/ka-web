import { Section, Eyebrow } from "@/components/Section";
import { WEDDING } from "@/lib/data";

export default function Rsvp() {
  return (
    <Section id="rsvp" className="bg-charcoal py-28 text-cream sm:py-36">
      <div className="reveal relative mx-auto max-w-2xl text-center">
        <Eyebrow>RSVP</Eyebrow>
        <h2 className="mt-5 font-serif text-4xl font-medium leading-tight sm:text-5xl">
          Confirma tu asistencia
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base font-light leading-relaxed text-cream/75">
          {WEDDING.rsvp.note}
        </p>
        <a
          href="/boda-karen-aldo.vcf"
          download="Boda Karen + Aldo.vcf"
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-gold/60 bg-gold/10 px-8 py-4 text-sm font-medium tracking-[0.2em] text-cream transition-all duration-300 hover:bg-gold hover:text-charcoal"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.3-.2-.5-.3z" />
          </svg>
          {WEDDING.rsvp.whatsapp}
        </a>
        <p className="mt-3 text-[0.7rem] uppercase tracking-[0.25em] text-cream/60">
          Guardar como contacto "Boda Karen + Aldo"
        </p>
        <p className="mt-6 text-xs font-light uppercase tracking-[0.25em] text-cream/60">
          ¡Esperamos contar con su presencia!
        </p>
      </div>
    </Section>
  );
}