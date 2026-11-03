import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { FIXTURES, FALLBACK_POSTER } from "@/lib/fixtures";
import talantaAerial from "@/assets/talanta-aerial.jpg";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Fixtures & Tickets — Football Arena254" },
      { name: "description", content: "Book tickets for Kenyan football: Talanta Stadium derbies, FKF Premier League matchdays, cup finals and Harambee Stars internationals. Pay by M-PESA." },
      { property: "og:title", content: "Fixtures & Tickets — Football Arena254" },
      { property: "og:description", content: "Book your seat at Talanta Stadium, Kasarani and Nyayo." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [dynamicEvents, setDynamicEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        const data: { ok: boolean; events: EventRow[] } = await res.json();
        if (data.ok && Array.isArray(data.events)) setDynamicEvents(data.events);
      } catch {}
    }
    fetchEvents();
    const interval = setInterval(fetchEvents, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Admin-published matches win; otherwise fall back to the built-in fixtures
  const matches = dynamicEvents.length > 0 ? dynamicEvents : FIXTURES;
  const featured = matches[0];
  const rest = matches.slice(1);

  return (
    <main>
      {/* Page banner — Talanta Stadium */}
      <section className="relative overflow-hidden border-b border-border/60">
        <img src={talantaAerial} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            <Calendar className="h-3.5 w-3.5" /> Fixtures
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
            Book your seat at the <span className="text-gradient-ember">next Kenyan match.</span>
          </h1>
          <p className="mt-3 max-w-xl text-white/75">
            League nights, derbies, cup finals and Harambee Stars internationals — starting at the new Talanta Stadium.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* FEATURED */}
        <section className="grid gap-10 rounded-3xl border border-primary/30 bg-card/60 p-6 shadow-glow lg:grid-cols-2 lg:p-10">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={featured.poster_url ?? FALLBACK_POSTER} alt={featured.title} className="h-full w-full object-cover" />
            {featured.tag && (
              <span className="absolute left-3 top-3 rounded-full bg-gradient-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
                {featured.tag}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{featured.title}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent" /> {featured.venue} · <Calendar className="h-4 w-4 text-accent" /> {featured.event_date}
            </p>
            <p className="mt-4 text-muted-foreground">{featured.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(featured.tiers ?? []).map((t) => (
                <div key={t.name} className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.name}</p>
                  <p className="mt-1 font-display font-bold text-gradient-ember">KES {t.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/events/$eventId" params={{ eventId: featured.id }} className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-3 text-sm font-semibold text-primary-foreground shadow-ember">
                Book Tickets <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="tel:+254705333198" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-5 py-3 text-sm font-semibold hover:bg-secondary">
                Group bookings
              </a>
            </div>
          </div>
        </section>

        {/* ALL FIXTURES */}
        {rest.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">All upcoming fixtures</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((ev) => (
                <Link
                  key={ev.id}
                  to="/events/$eventId"
                  params={{ eventId: ev.id }}
                  className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={ev.poster_url ?? FALLBACK_POSTER} alt={ev.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    {ev.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-gradient-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
                        {ev.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold leading-tight">{ev.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{ev.venue} · {ev.event_date}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                      Book Tickets <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
