import { createFileRoute } from "@tanstack/react-router";
import comrades from "@/assets/comrades-festival.jpg";
import { MapPin, Calendar, ArrowRight, User, Mail, Phone, Users, BookOpen } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/events/$eventId")({
  head: () => ({
    meta: [
      { title: "Event Booking — Ross Ventures Limited" },
      { name: "description", content: "Book your tickets for upcoming events by Ross Ventures Limited" },
    ],
  }),
  component: EventDetailPage,
});

const EVENTS_DB: Record<string, any> = {
  "comrades-festival": {
    id: "comrades-festival",
    img: comrades,
    title: "Comrades Festival 1.0",
    venue: "JKUAT, Juja",
    date: "16 September 2026 · From 2PM",
    copy: "RV Entertainment x JKUSA presents the launch edition of Comrades Festival — cool vibes, music, games and a stage built for the campus crowd.",
    description: "Experience the ultimate campus celebration featuring afro-fusion artists, interactive games, amazing food, and unforgettable vibes. This is the headline event of 2026, bringing together the best of Nairobi's entertainment scene right to your doorstep.",
    highlights: [
      "Live performances by top afro-fusion artists",
      "Interactive games and activities",
      "Food and beverage stations",
      "VIP lounge access",
      "Networking opportunities",
    ],
    tiers: [
      { name: "Early Bird", price: "KES 450", description: "Limited slots available" },
      { name: "Advance", price: "KES 600", description: "Standard entry" },
      { name: "Gate", price: "KES 800", description: "Day-of pricing" },
      { name: "VVIP", price: "KES 2,000", description: "Premium experience" },
    ],
  },
};

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const event = EVENTS_DB[eventId];
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    numberOfTickets: "1",
    ticketType: "Advance",
    message: "",
  });

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold">Event not found</h1>
        <p className="mt-4 text-muted-foreground">The event you're looking for doesn't exist.</p>
      </main>
    );
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission (integrate with backend/email service)
    console.log("Booking submitted:", formData);
    alert("Thank you for your booking! We'll send you a confirmation email shortly.");
    setFormData({ fullName: "", email: "", phone: "", numberOfTickets: "1", ticketType: "Advance", message: "" });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden border border-border/60">
            <img src={event.img} alt={event.title} className="h-96 w-full object-cover" />
          </div>

          <div className="mt-8">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">{event.title}</h1>
            <div className="mt-4 space-y-2">
              <p className="inline-flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="h-5 w-5 text-accent" /> {event.venue}
              </p>
              <p className="inline-flex items-center gap-2 text-lg text-muted-foreground ml-4">
                <Calendar className="h-5 w-5 text-accent" /> {event.date}
              </p>
            </div>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{event.copy}</p>

            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold">About This Event</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <div className="mt-8">
              <h3 className="font-display text-xl font-bold mb-4">Event Highlights</h3>
              <ul className="space-y-3">
                {event.highlights.map((highlight: string) => (
                  <li key={highlight} className="inline-flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="font-display text-xl font-bold mb-4">Ticket Tiers</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {event.tiers.map((tier: any) => (
                  <div key={tier.name} className="rounded-xl border border-border/60 bg-card/60 p-6">
                    <h4 className="font-display font-bold text-lg">{tier.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.description}</p>
                    <p className="mt-3 font-display text-2xl font-bold text-gradient-ember">{tier.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            <h2 className="font-display text-2xl font-bold">Book Your Tickets</h2>
            <p className="mt-2 text-sm text-muted-foreground">Fill in your details to reserve your spot</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                  placeholder="+254 7XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Tickets *</label>
                <select
                  name="numberOfTickets"
                  value={formData.numberOfTickets}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Ticket" : "Tickets"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ticket Type *</label>
                <select
                  name="ticketType"
                  value={formData.ticketType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                >
                  {event.tiers.map((tier: any) => (
                    <option key={tier.name} value={tier.name}>
                      {tier.name} - {tier.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none resize-none"
                  placeholder="Any special requests or questions?"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember transition hover:shadow-glow"
              >
                Complete Booking
              </button>
            </form>

            <div className="mt-6 space-y-3 border-t border-border/30 pt-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">E-ticket & Details</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sent to your email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Group Bookings</p>
                  <p className="text-xs text-muted-foreground mt-0.5">10+ tickets get discounts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Need Help?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Call +254 705 333 198</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
