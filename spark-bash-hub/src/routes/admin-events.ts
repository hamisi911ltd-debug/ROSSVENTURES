import { createFileRoute, redirect } from "@tanstack/react-router";
import type { EventRow } from "@/lib/types";

// ─── Storage layers (tried in order) ─────────────────────────────────────────
// 1. Cloudflare Cache API  — shared across ALL Worker isolates in the zone.
//    Zero setup, zero external services. Data survives isolate cold-starts.
// 2. Module-level array    — fast in-process fallback (local dev / cache miss).

const _mem: EventRow[] = [];
const CACHE_TTL = 60 * 60 * 24; // 24 hours

function cacheKey(origin: string) {
  return `${origin}/__rv_events_v1__`;
}

async function readCache(origin: string): Promise<EventRow[] | null> {
  try {
    // caches.default is only available in the deployed Cloudflare Worker
    const cached = await (caches as any).default.match(cacheKey(origin));
    if (!cached) return null;
    const data = await cached.json() as { events?: EventRow[] };
    return Array.isArray(data.events) ? data.events : null;
  } catch {
    return null; // local dev / not in Cloudflare environment
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
  } catch {
    // silently ignore — falls back to in-memory
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin-events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // GET /admin-events  — any device reads published events
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        // Try Cache API first (shared across all Worker instances)
        const fromCache = await readCache(origin);
        if (fromCache !== null) {
          // Warm in-memory store from cache
          if (_mem.length === 0 && fromCache.length > 0) {
            _mem.push(...fromCache);
          }
          const published = fromCache.filter(e => e.is_published);
          return new Response(JSON.stringify({ ok: true, events: published, source: "cache" }), {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        }

        // Fallback: in-memory store
        const published = _mem.filter(e => e.is_published);
        return new Response(JSON.stringify({ ok: true, events: published, source: "memory" }), {
          headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
        });
      },

      // POST /admin-events — admin saves events (syncs to all devices)
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const body = await request.json() as { events?: EventRow[] };
          const incoming: EventRow[] = Array.isArray(body.events) ? body.events : [];

          // Update in-memory store
          _mem.length = 0;
          _mem.push(...incoming);

          // Write to Cache API — this makes events visible on ALL devices
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

      // DELETE /admin-events — clear the cache (e.g. when all events removed)
      DELETE: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          await (caches as any).default.delete(cacheKey(origin));
        } catch {}
        _mem.length = 0;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
