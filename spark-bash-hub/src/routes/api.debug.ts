import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const req = request as any;
        const ctx = context as any;
        const info = {
          // Check request.runtime (srvx pattern)
          req_runtime_name: req?.runtime?.name ?? null,
          req_runtime_cf_env_keys: req?.runtime?.cloudflare?.env
            ? Object.keys(req.runtime.cloudflare.env)
            : null,
          req_runtime_has_DB: !!req?.runtime?.cloudflare?.env?.DB,
          req_runtime_has_IMAGES: !!req?.runtime?.cloudflare?.env?.IMAGES,
          req_runtime_has_PW: !!req?.runtime?.cloudflare?.env?.ADMIN_PASSWORD,
          // Check context.cloudflare.env (nitro/h3 pattern)
          ctx_cf_env_keys: ctx?.cloudflare?.env
            ? Object.keys(ctx.cloudflare.env)
            : null,
          ctx_has_DB: !!ctx?.cloudflare?.env?.DB,
          // Check context.env directly
          ctx_env_keys: ctx?.env ? Object.keys(ctx.env) : null,
          ctx_env_has_DB: !!ctx?.env?.DB,
          // Check globalThis
          global_has_DB: !!(globalThis as any)?.DB,
          // Context shape
          ctx_keys: ctx ? Object.keys(ctx) : null,
          // VITE env
          vite_pw_set: !!(import.meta as any)?.env?.VITE_ADMIN_PASSWORD,
        };
        return new Response(JSON.stringify(info, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
