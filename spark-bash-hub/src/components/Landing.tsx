import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Trophy,
  Sparkles,
  Ticket,
  Smartphone,
  ShieldCheck,
  Phone,
  Instagram,
} from "lucide-react";
import { MATCHDAYS, CLUBS, OPENING_MATCH } from "@/lib/league";
import { MatchCard } from "@/components/MatchCard";
import { OpeningMatch } from "@/components/OpeningMatch";
import { TeamCrest } from "@/components/TeamCrest";
import { Squads } from "@/components/Squads";
import { TalantaVideos } from "@/components/TalantaVideos";
import talantaStadium from "@/assets/talanta-stadium.jpg";
import talantaShield from "@/assets/talanta-shield.jpg";
import talantaRoof from "@/assets/talanta-roof.jpg";
import talantaAerial from "@/assets/talanta-aerial.jpg";
import kasaraniInside from "@/assets/match-kasarani-inside.jpg";
import actionGreenYellow from "@/assets/match-action-green-yellow.jpg";
import fansKasarani from "@/assets/fans-kasarani.jpg";
import arenaLogo from "@/assets/football-arena254-logo.svg";

// Hero slideshow - Talanta Stadium first, then matchday shots
const HERO_SLIDES = [talantaStadium, talantaAerial, kasaraniInside];

// Phrases cycled by the typewriter in the hero heading
const TYPEWRITER_PHRASES = [
  "Book your seat at Talanta Stadium.",
  "Kenyan football. Live. In person.",
  "FKF Premier League, every matchday.",
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

const MOMENTS = [
  { img: talantaShield, tag: "Talanta Stadium", title: "The Maasai shield façade", note: "Talanta's signature shield motif up close." },
  { img: talantaAerial, tag: "Talanta Stadium", title: "Nairobi's new football home", note: "The roofed bowl rising above Nairobi." },
  { img: actionGreenYellow, tag: "Matchday", title: "Fifty-fifty", note: "League football, full intensity." },
  { img: fansKasarani, tag: "Fans", title: "Walking in to Kasarani", note: "Fans queue for a Gor Mahia matchday." },
];

export default function Landing() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const { text: heroText, isTyping } = useTypewriter(TYPEWRITER_PHRASES);

  // Hero slideshow - cross-fade every 5s
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

  // The next matchday that still has games to play (falls back to the first listed)
  const next = useMemo(() => {
    const now = Date.now();
    return (
      MATCHDAYS.find((d) => d.matches.some((m) => Date.parse(m.kickoff ?? "") >= now)) ?? MATCHDAYS[0]
    );
  }, []);

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-black">
        <div className="relative">
          {/* Stadium image: full-bleed on desktop, a clear banner on top for phones */}
          <div className="absolute inset-x-0 top-0 h-[56vw] bg-black md:inset-0 md:h-auto">
            <img
              key={slideIdx}
              src={HERO_SLIDES[slideIdx]}
              alt="Talanta Stadium, Nairobi"
              className={`h-full w-full object-contain object-center transition-opacity duration-700 md:object-cover md:object-[50%_45%] ${slideVisible ? "opacity-100" : "opacity-0"}`}
            />
            {/* phones: fade the photo into the page below it */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30 md:hidden" />
            {/* desktop: dark only on the text side so the stadium stays bright on the right */}
            <div className="absolute inset-0 hidden bg-gradient-to-r from-black/90 via-black/55 to-transparent md:block" />
            <div className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-black/85 to-transparent md:block" />
            <div className="absolute bottom-3 right-4 z-10 flex gap-1.5 md:bottom-5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => { setSlideVisible(false); setTimeout(() => { setSlideIdx(i); setSlideVisible(true); }, 300); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-accent" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-[calc(56vw+1.5rem)] md:pb-16 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent backdrop-blur">
                <Trophy className="h-3.5 w-3.5" /> footballarena254.co.ke
              </span>

              <h1 className="mt-4 max-w-3xl min-h-[2.25em] font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:min-h-[2.2em] sm:text-5xl md:text-6xl">
                {heroText}
                <span
                  className={`ml-0.5 inline-block h-[1em] w-[3px] bg-accent align-middle ${isTyping ? "animate-caret-blink" : "opacity-100"}`}
                  aria-hidden="true"
                />
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                Kenya&apos;s home for booking football match tickets - the brand-new 60,000-seat Talanta Stadium and FKF Premier League
                matches across the country, paid securely by M-PESA.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/events"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember transition hover:shadow-glow"
                >
                  <Ticket className="h-4 w-4" /> Book a match
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/organizers"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-black/40 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Explore Talanta Stadium
                </Link>
              </div>
            </div>

            {/* Opening-match card */}
            <Link
              to="/events/$eventId"
              params={{ eventId: OPENING_MATCH.id }}
              className="group block rounded-2xl border border-gold bg-black/65 p-4 shadow-gold backdrop-blur-md transition hover:bg-black/75 sm:p-5 lg:ml-auto lg:max-w-md"
            >
              <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Talanta opening match
              </p>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <TeamCrest name="Bayern Munich" size={52} />
                  <span className="text-xs font-bold">Bayern Munich</span>
                </div>
                <span className="font-display text-lg font-extrabold text-gradient-gold">VS</span>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <TeamCrest name="Ajax" size={52} />
                  <span className="text-xs font-bold">Ajax</span>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-white/75">Tue 5 Jan 2027 · Talanta Stadium, Nairobi</p>
              <span className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-extrabold text-black">
                Book from KES 1,500 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Clubs strip - crests clearly visible */}
        <div className="relative border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">FKF Premier League clubs</p>
            <div className="relative mt-4 overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent" />
              <div className="flex w-max animate-marquee items-center gap-8 py-1">
                {[...CLUBS, ...CLUBS].map((club, idx) => (
                  <div key={idx} className="flex flex-shrink-0 items-center gap-3">
                    <TeamCrest name={club} size={44} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/85">{club}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flag-stripe" />
      </section>

      {/* TALANTA OPENING MATCH - top priority */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <OpeningMatch />
      </section>

      {/* THE TEAMS + THE STADIUM ON VIDEO */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <Squads />
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <TalantaVideos />
      </section>

      {/* NEXT MATCHDAY */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              <CalendarDays className="h-3.5 w-3.5" /> Next up
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Matchday {next.matchday} <span className="text-muted-foreground">of 34</span>
            </h2>
          </div>
          <Link to="/events" className="hidden items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex">
            All fixtures <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {next.matches.map((m) => (
            <MatchCard key={m.id} event={m} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/events" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-6 py-3 text-sm font-semibold hover:bg-secondary">
            See every matchday <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Ticket, t: "Pick your match", d: "Choose a fixture and your stand." },
            { icon: Smartphone, t: "Pay by M-PESA", d: "An STK Push lands on your phone. Enter your PIN and you're done." },
            { icon: ShieldCheck, t: "Show & walk in", d: "Your e-ticket with a QR code is ready instantly for the gate." },
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
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/4]">
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
              <img src={arenaLogo} alt="" className="h-16 w-16" />
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-4xl">
                Booking for a fan club, school or company?
              </h2>
              <p className="mt-4 max-w-md text-sm text-primary-foreground/80">
                Group seats, hospitality and matchday transport - tell us the match and the headcount and we&apos;ll sort the rest.
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
