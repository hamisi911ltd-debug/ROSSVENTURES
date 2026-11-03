import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { MATCHDAYS } from "@/lib/league";
import { MatchCard } from "@/components/MatchCard";
import { OpeningMatch } from "@/components/OpeningMatch";
import talantaAerial from "@/assets/talanta-aerial.jpg";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Fixtures & Tickets — Football Arena254" },
      { name: "description", content: "Book tickets for the FKF Premier League and the Talanta Stadium opening match. Every matchday, every club. Pay by M-PESA." },
      { property: "og:title", content: "Fixtures & Tickets — Football Arena254" },
      { property: "og:description", content: "Book your seat at Talanta Stadium and FKF Premier League matches." },
    ],
  }),
  component: EventsPage,
});

function dayRange(matches: { kickoff?: string }[]): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" });
  const times = matches.map((m) => m.kickoff!).sort();
  const a = fmt(times[0]), b = fmt(times[times.length - 1]);
  return a === b ? a : `${a} – ${b}`;
}

function EventsPage() {
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
            The Talanta Stadium opening match first, then every FKF Premier League matchday.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <OpeningMatch />

        {/* Matchday jump links */}
        <nav className="mt-12 flex flex-wrap gap-2" aria-label="Matchdays">
          {MATCHDAYS.map((d) => (
            <a
              key={d.matchday}
              href={`#md-${d.matchday}`}
              className="rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-accent"
            >
              MD {d.matchday}
            </a>
          ))}
        </nav>

        {MATCHDAYS.map((d) => (
          <section key={d.matchday} id={`md-${d.matchday}`} className="mt-10 scroll-mt-28">
            <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Matchday {d.matchday} <span className="text-base font-medium text-muted-foreground">of 34</span>
              </h2>
              <span className="text-sm text-muted-foreground">{dayRange(d.matches)}</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {d.matches.map((m) => (
                <MatchCard key={m.id} event={m} />
              ))}
            </div>
          </section>
        ))}

        <p className="mt-12 text-center text-sm text-muted-foreground">
          More fixtures are added as kick-off dates are confirmed.
        </p>
      </div>
    </main>
  );
}
