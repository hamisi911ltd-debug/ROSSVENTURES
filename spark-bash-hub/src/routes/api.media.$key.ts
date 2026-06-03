import { createFileRoute, redirect } from "@tanstack/react-router";
import { extractR2 } from "@/lib/db";

export const Route = createFileRoute("/api/media/$key")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const r2 = extractR2(request);
        if (!r2) {
          return new Response("R2 not configured", { status: 503 });
        }

        const obj = await r2.get(params.key);
        if (!obj) {
          return new Response("Not found", { status: 404 });
        }

        const contentType = obj.httpMetadata?.contentType ?? "image/jpeg";
        return new Response(obj.body, {
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
