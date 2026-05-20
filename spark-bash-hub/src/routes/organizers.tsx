import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, PartyPopper, Megaphone, Globe, Camera, Users, Calendar } from "lucide-react";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Services — Ross Ventures Limited" },
      { name: "description", content: "Event planning, digital marketing and BTL activations by Ross Ventures Limited. We produce concerts, campus festivals and brand experiences across Kenya." },
      { property: "og:title", content: "Services — Ross Ventures Limited" },
      { property: "og:description", content: "Event planning, digital marketing and BTL activations across Kenya." },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  {
    icon: PartyPopper,
    title: "Event Planning & Production",
    points: [
      "Concerts, festivals and campus nights",
      "Brand launches and corporate functions",
      "Venue sourcing, artist liaison, technical production",
      "Ticketing partnerships and gate management",
    ],
  },
  {
    icon: Globe,
    title: "Digital Marketing",
    points: [
      "Social media strategy and content calendars",
      "Paid media on Meta, TikTok and Google",
      "Influencer & creator partnerships",
      "Reporting dashboards you can actually read",
    ],
  },
  {
    icon: Megaphone,
    title: "BTL Marketing",
    points: [
      "Activations, roadshows and product sampling",
      "Branded experiential installations",
      "Mall, market and campus activations",
      "Field teams trained on your brand voice",
    ],
  },
  {
    icon: Camera,
    title: "Content Production",
    points: [
      "Event recap videos and aftermovies",
      "Photography and reel content",
      "Brand-ready creative assets",
    ],
  },
  {
    icon: Users,
    title: "Influencer & Talent Sourcing",
    points: [
      "MCs, DJs and live acts",
      "Niche creators across campus and lifestyle",
      "End-to-end booking and contracting",
    ],
  },
  {
    icon: Calendar,
    title: "Sponsorship Activation",
    points: [
      "Brand-safe integration into our events",
      "Custom on-ground activations for partners",
      "Measurable reach and engagement reporting",
    ],
  },
];

function ServicesPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial-glow opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">Our Services</span>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl">
            Strategy, production, <span className="text-gradient-ember">execution.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Ross Ventures Limited is a Kenyan marketing agency built around three things we do exceptionally well: events, digital, and on-ground activations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">Request a proposal</Link>
            <Link to="/events" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/40 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-secondary">See past work</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border/60 bg-card/60 p-6 transition hover:border-primary/40 hover:shadow-glow">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-ember shadow-ember"><s.icon className="h-5 w-5 text-primary-foreground" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready to <span className="text-gradient-ember">make it happen?</span></h2>
          <p className="mt-4 text-muted-foreground">Share your brief — we'll come back with a creative direction, timeline and quote within 48 hours.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember">Start a project</Link>
        </div>
      </section>
    </main>
  );
}
