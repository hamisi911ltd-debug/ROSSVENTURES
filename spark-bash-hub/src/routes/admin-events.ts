import { createFileRoute, redirect } from "@tanstack/react-router";
import type { EventRow } from "@/lib/types";
import { extractKV, bulkSyncEvents, listPublishedEvents } from "@/lib/store";

// ─── Cache API layer (fast, PoP-local fallback when KV is available) ──────────
const CACHE_TTL = 60 * 60 * 24; // 24 hours

function cacheKey(origin: string) {
  return `${origin}/__rv_events_v2__`;
}

async function readCache(origin: string): Promise<EventRow[] | null> {
  try {
    const cached = await (caches as any).default.match(cacheKey(origin));
    if (!cached) return null;
    const data = await cached.json() as { events?: EventRow[] };
    return Array.isArray(data.events) ? data.events : null;
  } catch {
    return null;
  }
}

async function writeCache(origin: string, events: EventRow[]) {
  try {
    const res = new Response(JSON.stringify({ events }), {
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${CACHE_TTL}`,
      },
    });
    await (caches as any).default.put(cacheKey(origin), res);
  } catch {}
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin-events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // GET /admin-events — any device reads published events
      GET: async ({ request, context }) => {
        const origin = new URL(request.url).origin;
        const kv = extractKV(context);

        // If KV is configured — it's globally consistent, use it as source of truth
        if (kv) {
          const events = await listPublishedEvents(kv);
          // Also warm the local cache so repeat requests are fast
          if (events.length > 0) writeCache(origin, events);
          return new Response(JSON.stringify({ ok: true, events, source: "kv" }), {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        }

        // Fallback: PoP-local Cache API
        const fromCache = await readCache(origin);
        if (fromCache !== null) {
          const published = fromCache.filter(e => e.is_published);
          return new Response(JSON.stringify({ ok: true, events: published, source: "cache" }), {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        }

        return new Response(JSON.stringify({ ok: true, events: [], source: "empty" }), {
          headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
        });
      },

      // POST /admin-events — admin saves/syncs events to all devices
      POST: async ({ request, context }) => {
        const origin = new URL(request.url).origin;
        const kv = extractKV(context);
        try {
          const body = await request.json() as { events?: EventRow[] };
          const incoming: EventRow[] = Array.isArray(body.events) ? body.events : [];

          // Write to KV (globally consistent across all Cloudflare PoPs)
          await bulkSyncEvents(incoming, kv);

          // Also write to Cache API for fast local reads
          await writeCache(origin, incoming);

          return new Response(
            JSON.stringify({ ok: true, saved: incoming.length }),
            { headers: { "content-type": "application/json; charset=utf-8" } },
          );
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Bad request" }),
            { status: 400, headers: { "content-type": "application/json; charset=utf-8" } },
          );
        }
      },

      // DELETE /admin-events — clear all event storage
      DELETE: async ({ request, context }) => {
        const origin = new URL(request.url).origin;
        const kv = extractKV(context);
        try {
          await (caches as any).default.delete(cacheKey(origin));
        } catch {}
        // Clear KV list so GET returns empty
        if (kv) {
          try { await kv.put("events:v1:list", "[]"); } catch {}
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
