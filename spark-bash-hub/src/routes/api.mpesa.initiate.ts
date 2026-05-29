import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractKV, getBookingById, setCheckoutBooking, updateBooking } from "@/lib/store";
import { initiateStkPush, getEnvFromContext } from "@/lib/mpesa";

export const Route = createFileRoute("/api/mpesa/initiate")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const kv = extractKV(context);
        const mpesaEnv = getEnvFromContext(context);

        try {
          const body = await request.json() as { bookingId: string; phone: string };
          const { bookingId, phone } = body;

          if (!bookingId || !phone) {
            return new Response(JSON.stringify({ ok: false, error: "Missing bookingId or phone" }), {
              status: 400,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const booking = await getBookingById(bookingId, kv);
          if (!booking) {
            return new Response(JSON.stringify({ ok: false, error: "Booking not found" }), {
              status: 404,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          if (booking.status === "paid") {
            return new Response(JSON.stringify({ ok: true, alreadyPaid: true, checkoutRequestId: booking.mpesa_checkout_id }), {
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const url = new URL(request.url);
          const callbackBase = `${url.protocol}//${url.host}`;

          const result = await initiateStkPush(
            phone,
            booking.amount,
            bookingId,
            callbackBase,
            mpesaEnv,
          );

          if (!result.ok) {
            return new Response(JSON.stringify({ ok: false, error: result.error }), {
              status: 502,
              headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          // Store checkout → booking mapping for callback lookup
          await setCheckoutBooking(result.checkoutRequestId, bookingId, kv);

          // Update booking with checkout ID
          await updateBooking(bookingId, { mpesa_checkout_id: result.checkoutRequestId, phone }, kv);

          const isSimulation = result.checkoutRequestId.startsWith("SIM_");

          return new Response(
            JSON.stringify({
              ok: true,
              checkoutRequestId: result.checkoutRequestId,
              simulation: isSimulation,
            }),
            { headers: { "content-type": "application/json; charset=utf-8" } },
          );
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
