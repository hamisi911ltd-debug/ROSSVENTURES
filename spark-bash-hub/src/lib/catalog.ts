import type { EventRow } from "./types";
import { FIXTURES_BY_ID, TEST_FIXTURE_ID } from "./fixtures";

/**
 * Server-side source of truth for what can be bought and at what price: the fixtures defined in
 * code (src/lib/league.ts). Nothing the browser sends can change a price, and no database
 * records are consulted, so leftover data can never be sold.
 *
 * `sample: true` means "not on sale yet" (no real prices set).
 */
export async function resolveEvent(eventId: string): Promise<{ event: EventRow; sample: boolean } | null> {
  const fixture = FIXTURES_BY_ID[eventId];
  if (!fixture) return null;
  const priced = fixture.tiers.some((t) => Number(t.price) > 0);
  return { event: fixture, sample: !(priced || fixture.id === TEST_FIXTURE_ID) };
}
