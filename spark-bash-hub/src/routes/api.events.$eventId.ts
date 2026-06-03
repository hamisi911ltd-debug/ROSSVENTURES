import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractDB, extractR2, getAdminPassword, rowToEvent } from "@/lib/db";

export const Route = createFileRoute("/api/events/$eventId")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      // PATCH /api/events/:eventId — toggle publish or update fields
      PATCH: async ({ request, params }) => {
        const db = extractDB(request);
        const adminPassword = getAdminPassword(request);
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
          const body: any = await request.json();
          const fields: string[] = [];
          const values: any[] = [];

          if ("is_published" in body) {
            fields.push("is_published = ?");
            values.push(body.is_published ? 1 : 0);
          }
          if ("title" in body)       { fields.push("title = ?");       values.push(String(body.title)); }
          if ("description" in body) { fields.push("description = ?"); values.push(String(body.description)); }
          if ("venue" in body)       { fields.push("venue = ?");       values.push(String(body.venue)); }
          if ("event_date" in body)  { fields.push("event_date = ?");  values.push(String(body.event_date)); }
          if ("tag" in body)         { fields.push("tag = ?");         values.push(String(body.tag)); }
          if ("tiers" in body)       { fields.push("tiers_json = ?");  values.push(JSON.stringify(body.tiers)); }

          if (fields.length === 0) {
            return new Response(JSON.stringify({ ok: false, error: "Nothing to update" }), {
              status: 400, headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          values.push(params.eventId);
          await db.prepare(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`)
            .bind(...values).run();

          const row = await db.prepare("SELECT * FROM events WHERE id = ?").bind(params.eventId).first();
          if (!row) {
            return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
              status: 404, headers: { "content-type": "application/json; charset=utf-8" },
            });
          }

          return new Response(JSON.stringify({ ok: true, event: rowToEvent(row) }), {
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: String(err) }), {
            status: 500, headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      },

      // DELETE /api/events/:eventId — delete event and its R2 image
      DELETE: async ({ request, params }) => {
        const db = extractDB(request);
        const r2 = extractR2(request);
        const adminPassword = getAdminPassword(request);
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
          // Fetch the row first so we can delete its image from R2
          const row: any = await db.prepare("SELECT poster_key FROM events WHERE id = ?")
            .bind(params.eventId).first();

          if (row?.poster_key && r2) {
            await r2.delete(row.poster_key).catch(() => {});
          }

          await db.prepare("DELETE FROM events WHERE id = ?").bind(params.eventId).run();

          return new Response(JSON.stringify({ ok: true }), {
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
