import { useState, useEffect, useRef } from "react";
import type { EventRow } from "@/lib/types";
import { FIXTURES, FALLBACK_POSTER } from "@/lib/fixtures";
import talantaStadium from "@/assets/talanta-stadium.jpg";
import talantaShield from "@/assets/talanta-shield.jpg";
import talantaRoof from "@/assets/talanta-roof.jpg";
import talantaAerial from "@/assets/talanta-aerial.jpg";
import kasaraniInside from "@/assets/match-kasarani-inside.jpg";
import actionGreenYellow from "@/assets/match-action-green-yellow.jpg";
import fansKasarani from "@/assets/fans-kasarani.jpg";
import arenaLogo from "@/assets/football-arena254-logo.svg";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Trophy,
  Ticket,
  Smartphone,
  ShieldCheck,
  MapPin,
  Phone,
  Instagram,
} from "lucide-react";

// Hero slideshow — Talanta Stadium first, then matchday shots
const HERO_SLIDES = [talantaStadium, talantaAerial, talantaShield, talantaRoof, kasaraniInside];

// Phrases cycled by the typewriter in the hero heading
const TYPEWRITER_PHRASES = [
  "Book your seat at Talanta Stadium.",
  "Kenyan football. Live. In person.",
  "Derbies, league nights, Harambee Stars.",
  "Pay by M-PESA. Walk in with your ticket.",
  "Be there when Kenya's new home opens.",
];

function useTypewriter(phrases: string[], typingSpeed = 55, deleteSpeed = 30, pauseMs = 2200) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIdx];

    if (phase === "typing") {
      if (text.length < current.length) {
        frameRef.current = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        frameRef.current = setTimeout(() => setPhase("pausing"), pauseMs);
      }
    } else if (phase === "pausing") {
      frameRef.current = setTimeout(() => setPhase("deleting"), 0);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        frameRef.current = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
      } else {
        setPhraseIdx((i) => (i + 1) % phrases.length);
        setPhase("typing");
      }
    }

    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [text, phase, phraseIdx, phrases, typingSpeed, deleteSpeed, pauseMs]);

  return { text, isTyping: phase === "typing" };
}

// Clubs and competitions shown in the marquee
const CLUBS = [
  "Harambee Stars", "Gor Mahia", "AFC Leopards", "Tusker FC", "KCB FC", "Kakamega Homeboyz",
  "Bandari FC", "Kenya Police FC", "Sofapaka", "FKF Premier League", "Super Cup", "Talanta Stadium",
];

const MOMENTS = [
  { img: talantaShield, tag: "Talanta Stadium", title: "The Maasai shield façade", note: "Talanta's signature shield motif up close." },
  { img: talantaAerial, tag: "Talanta Stadium", title: "Nairobi's new football home", note: "The roofed bowl rising above Nairobi." },
  { img: actionGreenYellow, tag: "Matchday", title: "Fifty-fifty", note: "League football, full intensity." },
  { img: fansKasarani, tag: "Fans", title: "Walking in to Kasarani", note: "Fans queue for a Gor Mahia matchday." },
];

