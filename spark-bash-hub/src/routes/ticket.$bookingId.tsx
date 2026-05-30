import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Loader2, Download, ArrowLeft, CheckCircle2, MapPin, Calendar,
  Ticket, User, Mail, Phone, Hash,
} from "lucide-react";
import type { BookingRow } from "@/lib/types";
import rossVenturesLogo from "@/assets/ross-ventures-logo.png";

export const Route = createFileRoute("/ticket/$bookingId")({
  head: () => ({ meta: [{ title: "Your Ticket — Ross Ventures Limited" }] }),
  component: TicketPage,
});

const LS_BOOKINGS_KEY = "rossventures-bookings";

function getBookingFromLocalStorage(id: string): BookingRow | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_BOOKINGS_KEY);
    if (!raw) return null;
    const all: BookingRow[] = JSON.parse(raw);
    return Array.isArray(all) ? (all.find(b => b.id === id) ?? null) : null;
  } catch { return null; }
}

function TicketPage() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Try localStorage first (fastest, works without server)
    const local = getBookingFromLocalStorage(bookingId);
    if (local) {
      setBooking(local);
      setLoading(false);
      return;
    }

    // 2. Fall back to server API
    fetch(`/api/bookings/${bookingId}`)
      .then(r => r.json())
      .then((data: { ok: boolean; booking: BookingRow; error?: string }) => {
        if (data.ok) setBooking(data.booking);
        else setError(data.error ?? "Booking not found");
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
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
          <ArrowLeft className="h-4 w-4" /> Browse events
        </Link>
      </main>
    );
  }

  const shortRef = booking.id.slice(0, 8).toUpperCase();
  const isPaid = booking.status === "paid";

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
            <ArrowLeft className="h-4 w-4" /> Back to events
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

          <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600" />

          <div className="bg-[#0a0a0a] px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={rossVenturesLogo} alt="Ross Ventures" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <p className="font-bold text-white leading-none" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <span style={{ color: "#f97316" }}>ROSS</span> Ventures
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Marketing & Event Planners · Kenya</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">E-Ticket</p>
              <p className="font-mono text-sm font-bold text-white mt-0.5">#{shortRef}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a0a00] to-[#0a0a0a] px-6 py-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-orange-400">Event</p>
            <h2 className="mt-1 text-2xl font-bold text-white leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {booking.event_title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4">
              {booking.event_date && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <Calendar className="h-4 w-4 text-orange-400" />{booking.event_date}
                </span>
              )}
              {booking.event_venue && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-orange-400" />{booking.event_venue}
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
              <p className="font-bold text-orange-400 text-lg">KES {booking.amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] px-6 py-5 flex items-center gap-6">
            <QRBlock value={shortRef} />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Booking reference</p>
              <p className="font-mono text-xl font-bold text-white tracking-widest mt-0.5">{shortRef}</p>
              {booking.mpesa_receipt && (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2">M-Pesa receipt</p>
                  <p className="font-mono text-sm font-semibold text-emerald-400">{booking.mpesa_receipt}</p>
                </>
              )}
              <p className="text-[11px] text-gray-500 mt-3">Show this reference at the gate for entry.</p>
            </div>
          </div>

          <div className="bg-[#111] px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-[11px] text-gray-500">+254 705 333 198 · hello@rossventures.co.ke</p>
            <p className="text-[10px] text-gray-600">Issued {new Date(booking.created_at).toLocaleDateString("en-KE")}</p>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3 justify-center">
          <button onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember">
            <Download className="h-4 w-4" /> Save / Print ticket
          </button>
          <Link to="/events" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
            Browse more events
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
  const size = 7;
  const grid = Array.from({ length: size * size }, (_, i) => {
    const x = i % size, y = Math.floor(i / size);
    const isCorner = (x < 2 && y < 2) || (x > size - 3 && y < 2) || (x < 2 && y > size - 3);
    const charCode = value.charCodeAt(i % value.length);
    return isCorner || (charCode + i + x * 3 + y * 7) % 3 === 0;
  });
  return (
    <div className="grid shrink-0 gap-[2px] p-2 bg-white rounded-lg"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 72, height: 72 }}>
      {grid.map((filled, i) => (
        <div key={i} className={`rounded-[1px] ${filled ? "bg-black" : "bg-white"}`} />
      ))}
    </div>
  );
}
