import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractKV, getBookingByCheckout, updateBooking } from "@/lib/store";
import { parseCallback } from "@/lib/mpesa";

export const Route = createFileRoute("/api/mpesa/callback")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const kv = extractKV(context);
        try {
          const body = await request.json();
          const result = parseCallback(body);

          const bookingId = await getBookingByCheckout(result.checkoutRequestId, kv);
          if (!bookingId) {
            // Acknowledge to Safaricom even if we can't find the booking
            return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          if (result.resultCode === 0) {
            // Payment successful
            await updateBooking(bookingId, {
              status: "paid",
              mpesa_receipt: result.mpesaReceiptNumber,
              paid_at: new Date().toISOString(),
            }, kv);
          } else {
            // Payment failed or cancelled
            await updateBooking(bookingId, { status: "failed" }, kv);
          }

          return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch {
          return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
