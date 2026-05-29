import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/components/Landing";
import type { EventRow } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json() as { ok: boolean; events: EventRow[] };
      return { dynamicEvents: data.ok ? data.events : [] };
    } catch {
      return { dynamicEvents: [] };
    }
  },
  component: Landing,
});
