import { useState, useEffect } from "react";
import type { EventRow } from "@/lib/types";
import { PurchaseTicketModal } from "@/components/PurchaseTicketModal";
import comrades from "@/assets/comrades-festival.jpg";
import usaniifest from "@/assets/event-usaniifest.png";
import extravaganza from "@/assets/event-jkuat-extravaganza.png";
import adani from "@/assets/event-adani-chill.png";
import jkuatTakeover from "@/assets/event-jkuat-takeover.png";
import culturJkuat from "@/assets/event-cultur-jkuat.png";
import extravaganzaMejja from "@/assets/event-extravaganza-mejja.png";
import jkuatFreshers from "@/assets/jkuat-freshers-night.svg";
import mrMissJkuat from "@/assets/mr-miss-jkuat-awards.svg";
import fyndrPoster from "@/assets/fyndr-poster.svg";
import freshazNight from "@/assets/jkuat-freshaz-night.svg";
import rossVenturesLogo from "@/assets/ross-ventures-logo.png";
import culturFmLogo from "@/assets/cultur-fm-logo.jpeg";
import jkuatGotTalentLogo from "@/assets/jkuat-got-talent-logo.jpeg";
import jkuatLogo from "@/assets/jkuat-logo.jpeg";
import jkusaLogo from "@/assets/jkusa-logo.jpeg";
import safaricomLogo from "@/assets/safaricom-logo.jpeg";
import steamLogo from "@/assets/steam-logo.jpeg";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Users,
  Sparkles,
  CheckCircle2,
  MapPin,
  Phone,
  Instagram,
} from "lucide-react";

const partnerLogos = [
  { name: "Cultur FM", img: culturFmLogo },
  { name: "JKUAT Got Talent", img: jkuatGotTalentLogo },
  { name: "JKUAT", img: jkuatLogo },
  { name: "JKUSA", img: jkusaLogo },
  { name: "Safaricom", img: safaricomLogo },
  { name: "Steam", img: steamLogo },
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

const heroPosters = [
  {
    img: jkuatFreshers,
    title: "JKUAT Freshers Night",
    note: "26 Sept 2025 · JKUAT Main Campus headline show featuring MC Pharaoh and DJ Davir.",
  },
  {
    img: mrMissJkuat,
    title: "Mr & Miss JKUAT Awards",
    note: "12 Dec 2025 · Pavilion JKUAT — stage awards, student hosts and live performances.",
  },
  {
    img: fyndrPoster,
    title: "Fyndr Brand Launch",
    note: "A brand lifestyle activation, campaign creatives and app launch energy.",
  },
  {
    img: freshazNight,
    title: "JKUAT Freshaz Night",
    note: "A student celebration with DJs, performances and campus culture moments.",
  },
];

// Static fallback events shown when no admin events exist
const STATIC_UPCOMING = [
  { id: "comrades-festival", img: comrades, title: "Comrades Festival 1.0", date: "16 September 2026", venue: "JKUAT, Juja", desc: "Afro-fusion artists, games and cool vibes for the campus crowd" },
  { id: "jkuat-extravaganza", img: extravaganza, title: "JKUAT Extravaganza", date: "27 March 2026", venue: "JKUAT Pavilion Grounds", desc: "Food, games, art & craft with the Office of the Sports & Entertainment Secretary" },
  { id: "usaniifest", img: usaniifest, title: "UsaniiFest 001", date: "6 March 2026", venue: "JKUAT Assembly Hall", desc: "Music, food, art & vibes celebrating campus creativity" },
];

const ADMIN_STORAGE_KEY = "rossventures-admin-events";

function getLocalStorageEvents(): EventRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((e: any) => e.is_published && e.title)
          .map((e: any) => ({
            ...e,
            tiers: Array.isArray(e.tiers) ? e.tiers : [],
          }))
      : [];
  } catch { return []; }
}

