import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Calendar, ArrowLeft, ChevronRight, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventRow, BookingRow } from "@/lib/types";

// ─── localStorage helpers for bookings ───────────────────────────────────────
const LS_BOOKINGS_KEY = "rossventures-bookings";

function saveBookingLocally(booking: BookingRow) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_BOOKINGS_KEY);
    const all: BookingRow[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(b => b.id === booking.id);
    if (idx >= 0) all[idx] = booking; else all.unshift(booking);
    window.localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(all));
  } catch {}
}

function updateBookingLocally(id: string, patch: Partial<BookingRow>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_BOOKINGS_KEY);
    const all: BookingRow[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(b => b.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch };
      window.localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(all));
    }
  } catch {}
}

// Static fallback data (always visible even before admin syncs)
import comrades from "@/assets/comrades-festival.jpg";
import extravaganza from "@/assets/event-jkuat-extravaganza.png";
import usaniifest from "@/assets/event-usaniifest.png";

const STATIC_EVENTS: Record<string, Omit<EventRow, "created_at" | "is_published">> = {
  "comrades-festival": {
    id: "comrades-festival",
    title: "Comrades Festival 1.0",
    venue: "JKUAT, Juja",
    event_date: "16 September 2026 · From 2PM",
    tag: "2026 · Headline",
    description: "Experience the ultimate campus celebration featuring afro-fusion artists, interactive games, amazing food, and unforgettable vibes. RV Entertainment x JKUSA.",
    poster_url: comrades,
    tiers: [
      { name: "Early Bird", price: 450, description: "Limited slots available" },
      { name: "Advance", price: 600, description: "Standard entry" },
      { name: "Gate", price: 800, description: "Day-of pricing" },
      { name: "VVIP", price: 2000, description: "Premium experience" },
    ],
  },
  "jkuat-extravaganza": {
    id: "jkuat-extravaganza",
    title: "JKUAT Extravaganza",
    venue: "JKUAT Pavilion Grounds",
    event_date: "27 March 2026 · From 3PM",
    tag: "2026",
    description: "Produced with the Office of the Sports & Entertainment Secretary and JKUSA — food, games, art & craft, live performances.",
    poster_url: extravaganza,
    tiers: [
      { name: "Early Bird", price: 300, description: "Limited slots" },
      { name: "Advance", price: 500, description: "Standard entry" },
      { name: "Gate", price: 700, description: "Day-of pricing" },
    ],
  },
  "usaniifest": {
    id: "usaniifest",
    title: "UsaniiFest 001",
    venue: "JKUAT Assembly Hall",
    event_date: "6 March 2026 · From 2PM",
    tag: "2026",
    description: "STADA-JKUAT presents UsaniiFest in partnership with ArtsyRenaissance — music, food, art & vibes celebrating campus creativity.",
    poster_url: usaniifest,
    tiers: [
      { name: "Early Bird", price: 200, description: "Limited slots" },
      { name: "Standard", price: 350, description: "General entry" },
    ],
  },
};

export const Route = createFileRoute("/events/$eventId")({
  head: () => ({ meta: [{ title: "Book Tickets — Ross Ventures Limited" }] }),
  component: EventDetailPage,
});