export default function Landing() {
  const [dynamicEvents, setDynamicEvents] = useState<EventRow[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const { text: heroText, isTyping } = useTypewriter(TYPEWRITER_PHRASES);

  // Hero slideshow — cross-fade every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setSlideIdx((i) => (i + 1) % HERO_SLIDES.length);
        setSlideVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Published matches from the admin panel win; otherwise show the built-in fixtures
  const matches = dynamicEvents.length > 0 ? dynamicEvents : FIXTURES;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Slideshow background */}
        <div className="absolute inset-0">
          <img
            key={slideIdx}
            src={HERO_SLIDES[slideIdx]}
            alt=""
            aria-hidden="true"
            className={`h-full w-full object-cover object-center transition-opacity duration-700 ${slideVisible ? "opacity-100" : "opacity-0"}`}
          />
          {/* Dark veil so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/90" />
          {/* Slide dots */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => { setSlideVisible(false); setTimeout(() => { setSlideIdx(i); setSlideVisible(true); }, 300); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-accent" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Accent light overlays */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-10 top-16 h-32 w-32 rounded-full bg-accent/15 blur-3xl animate-sparkle" />
          <div className="absolute right-12 top-24 h-24 w-24 rounded-full bg-crimson/20 blur-3xl animate-sparkle" />
          <div className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-spotlight-sweep" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:pt-10 md:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent backdrop-blur animate-ticket-slide">
            <Trophy className="h-3.5 w-3.5" /> footballarena254.co.ke
          </span>

          {/* Typewriter heading */}
          <h1 className="mt-4 max-w-4xl min-h-[2.4em] font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:min-h-[2.2em] sm:text-5xl md:text-6xl">
            {heroText}
            <span
              className={`ml-0.5 inline-block h-[1em] w-[3px] bg-accent align-middle ${isTyping ? "animate-caret-blink" : "opacity-100"}`}
              aria-hidden="true"
            />
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            Football Arena254 is Kenya&apos;s home for booking football match tickets. Get your seat at the brand-new,
            60,000-seat Talanta Stadium and at Kasarani and Nyayo — league fixtures, cup finals and Harambee Stars
            internationals, all paid securely by M-PESA.
          </p>

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card-soft transition hover:shadow-ember animate-float sm:px-6 sm:py-3.5"
            >
              <Ticket className="h-4 w-4" /> Book a match
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/organizers"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto sm:px-6 sm:py-3.5"
            >
              Explore Talanta Stadium
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Clubs &amp; competitions you can book
            </p>
            {/* Infinite horizontal marquee */}
            <div className="relative mt-4 overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black/60 to-transparent" />
              <div className="flex w-max animate-marquee items-center gap-3 py-1">
                {[...CLUBS, ...CLUBS].map((club, idx) => (
                  <span
                    key={idx}
                    className="flex-shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/85 backdrop-blur"
                  >
                    {club}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flag-stripe" />
      </section>

      {/* TALANTA SPOTLIGHT */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 shadow-glow">
          <img src={talantaAerial} alt="Aerial view of the new Talanta Stadium in Nairobi" loading="lazy" className="h-[22rem] w-full object-cover sm:h-[30rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-ember px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
              <MapPin className="h-3.5 w-3.5" /> Nairobi · Newly built
            </span>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Talanta Stadium — Kenya&apos;s new home of football
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              A fully roofed, 60,000-seat bowl wrapped in Maasai-shield inspired design. Be among the first to watch a
              match here — pick your stand and book in under two minutes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-3 text-sm font-semibold text-primary-foreground shadow-ember">
                See Talanta fixtures <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/gallery" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
                Stadium gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING MATCHES TO BOOK */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <CalendarDays className="h-3.5 w-3.5" /> Book Now
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Upcoming matches</h2>
          </div>
          <Link to="/events" className="hidden items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex">
            All fixtures <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 6).map((ev) => (
            <Link
              key={ev.id}
              to="/events/$eventId"
              params={{ eventId: ev.id }}
              className="group block overflow-hidden rounded-xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={ev.poster_url ?? FALLBACK_POSTER}
                  alt={ev.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                {ev.tag && (
                  <span className="absolute left-2 top-2 rounded-full bg-gradient-ember px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
                    {ev.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight">{ev.title}</h3>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 text-accent" /> {ev.event_date}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-accent" /> {ev.venue}
                </p>
                <span className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-ember px-3 py-2 text-xs font-bold text-primary-foreground shadow-ember transition group-hover:shadow-glow">
                  Book Tickets <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Ticket, t: "Pick your match", d: "Choose a fixture and your stand — Regular, Covered, VIP or VVIP." },
            { icon: Smartphone, t: "Pay by M-PESA", d: "An STK Push lands on your phone. Enter your PIN and you're done." },
            { icon: ShieldCheck, t: "Show & walk in", d: "Your e-ticket with a reference number is ready instantly for the gate." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <span className="font-display text-3xl font-bold text-gradient-ember">0{i + 1}</span>
              <span className="mt-3 grid h-10 w-10 place-items-center rounded-xl bg-secondary"><s.icon className="h-5 w-5 text-accent" /></span>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MATCHDAY MOMENTS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <Trophy className="h-3.5 w-3.5" /> Matchday moments
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Feel the atmosphere</h2>
          </div>
          <Link to="/gallery" className="hidden items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex">
            Full gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MOMENTS.map((e) => (
            <article
              key={e.title}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-card-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={e.img} alt={e.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded-full bg-gradient-ember px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-ember">
                  {e.tag}
                </span>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight">{e.title}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{e.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-hero-soft p-10 shadow-card-soft sm:p-14">
          <img src={talantaRoof} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-crimson/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <img src={arenaLogo} alt="" className="h-14 w-14" />
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-4xl">
                Booking for a fan club, school or company?
              </h2>
              <p className="mt-4 max-w-md text-sm text-primary-foreground/80">
                Group seats, hospitality and matchday transport — tell us the match and the headcount and we&apos;ll sort the rest.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <a
                href="https://wa.me/254705333198?text=Hi%20Football%20Arena254%2C%20I%27d%20like%20to%20book%20group%20tickets."
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 sm:w-auto"
              >
                <Phone className="h-4 w-4" /> WhatsApp us
              </a>
              <a
                href="https://instagram.com/footballarena254"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-foreground/30 bg-foreground/10 px-4 py-3 text-sm font-semibold backdrop-blur transition hover:bg-foreground/20 sm:w-auto"
              >
                <Instagram className="h-4 w-4" /> @footballarena254
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
