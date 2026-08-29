import Image from "next/image";
import { Section, Eyebrow } from "@/components/Section";
import { WEDDING } from "@/lib/data";
import AddToCalendar from "@/components/AddToCalendar";

export default function Events() {
  return (
    <Section id="ceremonia" className="bg-sage py-28 text-cream sm:py-36">
      <div className="reveal mx-auto max-w-3xl text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">El gran día</p>
        <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-cream sm:text-5xl">
          Ceremonia & Celebración
        </h2>
        <p className="mt-6 font-serif text-2xl text-gold sm:text-3xl">
          {WEDDING.date}
        </p>
      </div>

      <AddToCalendar />

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <EventCard
          kicker="Ceremonia religiosa"
          title={WEDDING.ceremony.place}
          meta={WEDDING.ceremony.city}
          time={WEDDING.ceremony.time}
          mapQuery={encodeURIComponent(
            WEDDING.ceremony.place + " " + WEDDING.ceremony.city
          )}
          mapLabel="Cómo llegar"
          image={{
            src: "/media/venue/san-tranquilino.webp",
            alt: "Santuario de San Tranquilino Ubiarco Robles",
            w: 1280,
            h: 577,
          }}
        />
        <EventCard
          kicker="Recepción"
          title={WEDDING.reception.place}
          meta={WEDDING.reception.city}
          time={WEDDING.reception.time}
          mapQuery={encodeURIComponent(
            WEDDING.reception.place + " " + WEDDING.reception.city
          )}
          mapLabel="Cómo llegar"
          alt
          image={{
            src: "/media/venue/mitico-lapiz.webp",
            alt: "Mítico Terraza y Jardín",
            w: 1280,
            h: 720,
          }}
        />
      </div>
    </Section>
  );
}

function EventCard({
  kicker,
  title,
  meta,
  time,
  mapQuery,
  mapLabel,
  alt = false,
  image,
}: {
  kicker: string;
  title: string;
  meta: string;
  time: string;
  mapQuery: string;
  mapLabel: string;
  alt?: boolean;
  image: { src: string; alt: string; w: number; h: number };
}) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  return (
    <div
      className={`reveal group relative overflow-hidden rounded-2xl border p-10 transition-all duration-500 sm:p-14 ${
        alt
          ? "border-charcoal bg-charcoal text-cream"
          : "border-arena/60 bg-cream"
      }`}
    >
      <div
        className={`mb-8 overflow-hidden rounded-xl ring-1 transition-transform duration-700 group-hover:scale-[1.02] ${
          alt ? "ring-cream/15" : "ring-arena/50"
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.w}
          height={image.h}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 440px"
          className="h-auto w-full object-cover"
        />
      </div>

      <p
        className={`text-[0.7rem] uppercase tracking-[0.3em] ${
          alt ? "text-gold" : "text-bronze"
        }`}
      >
        {kicker}
      </p>
      <h3
        className={`mt-4 font-serif text-2xl font-medium leading-snug sm:text-3xl ${
          alt ? "text-cream" : "text-charcoal"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm font-light ${
          alt ? "text-cream/70" : "text-stone"
        }`}
      >
        {meta}
      </p>

      <div
        className={`mt-10 flex items-center justify-between border-t pt-6 ${
          alt ? "border-cream/15" : "border-charcoal/10"
        }`}
      >
        <span className="font-serif text-3xl text-bronze">{time}</span>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] transition-all duration-300 ${
            alt
              ? "border-cream/40 text-cream hover:bg-cream hover:text-charcoal"
              : "border-charcoal/25 text-charcoal hover:bg-charcoal hover:text-cream"
          }`}
        >
          {mapLabel}
        </a>
      </div>
    </div>
  );
}