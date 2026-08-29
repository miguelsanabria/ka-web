import { Section } from "@/components/Section";
import Image from "next/image";
import { WEDDING } from "@/lib/data";

export function DressCode() {
  return (
    <Section className="bg-sage py-24 text-cream sm:py-32">
      <div className="reveal mx-auto max-w-4xl">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="text-center md:text-right">
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">
              {WEDDING.dressCode.label}
            </p>
            <h3 className="mt-5 font-serif text-5xl font-medium text-cream">
              {WEDDING.dressCode.value}
            </h3>
            <p className="mx-auto mt-6 max-w-sm text-base font-light leading-relaxed text-cream/75 md:ml-auto">
              {WEDDING.dressCode.note}
            </p>
          </div>
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-2xl ring-1 ring-arena/50 shadow-[0_30px_70px_-30px_rgba(56,58,45,0.4)]">
              <Image
                src="/media/details/codigo-vestimenta.jpg"
                alt="Código de vestimenta"
                width={456}
                height={640}
                className="h-auto w-full max-w-[280px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function NoKids() {
  return (
    <Section className="bg-sage py-24 text-cream sm:py-32">
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">
          Nuestra petición
        </p>
        <h3 className="mt-5 font-serif text-5xl font-medium text-cream">
          Sin niños
        </h3>
        <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-cream/80">
          {WEDDING.noKids}
        </p>
      </div>
    </Section>
  );
}

export default function Details() {
  return (
    <>
      <DressCode />
      <NoKids />
    </>
  );
}