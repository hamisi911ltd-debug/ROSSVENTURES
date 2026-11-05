import type { EventRow, TicketTier } from "./types";
import talantaStadium from "@/assets/talanta-stadium.jpg";

// ─── Ticket prices ───────────────────────────────────────────────────────────
// A match with NO tiers cannot be bought (the server refuses the booking and the site shows
// "tickets on sale soon").
export const LEAGUE_TICKET_TIERS: TicketTier[] = [{ name: "Regular", price: 2500, description: "General admission" }];
export const OPENING_TICKET_TIERS: TicketTier[] = [{ name: "General admission", price: 2000, was: 2500, description: "Opening match entry - 24-hour special offer" }];

import openingPoster from "@/assets/bayern-ajax-poster.png";
export const OPENING_POSTER = openingPoster;

// ─── Talanta Stadium opening match: Bayern Munich vs Ajax, 5 January 2027 ────
// (announced by President Ruto and both clubs; kick-off time not yet published)
export const OPENING_MATCH_ID = "talanta-opening-bayern-v-ajax";
export const OPENING_MATCH: EventRow = {
  id: OPENING_MATCH_ID,
  title: "Bayern Munich vs Ajax - Talanta Stadium Opening Match",
  description:
    "The opening match of Kenya's new 60,000-seat stadium at Talanta Sports City, officially named the Raila Odinga International Stadium: FC Bayern Munich take on AFC Ajax in a historic friendly ahead of AFCON 2027.",
  venue: "Raila Odinga International Stadium (Talanta Stadium), Nairobi",
  event_date: "Tue 5 Jan 2027 · TBA",
  tag: "Opening match",
  is_published: true,
  created_at: "2027-01-05T00:00:00+03:00",
  poster_url: talantaStadium,
  tiers: OPENING_TICKET_TIERS,
  home_team: "Bayern Munich",
  away_team: "Ajax",
  matchday: 0,
  kickoff: "2027-01-05T00:00:00+03:00",
};

// ─── Home grounds ────────────────────────────────────────────────────────────
// Only grounds FKF has announced are listed (Round 1 venue announcements, Oct 2026). A club that is
// not listed has NO confirmed ground yet: its matches show "venue to be confirmed" and stay closed
// for sale until a ground is added here.
export const HOME_GROUNDS: Record<string, string> = {
  "Nairobi United": "Police Sacco Stadium, Nairobi",
  "Mathare United": "Police Sacco Stadium, Nairobi",
  "Posta Rangers": "Wang'uru Stadium, Kirinyaga",
  "Ulinzi Stars": "Ulinzi Sports Complex, Lang'ata, Nairobi",
  "3K": "Moi Stadium, Embu",
  "Migori Youth": "Green Stadium, Awendo",
};
export const VENUE_TBC = "Venue to be confirmed by FKF";

// ─── Clubs ───────────────────────────────────────────────────────────────────
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CLUBS = [
  "AFC Leopards", "APS Bomet", "Bandari", "Gor Mahia", "KCB", "Kakamega Homeboyz",
  "Kenya Police", "Mara Sugar", "Mathare United", "Migori Youth", "Mombasa United",
  "Murang'a SEAL", "Nairobi United", "Posta Rangers", "Shabana", "Tusker", "Ulinzi Stars", "3K",
] as const;

