import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractKV, getBookingById } from "@/lib/store";

export const Route = createFileRoute("/api/bookings/$bookingId")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ params, context }) => {
        const kv = extractKV(context);
        const booking = await getBookingById(params.bookingId, kv);
        if (!booking) {
          return new Response(JSON.stringify({ ok: false, error: "Booking not found" }), {
            status: 404,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
        return new Response(JSON.stringify({ ok: true, booking }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
