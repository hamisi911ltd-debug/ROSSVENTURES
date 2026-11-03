import type { EventRow } from "./types";
import talantaStadium from "@/assets/talanta-stadium.jpg";
import talantaShield from "@/assets/talanta-shield.jpg";
import talantaRoof from "@/assets/talanta-roof.jpg";
import kasaraniInside from "@/assets/match-kasarani-inside.jpg";
import actionGreenYellow from "@/assets/match-action-green-yellow.jpg";

// Fallback fixtures shown until matches are published from the admin panel.
// Replace these (dates, prices, opponents) with real fixtures via /admin.
export const FIXTURES: EventRow[] = [
  {
    id: "talanta-derby",
    title: "Mashemeji Derby — Gor Mahia vs AFC Leopards",
    venue: "Talanta Stadium, Nairobi",
    event_date: "13 February 2027 · 3PM",
    tag: "Talanta Stadium",
    description:
      "Kenya's biggest club rivalry under the roof of the brand-new Talanta Stadium. Green army versus the Ingwe faithful — book early, this one sells out.",
    poster_url: talantaStadium,
    is_published: true,
    created_at: "2026-11-01T00:00:00.000Z",
    tiers: [
      { name: "Regular", price: 300, description: "General admission" },
      { name: "Covered", price: 600, description: "Covered stand seat" },
      { name: "VIP", price: 1500, description: "Premium seating" },
      { name: "VVIP", price: 3000, description: "Executive lounge access" },
    ],
  },
  {
    id: "harambee-stars-talanta",
    title: "Harambee Stars — International Friendly",
    venue: "Talanta Stadium, Nairobi",
    event_date: "20 March 2027 · 4PM",
    tag: "Harambee Stars",
    description:
      "Back the national team at Talanta. Harambee Stars take on international opposition in front of a home crowd of tens of thousands.",
    poster_url: talantaShield,
    is_published: true,
    created_at: "2026-10-31T00:00:00.000Z",
    tiers: [
      { name: "Regular", price: 500, description: "General admission" },
      { name: "Covered", price: 1000, description: "Covered stand seat" },
      { name: "VIP", price: 2500, description: "Premium seating" },
    ],
  },
  {
    id: "talanta-super-cup",
    title: "Super Cup Final",
    venue: "Talanta Stadium, Nairobi",
    event_date: "10 April 2027 · 3PM",
    tag: "Cup Final",
    description:
      "League champions meet the cup holders in a one-off final at Talanta Stadium. Silverware, songs and a sea of colour.",
    poster_url: talantaRoof,
    is_published: true,
    created_at: "2026-10-30T00:00:00.000Z",
    tiers: [
      { name: "Regular", price: 400, description: "General admission" },
      { name: "VIP", price: 2000, description: "Premium seating" },
    ],
  },
  {
    id: "kasarani-matchday",
    title: "FKF Premier League Matchday",
    venue: "Kasarani Stadium, Nairobi",
    event_date: "27 February 2027 · 3PM",
    tag: "League",
    description: "Top-flight league football at Kasarani. Cheap seats, loud terraces and a proper Kenyan matchday atmosphere.",
    poster_url: kasaraniInside,
    is_published: true,
    created_at: "2026-10-29T00:00:00.000Z",
    tiers: [
      { name: "Regular", price: 200, description: "General admission" },
      { name: "VIP", price: 800, description: "Premium seating" },
    ],
  },
  {
    id: "nyayo-league-clash",
    title: "FKF Premier League Clash",
    venue: "Nyayo National Stadium, Nairobi",
    event_date: "6 March 2027 · 3PM",
    tag: "League",
    description: "Two title-chasing sides meet at Nyayo. Hard tackles, quick football and a crowd that never stops singing.",
    poster_url: actionGreenYellow,
    is_published: true,
    created_at: "2026-10-28T00:00:00.000Z",
    tiers: [
      { name: "Regular", price: 200, description: "General admission" },
      { name: "VIP", price: 800, description: "Premium seating" },
    ],
  },
];

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
