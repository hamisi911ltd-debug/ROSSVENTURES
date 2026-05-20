import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/ross-ventures-logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ross Ventures Limited" },
      { name: "description", content: "Ross Ventures Limited is a Kenyan marketing agency and event planning company specialising in digital marketing, BTL activations and live events." },
      { property: "og:title", content: "About Ross Ventures Limited" },
      { property: "og:description", content: "Marketing agency. Event planners. Built in Kenya for the culture." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Ross Ventures Limited" className="h-14 w-14 rounded-xl object-contain shadow-ember" />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">About us</span>
      </div>
      <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight">A marketing agency that <span className="text-gradient-ember">throws the party too.</span></h1>
      <div className="prose prose-invert mt-8 max-w-none text-muted-foreground">
        <p className="text-lg">Ross Ventures Limited is a Nairobi-based marketing agency and event planning company. We sit at the intersection of brand strategy and live experience — because in this market, the best campaigns aren't just seen on a screen, they're lived.</p>
        <p className="mt-4">Under our <strong className="text-foreground">RV Entertainment</strong> umbrella, we produce concerts, campus festivals and lifestyle nights. On the agency side, we run digital and BTL campaigns for brands that want to reach Kenya's youth and creative audiences without the corporate filter.</p>
        <p className="mt-4">We've partnered with student bodies like <strong className="text-foreground">JKUSA</strong>, hosted artists and creators including MC Pharaoh and Clinton Chief, and built series like <strong className="text-foreground">UsaniiFest</strong> and the upcoming <strong className="text-foreground">Comrades Festival 1.0</strong> at JKUAT Juja.</p>
        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">What we believe</h2>
        <ul className="mt-3 space-y-2">
          <li><strong className="text-foreground">Culture-first.</strong> Great marketing in Kenya starts with respecting the audience, not talking down to it.</li>
          <li><strong className="text-foreground">Production matters.</strong> Sound, light, gate flow, brand integrations — the details are the brand.</li>
          <li><strong className="text-foreground">One team, three disciplines.</strong> Events, digital and BTL under one roof means no handover gaps.</li>
        </ul>
        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">Get in touch</h2>
        <p className="mt-3">Call or text <a href="tel:+254705333198" className="text-accent hover:underline">+254 705 333 198</a> for partnerships, sponsorships and bookings, or follow us on Instagram <a href="https://instagram.com/rv_entertainment" target="_blank" rel="noreferrer" className="text-accent hover:underline">@rv_entertainment</a>.</p>
      </div>
    </main>
  );
}
