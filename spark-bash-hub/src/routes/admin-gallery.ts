import { createFileRoute, redirect } from "@tanstack/react-router";
import type { GalleryPhoto } from "@/lib/types";

const _mem: GalleryPhoto[] = [];
const CACHE_TTL = 60 * 60 * 24;

function cacheKey(origin: string) {
  return `${origin}/__rv_gallery_v1__`;
}

async function readCache(origin: string): Promise<GalleryPhoto[] | null> {
  try {
    const cached = await (caches as any).default.match(cacheKey(origin));
    if (!cached) return null;
    const data = (await cached.json()) as { photos?: GalleryPhoto[] };
    return Array.isArray(data.photos) ? data.photos : null;
  } catch {
    return null;
  }
}

async function writeCache(origin: string, photos: GalleryPhoto[]) {
  try {
    const res = new Response(JSON.stringify({ photos }), {
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${CACHE_TTL}`,
      },
    });
    await (caches as any).default.put(cacheKey(origin), res);
  } catch {}
}

export const Route = createFileRoute("/admin-gallery")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const fromCache = await readCache(origin);
        if (fromCache !== null) {
          if (_mem.length === 0 && fromCache.length > 0) _mem.push(...fromCache);
          return new Response(
            JSON.stringify({ ok: true, photos: fromCache, source: "cache" }),
            { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } },
          );
        }
        return new Response(
          JSON.stringify({ ok: true, photos: _mem, source: "memory" }),
          { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } },
        );
      },

      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const body = (await request.json()) as { photos?: GalleryPhoto[] };
          const incoming: GalleryPhoto[] = Array.isArray(body.photos) ? body.photos : [];
          _mem.length = 0;
          _mem.push(...incoming);
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
