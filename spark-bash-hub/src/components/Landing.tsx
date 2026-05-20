import comrades from "@/assets/comrades-festival.jpg";
import usaniifest from "@/assets/event-usaniifest.png";
import extravaganza from "@/assets/event-jkuat-extravaganza.png";
import adani from "@/assets/event-adani-chill.png";
import jkuatTakeover from "@/assets/event-jkuat-takeover.png";
import culturJkuat from "@/assets/event-cultur-jkuat.png";
import extravaganzaMejja from "@/assets/event-extravaganza-mejja.png";
import planners from "@/assets/team-planners.png";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Megaphone,
  PartyPopper,
  Globe,
  Users,
  Sparkles,
  CheckCircle2,
  MapPin,
  Phone,
  Instagram,
  PlayCircle,
  Handshake,
} from "lucide-react";

const services = [
  {
    icon: PartyPopper,
    title: "Event Planning",
    desc: "Concerts, festivals, campus nights, brand launches and private functions — produced end-to-end by a team that lives for showtime.",
  },
  {
    icon: Globe,
    title: "Digital Marketing",
    desc: "Social campaigns, influencer activations, paid media and content production that puts your brand in front of the right audience.",
  },
  {
    icon: Megaphone,
    title: "BTL Marketing",
    desc: "Below-the-line activations, roadshows, sampling and on-ground experiences that turn passers-by into loyal customers.",
  },
];

const portfolio = [
  {
    img: comrades,
    tag: "2026 · Headline",
    title: "Comrades Festival 1.0",
    venue: "JKUAT Juja · 16 Sep 2026",
    note: "RV Entertainment x JKUSA — afro-fusion artists, games and cool vibes for the campus crowd.",
  },
  {
    img: extravaganza,
    tag: "2026",
    title: "JKUAT Extravaganza",
    venue: "JKUAT Pavilion Grounds · 27 Mar 2026",
    note: "Produced with the Office of the Sports & Entertainment Secretary and JKUSA — food, games, art & craft.",
  },
  {
    img: usaniifest,
    tag: "2026",
    title: "UsaniiFest 001",
    venue: "JKUAT Assembly Hall · 6 Mar 2026",
    note: "STADA-JKUAT presents UsaniiFest in partnership with ArtsyRenaissance — music, food, art & vibes.",
  },
  {
    img: adani,
    tag: "Recent",
    title: "Adani Chill & Vibe",
    venue: "Club 033, Juja · 16 May",
    note: "Music by MC Pharaoh, hosted by Clinton Chief Yokabiso. Twerk competition, muratina & live vibes.",
  },
  {
    img: jkuatTakeover,
    tag: "Cultur FM",
    title: "JKUAT Takeover",
    venue: "JKUAT Main Campus · 5–6 May",
    note: "Cultur FM x Ross Ventures — two-day campus takeover with the Cultur FM collective.",
  },
  {
    img: culturJkuat,
    tag: "Cultur FM",
    title: "Cultur FM is Coming to JKUAT",
    venue: "JKUAT · 5–6 May",
    note: "Afro music is the future. Nairobi DJs rule the world — Cultur FM always wins.",
  },
  {
    img: extravaganzaMejja,
    tag: "2026 · Guest",
    title: "JKUAT Extravaganza ft. Mejja",
    venue: "JKUAT Assembly Hall · 18 Apr 2026",
    note: "Office of the Sports & Entertainment Secretary x JKUSA — guest artist Mejja, from 5PM till late.",
  },
];