// ─── Fixtures: matchday | date | EAT kick-off | home | away ─────────────────
// Only matches with a confirmed kick-off time are listed; more are added as dates are confirmed.
const RAW = `
6|2026-11-06|16:00|KCB|APS Bomet
6|2026-11-07|14:00|Mombasa United|Shabana
6|2026-11-07|15:00|Mara Sugar|Migori Youth
6|2026-11-07|16:15|3K|AFC Leopards
6|2026-11-08|14:00|Bandari|Tusker
6|2026-11-08|15:00|Murang'a SEAL|Ulinzi Stars
6|2026-11-08|15:00|Mathare United|Posta Rangers
6|2026-11-08|15:00|Kakamega Homeboyz|Kenya Police
6|2026-11-08|16:15|Gor Mahia|Nairobi United
7|2026-11-14|14:00|Nairobi United|Mara Sugar
7|2026-11-14|14:00|Ulinzi Stars|Migori Youth
7|2026-11-14|15:00|APS Bomet|Bandari
7|2026-11-14|16:15|AFC Leopards|Mombasa United
7|2026-11-15|14:00|Tusker|Shabana
7|2026-11-15|15:00|Kenya Police|Posta Rangers
7|2026-11-15|15:00|Kakamega Homeboyz|KCB
7|2026-11-15|15:00|Murang'a SEAL|Mathare United
7|2026-11-15|16:15|3K|Gor Mahia
8|2026-11-20|14:00|Mathare United|Kakamega Homeboyz
8|2026-11-20|15:00|Bandari|Murang'a SEAL
8|2026-11-20|16:15|Nairobi United|Tusker
8|2026-11-21|14:00|Migori Youth|AFC Leopards
8|2026-11-21|15:00|Mombasa United|Ulinzi Stars
8|2026-11-21|15:00|Kenya Police|APS Bomet
8|2026-11-21|16:15|Posta Rangers|Gor Mahia
8|2026-11-22|13:00|KCB|3K
8|2026-11-22|14:00|Shabana|Mara Sugar
9|2026-11-24|15:00|Bandari|Mathare United
9|2026-11-25|14:00|APS Bomet|Migori Youth
9|2026-11-25|14:00|Tusker|Posta Rangers
9|2026-11-25|14:00|Kakamega Homeboyz|Shabana
9|2026-11-25|15:00|3K|Nairobi United
9|2026-11-25|16:15|Ulinzi Stars|AFC Leopards
9|2026-11-26|15:00|Mara Sugar|Kenya Police
9|2026-11-26|16:00|Murang'a SEAL|KCB
9|2026-11-26|19:00|Gor Mahia|Mombasa United
10|2026-11-29|14:00|Migori Youth|3K
10|2026-11-29|15:00|KCB|Bandari
10|2026-11-29|15:00|Shabana|Ulinzi Stars
10|2026-11-29|15:00|Posta Rangers|Nairobi United
10|2026-11-29|16:15|AFC Leopards|Tusker
10|2026-11-30|15:00|Kenya Police|Murang'a SEAL
10|2026-11-30|15:00|Mombasa United|APS Bomet
10|2026-11-30|15:00|Mara Sugar|Kakamega Homeboyz
10|2026-11-30|18:00|Mathare United|Gor Mahia
11|2026-12-05|13:00|KCB|Mara Sugar
11|2026-12-05|15:00|Kakamega Homeboyz|Migori Youth
11|2026-12-05|15:00|Nairobi United|Ulinzi Stars
11|2026-12-05|15:00|Murang'a SEAL|Shabana
11|2026-12-05|16:00|Tusker|Mombasa United
11|2026-12-06|14:00|3K|Mathare United
11|2026-12-06|15:00|Bandari|Kenya Police
11|2026-12-06|15:00|APS Bomet|Posta Rangers
11|2026-12-06|15:00|Gor Mahia|AFC Leopards
12|2026-12-11|14:00|Posta Rangers|Kakamega Homeboyz
12|2026-12-11|15:00|Ulinzi Stars|KCB
12|2026-12-11|15:00|Mombasa United|3K
12|2026-12-11|16:00|Kenya Police|Tusker
12|2026-12-12|14:00|Mara Sugar|Gor Mahia
12|2026-12-12|15:00|Mathare United|Nairobi United
12|2026-12-12|15:00|Migori Youth|Murang'a SEAL
12|2026-12-13|14:00|AFC Leopards|APS Bomet
12|2026-12-13|16:00|Shabana|Bandari
13|2026-12-15|15:00|KCB|Kenya Police
13|2026-12-16|15:00|Murang'a SEAL|Kakamega Homeboyz
13|2026-12-16|15:00|Posta Rangers|Migori Youth
13|2026-12-16|15:00|Mathare United|Mombasa United
13|2026-12-16|18:00|Nairobi United|AFC Leopards
13|2026-12-17|15:00|Bandari|Mara Sugar
13|2026-12-17|15:00|APS Bomet|Tusker
13|2026-12-17|18:00|Gor Mahia|Ulinzi Stars
14|2026-12-20|15:00|Mombasa United|Posta Rangers
14|2026-12-20|15:00|Kakamega Homeboyz|Nairobi United
14|2026-12-20|15:00|AFC Leopards|Mathare United
14|2026-12-21|13:00|Mara Sugar|Murang'a SEAL
14|2026-12-21|15:00|Tusker|3K
14|2026-12-21|15:00|Ulinzi Stars|APS Bomet
14|2026-12-21|15:00|Shabana|KCB
14|2026-12-21|15:00|Kenya Police|Gor Mahia
14|2026-12-21|16:00|Migori Youth|Bandari
`;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatKickoff(isoDate: string, time: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd} ${d} ${MONTHS[m - 1]} ${y} · ${time}`;
}

export const LEAGUE_MATCHES: EventRow[] = RAW.trim()
  .split("\n")
  .map((line) => {
    const [md, date, time, home, away] = line.split("|");
    return {
      id: `kpl-md${md}-${slugify(home)}-v-${slugify(away)}`,
      title: `${home} vs ${away}`,
      description: `FKF Premier League, Matchday ${md} of 34. ${home} host ${away}.`,
      venue: HOME_GROUNDS[home] ?? VENUE_TBC,
      event_date: formatKickoff(date, time),
      tag: `Matchday ${md}`,
      is_published: true,
      created_at: `${date}T${time}:00+03:00`,
      poster_url: talantaStadium,
      tiers: HOME_GROUNDS[home] ? LEAGUE_TICKET_TIERS : [],
      home_team: home,
      away_team: away,
      matchday: Number(md),
      kickoff: `${date}T${time}:00+03:00`,
    } satisfies EventRow;
  });

export const MATCHDAYS: { matchday: number; matches: EventRow[] }[] = Object.values(
  LEAGUE_MATCHES.reduce<Record<number, { matchday: number; matches: EventRow[] }>>((acc, m) => {
    const md = m.matchday as number;
    (acc[md] ??= { matchday: md, matches: [] }).matches.push(m);
    return acc;
  }, {}),
).sort((a, b) => a.matchday - b.matchday);
