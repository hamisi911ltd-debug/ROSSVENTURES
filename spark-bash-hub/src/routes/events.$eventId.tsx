import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin, Calendar, ArrowLeft, Loader2, CheckCircle2,
  Smartphone, CreditCard, User, Mail, Phone as PhoneIcon,
  Ticket, ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventRow, BookingRow } from "@/lib/types";

import comrades from "@/assets/comrades-festival.jpg";
import extravaganza from "@/assets/event-jkuat-extravaganza.png";
import usaniifest from "@/assets/event-usaniifest.png";

// ─── Static events (always available) ────────────────────────────────────────
const STATIC: Record<string, Omit<EventRow, "created_at" | "is_published">> = {
  "comrades-festival": {
    id: "comrades-festival",
    title: "Comrades Festival 1.0",
    venue: "JKUAT, Juja",
    event_date: "16 September 2026 · From 2PM",
    tag: "2026 · Headline",
    description:
      "Experience the ultimate campus celebration featuring afro-fusion artists, interactive games, amazing food, and unforgettable vibes. RV Entertainment × JKUSA.",
    poster_url: comrades,
    tiers: [
      { name: "Early Bird", price: 450, description: "Limited slots available" },
      { name: "Advance",    price: 600, description: "Standard entry" },
      { name: "Gate",       price: 800, description: "Day-of pricing" },
      { name: "VVIP",       price: 2000, description: "Premium experience" },
    ],
  },
  "jkuat-extravaganza": {
    id: "jkuat-extravaganza",
    title: "JKUAT Extravaganza",
    venue: "JKUAT Pavilion Grounds",
    event_date: "27 March 2026 · From 3PM",
    tag: "2026",
    description:
      "Produced with the Office of the Sports & Entertainment Secretary and JKUSA — food, games, art & craft, live performances.",
    poster_url: extravaganza,
    tiers: [
      { name: "Early Bird", price: 300, description: "Limited slots" },
      { name: "Advance",    price: 500, description: "Standard entry" },
      { name: "Gate",       price: 700, description: "Day-of pricing" },
    ],
  },
  "usaniifest": {
    id: "usaniifest",
    title: "UsaniiFest 001",
    venue: "JKUAT Assembly Hall",
    event_date: "6 March 2026 · From 2PM",
    tag: "2026",
    description:
      "STADA-JKUAT presents UsaniiFest in partnership with ArtsyRenaissance — music, food, art & vibes celebrating campus creativity.",
    poster_url: usaniifest,
    tiers: [
      { name: "Early Bird", price: 200, description: "Limited slots" },
      { name: "Standard",   price: 350, description: "General entry" },
    ],
  },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_EVENTS = "rossventures-admin-events";
const LS_BOOKINGS = "rossventures-bookings";

function saveBooking(b: BookingRow) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_BOOKINGS);
    const all: BookingRow[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(x => x.id === b.id);
    if (idx >= 0) all[idx] = b; else all.unshift(b);
    window.localStorage.setItem(LS_BOOKINGS, JSON.stringify(all));
  } catch {}
}

function patchBooking(id: string, patch: Partial<BookingRow>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_BOOKINGS);
    const all: BookingRow[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(x => x.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch };
      window.localStorage.setItem(LS_BOOKINGS, JSON.stringify(all));
    }
  } catch {}
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/events/$eventId")({
  head: () => ({ meta: [{ title: "Purchase Ticket — Ross Ventures Limited" }] }),
  component: EventDetailPage,
});

