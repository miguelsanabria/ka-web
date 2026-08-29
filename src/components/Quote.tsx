import { Section } from "@/components/Section";
import { WEDDING } from "@/lib/data";

export default function Quote() {
  return (
    <Section className="bg-linen py-28 sm:py-36">
      <div className="reveal mx-auto max-w-3xl text-center">
        <span className="font-serif text-7xl leading-none text-bronze" aria-hidden>
          “
        </span>
        <blockquote className="mt-2 font-serif text-3xl font-light italic leading-snug text-charcoal sm:text-4xl">
          {WEDDING.quote}
        </blockquote>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-stone">
          — {WEDDING.quoteAuthor}
        </p>
        <p className="mx-auto mt-10 max-w-2xl text-base font-light leading-relaxed text-charcoal-soft sm:text-lg">
          {WEDDING.quoteSource}
        </p>
      </div>
    </Section>
  );
}
