import { createFileRoute, redirect } from "@tanstack/react-router";
import { getBookingById, getKV } from "@/lib/store";
import { parseCallback, verifyCallbackToken } from "@/lib/payhero";
import { applyCallback } from "@/lib/payments";
import { json } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/payhero/callback")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // PayHero posts the payment result here. The URL carries an HMAC token created when the
      // STK push was initiated, so only PayHero (who we gave the URL to) can call it.
      POST: async ({ request, context }) => {
        const url = new URL(request.url);
        const bookingId = url.searchParams.get("b") ?? "";
        const token = url.searchParams.get("t") ?? "";

        if (!bookingId || !(await verifyCallbackToken(bookingId, token))) {
          return json({ ok: false, error: "Forbidden" }, 403);
        }

        try {
          const kv = await getKV(context);
          const booking = await getBookingById(bookingId, kv);
          if (booking) {
            const cb = parseCallback(await request.json().catch(() => ({})));
            await applyCallback(booking, cb, kv);
          }
        } catch {
          // Fall through - customer polling reconciles with PayHero directly
        }
        return json({ ok: true });
      },
    },
  },
});
