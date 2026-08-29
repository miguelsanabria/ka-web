export function Section({
  id,
  children,
  className = "",
  container = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  container?: boolean;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      {container ? (
        <div className="mx-auto max-w-6xl px-6">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] uppercase tracking-[0.35em] text-bronze">
      {children}
    </p>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 font-serif text-4xl font-medium leading-tight text-charcoal sm:text-5xl">
      {children}
    </h2>
  );
}
