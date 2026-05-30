import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractKV, setCheckoutBooking, updateBooking } from "@/lib/store";
import { initiateStkPush, getEnvFromContext } from "@/lib/mpesa";

export const Route = createFileRoute("/api/mpesa/initiate")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const kv = extractKV(context);
        const mpesaEnv = getEnvFromContext(context);

        try {
          // Accept amount from client so we don't need to look up the booking
          // from a potentially-empty server-side store.
          const body = await request.json() as {
            bookingId: string;
            phone: string;
            amount: number;
          };
          const { bookingId, phone, amount } = body;

          if (!bookingId || !phone || !amount) {
            return new Response(JSON.stringify({ ok: false, error: "Missing bookingId, phone or amount" }), {
              status: 400, headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          const url = new URL(request.url);
          const callbackBase = `${url.protocol}//${url.host}`;

          const result = await initiateStkPush(phone, amount, bookingId, callbackBase, mpesaEnv);

          if (!result.ok) {
            return new Response(JSON.stringify({ ok: false, error: result.error }), {
              status: 502, headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          await setCheckoutBooking(result.checkoutRequestId, bookingId, kv);
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
            status: 500, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