const partners = [
  "JKUSA",
  "JKUAT",
  "STADA-JKUAT",
  "ArtsyRenaissance",
  "Cultur FM",
  "Club 033",
  "Office of the Sports & Entertainment Secretary",
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-hero-soft" />
          <div className="absolute inset-0 bg-hero-veil opacity-55" />
          <div className="absolute inset-0 bg-radial-glow opacity-50" />
          {/* Event planning light and confetti accents */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-16 h-32 w-32 rounded-full bg-accent/15 blur-3xl animate-sparkle" />
            <div className="absolute right-12 top-24 h-24 w-24 rounded-full bg-primary/10 blur-3xl animate-sparkle" />
            <div className="absolute left-16 top-40 h-20 w-20 rounded-full border border-accent/10 opacity-40" />
            <div className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-spotlight-sweep" />
            <span className="absolute left-12 top-12 h-2 w-2 rounded-full bg-accent animate-confetti" style={{ animationDelay: "0s" }} />
            <span className="absolute left-32 top-28 h-2 w-2 rounded-full bg-primary animate-confetti" style={{ animationDelay: "1.3s" }} />
            <span className="absolute right-24 top-20 h-2 w-2 rounded-full bg-foreground animate-confetti" style={{ animationDelay: "2.2s" }} />
            <span className="absolute right-16 top-48 h-2 w-2 rounded-full bg-accent animate-confetti" style={{ animationDelay: "3.7s" }} />
            <span className="absolute left-1/2 top-32 h-2 w-2 rounded-full bg-primary animate-confetti" style={{ animationDelay: "5.1s" }} />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pt-10 md:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent backdrop-blur animate-ticket-slide">
            <Sparkles className="h-3.5 w-3.5" /> Ross Ventures Limited · Nairobi, Kenya
          </span>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Event planning, marketing, concerts and consultation — full‑service production for live events, campus activations and brand experiences.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From campus festivals and concerts to digital activations and roadshows — Ross Ventures brings strategy, production, and audience energy together.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card-soft transition hover:shadow-ember animate-float"
            >
              Become a partner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-secondary"
            >
              See our events
            </Link>
          </div>

          {/* Partner / brands strip */}
          <div className="mt-8 rounded-2xl border border-border/50 bg-background/40 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Brands, partners and people we've worked with
            </p>
            <div className="mt-4 flex flex-wrap items-stretch gap-3">
              {partners.map((p) => {
                const stopwords = ["of", "the", "and", "&", "for"];
                const parts = p.split(/\s+/).filter((w) => !stopwords.includes(w.toLowerCase()));
                const initials = parts.length
                  ? parts.slice(0, 2).map((s) => s[0]).join("")
                  : p.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={p}
                    title={p}
                    className="group flex min-w-[180px] max-w-xs items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3 transition hover:scale-105 hover:shadow-glow"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary-foreground shadow-card-soft">
                      {initials.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-sm font-bold text-foreground break-words leading-tight">{p}</div>
                      <div className="text-[11px] text-muted-foreground">Partner</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { k: "50+", v: "events delivered" },
              { k: "1.7K+", v: "monthly reach" },
              { k: "3", v: "core service lines" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-bold text-gradient-ember sm:text-4xl">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            What we do
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Three disciplines. <span className="text-gradient-ember">One creative engine.</span></h2>
          <p className="mt-4 text-muted-foreground">We blend event production, digital strategy and on-ground activation under one roof — so your campaign doesn't get lost between agencies.</p>
        </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
          {services.map((s, idx) => (
            <article 
              key={s.title} 
                  className="group rounded-2xl border border-border/60 bg-card/60 p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-soft"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-ember shadow-ember animate-sparkle">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <Link to="/organizers" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent transition group-hover:gap-2">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED EVENT — COMRADES FESTIVAL */}
      <section className="relative overflow-hidden border-y border-border/60 bg-card/40 py-12">
        <div className="absolute inset-0 bg-radial-glow opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-ember opacity-20 blur-3xl" />
            <img
              src={comrades}
              alt="Comrades Festival 1.0 poster — RV Entertainment x JKUSA"
              className="relative w-full rounded-3xl border border-border/60 object-cover shadow-glow"
              width={900}
              height={1100}
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <CalendarDays className="h-3.5 w-3.5" /> Headline event · 2026
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Comrades Festival <span className="text-gradient-ember">1.0</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              In partnership with <strong className="text-foreground">JKUSA</strong>, RV Entertainment presents the launch edition of Comrades Festival — a full-day celebration of music, games and culture for the Kenyan campus community. Cool vibes. Live performances. Memories worth showing up for.
            </p>
            <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> JKUAT, Juja</li>
              <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> 16th September 2026, from 2PM</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Early Bird KES 450</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Advance KES 600 · Gate KES 800</li>
              <li className="flex items-center gap-2 sm:col-span-2"><CheckCircle2 className="h-4 w-4 text-accent" /> VVIP KES 2,000 — limited tickets</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember">
                Get tickets <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="tel:+254705333198" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-secondary">
                <Phone className="h-4 w-4" /> Sponsorships: +254 705 333 198
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <Users className="h-3.5 w-3.5" /> Selected work
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Events we've made happen</h2>
          </div>
          <Link to="/events" className="hidden items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-4xl mx-auto">
          {portfolio.map((e) => (
            <article
              key={e.title}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={e.img}
                  alt={e.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded-full bg-gradient-ember px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
                  {e.tag}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-display text-sm font-bold leading-tight line-clamp-2">{e.title}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{e.venue}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SHOWREEL */}
      <section className="border-y border-border/60 bg-card/40 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <PlayCircle className="h-3.5 w-3.5" /> From the ground
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">A look inside our productions</h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-primary/30 shadow-glow">
            <video
              src="/events/showreel.mp4"
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black object-cover"
            />
          </div>
        </div>
      </section>

      {/* THE PEOPLE BEHIND ROSS VENTURES */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-ember opacity-20 blur-3xl" />
            <img
              src={planners}
              alt="The Ross Ventures planning team and partner network"
              className="relative w-full rounded-3xl border border-border/60 object-cover shadow-glow"
              width={900}
              height={1100}
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <Handshake className="h-3.5 w-3.5" /> The team
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              The planners <span className="text-gradient-ember">and the network</span> behind the shows.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ross Ventures is led by a small, hands-on team of event producers and marketers — and powered by deep relationships with student leaders, university offices, artists, MCs, venue owners and brand partners across Kenya.
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" /> Direct partnerships with JKUSA, STADA-JKUAT and the Office of the Sports & Entertainment Secretary.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" /> A trusted roster of hosts and performers including MC Pharaoh, Clinton Chief, ArtsyCulture The Band and more.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" /> Working relationships with venues, vendors and sponsors across Juja, Nairobi and beyond.</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember">
                Meet the team <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-secondary">
                <Phone className="h-4 w-4" /> Partner with us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="border-y border-border/60 bg-card/40 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              Why Ross Ventures
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Built in Kenya. <span className="text-gradient-ember">Made for the culture.</span></h2>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Concept to gate", d: "We handle creative direction, production, ticketing partnerships and on-ground execution." },
              { n: "02", t: "Campus & creative reach", d: "Strong partnerships with student bodies like JKUSA and a homegrown influencer network." },
              { n: "03", t: "Brand-safe activations", d: "Sponsorship integrations designed to actually move product, not just place a logo." },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border border-border/60 bg-background/60 p-6 transition hover:border-primary/40">
                <span className="font-display text-3xl font-bold text-gradient-ember">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-hero-soft p-10 shadow-card-soft sm:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
                Have an event or a brand to launch?
              </h2>
              <p className="mt-4 max-w-md text-primary-foreground/80">
                Tell us the vision. We'll bring the production, the audience and the energy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Phone className="h-4 w-4" /> Talk to our team
              </Link>
              <a
                href="https://instagram.com/rv_entertainment"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-foreground/30 bg-foreground/10 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-foreground/20"
              >
                <Instagram className="h-4 w-4" /> Follow @rv_entertainment
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
