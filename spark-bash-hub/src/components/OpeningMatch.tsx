import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Phone } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { OPENING_MATCH_ID } from "@/lib/league";
import { FIXTURES_BY_ID } from "@/lib/fixtures";
import { TeamCrest } from "@/components/TeamCrest";
import { isOnSale, lowestPrice } from "@/components/MatchCard";
import talantaAerial from "@/assets/talanta-aerial.jpg";
import talantaShield from "@/assets/talanta-shield.jpg";

/** Top-priority spotlight for the match that opens the new Talanta Stadium. */
export function OpeningMatch({ events = [] }: { events?: EventRow[] }) {
  const match = OPENING_MATCH_ID
    ? events.find((e) => e.id === OPENING_MATCH_ID) ?? FIXTURES_BY_ID[OPENING_MATCH_ID]
    : undefined;

  const wrapper = "relative overflow-hidden rounded-3xl border border-gold shadow-gold";

  const background = (
    <>
      <img src={talantaAerial} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-glow blur-3xl" />
    </>
  );

  const badge = (
    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.2em] text-black shadow-gold animate-shimmer">
      <Sparkles className="h-3.5 w-3.5 shrink-0" />
      <span className="sm:hidden">Talanta opening match</span>
      <span className="hidden sm:inline">The opening match · Talanta Stadium</span>
    </span>
  );

  if (!match) {
    return (
      <section className={wrapper}>
        {background}
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            {badge}
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] text-white sm:text-5xl">
              Be there when <span className="text-gradient-gold">Talanta Stadium</span> opens its gates.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              Kenya&apos;s new 60,000-seat home of football hosts its first match soon. Tickets for the opening match will be released
              here first — message us to be told the moment they go on sale.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/254705333198?text=Hi%20Football%20Arena254%2C%20tell%20me%20when%20Talanta%20opening%20match%20tickets%20go%20on%20sale."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-3 text-sm font-bold text-black shadow-gold"
              >
                <Phone className="h-4 w-4" /> Notify me on WhatsApp
              </a>
              <Link to="/organizers" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
                See the stadium <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-gold lg:block">
            <img src={talantaShield} alt="Talanta Stadium shield façade" className="h-64 w-full object-cover" />
          </div>
        </div>
      </section>
    );
  }

  const onSale = isOnSale(match);
  const from = lowestPrice(match);
  const [day, time] = match.event_date.split(" · ");

  return (
    <section className={wrapper}>
      {background}
      <div className="relative p-6 sm:p-10">
        {badge}
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {match.home_team && match.away_team ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <TeamCrest name={match.home_team} size={96} />
                  <span className="font-display text-base font-extrabold text-white sm:text-xl">{match.home_team}</span>
                </div>
                <span className="font-display text-3xl font-extrabold text-gradient-gold sm:text-5xl">VS</span>
                <div className="flex flex-col items-center gap-3 text-center">
                  <TeamCrest name={match.away_team} size={96} />
                  <span className="font-display text-base font-extrabold text-white sm:text-xl">{match.away_team}</span>
                </div>
              </div>
            ) : (
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-5xl">{match.title}</h2>
            )}
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur">
            <p className="flex items-center gap-2 text-sm text-white/85"><Calendar className="h-4 w-4 text-gold" /> {day}</p>
            {time && <p className="mt-2 flex items-center gap-2 text-sm text-white/85"><Clock className="h-4 w-4 text-gold" /> Kick-off {time}</p>}
            <p className="mt-2 flex items-center gap-2 text-sm text-white/85"><MapPin className="h-4 w-4 text-gold" /> {match.venue}</p>
            <Link
              to="/events/$eventId"
              params={{ eventId: match.id }}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold ${onSale ? "bg-gradient-gold text-black shadow-gold" : "border border-white/20 bg-white/10 text-white"}`}
            >
              {onSale ? <>Book opening-match tickets{from ? ` · from KES ${from.toLocaleString()}` : ""} <ArrowRight className="h-4 w-4" /></> : "Tickets on sale soon"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
