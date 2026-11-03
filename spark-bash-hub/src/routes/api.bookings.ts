import { createFileRoute, redirect } from "@tanstack/react-router";
import { createBooking, getKV, listBookings } from "@/lib/store";
import { resolveEvent } from "@/lib/catalog";
import { isAdminRequest, json } from "@/lib/admin-auth";
import { getEnvVar } from "@/lib/runtime-env";
import { normalizeKenyanPhone } from "@/lib/payhero";
import type { BookingRow } from "@/lib/types";

// Tiny per-isolate throttle so one client can't spam booking creation
const recent = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 15;
}

export const Route = createFileRoute("/api/bookings")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // Admin only - contains customers' names, emails and phone numbers
      GET: async ({ request, context }) => {
        if (!(await isAdminRequest(request))) return json({ ok: false, error: "Unauthorized" }, 401);
        const kv = await getKV(context);
        return json({ ok: true, bookings: await listBookings(kv) });
      },

      // Create a PENDING booking. Price and amount are computed here - never taken from the client.
      POST: async ({ request, context }) => {
        try {
          const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
          if (throttled(ip)) return json({ ok: false, error: "Too many attempts. Please wait a few minutes." }, 429);

          const body = (await request.json()) as {
            eventId?: string; tierName?: string; quantity?: number;
            fullName?: string; email?: string; phone?: string;
          };

          const fullName = String(body.fullName ?? "").trim();
          const email = String(body.email ?? "").trim().toLowerCase();
          const phone = normalizeKenyanPhone(String(body.phone ?? ""));
          const quantity = Math.floor(Number(body.quantity));

          if (fullName.length < 3 || fullName.length > 80) return json({ ok: false, error: "Enter your full name" }, 400);
          if (fullName.split(/\s+/).filter(Boolean).length < 2) return json({ ok: false, error: "Enter your first and last name" }, 400);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return json({ ok: false, error: "Enter a valid email address" }, 400);
          if (!phone) return json({ ok: false, error: "Enter a valid Kenyan phone number (07XX XXX XXX)" }, 400);
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return json({ ok: false, error: "Choose between 1 and 10 tickets" }, 400);

          const found = await resolveEvent(String(body.eventId ?? ""));
          if (!found) return json({ ok: false, error: "This match is not available for booking" }, 404);

          if (found.sample && (await getEnvVar("ALLOW_SAMPLE_FIXTURES")) !== "true") {
            return json({ ok: false, error: "Ticket sales for this fixture have not opened yet. Please check back soon." }, 409);
          }

          const tier = (found.event.tiers ?? []).find((t) => t.name === body.tierName);
          if (!tier || !(Number(tier.price) > 0)) return json({ ok: false, error: "Choose a valid ticket type" }, 400);

          const kv = await getKV(context);
          const price = Math.round(Number(tier.price));
          const booking: BookingRow = {
            id: crypto.randomUUID(),
            event_id: found.event.id,
            event_title: found.event.title,
            event_date: found.event.event_date,
            event_venue: found.event.venue,
            full_name: fullName,
            email,
            phone,
            ticket_type: tier.name,
            ticket_price: price,
            quantity,
            amount: price * quantity,
            status: "pending",
            mpesa_receipt: null,
            mpesa_checkout_id: null,
            created_at: new Date().toISOString(),
            paid_at: null,
            payment_reference: null,
            payment_requested_at: null,
            checked_in_at: null,
          };

          await createBooking(booking, kv);
          return json({ ok: true, bookingId: booking.id, amount: booking.amount, phone });
        } catch {
          return json({ ok: false, error: "We could not create your booking. Please try again." }, 500);
        }
      },
    },
  },
});
