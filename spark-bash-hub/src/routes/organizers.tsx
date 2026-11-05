import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin } from "lucide-react";
import { TalantaVideos } from "@/components/TalantaVideos";
import talantaStadium from "@/assets/talanta-stadium.jpg";
import talantaShield from "@/assets/talanta-shield.jpg";
import talantaRoof from "@/assets/talanta-roof.jpg";
import kasaraniInside from "@/assets/match-kasarani-inside.jpg";
import fansKasarani from "@/assets/fans-kasarani.jpg";
import actionLeague from "@/assets/match-action-league.jpg";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Stadiums - Talanta Sports City" },
      { name: "description", content: "Where you can watch Kenyan football: the new Talanta Stadium, Kasarani and Nyayo National Stadium. See the venues and book your seat." },
      { property: "og:title", content: "Stadiums - Talanta Sports City" },
      { property: "og:description", content: "Talanta Stadium, Kasarani and Nyayo - book your seat." },
    ],
  }),
  component: StadiumsPage,
});

const OTHER_VENUES = [
  {
    img: kasaraniInside,
    name: "Kasarani Stadium",
    place: "Nairobi",
    points: ["Home of many league and national-team fixtures", "Large open terraces and covered VIP stand", "Easy access off Thika Road"],
  },
  {
    img: actionLeague,
    name: "Nyayo National Stadium",
    place: "Nairobi",
    points: ["Central Nairobi venue near the CBD", "Regular FKF Premier League matchdays", "Great sightlines close to the pitch"],
  },
  {
    img: fansKasarani,
    name: "Matchday experience",
    place: "Across Kenya",
    points: ["Drums, songs and flags - Kenyan football atmosphere", "Arrive early for the best seats", "Tickets delivered instantly after M-PESA payment"],
  },
];

function StadiumsPage() {
  return (
    <main>
      {/* Talanta hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <img src={talantaStadium} alt="Talanta Stadium, Nairobi" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            <MapPin className="h-3.5 w-3.5" /> Stadiums
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            Talanta Stadium. <span className="text-gradient-ember">Kenya&apos;s new football home.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Newly built in Nairobi, Talanta is a roofed 60,000-seat stadium dressed in a Maasai-shield inspired façade. Pick a fixture and book your seat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">Book a match</Link>
            <Link to="/gallery" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">Stadium gallery</Link>
          </div>
        </div>
      </section>

      {/* Talanta detail */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-primary/30 shadow-glow">
            <img src={talantaShield} alt="The Maasai shield façade of Talanta Stadium" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="grid gap-6">
            <div className="overflow-hidden rounded-3xl border border-primary/30">
              <img src={talantaRoof} alt="Talanta Stadium roof" loading="lazy" className="h-56 w-full object-cover sm:h-64" />
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-6">
              <h2 className="font-display text-2xl font-bold">Why watch at Talanta</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Brand-new, fully roofed 60,000-seat bowl",
                  "Iconic shield design inspired by Kenyan heritage",
                  "Stands for every budget - Regular, Covered, VIP and VVIP",
                  "Book on your phone and pay with M-PESA",
                ].map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <TalantaVideos />
      </section>

      {/* Other venues */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-3xl font-bold">More Kenyan football venues</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {OTHER_VENUES.map((v) => (
            <article key={v.name} className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition hover:border-primary/40 hover:shadow-glow">
              <img src={v.img} alt={v.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{v.place}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{v.name}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {v.points.map((p) => (
                    <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready for <span className="text-gradient-ember">kick-off?</span></h2>
          <p className="mt-4 text-muted-foreground">See the fixtures, pick your stand and be in the stadium.</p>
          <Link to="/events" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember">See fixtures</Link>
        </div>
      </section>
    </main>
  );
}