type BookingStep = "details" | "payment" | "processing" | "success";

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [step, setStep] = useState<BookingStep>("details");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingRow | null>(null);

  // Step 1: details form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 2: payment
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [initiating, setInitiating] = useState(false);
  const [simulation, setSimulation] = useState(false);

  // Step 3: polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Load event: static → localStorage → server API
  useEffect(() => {
    // 1. Check static fallback first
    const staticEv = STATIC_EVENTS[eventId];
    if (staticEv) {
      setEvent({ ...staticEv, is_published: true, created_at: "" });
      setTicketType(staticEv.tiers[0]?.name ?? "");
    }

    // 2. Check admin's localStorage (works on same device)
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("rossventures-admin-events") : null;
      if (raw) {
        const all = JSON.parse(raw) as any[];
        const found = all.find((e: any) => e.id === eventId);
        if (found && found.title) {
          const tiers = Array.isArray(found.tiers) ? found.tiers : [];
          setEvent({ ...found, tiers, is_published: true, created_at: found.created_at ?? "" });
          setTicketType(tiers[0]?.name ?? "");
        }
      }
    } catch {}

    // 3. Try the server API (cross-device, picks up synced events)
    fetch(`/api/events?all=1`)
      .then(r => r.json())
      .then((data: { ok: boolean; events: EventRow[] }) => {
        if (data.ok && Array.isArray(data.events)) {
          const found = data.events.find(e => e.id === eventId);
          if (found) {
            const tiers = Array.isArray(found.tiers) ? found.tiers : [];
            setEvent({ ...found, tiers });
            setTicketType(found.tiers[0]?.name ?? "");
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvent(false));
  }, [eventId]);

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => { if (phone && !mpesaPhone) setMpesaPhone(phone); }, [phone, mpesaPhone]);

  if (loadingEvent && !event) {
    return <main className="mx-auto max-w-6xl px-4 py-20 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></main>;
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold">Event not found</h1>
        <Link to="/events" className="mt-6 inline-flex items-center gap-2 text-accent hover:underline"><ArrowLeft className="h-4 w-4" /> Browse events</Link>
      </main>
    );
  }

  const tiers = event?.tiers ?? [];
  const selectedTier = tiers.find(t => t.name === ticketType) ?? tiers[0];
  const totalAmount = (selectedTier?.price ?? 0) * quantity;

  // ─── Step 1: Details form ────────────────────────────────────────────────────
  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Send all event data so the server doesn't need to look it up
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.event_date,
          eventVenue: event.venue,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          ticketType,
          ticketPrice: selectedTier?.price ?? 0,
          quantity,
        }),
      });
      const data = await res.json() as { ok: boolean; bookingId?: string; amount?: number; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Booking failed");

      const bId = data.bookingId!;
      const amount = data.amount ?? (selectedTier?.price ?? 0) * quantity;

      // Save booking locally so the ticket page works without server state
      const localBooking: BookingRow = {
        id: bId,
        event_id: event.id,
        event_title: event.title,
        event_date: event.event_date,
        event_venue: event.venue,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        ticket_type: ticketType,
        ticket_price: selectedTier?.price ?? 0,
        quantity,
        amount,
        status: "pending",
        mpesa_receipt: null,
        mpesa_checkout_id: null,
        created_at: new Date().toISOString(),
        paid_at: null,
      };
      saveBookingLocally(localBooking);

      setBookingId(bId);
      setMpesaPhone(phone);
      setStep("payment");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking. Check your connection.");
    } finally { setSubmitting(false); }
  }

  // ─── Step 2: Initiate M-Pesa ─────────────────────────────────────────────────
  async function initiatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) return;
    const cleanPhone = mpesaPhone.trim();
    if (!cleanPhone) { toast.error("Enter your M-Pesa phone number"); return; }

    setInitiating(true);
    try {
      const res = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, phone: cleanPhone, amount: totalAmount }),
      });
      const data = await res.json() as { ok: boolean; checkoutRequestId?: string; simulation?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Payment initiation failed");

      setSimulation(data.simulation ?? false);
      setStep("processing");
      startPolling(bookingId, data.simulation ?? false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally { setInitiating(false); }
  }

  // ─── Step 3: Poll for payment confirmation ────────────────────────────────────
  function startPolling(bId: string, isSim: boolean) {
    const maxAttempts = isSim ? 5 : 60; // sim: ~15s; real: ~3min
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);
      try {
        const res = await fetch(`/api/bookings/${bId}`);
        const data = await res.json() as { ok: boolean; booking: BookingRow };
        if (data.ok && data.booking.status === "paid") {
          clearInterval(pollRef.current!);
          saveBookingLocally(data.booking);
          setBooking(data.booking);
          setStep("success");
          return;
        }
        if (data.ok && data.booking.status === "failed") {
          clearInterval(pollRef.current!);
          updateBookingLocally(bId, { status: "failed" });
          toast.error("Payment failed or was cancelled. Please try again.");
          setStep("payment");
          return;
        }
        // Simulation: auto-confirm after 3 polls
        if (isSim && attempts >= 3) {
          clearInterval(pollRef.current!);
          const receipt = `SIM${Date.now().toString().slice(-8)}`;
          const paid_at = new Date().toISOString();
          const confirmedBooking: BookingRow = {
            id: bId, event_id: event.id, event_title: event.title,
            event_date: event.event_date, event_venue: event.venue,
            full_name: fullName, email, phone: mpesaPhone,
            ticket_type: ticketType, ticket_price: selectedTier?.price ?? 0,
            quantity, amount: totalAmount, status: "paid",
            mpesa_receipt: receipt,
            mpesa_checkout_id: null, created_at: new Date().toISOString(),
            paid_at,
          };
          // Persist in localStorage so ticket page can read it
          saveBookingLocally(confirmedBooking);
          updateBookingLocally(bId, { status: "paid", mpesa_receipt: receipt, paid_at });
          setBooking(confirmedBooking);
          setStep("success");
          return;
        }
      } catch {}
      if (attempts >= maxAttempts) {
        clearInterval(pollRef.current!);
        toast.error("Payment timeout. Please check your M-Pesa and try again.");
        setStep("payment");
      }
    }, 3000);
  }

  // ─── Step 4: Success — go to ticket ──────────────────────────────────────────
  useEffect(() => {
    if (step === "success" && bookingId) {
      setTimeout(() => navigate({ to: `/ticket/${bookingId}` }), 1500);
    }
  }, [step, bookingId, navigate]);

  // ─── Layout ───────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden border border-border/60">
            <img src={event.poster_url ?? comrades} alt={event.title} className="h-80 w-full object-cover sm:h-96" />
          </div>
          <div className="mt-8 space-y-1">
            {event.tag && <span className="inline-block rounded-full bg-accent/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent">{event.tag}</span>}
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{event.title}</h1>
            <div className="flex flex-wrap gap-4 pt-1">
              <p className="inline-flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-accent" />{event.venue}</p>
              <p className="inline-flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-accent" />{event.event_date}</p>
            </div>
          </div>
          {event.description && <p className="mt-6 text-muted-foreground leading-relaxed">{event.description}</p>}

          <div className="mt-8">
            <h3 className="font-display text-xl font-bold mb-4">Ticket tiers</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {tiers.map(tier => (
                <div key={tier.name} className="rounded-xl border border-border/60 bg-card/60 p-5">
                  <h4 className="font-display font-bold">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-gradient-ember">KES {tier.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(["details", "payment", "processing", "success"] as BookingStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`h-6 w-6 rounded-full text-[10px] font-bold grid place-items-center transition ${step === s ? "bg-accent text-background" : i < (["details","payment","processing","success"].indexOf(step)) ? "bg-accent/30 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>

            {/* ── Step 1: Details ── */}
            {step === "details" && (
              <>
                <h2 className="font-display text-xl font-bold">Book your tickets</h2>
                <p className="mt-1 text-xs text-muted-foreground">Fill in your details to reserve your spot</p>
                <form onSubmit={submitDetails} className="mt-5 space-y-3">
                  <BookingInput label="Full Name *" value={fullName} onChange={setFullName} required placeholder="Your full name" />
                  <BookingInput label="Email *" type="email" value={email} onChange={setEmail} required placeholder="your@email.com" />
                  <BookingInput label="Phone *" type="tel" value={phone} onChange={setPhone} required placeholder="+254 7XX XXX XXX" />
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Ticket type</label>
                    <select value={ticketType} onChange={e => setTicketType(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                      {tiers.map(t => (
                        <option key={t.name} value={t.name}>{t.name} — KES {t.price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
                    <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?"ticket":"tickets"}</option>)}
                    </select>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{ticketType} × {quantity}</span><span className="font-semibold">KES {totalAmount.toLocaleString()}</span></div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full rounded-xl bg-gradient-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Continue to payment
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: Payment ── */}
            {step === "payment" && (
              <>
                <h2 className="font-display text-xl font-bold">Pay with M-Pesa</h2>
                <p className="mt-1 text-xs text-muted-foreground">We'll send an STK Push to your phone</p>
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-medium truncate max-w-[140px]">{event.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ticket</span><span>{ticketType} × {quantity}</span></div>
                  <div className="flex justify-between border-t border-border/30 pt-2 mt-2"><span className="font-semibold">Total</span><span className="font-bold text-accent">KES {totalAmount.toLocaleString()}</span></div>
                </div>
                <form onSubmit={initiatePayment} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">M-Pesa Phone Number</label>
                    <input type="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="07XX XXX XXX" required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                    <p className="mt-1 text-[11px] text-muted-foreground">Enter the number to receive the STK Push prompt</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
                    <Smartphone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>You'll get a prompt on your phone. Enter your M-Pesa PIN to confirm. Do not share your PIN with anyone.</span>
                  </div>
                  <button type="submit" disabled={initiating}
                    className="w-full rounded-xl bg-gradient-ember px-6 py-3 font-semibold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2">
                    {initiating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                    {initiating ? "Sending prompt…" : `Pay KES ${totalAmount.toLocaleString()}`}
                  </button>
                  <button type="button" onClick={() => setStep("details")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                    ← Back to details
                  </button>
                </form>
              </>
            )}

            {/* ── Step 3: Processing ── */}
            {step === "processing" && (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
                <h2 className="font-display text-lg font-bold">Waiting for payment…</h2>
                {simulation ? (
                  <p className="text-sm text-muted-foreground">Simulation mode — auto-confirming in a moment…</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Check your phone <span className="font-medium text-foreground">{mpesaPhone}</span> and enter your M-Pesa PIN</p>
                    <p className="text-xs text-muted-foreground">Checking payment status ({pollCount}s)…</p>
                  </>
                )}
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === "success" && (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 grid place-items-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="font-display text-xl font-bold">Payment confirmed!</h2>
                <p className="text-sm text-muted-foreground">Redirecting to your ticket…</p>
                {booking?.mpesa_receipt && (
                  <p className="text-xs text-muted-foreground">M-Pesa Receipt: <span className="font-mono font-medium text-foreground">{booking.mpesa_receipt}</span></p>
                )}
                {bookingId && (
                  <Link to={`/ticket/${bookingId}`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                    View my ticket →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function BookingInput({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
    </div>
  );
}
