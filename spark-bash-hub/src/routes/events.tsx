import { createFileRoute, Link } from "@tanstack/react-router";
import comrades from "@/assets/comrades-festival.jpg";
import afro from "@/assets/event-afrobeats.jpg";
import campus from "@/assets/event-campus.jpg";
import creative from "@/assets/event-creative.jpg";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Ross Ventures Limited" },
      { name: "description", content: "Concerts, campus festivals and brand activations produced by Ross Ventures Limited and RV Entertainment across Kenya." },
      { property: "og:title", content: "Events by Ross Ventures Limited" },
      { property: "og:description", content: "Comrades Festival, UsaniiFest, Adani Chill & Vibe and more." },
    ],
  }),
  component: EventsPage,
});

const FEATURED = {
  img: comrades,
  title: "Comrades Festival 1.0",
  venue: "JKUAT, Juja",
  date: "16 September 2026 · From 2PM",
  copy: "RV Entertainment x JKUSA presents the launch edition of Comrades Festival — cool vibes, music, games and a stage built for the campus crowd.",
  tiers: [
    { name: "Early Bird", price: "KES 450" },
    { name: "Advance", price: "KES 600" },
    { name: "Gate", price: "KES 800" },
    { name: "VVIP", price: "KES 2,000" },
  ],
};

const PAST = [
  { img: creative, title: "Adani Chill & Vibe", meta: "Music · Hosted by MC Pharaoh & Clinton Chief", tag: "Past" },
  { img: campus, title: "UsaniiFest 001", meta: "Campus creative festival", tag: "Past" },
  { img: afro, title: "Mother's Day Brand Campaign", meta: "Digital + experiential", tag: "Campaign" },
];

function EventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
          <Calendar className="h-3.5 w-3.5" /> Our Events
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Nights, festivals & <span className="text-gradient-ember">activations</span> we've built.</h1>
        <p className="mt-3 text-muted-foreground">Selected events produced by Ross Ventures Limited and our entertainment arm, RV Entertainment.</p>
      </header>

      {/* FEATURED */}
      <section className="mt-12 grid gap-10 rounded-3xl border border-primary/30 bg-card/60 p-6 shadow-glow lg:grid-cols-2 lg:p-10">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={FEATURED.img} alt={FEATURED.title} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-gradient-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">Headline 2026</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{FEATURED.title}</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-accent" /> {FEATURED.venue} · <Calendar className="h-4 w-4 text-accent" /> {FEATURED.date}</p>
          <p className="mt-4 text-muted-foreground">{FEATURED.copy}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FEATURED.tiers.map((t) => (
              <div key={t.name} className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.name}</p>
                <p className="mt-1 font-display font-bold text-gradient-ember">{t.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-3 text-sm font-semibold text-primary-foreground shadow-ember">Reserve tickets <ArrowRight className="h-4 w-4" /></Link>
            <a href="tel:+254705333198" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-5 py-3 text-sm font-semibold hover:bg-secondary">Sponsor this event</a>
          </div>
        </div>
      </section>

      {/* PAST */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Recent productions</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PAST.map((e) => (
            <article key={e.title} className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={e.img} alt={e.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-gradient-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">{e.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-bold leading-tight">{e.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{e.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
