import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin, Calendar, ArrowLeft, Loader2, CheckCircle2,
  Smartphone, CreditCard, User, Mail, Phone as PhoneIcon,
  Ticket, ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventRow, BookingRow } from "@/lib/types";

import { FIXTURES_BY_ID, FALLBACK_POSTER } from "@/lib/fixtures";

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/events/$eventId")({
  head: () => ({ meta: [{ title: "Book Match Tickets — Football Arena254" }] }),
  component: EventDetailPage,
});

type Step = "form" | "mpesa" | "waiting" | "done";

const POLL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes

async function api<T>(url: string, init?: RequestInit): Promise<T & { ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, init);
    return (await res.json()) as T & { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." } as T & { ok: boolean; error?: string };
  }
}

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Booking wizard state
  const [step, setStep]         = useState<Step>("form");
  const [bookingId, setBookingId] = useState("");
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRow | null>(null);

  // Form fields
  const [fullName, setFullName]  = useState("");
  const [email,    setEmail]     = useState("");
  const [phone,    setPhone]     = useState("");
  const [tierName, setTierName]  = useState("");
  const [qty,      setQty]       = useState(1);
  const [agreed,   setAgreed]    = useState(false);
  const [creating, setCreating]  = useState(false);

  // Payment
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paying,     setPaying]     = useState(false);
  const [timedOut,   setTimedOut]   = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load the match: built-in fixture first, then the published list from the server ──
  useEffect(() => {
    const fixture = FIXTURES_BY_ID[eventId];
    if (fixture) {
      setEvent(fixture);
      setTierName(fixture.tiers[0]?.name ?? "");
      setLoadingEvent(false);
    }
    fetch("/api/events", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { ok: boolean; events: EventRow[] }) => {
        const found = data.ok && Array.isArray(data.events) ? data.events.find(e => e.id === eventId) : undefined;
        if (found) {
          const tiers = Array.isArray(found.tiers) ? found.tiers : [];
          setEvent({ ...found, tiers });
          setTierName(prev => (tiers.some(t => t.name === prev) ? prev : tiers[0]?.name ?? ""));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvent(false));
  }, [eventId]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Navigate to the ticket once payment is confirmed
  useEffect(() => {
    if (step === "done" && bookingId) {
      const t = setTimeout(() => navigate({ to: "/ticket/$bookingId", params: { bookingId } }), 1800);
      return () => clearTimeout(t);
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
        <h1 className="font-display text-4xl font-bold">Match not found</h1>
        <Link to="/events" className="mt-6 inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Browse fixtures
        </Link>
      </main>
    );
  }

  const tiers      = event.tiers ?? [];
  const selTier    = tiers.find(t => t.name === tierName) ?? tiers[0];
  // Display estimate while filling the form; the authoritative total comes back from the server
  const amount     = serverAmount ?? (selTier?.price ?? 0) * qty;
  const stepIndex  = (["form", "mpesa", "waiting", "done"] as Step[]).indexOf(step);

  // ── Step 1: create the booking on the server (it prices the order) ─────────
  async function handleContinue() {
    if (!fullName.trim()) { toast.error("Enter your full name"); return; }
    if (!email.trim())    { toast.error("Enter your email address"); return; }
    if (!phone.trim())    { toast.error("Enter your phone number"); return; }
    if (!tiers.length || !selTier) { toast.error("No ticket types available"); return; }
    if (!agreed)          { toast.error("Please confirm the details to continue"); return; }

    setCreating(true);
    const data = await api<{ bookingId: string; amount: number; phone: string }>("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId: event!.id, tierName: selTier.name, quantity: qty,
        fullName: fullName.trim(), email: email.trim(), phone: phone.trim(),
      }),
    });
    setCreating(false);

    if (!data.ok) { toast.error(data.error ?? "Could not create your booking"); return; }
    setBookingId(data.bookingId);
    setServerAmount(data.amount);
    setMpesaPhone(data.phone);
    setStep("mpesa");
  }

  // ── Step 2: ask the server to send the M-Pesa prompt (via PayHero) ─────────
  async function handlePay() {
    if (!mpesaPhone.trim()) { toast.error("Enter your M-Pesa phone number"); return; }
    setPaying(true);
    const data = await api<{ alreadySent?: boolean }>("/api/payments/initiate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId, phone: mpesaPhone.trim() }),
    });
    setPaying(false);

    if (!data.ok) { toast.error(data.error ?? "Could not send the M-Pesa prompt"); return; }
    setTimedOut(false);
    setStep("waiting");
    pollForConfirmation(bookingId);
  }

  // ── Step 3: wait for the server-verified result ───────────────────────────
  function pollForConfirmation(bId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      const data = await api<{ booking?: BookingRow }>(`/api/bookings/${bId}`, { cache: "no-store" });

      if (data.ok && data.booking?.status === "paid") {
        clearInterval(pollRef.current!);
        setConfirmedBooking(data.booking);
        setStep("done");
        return;
      }
      if (data.ok && data.booking?.status === "failed") {
        clearInterval(pollRef.current!);
        toast.error("The M-Pesa payment was not completed. You have not been charged — please try again.");
        setStep("mpesa");
        return;
      }
      if (attempts >= MAX_POLLS) {
        clearInterval(pollRef.current!);
        setTimedOut(true);
      }
    }, POLL_MS);
  }

// ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> All fixtures
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* ── Event info ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl overflow-hidden border border-border/60">
            <img src={event.poster_url ?? FALLBACK_POSTER} alt={event.title}
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
                    <CreditCard className="h-5 w-5 text-accent" /> Book your seat
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">Your ticket is issued instantly after M-Pesa payment</p>
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

                <label className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5" />
                  <span>I confirm my details are correct and understand my ticket is issued only after my M-Pesa payment is confirmed.</span>
                </label>

                <button type="button" onClick={handleContinue} disabled={creating}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-bold text-primary-foreground shadow-ember transition hover:shadow-glow text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {creating
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Reserving…</>
                    : <><CreditCard className="h-4 w-4" /> Continue to payment — KES {amount.toLocaleString()}</>}
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
                    <span className="text-muted-foreground">Match</span>
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
                  <span>Do NOT share your M-Pesa PIN with anyone. Football Arena254 will never ask for it.</span>
                </div>

                <button type="button" onClick={handlePay} disabled={paying}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-bold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {paying
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending STK Push…</>
                    : <><Smartphone className="h-4 w-4" /> Send M-Pesa Prompt — KES {amount.toLocaleString()}</>
                  }
                </button>

                <button type="button" onClick={() => { setServerAmount(null); setBookingId(""); setStep("form"); }}
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
                {!timedOut ? (
                  <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-xs text-muted-foreground">
                    Waiting for confirmation… this can take up to a minute. Don&apos;t close this page.
                  </div>
                ) : (
                  <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-xs text-muted-foreground">
                    <p>
                      We haven&apos;t received confirmation yet. <strong className="text-foreground">If M-Pesa already charged you, your ticket will be
                      ready automatically</strong> — open the link below to check. If you cancelled the prompt, you haven&apos;t been charged.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setTimedOut(false); pollForConfirmation(bookingId); }}
                        className="rounded-lg bg-gradient-ember px-3 py-1.5 font-semibold text-primary-foreground">Check again</button>
                      <Link to="/ticket/$bookingId" params={{ bookingId }} className="rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-secondary">Open my ticket page</Link>
                      <button type="button" onClick={() => setStep("mpesa")} className="rounded-lg border border-border px-3 py-1.5 font-semibold hover:bg-secondary">Try again</button>
                    </div>
                    <p>Save this link: <span className="font-mono break-all text-foreground">/ticket/{bookingId}</span></p>
                  </div>
                )}
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
                  <Link to="/ticket/$bookingId" params={{ bookingId }}
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
