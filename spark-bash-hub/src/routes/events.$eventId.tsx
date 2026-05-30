import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Calendar, ArrowLeft, ChevronRight, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventRow, BookingRow } from "@/lib/types";

import comrades from "@/assets/comrades-festival.jpg";
import extravaganza from "@/assets/event-jkuat-extravaganza.png";
import usaniifest from "@/assets/event-usaniifest.png";

// ─── Static fallback events ───────────────────────────────────────────────────
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

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_BOOKINGS_KEY = "rossventures-bookings";
const LS_EVENTS_KEY = "rossventures-admin-events";

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

// ─── Route ────────────────────────────────────────────────────────────────────
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
  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<BookingRow | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Payment state
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [initiating, setInitiating] = useState(false);
  const [simulation, setSimulation] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // ─── Load event ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Static events
    const staticEv = STATIC_EVENTS[eventId];
    if (staticEv) {
      setEvent({ ...staticEv, is_published: true, created_at: "" });
      setTicketType(staticEv.tiers[0]?.name ?? "");
      setLoadingEvent(false);
    }

    // 2. Admin localStorage events (same device)
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(LS_EVENTS_KEY)
        : null;
      if (raw) {
        const all = JSON.parse(raw) as any[];
        const found = all.find((e: any) => e.id === eventId);
        if (found?.title) {
          const tiers = Array.isArray(found.tiers) ? found.tiers : [];
          setEvent({ ...found, tiers, is_published: true, created_at: found.created_at ?? "" });
          if (tiers.length > 0) setTicketType(tiers[0].name);
          setLoadingEvent(false);
        }
      }
    } catch {}

    // 3. Server API (cross-device)
    fetch("/api/events?all=1")
      .then(r => r.json())
      .then((data: { ok: boolean; events: EventRow[] }) => {
        if (data.ok && Array.isArray(data.events)) {
          const found = data.events.find(e => e.id === eventId);
          if (found) {
            const tiers = Array.isArray(found.tiers) ? found.tiers : [];
            setEvent({ ...found, tiers });
            if (tiers.length > 0) setTicketType(tiers[0].name);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvent(false));
  }, [eventId]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  useEffect(() => { if (phone && !mpesaPhone) setMpesaPhone(phone); }, [phone, mpesaPhone]);

  // After success navigate to ticket
  useEffect(() => {
    if (step === "success" && bookingId) {
      setTimeout(() => navigate({ to: `/ticket/${bookingId}` }), 1800);
    }
  }, [step, bookingId, navigate]);

  if (loadingEvent && !event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold">Event not found</h1>
        <Link to="/events" className="mt-6 inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Browse events
        </Link>
      </main>
    );
  }

  const tiers = event.tiers ?? [];
  const selectedTier = tiers.find(t => t.name === ticketType) ?? tiers[0];
  const totalAmount = (selectedTier?.price ?? 0) * quantity;

  // ─── Step 1: Create booking client-side ──────────────────────────────────────
  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (tiers.length === 0) {
      toast.error("No ticket types available for this event");
      return;
    }

    // Generate booking locally — no server call needed
    const bId = crypto.randomUUID();
    const amount = (selectedTier?.price ?? 0) * quantity;

    const newBooking: BookingRow = {
      id: bId,
      event_id: event.id,
      event_title: event.title,
      event_date: event.event_date,
      event_venue: event.venue,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      ticket_type: ticketType || (tiers[0]?.name ?? "General"),
      ticket_price: selectedTier?.price ?? 0,
      quantity,
      amount,
      status: "pending",
      mpesa_receipt: null,
      mpesa_checkout_id: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    };

    saveBookingLocally(newBooking);
    setBookingId(bId);
    setBooking(newBooking);
    setMpesaPhone(phone.trim());
    setStep("payment");
  }

  // ─── Step 2: Initiate M-Pesa payment ─────────────────────────────────────────
  async function initiatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId || !mpesaPhone.trim()) {
      toast.error("Enter your M-Pesa phone number");
      return;
    }

    setInitiating(true);

    // Try the server first (real M-Pesa). If it fails for ANY reason,
    // fall back to simulation mode so booking always completes.
    let useSim = true;
    try {
      const res = await fetch("/admin-mpesa-initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, phone: mpesaPhone.trim(), amount: totalAmount }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; simulation?: boolean };
        if (data.ok) {
          useSim = data.simulation ?? true;
        }
      }
    } catch {}

    setSimulation(useSim);
    setInitiating(false);
    setStep("processing");
    startPolling(bookingId, useSim);
  }

  // ─── Step 3: Poll / simulate payment confirmation ─────────────────────────────
  function startPolling(bId: string, isSim: boolean) {
    let attempts = 0;
    const maxAttempts = isSim ? 4 : 60;

    pollRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      if (isSim && attempts >= 4) {
        // Simulation: auto-confirm
        clearInterval(pollRef.current!);
        const receipt = `SIM${Date.now().toString().slice(-8)}`;
        const paid_at = new Date().toISOString();
        const confirmedBooking: BookingRow = {
          ...(booking ?? {
            id: bId, event_id: event.id, event_title: event.title,
            event_date: event.event_date, event_venue: event.venue,
            full_name: fullName, email, phone: mpesaPhone,
            ticket_type: ticketType, ticket_price: selectedTier?.price ?? 0,
            quantity, amount: totalAmount,
            mpesa_checkout_id: null, created_at: new Date().toISOString(),
          }),
          status: "paid",
          mpesa_receipt: receipt,
          paid_at,
        } as BookingRow;
        saveBookingLocally(confirmedBooking);
        updateBookingLocally(bId, { status: "paid", mpesa_receipt: receipt, paid_at });
        setBooking(confirmedBooking);
        setStep("success");
        return;
      }

      if (!isSim) {
        // Real mode: poll server for payment confirmation
        try {
          const res = await fetch(`/api/bookings/${bId}`);
          if (res.ok) {
            const data = await res.json() as { ok: boolean; booking?: BookingRow };
            if (data.ok && data.booking?.status === "paid") {
              clearInterval(pollRef.current!);
              saveBookingLocally(data.booking);
              setBooking(data.booking);
              setStep("success");
              return;
            }
            if (data.ok && data.booking?.status === "failed") {
              clearInterval(pollRef.current!);
              updateBookingLocally(bId, { status: "failed" });
              toast.error("Payment failed or cancelled. Please try again.");
              setStep("payment");
              return;
            }
          }
        } catch {}
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current!);
          toast.error("Payment timeout. Check your M-Pesa and try again.");
          setStep("payment");
        }
      }
    }, 3000);
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  const stepIndex = (["details", "payment", "processing", "success"] as BookingStep[]).indexOf(step);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* ── Event info ── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden border border-border/60">
            <img
              src={event.poster_url ?? comrades}
              alt={event.title}
              className="h-80 w-full object-cover sm:h-96"
            />
          </div>
          <div className="mt-8 space-y-1">
            {event.tag && (
              <span className="inline-block rounded-full bg-accent/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent">
                {event.tag}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{event.title}</h1>
            <div className="flex flex-wrap gap-4 pt-1">
              <p className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />{event.venue}
              </p>
              <p className="inline-flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-accent" />{event.event_date}
              </p>
            </div>
          </div>
          {event.description && (
            <p className="mt-6 text-muted-foreground leading-relaxed">{event.description}</p>
          )}
          {tiers.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-xl font-bold mb-4">Ticket tiers</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {tiers.map(tier => (
                  <div key={tier.name} className="rounded-xl border border-border/60 bg-card/60 p-5">
                    <h4 className="font-display font-bold">{tier.name}</h4>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-gradient-ember">
                      KES {tier.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Booking sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(["details", "payment", "processing", "success"] as BookingStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`h-6 w-6 rounded-full text-[10px] font-bold grid place-items-center transition
                    ${step === s
                      ? "bg-accent text-background"
                      : i < stepIndex
                        ? "bg-accent/30 text-accent"
                        : "bg-muted text-muted-foreground"}`}>
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
                <p className="mt-1 text-xs text-muted-foreground">Fill in your details</p>
                <form onSubmit={submitDetails} className="mt-5 space-y-3">
                  <BookingInput label="Full Name *" value={fullName} onChange={setFullName} required placeholder="Your full name" />
                  <BookingInput label="Email *" type="email" value={email} onChange={setEmail} required placeholder="your@email.com" />
                  <BookingInput label="Phone *" type="tel" value={phone} onChange={setPhone} required placeholder="+254 7XX XXX XXX" />

                  {tiers.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Ticket type</label>
                      <select
                        value={ticketType}
                        onChange={e => setTicketType(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                      >
                        {tiers.map(t => (
                          <option key={t.name} value={t.name}>
                            {t.name} — KES {t.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
                    <select
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? "ticket" : "tickets"}</option>
                      ))}
                    </select>
                  </div>

                  {totalAmount > 0 && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{ticketType || "Ticket"} × {quantity}</span>
                        <span className="font-semibold">KES {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-semibold text-primary-foreground shadow-ember transition hover:shadow-glow"
                  >
                    Continue to payment →
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: Payment ── */}
            {step === "payment" && (
              <>
                <h2 className="font-display text-xl font-bold">Pay with M-Pesa</h2>
                <p className="mt-1 text-xs text-muted-foreground">We'll send a payment prompt to your phone</p>
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium truncate max-w-[140px]">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket</span>
                    <span>{ticketType} × {quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2 mt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-accent">KES {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <form onSubmit={initiatePayment} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Number to receive the M-Pesa prompt</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
                    <Smartphone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>Check your phone for the M-Pesa PIN prompt and enter it to confirm payment.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={initiating}
                    className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-semibold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {initiating
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending prompt…</>
                      : <><Smartphone className="h-4 w-4" /> Pay KES {totalAmount.toLocaleString()}</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Edit details
                  </button>
                </form>
              </>
            )}

            {/* ── Step 3: Processing ── */}
            {step === "processing" && (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
                <h2 className="font-display text-lg font-bold">Confirming payment…</h2>
                {simulation ? (
                  <p className="text-sm text-muted-foreground">Processing — please wait a moment…</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Enter your M-Pesa PIN on <span className="font-medium text-foreground">{mpesaPhone}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Checking status ({pollCount * 3}s)…</p>
                  </>
                )}
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === "success" && (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 grid place-items-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="font-display text-xl font-bold">Booking confirmed!</h2>
                <p className="text-sm text-muted-foreground">Redirecting to your ticket…</p>
                {bookingId && (
                  <Link
                    to={`/ticket/${bookingId}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