type Step = "form" | "mpesa" | "waiting" | "done";

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Booking wizard state
  const [step, setStep]         = useState<Step>("form");
  const [bookingId, setBookingId] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRow | null>(null);

  // Form fields
  const [fullName, setFullName]  = useState("");
  const [email,    setEmail]     = useState("");
  const [phone,    setPhone]     = useState("");
  const [tierName, setTierName]  = useState("");
  const [qty,      setQty]       = useState(1);

  // Payment
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paying,     setPaying]     = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load event from three sources ──
  useEffect(() => {
    // 1. Static
    const s = STATIC[eventId];
    if (s) {
      setEvent({ ...s, is_published: true, created_at: "" });
      setTierName(s.tiers[0]?.name ?? "");
      setLoadingEvent(false);
    }

    // 2. Admin localStorage (same device)
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(LS_EVENTS) : null;
      if (raw) {
        const arr = JSON.parse(raw) as any[];
        const found = arr.find((e: any) => e.id === eventId);
        if (found?.title) {
          const tiers = Array.isArray(found.tiers) ? found.tiers : [];
          setEvent({ ...found, tiers, is_published: true, created_at: found.created_at ?? "" });
          if (tiers.length) setTierName(tiers[0].name);
          setLoadingEvent(false);
        }
      }
    } catch {}

    // 3. Server (cross-device)
    fetch("/admin-events")
      .then(r => r.json())
      .then((data: { ok: boolean; events: EventRow[] }) => {
        if (data.ok && Array.isArray(data.events)) {
          const found = data.events.find(e => e.id === eventId);
          if (found) {
            const tiers = Array.isArray(found.tiers) ? found.tiers : [];
            setEvent({ ...found, tiers });
            if (tiers.length) setTierName(tiers[0].name);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvent(false));
  }, [eventId]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Navigate to ticket after success
  useEffect(() => {
    if (step === "done" && bookingId) {
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

  const tiers      = event.tiers ?? [];
  const selTier    = tiers.find(t => t.name === tierName) ?? tiers[0];
  const amount     = (selTier?.price ?? 0) * qty;
  const stepIndex  = (["form", "mpesa", "waiting", "done"] as Step[]).indexOf(step);

  // ── Step 1: Purchase form ──────────────────────────────────────────────────
  function handlePurchase() {
    if (!fullName.trim()) { toast.error("Enter your full name"); return; }
    if (!email.trim())    { toast.error("Enter your email address"); return; }
    if (!phone.trim())    { toast.error("Enter your phone number"); return; }
    if (!tiers.length)    { toast.error("No ticket types available"); return; }

    const bId = crypto.randomUUID();
    const booking: BookingRow = {
      id: bId,
      event_id:    event.id,
      event_title: event.title,
      event_date:  event.event_date,
      event_venue: event.venue,
      full_name:   fullName.trim(),
      email:       email.trim().toLowerCase(),
      phone:       phone.trim(),
      ticket_type:  tierName || tiers[0]?.name || "General",
      ticket_price: selTier?.price ?? 0,
      quantity:    qty,
      amount,
      status:      "pending",
      mpesa_receipt:     null,
      mpesa_checkout_id: null,
      created_at:  new Date().toISOString(),
      paid_at:     null,
    };
    saveBooking(booking);
    setBookingId(bId);
    setConfirmedBooking(booking);
    setMpesaPhone(phone.trim());
    setStep("mpesa");
  }

  // ── Step 2: Send M-Pesa STK Push ──────────────────────────────────────────
  async function handlePay() {
    if (!mpesaPhone.trim()) { toast.error("Enter your M-Pesa phone number"); return; }
    setPaying(true);

    let simulationMode = true;
    try {
      const res = await fetch("/admin-mpesa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, phone: mpesaPhone.trim(), amount }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; simulation?: boolean; error?: string };
        if (data.ok) simulationMode = data.simulation ?? true;
      }
    } catch {}

    setPaying(false);
    setStep("waiting");
    pollForConfirmation(bookingId, simulationMode);
  }

  // ── Step 3: Poll / simulate confirmation ──────────────────────────────────
  function pollForConfirmation(bId: string, isSimulation: boolean) {
    let attempts = 0;
    const MAX = isSimulation ? 4 : 60;

    pollRef.current = setInterval(async () => {
      attempts++;

      if (isSimulation && attempts >= MAX) {
        clearInterval(pollRef.current!);
        confirmBooking(bId, `SIM${Date.now().toString().slice(-8)}`);
        return;
      }

      if (!isSimulation) {
        try {
          const res = await fetch(`/api/bookings/${bId}`);
          if (res.ok) {
            const data = await res.json() as { ok: boolean; booking?: BookingRow };
            if (data.ok && data.booking?.status === "paid") {
              clearInterval(pollRef.current!);
              saveBooking(data.booking);
              setConfirmedBooking(data.booking);
              setStep("done");
              return;
            }
            if (data.ok && data.booking?.status === "failed") {
              clearInterval(pollRef.current!);
              patchBooking(bId, { status: "failed" });
              toast.error("Payment cancelled. Please try again.");
              setStep("mpesa");
              return;
            }
          }
        } catch {}
        if (attempts >= MAX) {
          clearInterval(pollRef.current!);
          toast.error("Payment timed out. Please try again.");
          setStep("mpesa");
        }
      }
    }, 3000);
  }

  function confirmBooking(bId: string, receipt: string) {
    const paid_at = new Date().toISOString();
    const updated: BookingRow = {
      ...(confirmedBooking ?? {
        id: bId, event_id: event.id, event_title: event.title,
        event_date: event.event_date, event_venue: event.venue,
        full_name: fullName, email, phone: mpesaPhone,
        ticket_type: tierName, ticket_price: selTier?.price ?? 0,
        quantity: qty, amount, mpesa_checkout_id: null,
        created_at: new Date().toISOString(),
      } as BookingRow),
      status: "paid",
      mpesa_receipt: receipt,
      paid_at,
    };
    saveBooking(updated);
    patchBooking(bId, { status: "paid", mpesa_receipt: receipt, paid_at });
    setConfirmedBooking(updated);
    setStep("done");
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* ── Event info ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl overflow-hidden border border-border/60">
            <img src={event.poster_url ?? comrades} alt={event.title}
              className="h-72 w-full object-cover sm:h-96" />
          </div>

          <div>
            {event.tag && (
              <span className="inline-block rounded-full bg-accent/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent mb-2">
                {event.tag}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{event.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4">
              {event.venue && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />{event.venue}
                </span>
              )}
              {event.event_date && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-accent" />{event.event_date}
                </span>
              )}
            </div>
            {event.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{event.description}</p>
            )}
          </div>

          {tiers.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Ticket prices</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {tiers.map(t => (
                  <div key={t.name}
                    className={`rounded-xl border p-5 cursor-pointer transition ${tierName === t.name ? "border-accent bg-accent/10" : "border-border/60 bg-card/60 hover:border-accent/40"}`}
                    onClick={() => setTierName(t.name)}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold">{t.name}</h4>
                      {tierName === t.name && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-gradient-ember">KES {t.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Booking panel ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">

            {/* Progress steps */}
            <div className="flex items-center gap-1.5 mb-6">
              {(["form", "mpesa", "waiting", "done"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`h-6 w-6 rounded-full text-[10px] font-bold grid place-items-center transition
                    ${step === s ? "bg-accent text-background" : i < stepIndex ? "bg-accent/40 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Purchase form ── */}
            {step === "form" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" /> Purchase Ticket
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">Fill in your details to buy your ticket</p>
                </div>

                <Field icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
                <Field icon={Mail} label="Email Address" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
                <Field icon={PhoneIcon} label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+254 7XX XXX XXX" />

                {tiers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      <Ticket className="inline h-3 w-3 mr-1" />Ticket type
                    </label>
                    <select value={tierName} onChange={e => setTierName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent">
                      {tiers.map(t => (
                        <option key={t.name} value={t.name}>
                          {t.name} — KES {t.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="h-9 w-9 rounded-xl border border-border bg-background text-lg font-bold flex items-center justify-center hover:bg-secondary">−</button>
                    <span className="flex-1 text-center text-lg font-bold">{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                      className="h-9 w-9 rounded-xl border border-border bg-background text-lg font-bold flex items-center justify-center hover:bg-secondary">+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{tierName || "Ticket"} × {qty}</span>
                    <span className="font-bold text-lg text-accent">KES {amount.toLocaleString()}</span>
                  </div>
                </div>

                <button type="button" onClick={handlePurchase}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-bold text-primary-foreground shadow-ember transition hover:shadow-glow text-sm flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Purchase Ticket — KES {amount.toLocaleString()}
                </button>
              </div>
            )}

            {/* ── STEP 2: M-Pesa payment ── */}
            {step === "mpesa" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-accent" /> Pay via M-Pesa
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">An STK Push will be sent to your phone</p>
                </div>

                {/* Order summary */}
                <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium text-right max-w-[140px] truncate">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attendee</span>
                    <span>{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket</span>
                    <span>{tierName} × {qty}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent text-base">KES {amount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    <Smartphone className="inline h-3 w-3 mr-1" />M-Pesa Phone Number
                  </label>
                  <input type="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)}
                    placeholder="07XX XXX XXX or +254 7XX XXX XXX"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent" />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    You will receive an M-Pesa prompt. Enter your PIN to complete payment.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Do NOT share your M-Pesa PIN with anyone. Ross Ventures will never ask for it.</span>
                </div>

                <button type="button" onClick={handlePay} disabled={paying}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-bold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {paying
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending STK Push…</>
                    : <><Smartphone className="h-4 w-4" /> Send M-Pesa Prompt — KES {amount.toLocaleString()}</>
                  }
                </button>

                <button type="button" onClick={() => setStep("form")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1">
                  ← Edit details
                </button>
              </div>
            )}

            {/* ── STEP 3: Waiting for confirmation ── */}
            {step === "waiting" && (
              <div className="py-10 text-center space-y-5">
                <div className="relative mx-auto h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
                  <div className="absolute inset-0 grid place-items-center">
                    <Smartphone className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">Check your phone</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent an M-Pesa prompt to<br />
                    <strong className="text-foreground">{mpesaPhone}</strong>
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">Enter your M-Pesa PIN to confirm payment of <strong>KES {amount.toLocaleString()}</strong></p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-xs text-muted-foreground">
                  Waiting for confirmation… this can take up to 30 seconds.
                </div>
              </div>
            )}

            {/* ── STEP 4: Done ── */}
            {step === "done" && (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 grid place-items-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-emerald-400">Payment Confirmed!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your ticket is ready</p>
                  {confirmedBooking?.mpesa_receipt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      M-Pesa Receipt: <span className="font-mono font-bold text-foreground">{confirmedBooking.mpesa_receipt}</span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Redirecting to your ticket…</p>
                {bookingId && (
                  <Link to={`/ticket/${bookingId}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-6 py-3 text-sm font-bold text-primary-foreground shadow-ember">
                    <Ticket className="h-4 w-4" /> View My Ticket
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

function Field({ icon: Icon, label, value, onChange, type = "text", placeholder }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
        <Icon className="inline h-3 w-3 mr-1" />{label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent transition" />
    </div>
  );
}
