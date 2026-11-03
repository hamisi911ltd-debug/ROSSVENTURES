import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { FALLBACK_POSTER } from "@/lib/fixtures";
import { VENUE_TBC } from "@/lib/league";
import { TeamCrest } from "@/components/TeamCrest";

export function isOnSale(e: EventRow): boolean {
  return (e.tiers ?? []).some((t) => Number(t.price) > 0);
}

export function lowestPrice(e: EventRow): number | null {
  const prices = (e.tiers ?? []).map((t) => Number(t.price)).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : null;
}

function splitKickoff(eventDate: string): { day: string; time: string } {
  const [day, time] = eventDate.split(" · ");
  return { day: day ?? eventDate, time: time ?? "" };
}

/** League fixtures show both club crests; other events (published later) show their poster. */
export function MatchCard({ event }: { event: EventRow }) {
  const onSale = isOnSale(event);
  const from = lowestPrice(event);
  const { day, time } = splitKickoff(event.event_date);

  const cta = (
    <span
      className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        onSale
          ? "bg-gradient-ember text-primary-foreground shadow-ember group-hover:shadow-glow"
          : "border border-white/15 bg-white/5 text-muted-foreground"
      }`}
    >
      {onSale ? <>Book tickets{from ? ` · from KES ${from.toLocaleString()}` : ""} <ArrowRight className="h-3.5 w-3.5" /></> : event.venue === VENUE_TBC ? "Awaiting FKF venue" : "Tickets on sale soon"}
    </span>
  );

  if (event.home_team && event.away_team) {
    return (
      <Link
        to="/events/$eventId"
        params={{ eventId: event.id }}
        className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card-soft transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
      >
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-accent">{event.tag}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {time}</span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <TeamCrest name={event.home_team} size={56} />
            <span className="line-clamp-2 text-xs font-bold leading-tight">{event.home_team}</span>
          </div>
          <span className="font-display text-lg font-extrabold text-gradient-ember">VS</span>
          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <TeamCrest name={event.away_team} size={56} />
            <span className="line-clamp-2 text-xs font-bold leading-tight">{event.away_team}</span>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 text-accent" /> {day}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
          <MapPin className="h-3 w-3 text-accent" /> {event.venue}
        </p>
        {cta}
      </Link>
    );
  }

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={event.poster_url ?? FALLBACK_POSTER} alt={event.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {event.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">{event.tag}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight">{event.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3 text-accent" /> {event.event_date}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3 text-accent" /> {event.venue}</p>
        {cta}
      </div>
    </Link>
  );
}
