import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Link2, TrendingUp, Trophy } from "lucide-react";

export const Route = createFileRoute("/ambassadors")({
  head: () => ({
    meta: [
      { title: "Campus Ambassadors — Ross Ventures Limited" },
      { name: "description", content: "Join the RV Entertainment campus ambassador network. Promote Ross Ventures events at your university and earn commission via M-PESA." },
      { property: "og:title", content: "Become an RV Ambassador — Ross Ventures" },
      { property: "og:description", content: "Promote events. Earn commission. Get paid weekly via M-PESA." },
    ],
  }),
  component: AmbassadorsPage,
});

function AmbassadorsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial-glow opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">RV Campus Program</span>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl">
            Hype the night. <span className="text-gradient-ember">Get paid for it.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            If you run things on your campus, the Ross Ventures ambassador network is for you. Promote our events — including <strong className="text-foreground">Comrades Festival 1.0</strong> — with your own trackable link, and we send commission straight to your M-PESA every Friday.
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">Apply to be an ambassador</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Link2, t: "Get your link", d: "Pick events you love. We mint a unique trackable link for you." },
            { icon: TrendingUp, t: "Share it", d: "Drop it on WhatsApp groups, your IG story, your campus page." },
            { icon: Coins, t: "Earn 8–15%", d: "Commission on every ticket bought through your link." },
            { icon: Trophy, t: "Get paid", d: "M-PESA payout every Friday. No minimums under KES 200." },
          ].map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <span className="font-display text-3xl font-bold text-gradient-ember">0{i + 1}</span>
              <span className="mt-3 grid h-10 w-10 place-items-center rounded-xl bg-secondary"><s.icon className="h-5 w-5 text-accent" /></span>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
