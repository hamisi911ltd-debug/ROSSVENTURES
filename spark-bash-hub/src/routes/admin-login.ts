import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin-login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, message: "Invalid request." }),
            { status: 400, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }

        const password =
          typeof (body as Record<string, unknown>)?.password === "string"
            ? (body as Record<string, unknown>).password as string
            : "";

        const adminPassword =
          (import.meta as { env?: Record<string, string> }).env?.VITE_ADMIN_PASSWORD ||
          (typeof process !== "undefined"
            ? (process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD)
            : undefined);

        if (!adminPassword) {
          return new Response(
            JSON.stringify({ ok: false, message: "Admin password is not configured." }),
            { status: 500, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }

        if (password === adminPassword) {
          return new Response(
            JSON.stringify({ ok: true }),
            { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }

        return new Response(
          JSON.stringify({ ok: false, message: "Invalid password." }),
          { status: 401, headers: { "content-type": "application/json; charset=utf-8" } },
        );
      },
    },
  },
});
