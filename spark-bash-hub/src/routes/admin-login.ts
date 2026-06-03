import { createFileRoute, redirect } from "@tanstack/react-router";

function resolveAdminPassword(req: Request): string | undefined {
  // srvx injects Cloudflare Worker env at request.runtime.cloudflare.env
  const cfEnv = (req as any)?.runtime?.cloudflare?.env ?? {};
  if (cfEnv?.ADMIN_PASSWORD) return cfEnv.ADMIN_PASSWORD;
  if (cfEnv?.VITE_ADMIN_PASSWORD) return cfEnv.VITE_ADMIN_PASSWORD;
  // Vite embeds VITE_ vars from .env at build time
  const vitePw = (import.meta as any)?.env?.VITE_ADMIN_PASSWORD;
  if (vitePw) return vitePw;
  if (typeof process !== "undefined") {
    return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
  }
  return undefined;
}

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

        const adminPassword = resolveAdminPassword(request);

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
