import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Loader2, Download, ArrowLeft, CheckCircle2, MapPin, Calendar,
  Ticket, User, Mail, Phone, Hash,
} from "lucide-react";
import type { BookingRow } from "@/lib/types";
import arenaLogo from "@/assets/talanta-sports-city-logo.png";

export const Route = createFileRoute("/ticket/$bookingId")({
  head: () => ({ meta: [{ title: "Your Match Ticket - Talanta Sports City" }] }),
  component: TicketPage,
});

function TicketPage() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // The server is the only source of truth. While payment is pending, keep re-checking.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      try {
        const r = await fetch(`/api/bookings/${bookingId}`, { cache: "no-store" });
        const data = (await r.json()) as { ok: boolean; booking: BookingRow; error?: string };
        if (cancelled) return;
        if (data.ok) {
          setBooking(data.booking);
          setError(null);
          if (data.booking.status === "pending") timer = setTimeout(load, 4000);
        } else {
          setError(data.error ?? "Booking not found");
        }
      } catch {
        if (!cancelled) setError("Failed to load booking");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [bookingId]);

  function handleDownload() {
    window.print();
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground text-sm">Loading your ticket…</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-destructive">{error ?? "Ticket not found"}</p>
        <Link to="/events" className="mt-4 inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Browse fixtures
        </Link>
      </main>
    );
  }

  if (booking.status !== "paid") {
    const pending = booking.status === "pending";
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8">
          {pending ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" /> : null}
          <h1 className="mt-4 font-display text-2xl font-bold">
            {pending ? "Waiting for your payment" : booking.status === "failed" ? "Payment not completed" : "Booking cancelled"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pending
              ? "This is not a valid ticket yet. As soon as your M-Pesa payment is confirmed it will appear here automatically - you can keep this page open."
              : "No ticket has been issued for this booking. If you were charged, contact us with your M-Pesa message and we will sort it out."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{booking.event_title} · {booking.ticket_type} × {booking.quantity} · KES {booking.amount.toLocaleString()}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/events" className="rounded-xl bg-gradient-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground">Browse fixtures</Link>
            <a href="tel:+254705333198" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">Call support</a>
          </div>
        </div>
      </main>
    );
  }

  const shortRef = booking.id.slice(0, 8).toUpperCase();
  const isPaid = true;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket-printable, #ticket-printable * { visibility: visible !important; }
          #ticket-printable { position: fixed; inset: 0; margin: auto; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="no-print flex items-center justify-between mb-8">
          <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to fixtures
          </Link>
          <button onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-4 py-2 text-sm font-semibold text-primary-foreground shadow-ember">
            <Download className="h-4 w-4" /> Download ticket
          </button>
        </div>

        {isPaid ? (
          <div className="no-print flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 mb-6 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">Payment confirmed</p>
              {booking.mpesa_receipt && <p className="text-muted-foreground text-xs">M-Pesa Receipt: {booking.mpesa_receipt}</p>}
            </div>
          </div>
        ) : (
          <div className="no-print flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-6 text-sm">
            <p className="text-amber-400 font-semibold">Status: {booking.status}</p>
          </div>
        )}

        {/* ─── THE TICKET ────────────────────────────────────────── */}
        <div id="ticket-printable" ref={ticketRef}
          className="relative rounded-3xl overflow-hidden border border-primary/30 bg-card shadow-glow"
          style={{ fontFamily: "Inter, sans-serif" }}>

          <div className="h-2 w-full bg-gradient-to-r from-black via-red-600 to-green-600" />

          <div className="bg-[#0a0a0a] px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={arenaLogo} alt="Talanta Sports City" className="h-10 w-auto object-contain" />
              <div>
                <p className="font-bold text-white leading-none" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <span style={{ color: "#22c55e" }}>ARENA</span> 254
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Kenyan Football Match Tickets</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">E-Ticket</p>
              <p className="font-mono text-sm font-bold text-white mt-0.5">#{shortRef}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#03140a] to-[#0a0a0a] px-6 py-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-green-400">Match</p>
            <h2 className="mt-1 text-2xl font-bold text-white leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {booking.event_title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4">
              {booking.event_date && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <Calendar className="h-4 w-4 text-green-400" />{booking.event_date}
                </span>
              )}
              {booking.event_venue && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-green-400" />{booking.event_venue}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex items-center px-4 bg-[#111]">
            <div className="absolute left-0 -ml-4 h-8 w-8 rounded-full bg-background" />
            <div className="flex-1 border-t-2 border-dashed border-white/10" />
            <div className="absolute right-0 -mr-4 h-8 w-8 rounded-full bg-background" />
          </div>

          <div className="bg-[#111] px-6 py-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            <TicketField icon={Ticket} label="Ticket type" value={booking.ticket_type} />
            <TicketField icon={Hash} label="Quantity" value={`${booking.quantity} ticket${booking.quantity > 1 ? "s" : ""}`} />
            <TicketField icon={User} label="Name" value={booking.full_name} />
            <TicketField icon={Mail} label="Email" value={booking.email} />
            <TicketField icon={Phone} label="Phone" value={booking.phone} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Amount paid</p>
              <p className="font-bold text-green-400 text-lg">KES {booking.amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] px-6 py-5 flex items-center gap-6">
            <QRBlock value={`AR254-${shortRef}`} />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Booking reference</p>
              <p className="font-mono text-xl font-bold text-white tracking-widest mt-0.5">{shortRef}</p>
              {booking.mpesa_receipt && (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2">M-Pesa receipt</p>
                  <p className="font-mono text-sm font-semibold text-emerald-400">{booking.mpesa_receipt}</p>
                </>
              )}
              <p className="text-[11px] text-gray-500 mt-3">Show this reference at the gate for entry. Each ticket can be scanned in once.</p>
            </div>
          </div>

          <div className="bg-[#111] px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-[11px] text-gray-500">+254 705 333 198</p>
            <p className="text-[10px] text-gray-600">Issued {new Date(booking.created_at).toLocaleDateString("en-KE")}</p>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3 justify-center">
          <button onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember">
            <Download className="h-4 w-4" /> Save / Print ticket
          </button>
          <Link to="/events" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
            Browse more matches
          </Link>
        </div>
        <p className="no-print mt-4 text-center text-xs text-muted-foreground">
          Screenshot or print this ticket. Show the reference number at the gate.
        </p>
      </main>
    </>
  );
}

function TicketField({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1">
        <Icon className="h-3 w-3" />{label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-white truncate">{value}</p>
    </div>
  );
}

function QRBlock({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((m) => m.toDataURL(value, { margin: 1, width: 192, errorCorrectionLevel: "M" }))
      .then((url) => { if (!cancelled) setSrc(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [value]);

  return (
    <div className="grid shrink-0 place-items-center rounded-lg bg-white p-1.5" style={{ width: 96, height: 96 }}>
      {src ? <img src={src} alt={`Ticket QR ${value}`} width={84} height={84} /> : <Loader2 className="h-5 w-5 animate-spin text-black/40" />}
    </div>
  );
}
