import type { EventRow } from "./types";
import { extractDB, rowToEvent } from "./db";
import { FIXTURES_BY_ID } from "./fixtures";

/**
 * Server-side source of truth for what can be bought and at what price.
 * Published events live in D1 (written only by the authenticated admin);
 * the built-in sample fixtures are a fallback for demos.
 */
export async function resolveEvent(eventId: string): Promise<{ event: EventRow; sample: boolean } | null> {
  const db = await extractDB();
  if (db) {
    try {
      const row = await db.prepare("SELECT * FROM events WHERE id = ? AND is_published = 1").bind(eventId).first();
      if (row) return { event: rowToEvent(row), sample: false };
    } catch {}
  }
  const fixture = FIXTURES_BY_ID[eventId];
  return fixture ? { event: fixture, sample: true } : null;
}
