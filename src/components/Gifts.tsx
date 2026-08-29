import { Section, Eyebrow } from "@/components/Section";
import { WEDDING } from "@/lib/data";

export default function Gifts() {
  return (
    <Section id="regalos" className="bg-linen py-28 sm:py-36">
      <div className="reveal mx-auto max-w-2xl text-center">
        <Eyebrow>Detalles</Eyebrow>
        <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-charcoal-soft">
          {WEDDING.gifts.intro}
        </p>
      </div>

      <div className="reveal mx-auto mt-16 flex max-w-3xl flex-col items-center justify-center gap-5 sm:flex-row">
        <a
          href={WEDDING.gifts.liverpool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full bg-bronze px-10 py-4 text-xs uppercase tracking-[0.25em] text-cream transition-all duration-300 hover:bg-bronze-dark sm:w-auto"
        >
          Liverpool
        </a>
        <a
          href={WEDDING.gifts.amazon.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full border border-charcoal/25 px-10 py-4 text-xs uppercase tracking-[0.25em] text-charcoal transition-all duration-300 hover:bg-charcoal hover:text-cream sm:w-auto"
        >
          Amazon
        </a>
      </div>
      <p className="reveal mt-6 text-center text-xs tracking-wide text-stone">
        Liverpool · No. {WEDDING.gifts.liverpool.number}
        {WEDDING.gifts.sears.number && <> · Sears · No. {WEDDING.gifts.sears.number}</>}
      </p>
    </Section>
  );
}
