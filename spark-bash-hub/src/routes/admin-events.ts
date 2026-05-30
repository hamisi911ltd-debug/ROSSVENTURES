import { createFileRoute, redirect } from "@tanstack/react-router";
import type { EventRow } from "@/lib/types";

// ─── Module-level store ───────────────────────────────────────────────────────
// Cloudflare Workers keep an isolate warm for hours on a live site.
// Any POST from the admin populates this store; subsequent GETs from any
// device on the same isolate return the events.  When KV is configured
// the data is also persisted across cold-starts.
const _events: EventRow[] = [];

type KV = {
  get(k: string): Promise<string | null>;
  put(k: string, v: string, opts?: { expirationTtl?: number }): Promise<void>;
};

function getKV(context: unknown): KV | null {
  const env = (context as any)?.cloudflare?.env ?? (context as any)?.env;
  const kv = env?.EVENTS_KV;
  return kv && typeof kv.get === "function" ? (kv as KV) : null;
}

async function readFromKV(kv: KV): Promise<EventRow[]> {
  try {
    const raw = await kv.get("events:all");
    if (raw) return JSON.parse(raw) as EventRow[];
  } catch {}
  return [];
}

async function writeToKV(kv: KV, events: EventRow[]) {
  try {
    await kv.put("events:all", JSON.stringify(events));
  } catch {}
}

export const Route = createFileRoute("/admin-events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // GET /admin-events → return published events (all devices)
      GET: async ({ context }) => {
        const kv = getKV(context);
        let events: EventRow[] = _events;

        if (kv && _events.length === 0) {
          // Cold start: try to restore from KV
          const fromKV = await readFromKV(kv);
          if (fromKV.length > 0) {
            _events.push(...fromKV);
            events = _events;
          }
        }

        const published = events.filter(e => e.is_published);
        return new Response(JSON.stringify({ ok: true, events: published }), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },

      // POST /admin-events → admin saves/syncs events
      POST: async ({ request, context }) => {
        const kv = getKV(context);
        try {
          const body = await request.json() as { events?: EventRow[] };
          const incoming: EventRow[] = Array.isArray(body.events) ? body.events : [];

          // Update module store
          _events.length = 0;
          _events.push(...incoming);

          // Persist to KV when available (cross-isolate / cold-start resilience)
          if (kv) await writeToKV(kv, incoming);

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
    },
  },
});
