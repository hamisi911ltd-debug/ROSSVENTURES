import { createFileRoute, redirect } from "@tanstack/react-router";
import { initiateStkPush, getEnvFromContext } from "@/lib/mpesa";

// Single-segment path — reliably handled by TanStack Start server.handlers
export const Route = createFileRoute("/admin-mpesa")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const mpesaEnv = getEnvFromContext(context);
        try {
          const body = await request.json() as {
            bookingId: string;
            phone: string;
            amount: number;
          };

          if (!body.bookingId || !body.phone || !body.amount) {
            return new Response(
              JSON.stringify({ ok: false, error: "Missing fields" }),
              { status: 400, headers: { "content-type": "application/json; charset=utf-8" } },
            );
          }

          const url = new URL(request.url);
          const callbackBase = `${url.protocol}//${url.host}`;

          const result = await initiateStkPush(
            body.phone,
            body.amount,
            body.bookingId,
            callbackBase,
            mpesaEnv,
          );

          return new Response(JSON.stringify(result), {
            status: result.ok ? 200 : 502,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Server error" }),
            { status: 500, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }
      },
    },
  },
});
