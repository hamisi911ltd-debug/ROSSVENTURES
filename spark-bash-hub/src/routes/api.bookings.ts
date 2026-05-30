import { createFileRoute, redirect } from "@tanstack/react-router";
import { createBooking, extractKV, listBookings } from "@/lib/store";
import type { BookingRow } from "@/lib/types";

export const Route = createFileRoute("/api/bookings")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ context }) => {
        const kv = extractKV(context);
        const bookings = await listBookings(kv);
        return new Response(JSON.stringify({ ok: true, bookings }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },

      POST: async ({ request, context }) => {
        const kv = extractKV(context);
        try {
          // Accept all event + booking data from the client.
          // We do NOT look up the event server-side because events live in
          // localStorage (admin's browser) and may not be in the server store.
          type Body = {
            eventId: string;
            eventTitle: string;
            eventDate: string;
            eventVenue: string;
            fullName: string;
            email: string;
            phone: string;
            ticketType: string;
            ticketPrice: number;
            quantity: number;
          };
          const body = await request.json() as Body;
          const { eventId, eventTitle, eventDate, eventVenue,
                  fullName, email, phone, ticketType, ticketPrice, quantity } = body;

          if (!eventId || !fullName || !email || !phone || !ticketType) {
            return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
              status: 400, headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const qty = Math.max(1, Math.min(20, Number(quantity) || 1));
          const price = Number(ticketPrice) || 0;
          const bookingId = crypto.randomUUID();

          const booking: BookingRow = {
            id: bookingId,
            event_id: eventId,
            event_title: eventTitle ?? "Event",
            event_date: eventDate ?? "",
            event_venue: eventVenue ?? "",
            full_name: String(fullName).trim(),
            email: String(email).trim().toLowerCase(),
            phone: String(phone).trim(),
            ticket_type: ticketType,
            ticket_price: price,
            quantity: qty,
            amount: price * qty,
            status: "pending",
            mpesa_receipt: null,
            mpesa_checkout_id: null,
            created_at: new Date().toISOString(),
            paid_at: null,
          };

          await createBooking(booking, kv);

          return new Response(
            JSON.stringify({ ok: true, bookingId, amount: booking.amount }),
            { headers: { "content-type": "application/json; charset=utf-8" } },
          );
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
            status: 500, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
