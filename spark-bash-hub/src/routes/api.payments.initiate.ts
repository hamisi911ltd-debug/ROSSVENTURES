import { createFileRoute, redirect } from "@tanstack/react-router";
import { getBookingById, getKV, updateBooking } from "@/lib/store";
import { initiateStkPush, normalizeKenyanPhone, payheroConfigured } from "@/lib/payhero";
import { json } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/payments/initiate")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // Sends the M-Pesa prompt for an existing booking. The amount is the booking's server-computed total.
      POST: async ({ request, context }) => {
        try {
          const body = (await request.json()) as { bookingId?: string; phone?: string };
          const kv = await getKV(context);

          const booking = body.bookingId ? await getBookingById(body.bookingId, kv) : null;
          if (!booking) return json({ ok: false, error: "Booking not found" }, 404);
          if (booking.status === "paid") return json({ ok: false, error: "This booking is already paid" }, 409);

          const phone = normalizeKenyanPhone(String(body.phone ?? booking.phone));
          if (!phone) return json({ ok: false, error: "Enter a valid M-Pesa number (07XX XXX XXX)" }, 400);

          if (!(await payheroConfigured())) {
            return json({ ok: false, error: "Online payments are temporarily unavailable. Please try again later." }, 503);
          }

          // Debounce double-taps: an STK prompt was sent in the last 20 seconds
          if (booking.status === "pending" && booking.payment_reference && booking.payment_requested_at) {
            if (Date.now() - Date.parse(booking.payment_requested_at) < 20_000) {
              return json({ ok: true, alreadySent: true });
            }
          }

          const origin = new URL(request.url).origin;
          const result = await initiateStkPush({
            bookingId: booking.id,
            phone,
            amount: booking.amount,
            customerName: booking.full_name,
            origin,
          });
          if (!result.ok) return json({ ok: false, error: result.error }, 502);

          await updateBooking(booking.id, {
            status: "pending",
            phone,
            payment_reference: result.reference,
            mpesa_checkout_id: result.checkoutRequestId,
            payment_requested_at: new Date().toISOString(),
          }, kv);

          return json({ ok: true });
        } catch {
          return json({ ok: false, error: "Server error. Please try again." }, 500);
        }
      },
    },
  },
});
