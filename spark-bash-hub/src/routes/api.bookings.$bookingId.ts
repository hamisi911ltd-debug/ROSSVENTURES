import { createFileRoute, redirect } from "@tanstack/react-router";
import { getBookingById, getKV, listBookings, updateBooking } from "@/lib/store";
import { reconcileBooking } from "@/lib/payments";
import { isAdminRequest, json } from "@/lib/admin-auth";
import type { BookingRow } from "@/lib/types";

/** What the customer's browser is allowed to see. */
function publicView(b: BookingRow) {
  const { payment_reference: _ref, payment_requested_at: _req, mpesa_checkout_id: _co, ...rest } = b;
  return rest;
}

export const Route = createFileRoute("/api/bookings/$bookingId")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // Customer polls this while the M-Pesa prompt is open; also used by the ticket page.
      GET: async ({ params, context }) => {
        const kv = await getKV(context);
        let booking = await getBookingById(params.bookingId, kv);
        if (!booking) return json({ ok: false, error: "Booking not found" }, 404);
        if (booking.status === "pending") booking = await reconcileBooking(booking, kv);
        return json({ ok: true, booking: publicView(booking) });
      },

      // Admin gate check-in:  PATCH /api/bookings/<id-or-8-char-reference>  { action: "checkin" | "lookup" }
      PATCH: async ({ request, params, context }) => {
        if (!(await isAdminRequest(request))) return json({ ok: false, error: "Unauthorized" }, 401);
        const kv = await getKV(context);
        const body = (await request.json().catch(() => ({}))) as { action?: string };

        let booking = await getBookingById(params.bookingId, kv);
        if (!booking && /^[A-Za-z0-9]{8}$/.test(params.bookingId)) {
          const prefix = params.bookingId.toLowerCase();
          booking = (await listBookings(kv)).find((b) => b.id.startsWith(prefix)) ?? null;
        }
        if (!booking) return json({ ok: false, error: "Ticket not found" }, 404);
        if (booking.status === "pending") booking = await reconcileBooking(booking, kv);

        if (booking.status !== "paid") return json({ ok: false, error: `Not valid — payment status: ${booking.status}`, booking: publicView(booking) }, 409);
        if (body.action === "checkin") {
          if (booking.checked_in_at) return json({ ok: false, error: `Already used at ${booking.checked_in_at}`, booking: publicView(booking) }, 409);
          booking = (await updateBooking(booking.id, { checked_in_at: new Date().toISOString() }, kv)) ?? booking;
        }
        return json({ ok: true, booking: publicView(booking) });
      },
    },
  },
});
