import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ross Ventures Limited" },
      { name: "description", content: "Get in touch with Ross Ventures Limited for event planning, digital marketing, BTL activations, sponsorships and partnerships in Kenya." },
      { property: "og:title", content: "Contact Ross Ventures Limited" },
      { property: "og:description", content: "Sponsorships, bookings and partnerships — call +254 705 333 198." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">Get in touch</span>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight">Let's build the <span className="text-gradient-ember">next big one.</span></h1>
          <p className="mt-4 text-muted-foreground">Sponsorships, event bookings, marketing briefs or partnership ideas — we usually respond within one working day.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Phone className="h-4 w-4 text-accent" /></span> <a href="tel:+254705333198" className="hover:text-foreground">+254 705 333 198</a></li>
            <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Mail className="h-4 w-4 text-accent" /></span> <a href="mailto:hello@rossventures.co.ke" className="hover:text-foreground">hello@rossventures.co.ke</a></li>
            <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Instagram className="h-4 w-4 text-accent" /></span> <a href="https://instagram.com/rv_entertainment" target="_blank" rel="noreferrer" className="hover:text-foreground">@rv_entertainment</a></li>
            <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><MapPin className="h-4 w-4 text-accent" /></span> Nairobi, Kenya</li>
          </ul>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-card-soft"
        >
          <div className="grid gap-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Name</span>
              <input className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30" placeholder="Your name" />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Email or phone</span>
              <input className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30" placeholder="you@example.com or +254…" />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">What's this about?</span>
              <select className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30">
                <option>Event planning</option>
                <option>Digital marketing</option>
                <option>BTL activation</option>
                <option>Sponsorship / partnership</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Tell us more</span>
              <textarea rows={5} className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30" placeholder="Brief, dates, budget range, anything useful…" />
            </label>
            <button type="submit" className="rounded-xl bg-gradient-ember px-5 py-3 text-sm font-semibold text-primary-foreground shadow-ember">Send message</button>
          </div>
        </form>
      </div>
    </main>
  );
}
