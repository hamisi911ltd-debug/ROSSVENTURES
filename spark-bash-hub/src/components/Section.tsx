import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  description,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-12 sm:py-16 relative">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-60" />
            {eyebrow}
          </span>
        )}
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>}
      </div>
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
