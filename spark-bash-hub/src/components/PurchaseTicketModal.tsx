import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useRef } from "react";
import {
  X, Loader2, CheckCircle2, Smartphone, CreditCard,
  User, Mail, Phone, MapPin, Calendar, Ticket, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { EventRow, BookingRow } from "@/lib/types";
import rossVenturesLogo from "@/assets/ross-ventures-logo.png";

// ─── localStorage helpers ─────────────────────────────────────────────────────
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

type Step = "form" | "mpesa" | "waiting" | "done";

interface Props {
  event: EventRow | null;
  open: boolean;
  onClose: () => void;
}

export function PurchaseTicketModal({ event, open, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [bookingId, setBookingId] = useState("");
  const [receipt, setReceipt] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [tierName, setTierName] = useState("");
  const [qty, setQty]           = useState(1);

  // Payment state
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paying, setPaying]         = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when event changes or modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("form");
        setFullName(""); setEmail(""); setPhone("");
        setQty(1); setMpesaPhone(""); setBookingId(""); setReceipt("");
      }, 300);
    }
    if (open && event) {
      setTierName(event.tiers?.[0]?.name ?? "");
    }
  }, [open, event]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  if (!event) return null;

  const tiers   = event.tiers ?? [];
  const selTier = tiers.find(t => t.name === tierName) ?? tiers[0];
  const amount  = (selTier?.price ?? 0) * qty;
  const stepIdx = (["form", "mpesa", "waiting", "done"] as Step[]).indexOf(step);

  // ── Step 1: Collect details ────────────────────────────────────────────────
  function handlePurchase() {
    if (!fullName.trim()) { toast.error("Enter your full name"); return; }
    if (!email.trim())    { toast.error("Enter your email"); return; }
    if (!phone.trim())    { toast.error("Enter your phone number"); return; }
    if (!tiers.length)    { toast.error("No ticket types set for this event"); return; }

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
    setMpesaPhone(phone.trim());
    setStep("mpesa");
  }

  // ── Step 2: Send M-Pesa STK Push ──────────────────────────────────────────
  async function handlePay() {
    if (!mpesaPhone.trim()) { toast.error("Enter your M-Pesa phone number"); return; }
    setPaying(true);

    let isSimulation = true;
    try {
      const res = await fetch("/admin-mpesa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, phone: mpesaPhone.trim(), amount }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; simulation?: boolean };
        if (data.ok) isSimulation = data.simulation ?? true;
      }
    } catch {}

    setPaying(false);
    setStep("waiting");
    poll(bookingId, isSimulation);
  }

  function poll(bId: string, isSim: boolean) {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;

      // Simulation: auto-confirm after ~12 seconds
      if (isSim && attempts >= 4) {
        clearInterval(pollRef.current!);
        const r = `SIM${Date.now().toString().slice(-8)}`;
        const paid_at = new Date().toISOString();
        patchBooking(bId, { status: "paid", mpesa_receipt: r, paid_at });
        setReceipt(r);
        setStep("done");
        return;
      }

      // Real: poll the server
      if (!isSim) {
        try {
          const res = await fetch(`/api/bookings/${bId}`);
          if (res.ok) {
            const data = await res.json() as { ok: boolean; booking?: BookingRow };
            if (data.ok && data.booking?.status === "paid") {
              clearInterval(pollRef.current!);
              saveBooking(data.booking);
              setReceipt(data.booking.mpesa_receipt ?? "");
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
        if (attempts >= 60) {
          clearInterval(pollRef.current!);
          toast.error("Payment timed out. Please try again.");
          setStep("mpesa");
        }
      }
    }, 3000);
  }

  function viewTicket() {
    if (bookingId) window.location.href = `/ticket/${bookingId}`;
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background border border-border/60 shadow-2xl overflow-hidden focus:outline-none"
          style={{ maxHeight: "92dvh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/60 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <img src={rossVenturesLogo} alt="Ross Ventures" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <Dialog.Title className="font-display font-bold text-sm leading-tight line-clamp-1">
                  {event.title}
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">
                  {event.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" />{event.venue}</span>}
                  {event.event_date && <span className="ml-2 inline-flex items-center gap-1"><Calendar className="h-3 w-3 text-accent" />{event.event_date}</span>}
                </p>
              </div>
            </div>
            <Dialog.Close className="h-8 w-8 rounded-lg border border-border/60 grid place-items-center hover:bg-secondary transition">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 px-6 pt-5 pb-1">
            {(["form", "mpesa", "waiting", "done"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`h-6 w-6 rounded-full text-[10px] font-bold grid place-items-center transition
                  ${step === s ? "bg-accent text-background" : i < stepIdx ? "bg-accent/30 text-accent" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                {i < 3 && <div className={`h-0.5 w-4 rounded ${i < stepIdx ? "bg-accent/40" : "bg-muted"}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {step === "form" ? "Your details" : step === "mpesa" ? "Payment" : step === "waiting" ? "Confirming" : "Done!"}
            </span>
          </div>

          <div className="px-6 pb-6 pt-4">

            {/* ── STEP 1: Form ── */}
            {step === "form" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" /> Purchase Ticket
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Fill in your details to get your ticket</p>
                </div>

                <ModalField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
                <ModalField icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
                <ModalField icon={Phone} label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" />

                {tiers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      <Ticket className="inline h-3 w-3 mr-1" /> Ticket Type
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tiers.map(t => (
                        <button key={t.name} type="button" onClick={() => setTierName(t.name)}
                          className={`rounded-xl border p-3 text-left transition ${tierName === t.name ? "border-accent bg-accent/10" : "border-border/60 hover:border-accent/40"}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{t.name}</span>
                            {tierName === t.name && <span className="h-2 w-2 rounded-full bg-accent" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                          <p className="text-base font-bold text-gradient-ember mt-1">KES {t.price.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="h-10 w-10 rounded-xl border border-border text-xl font-bold grid place-items-center hover:bg-secondary">−</button>
                    <span className="text-2xl font-bold w-8 text-center">{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                      className="h-10 w-10 rounded-xl border border-border text-xl font-bold grid place-items-center hover:bg-secondary">+</button>
                    <span className="text-sm text-muted-foreground">ticket{qty > 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tierName || "Ticket"} × {qty}</span>
                  <span className="text-2xl font-bold text-accent">KES {amount.toLocaleString()}</span>
                </div>

                <button type="button" onClick={handlePurchase}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-4 font-bold text-primary-foreground shadow-ember transition hover:shadow-glow flex items-center justify-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4" />
                  Proceed to Payment — KES {amount.toLocaleString()}
                </button>
              </div>
            )}

            {/* ── STEP 2: M-Pesa ── */}
            {step === "mpesa" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-accent" /> Pay via M-Pesa
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">An STK Push will be sent to your phone</p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2 text-sm">
                  <Row label="Event"  value={event.title} />
                  <Row label="Ticket" value={`${tierName} × ${qty}`} />
                  <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent text-lg">KES {amount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Smartphone className="inline h-3 w-3 mr-1" /> M-Pesa Phone Number
                  </label>
                  <input type="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)}
                    placeholder="07XX XXX XXX  or  +254 7XX XXX XXX"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent" />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">You will receive a PIN prompt. Enter your M-Pesa PIN to pay.</p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  Never share your M-Pesa PIN with anyone. Ross Ventures will never ask for it.
                </div>

                <button type="button" onClick={handlePay} disabled={paying}
                  className="w-full rounded-xl bg-gradient-ember px-6 py-4 font-bold text-primary-foreground shadow-ember disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {paying
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending M-Pesa Prompt…</>
                    : <><Smartphone className="h-4 w-4" /> Send M-Pesa Prompt — KES {amount.toLocaleString()}</>
                  }
                </button>

                <button type="button" onClick={() => setStep("form")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1">
                  ← Edit details
                </button>
              </div>
            )}

            {/* ── STEP 3: Waiting ── */}
            {step === "waiting" && (
              <div className="py-12 text-center space-y-5">
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
                  <div className="absolute inset-0 grid place-items-center">
                    <Smartphone className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">Check your phone</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent an M-Pesa prompt to<br />
                    <strong className="text-foreground">{mpesaPhone}</strong>
                  </p>
                  <p className="mt-3 text-sm font-semibold text-accent">Enter your PIN to pay KES {amount.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-xs text-muted-foreground">
                  Waiting for confirmation… this usually takes 10–30 seconds.
                </div>
              </div>
            )}

            {/* ── STEP 4: Done ── */}
            {step === "done" && (
              <div className="py-10 text-center space-y-5">
                <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500/20 grid place-items-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-emerald-400">Payment Confirmed!</p>
                  <p className="text-sm text-muted-foreground mt-1">Your ticket for <strong>{event.title}</strong> is ready.</p>
                  {receipt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      M-Pesa Receipt: <span className="font-mono font-bold text-foreground">{receipt}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={viewTicket}
                    className="w-full rounded-xl bg-gradient-ember px-6 py-3.5 font-bold text-primary-foreground shadow-ember flex items-center justify-center gap-2 text-sm">
                    <Ticket className="h-4 w-4" /> View & Download Ticket
                  </button>
                  <button type="button" onClick={onClose}
                    className="w-full rounded-xl border border-border px-6 py-3 text-sm hover:bg-secondary">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalField({ icon: Icon, label, value, onChange, type = "text", placeholder }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        <Icon className="inline h-3 w-3 mr-1" />{label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[180px] truncate">{value}</span>
    </div>
  );
}
