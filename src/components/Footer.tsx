import { WEDDING } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-olive-dark py-16 text-center text-cream">
      <p className="font-script text-4xl text-gold">
        Karen <span className="text-cream/70">&</span> Aldo
      </p>
      <p className="mt-4 text-xs uppercase tracking-[0.3em] text-cream/50">
        {WEDDING.dateShort} · Tepatitlán de Morelos
      </p>
      <p className="mt-8 text-sm font-light text-cream/40">
        Gracias por acompañarnos en este día tan especial.
      </p>
    </footer>
  );
}
