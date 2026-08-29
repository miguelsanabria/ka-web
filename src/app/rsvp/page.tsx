import RsvpForm from "@/components/RsvpForm";

export default function RsvpPage() {
  return (
    <main className="min-h-screen bg-charcoal py-20 text-cream">
      <div className="mx-auto max-w-lg px-6 text-center">
        <p className="font-script text-3xl text-gold">Karen & Aldo</p>
        <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
          Confirmación de asistencia
        </h1>
        <p className="mt-5 text-sm font-light leading-relaxed text-cream/70">
          Gracias por acompañarnos. Confirma cuántos asistirán para tener todo
          listo el 07 de noviembre de 2026.
        </p>
        <div className="mt-10">
          <RsvpForm dark />
        </div>
      </div>
    </main>
  );
}