export default function Landing() {
  const [dynamicEvents, setDynamicEvents] = useState<EventRow[]>([]);
  const [modalEvent, setModalEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    // 1. Immediately show admin's localStorage events (same device)
    const local = getLocalStorageEvents();
    if (local.length > 0) setDynamicEvents(local);

    // 2. Server API — reads from Cloudflare CDN cache (shared across all devices)
    fetch("/admin-events", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { ok: boolean; events: EventRow[] }) => {
        if (data.ok && Array.isArray(data.events) && data.events.length > 0) {
          // Merge: server events take precedence, but include local-only ones too
          const serverIds = new Set(data.events.map(e => e.id));
          const localOnly = local.filter(e => !serverIds.has(e.id));
          setDynamicEvents([...data.events, ...localOnly]);
        }
      })
      .catch(() => {}); // silently keep localStorage events on error
  }, []);
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none">
            <img
              src={rossVenturesLogo}
              alt="Ross Ventures logo background"
              className="opacity-20 w-32 sm:w-44 md:w-56 lg:w-72 xl:w-80 object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-radial-glow opacity-10" />
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
            <Sparkles className="h-3.5 w-3.5" /> Book the next event
          </span>

          <h1 className="mt-4 max-w-4xl font-display text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-6xl">
            Lit upcoming events to book.
          </h1>

          <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Ross Ventures Limited is a full-service event production and marketing agency built in Kenya and made for the culture. We specialize in creating unforgettable experiences—from intimate campus activations to headline festivals—combining creative excellence with audience reach. With expertise in event planning, digital marketing, and on-ground activations, we turn visions into reality with energy, authenticity, and impact.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-4 py-2 sm:px-6 sm:py-3.5 text-sm font-semibold text-primary-foreground shadow-card-soft transition hover:shadow-ember animate-float"
            >
              Become a partner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/events"
              className="inline-flex w-full sm:w-auto items-center gap-2 rounded-xl border border-border/80 bg-background/40 px-4 py-2 sm:px-6 sm:py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-secondary justify-center"
            >
              See our events
            </Link>
          </div> 

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Brands and people we&apos;ve worked with
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 justify-items-stretch sm:grid-cols-3 lg:grid-cols-6 items-center">
              {partnerLogos.map((partner, idx) => (
                <div key={partner.name} title={partner.name} className="flex w-full items-center justify-center">
                  {idx < 4 ? (
                    <div className="h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-full bg-background/80">
                      <img
                        src={partner.img}
                        alt={partner.name}
                        className="h-full w-full object-cover transition hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <img
                      src={partner.img}
                      alt={partner.name}
                      className="max-h-10 sm:max-h-12 w-auto object-contain opacity-90 transition hover:opacity-100"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <dl className="mt-10 hidden md:grid max-w-2xl grid-cols-3 gap-6">
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

      {/* UPCOMING EVENTS TO BOOK */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <CalendarDays className="h-3.5 w-3.5" /> Book Now
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Upcoming events to book</h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(dynamicEvents.length > 0
            ? dynamicEvents.slice(0, 6).map(e => ({
                eventObj: e,
                id: e.id,
                img: e.poster_url ?? comrades,
                title: e.title,
                date: e.event_date,
                venue: e.venue,
                desc: (e.description ?? "").slice(0, 100),
              }))
            : STATIC_UPCOMING.map(s => ({
                eventObj: {
                  id: s.id, title: s.title, venue: s.venue, event_date: s.date,
                  description: s.desc, tag: "", poster_url: s.img,
                  is_published: true, created_at: "",
                  tiers: [
                    { name: "Early Bird", price: 450, description: "Limited slots" },
                    { name: "Advance",    price: 600, description: "Standard entry" },
                    { name: "Gate",       price: 800, description: "Day-of pricing" },
                  ],
                } as EventRow,
                ...s,
              }))
          ).map((ev) => (
            <div key={ev.id}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-2 hover:border-primary/40 hover:shadow-glow cursor-pointer"
              onClick={() => setModalEvent(ev.eventObj)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={ev.img} alt={ev.title} loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold leading-tight">{ev.title}</h3>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-accent" /> {ev.date}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" /> {ev.venue}
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">{ev.desc}</p>
                <button type="button"
                  onClick={e => { e.stopPropagation(); setModalEvent(ev.eventObj); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-4 py-2 text-sm font-bold text-primary-foreground shadow-ember transition hover:shadow-glow">
                  Purchase Ticket <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Purchase Ticket Modal */}
      <PurchaseTicketModal
        event={modalEvent}
        open={modalEvent !== null}
        onClose={() => setModalEvent(null)}
      />

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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-hero-soft p-10 shadow-card-soft sm:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight sm:text-4xl">
                Have an event or a brand to launch?
              </h2>
              <p className="mt-4 max-w-md text-sm text-primary-foreground/80">
                Tell us the vision. We'll bring the production, the audience and the energy.
              </p> 
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <a
                href="https://wa.me/254705333198?text=Hi%20Ross%20Ventures%2C%20I%20have%20an%20event%20or%20brand%20launch%20idea.%20Let%27s%20talk."
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center gap-2 rounded-xl bg-foreground px-3 py-2 sm:px-6 sm:py-3.5 text-sm font-semibold text-background transition hover:opacity-90 justify-center"
              >
                <Phone className="h-4 w-4" /> WhatsApp us
              </a>
              <a
                href="https://instagram.com/rv_entertainment"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center gap-2 rounded-xl border border-foreground/30 bg-foreground/10 px-3 py-2 sm:px-6 sm:py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-foreground/20 justify-center"
              >
                <Instagram className="h-4 w-4" /> Follow @rv_entertainment
              </a>
              <a
                href="https://www.tiktok.com/@rv_entertainment"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center gap-2 rounded-xl border border-foreground/30 bg-foreground/10 px-3 py-2 sm:px-6 sm:py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-foreground/20 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="currentColor" d="M16.5 6.5v4.1c0 1.1-.9 2-2 2-1.1 0-2-.9-2-2V7c.6.2 1.2.3 1.9.3 0 0 .1 0 .1 0V6.5h.1c.4 0 .8-.1 1.1-.3zM19 8.3c-.3.1-.6.1-.9.1-.3 0-.5-.1-.8-.1v6.1c0 2.9-2.4 5.3-5.3 5.3-2.9 0-5.3-2.4-5.3-5.3S9.1 9 12 9c.2 0 .4 0 .6.0v2.2c-.2 0-.4 0-.6 0-1.7 0-3 1.4-3 3.1s1.3 3.1 3 3.1 3-1.4 3-3.1V8.3h.4c.4 0 .8 0 1.2-.1v-1.2c-.4.1-.8.2-1.2.2z"/>
                </svg>
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
