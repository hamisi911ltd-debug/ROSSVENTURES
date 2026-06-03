import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractDB, extractR2, getAdminPassword, rowToEvent } from "@/lib/db";

export const Route = createFileRoute("/api/events")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // GET /api/events
      // ?all=1 + X-Admin-Key header → all events (admin)
      // public → published only
      GET: async ({ request, context }) => {
        const db = extractDB(context);
        if (!db) {
          return new Response(JSON.stringify({ ok: true, events: [] }), {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        }

        const url = new URL(request.url);
        const wantAll = url.searchParams.get("all") === "1";
        const adminKey = request.headers.get("X-Admin-Key");
        const adminPassword = getAdminPassword(context);
        const isAdmin = !!adminPassword && adminKey === adminPassword;

        const sql = (wantAll && isAdmin)
          ? "SELECT * FROM events ORDER BY created_at DESC"
          : "SELECT * FROM events WHERE is_published = 1 ORDER BY created_at DESC";

        const { results } = await db.prepare(sql).all();
        const events = (results ?? []).map(rowToEvent);

        return new Response(JSON.stringify({ ok: true, events }), {
          headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
        });
      },

      // POST /api/events — create a new event (admin only)
      // multipart/form-data: poster (File, optional) + event (JSON string of fields)
      POST: async ({ request, context }) => {
        const db = extractDB(context);
        const r2 = extractR2(context);
        const adminPassword = getAdminPassword(context);
        const adminKey = request.headers.get("X-Admin-Key");

        if (!adminPassword || adminKey !== adminPassword) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
        if (!db) {
          return new Response(JSON.stringify({ ok: false, error: "DB not configured" }), {
            status: 503, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }

        try {
          let posterKey: string | null = null;
          let eventData: any;

          const ct = request.headers.get("content-type") ?? "";
          if (ct.includes("multipart/form-data")) {
            const form = await request.formData();
            eventData = JSON.parse((form.get("event") as string) ?? "{}");
            const poster = form.get("poster") as File | null;
            if (poster && poster.size > 0 && r2) {
              const ext = (poster.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
              posterKey = `${crypto.randomUUID()}.${ext || "jpg"}`;
              await r2.put(posterKey, await poster.arrayBuffer(), {
                httpMetadata: { contentType: poster.type || "image/jpeg" },
              });
            }
          } else {
            eventData = await request.json();
          }

          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          const tiers = Array.isArray(eventData.tiers) ? eventData.tiers : [];

          await db.prepare(
            `INSERT INTO events (id,title,description,venue,event_date,tag,is_published,created_at,poster_key,tiers_json)
             VALUES (?,?,?,?,?,?,?,?,?,?)`
          ).bind(
            id,
            String(eventData.title ?? "").trim(),
            String(eventData.description ?? ""),
            String(eventData.venue ?? ""),
            String(eventData.event_date ?? ""),
            String(eventData.tag ?? ""),
            1,
            now,
            posterKey,
            JSON.stringify(tiers),
          ).run();

          const row = await db.prepare("SELECT * FROM events WHERE id = ?").bind(id).first();
          return new Response(JSON.stringify({ ok: true, event: rowToEvent(row) }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: String(err) }), {
            status: 500, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
