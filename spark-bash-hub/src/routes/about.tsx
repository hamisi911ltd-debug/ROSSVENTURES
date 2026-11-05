import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/talanta-sports-city-logo.png";
import talantaShield from "@/assets/talanta-shield.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Talanta Sports City" },
      { name: "description", content: "Talanta Sports City makes it easy to book tickets for Kenyan football matches - from the new Talanta Stadium to Kasarani and Nyayo." },
      { property: "og:title", content: "About Talanta Sports City" },
      { property: "og:description", content: "Kenyan football. Booked in minutes." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Talanta Sports City" className="h-14 w-auto object-contain" />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">About us</span>
      </div>
      <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight">Kenyan football, <span className="text-gradient-ember">booked in minutes.</span></h1>

      <div className="mt-8 overflow-hidden rounded-3xl border border-primary/30 shadow-glow">
        <img src={talantaShield} alt="Talanta Stadium, Nairobi" className="h-64 w-full object-cover sm:h-80" />
      </div>

      <div className="mt-8 max-w-none text-muted-foreground">
        <p className="text-lg">Talanta Sports City is a Kenyan match-booking platform. We exist so that getting into a stadium is as easy as sending money on your phone - pick a fixture, choose your stand, pay with M-PESA and your e-ticket is ready.</p>
        <p className="mt-4">With the new <strong className="text-foreground">Talanta Stadium</strong> in Nairobi, Kenyan football has a home that matches the passion of its fans. We bring league games, derbies, cup finals and <strong className="text-foreground">Harambee Stars</strong> internationals together in one place, across Talanta, Kasarani and Nyayo.</p>
        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">What we believe</h2>
        <ul className="mt-3 space-y-2">
          <li><strong className="text-foreground">Fans first.</strong> Fair prices, clear stands and no queues at the gate.</li>
          <li><strong className="text-foreground">Mobile-money native.</strong> Every booking is paid with M-PESA STK Push.</li>
          <li><strong className="text-foreground">Local game, big stage.</strong> From the terraces to VVIP, Kenyan football deserves a first-class matchday.</li>
        </ul>
        <Link to="/events" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember">Book a match</Link>
      </div>
    </main>
  );
}
