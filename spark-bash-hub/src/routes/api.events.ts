import { createFileRoute, redirect } from "@tanstack/react-router";
import { bulkSyncEvents, extractKV, listPublishedEvents, listAllEvents } from "@/lib/store";
import type { EventRow } from "@/lib/types";

export const Route = createFileRoute("/api/events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const kv = extractKV(context);
        const url = new URL(request.url);
        const all = url.searchParams.get("all") === "1";
        const events = all
          ? await listAllEvents(kv)
          : await listPublishedEvents(kv);
        return new Response(JSON.stringify({ ok: true, events }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },

      POST: async ({ request, context }) => {
        // Admin bulk-sync: POST body is { events: EventRow[], adminPassword: string }
        const kv = extractKV(context);
        try {
          const body = await request.json() as { events: EventRow[]; adminPassword?: string };
          await bulkSyncEvents(body.events ?? [], kv);
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), {
            status: 400,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
