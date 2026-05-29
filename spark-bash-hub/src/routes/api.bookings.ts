import { createFileRoute, redirect } from "@tanstack/react-router";
import { createBooking, extractKV, getEventById, listBookings } from "@/lib/store";
import type { BookingRow } from "@/lib/types";

export const Route = createFileRoute("/api/bookings")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Admin only: list all bookings
        const kv = extractKV(context);
        const bookings = await listBookings(kv);
        return new Response(JSON.stringify({ ok: true, bookings }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },

      POST: async ({ request, context }) => {
        const kv = extractKV(context);
        try {
          type Body = {
            eventId: string;
            fullName: string;
            email: string;
            phone: string;
            ticketType: string;
            quantity: number;
          };
          const body = await request.json() as Body;
          const { eventId, fullName, email, phone, ticketType, quantity } = body;

          if (!eventId || !fullName || !email || !phone || !ticketType || !quantity) {
            return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
              status: 400,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const event = await getEventById(eventId, kv);
          if (!event) {
            return new Response(JSON.stringify({ ok: false, error: "Event not found" }), {
              status: 404,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const tier = event.tiers.find(t => t.name === ticketType);
          if (!tier) {
            return new Response(JSON.stringify({ ok: false, error: "Invalid ticket type" }), {
              status: 400,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const bookingId = crypto.randomUUID();
          const booking: BookingRow = {
            id: bookingId,
            event_id: eventId,
            event_title: event.title,
            event_date: event.event_date,
            event_venue: event.venue,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            ticket_type: ticketType,
            ticket_price: tier.price,
            quantity: Math.max(1, Math.min(20, quantity)),
            amount: tier.price * Math.max(1, Math.min(20, quantity)),
            status: "pending",
            mpesa_receipt: null,
            mpesa_checkout_id: null,
            created_at: new Date().toISOString(),
            paid_at: null,
          };

          await createBooking(booking, kv);

          return new Response(JSON.stringify({ ok: true, bookingId, amount: booking.amount }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
            status: 500,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
