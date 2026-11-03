import type { EventRow } from "./types";
import talantaStadium from "@/assets/talanta-stadium.jpg";
import { LEAGUE_MATCHES } from "./league";

// Built-in fixtures: the real FKF Premier League fixtures (see ./league.ts for prices and the opening match).
export const FIXTURES: EventRow[] = LEAGUE_MATCHES;

// Hidden live-payment check: not listed anywhere, reachable only at /events/payment-test.
// Lets the owner confirm that money reaches the payments wallet before real matches go on sale.
export const TEST_FIXTURE_ID = "payment-test";
const TEST_FIXTURE: EventRow = {
  id: TEST_FIXTURE_ID,
  title: "Payment test — Football Arena254",
  venue: "Talanta Stadium, Nairobi",
  event_date: "Test purchase — no match attached",
  tag: "Test",
  description: "A KES 10 test ticket used to confirm that payments reach our wallet. It is not a valid match ticket.",
  poster_url: talantaStadium,
  is_published: true,
  created_at: "2026-11-01T00:00:00.000Z",
  tiers: [{ name: "Test", price: 10, description: "KES 10 payment test" }],
};

export const FIXTURES_BY_ID: Record<string, EventRow> = Object.fromEntries(
  [...FIXTURES, TEST_FIXTURE].map((f) => [f.id, f]),
);
export const FALLBACK_POSTER = talantaStadium;
