import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const req = request as any;
        const ctx = context as any;

        let cfWorkersEnvKeys: string[] | null = null;
        let cfWorkersHasDB = false;
        let cfWorkersHasPW = false;
        try {
          // @ts-ignore
          const { env } = await import("cloudflare:workers");
          cfWorkersEnvKeys = env ? Object.keys(env) : [];
          cfWorkersHasDB = !!env?.DB;
          cfWorkersHasPW = !!env?.ADMIN_PASSWORD;
        } catch (e: any) {
          cfWorkersEnvKeys = ["ERROR: " + e?.message];
        }

        const info = {
          cloudflare_workers_module: { keys: cfWorkersEnvKeys, has_DB: cfWorkersHasDB, has_PW: cfWorkersHasPW },
          req_runtime_name: req?.runtime?.name ?? null,
          req_runtime_has_DB: !!req?.runtime?.cloudflare?.env?.DB,
          ctx_keys: ctx ? Object.keys(ctx) : null,
          ctx_has_DB: !!ctx?.cloudflare?.env?.DB,
          vite_pw_set: !!(import.meta as any)?.env?.VITE_ADMIN_PASSWORD,
        };
        return new Response(JSON.stringify(info, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
