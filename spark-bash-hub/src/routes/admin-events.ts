import { createFileRoute, redirect } from "@tanstack/react-router";
import type { EventRow } from "@/lib/types";

// ─── Module-level fallback store ──────────────────────────────────────────────
// Used when Cloudflare KV is not configured. Persists within one Worker isolate
// (typically hours on a live site). Admin re-syncing from the admin panel
// refreshes this store so users on the same isolate always see fresh events.
const _mem: EventRow[] = [];

// ─── KV access ────────────────────────────────────────────────────────────────
// We try three approaches in order:
//  1. cloudflare:env virtual module  (@cloudflare/vite-plugin provides this)
//  2. context.cloudflare.env         (passed by @cloudflare/vite-plugin adapter)
//  3. context.env                    (older adapter format)
// If none is available we fall back to the in-memory store.

async function tryGetKV(context: unknown): Promise<{ get(k:string):Promise<string|null>; put(k:string,v:string):Promise<void> } | null> {
  // Method 1: cloudflare:env virtual module
  try {
    // Using new Function to avoid TypeScript static analysis of the unknown module
    const cfEnv = await new Function('return import("cloudflare:env")')() as any;
    if (cfEnv?.EVENTS_KV?.get) return cfEnv.EVENTS_KV;
  } catch {}

  // Method 2 & 3: context object (passed by @cloudflare/vite-plugin)
  const envObj =
    (context as any)?.cloudflare?.env ??
    (context as any)?.env ??
    {};
  if (envObj?.EVENTS_KV?.get) return envObj.EVENTS_KV;

  return null; // KV not configured — use in-memory store
}

const KEY = "events:all";

async function readEvents(kv: Awaited<ReturnType<typeof tryGetKV>>): Promise<EventRow[]> {
  if (!kv) return [..._mem];
  try {
    const raw = await kv.get(KEY);
    if (raw) {
      const parsed: EventRow[] = JSON.parse(raw);
      // Warm the in-memory cache
      _mem.length = 0;
      _mem.push(...parsed);
      return parsed;
    }
  } catch {}
  return [..._mem];
}

async function writeEvents(kv: Awaited<ReturnType<typeof tryGetKV>>, events: EventRow[]) {
  _mem.length = 0;
  _mem.push(...events);
  if (!kv) return;
  try { await kv.put(KEY, JSON.stringify(events)); } catch {}
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin-events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // GET /admin-events — fetch published events (any device)
      GET: async ({ context }) => {
        const kv = await tryGetKV(context);
        const all = await readEvents(kv);
        const published = all.filter(e => e.is_published);
        return new Response(
          JSON.stringify({ ok: true, events: published }),
          { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } },
        );
      },

      // POST /admin-events — admin saves/syncs events
      POST: async ({ request, context }) => {
        const kv = await tryGetKV(context);
        try {
          const body = await request.json() as { events?: EventRow[] };
          const incoming: EventRow[] = Array.isArray(body.events) ? body.events : [];
          await writeEvents(kv, incoming);
          return new Response(
            JSON.stringify({ ok: true, saved: incoming.length, kv: kv !== null }),
            { headers: { "content-type": "application/json; charset=utf-8" } },
          );
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Bad request" }),
            { status: 400, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }
      },
    },
  },
});
